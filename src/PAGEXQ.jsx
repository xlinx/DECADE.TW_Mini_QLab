import {useCallback, useEffect, useRef, useState} from 'react';
import {ActiveCuePanel} from './components/ActiveCuePanel.jsx';
import {CueGroup} from './components/CueGroup.jsx';
import {Toolbar} from './components/Toolbar.jsx';
import {TimelineEditor} from './components/TimelineEditor.jsx';
import {WebSocketPanel} from './components/WebSocketPanel.jsx';
import {CueEngine} from './lib/cueEngine.js';
import {createLocalAudioTracks} from './lib/localAudioTracks.js';
import {DEFAULT_CUE_COLUMN_WIDTHS, cueColumnWidth, normalizeCueColumnWidths} from './lib/cueColumns.js';
import {
    createCue,
    createDefaultGroups,
    createGroup,
    hydrateGroups,
    normalizedName,
    normalizeCommand,
    readStoredGroups,
    readTxStore,
    toPersistedGroups,
    writeStoredGroups,
    writeTxStore
} from './lib/cues.js';
import {createTriggerGate, matchingTriggeredCues} from './lib/triggers.js';
import {parseWebSocketCueControl} from './lib/websocketCueControl.js';
import './styles.css';

const THEME_KEY = 'mini-qlab-theme';
const WS_KEY = 'mini-qlab-ws';
const TIMELINE_COLLAPSED_KEY = 'mini-qlab-timeline-collapsed';
const WS_PANEL_COLLAPSED_KEY = 'mini-qlab-ws-panel-collapsed';
const CUE_COLUMN_WIDTHS_KEY = 'mini-qlab-cue-column-widths';
const LOG_LIMIT = 200;
const SOURCE_STYLES = {
    sequence: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200',
    cron: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
    timecode: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    hotkey: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
    warning: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
};

function logTimestamp(iso) {
    return new Date(iso).toLocaleTimeString('en-GB', {hour12: false}) + '.' + String(new Date(iso).getMilliseconds()).padStart(3, '0');
}

function readCollapsed(key) {
    try { return localStorage.getItem(key) === 'true'; } catch { return false; }
}

function readCueColumnWidths() {
    try { return normalizeCueColumnWidths(JSON.parse(localStorage.getItem(CUE_COLUMN_WIDTHS_KEY) || '{}')); }
    catch { return {...DEFAULT_CUE_COLUMN_WIDTHS}; }
}

function move(items, index, delta) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return items;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
}

