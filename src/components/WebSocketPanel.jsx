const STATUS_STYLES = {connected: 'bg-emerald-500', connecting: 'bg-amber-500', error: 'bg-rose-500', off: 'bg-slate-400'};
const EVENT_STYLES = {
  connected: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  connecting: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  disconnected: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  sent: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200',
  received: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
  error: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
};

function timestamp(iso) {
  const date = new Date(iso);
  return date.toLocaleTimeString('en-GB', {hour12: false}) + '.' + String(date.getMilliseconds()).padStart(3, '0');
}

export function WebSocketPanel({config, status, entries, collapsed, onCollapsedChange, onConfigChange}) {
  const feedback = useToggleFeedback();
  return <section aria-label="WebSocket panel" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <header className={`flex flex-wrap items-center gap-3 px-4 py-3 ${collapsed ? '' : 'border-b border-slate-200 dark:border-slate-800'}`}>
      <button className="min-h-10 min-w-10 rounded-lg border border-slate-300 text-base font-bold dark:border-slate-700" aria-label={collapsed ? 'Expand WebSocket panel' : 'Collapse WebSocket panel'} aria-expanded={!collapsed} onClick={() => feedback.trigger('panel', () => onCollapsedChange(!collapsed))}><span data-testid="websocket-collapse-icon" onAnimationEnd={feedback.clear} className={`inline-block ${feedback.bouncing === 'panel' ? 'toggle-bounce' : ''}`}>{collapsed ? '+' : '−'}</span></button>
      <div><p
          className="text-sm font-bold uppercase tracking-[.2em] text-cyan-600 dark:text-cyan-400">Socket</p><h2
          className="text-xl font-black">Websocket</h2></div>

      <label className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-base font-semibold dark:border-slate-700"><input type="checkbox" aria-label="Enable WebSocket" checked={config.enabled} onChange={event => feedback.trigger('enabled', () => onConfigChange({...config, enabled: event.target.checked}))} /><span data-testid="websocket-enable-dot" onAnimationEnd={feedback.clear} className={`h-2 w-2 rounded-full ${config.enabled ? 'bg-emerald-500' : 'bg-slate-400'} ${feedback.bouncing === 'enabled' ? 'toggle-bounce' : ''}`} /><span>Enable</span></label>
      <input className="w-36 rounded-lg border border-slate-300 bg-white px-2 py-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" aria-label="WebSocket host" placeholder="host" value={config.host} disabled={!config.enabled} onChange={event => onConfigChange({...config, host: event.target.value})} />
      <input className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" aria-label="WebSocket port" placeholder="port" inputMode="numeric" value={config.port} disabled={!config.enabled} onChange={event => onConfigChange({...config, port: event.target.value.replace(/[^0-9]/g, '')})} />
      <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-bold text-white ${STATUS_STYLES[status] ?? STATUS_STYLES.off}`}><span className="h-1.5 w-1.5 rounded-full bg-white" />{status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting' : status === 'error' ? 'Error' : 'Off'}</span>
      <p className="ml-auto font-mono text-sm text-slate-500">{entries.length} EVENT{entries.length === 1 ? '' : 'S'}</p>
    </header>
    {!collapsed && (entries.length ? <ul aria-label="WebSocket event log" className="max-h-80 divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800">{entries.map((entry, index) => <li key={`${entry.timestamp}-${index}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 font-mono text-base"><span className="text-slate-500 dark:text-slate-400">{timestamp(entry.timestamp)}</span><span className={`rounded-full px-2 py-0.5 text-sm font-bold ${EVENT_STYLES[entry.type] ?? EVENT_STYLES.disconnected}`}>{entry.type}</span><span className="min-w-0 flex-1 truncate" title={entry.detail}>{entry.detail}</span></li>)}</ul> : <p className="p-6 text-center text-base text-slate-500">No WebSocket events yet</p>)}
  </section>;
}
import {useToggleFeedback} from '../hooks/useToggleFeedback.js';
