const PROGRESS_TICK_MS = 100;

export class CueEngine {
  constructor({ onStatus = () => {}, onEvent = () => {}, now = () => new Date() } = {}) {
    this.onStatus = onStatus; this.onEvent = onEvent; this.now = now; this.runs = new Map();
  }

  event(type, group, groupIndex, cue, extra = {}) {
    const value = { type, timestamp: this.now().toISOString(), group: { id: group.id, index: groupIndex, name: group.name }, ...extra };
    if (cue) value.cue = { ...cue };
    this.onEvent(value);
  }

  start({ group, groupIndex, singleCueId, startCueId, source }) {
    this.stop(group.id, groupIndex, group.name, false);
    const token = { cancelled: false, timers: new Set(), waits: new Set(), source, group, cueId: singleCueId ?? null };
    this.runs.set(group.id, token);
    group.cues.forEach(cue => this.onStatus(group.id, cue.id, { status: 'IDLE', beforeProgress: 0, afterProgress: 0, startedAt: null, phaseStartedAt: null }));
    const startCue = index => singleCueId ? group.cues.findIndex(cue => cue.id === singleCueId) : startCueId ? group.cues.findIndex(cue => cue.id === startCueId) : index;
    this.event('sequence:started', group, groupIndex);
    this.runCue(token, group, groupIndex, startCue(0), singleCueId, this.now().getTime());
    return token;
  }

  runCue(token, group, groupIndex, index, singleCueId, scheduledStartAt) {
    const cue = group.cues[index];
    if (!cue) { this.runs.delete(group.id); return; }
    const beforeDelay = Math.max(0, Number(cue.beforeWaitMs) || 0);
    const afterDelay = Math.max(0, Number(cue.afterWaitMs) || 0);
    const dispatchAt = scheduledStartAt + beforeDelay;
    const afterDeadline = dispatchAt + afterDelay;
    const tickPhase = (name, start, deadline) => {
      const delay = Math.max(0, deadline - start);
      if (delay <= 0) return;
      const step = () => {
        if (token.cancelled) return;
        const elapsed = Math.max(0, this.now().getTime() - start);
        const progress = Math.min(99, Math.round((elapsed / delay) * 100));
        this.onStatus(group.id, cue.id, name === 'before' ? { beforeProgress: progress } : { afterProgress: progress });
        if (elapsed < delay) {
          const timer = setTimeout(() => { token.timers.delete(timer); step(); }, PROGRESS_TICK_MS);
          token.timers.add(timer);
        }
      };
      step();
    };
    const finishAfter = () => {
      if (afterDelay <= 0) { this.advance(token, group, groupIndex, index, singleCueId, afterDeadline); return; }
      this.onStatus(group.id, cue.id, { afterProgress: 0, phaseStartedAt: dispatchAt });
      tickPhase('after', dispatchAt, afterDeadline);
      this.waitUntil(token, afterDeadline).then(done => {
        if (!done || token.cancelled) return;
        this.advance(token, group, groupIndex, index, singleCueId, afterDeadline);
      });
    };
    if (beforeDelay > 0) {
      this.onStatus(group.id, cue.id, { status: 'LIVE', beforeProgress: 0, afterProgress: 0, startedAt: scheduledStartAt, phaseStartedAt: scheduledStartAt });
      this.event('cue:started', group, groupIndex, cue);
      tickPhase('before', scheduledStartAt, dispatchAt);
      this.waitUntil(token, dispatchAt).then(completed => {
        if (!completed || token.cancelled) return;
        this.onStatus(group.id, cue.id, { beforeProgress: 100 });
        this.dispatchCue(token, group, groupIndex, cue, dispatchAt);
        this.onStatus(group.id, cue.id, { status: 'DONE' });
        if (token.cancelled) return;
        finishAfter();
      });
      return;
    }
    this.onStatus(group.id, cue.id, { status: 'DONE', beforeProgress: 100, afterProgress: 0, startedAt: scheduledStartAt, phaseStartedAt: scheduledStartAt });
    this.event('cue:started', group, groupIndex, cue);
    this.dispatchCue(token, group, groupIndex, cue, dispatchAt);
    if (token.cancelled) return;
    finishAfter();
  }

