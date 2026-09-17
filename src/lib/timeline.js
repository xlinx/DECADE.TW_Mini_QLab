export const TIMELINE_SNAP_MS = 100;
export const TIMELINE_EXTENSION_MS = 60000;

export function safeWaitMs(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

export function snapWaitMs(value, interval = TIMELINE_SNAP_MS) {
  const step = Math.max(1, safeWaitMs(interval));
  return Math.max(0, Math.round(safeWaitMs(value) / step) * step);
}

export function msToPixels(milliseconds, pixelsPerSecond) {
  return safeWaitMs(milliseconds) * pixelsPerSecond / 1000;
}

export function pixelsToMs(pixels, pixelsPerSecond) {
  if (!Number.isFinite(pixels) || !Number.isFinite(pixelsPerSecond) || pixelsPerSecond <= 0) return 0;
  return pixels * 1000 / pixelsPerSecond;
}

export function layoutCues(cues = []) {
  let cursorMs = 0;
  return cues.map((cue, index) => {
    const beforeMs = safeWaitMs(cue.beforeWaitMs);
    const afterMs = safeWaitMs(cue.afterWaitMs);
    const startMs = cursorMs + beforeMs;
    const item = { cue, index, beforeMs, afterMs, startMs, endMs: startMs + afterMs };
    cursorMs = item.endMs;
    return item;
  });
}

export function timelineDuration(groups = []) {
  return Math.max(0, ...groups.map(group => layoutCues(group.cues).at(-1)?.endMs ?? 0));
}

export function extendTimelineDuration(currentMs, requiredMs, extensionMs = TIMELINE_EXTENSION_MS) {
  const step = Math.max(1000, safeWaitMs(extensionMs));
  const target = Math.max(safeWaitMs(currentMs), safeWaitMs(requiredMs));
  return Math.max(step, Math.ceil(target / step) * step);
}

export function zoomScrollLeft({scrollLeft, pointerOffset, oldPixelsPerSecond, newPixelsPerSecond}) {
  const oldScale = Number(oldPixelsPerSecond);
  const newScale = Number(newPixelsPerSecond);
  if (!(oldScale > 0) || !(newScale > 0)) return Math.max(0, Number(scrollLeft) || 0);
  const offset = Number(pointerOffset) || 0;
  const timeMs = pixelsToMs((Number(scrollLeft) || 0) + offset, oldScale);
  return Math.max(0, msToPixels(timeMs, newScale) - offset);
}

export function cueInsertionAt(cues, timeMs) {
  const time = safeWaitMs(timeMs);
  const layout = layoutCues(cues);
  let index = layout.findIndex(item => item.startMs > time);
  if (index < 0) index = layout.length;
  const previousEnd = index > 0 ? layout[index - 1].endMs : 0;
  return {index, beforeWaitMs: snapWaitMs(Math.max(0, time - previousEnd))};
}

function progressRatio(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(1, Math.max(0, number / 100)) : 0;
}

export function playbackObservation(cues = [], nowMs = Date.now()) {
  const layout = layoutCues(cues);
  if (!layout.length) return {positionMs: 0, endMs: 0, moving: false};
  const live = layout.find(item => item.cue.status === 'LIVE');
  if (live) {
    const phaseStart = live.startMs - live.beforeMs;
    const preciseElapsed = Number.isFinite(Number(live.cue.phaseStartedAt)) ? Math.max(0, Number(nowMs) - Number(live.cue.phaseStartedAt)) : null;
    const positionMs = phaseStart + (preciseElapsed === null ? live.beforeMs * progressRatio(live.cue.beforeProgress) : Math.min(live.beforeMs, preciseElapsed));
    return {positionMs, endMs: live.startMs, moving: positionMs < live.startMs};
  }
  const activeAfter = [...layout].reverse().find(item => item.cue.status === 'DONE' && progressRatio(item.cue.afterProgress) < 1);
  if (activeAfter) {
    const preciseElapsed = Number.isFinite(Number(activeAfter.cue.phaseStartedAt)) ? Math.max(0, Number(nowMs) - Number(activeAfter.cue.phaseStartedAt)) : null;
    const positionMs = activeAfter.startMs + (preciseElapsed === null ? activeAfter.afterMs * progressRatio(activeAfter.cue.afterProgress) : Math.min(activeAfter.afterMs, preciseElapsed));
    return {positionMs, endMs: activeAfter.endMs, moving: positionMs < activeAfter.endMs};
  }
  if (layout.every(item => item.cue.status === 'DONE')) {
    const endMs = layout.at(-1).endMs;
    return {positionMs: endMs, endMs, moving: false};
  }
  return null;
}