function moveTo(items, from, to) {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
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
            return localStorage.getItem(THEME_KEY) || 'dark';
        } catch {
            return 'dark';
        }
    });
    const [message, setMessage] = useState('');
    const [txJsonCmd, setTxJsonCmd] = useState(() => readTxStore(globalThis.localStorage));
    const [cueLog, setCueLog] = useState([]);
    const [, setAudioTrackVersion] = useState(0);
    const [wsLog, setWsLog] = useState([]);
    const [timelineCollapsed, setTimelineCollapsed] = useState(() => readCollapsed(TIMELINE_COLLAPSED_KEY));
    const [wsPanelCollapsed, setWsPanelCollapsed] = useState(() => readCollapsed(WS_PANEL_COLLAPSED_KEY));
    const [cueColumnWidths, setCueColumnWidths] = useState(readCueColumnWidths);
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
    const audioTracksRef = useRef(null);
    if (!audioTracksRef.current) audioTracksRef.current = createLocalAudioTracks();
    groupsRef.current = groups;
    onEventRef.current = onEvent;
    const addWsLog = useCallback((type, detail) => setWsLog(current => [{timestamp: new Date().toISOString(), type, detail}, ...current].slice(0, LOG_LIMIT)), []);
    const emit = useCallback(event => {
        if (event.type === 'cue:dispatched') {
            if (event.cue?.type === 'audio') {
                void audioTracksRef.current.run(event.cue.id, event.cue.audioAction).then(result => {
                    if (!result.ok) setCueLog(current => [{timestamp: event.timestamp, source: 'warning', group: event.group.name, command: result.message}, ...current].slice(0, LOG_LIMIT));
                });
                return;
            }
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
                    addWsLog('sent', event.command || 'Empty command');
                } catch (error) {
                    addWsLog('error', `Send failed: ${error?.message || 'unknown error'}`);
                }
            }
            setCueLog(current => [{
                timestamp: event.timestamp,
                source: event.lateMs > 0 ? 'warning' : event.source,
                group: event.group?.name ?? '',
                command: event.lateMs > 0 ? `Late ${event.lateMs}ms · ${event.command}` : event.command,
            }, ...current].slice(0, LOG_LIMIT));
        } else if (event.type === 'cue:target-requested') {
            const currentGroups = groupsRef.current;
            const targetGroup = currentGroups.find(group => normalizedName(group.name) === normalizedName(event.targetGroupName));
            const targetCue = targetGroup?.cues.find(cue => normalizedName(cue.name) === normalizedName(event.targetCueName));
            let level = 'warning';
            let detail;
            if (!targetGroup) detail = `Target group not found: ${event.targetGroupName || 'unnamed'}`;
            else if (!targetCue) detail = `Target cue not found: ${event.targetCueName || 'unnamed'}`;
            else if (targetCue.type === 'audio') {
                level = 'info';
                const audioAction = event.targetAction === 'start' ? 'play' : event.targetAction;
                detail = `${audioAction === 'play' ? 'Started' : audioAction === 'pause' ? 'Paused' : 'Stopped'} ${targetCue.name}`;
                void audioTracksRef.current.run(targetCue.id, audioAction).then(result => {
                    if (!result.ok) setCueLog(current => [{timestamp: event.timestamp, source: 'warning', group: targetGroup.name, command: result.message}, ...current].slice(0, LOG_LIMIT));
                });
            } else if (event.targetAction !== 'start') detail = `${event.targetAction === 'pause' ? 'Pause' : 'Stop'} requires an Audio cue.`;
            else if (engineRef.current.isRunning(targetGroup.id)) detail = `Ignored: ${targetGroup.name} is already running`;
            else {
                level = 'info';
                detail = `Started ${targetGroup.name} from ${targetCue.name}`;
                engineRef.current.start({group: targetGroup, groupIndex: currentGroups.indexOf(targetGroup), startCueId: targetCue.id});
            }
            setCueLog(current => [{timestamp: event.timestamp, source: level, group: event.group?.name ?? '', command: detail, ws: false}, ...current].slice(0, LOG_LIMIT));
            onEventRef.current?.({...event, type: 'cue:target-result', result: level === 'info' ? 'started' : 'ignored', detail});
        }
        onEventRef.current?.(event);
    }, [addWsLog]);
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
    const handleWebSocketMessage = useCallback(raw => {
        const payload = typeof raw === 'string' ? raw : String(raw ?? '');
        addWsLog('received', payload || 'Empty message');
        const control = parseWebSocketCueControl(payload);
        const logControl = (source, command) => setCueLog(current => [{timestamp: new Date().toISOString(), source, group: 'WebSocket', command, ws: true}, ...current].slice(0, LOG_LIMIT));
        if (!control.ok) {
            logControl('warning', control.reason);
            return;
        }
        const matches = groupsRef.current.flatMap((group, groupIndex) => group.cues.filter(cue => normalizedName(cue.name) === normalizedName(control.cueName)).map(cue => ({group, groupIndex, cue})));
        if (!matches.length) {
            logControl('warning', `No cue named ${control.cueName} found.`);
            return;
        }
        if (control.action === 'start') {
            matches.forEach(({group, groupIndex, cue}) => engineRef.current.start({group: {...group, loopEnabled: false}, groupIndex, singleCueId: cue.id, source: 'websocket'}));
            logControl('info', `WebSocket started ${matches.length} cue${matches.length === 1 ? '' : 's'} named ${control.cueName}.`);
            return;
        }
        const running = matches.filter(({group, cue}) => engineRef.current.isSingleCueRunning(group.id, cue.id));
        running.forEach(({group, groupIndex}) => engineRef.current.stop(group.id, groupIndex, group.name));
        logControl(running.length ? 'info' : 'warning', running.length ? `WebSocket stopped ${running.length} cue${running.length === 1 ? '' : 's'} named ${control.cueName}.` : `No running WebSocket cue named ${control.cueName}.`);
    }, [addWsLog]);

    useEffect(() => {
        writeStoredGroups(globalThis.localStorage, groups);
    }, [groups]);
    useEffect(() => {
        document.querySelectorAll('option[value="play"]').forEach(option => { option.textContent = 'Start'; });
    });
    useEffect(() => {
        try { localStorage.setItem(TIMELINE_COLLAPSED_KEY, String(timelineCollapsed)); } catch {}
    }, [timelineCollapsed]);
    useEffect(() => {
        try { localStorage.setItem(WS_PANEL_COLLAPSED_KEY, String(wsPanelCollapsed)); } catch {}
    }, [wsPanelCollapsed]);
    useEffect(() => {
        try { localStorage.setItem(CUE_COLUMN_WIDTHS_KEY, JSON.stringify(cueColumnWidths)); } catch {}
    }, [cueColumnWidths]);
    useEffect(() => {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {
        }
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
    useEffect(() => () => { engineRef.current?.dispose(); audioTracksRef.current?.dispose(); }, []);
    useEffect(() => {
        const reconcileVisibleRuns = () => {
            if (document.visibilityState === 'visible') engineRef.current?.reconcile();
        };
        document.addEventListener('visibilitychange', reconcileVisibleRuns);
        window.addEventListener('focus', reconcileVisibleRuns);
        return () => {
            document.removeEventListener('visibilitychange', reconcileVisibleRuns);
            window.removeEventListener('focus', reconcileVisibleRuns);
        };
    }, []);
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
            socket.onmessage = null;
            socket.close();
            wsRef.current = null;
        }
        if (!wsConfig.enabled) { setWsStatus('off'); return undefined; }
        const host = wsConfig.host.trim();
        const port = wsConfig.port.trim();
        if (!host || !port) { setWsStatus('off'); addWsLog('error', 'Host and port are required'); return undefined; }
        let next;
        try {
            next = new WebSocket(`ws://${host}:${port}`);
        } catch (error) {
            setWsStatus('error');
            addWsLog('error', `Connection failed: ${error?.message || 'unknown error'}`);
            return undefined;
        }
        wsRef.current = next;
        next.onopen = () => { setWsStatus('connected'); addWsLog('connected', `Connected to ws://${host}:${port}`); };
        next.onmessage = event => handleWebSocketMessage(event.data);
        next.onerror = () => { setWsStatus('error'); addWsLog('error', `Connection error at ws://${host}:${port}`); };
        next.onclose = () => {
            if (wsRef.current === next) {
                wsRef.current = null;
                setWsStatus('off');
                addWsLog('disconnected', `Disconnected from ws://${host}:${port}`);
            }
        };
        setWsStatus('connecting');
        addWsLog('connecting', `Connecting to ws://${host}:${port}`);
        return () => {
            next.onclose = null;
            next.onerror = null;
            next.onopen = null;
            next.onmessage = null;
            try {
                next.close();
            } catch {
            }
            if (wsRef.current === next) wsRef.current = null;
        };
    }, [wsConfig, addWsLog, handleWebSocketMessage]);
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

    const updateGroup = (groupId, patch) => setGroups(current => {
        if ('name' in patch) {
            const name = String(patch.name).trim();
            if (!name || current.some(group => group.id !== groupId && normalizedName(group.name) === normalizedName(name))) {
                setMessage(!name ? 'Group name cannot be empty.' : `Group name already exists: ${name}.`);
                return current;
            }
        }
        return current.map(group => group.id === groupId ? {...group, ...patch} : group);
    });
    const updateCue = (groupId, cueId, patch) => setGroups(current => {
        const group = current.find(item => item.id === groupId);
        if ('name' in patch) {
            const name = String(patch.name).trim();
            if (!name || group?.cues.some(cue => cue.id !== cueId && normalizedName(cue.name) === normalizedName(name))) {
                setMessage(!name ? 'Cue name cannot be empty.' : `Cue name already exists in ${group?.name}: ${name}.`);
                return current;
            }
        }
        return current.map(item => item.id === groupId ? {...item, cues: item.cues.map(cue => cue.id === cueId ? {...cue, ...patch} : cue)} : item);
    });
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
                 onAddGroup={() => setGroups(current => {
                     let suffix = current.length + 1;
                     while (current.some(group => normalizedName(group.name) === normalizedName(`Cue Group ${suffix}`))) suffix++;
                     return [...current, createGroup({name: `Cue Group ${suffix}`})];
                 })}
                 onRemoveGroup={() => setGroups(current => {
                     current.at(-1)?.cues.forEach(cue => audioTracksRef.current.clear(cue.id));
                     return current.slice(0, -1);
                 })} onReset={() => {
            engineRef.current.dispose();
            audioTracksRef.current.dispose();
            setGroups(createDefaultGroups());
            setMessage('Default configuration restored.');
        }} onExport={exportGroups} onImport={importGroups}/>
        <div className="mx-auto flex w-full flex-col gap-4 px-3 py-4 sm:w-[90%] sm:px-0 lg:flex-row">
            <main className="min-w-0 flex-1 space-y-4">
                <div className="flex items-end justify-between">
                    <div><p className="text-sm font-bold uppercase tracking-[.2em] text-cyan-600">Workspace</p><h2
                        className="text-3xl font-black">Cue groups</h2></div>
                    <p className="font-mono text-sm text-slate-500">{groups.length} GROUP{groups.length === 1 ? '' : 'S'}</p>
                </div>
                <TimelineEditor groups={groups} audioMediaByCueId={Object.fromEntries(groups.flatMap(group => group.cues.map(cue => [cue.id, audioTracksRef.current.get(cue.id)])))} collapsed={timelineCollapsed} onCollapsedChange={setTimelineCollapsed} onCueChange={updateCue}
                                onCueAdd={(groupId, cueIndex, cue) => setGroups(current => current.map(group => {
                                    if (group.id !== groupId) return group;
                                    if (!normalizedName(cue.name) || group.cues.some(item => normalizedName(item.name) === normalizedName(cue.name))) {
                                        setMessage(`Cue name must be unique in ${group.name}.`); return group;
                                    }
                                    return {...group, cues: [...group.cues.slice(0, cueIndex), createCue(cue), ...group.cues.slice(cueIndex)]};
                                }))}
                                onCueRemove={(groupId, cueId) => setGroups(current => current.map(group => group.id === groupId ? {
                                    ...group,
                                    cues: group.cues.filter(cue => cue.id !== cueId)
                                } : group))}
                                onCueReorder={(groupId, from, to) => setGroups(current => current.map(group => group.id === groupId ? {
                                    ...group,
                                    cues: moveTo(group.cues, from, to)
                                } : group))}/>
                {groups.map((group, index) => <CueGroup key={group.id} group={group} groups={groups} index={index} lastKey={lastKey}
                                                        columnWidths={cueColumnWidths}
                                                        onColumnResize={(columnId, width) => setCueColumnWidths(current => ({...current, [columnId]: cueColumnWidth(columnId, width)}))}
                                                        onColumnReset={columnId => setCueColumnWidths(current => ({...current, [columnId]: DEFAULT_CUE_COLUMN_WIDTHS[columnId]}))}
                                                        now={now} onGroupChange={patch => updateGroup(group.id, patch)}
                                                        onGo={() => engineRef.current.start({group, groupIndex: index})}
                                                        onStop={() => stopGroup(group, index)}
                                                        onMove={delta => setGroups(current => move(current, index, delta))}
                                                        onRemove={() => { group.cues.forEach(cue => audioTracksRef.current.clear(cue.id)); setAudioTrackVersion(version => version + 1); setGroups(current => current.filter(item => item.id !== group.id)); }}
                                                        audioMediaByCueId={Object.fromEntries(group.cues.map(cue => [cue.id, audioTracksRef.current.get(cue.id)]))}
                                                        onAudioFileSelect={(cueId, file) => { if (!file) return; void audioTracksRef.current.set(cueId, file).then(() => setAudioTrackVersion(version => version + 1)); setAudioTrackVersion(version => version + 1); }}
                                                        onAudioClear={cueId => { audioTracksRef.current.clear(cueId); setAudioTrackVersion(version => version + 1); }}
                                                        onCueChange={(cueId, patch) => updateCue(group.id, cueId, patch)}
                                                        onCueBlur={cueId => {
                                                            const cue = groupsRef.current.find(item => item.id === group.id)?.cues.find(item => item.id === cueId);
                                                            updateCue(group.id, cueId, {command: normalizeCommand(cue?.command)});
                                                        }}
                                                        onCueInsert={cueIndex => setGroups(current => current.map(item => item.id === group.id ? {
                                                            ...item,
                                                            cues: [...item.cues.slice(0, cueIndex + 1), createCue({name: `Cue ${item.cues.length + 1}`}), ...item.cues.slice(cueIndex + 1)]
                                                        } : item))}
                                                        onCueMove={(cueIndex, delta) => setGroups(current => current.map(item => item.id === group.id ? {
                                                            ...item,
                                                            cues: move(item.cues, cueIndex, delta)
                                                        } : item))}
                                                        onCueDuplicate={cueIndex => setGroups(current => current.map(item => item.id === group.id ? {
                                                            ...item,
                                                            cues: [...item.cues.slice(0, cueIndex + 1), createCue({...item.cues[cueIndex], id: undefined, name: `${item.cues[cueIndex].name} copy`}), ...item.cues.slice(cueIndex + 1)]
                                                        } : item))}
                                                        onCueRemove={cueId => setGroups(current => current.map(item => item.id === group.id ? {
                                                            ...item,
                                                            cues: item.cues.filter(cue => cue.id !== cueId)
                                                        } : item))}/>)}
                {!groups.length && <div
                    className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
                    <p className="text-lg font-bold">No cue groups</p><p className="text-base text-slate-500">Use Q-Group + to
                    start a sequence.</p></div>}
                <section aria-label="Cue log"
                         className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <header
                        className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                        <div><p
                            className="text-sm font-bold uppercase tracking-[.2em] text-cyan-600 dark:text-cyan-400">Log</p><h2
                            className="text-xl font-black">event</h2></div>
                        {/*<h2 className="text-xl font-black">Cue log</h2>*/}
                        <p className="ml-auto font-mono text-sm text-slate-500">{cueLog.length} EVENT{cueLog.length === 1 ? '' : 'S'}</p>
                    </header>
                    {cueLog.length ?
                        <ul className="max-h-80 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">{cueLog.map((entry, index) =>
                            <li key={`${entry.timestamp}-${index}`}
                                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 font-mono text-base">
                                <span
                                    className="text-slate-500 dark:text-slate-400">{logTimestamp(entry.timestamp)}</span><span
                                className={`rounded-full px-2 py-0.5 text-sm font-bold ${SOURCE_STYLES[entry.source] ?? 'bg-slate-200 text-slate-700'}`}>{entry.source}</span><span
                                className="text-slate-500 dark:text-slate-400">{entry.group}</span><span
                                className="min-w-0 flex-1 truncate text-slate-900 dark:text-slate-100"
                                title={entry.command}>{entry.command || '—'}</span></li>)}</ul> :
                        <p className="p-6 text-center text-base text-slate-500">No dispatched cues yet</p>}
                </section>
                <WebSocketPanel config={wsConfig} status={wsStatus} entries={wsLog} collapsed={wsPanelCollapsed} onCollapsedChange={setWsPanelCollapsed} onConfigChange={setWsConfig} />
            </main>
            <ActiveCuePanel groups={groups} open={panelOpen}/></div>
        <div className="sr-only" aria-label="TX_JSON_CMD">{txJsonCmd ? JSON.stringify(txJsonCmd) : ''}</div>
        <div role="status" aria-live="polite"
             className="fixed bottom-4 right-4 max-w-sm rounded-lg bg-slate-900 px-4 py-3 text-base text-white shadow-xl empty:hidden">{message}</div>
    </div>;
}
