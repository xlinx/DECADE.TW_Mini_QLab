import {useCallback, useEffect, useRef, useState} from 'react';
import {ActiveCuePanel} from './components/ActiveCuePanel.jsx';
import {CueGroup} from './components/CueGroup.jsx';
import {Toolbar} from './components/Toolbar.jsx';
import {CueEngine} from './lib/cueEngine.js';
import {
    createCue,
    createDefaultGroups,
    createGroup,
    hydrateGroups,
    normalizeCommand,
    readStoredGroups,
    readTxStore,
    toPersistedGroups,
    writeStoredGroups,
    writeTxStore
} from './lib/cues.js';
import {createTriggerGate, matchingTriggeredCues} from './lib/triggers.js';
import './styles.css';

const THEME_KEY = 'mini-qlab-theme';
const WS_KEY = 'mini-qlab-ws';
const WS_STYLES = {connected: 'bg-emerald-500', connecting: 'bg-amber-500', error: 'bg-rose-500', off: 'bg-slate-400'};
const LOG_LIMIT = 200;
const SOURCE_STYLES = {
    sequence: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200',
    cron: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
    timecode: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    hotkey: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
};

function logTimestamp(iso) {
    return new Date(iso).toLocaleTimeString('en-GB', {hour12: false}) + '.' + String(new Date(iso).getMilliseconds()).padStart(3, '0');
}

function move(items, index, delta) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return items;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
}

