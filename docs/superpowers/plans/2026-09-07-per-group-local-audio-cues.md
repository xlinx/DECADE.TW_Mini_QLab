# Per-group Local Audio Cues Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Let each cue group select an in-memory local MP3/WAV track and run Play, Pause, or Stop actions through audio cues without any server delivery.

**Architecture:** Audio cue configuration stays in the existing serializable cue model. A runtime-only manager owns each group’s selected \`File\`, object URL, and \`HTMLAudioElement\`; \`MiniQLab\` intercepts audio dispatch before TX storage, WebSocket, and consumer event delivery.

**Tech Stack:** React 19, browser File/URL/HTMLAudioElement APIs, Vite, Vitest, Testing Library.

**Spec:** \`docs/superpowers/specs/2026-09-07-per-group-local-audio-cues-design.md\`

## Global Constraints

- One selected MP3 or WAV file belongs to each cue group and stays local.
- Persist/export only \`type: 'audio'\` and \`audioAction\`; never files, object URLs, or filesystem paths.
- Audio cues must not write \`TX_JSON_CMD\`, send WebSocket frames, or dispatch a command to the consumer \`onEvent\` callback.
- Play resumes, Pause retains position, Stop pauses and resets position to zero.
- Missing tracks and rejected playback create a local cue-log warning.

---

## File structure

- Create \`src/lib/localAudioTracks.js\`: runtime-only, dependency-injectable manager for players and object URLs.
- Create \`tests/localAudioTracks.test.js\`: manager action, error, replacement, and cleanup tests.
- Modify \`src/lib/cues.js\` and \`tests/cues.test.js\`: audio cue model and persistence boundaries.
- Modify \`src/PAGEXQ.jsx\`: owns manager, local routing, track lifecycle.
- Modify \`src/components/CueGroup.jsx\`, \`CueTable.jsx\`, \`MobileCueCards.jsx\`, and \`TimelineEditor.jsx\`: file picker and Audio editors.
- Modify \`tests/PAGEXQ.test.jsx\` and \`README.md\`: UI/routing regressions and user-facing limitations.

### Task 1: Create the runtime-only local audio-track manager

**Files:**
- Create: \`src/lib/localAudioTracks.js\`
- Test: \`tests/localAudioTracks.test.js\`

**Interfaces:**
- Produces \`createLocalAudioTracks({createAudio, createObjectURL, revokeObjectURL}?)\`.
- Returned methods are \`set(groupId, file)\`, \`getName(groupId)\`, \`run(groupId, action)\`, \`clear(groupId)\`, and \`dispose()\`.
- \`run()\` resolves \`{ok: true}\` or \`{ok: false, message}\`; missing media and rejected play never throw.

- [ ] **Step 1: Write the failing test**

\`\`\`js
test('plays, pauses, and stops a group-local track', async () => {
  const audio = {play: vi.fn(() => Promise.resolve()), pause: vi.fn(), currentTime: 12, src: ''};
  const tracks = createLocalAudioTracks({createAudio: vi.fn(() => audio), createObjectURL: vi.fn(() => 'blob:one')});
  tracks.set('group-1', new File(['audio'], 'intro.mp3', {type: 'audio/mpeg'}));

  await expect(tracks.run('group-1', 'play')).resolves.toEqual({ok: true});
  expect(tracks.run('group-1', 'pause')).toEqual({ok: true});
  expect(tracks.run('group-1', 'stop')).toEqual({ok: true});
  expect(audio.currentTime).toBe(0);
});
\`\`\`

Add tests that \`run('missing', 'play')\` returns a warning, rejected \`audio.play()\` returns a warning, replacing a track pauses/releases the old player, and \`dispose()\` releases all object URLs.

- [ ] **Step 2: Run test to verify it fails**

Run: \`npm test -- tests/localAudioTracks.test.js\`

Expected: FAIL because the manager module does not exist.

- [ ] **Step 3: Write minimal implementation**

\`\`\`js
export function createLocalAudioTracks({
  createAudio = source => new Audio(source),
  createObjectURL = file => URL.createObjectURL(file),
  revokeObjectURL = source => URL.revokeObjectURL(source)
} = {}) {
  const tracks = new Map();
  return {set(groupId, file) {/* replace old then make player */}, getName(groupId) {/* name or '' */},
    async run(groupId, action) {/* Play/Pause/Stop -> result */}, clear(groupId) {/* pause/revoke/delete */},
    dispose() {/* clear every entry */}};
}
\`\`\`

For Stop, call \`pause()\` and then set \`currentTime = 0\`. Catch the promise returned by \`play()\`; return an error result for unsupported action.

- [ ] **Step 4: Run test to verify it passes**

Run: \`npm test -- tests/localAudioTracks.test.js\`

Expected: PASS.

- [ ] **Step 5: Commit**

\`\`\`bash
git add src/lib/localAudioTracks.js tests/localAudioTracks.test.js
git commit -m "feat: add local audio track manager"
\`\`\`

### Task 2: Extend the persisted cue model with audio actions

**Files:**
- Modify: \`src/lib/cues.js:17-25,65-67\`
- Modify: \`tests/cues.test.js\`

**Interfaces:**
- \`createCue(overrides)\` produces exactly \`command\`, \`trigger\`, or \`audio\` types.
- Audio cues have \`audioAction: 'play' | 'pause' | 'stop'\`, defaulting to \`play\`.
- \`toPersistedGroups(groups)\` retains audio cue action but strips any runtime local-audio field.

- [ ] **Step 1: Write the failing test**

\`\`\`js
test('hydrates audio actions without serializing local track data', () => {
  const groups = hydrateGroups([{name: 'Act', localAudioFile: '/private/intro.wav', cues: [
    {name: 'Start', type: 'audio', audioAction: 'play'},
    {name: 'Invalid', type: 'audio', audioAction: 'invalid'}
  ]}]);
  expect(groups[0].cues).toMatchObject([{type: 'audio', audioAction: 'play'}, {type: 'audio', audioAction: 'play'}]);
  expect(toPersistedGroups(groups)[0]).not.toHaveProperty('localAudioFile');
});
\`\`\`

- [ ] **Step 2: Run test to verify it fails**

Run: \`npm test -- tests/cues.test.js\`

Expected: FAIL because \`createCue\` currently changes Audio to Command.

- [ ] **Step 3: Write minimal implementation**

\`\`\`js
const type = ['command', 'trigger', 'audio'].includes(overrides.type) ? overrides.type : 'command';
const audioAction = ['play', 'pause', 'stop'].includes(overrides.audioAction) ? overrides.audioAction : 'play';
\`\`\`

Use both values in \`createCue\`. In \`toPersistedGroups\`, destructure runtime-only audio attachment fields from the group before serializing.

- [ ] **Step 4: Run test to verify it passes**

Run: \`npm test -- tests/cues.test.js\`

Expected: PASS, including current legacy cue tests.

- [ ] **Step 5: Commit**

\`\`\`bash
git add src/lib/cues.js tests/cues.test.js
git commit -m "feat: support persisted audio cue actions"
\`\`\`

### Task 3: Add the file picker and audio action editors

**Files:**
- Modify: \`src/components/CueGroup.jsx:17-83\`
- Modify: \`src/components/CueTable.jsx:99-130\`
- Modify: \`src/components/MobileCueCards.jsx:11-28\`
- Modify: \`src/components/TimelineEditor.jsx:49-65,120-163,300-316\`
- Test: \`tests/PAGEXQ.test.jsx\`

**Interfaces:**
- \`CueGroup\` consumes \`audioTrackName\`, \`onAudioTrackSelect(file)\`, and \`onAudioTrackClear()\`.
- Switching a cue to Audio writes \`{type: 'audio', audioAction: 'play'}\`; action selects write \`{audioAction}\`.
- File input accepts \`audio/mpeg,audio/wav,.mp3,.wav\`, resets after choosing, and exposes accessible name \`Audio track for <group>\`.

- [ ] **Step 1: Write failing editor tests**

\`\`\`jsx
test('offers audio cues and chooses a local MP3 per group', async () => {
  const user = userEvent.setup();
  render(<MiniQLab initialGroups={[{name: 'Act', cues: [{name: 'Intro', command: 'lights/'}]}]} />);
  await user.selectOptions(screen.getByLabelText('Type for cue 1'), 'audio');
  expect(screen.getByLabelText('Audio action for cue 1')).toHaveValue('play');
  await user.selectOptions(screen.getByLabelText('Audio action for cue 1'), 'pause');
  await user.upload(screen.getByLabelText('Audio track for Act'), new File(['sound'], 'intro.mp3', {type: 'audio/mpeg'}));
  expect(screen.getByText('intro.mp3')).toBeInTheDocument();
});
\`\`\`

Also test the same Type/Audio action control with mobile width and in the timeline edit modal.

- [ ] **Step 2: Run test to verify it fails**

Run: \`npm test -- tests/PAGEXQ.test.jsx\`

Expected: FAIL because no Audio option, action select, or per-group picker exists.

- [ ] **Step 3: Write minimal implementation**

\`\`\`jsx
<option value="audio">Audio</option>
{cue.type === 'audio' ? <select aria-label={\`Audio action for cue \${index + 1}\`}
  value={cue.audioAction} onChange={event => onChange(cue.id, {audioAction: event.target.value})}>
  <option value="play">Play</option><option value="pause">Pause</option><option value="stop">Stop</option>
</select> : /* existing Command/Trigger controls */}
\`\`\`

Add the option and the conditional action control to table, mobile cards, and timeline. Add a compact per-group picker in \`CueGroup\` showing the selected filename or **No local track selected**, and a clear control when a track exists.

- [ ] **Step 4: Run test to verify it passes**

Run: \`npm test -- tests/PAGEXQ.test.jsx\`

Expected: PASS with desktop, mobile, and timeline coverage.

- [ ] **Step 5: Commit**

\`\`\`bash
git add src/components/CueGroup.jsx src/components/CueTable.jsx src/components/MobileCueCards.jsx src/components/TimelineEditor.jsx tests/PAGEXQ.test.jsx
git commit -m "feat: add per-group audio cue controls"
\`\`\`

### Task 4: Route audio dispatch locally and clean up player lifecycle

**Files:**
- Modify: \`src/PAGEXQ.jsx:1-158,275-425\`
- Test: \`tests/PAGEXQ.test.jsx\`

**Interfaces:**
- Consumes \`createLocalAudioTracks()\` and the Task 2 audio cue fields.
- Supplies each group’s picker callbacks and manager-held track name to \`CueGroup\`.
- Audio \`cue:dispatched\` events return before normal TX/WebSocket/consumer event routing.

- [ ] **Step 1: Write failing dispatch and cleanup tests**

\`\`\`jsx
test('runs audio cues locally without TX, WebSocket, or consumer dispatch', async () => {
  const onEvent = vi.fn();
  render(<MiniQLab initialGroups={[{name: 'Act', cues: [{name: 'Play', type: 'audio', audioAction: 'play'}]}]} onEvent={onEvent} />);
  const user = userEvent.setup();
  await user.upload(screen.getByLabelText('Audio track for Act'), new File(['sound'], 'intro.wav', {type: 'audio/wav'}));
  await user.click(screen.getByRole('button', {name: 'GO Act'}));
  await waitFor(() => expect(mockAudio.play).toHaveBeenCalledOnce());
  expect(onEvent).not.toHaveBeenCalledWith(expect.objectContaining({type: 'cue:dispatched'}));
  expect(localStorage.getItem(TX_STORE_KEY)).toBeNull();
});
\`\`\`

Mock \`Audio\`, \`URL.createObjectURL\`, and \`URL.revokeObjectURL\`. Add cases for Pause, Stop, no selected track warning, rejected Play warning, replacement, group removal, reset, and unmount cleanup.

- [ ] **Step 2: Run test to verify it fails**

Run: \`npm test -- tests/PAGEXQ.test.jsx\`

Expected: FAIL because audio dispatch is still treated as a normal command.

- [ ] **Step 3: Write minimal implementation**

\`\`\`jsx
const audioTracksRef = useRef(null);
if (!audioTracksRef.current) audioTracksRef.current = createLocalAudioTracks();

if (event.type === 'cue:dispatched' && event.cue?.type === 'audio') {
  void audioTracksRef.current.run(event.group.id, event.cue.audioAction).then(result => {
    if (!result.ok) addCueLog('warning', event.group.name, result.message);
  });
  return;
}
\`\`\`

Place this at the beginning of \`emit\`, before TX state, WebSocket, normal cue-log, and \`onEventRef.current\`. Use a shared local log helper. Clear removed group IDs during group updates; dispose tracks before Reset and in unmount cleanup. Do not put Files, URLs, or media elements into React state or persisted groups.

- [ ] **Step 4: Run test to verify it passes**

Run: \`npm test -- tests/PAGEXQ.test.jsx\`

Expected: PASS with Play/Pause/Stop, no-network, warning, and lifecycle coverage.

- [ ] **Step 5: Commit**

\`\`\`bash
git add src/PAGEXQ.jsx tests/PAGEXQ.test.jsx
git commit -m "feat: run audio cues locally"
\`\`\`

### Task 5: Document and verify

**Files:**
- Modify: \`README.md\`

**Interfaces:**
- Documents that each group can select one local MP3/WAV file; tracks are never uploaded and must be reselected after reload/import.

- [ ] **Step 1: Add the concise README entry**

\`\`\`md
- Local audio cues: each group can use a selected MP3/WAV track with Play, Pause, and Stop cues. Tracks never leave the device and must be selected again after reload or import.
\`\`\`

- [ ] **Step 2: Run focused regression tests**

Run: \`npm test -- tests/localAudioTracks.test.js tests/cues.test.js tests/PAGEXQ.test.jsx\`

Expected: PASS.

- [ ] **Step 3: Run full verification**

Run: \`npm test && npm run build\`

Expected: both commands exit 0 and Vite emits the production bundle.

- [ ] **Step 4: Inspect and commit**

Run: \`git diff --check && git status --short\`

Expected: no whitespace errors; only planned changes.

\`\`\`bash
git add README.md
git commit -m "docs: describe local audio cues"
\`\`\`

## Plan self-review

- Spec coverage: Tasks 1/4 cover runtime-only media, every action, errors, and cleanup. Task 2 preserves only audio-cue configuration. Task 3 covers all editors and the file picker. Task 4 prevents all network and consumer command delivery. Task 5 documents behavior and verifies the suite/build.
- Placeholder scan: every task has exact files, interface contracts, test-first steps, commands, expected outcomes, and an implementation code shape.
- Type consistency: every task uses \`type: 'audio'\`, \`audioAction\`, \`createLocalAudioTracks\`, and \`set/getName/run/clear/dispose\`.

