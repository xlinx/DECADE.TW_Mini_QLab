import { expect, test } from 'vitest';
import { createTriggerGate, isCronDue, matchingTriggeredCues } from '../src/lib/triggers.js';

test('suppresses duplicate observations until their value changes', () => {
  const gate = createTriggerGate();
  expect(gate.shouldDispatch('timecode', 'cue-1', '01:00:00:00')).toBe(true);
  expect(gate.shouldDispatch('timecode', 'cue-1', '01:00:00:00')).toBe(false);
  expect(gate.shouldDispatch('timecode', 'cue-1', '01:00:00:01')).toBe(true);
});

test('handles valid and malformed cron expressions', () => {
  expect(isCronDue('* * * * * *', new Date('2026-09-03T00:00:00Z'))).toBe(true);
  expect(isCronDue('not a cron', new Date('2026-09-03T00:00:00Z'))).toBe(false);
});

test('matches the current cron second when the timer has milliseconds', () => {
  expect(isCronDue('* * * * * *', new Date('2026-09-03T00:00:00.550Z'))).toBe(true);
});

test('matches only cues in enabled trigger modes', () => {
  const groups = [{ id: 'g', name: 'Act', timecodeEnabled: true, hotkeyEnabled: true, clockEnabled: false, cues: [{ id: 'c', ltcTrigger: '01:00:00:00', hotkey: 'g', cron: '* * * * * *' }] }];
  const matched = matchingTriggeredCues(groups, { timecode: '01:00:00:00', key: 'g', date: new Date('2026-09-03T00:00:00Z') });
  expect(matched.map(item => item.source)).toEqual(['timecode', 'hotkey']);
});
