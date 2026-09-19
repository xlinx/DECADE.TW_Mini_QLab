# Cue-local Audio Waveforms and Type Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Move local MP3/WAV tracks from cue groups to individual audio cues, render their complete amplitude waveforms on the timeline, and distinguish every cue type with an inline SVG icon.

**Architecture:** Replace the group-keyed runtime player map with a cue-keyed media manager. It owns each selected file’s object URL, audio element, decoded duration, and down-sampled peaks; React stores only a version number for rendering. Timeline receives the runtime media snapshot and uses duration/peaks to display waveform clips, while a shared icon component is used across table, cards, and timeline.

**Tech Stack:** React 19, Web Audio API, HTMLAudioElement, browser File/URL APIs, Vite, Vitest, Testing Library.

**Spec:** \`docs/superpowers/specs/2026-09-07-per-group-local-audio-cues-design.md\`

## Global Constraints

- Tracks are per audio cue, runtime-only, and never uploaded or persisted.
- Play/Pause/Stop affects only the dispatched cue’s player.
- No audio cue writes TX state, sends WebSocket frames, or emits a consumer command-dispatch event.
- Waveforms use decoded actual duration and full-file amplitude peaks.
- Command, Trigger, and Audio have compact accessible inline SVG icons in every supported presentation.

---

## File structure

- Create \`src/lib/cueTypeIcon.jsx\`: shared accessible Command/Trigger/Audio SVG mapping.
- Modify \`src/lib/localAudioTracks.js\`: cue-keyed ownership and Web Audio waveform decoding.
- Modify \`tests/localAudioTracks.test.js\`: per-cue isolation, decoded duration/peaks, clear/dispose.
- Modify \`src/PAGEXQ.jsx\`: remove group audio state, pass cue media controls/snapshots, route dispatch by cue ID, clean up removed cues.
- Modify \`src/components/CueGroup.jsx\`: remove group audio picker.
- Modify \`src/components/CueTable.jsx\`, \`MobileCueCards.jsx\`, \`TimelineEditor.jsx\`: cue-local file controls and shared type icons.
- Modify \`tests/PAGEXQ.test.jsx\`, \`tests/timeline.test.js\`: local playback, UI, icon, waveform and lifecycle regressions.
- Modify \`README.md\`: describe cue-local tracks and waveform behavior.

### Task 1: Replace group-keyed media with cue-keyed decoded media

**Files:**
- Modify: \`src/lib/localAudioTracks.js\`
- Modify: \`tests/localAudioTracks.test.js\`

**Interfaces:**
- \`createLocalAudioTracks({createAudio, createObjectURL, revokeObjectURL, decodeAudioData}?)\` returns \`set(cueId, file)\`, \`get(cueId)\`, \`run(cueId, action)\`, \`clear(cueId)\`, and \`dispose()\`.
- \`get(cueId)\` returns \`{name, durationMs, peaks}\` or \`null\`; it never exposes a File, URL, or media element.
- \`peaks\` is a fixed-size numeric amplitude array derived from all decoded channels.

- [ ] **Step 1: Write failing manager tests**

\`\`\`js
test('keeps selected media and actions isolated per cue', async () => {
  const tracks = createLocalAudioTracks({createAudio, createObjectURL, decodeAudioData});
  await tracks.set('cue-a', new File(['a'], 'a.wav'));
  await tracks.set('cue-b', new File(['b'], 'b.wav'));
  await tracks.run('cue-a', 'play');
  expect(audioA.play).toHaveBeenCalledOnce();
  expect(audioB.play).not.toHaveBeenCalled();
  expect(tracks.get('cue-a')).toMatchObject({name: 'a.wav', durationMs: 2500, peaks: [0, 0.8, 0.2]});
});
\`\`\`

Use a deterministic decoded-buffer fake with \`duration\`, \`numberOfChannels\`, and \`getChannelData()\`. Add tests for clear/replacement/dispose revoking the right object URLs and a decoding failure that produces empty peaks/duration without losing play capability.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: \`npm test -- tests/localAudioTracks.test.js\`

Expected: FAIL because the current manager is group-keyed and exposes no decoded waveform data.

- [ ] **Step 3: Implement the smallest cue-keyed media manager**

\`\`\`js
async set(cueId, file) {
  clear(cueId);
  const url = createObjectURL(file);
  const audio = createAudio(url);
  const {durationMs, peaks} = await decodeAudioData(file).catch(() => ({durationMs: 0, peaks: []}));
  tracks.set(cueId, {name: file.name, url, audio, durationMs, peaks});
}
get(cueId) {
  const track = tracks.get(cueId);
  return track && {name: track.name, durationMs: track.durationMs, peaks: track.peaks};
}
\`\`\`

Implement decoding with \`await file.arrayBuffer()\`, \`new AudioContext().decodeAudioData(buffer)\`, and a pure down-sampling helper that takes the maximum absolute sample value for each visual bucket. Close the temporary audio context after decode. Keep \`run\`, errors, and cleanup behavior from the existing manager.

- [ ] **Step 4: Run focused manager tests to verify they pass**

Run: \`npm test -- tests/localAudioTracks.test.js\`

Expected: PASS, including audio action isolation, peak extraction, decode failure, replacement, and disposal.

### Task 2: Add a shared cue-type icon component

**Files:**
- Create: \`src/lib/cueTypeIcon.jsx\`
- Test: \`tests/PAGEXQ.test.jsx\`

**Interfaces:**
- \`CueTypeIcon({type, label = true})\` renders an inline SVG with \`aria-label\` of Command cue, Trigger cue, or Audio cue.
- Icons are decorative only when a caller passes \`label={false}\`; then they use \`aria-hidden="true"\`.

- [ ] **Step 1: Write the failing icon behavior test**

\`\`\`jsx
test('shows distinct accessible type icons', () => {
  render(<MiniQLab initialGroups={[{name: 'Act', cues: [
    {name: 'Command', type: 'command'}, {name: 'Trigger', type: 'trigger'}, {name: 'Audio', type: 'audio'}
  ]}]} />);
  expect(screen.getByLabelText('Command cue')).toBeInTheDocument();
  expect(screen.getByLabelText('Trigger cue')).toBeInTheDocument();
  expect(screen.getByLabelText('Audio cue')).toBeInTheDocument();
});
\`\`\`

- [ ] **Step 2: Run the test to verify it fails**

Run: \`npm test -- tests/PAGEXQ.test.jsx\`

Expected: FAIL because no type icons are rendered.

- [ ] **Step 3: Implement inline SVG type icons and integrate them**

\`\`\`jsx
export function CueTypeIcon({type, label = true}) {
  const name = type === 'audio' ? 'Audio' : type === 'trigger' ? 'Trigger' : 'Command';
  return <svg aria-label={label ? \`\${name} cue\` : undefined} aria-hidden={label ? undefined : true} /* path selected by type */ />;
}
\`\`\`

Use terminal prompt glyph, branching arrow, and waveform/music paths. Render this component beside cue names in table/cards and use the decorative form inside the denser timeline clip.

- [ ] **Step 4: Run the test to verify it passes**

Run: \`npm test -- tests/PAGEXQ.test.jsx\`

Expected: PASS with three distinct accessible icons.

### Task 3: Move file selection from groups to audio cues

**Files:**
- Modify: \`src/PAGEXQ.jsx\`
- Modify: \`src/components/CueGroup.jsx\`
- Modify: \`src/components/CueTable.jsx\`
- Modify: \`src/components/MobileCueCards.jsx\`
- Modify: \`src/components/TimelineEditor.jsx\`
- Test: \`tests/PAGEXQ.test.jsx\`

**Interfaces:**
- Every cue editor receives \`audioMedia\`, \`onAudioFileSelect(cueId, file)\`, and \`onAudioClear(cueId)\`.
- Only \`type === 'audio'\` renders the MP3/WAV picker, filename/no-track state, and clear control.
- \`PAGEXQ\` increments a runtime media version after set/clear so all views receive fresh snapshots.

- [ ] **Step 1: Write the failing cue-level UI test**

\`\`\`jsx
test('selects separate local tracks for separate audio cues', async () => {
  render(<MiniQLab initialGroups={[{name: 'Act', cues: [
    {name: 'One', type: 'audio'}, {name: 'Two', type: 'audio'}
  ]}]} />);
  await user.upload(screen.getByLabelText('Audio track for cue 1'), new File(['one'], 'one.mp3'));
  await user.upload(screen.getByLabelText('Audio track for cue 2'), new File(['two'], 'two.wav'));
  expect(screen.getByText('one.mp3')).toBeInTheDocument();
  expect(screen.getByText('two.wav')).toBeInTheDocument();
  expect(screen.queryByLabelText('Audio track for Act')).not.toBeInTheDocument();
});
\`\`\`

Add a mobile-card and timeline-editor case. Add a clear-file case that removes only the chosen cue’s filename and waveform.

- [ ] **Step 2: Run the component test to verify it fails**

Run: \`npm test -- tests/PAGEXQ.test.jsx\`

Expected: FAIL because the picker is still owned by the group.

- [ ] **Step 3: Implement cue-level picker and lifecycle routing**

Remove \`audioTrackName\`, \`onAudioTrackSelect\`, and \`onAudioTrackClear\` from \`CueGroup\`. Pass a cue-media snapshot and callbacks through table/cards/editor. Use file input accept value \`audio/mpeg,audio/wav,.mp3,.wav\`; reset its value after selection. In \`PAGEXQ\`, use \`event.cue.id\` for audio dispatch and clear the manager entry before cue deletion, group removal, reset/import, and unmount.

- [ ] **Step 4: Run component tests to verify they pass**

Run: \`npm test -- tests/PAGEXQ.test.jsx\`

Expected: PASS with isolated cue selections, file clearing, and existing command/trigger editing tests.

### Task 4: Render complete audio waveforms at actual duration on the timeline

**Files:**
- Modify: \`src/components/TimelineEditor.jsx\`
- Modify: \`src/lib/timeline.js\` only if duration/layout needs a pure helper
- Modify: \`tests/timeline.test.js\`
- Modify: \`tests/PAGEXQ.test.jsx\`

**Interfaces:**
- \`TimelineEditor\` receives \`audioMediaByCueId\`.
- An audio timeline clip with media renders \`data-testid="audio-waveform-<cueId>"\`, a visual bar per peak, and a width based on \`durationMs\` at current zoom.
- Clips without media retain the normal cue layout and show no waveform.

- [ ] **Step 1: Write the failing timeline test**

\`\`\`js
test('sizes an audio waveform from decoded duration and renders all peaks', () => {
  render(<TimelineEditor groups={groups} audioMediaByCueId={{c1: {durationMs: 2500, peaks: [0.1, 0.8, 0.2]}}} />);
  const waveform = screen.getByTestId('audio-waveform-c1');
  expect(waveform.children).toHaveLength(3);
  expect(waveform.style.width).toBe('200px');
});
\`\`\`

Use the timeline’s actual pixels-per-second default for the literal expected width. Add a test confirming non-audio clips have no waveform.

- [ ] **Step 2: Run the timeline tests to verify they fail**

Run: \`npm test -- tests/timeline.test.js\`

Expected: FAIL because TimelineEditor does not consume audio media.

- [ ] **Step 3: Implement waveform clip rendering**

Use a small \`AudioWaveform\` component in \`TimelineEditor\` that maps normalized peaks to percentage-height bars. Layout an audio cue from its timeline start through \`start + durationMs\`, extending timeline duration when necessary. Preserve pointer editing and cue selection behavior by keeping the waveform inside the existing clip rather than adding a separate interactive layer.

- [ ] **Step 4: Run timeline tests to verify they pass**

Run: \`npm test -- tests/timeline.test.js tests/PAGEXQ.test.jsx\`

Expected: PASS with waveform duration, full-peak rendering, type icon, and non-audio regression coverage.

### Task 5: Verify, document, and inspect

**Files:**
- Modify: \`README.md\`

- [ ] **Step 1: Update README**

Replace the group-track wording with: “Each Audio cue can select one local MP3/WAV file. Its full waveform is shown on the timeline; tracks never leave the device and must be selected again after reload or import.”

- [ ] **Step 2: Run focused verification**

Run: \`npm test -- tests/localAudioTracks.test.js tests/PAGEXQ.test.jsx tests/timeline.test.js tests/cues.test.js tests/cueEngine.test.js\`

Expected: PASS.

- [ ] **Step 3: Run full test suite and build**

Run: \`npm test && npm run build\`

Expected: build exits 0. Record the known package-artifact test mismatch separately if it remains: the test expects \`dist/mini-qlab.js\` and \`dist/style.css\` while the configured Vite build emits hashed assets.

- [ ] **Step 4: Inspect final changes**

Run: \`git diff --check && git status --short\`

Expected: no whitespace errors. In this workspace, record that Git integration is unavailable if \`git rev-parse --show-toplevel\` fails.

## Plan self-review

- Spec coverage: Task 1 makes runtime media cue-owned and decodes full-file peaks. Task 2 supplies all type icons. Task 3 removes group media controls and handles cue cleanup. Task 4 renders full actual-duration waveforms. Task 5 documents and verifies local-only behavior.
- Placeholder scan: every task names files, interfaces, concrete test shape, test commands, and minimal implementation behavior.
- Type consistency: all tasks use cue IDs, \`audioMediaByCueId\`, \`durationMs\`, \`peaks\`, and \`CueTypeIcon\`.

