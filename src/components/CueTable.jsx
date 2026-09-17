import {useEffect, useRef, useState} from 'react';
import {CUE_COLUMNS, DEFAULT_CUE_COLUMN_WIDTHS, totalCueColumnWidth} from '../lib/cueColumns.js';
import { nextCronRun } from '../lib/triggers.js';

const input = 'min-h-11 w-full rounded-md border border-slate-300 bg-white px-2 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const action = 'min-h-8 min-w-8 rounded-md border border-slate-300 px-1 text-sm font-bold hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-60 disabled:hover:border-slate-200 dark:border-slate-700 dark:disabled:border-slate-800 dark:disabled:bg-slate-800 dark:disabled:text-slate-500';

function phaseValue(cue, field) {
  if (cue.status === 'DONE') return 100;
  if (cue.status === 'LIVE') return cue[field] ?? 0;
  return 0;
}

function clockMeta(cue, now) {
  if (!cue.cron?.trim()) return '—';
  const next = nextCronRun(cue.cron, now);
  if (!next) return 'invalid cron';
  const pad = value => String(value).padStart(2, '0');
  return `next ${pad(next.getHours())}:${pad(next.getMinutes())}:${pad(next.getSeconds())}`;
}

const scheduleOptions = [
  ['every-second', 'Every second', '* * * * * *'],
  ['every-minute', 'Every minute', '0 * * * * *'],
  ['every-hour', 'Every hour', '0 0 * * * *'],
  ['interval', 'Every custom interval', null],
  ['daily', 'Every day at a time', null],
  ['weekly', 'Every week on a day', null],
  ['custom', 'Advanced cron expression', null]
];

const cronFieldLabels = ['seconds', 'minutes', 'hours', 'day of month', 'month', 'day of week'];

function toCronFields(expression) {
  const fields = String(expression ?? '').trim().split(/\s+/).filter(Boolean);
  const sixFields = fields.length === 5 ? ['0', ...fields] : fields;
  return Array.from({length: 6}, (_, index) => sixFields[index] ?? '*');
}

function cronForSchedule(kind, time, weekday, custom, intervalAmount, intervalUnit) {
  if (kind === 'custom') return custom;
  if (kind === 'interval') {
    const amount = Math.max(1, Number(intervalAmount) || 1);
    if (intervalUnit === 'minutes') return `0 */${Math.min(amount, 59)} * * * *`;
    if (intervalUnit === 'hours') return `0 0 */${Math.min(amount, 23)} * * *`;
    if (intervalUnit === 'days') return `0 0 0 */${Math.min(amount, 31)} * *`;
    return `*/${Math.min(amount, 59)} * * * * *`;
  }
  const [hour, minute] = time.split(':').map(Number);
  if (kind === 'daily' || kind === 'weekly') {
    const day = kind === 'weekly' ? weekday : '*';
    return `0 ${minute || 0} ${hour || 0} * * ${day}`;
  }
  return scheduleOptions.find(([value]) => value === kind)?.[2] ?? '';
}

function cronPreview(expression) {
  const value = expression.trim();
  if (!value) return {valid: false, message: 'Enter a cron expression.'};
  const next = nextCronRun(value, new Date());
  if (!next) return {valid: false, message: 'Invalid cron expression.'};
  const pad = part => String(part).padStart(2, '0');
  return {valid: true, message: `Valid cron expression · Next run: ${next.toLocaleDateString()} ${pad(next.getHours())}:${pad(next.getMinutes())}:${pad(next.getSeconds())}`};
}

