import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { CueEngine } from '../src/lib/cueEngine.js';

describe('CueEngine', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('waits and dispatches cues in table order', async () => {
    const events = [];
    const statuses = [];
    const engine = new CueEngine({ onStatus: (...args) => statuses.push(args), onEvent: event => events.push(event), now: () => new Date('2026-09-03T00:00:00.000Z') });
    engine.start({ group: { id: 'g1', name: 'Act', loopEnabled: false, cues: [{ id: 'c1', command: 'one/', waitMs: 100 }, { id: 'c2', command: 'two/', waitMs: 200 }] }, groupIndex: 0 });
    await vi.advanceTimersByTimeAsync(300);
    expect(events.filter(event => event.type === 'cue:dispatched').map(event => event.command)).toEqual(['one/', 'two/']);
    expect(events.at(-1).type).toBe('sequence:completed');
    expect(statuses.some(([, , patch]) => patch.status === 'LIVE')).toBe(true);
  });

  test('reports the elapsed wait time as a percentage while a cue is live', async () => {
    const statuses = [];
    const engine = new CueEngine({ onStatus: (...args) => statuses.push(args) });
    engine.start({ group: { id: 'g1', name: 'Act', cues: [{ id: 'c1', command: 'go/', waitMs: 1000 }] }, groupIndex: 0 });

    await vi.advanceTimersByTimeAsync(500);

    expect(statuses).toContainEqual(['g1', 'c1', { status: 'LIVE', progress: 50 }]);
  });

  test('does not dispatch a live cue after stop', async () => {
    const events = [];
    const engine = new CueEngine({ onStatus: vi.fn(), onEvent: event => events.push(event) });
    engine.start({ group: { id: 'g1', name: 'Act', cues: [{ id: 'c1', command: 'go/', waitMs: 500 }] }, groupIndex: 0 });
    engine.stop('g1', 0, 'Act');
    await vi.advanceTimersByTimeAsync(500);
    expect(events.some(event => event.type === 'cue:dispatched')).toBe(false);
    expect(events.at(-1).type).toBe('sequence:stopped');
  });
});
