import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { CueEngine } from '../src/lib/cueEngine.js';

describe('CueEngine', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('dispatches cues in table order with after-waits between them', async () => {
    const events = [];
    const statuses = [];
    const engine = new CueEngine({ onStatus: (...args) => statuses.push(args), onEvent: event => events.push(event) });
    engine.start({ group: { id: 'g1', name: 'Act', loopEnabled: false, cues: [{ id: 'c1', command: 'one/', afterWaitMs: 100 }, { id: 'c2', command: 'two/', afterWaitMs: 200 }] }, groupIndex: 0 });
    await vi.advanceTimersByTimeAsync(300);
    expect(events.filter(event => event.type === 'cue:dispatched').map(event => event.command)).toEqual(['one/', 'two/']);
    expect(events.at(-1).type).toBe('sequence:completed');
    expect(statuses.some(([, , patch]) => patch.status === 'DONE')).toBe(true);
    expect(events.filter(event => event.type === 'cue:started')).toHaveLength(2);
  });

  test('does not dispatch a live cue after stop', async () => {
    const events = [];
    const engine = new CueEngine({ onStatus: vi.fn(), onEvent: event => events.push(event) });
    engine.start({ group: { id: 'g1', name: 'Act', cues: [{ id: 'c1', command: 'go/', beforeWaitMs: 500 }] }, groupIndex: 0 });
    engine.stop('g1', 0, 'Act');
    await vi.advanceTimersByTimeAsync(500);
    expect(events.some(event => event.type === 'cue:dispatched')).toBe(false);
    expect(events.at(-1).type).toBe('sequence:stopped');
  });

  test('loops until stopped after a natural completion', async () => {
    const events = [];
    const engine = new CueEngine({ onStatus: vi.fn(), onEvent: event => events.push(event) });
    engine.start({ group: { id: 'g1', name: 'Act', loopEnabled: true, cues: [{ id: 'c1', command: 'go/', afterWaitMs: 100 }] }, groupIndex: 0 });
    await vi.advanceTimersByTimeAsync(350);
    expect(events.filter(event => event.type === 'sequence:completed').length).toBeGreaterThanOrEqual(2);
    expect(events.filter(event => event.type === 'cue:dispatched').length).toBeGreaterThanOrEqual(3);
    engine.stop('g1', 0, 'Act');
    await vi.advanceTimersByTimeAsync(500);
    expect(events.at(-1).type).toBe('sequence:stopped');
  });

  test('stopAll cancels every running group', async () => {
    const events = [];
    const engine = new CueEngine({ onStatus: vi.fn(), onEvent: event => events.push(event) });
    const groups = [
      { id: 'g1', name: 'A', cues: [{ id: 'c1', command: 'a/', beforeWaitMs: 1000 }] },
      { id: 'g2', name: 'B', cues: [{ id: 'c2', command: 'b/', beforeWaitMs: 1000 }] }
    ];
    engine.start({ group: groups[0], groupIndex: 0 });
    engine.start({ group: groups[1], groupIndex: 1 });
    engine.stopAll(groups);
    await vi.advanceTimersByTimeAsync(2000);
    expect(events.filter(event => event.type === 'cue:dispatched')).toHaveLength(0);
    expect(events.filter(event => event.type === 'sequence:stopped')).toHaveLength(2);
  });

  test('waits out before-wait before dispatch, then after-wait before the next cue', async () => {
    const events = [];
    const statuses = [];
    const engine = new CueEngine({ onStatus: (...args) => statuses.push(args), onEvent: event => events.push(event) });
    const group = { id: 'g1', name: 'Phases', cues: [{ id: 'c1', command: 'one/', beforeWaitMs: 100, afterWaitMs: 100 }, { id: 'c2', command: 'two/', afterWaitMs: 0 }] };
    engine.start({ group, groupIndex: 0 });
    const live = statuses.find(([, , patch]) => patch.status === 'LIVE');
    expect(live?.[2]).toMatchObject({ status: 'LIVE', beforeProgress: 0, afterProgress: 0 });
    expect(events.filter(event => event.type === 'cue:dispatched')).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(100);
    expect(events.filter(event => event.type === 'cue:dispatched').map(event => event.command)).toEqual(['one/']);
    await vi.advanceTimersByTimeAsync(100);
    expect(events.filter(event => event.type === 'cue:dispatched').map(event => event.command)).toEqual(['one/', 'two/']);
    expect(events.at(-1).type).toBe('sequence:completed');
  });

  test('single cue trigger follows before/after waits with the given source', async () => {
    const events = [];
    const statuses = [];
    const engine = new CueEngine({ onStatus: (...args) => statuses.push(args), onEvent: event => events.push(event) });
    const group = { id: 'g1', name: 'Cron', cues: [{ id: 'c0', command: 'a/', waitMs: 0 }, { id: 'c1', command: 'sched/', beforeWaitMs: 100, afterWaitMs: 100 }, { id: 'c2', command: 'b/', waitMs: 0 }] };
    engine.start({ group, groupIndex: 0, singleCueId: 'c1', source: 'cron' });
    await vi.advanceTimersByTimeAsync(20);
    expect(events.filter(event => event.type === 'cue:dispatched')).toHaveLength(0);
    expect(statuses.filter(([, cueId]) => cueId === 'c0').at(-1)?.[2]?.status).toBe('IDLE');
    await vi.advanceTimersByTimeAsync(80);
    expect(events.filter(event => event.type === 'cue:dispatched')).toHaveLength(1);
    expect(events.find(event => event.type === 'cue:dispatched').source).toBe('cron');
    await vi.advanceTimersByTimeAsync(120);
    expect(events.filter(event => event.type === 'sequence:completed')).toHaveLength(0);
    expect(engine.stop('g1', 0, 'Cron')).toBe(false);
  });

  test('starts at a named target cue and continues through the group', async () => {
    const events = [];
    const engine = new CueEngine({onStatus: vi.fn(), onEvent: event => events.push(event)});
    const group = {id: 'g', name: 'Target', cues: [{id: 'a', command: 'a/'}, {id: 'b', command: 'b/'}, {id: 'c', command: 'c/'}]};
    engine.start({group, groupIndex: 0, startCueId: 'b'});
    await vi.runAllTimersAsync();
    expect(events.filter(event => event.type === 'cue:dispatched').map(event => event.command)).toEqual(['b/', 'c/']);
    expect(engine.isRunning('g')).toBe(false);
  });

  test('emits an internal target request instead of a command dispatch', async () => {
    const events = [];
    const engine = new CueEngine({onStatus: vi.fn(), onEvent: event => events.push(event)});
    const group = {id: 'g', name: 'Source', cues: [{id: 'link', type: 'trigger', targetGroupName: 'Target', targetCueName: 'Middle'}]};
    engine.start({group, groupIndex: 0});
    await vi.runAllTimersAsync();
    expect(events).toContainEqual(expect.objectContaining({type: 'cue:target-requested', targetGroupName: 'Target', targetCueName: 'Middle'}));
    expect(events.some(event => event.type === 'cue:dispatched')).toBe(false);
  });

  test('reconciles overdue absolute deadlines and reports late dispatches', async () => {
    let currentTime = 0;
    const events = [];
    const engine = new CueEngine({now: () => new Date(currentTime), onStatus: vi.fn(), onEvent: event => events.push(event)});
    const group = {id: 'g', name: 'Background', cues: [
      {id: 'a', command: 'a/', beforeWaitMs: 100, afterWaitMs: 100},
      {id: 'b', command: 'b/', beforeWaitMs: 0, afterWaitMs: 0}
    ]};
    engine.start({group, groupIndex: 0});
    currentTime = 350;
    engine.reconcile();
    await vi.runAllTimersAsync();
    const dispatched = events.filter(event => event.type === 'cue:dispatched');
    expect(dispatched.map(event => event.command)).toEqual(['a/', 'b/']);
    expect(dispatched.map(event => event.lateMs)).toEqual([250, 150]);
    expect(dispatched[0].scheduledAt).toBe(new Date(100).toISOString());
  });
});
