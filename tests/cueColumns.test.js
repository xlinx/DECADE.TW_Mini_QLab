import {describe, expect, test} from 'vitest';
import {DEFAULT_CUE_COLUMN_WIDTHS, cueColumnWidth, normalizeCueColumnWidths, totalCueColumnWidth} from '../src/lib/cueColumns.js';

describe('cue column widths', () => {
  test('normalizes invalid persisted values to defaults', () => {
    const widths = normalizeCueColumnWidths({content: 360, name: 20, status: 'bad'});
    expect(widths.content).toBe(360);
    expect(widths.name).toBe(DEFAULT_CUE_COLUMN_WIDTHS.name);
    expect(widths.status).toBe(DEFAULT_CUE_COLUMN_WIDTHS.status);
  });

  test('clamps resizing to each column minimum and totals widths', () => {
    expect(cueColumnWidth('content', 10)).toBe(300);
    expect(cueColumnWidth('missing', 100)).toBeNull();
    expect(totalCueColumnWidth(DEFAULT_CUE_COLUMN_WIDTHS)).toBe(Object.values(DEFAULT_CUE_COLUMN_WIDTHS).reduce((sum, width) => sum + width, 0));
  });
});
