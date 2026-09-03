export class CueEngine {
  constructor({ onStatus = () => {}, onEvent = () => {}, now = () => new Date() } = {}) {
    this.onStatus = onStatus; this.onEvent = onEvent; this.now = now; this.runs = new Map();
  }

  event(type, group, groupIndex, cue, extra = {}) {
    const value = { type, timestamp: this.now().toISOString(), group: { index: groupIndex, name: group.name }, ...extra };
    if (cue) value.cue = { ...cue };
    this.onEvent(value);
  }

  async start({ group, groupIndex }) {
    this.stop(group.id, groupIndex, group.name, false);
    const token = { cancelled: false, timers: new Set() };
    this.runs.set(group.id, token);
    group.cues.forEach(cue => this.onStatus(group.id, cue.id, { status: 'IDLE', progress: 0 }));
    this.event('sequence:started', group, groupIndex);
    do {
      for (const cue of group.cues) {
        if (token.cancelled) return;
        this.onStatus(group.id, cue.id, { status: 'LIVE', progress: 0 });
        this.event('cue:started', group, groupIndex, cue);
        const completed = await this.wait(token, Math.max(0, Number(cue.waitMs) || 0), progress => this.onStatus(group.id, cue.id, { status: 'LIVE', progress }));
        if (!completed || token.cancelled) return;
        this.onStatus(group.id, cue.id, { status: 'DONE', progress: 100 });
        this.event('cue:dispatched', group, groupIndex, cue, { command: cue.command, source: 'sequence' });
      }
      if (token.cancelled) return;
      this.event('sequence:completed', group, groupIndex);
      if (group.loopEnabled) group.cues.forEach(cue => this.onStatus(group.id, cue.id, { status: 'IDLE', progress: 0 }));
    } while (group.loopEnabled && !token.cancelled);
    if (this.runs.get(group.id) === token) this.runs.delete(group.id);
  }

  wait(token, delay, onProgress = () => {}) {
    return new Promise(resolve => {
      const startedAt = Date.now();
      const progressTimer = delay > 0 && setInterval(() => onProgress(Math.min(99, Math.floor(((Date.now() - startedAt) / delay) * 100))), Math.min(100, delay));
      const timer = setTimeout(() => {
        token.timers.delete(timer);
        if (progressTimer) { clearInterval(progressTimer); token.timers.delete(progressTimer); }
        resolve(true);
      }, delay);
      token.timers.add(timer); if (progressTimer) token.timers.add(progressTimer); token.resolve = resolve;
    });
  }

  stop(groupId, groupIndex = 0, groupName = '', emit = true) {
    const token = this.runs.get(groupId);
    if (!token) return false;
    token.cancelled = true; token.timers.forEach(clearTimeout); token.resolve?.(false); this.runs.delete(groupId);
    if (emit) this.event('sequence:stopped', { id: groupId, name: groupName }, groupIndex);
    return true;
  }

  stopAll(groups) { groups.forEach((group, index) => this.stop(group.id, index, group.name)); }
  dispose() { for (const [id, token] of this.runs) { token.cancelled = true; token.timers.forEach(clearTimeout); token.resolve?.(false); this.runs.delete(id); } }
}
