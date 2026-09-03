const button = 'min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-500 hover:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';

export function Toolbar({ onGoAll, onStopAll, theme, onThemeChange, panelOpen, onPanelToggle, onAddGroup, onRemoveGroup, onReset, onExport, onImport }) {
  return <header className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
    <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2">
      <div className="mr-3"><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-600">Show control</p><h1 className="text-xl font-black tracking-tight">Mini QLab</h1></div>
      <button className={`${button} border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white`} onClick={onGoAll}>GO-ALL</button>
      <button className={`${button} border-rose-500 bg-rose-500 text-white hover:bg-rose-600 hover:text-white`} onClick={onStopAll}>STOP-ALL</button>
      <button className={button} aria-pressed={panelOpen} aria-label={panelOpen ? 'Hide active cues' : 'Show active cues'} onClick={onPanelToggle}>Active cues</button>
      <button className={button} aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'} onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
      <span className="hidden h-8 w-px bg-slate-200 md:block dark:bg-slate-700" />
      <button className={button} onClick={onAddGroup}>Q-Group +</button><button className={button} onClick={onRemoveGroup}>Q-Group −</button>
      <button className={button} onClick={onReset}>Reset</button><button className={button} onClick={onExport}>Export</button>
      <label className={`${button} cursor-pointer`}>Import<input className="sr-only" type="file" accept="application/json,.json" aria-label="Import cue groups" onChange={event => { onImport(event.target.files?.[0]); event.target.value = ''; }} /></label>
    </div>
  </header>;
}
