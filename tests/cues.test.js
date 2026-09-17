import { describe, expect, test } from 'vitest';
import { STORAGE_KEY, TX_STORE_KEY, createCue, createDefaultGroups, hydrateGroups, normalizeBackgroundColor, normalizeCommand, readStoredGroups, readTxStore, toPersistedGroups, writeStoredGroups, writeTxStore } from '../src/lib/cues.js';

describe('cue configuration', () => {
  test('normalizes a non-empty command to one trailing slash', () => {
    expect(normalizeCommand(' lights/// ')).toBe('lights/');
    expect(normalizeCommand('')).toBe('');
  });

  test('hydrates imported configuration with safe runtime state', () => {
    const groups = hydrateGroups([{ name: 'Act 1', cues: [{ command: 'go/', afterWaitMs: -3 }] }]);
    expect(groups[0].cues[0]).toMatchObject({ status: 'IDLE', beforeProgress: 0, afterProgress: 0, command: 'go/', afterWaitMs: 0 });
    expect(groups[0].id).toBeTruthy();
    expect(groups[0].cues[0].name).toBe('Cue 1');
  });

  test('accepts and persists only six-digit hexadecimal group background colors', () => {
    const groups = hydrateGroups([{ name: 'Act 1', backgroundColor: '#A1b2C3', cues: [] }, {name: 'Act 2', backgroundColor: 'red', cues: []}]);
    expect(groups[0].backgroundColor).toBe('#a1b2c3');
    expect(groups[1].backgroundColor).toBe('');
    expect(normalizeBackgroundColor('#123456')).toBe('#123456');
    expect(normalizeBackgroundColor('#123')).toBe('');
    expect(toPersistedGroups(groups)[0].backgroundColor).toBe('#a1b2c3');
  });

  test('migrates legacy numbers and rejects duplicate names case-insensitively', () => {
    const migrated = hydrateGroups([{name: 'Act', cues: [{number: '1'}, {number: '2'}]}]);
    expect(migrated[0].cues.map(cue => cue.name)).toEqual(['1', '2']);
    expect(() => hydrateGroups([{name: 'Act', cues: [{name: 'Intro'}, {name: 'intro'}]}])).toThrow(/Duplicate cue name/);
    expect(() => hydrateGroups([{name: 'Act', cues: []}, {name: 'act', cues: []}])).toThrow(/Duplicate cue group name/);
  });

  test('rejects imports that are not arrays', () => {
    expect(() => hydrateGroups({ cues: [] })).toThrow(/JSON array/);
  });

  test('strips runtime state from persisted groups', () => {
    const saved = toPersistedGroups([{ id: 'g', name: 'A', cues: [{ id: 'c', command: 'go/', status: 'LIVE', beforeProgress: 42, afterProgress: 7, startedAt: 1 }] }]);
    expect(saved[0].cues[0]).not.toHaveProperty('status');
    expect(saved[0].cues[0]).not.toHaveProperty('beforeProgress');
    expect(saved[0].cues[0]).not.toHaveProperty('afterProgress');
  });

  test('reads and writes through a browser storage boundary', () => {
    const groups = createDefaultGroups();
    expect(writeStoredGroups(localStorage, groups)).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    expect(readStoredGroups(localStorage)).toHaveLength(1);
  });

  test('before/after waits default to zero and are preserved in persisted groups', () => {
    const groups = hydrateGroups([{ name: 'Waits', cues: [{ command: 'go/', beforeWaitMs: 250, afterWaitMs: 120 }] }]);
    expect(groups[0].cues[0].beforeWaitMs).toBe(250);
    expect(groups[0].cues[0].afterWaitMs).toBe(120);
    expect(createCue()).toMatchObject({ beforeWaitMs: 0, afterWaitMs: 0 });
    const saved = toPersistedGroups(groups);
    expect(saved[0].cues[0].beforeWaitMs).toBe(250);
    expect(saved[0].cues[0].afterWaitMs).toBe(120);
  });

  test('hydrates audio actions without serializing local track data', () => {
    const groups = hydrateGroups([{name: 'Act', localAudioFile: '/private/intro.wav', cues: [
      {name: 'Start', type: 'audio', audioAction: 'pause'},
      {name: 'Invalid', type: 'audio', audioAction: 'invalid'}
    ]}]);
    expect(groups[0].cues).toMatchObject([{type: 'audio', audioAction: 'pause'}, {type: 'audio', audioAction: 'play'}]);
    expect(toPersistedGroups(groups)[0]).not.toHaveProperty('localAudioFile');
  });

  test('writes the shared TX_JSON_CMD store with command and timestamp', () => {
    const entry = { command: 'go/', timestamp: '2026-09-03T00:00:00.000Z' };
    expect(writeTxStore(localStorage, entry)).toBe(true);
    expect(readTxStore(localStorage)).toEqual(entry);
    expect(TX_STORE_KEY).toBe('TX_JSON_CMD');
  });
});