function ClockScheduleDialog({cue, onApply, onClose}) {
  const [kind, setKind] = useState('custom');
  const [time, setTime] = useState('12:00');
  const [weekday, setWeekday] = useState('1');
  const [intervalAmount, setIntervalAmount] = useState('1');
  const [intervalUnit, setIntervalUnit] = useState('seconds');
  const [custom, setCustom] = useState(cue.cron || '* * * * * *');
  const [fieldValues, setFieldValues] = useState(() => toCronFields(cue.cron || '* * * * * *'));
  const previewExpression = cronForSchedule(kind, time, weekday, custom, intervalAmount, intervalUnit);
  const preview = cronPreview(previewExpression);
  useEffect(() => {
    if (kind !== 'custom') setFieldValues(toCronFields(previewExpression));
  }, [kind, previewExpression]);
  const updateCronField = (index, value) => {
    const next = fieldValues.map((field, fieldIndex) => fieldIndex === index ? value : field);
    setFieldValues(next); setCustom(next.join(' ')); setKind('custom');
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
    <div role="dialog" aria-modal="true" aria-labelledby="clock-schedule-title" className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <h2 id="clock-schedule-title" className="text-lg font-black">Clock schedule</h2>
      <p className="mt-1 text-sm text-slate-500">Choose a friendly schedule or enter cron directly.</p>
      <label className="mt-4 block text-sm font-bold">Schedule frequency<select className={`${input} mt-1`} aria-label="Schedule frequency" value={kind} onChange={event => setKind(event.target.value)}>{scheduleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      {(kind === 'daily' || kind === 'weekly') && <label className="mt-3 block text-sm font-bold">Time<input className={`${input} mt-1`} type="time" value={time} onChange={event => setTime(event.target.value)}/></label>}
      {kind === 'weekly' && <label className="mt-3 block text-sm font-bold">Day<select className={`${input} mt-1`} value={weekday} onChange={event => setWeekday(event.target.value)}><option value="0">Sunday</option><option value="1">Monday</option><option value="2">Tuesday</option><option value="3">Wednesday</option><option value="4">Thursday</option><option value="5">Friday</option><option value="6">Saturday</option></select></label>}
      {kind === 'interval' && <div className="mt-3 grid grid-cols-2 gap-2"><label className="text-sm font-bold">Interval amount<input className={`${input} mt-1`} type="number" min="1" aria-label="Interval amount" value={intervalAmount} onChange={event => setIntervalAmount(event.target.value)}/></label><label className="text-sm font-bold">Interval unit<select className={`${input} mt-1`} aria-label="Interval unit" value={intervalUnit} onChange={event => setIntervalUnit(event.target.value)}><option value="seconds">Seconds</option><option value="minutes">Minutes</option><option value="hours">Hours</option><option value="days">Days</option></select></label></div>}
      <label className="mt-3 block text-sm font-bold">Cron expression<input className={`${input} mt-1 font-mono`} aria-label="Custom cron expression" value={previewExpression} onChange={event => { setCustom(event.target.value); setFieldValues(toCronFields(event.target.value)); setKind('custom'); }}/></label>
      <fieldset className="mt-3"><legend className="text-sm font-bold">Full cron fields</legend><p className="mt-1 text-xs text-slate-500">Use values, ranges (`1-5`), lists (`1,5`), or steps (`*/10`).</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{cronFieldLabels.map((label, index) => <label key={label} className="text-xs font-bold capitalize">{label}<input className={`${input} mt-1 font-mono`} aria-label={`Cron ${label}`} value={fieldValues[index]} onChange={event => updateCronField(index, event.target.value)}/></label>)}</div></fieldset>
      <p role="status" aria-live="polite" className={`mt-3 text-sm font-semibold ${preview.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{preview.message}</p>
      <div className="mt-5 flex justify-end gap-2"><button className={action} onClick={onClose}>Cancel</button><button className={`${action} border-cyan-500 bg-cyan-500 text-white`} onClick={() => { onApply(previewExpression.trim()); onClose(); }}>Apply schedule</button></div>
    </div>
  </div>;
}

export function CueTable({ cues, groups, now, enabledModes = {}, columnWidths = DEFAULT_CUE_COLUMN_WIDTHS, onColumnResize = () => {}, onColumnReset = () => {}, onChange, onBlurCommand, onInsert, onMove, onRemove, onDuplicate = () => {}, audioMediaByCueId = {}, onAudioFileSelect = () => {}, onAudioClear = () => {} }) {
  const [scheduleCue, setScheduleCue] = useState(null);
  const columns = CUE_COLUMNS.filter(column => (column.id !== 'hotkey' || enabledModes.hotkey) && (column.id !== 'ltc' || enabledModes.timecode) && (column.id !== 'clock' || enabledModes.clock));
  const tableMinWidth = totalCueColumnWidth(Object.fromEntries(columns.map(column => [column.id, columnWidths[column.id] ?? column.width])));
  const configuredContentWidth = columnWidths.content ?? CUE_COLUMNS.find(column => column.id === 'content').width;
  const otherColumnWidth = tableMinWidth - configuredContentWidth;
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const contentWidth = Math.max(CUE_COLUMNS.find(column => column.id === 'content').min, containerWidth ? containerWidth - otherColumnWidth : configuredContentWidth);
  const resizeCleanup = useRef(null);
  useEffect(() => () => resizeCleanup.current?.(), []);
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const beginResize = (event, column) => {
    event.preventDefault(); event.stopPropagation(); resizeCleanup.current?.();
    const startX = event.clientX;
    const startWidth = columnWidths[column.id] ?? column.width;
    const move = next => onColumnResize(column.id, startWidth + next.clientX - startX);
    const finish = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', finish); resizeCleanup.current = null; };
    resizeCleanup.current = finish;
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', finish);
  };
  const resizeKey = (event, column) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') onColumnReset(column.id);
    else onColumnResize(column.id, (columnWidths[column.id] ?? column.width) + (event.key === 'ArrowRight' ? 10 : -10));
  };
  return <div ref={containerRef} className="overflow-x-auto border-t border-slate-200 dark:border-slate-800">
    <table className="table-fixed text-left text-base" style={{width: '100%', minWidth: '100%'}}>
      <colgroup>{columns.map(column => <col key={column.id} data-column={column.id} style={{width: column.id === 'content' ? contentWidth : (columnWidths[column.id] ?? column.width)}} />)}</colgroup>
      <thead className="bg-slate-100 text-sm uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400"><tr>{columns.map(column => <th key={column.id} className="relative select-none px-3 py-3 pr-5">{column.label}<span role="separator" tabIndex={0} aria-label={`Resize ${column.label} column`} aria-orientation="vertical" aria-valuemin={column.min} aria-valuemax={2000} aria-valuenow={columnWidths[column.id] ?? column.width} className="absolute inset-y-0 right-0 z-10 w-3 cursor-col-resize touch-none border-r border-slate-300 hover:border-cyan-500 focus:border-cyan-500 focus:outline-none dark:border-slate-700" onPointerDown={event => beginResize(event, column)} onDoubleClick={() => onColumnReset(column.id)} onKeyDown={event => resizeKey(event, column)} /></th>)}</tr></thead>
      <tbody>{cues.map((cue, index) => <tr key={cue.id} className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
        <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-sm font-bold ${cue.status === 'LIVE' ? 'bg-amber-100 text-amber-800' : cue.status === 'DONE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>{cue.status}</span></td>
        <td className="px-2"><div className="flex items-center gap-1"><span aria-label={`${cue.type === 'audio' ? 'Audio' : cue.type === 'trigger' ? 'Trigger' : 'Command'} cue`} className="text-sm">{cue.type === 'audio' ? '♪' : cue.type === 'trigger' ? '↪' : '⌘'}</span><input className={input} aria-label={`Name for cue ${index + 1}`} value={cue.name} onChange={e => onChange(cue.id, { name: e.target.value })} /></div></td>
        <td className="px-2"><div className={`grid gap-2 ${cue.type === 'trigger' ? 'grid-cols-4' : 'grid-cols-[minmax(7rem,.7fr)_minmax(10rem,1.3fr)]'}`}><select className={input} aria-label={`Type for cue ${index + 1}`} value={cue.type} onChange={e => onChange(cue.id, {type: e.target.value, audioAction: e.target.value === 'audio' ? 'play' : cue.audioAction, targetGroupName: '', targetCueName: ''})}><option value="command">Command</option><option value="trigger">Trigger cue</option><option value="audio">Audio</option></select>{cue.type === 'trigger' ? <><select className={input} aria-label={`Target group for cue ${index + 1}`} value={cue.targetGroupName} onChange={e => onChange(cue.id, {targetGroupName: e.target.value, targetCueName: ''})}><option value="">Target group…</option>{groups.map(group => <option key={group.id} value={group.name}>{group.name}</option>)}</select><select className={input} aria-label={`Target cue for cue ${index + 1}`} value={cue.targetCueName} onChange={e => onChange(cue.id, {targetCueName: e.target.value})}><option value="">Target cue…</option>{groups.find(group => group.name === cue.targetGroupName)?.cues.map(target => <option key={target.id} value={target.name}>{target.name}</option>)}</select><select className={input} aria-label={`Trigger action for cue ${index + 1}`} value={cue.targetAction} onChange={e => onChange(cue.id, {targetAction: e.target.value})}><option value="start">Start</option><option value="pause">Pause</option><option value="stop">Stop</option></select></> : cue.type === 'audio' ? <div className="flex min-w-0 items-center gap-1"><select className={`${input} !w-28 shrink-0`} aria-label={`Audio action for cue ${index + 1}`} value={cue.audioAction} onChange={e => onChange(cue.id, {audioAction: e.target.value})}><option value="play">Play</option><option value="pause">Pause</option><option value="stop">Stop</option></select><label className={`${action} shrink-0 cursor-pointer`}><span className="sr-only">Audio track for cue {index + 1}</span>File<input className="sr-only" type="file" accept="audio/mpeg,audio/wav,.mp3,.wav" aria-label={`Audio track for cue ${index + 1}`} onChange={event => { onAudioFileSelect(cue.id, event.target.files?.[0]); event.target.value = ''; }}/></label>{audioMediaByCueId[cue.id] && <button className={`${action} shrink-0`} aria-label={`Clear audio track for cue ${index + 1}`} onClick={() => onAudioClear(cue.id)}>×</button>}<span className="min-w-0 truncate text-sm">{audioMediaByCueId[cue.id]?.name || ''}</span></div> : <input className={input} aria-label={`Command for cue ${index + 1}`} value={cue.command} onChange={e => onChange(cue.id, { command: e.target.value })} onBlur={() => onBlurCommand(cue.id)} />}</div></td>
        {enabledModes.hotkey && <td className="px-2"><input className={input} maxLength={1} aria-label={`Hotkey for cue ${index + 1}`} value={cue.hotkey} onChange={e => onChange(cue.id, { hotkey: e.target.value.slice(0, 1) })} /></td>}
        {enabledModes.timecode && <td className="px-2"><input className={input} aria-label={`LTC trigger for cue ${index + 1}`} placeholder="01:00:00:00" value={cue.ltcTrigger} onChange={e => onChange(cue.id, { ltcTrigger: e.target.value })} /></td>}
        {enabledModes.clock && <td className="px-2"><div className="flex flex-col gap-1"><input className={input} aria-label={`Cron for cue ${index + 1}`} placeholder="* * * * * *" value={cue.cron} readOnly onClick={() => setScheduleCue(cue)} /><span className="px-1 font-mono text-sm text-slate-500 dark:text-slate-400">{clockMeta(cue, now)}</span></div></td>}
        <td className="px-2"><input className={input} type="number" min="0" aria-label={`Before-wait for cue ${index + 1}`} value={cue.beforeWaitMs} onChange={e => onChange(cue.id, { beforeWaitMs: Math.max(0, Number(e.target.value) || 0) })} /><div className="mt-1 h-[3px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-label={`Before-wait progress for cue ${index + 1}`}><div className="h-full bg-violet-500 transition-[width]" style={{ width: `${phaseValue(cue, 'beforeProgress')}%` }} /></div><span className="sr-only">{phaseValue(cue, 'beforeProgress')}% before-wait</span></td>
        <td className="px-2"><input className={input} type="number" min="0" aria-label={`After-wait for cue ${index + 1}`} value={cue.afterWaitMs} onChange={e => onChange(cue.id, { afterWaitMs: Math.max(0, Number(e.target.value) || 0) })} /><div className="mt-1 h-[3px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-label={`After-wait progress for cue ${index + 1}`}><div className="h-full bg-cyan-500 transition-[width]" style={{ width: `${phaseValue(cue, 'afterProgress')}%` }} /></div><span className="sr-only">{phaseValue(cue, 'afterProgress')}% after-wait</span></td>
        <td className="px-2"><div className="flex flex-wrap gap-1"><button className={action} aria-label={`Insert after cue ${index + 1}`} onClick={() => onInsert(index)}>+</button><button className={action} aria-label={`Duplicate cue ${index + 1}`} onClick={() => onDuplicate(index)}>⧉</button><button className={action} aria-label={`Move cue ${index + 1} up`} disabled={index === 0} onClick={() => onMove(index, -1)}>↑</button><button className={action} aria-label={`Move cue ${index + 1} down`} disabled={index === cues.length - 1} onClick={() => onMove(index, 1)}>↓</button><button className={`${action} text-rose-600`} aria-label={`Delete cue ${index + 1}`} onClick={() => onRemove(cue.id)}>×</button></div></td>
      </tr>)}</tbody>
    </table>
    {scheduleCue && <ClockScheduleDialog cue={scheduleCue} onApply={cron => { onChange(scheduleCue.id, {cron}); setScheduleCue(null); }} onClose={() => setScheduleCue(null)} />}
  </div>;
}
