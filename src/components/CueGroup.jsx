import { CueTable } from './CueTable.jsx';

const compact = 'min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-bold transition hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700';

export function CueGroup({ group, index, lastKey, now, onGroupChange, onGo, onStop, onMove, onRemove, onCueChange, onCueBlur, onCueInsert, onCueMove, onCueRemove }) {
  const modes = [['clockEnabled','Clock'],['timecodeEnabled','TC/LTC'],['loopEnabled','Loop'],['hotkeyEnabled','Hotkey']];
  return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-label={`Cue group ${group.name}`}>
    <div className="flex flex-wrap items-center gap-2 p-3">
      <button className={compact} aria-label={`${group.expanded ? 'Collapse' : 'Expand'} ${group.name}`} onClick={() => onGroupChange({ expanded: !group.expanded })}>{group.expanded ? '−' : '+'}</button>
      <input className="min-h-11 min-w-48 flex-1 rounded-lg border border-slate-300 bg-transparent px-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700" aria-label={`Name for group ${index + 1}`} value={group.name} onChange={e => onGroupChange({ name: e.target.value })} />
      {modes.map(([field,label]) => <label key={field} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold dark:border-slate-700"><input type="checkbox" checked={group[field]} onChange={e => onGroupChange({ [field]: e.target.checked })} /><span className={`h-2 w-2 rounded-full ${group[field] ? 'bg-emerald-500' : 'bg-slate-400'}`} />{label}</label>)}
      <button className={compact} aria-label={`Move ${group.name} up`} onClick={() => onMove(-1)}>↑</button><button className={compact} aria-label={`Move ${group.name} down`} onClick={() => onMove(1)}>↓</button><button className={`${compact} text-rose-600`} aria-label={`Remove ${group.name}`} onClick={onRemove}>×</button>
      <button className={`${compact} border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600`} aria-label={`GO ${group.name}`} onClick={onGo}>GO</button>
      <button className={`${compact} border-rose-500 bg-rose-500 text-white hover:bg-rose-600`} aria-label={`STOP ${group.name}`} onClick={onStop}>STOP</button>
    </div>
    {group.expanded && <CueTable cues={group.cues} now={now} onChange={onCueChange} onBlurCommand={onCueBlur} onInsert={onCueInsert} onMove={onCueMove} onRemove={onCueRemove} />}
    <footer className="flex flex-wrap gap-3 border-t border-slate-200 bg-slate-50 px-4 py-2 font-mono text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400"><span>GROUP {index + 1}</span><span>MODES {modes.filter(([f]) => group[f]).map(([,l]) => l).join(' · ') || 'MANUAL'}</span><span>KEY {lastKey || '—'}</span></footer>
  </section>;
}
