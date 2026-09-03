const input = 'min-h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const action = 'min-h-10 min-w-10 rounded-md border border-slate-300 px-2 font-bold hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700';

export function CueTable({ cues, onChange, onBlurCommand, onInsert, onMove, onRemove }) {
  return <div className="overflow-x-auto border-t border-slate-200 dark:border-slate-800">
    <table className="min-w-[1180px] table-auto text-left text-sm">
      <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400"><tr>{['Status','No.','HKey.','Command','LTC Trigger','Clock','Wait(ms)','Progress','Actions'].map(label => <th key={label} className="px-3 py-3">{label}</th>)}</tr></thead>
      <tbody>{cues.map((cue, index) => <tr key={cue.id} className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
        <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${cue.status === 'LIVE' ? 'bg-amber-100 text-amber-800' : cue.status === 'DONE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>{cue.status}</span></td>
        <td className="w-20 px-2"><input className={input} aria-label={`Number for cue ${index + 1}`} value={cue.number} onChange={e => onChange(cue.id, { number: e.target.value })} /></td>
        <td className="w-20 px-2"><input className={input} maxLength={1} aria-label={`Hotkey for cue ${index + 1}`} value={cue.hotkey} onChange={e => onChange(cue.id, { hotkey: e.target.value.slice(0, 1) })} /></td>
        <td className="min-w-56 px-2"><input className={input} aria-label={`Command for cue ${index + 1}`} value={cue.command} onChange={e => onChange(cue.id, { command: e.target.value })} onBlur={() => onBlurCommand(cue.id)} /></td>
        <td className="w-40 px-2"><input className={input} aria-label={`LTC trigger for cue ${index + 1}`} placeholder="01:00:00:00" value={cue.ltcTrigger} onChange={e => onChange(cue.id, { ltcTrigger: e.target.value })} /></td>
        <td className="w-44 px-2"><input className={input} aria-label={`Cron for cue ${index + 1}`} placeholder="* * * * * *" value={cue.cron} onChange={e => onChange(cue.id, { cron: e.target.value })} /></td>
        <td className="w-28 px-2"><input className={input} type="number" min="0" aria-label={`Wait for cue ${index + 1}`} value={cue.waitMs} onChange={e => onChange(cue.id, { waitMs: Math.max(0, Number(e.target.value) || 0) })} /></td>
        <td className="w-36 px-3"><div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full bg-cyan-500 transition-[width]" style={{ width: `${cue.progress}%` }} /></div><span className="font-mono text-xs">{cue.progress}%</span></td>
        <td className="whitespace-nowrap px-2"><div className="flex gap-1"><button className={action} aria-label={`Insert after cue ${index + 1}`} onClick={() => onInsert(index)}>+</button><button className={action} aria-label={`Move cue ${index + 1} up`} onClick={() => onMove(index, -1)}>↑</button><button className={action} aria-label={`Move cue ${index + 1} down`} onClick={() => onMove(index, 1)}>↓</button><button className={`${action} text-rose-600`} aria-label={`Delete cue ${index + 1}`} onClick={() => onRemove(cue.id)}>×</button></div></td>
      </tr>)}</tbody>
    </table>
  </div>;
}
