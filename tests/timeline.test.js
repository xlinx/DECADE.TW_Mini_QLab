import {describe, expect, test} from 'vitest';
import {cueInsertionAt, extendTimelineDuration, layoutCues, msToPixels, pixelsToMs, playbackObservation, safeWaitMs, snapWaitMs, timelineDuration, zoomScrollLeft} from '../src/lib/timeline.js';
import {formatTimelineNow} from '../src/components/TimelineEditor.jsx';

describe('timeline geometry', () => {
  test('lays sequential cues out from their before and after waits', () => {
    const result = layoutCues([
      {id: 'a', beforeWaitMs: 200, afterWaitMs: 500},
      {id: 'b', beforeWaitMs: 300, afterWaitMs: 100}
    ]);
    expect(result.map(({startMs, endMs}) => ({startMs, endMs}))).toEqual([
      {startMs: 200, endMs: 700},
      {startMs: 1000, endMs: 1100}
    ]);
    expect(timelineDuration([{cues: result.map(item => item.cue)}])).toBe(1100);
  });

  test('normalizes bad values and snaps non-negative integer waits', () => {
    expect(safeWaitMs(-20)).toBe(0);
    expect(safeWaitMs('120.6')).toBe(121);
    expect(safeWaitMs(Number.NaN)).toBe(0);
    expect(snapWaitMs(149)).toBe(100);
    expect(snapWaitMs(151)).toBe(200);
  });

  test('converts between time and pixels', () => {
    expect(msToPixels(2500, 80)).toBe(200);
    expect(pixelsToMs(200, 80)).toBe(2500);
    expect(pixelsToMs(10, 0)).toBe(0);
  });

  test('formats the now clock with minute, second, and millisecond precision', () => {
    expect(formatTimelineNow(new Date(2026, 0, 1, 10, 2, 3, 4))).toBe('10:02:03.004');
    expect(formatTimelineNow(new Date(2026, 0, 1, 23, 59, 59, 999))).toBe('23:59:59.999');
  });

  test('extends the forward canvas in fixed segments', () => {
    expect(extendTimelineDuration(0, 1000)).toBe(60000);
    expect(extendTimelineDuration(60000, 61000)).toBe(120000);
  });

  test('keeps the time under the pointer stable while zooming', () => {
    expect(zoomScrollLeft({scrollLeft: 400, pointerOffset: 200, oldPixelsPerSecond: 100, newPixelsPerSecond: 200})).toBe(1000);
  });

  test('calculates chronological insertion and its preceding gap', () => {
    const cues = [{beforeWaitMs: 0, afterWaitMs: 1000}, {beforeWaitMs: 1000, afterWaitMs: 500}];
    expect(cueInsertionAt(cues, 1500)).toEqual({index: 1, beforeWaitMs: 500});
    expect(cueInsertionAt(cues, 200)).toEqual({index: 1, beforeWaitMs: 0});
  });

  test('observes playback across before-wait and after-wait phases', () => {
    expect(playbackObservation([{beforeWaitMs: 1000, afterWaitMs: 500, status: 'LIVE', beforeProgress: 25}])).toEqual({positionMs: 250, endMs: 1000, moving: true});
    expect(playbackObservation([{beforeWaitMs: 1000, afterWaitMs: 500, status: 'DONE', afterProgress: 40}])).toEqual({positionMs: 1200, endMs: 1500, moving: true});
  });

  test('uses precise phase time instead of quantized progress when available', () => {
    expect(playbackObservation([{beforeWaitMs: 60000, afterWaitMs: 0, status: 'LIVE', beforeProgress: 0, phaseStartedAt: 1000}], 1250)).toEqual({positionMs: 250, endMs: 60000, moving: true});
  });

  test('clamps malformed progress and settles completed playback at the end', () => {
    expect(playbackObservation([{beforeWaitMs: 100, afterWaitMs: 200, status: 'LIVE', beforeProgress: 999}])).toEqual({positionMs: 100, endMs: 100, moving: false});
    expect(playbackObservation([{beforeWaitMs: 100, afterWaitMs: 200, status: 'DONE', afterProgress: 100}])).toEqual({positionMs: 300, endMs: 300, moving: false});
    expect(playbackObservation([])).toEqual({positionMs: 0, endMs: 0, moving: false});
  });
});
