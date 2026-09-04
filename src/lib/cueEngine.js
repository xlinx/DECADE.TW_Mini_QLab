const PROGRESS_TICK_MS = 100;

export class CueEngine {
  constructor({ onStatus = () => {}, onEvent = () => {}, now = () => new Date() } = {}) {
    this.onStatus = onStatus; this.onEvent = onEvent; this.now = now; this.runs = new Map();
  }

  event(type, group, groupIndex, cue, extra = {}) {
    const value = { type, timestamp: this.now().toISOString(), group: { index: groupIndex, name: group.name }, ...extra };
    if (cue) value.cue = { ...cue };
    this.onEvent(value);
  }

  start({ group, groupIndex, singleCueId, source }) {
    this.stop(group.id, groupIndex, group.name, false);
    const token = { cancelled: false, timers: new Set(), resolve: null, source, group, cueId: singleCueId ?? null };
    this.runs.set(group.id, token);
    group.cues.forEach(cue => this.onStatus(group.id, cue.id, { status: 'IDLE', beforeProgress: 0, afterProgress: 0, startedAt: null }));
    const startCue = index => singleCueId ? group.cues.findIndex(cue => cue.id === singleCueId) : index;
    this.event('sequence:started', group, groupIndex);
    this.runCue(token, group, groupIndex, startCue(0), singleCueId);
    return token;
  }

  runCue(token, group, groupIndex, index, singleCueId) {
    const cue = group.cues[index];
    const beforeDelay = Math.max(0, Number(cue.beforeWaitMs) || 0);
    const afterDelay = Math.max(0, Number(cue.afterWaitMs) || 0);
    const tickPhase = (name, delay, start) => {
      if (delay <= 0) return;
      const step = () => {
        if (token.cancelled) return;
        const elapsed = Math.max(0, this.now().getTime() - start);
        const progress = Math.min(99, Math.round((elapsed / delay) * 100));
        this.onStatus(group.id, cue.id, name === 'before' ? { beforeProgress: progress } : { afterProgress: progress });
        if (elapsed < delay) { const timer = setTimeout(step, PROGRESS_TICK_MS); token.timers.add(timer); }
      };
      step();
    };
    const start = this.now().getTime();
    if (beforeDelay > 0) {
      this.onStatus(group.id, cue.id, { status: 'LIVE', beforeProgress: 0, afterProgress: 0, startedAt: start });
      this.event('cue:started', group, groupIndex, cue);
      tickPhase('before', beforeDelay, start);
      this.wait(token, beforeDelay).then(completed => {
        if (!completed || token.cancelled) return;
        this.onStatus(group.id, cue.id, { beforeProgress: 100 });
        this.event('cue:dispatched', group, groupIndex, cue, { command: cue.command, source: token.source ?? 'sequence' });
        this.onStatus(group.id, cue.id, { status: 'DONE' });
        if (token.cancelled) return;
        if (afterDelay > 0) {
          const afterStart = this.now().getTime();
          this.onStatus(group.id, cue.id, { afterProgress: 0 });
          tickPhase('after', afterDelay, afterStart);
          this.wait(token, afterDelay).then(done => {
            if (!done || token.cancelled) return;
            this.advance(token, group, groupIndex, index, singleCueId);
          });
          return;
        }
        this.advance(token, group, groupIndex, index, singleCueId);
      });
      return;
    }
    this.onStatus(group.id, cue.id, { status: 'DONE', beforeProgress: 100, afterProgress: 0, startedAt: start });
    this.event('cue:started', group, groupIndex, cue);
    this.event('cue:dispatched', group, groupIndex, cue, { command: cue.command, source: token.source ?? 'sequence' });
    if (token.cancelled) return;
    if (afterDelay > 0) {
      const afterStart = this.now().getTime();
      this.onStatus(group.id, cue.id, { afterProgress: 0 });
      tickPhase('after', afterDelay, afterStart);
      this.wait(token, afterDelay).then(done => {
        if (!done || token.cancelled) return;
        this.advance(token, group, groupIndex, index, singleCueId);
      });
      return;
    }
    this.advance(token, group, groupIndex, index, singleCueId);
  }

  advance(token, group, groupIndex, index, singleCueId) {
    if (token.cancelled) return;
    this.onStatus(group.id, group.cues[index].id, { afterProgress: 100 });
    if (singleCueId) {
      this.runs.delete(group.id);
      return;
    }
    const next = index + 1;
    if (next < group.cues.length) { this.runCue(token, group, groupIndex, next, singleCueId); return; }
    this.event('sequence:completed', group, groupIndex);
    if (group.loopEnabled) {
      group.cues.forEach(cue => this.onStatus(group.id, cue.id, { status: 'IDLE', beforeProgress: 0, afterProgress: 0, startedAt: null }));
      this.runCue(token, group, groupIndex, 0, singleCueId);
      return;
    }
    if (this.runs.get(group.id) === token) this.runs.delete(group.id);
  }

  wait(token, delay) {
    return new Promise(resolve => {
      if (delay <= 0) { resolve(true); return; }
      const timer = setTimeout(() => { token.timers.delete(timer); resolve(true); }, delay);
      token.timers.add(timer); token.resolve = resolve;
    });
  }

  stop(groupId, groupIndex = 0, groupName = '', emit = true) {
    const token = this.runs.get(groupId);
    if (!token) return false;
    token.cancelled = true;
    for (const value of token.timers) { clearTimeout(value); }
    token.timers.clear();
    token.resolve?.(false);
    this.runs.delete(groupId);
    if (token.source) {
      this.onStatus(groupId, token.cueId, { status: 'IDLE', beforeProgress: 0, afterProgress: 0, startedAt: null });
    } else {
      for (const cue of token.group.cues) this.onStatus(groupId, cue.id, { status: 'IDLE', beforeProgress: 0, afterProgress: 0, startedAt: null });
      if (emit) this.event('sequence:stopped', { id: groupId, name: groupName }, groupIndex);
    }
    return true;
  }

  stopAll(groups) { groups.forEach((group, index) => this.stop(group.id, index, group.name)); }
  dispose() { for (const [id, token] of this.runs) { token.cancelled = true; for (const value of token.timers) { clearTimeout(value); } token.timers.clear(); token.resolve?.(false); if (token.source) { this.onStatus(id, token.cueId, { status: 'IDLE', beforeProgress: 0, afterProgress: 0, startedAt: null }); } else { for (const cue of token.group.cues) this.onStatus(id, cue.id, { status: 'IDLE', beforeProgress: 0, afterProgress: 0, startedAt: null }); } this.runs.delete(id); } }
}
