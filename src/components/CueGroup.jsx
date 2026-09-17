import {useEffect, useState} from 'react';
import {CueTable} from './CueTable.jsx';
import {MobileCueCards} from './MobileCueCards.jsx';
import {useToggleFeedback} from '../hooks/useToggleFeedback.js';

const compact = 'min-h-12 rounded-lg border border-slate-300 px-4 text-base font-bold transition hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700';

function useMobileLayout() {
    const [mobile, setMobile] = useState(() => globalThis.innerWidth < 640);
    useEffect(() => {
        const update = () => setMobile(globalThis.innerWidth < 640);
        globalThis.addEventListener('resize', update);
        return () => globalThis.removeEventListener('resize', update);
    }, []);
    return mobile;
}

export function CueGroup({
                             group,
                             groups,
                             index,
                             lastKey,
                             now,
                             columnWidths,
                             onColumnResize,
                             onColumnReset,
                             onGroupChange,
                             onGo,
                             onStop,
                             onMove,
                             onRemove,
                             onCueChange,
                             onCueBlur,
                             onCueInsert,
                             onCueMove,
                             onCueRemove,
                             onCueDuplicate,
                             audioMediaByCueId,
                             onAudioFileSelect,
                             onAudioClear
                         }) {
    const modes = [['clockEnabled', 'Clock'], ['timecodeEnabled', 'TC/LTC'], ['loopEnabled', 'Loop'], ['hotkeyEnabled', 'Hotkey']];
    const mobile = useMobileLayout();
    const feedback = useToggleFeedback();
    return <section
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        style={group.backgroundColor ? {backgroundColor: `${group.backgroundColor}18`} : undefined}
        aria-label={`Cue group ${group.name}`}>
        <div className="flex flex-wrap items-center gap-2 p-3">
            <button className={compact} aria-label={`${group.expanded ? 'Collapse' : 'Expand'} ${group.name}`}
                    onClick={() => onGroupChange({expanded: !group.expanded})}>{group.expanded ? '−' : '+'}</button>
          <div><p
              className="text-sm font-bold uppercase tracking-[.2em] text-cyan-600 dark:text-cyan-400">Cue</p><h2
              className="text-xl font-black">Group</h2></div>
            <input
                className="min-h-12 min-w-48 flex-1 rounded-lg border border-slate-300 bg-transparent px-3 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700"
                aria-label={`Name for group ${index + 1}`} value={group.name}
                onChange={e => onGroupChange({name: e.target.value})}/>
            <label className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-200 px-3 text-base font-semibold dark:border-slate-700">
                <span></span>
                <input className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" type="color"
                       aria-label={`Background color for ${group.name}`} value={group.backgroundColor || '#ffffff'}
                       onChange={event => feedback.trigger('color', () => onGroupChange({backgroundColor: event.target.value}))}/>
                {/*<span data-testid={`color-swatch-${group.id}`} onAnimationEnd={feedback.clear} aria-hidden="true" className={`h-3 w-3 rounded-full border border-slate-400 ${feedback.bouncing === 'color' ? 'toggle-bounce' : ''}`}*/}
                {/*      style={{backgroundColor: group.backgroundColor || '#ffffff'}} />*/}
            </label>
            <button className={compact} aria-label={`Reset background color for ${group.name}`}
                    disabled={!group.backgroundColor} onClick={() => onGroupChange({backgroundColor: ''})}>↺</button>
            {modes.map(([field, label]) => <label key={field}
                                                  className="flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-base font-semibold dark:border-slate-700"><input
                type="checkbox" checked={group[field]} onChange={e => feedback.trigger(field, () => onGroupChange({[field]: e.target.checked}))}/><span onAnimationEnd={feedback.clear}
                className={`h-2 w-2 rounded-full ${group[field] ? 'bg-emerald-500' : 'bg-slate-400'} ${feedback.bouncing === field ? 'toggle-bounce' : ''}`}/>{label}
            </label>)}
            <button className={compact} aria-label={`Move ${group.name} up`} onClick={() => onMove(-1)}>↑</button>
            <button className={compact} aria-label={`Move ${group.name} down`} onClick={() => onMove(1)}>↓</button>
            <button className={`${compact} text-rose-600`} aria-label={`Remove ${group.name}`} onClick={onRemove}>×
            </button>
            <button className={`${compact} border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600`}
                    aria-label={`GO ${group.name}`} onClick={onGo}>GO
            </button>
            <button className={`${compact} border-rose-500 bg-rose-500 text-white hover:bg-rose-600`}
                    aria-label={`STOP ${group.name}`} onClick={onStop}>STOP
            </button>
        </div>
        {group.expanded && (mobile ? <MobileCueCards cues={group.cues} groups={groups} now={now}
                                     onChange={onCueChange} onBlurCommand={onCueBlur} onInsert={onCueInsert}
                                     onMove={onCueMove} onRemove={onCueRemove} audioMediaByCueId={audioMediaByCueId} onAudioFileSelect={onAudioFileSelect} onAudioClear={onAudioClear}/> : <CueTable cues={group.cues} groups={groups} now={now} columnWidths={columnWidths}
                                     enabledModes={{clock: group.clockEnabled, timecode: group.timecodeEnabled, hotkey: group.hotkeyEnabled}}
                                     onColumnResize={onColumnResize} onColumnReset={onColumnReset}
                                     onChange={onCueChange} onBlurCommand={onCueBlur} onInsert={onCueInsert} audioMediaByCueId={audioMediaByCueId} onAudioFileSelect={onAudioFileSelect} onAudioClear={onAudioClear}
                                     onMove={onCueMove} onRemove={onCueRemove} onDuplicate={onCueDuplicate}/>)}
        <footer
            className="flex flex-wrap gap-3 border-t border-slate-200 bg-slate-50 px-4 py-2 font-mono text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
            <span>GROUP {index + 1}</span><span>MODES {modes.filter(([f]) => group[f]).map(([, l]) => l).join(' · ') || 'MANUAL'}</span><span>KEY {lastKey || '—'}</span>
        </footer>
    </section>;
}
