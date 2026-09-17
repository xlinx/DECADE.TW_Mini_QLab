export const STORAGE_KEY = 'qlab_cues';
export const TX_STORE_KEY = 'TX_JSON_CMD';
let fallbackId = 0;

function id(prefix) {
  try { return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${++fallbackId}`; }
  catch { return `${prefix}-${++fallbackId}`; }
}

export function normalizeCommand(value) {
  const command = String(value ?? '').trim().replace(/\/+$/, '');
  return command ? `${command}/` : '';
}

export function normalizeBackgroundColor(value) {
  const color = String(value ?? '').trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : '';
}

export function createCue(overrides = {}) {
  const type = ['command', 'trigger', 'audio'].includes(overrides.type) ? overrides.type : 'command';
  const audioAction = ['play', 'pause', 'stop'].includes(overrides.audioAction) ? overrides.audioAction : 'play';
  return {
    id: overrides.id || id('cue'), name: String(overrides.name ?? overrides.number ?? 'Cue 1'), type, audioAction,
    targetGroupName: String(overrides.targetGroupName ?? ''), targetCueName: String(overrides.targetCueName ?? ''), targetAction: ['start', 'pause', 'stop'].includes(overrides.targetAction) ? overrides.targetAction : 'start', hotkey: String(overrides.hotkey ?? '').slice(0, 1),
    command: String(overrides.command ?? ''), ltcTrigger: String(overrides.ltcTrigger ?? ''), cron: String(overrides.cron ?? ''),
    beforeWaitMs: Math.max(0, Number(overrides.beforeWaitMs) || 0), afterWaitMs: Math.max(0, Number(overrides.afterWaitMs) || 0),
    status: 'IDLE', beforeProgress: 0, afterProgress: 0, startedAt: null
  };
}

export function createGroup(overrides = {}) {
  const cues = Array.isArray(overrides.cues) ? overrides.cues : [createCue()];
  return {
    id: overrides.id || id('group'), name: String(overrides.name ?? 'Cue Group'), expanded: overrides.expanded !== false,
    loopEnabled: Boolean(overrides.loopEnabled), clockEnabled: Boolean(overrides.clockEnabled),
    timecodeEnabled: Boolean(overrides.timecodeEnabled), hotkeyEnabled: Boolean(overrides.hotkeyEnabled),
    backgroundColor: normalizeBackgroundColor(overrides.backgroundColor),
    cues: cues.map((cue, index) => createCue({...cue, name: cue?.name ?? cue?.number ?? `Cue ${index + 1}`}))
  };
}

export function createDefaultGroups() {
  return [createGroup({ name: 'Main Sequence', cues: [createCue({ name: 'Welcome', command: '/cue/welcome/', afterWaitMs: 500 })] })];
}

export function normalizedName(value) { return String(value ?? '').trim().toLocaleLowerCase(); }

export function validateUniqueNames(groups) {
  const groupNames = new Set();
  for (const group of groups) {
    const groupName = normalizedName(group.name);
    if (!groupName) throw new Error('Every cue group must have a name.');
    if (groupNames.has(groupName)) throw new Error(`Duplicate cue group name: ${group.name}.`);
    groupNames.add(groupName);
    const cueNames = new Set();
    for (const cue of group.cues) {
      const cueName = normalizedName(cue.name);
      if (!cueName) throw new Error(`Every cue in ${group.name} must have a name.`);
      if (cueNames.has(cueName)) throw new Error(`Duplicate cue name in ${group.name}: ${cue.name}.`);
      cueNames.add(cueName);
    }
  }
  return groups;
}

export function hydrateGroups(value) {
  if (!Array.isArray(value)) throw new Error('Imported MiniQ cue lists must be a JSON array.');
  return validateUniqueNames(value.map((group) => {
    if (!group || typeof group !== 'object' || !Array.isArray(group.cues)) throw new Error('Each cue group must contain a cues array.');
    return createGroup(group);
  }));
}

export function toPersistedGroups(groups) {
  return groups.map(({ cues, localAudioFile, audioTrack, ...group }) => ({ ...group, cues: cues.map(({ number, status, beforeProgress, afterProgress, startedAt, phaseStartedAt, ...cue }) => cue) }));
}

export function readStoredGroups(storage) {
  try { const raw = storage?.getItem(STORAGE_KEY); return raw ? hydrateGroups(JSON.parse(raw)) : null; }
  catch { return null; }
}

export function writeStoredGroups(storage, groups) {
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(toPersistedGroups(groups))); return true; }
  catch { return false; }
}

export function readTxStore(storage) {
  try { const raw = storage?.getItem(TX_STORE_KEY); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

export function writeTxStore(storage, entry) {
  try { storage?.setItem(TX_STORE_KEY, JSON.stringify(entry)); return true; }
  catch { return false; }
}