function readFile(file) {
    if (typeof file.text === 'function') return file.text();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

export default function MiniQLab({onEvent, rxJson, initialGroups}) {
    const [groups, setGroups] = useState(() => readStoredGroups(globalThis.localStorage) ?? hydrateGroups(initialGroups ?? createDefaultGroups()));
    const [panelOpen, setPanelOpen] = useState(false);
    const [lastKey, setLastKey] = useState('');
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem(THEME_KEY) || 'light';
        } catch {
            return 'light';
        }
    });
    const [message, setMessage] = useState('');
    const [txJsonCmd, setTxJsonCmd] = useState(() => readTxStore(globalThis.localStorage));
    const [cueLog, setCueLog] = useState([]);
    const [now, setNow] = useState(() => new Date());
    const [wsConfig, setWsConfig] = useState(() => {
        try {
            const raw = localStorage.getItem(WS_KEY);
            if (!raw) return {enabled: false, host: '127.0.0.1', port: '8888'};
            const parsed = JSON.parse(raw);
            return {enabled: Boolean(parsed.enabled), host: String(parsed.host ?? ''), port: String(parsed.port ?? '')};
        } catch {
            return {enabled: false, host: '127.0.0.1', port: '8888'};
        }
    });
    const [wsStatus, setWsStatus] = useState('off');
    const wsRef = useRef(null);
    const groupsRef = useRef(groups);
    const onEventRef = useRef(onEvent);
    const gateRef = useRef(createTriggerGate());
    groupsRef.current = groups;
    onEventRef.current = onEvent;
    const emit = useCallback(event => {
        if (event.type === 'cue:dispatched') {
            const entry = {command: event.command, timestamp: event.timestamp};
            setTxJsonCmd(entry);
            writeTxStore(globalThis.localStorage, entry);
            const entryText = JSON.stringify(entry);
            let delivered = false;
            const socket = wsRef.current;
            if (socket && socket.readyState === 1) {
                try {
                    socket.send(entryText);
                    delivered = true;
                } catch {
                }
            }
            setCueLog(current => [{
                timestamp: event.timestamp,
                source: event.source,
                group: event.group?.name ?? '',
                command: event.command,
                ws: delivered
            }, ...current].slice(0, LOG_LIMIT));
        }
        onEventRef.current?.(event);
    }, []);
    const engineRef = useRef(null);
    if (!engineRef.current) engineRef.current = new CueEngine({
        onStatus: (groupId, cueId, patch) => setGroups(current => current.map(group => group.id === groupId ? {
            ...group,
            cues: group.cues.map(cue => cue.id === cueId ? {...cue, ...patch} : cue)
        } : group)), onEvent: emit
    });
    const dispatchTriggered = useCallback(({group, groupIndex, cue, source}) => {
        engineRef.current.start({group: {...group, loopEnabled: false}, groupIndex, singleCueId: cue.id, source});
    }, []);

    useEffect(() => {
        writeStoredGroups(globalThis.localStorage, groups);
    }, [groups]);
    useEffect(() => {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {
        }
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
    useEffect(() => () => engineRef.current?.dispose(), []);
    useEffect(() => {
        try {
            localStorage.setItem(WS_KEY, JSON.stringify(wsConfig));
        } catch {
        }
        const socket = wsRef.current;
        if (socket) {
            socket.onclose = null;
            socket.onerror = null;
            socket.onopen = null;
            socket.close();
            wsRef.current = null;
        }
        if (!wsConfig.enabled) return undefined;
        const host = wsConfig.host.trim();
        const port = wsConfig.port.trim();
        if (!host || !port) return undefined;
        let next;
        try {
            next = new WebSocket(`ws://${host}:${port}`);
        } catch {
            return undefined;
        }
        wsRef.current = next;
        next.onopen = () => setWsStatus('connected');
        next.onerror = () => setWsStatus('error');
        next.onclose = () => {
            if (wsRef.current === next) {
                wsRef.current = null;
                setWsStatus('off');
            }
        };
        setWsStatus('connecting');
        return () => {
            next.onclose = null;
            next.onerror = null;
            next.onopen = null;
            try {
                next.close();
            } catch {
            }
            if (wsRef.current === next) wsRef.current = null;
        };
    }, [wsConfig]);
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        const handler = event => {
            setLastKey(event.key);
            matchingTriggeredCues(groupsRef.current, {key: event.key}).filter(item => item.source === 'hotkey').forEach(dispatchTriggered);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [dispatchTriggered]);
    const timecode = rxJson?.TC?.string;
    useEffect(() => {
        if (!timecode) return;
        matchingTriggeredCues(groupsRef.current, {timecode}).filter(item => item.source === 'timecode').forEach(item => {
            if (gateRef.current.shouldDispatch('timecode', item.cue.id, item.observedValue)) dispatchTriggered(item);
        });
    }, [timecode, dispatchTriggered]);
    useEffect(() => {
        const timer = setInterval(() => {
            const date = new Date();
            matchingTriggeredCues(groupsRef.current, {date}).filter(item => item.source === 'cron').forEach(item => {
                if (gateRef.current.shouldDispatch('cron', item.cue.id, item.observedValue)) dispatchTriggered(item);
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [dispatchTriggered]);

    const updateGroup = (groupId, patch) => setGroups(current => current.map(group => group.id === groupId ? {...group, ...patch} : group));
    const updateCue = (groupId, cueId, patch) => setGroups(current => current.map(group => group.id === groupId ? {
        ...group,
        cues: group.cues.map(cue => cue.id === cueId ? {...cue, ...patch} : cue)
    } : group));
    const stopGroup = (group, index) => {
        engineRef.current.stop(group.id, index, group.name);
    };

    async function importGroups(file) {
        if (!file) return;
        try {
            setGroups(hydrateGroups(JSON.parse(await readFile(file))));
            setMessage('Import complete.');
        } catch (error) {
            setMessage(`Import failed: ${error.message}`);
        }
    }

    function exportGroups() {
        try {
            const url = URL.createObjectURL(new Blob([JSON.stringify(toPersistedGroups(groups), null, 2)], {type: 'application/json'}));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'mini-qlab-cues.json';
            link.click();
            URL.revokeObjectURL(url);
            setMessage('Export complete.');
        } catch (error) {
            setMessage(`Export failed: ${error.message}`);
        }
    }

    return <div
        className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        <Toolbar onGoAll={() => groupsRef.current.forEach((group, index) => engineRef.current.start({
            group,
            groupIndex: index
        }))} onStopAll={() => {
            engineRef.current.stopAll(groupsRef.current);
        }} theme={theme} onThemeChange={setTheme} panelOpen={panelOpen}
                 onPanelToggle={() => setPanelOpen(open => !open)}
                 onAddGroup={() => setGroups(current => [...current, createGroup({name: `Cue Group ${current.length + 1}`})])}
                 onRemoveGroup={() => setGroups(current => current.slice(0, -1))} onReset={() => {
            engineRef.current.dispose();
            setGroups(createDefaultGroups());
            setMessage('Default configuration restored.');
        }} onExport={exportGroups} onImport={importGroups}/>
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 p-4 lg:flex-row">
            <main className="min-w-0 flex-1 space-y-4">
                <div className="flex items-end justify-between">
                    <div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-600">Workspace</p><h2
                        className="text-2xl font-black">Cue groups</h2></div>
                    <p className="font-mono text-xs text-slate-500">{groups.length} GROUP{groups.length === 1 ? '' : 'S'}</p>
                </div>
                {groups.map((group, index) => <CueGroup key={group.id} group={group} index={index} lastKey={lastKey}
                                                        now={now} onGroupChange={patch => updateGroup(group.id, patch)}
                                                        onGo={() => engineRef.current.start({group, groupIndex: index})}
                                                        onStop={() => stopGroup(group, index)}
                                                        onMove={delta => setGroups(current => move(current, index, delta))}
                                                        onRemove={() => setGroups(current => current.filter(item => item.id !== group.id))}
                                                        onCueChange={(cueId, patch) => updateCue(group.id, cueId, patch)}
                                                        onCueBlur={cueId => {
                                                            const cue = groupsRef.current.find(item => item.id === group.id)?.cues.find(item => item.id === cueId);
                                                            updateCue(group.id, cueId, {command: normalizeCommand(cue?.command)});
                                                        }}
                                                        onCueInsert={cueIndex => setGroups(current => current.map(item => item.id === group.id ? {
                                                            ...item,
                                                            cues: [...item.cues.slice(0, cueIndex + 1), createCue({number: String(cueIndex + 2)}), ...item.cues.slice(cueIndex + 1)]
                                                        } : item))}
                                                        onCueMove={(cueIndex, delta) => setGroups(current => current.map(item => item.id === group.id ? {
                                                            ...item,
                                                            cues: move(item.cues, cueIndex, delta)
                                                        } : item))}
                                                        onCueRemove={cueId => setGroups(current => current.map(item => item.id === group.id ? {
                                                            ...item,
                                                            cues: item.cues.filter(cue => cue.id !== cueId)
                                                        } : item))}/>)}
                {!groups.length && <div
                    className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
                    <p className="font-bold">No cue groups</p><p className="text-sm text-slate-500">Use Q-Group + to
                    start a sequence.</p></div>}
                <section aria-label="Cue log"
                         className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <header
                        className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                        <h2 className="font-black">Cue log</h2>
                        <span className="flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold dark:border-slate-700">
                            <input type="checkbox" aria-label="Enable WebSocket" checked={wsConfig.enabled}
                                   onChange={e => setWsConfig({...wsConfig, enabled: e.target.checked})} />
                            <span className="hidden md:inline">WS</span>
                        </span>
                        <input className="w-32 rounded-lg border border-slate-300 bg-white px-2 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                               aria-label="WebSocket host" placeholder="host" value={wsConfig.host} disabled={!wsConfig.enabled}
                               onChange={e => setWsConfig({...wsConfig, host: e.target.value})} />
                        <input className="w-16 rounded-lg border border-slate-300 bg-white px-2 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                               aria-label="WebSocket port" placeholder="port" inputMode="numeric" value={wsConfig.port}
                               disabled={!wsConfig.enabled}
                               onChange={e => setWsConfig({...wsConfig, port: e.target.value.replace(/[^0-9]/g, '')})} />
                        <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-white ${WS_STYLES[wsStatus] ?? WS_STYLES.off}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />{wsStatus === 'connected' ? 'Connected' : wsStatus === 'connecting' ? 'Connecting' : wsStatus === 'error' ? 'Error' : 'Off'}
                        </span>
                        <p className="ml-auto font-mono text-xs text-slate-500">{cueLog.length} DISPATCHED</p>
                    </header>
                    {cueLog.length ?
                        <ul className="max-h-80 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">{cueLog.map((entry, index) =>
                            <li key={`${entry.timestamp}-${index}`}
                                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 font-mono text-sm">
                                <span
                                    className="text-slate-500 dark:text-slate-400">{logTimestamp(entry.timestamp)}</span><span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${SOURCE_STYLES[entry.source] ?? 'bg-slate-200 text-slate-700'}`}>{entry.source}</span><span
                                className="text-slate-500 dark:text-slate-400">{entry.group}</span><span
                                className="min-w-0 flex-1 truncate text-slate-900 dark:text-slate-100"
                                title={entry.command}>{entry.command || '—'}</span><span
                                className={`rounded px-1.5 py-0.5 text-xs font-bold ${entry.ws ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{entry.ws ? 'WS' : '—'}</span></li>)}</ul> :
                        <p className="p-6 text-center text-sm text-slate-500">No dispatched cues yet</p>}
                </section>
            </main>
            <ActiveCuePanel groups={groups} open={panelOpen}/></div>
        <div className="sr-only" aria-label="TX_JSON_CMD">{txJsonCmd ? JSON.stringify(txJsonCmd) : ''}</div>
        <div role="status" aria-live="polite"
             className="fixed bottom-4 right-4 max-w-sm rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl empty:hidden">{message}</div>
    </div>;
}
