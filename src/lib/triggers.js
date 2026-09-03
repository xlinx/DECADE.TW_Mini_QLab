import { CronExpressionParser } from 'cron-parser';

export function isCronDue(expression, date) {
  if (!expression?.trim()) return false;
  try {
    const second = new Date(date); second.setMilliseconds(0);
    const previous = new Date(second.getTime() - 1000);
    return CronExpressionParser.parse(expression, { currentDate: previous }).next().getTime() === second.getTime();
  } catch { return false; }
}

export function createTriggerGate() {
  const seen = new Map();
  return {
    shouldDispatch(kind, cueId, value) { const key = `${kind}:${cueId}`; if (seen.get(key) === value) return false; seen.set(key, value); return true; },
    clear(kind) { for (const key of seen.keys()) if (!kind || key.startsWith(`${kind}:`)) seen.delete(key); }
  };
}

export function matchingTriggeredCues(groups, { timecode, key, date }) {
  const result = [];
  groups.forEach((group, groupIndex) => group.cues.forEach(cue => {
    if (group.timecodeEnabled && timecode && cue.ltcTrigger === timecode) result.push({ group, groupIndex, cue, source: 'timecode', observedValue: timecode });
    if (group.hotkeyEnabled && key && cue.hotkey.toLowerCase() === key.toLowerCase()) result.push({ group, groupIndex, cue, source: 'hotkey', observedValue: key.toLowerCase() });
    if (group.clockEnabled && date && isCronDue(cue.cron, date)) result.push({ group, groupIndex, cue, source: 'cron', observedValue: date.toISOString().slice(0, 19) });
  }));
  return result;
}