  advance(token, group, groupIndex, index, singleCueId, nextScheduledAt) {
    if (token.cancelled) return;
    this.onStatus(group.id, group.cues[index].id, { afterProgress: 100, phaseStartedAt: null });
    if (singleCueId) {
      this.runs.delete(group.id);
      return;
    }
    const next = index + 1;
    if (next < group.cues.length) { this.runCue(token, group, groupIndex, next, singleCueId, nextScheduledAt); return; }
    this.event('sequence:completed', group, groupIndex);
    if (group.loopEnabled) {
      group.cues.forEach(cue => this.onStatus(group.id, cue.id, { status: 'IDLE', beforeProgress: 0, afterProgress: 0, startedAt: null, phaseStartedAt: null }));
      this.runCue(token, group, groupIndex, 0, singleCueId, this.now().getTime());
      return;
    }
    if (this.runs.get(group.id) === token) this.runs.delete(group.id);
  }

  dispatchCue(token, group, groupIndex, cue, scheduledAt = this.now().getTime()) {
    const lateMs = Math.max(0, this.now().getTime() - scheduledAt);
    const timing = lateMs > 0 ? {lateMs, scheduledAt: new Date(scheduledAt).toISOString()} : {};
    if (cue.type === 'trigger') {
      this.event('cue:target-requested', group, groupIndex, cue, {targetGroupName: cue.targetGroupName, targetCueName: cue.targetCueName, targetAction: cue.targetAction, source: token.source ?? 'sequence', ...timing});
      return;
    }
    this.event('cue:dispatched', group, groupIndex, cue, { command: cue.command, source: token.source ?? 'sequence', ...timing });
  }

  isRunning(groupId) { return this.runs.has(groupId); }
  isSingleCueRunning(groupId, cueId) { return this.runs.get(groupId)?.cueId === cueId; }

  waitUntil(token, deadline) {
    return new Promise(resolve => {
      if (token.cancelled) { resolve(false); return; }
      if (deadline <= this.now().getTime()) { resolve(true); return; }
      const wait = {deadline, timer: null, complete: null};
      wait.complete = completed => {
        if (!token.waits.delete(wait)) return;
        if (wait.timer !== null) { clearTimeout(wait.timer); token.timers.delete(wait.timer); }
        resolve(completed);
      };
      wait.timer = setTimeout(() => wait.complete(true), Math.max(0, deadline - this.now().getTime()));
      token.waits.add(wait); token.timers.add(wait.timer);
    });
  }

  reconcile() {
    const current = this.now().getTime();
    for (const token of this.runs.values()) {
      for (const wait of [...token.waits]) if (wait.deadline <= current) wait.complete(true);
    }
  }

  stop(groupId, groupIndex = 0, groupName = '', emit = true) {
    const token = this.runs.get(groupId);
    if (!token) return false;
    token.cancelled = true;
    for (const value of token.timers) { clearTimeout(value); }
    token.timers.clear();
    for (const wait of [...token.waits]) wait.complete(false);
    this.runs.delete(groupId);
    if (token.source) {
      this.onStatus(groupId, token.cueId, { status: 'IDLE', beforeProgress: 0, afterProgress: 0, startedAt: null, phaseStartedAt: null });
    } else {
      for (const cue of token.group.cues) this.onStatus(groupId, cue.id, { status: 'IDLE', beforeProgress: 0, afterProgress: 0, startedAt: null, phaseStartedAt: null });
      if (emit) this.event('sequence:stopped', { id: groupId, name: groupName }, groupIndex);
    }
    return true;
  }

  stopAll(groups) { groups.forEach((group, index) => this.stop(group.id, index, group.name)); }
  dispose() { for (const [id, token] of this.runs) { token.cancelled = true; for (const value of token.timers) { clearTimeout(value); } token.timers.clear(); for (const wait of [...token.waits]) wait.complete(false); if (token.source) { this.onStatus(id, token.cueId, { status: 'IDLE', beforeProgress: 0, afterProgress: 0, startedAt: null, phaseStartedAt: null }); } else { for (const cue of token.group.cues) this.onStatus(id, cue.id, { status: 'IDLE', beforeProgress: 0, afterProgress: 0, startedAt: null, phaseStartedAt: null }); } this.runs.delete(id); } }
}
