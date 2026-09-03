export const STORAGE_KEY = 'qlab_cues';
let fallbackId = 0;

function id(prefix) {
  try { return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${++fallbackId}`; }
  catch { return `${prefix}-${++fallbackId}`; }
}

export function normalizeCommand(value) {
  const command = String(value ?? '').trim().replace(/\/+$/, '');
  return command ? `${command}/` : '';
}

export function createCue(overrides = {}) {
  return {
    id: overrides.id || id('cue'), number: String(overrides.number ?? '1'), hotkey: String(overrides.hotkey ?? '').slice(0, 1),
    command: String(overrides.command ?? ''), ltcTrigger: String(overrides.ltcTrigger ?? ''), cron: String(overrides.cron ?? ''),
    waitMs: Math.max(0, Number(overrides.waitMs) || 1000), status: 'IDLE', progress: 0
  };
}

export function createGroup(overrides = {}) {
  const cues = Array.isArray(overrides.cues) ? overrides.cues : [createCue()];
  return {
    id: overrides.id || id('group'), name: String(overrides.name ?? 'Cue Group'), expanded: overrides.expanded !== false,
    loopEnabled: Boolean(overrides.loopEnabled), clockEnabled: Boolean(overrides.clockEnabled),
    timecodeEnabled: Boolean(overrides.timecodeEnabled), hotkeyEnabled: Boolean(overrides.hotkeyEnabled),
    cues: cues.map(createCue)
  };
}

export function createDefaultGroups() {
  return [createGroup({ name: 'Main Sequence', cues: [createCue({ number: '1', command: 'welcome/', waitMs: 500 })] })];
}

export function hydrateGroups(value) {
  if (!Array.isArray(value)) throw new Error('Imported MiniQ cue lists must be a JSON array.');
  return value.map((group) => {
    if (!group || typeof group !== 'object' || !Array.isArray(group.cues)) throw new Error('Each cue group must contain a cues array.');
    return createGroup(group);
  });
}

export function toPersistedGroups(groups) {
  return groups.map(({ cues, ...group }) => ({ ...group, cues: cues.map(({ status, progress, ...cue }) => cue) }));
}

export function readStoredGroups(storage) {
  try { const raw = storage?.getItem(STORAGE_KEY); return raw ? hydrateGroups(JSON.parse(raw)) : null; }
  catch { return null; }
}

export function writeStoredGroups(storage, groups) {
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(toPersistedGroups(groups))); return true; }
  catch { return false; }
}
