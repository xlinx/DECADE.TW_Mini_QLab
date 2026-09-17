export const CUE_COLUMNS = [
  {id: 'status', label: 'Status', width: 96, min: 80},
  {id: 'name', label: 'Name', width: 160, min: 100},
  {id: 'content', label: 'Type / Content', width: 420, min: 300},
  {id: 'hotkey', label: 'HKey.', width: 90, min: 72},
  {id: 'ltc', label: 'LTC Trigger', width: 160, min: 120},
  {id: 'clock', label: 'Clock', width: 176, min: 130},
  {id: 'before', label: 'Before-wait(ms)', width: 152, min: 120},
  {id: 'after', label: 'After-wait(ms)', width: 152, min: 120},
  {id: 'actions', label: 'Actions', width: 208, min: 190}
];

export const DEFAULT_CUE_COLUMN_WIDTHS = Object.fromEntries(CUE_COLUMNS.map(column => [column.id, column.width]));

export function normalizeCueColumnWidths(value) {
  const source = value && typeof value === 'object' ? value : {};
  return Object.fromEntries(CUE_COLUMNS.map(column => {
    const candidate = Number(source[column.id]);
    return [column.id, Number.isFinite(candidate) && candidate >= column.min ? Math.round(candidate) : column.width];
  }));
}

export function cueColumnWidth(id, width) {
  const column = CUE_COLUMNS.find(item => item.id === id);
  if (!column) return null;
  const candidate = Number(width);
  return Number.isFinite(candidate) ? Math.max(column.min, Math.round(candidate)) : column.width;
}

export function totalCueColumnWidth(widths) {
  return CUE_COLUMNS.reduce((total, column) => total + (widths[column.id] ?? column.width), 0);
}
