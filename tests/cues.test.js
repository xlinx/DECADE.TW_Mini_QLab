import { describe, expect, test } from 'vitest';
import { createDefaultGroups, hydrateGroups, normalizeCommand, readStoredGroups, toPersistedGroups, writeStoredGroups } from '../src/lib/cues.js';

describe('cue configuration', () => {
  test('normalizes a non-empty command to one trailing slash', () => {
    expect(normalizeCommand(' lights/// ')).toBe('lights/');
    expect(normalizeCommand('')).toBe('');
  });

  test('hydrates imported configuration with safe runtime state', () => {
    const groups = hydrateGroups([{ name: 'Act 1', cues: [{ command: 'go/', waitMs: -3 }] }]);
    expect(groups[0].cues[0]).toMatchObject({ status: 'IDLE', progress: 0, command: 'go/', waitMs: 0 });
    expect(groups[0].id).toBeTruthy();
  });

  test('rejects imports that are not arrays', () => {
    expect(() => hydrateGroups({ cues: [] })).toThrow(/JSON array/);
  });

  test('strips runtime state from persisted groups', () => {
    const saved = toPersistedGroups([{ id: 'g', name: 'A', cues: [{ id: 'c', command: 'go/', status: 'LIVE', progress: 42 }] }]);
    expect(saved[0].cues[0]).not.toHaveProperty('status');
    expect(saved[0].cues[0]).not.toHaveProperty('progress');
  });

  test('reads and writes through a browser storage boundary', () => {
    const groups = createDefaultGroups();
    expect(writeStoredGroups(localStorage, groups)).toBe(true);
    expect(readStoredGroups(localStorage)).toHaveLength(1);
  });
});
