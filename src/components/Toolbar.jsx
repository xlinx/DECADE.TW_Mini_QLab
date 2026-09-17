import {useToggleFeedback} from '../hooks/useToggleFeedback.js';

const button = 'min-h-12 rounded-lg border border-slate-300 bg-white px-4 py-1 text-base font-semibold text-slate-100 shadow-sm transition hover:border-cyan-500 hover:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';
const buttonGroup = "text-body bg-neutral-primary-soft border border-default py-1 hover:bg-neutral-secondary-medium hover:text-heading focus:ring-3 focus:ring-neutral-tertiary-soft font-medium leading-5 text-sm px-3 py-2 focus:outline-none";

export function Toolbar({
                            onGoAll,
                            onStopAll,
                            theme,
                            onThemeChange,
                            panelOpen,
                            onPanelToggle,
                            onAddGroup,
                            onRemoveGroup,
                            onReset,
                            onExport,
                            onImport
                        }) {
    const feedback = useToggleFeedback();
    return <header
        className="border-b border-slate-200 bg-white/90 px-3 py-3 backdrop-blur sm:px-4 dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex w-full flex-wrap items-center gap-2 sm:w-[90%]">
            <img alt="decade.tw" className="filter-none dark:invert" width="120"
                 src="https://www.decade.tw/images/logo/decade_logo.png" onClick={() => {
            }}/>
            <div className="mr-auto sm:mr-3"><p
                className="text-xs font-bold uppercase tracking-[.16em] text-cyan-600 sm:text-sm sm:tracking-[.2em]">DECADE.TW</p>
                <h1 className="text-xl font-black tracking-tight sm:text-2xl">Mini QLab</h1></div>


            <button className={buttonGroup} aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
                    onClick={() => feedback.trigger('theme', () => onThemeChange(theme === 'dark' ? 'light' : 'dark'))}>
                {/*<span className="relative flex size-3">*/}
                {/*    <span*/}
                {/*        data-testid="theme-toggle-dot" onAnimationEnd={feedback.clear} aria-hidden="true"*/}
                {/*        className={`animate-ping mr-2 inline-block h-2 w-2 rounded-full ${theme === 'dark' ? 'bg-indigo-400' : 'bg-amber-400'} ${feedback.bouncing === 'theme' ? 'toggle-bounce' : ''}`}/>*/}
                {/*    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-indigo-400"></span>*/}
                {/*        {theme === 'dark' ? 'Light' : 'Dark'}*/}
                {/*</span>*/}
                <span className="relative size-13">
                  <span className=" absolute mr-8 h-full w-2  animate-ping rounded-full bg-sky-400 opacity-75"></span>
                  <span className=" absolute mr-8 h-full w-2  rounded-full bg-sky-500"></span>
                    &nbsp; &nbsp; &nbsp;{theme === 'dark' ? 'Light' : 'Dark'}
                </span>
            </button>
            <span className="hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700"/>
            <span className="hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700"/>
            <div className="inline-flex rounded-base shadow-xs -space-x-px" role="group">
                <button type="button" className={buttonGroup}>Q-Group</button>
                <button type="button" className={buttonGroup} onClick={onAddGroup}>+</button>
                <button type="button" className={buttonGroup} onClick={onRemoveGroup}>-</button>
            </div>
            {/*<button className={button} onClick={onAddGroup}>Q-Group +</button>*/}
            {/*<button className={button} onClick={onRemoveGroup}>Q-Group −</button>*/}
          <span className="hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700"/>
          <span className="hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700"/>
            <button className={buttonGroup} onClick={onExport}>Export</button>
            <label className={`${buttonGroup} cursor-pointer`}>Import
                <input className="sr-only" type="file" accept="application/json,.json" aria-label="Import cue groups"
                       onChange={event => {
                           onImport(event.target.files?.[0]);
                           event.target.value = '';
                       }}/></label>
          <button className={buttonGroup} onClick={onReset}>Reset</button>
          <span className="hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700"/>
          <span className="hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700"/>
          <button className={buttonGroup} aria-pressed={panelOpen}
                  aria-label={panelOpen ? 'Hide active cues' : 'Show active cues'}
                  onClick={() => feedback.trigger('active-cues', onPanelToggle)}>
              <span data-testid="active-cues-toggle-dot"
                    onAnimationEnd={feedback.clear}
                    aria-hidden="true"
                    className={`mr-2 inline-block h-2 w-2 rounded-full ${panelOpen ? 'bg-cyan-500' : 'bg-slate-400'} ${feedback.bouncing === 'active-cues' ? 'toggle-bounce' : ''}`}/>
            Active cues
          </button>
          <span className="hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700"/>

          <button
              className={`${button} !border-rose-500 !bg-rose-500 !text-slate-950 hover:!bg-rose-600 dark:!text-white`}
              onClick={onStopAll}>STOP-ALL
          </button>
          <button
              className={`${button} !border-emerald-500 !bg-emerald-500 !text-slate-950 hover:!bg-emerald-600 dark:!text-white`}
              onClick={onGoAll}>GO-ALL
          </button>

        </div>
    </header>;
}
