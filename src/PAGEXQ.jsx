import { useCallback, useEffect, useRef, useState } from 'react';
import { ActiveCuePanel } from './components/ActiveCuePanel.jsx';
import { CueGroup } from './components/CueGroup.jsx';
import { Toolbar } from './components/Toolbar.jsx';
import { CueEngine } from './lib/cueEngine.js';
import { createCue, createDefaultGroups, createGroup, hydrateGroups, normalizeCommand, readStoredGroups, toPersistedGroups, writeStoredGroups } from './lib/cues.js';
import { createTriggerGate, matchingTriggeredCues } from './lib/triggers.js';
import './styles.css';

const THEME_KEY = 'mini-qlab-theme';
function move(items, index, delta) { const target = index + delta; if (target < 0 || target >= items.length) return items; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; return next; }
function readFile(file) { if (typeof file.text === 'function') return file.text(); return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsText(file); }); }

export default function MiniQLab({ onEvent, rxJson, initialGroups }) {
  const [groups, setGroups] = useState(() => readStoredGroups(globalThis.localStorage) ?? hydrateGroups(initialGroups ?? createDefaultGroups()));
  const [panelOpen, setPanelOpen] = useState(false); const [lastKey, setLastKey] = useState('');
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem(THEME_KEY) || 'light'; } catch { return 'light'; } });
  const [message, setMessage] = useState(''); const [txJsonCmd, setTxJsonCmd] = useState(null);
  const groupsRef = useRef(groups); const onEventRef = useRef(onEvent); const gateRef = useRef(createTriggerGate()); groupsRef.current = groups; onEventRef.current = onEvent;
  const emit = useCallback(event => { if (event.type === 'cue:dispatched') setTxJsonCmd({ command: event.command, timestamp: event.timestamp }); onEventRef.current?.(event); }, []);
  const engineRef = useRef(null);
  if (!engineRef.current) engineRef.current = new CueEngine({ onStatus: (groupId, cueId, patch) => setGroups(current => current.map(group => group.id === groupId ? { ...group, cues: group.cues.map(cue => cue.id === cueId ? { ...cue, ...patch } : cue) } : group)), onEvent: emit });
  const dispatchTriggered = useCallback(({ group, groupIndex, cue, source }) => { setGroups(current => current.map(item => item.id === group.id ? { ...item, cues: item.cues.map(value => value.id === cue.id ? { ...value, status: 'DONE', progress: 100 } : value) } : item)); emit({ type: 'cue:dispatched', timestamp: new Date().toISOString(), group: { index: groupIndex, name: group.name }, cue: { ...cue }, command: cue.command, source }); }, [emit]);

  useEffect(() => { writeStoredGroups(globalThis.localStorage, groups); }, [groups]);
  useEffect(() => { try { localStorage.setItem(THEME_KEY, theme); } catch {} document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  useEffect(() => () => engineRef.current?.dispose(), []);
  useEffect(() => { const handler = event => { setLastKey(event.key); matchingTriggeredCues(groupsRef.current, { key: event.key }).filter(item => item.source === 'hotkey').forEach(dispatchTriggered); }; document.addEventListener('keydown', handler); return () => document.removeEventListener('keydown', handler); }, [dispatchTriggered]);
  const timecode = rxJson?.TC?.string;
  useEffect(() => { if (!timecode) return; matchingTriggeredCues(groupsRef.current, { timecode }).filter(item => item.source === 'timecode').forEach(item => { if (gateRef.current.shouldDispatch('timecode', item.cue.id, item.observedValue)) dispatchTriggered(item); }); }, [timecode, dispatchTriggered]);
  useEffect(() => { const timer = setInterval(() => { const date = new Date(); matchingTriggeredCues(groupsRef.current, { date }).filter(item => item.source === 'cron').forEach(item => { if (gateRef.current.shouldDispatch('cron', item.cue.id, item.observedValue)) dispatchTriggered(item); }); }, 1000); return () => clearInterval(timer); }, [dispatchTriggered]);

  const updateGroup = (groupId, patch) => setGroups(current => current.map(group => group.id === groupId ? { ...group, ...patch } : group));
  const updateCue = (groupId, cueId, patch) => setGroups(current => current.map(group => group.id === groupId ? { ...group, cues: group.cues.map(cue => cue.id === cueId ? { ...cue, ...patch } : cue) } : group));
  const stopGroup = (group, index) => { engineRef.current.stop(group.id, index, group.name); setGroups(current => current.map(item => item.id === group.id ? { ...item, cues: item.cues.map(cue => cue.status === 'LIVE' ? { ...cue, status: 'IDLE', progress: 0 } : cue) } : item)); };
  async function importGroups(file) { if (!file) return; try { setGroups(hydrateGroups(JSON.parse(await readFile(file)))); setMessage('Import complete.'); } catch (error) { setMessage(`Import failed: ${error.message}`); } }
  function exportGroups() { try { const url = URL.createObjectURL(new Blob([JSON.stringify(toPersistedGroups(groups), null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'mini-qlab-cues.json'; link.click(); URL.revokeObjectURL(url); setMessage('Export complete.'); } catch (error) { setMessage(`Export failed: ${error.message}`); } }

  return <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
    <Toolbar onGoAll={() => groupsRef.current.forEach((group,index) => engineRef.current.start({ group, groupIndex: index }))} onStopAll={() => { engineRef.current.stopAll(groupsRef.current); setGroups(current => current.map(group => ({ ...group, cues: group.cues.map(cue => cue.status === 'LIVE' ? { ...cue, status: 'IDLE', progress: 0 } : cue) }))); }} theme={theme} onThemeChange={setTheme} panelOpen={panelOpen} onPanelToggle={() => setPanelOpen(open => !open)} onAddGroup={() => setGroups(current => [...current, createGroup({ name: `Cue Group ${current.length + 1}` })])} onRemoveGroup={() => setGroups(current => current.slice(0, -1))} onReset={() => { engineRef.current.dispose(); setGroups(createDefaultGroups()); setMessage('Default configuration restored.'); }} onExport={exportGroups} onImport={importGroups} />
    <div className="mx-auto flex max-w-[1600px] flex-col gap-4 p-4 lg:flex-row"><main className="min-w-0 flex-1 space-y-4"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-600">Workspace</p><h2 className="text-2xl font-black">Cue groups</h2></div><p className="font-mono text-xs text-slate-500">{groups.length} GROUP{groups.length === 1 ? '' : 'S'}</p></div>
      {groups.map((group,index) => <CueGroup key={group.id} group={group} index={index} lastKey={lastKey} onGroupChange={patch => updateGroup(group.id, patch)} onGo={() => engineRef.current.start({ group, groupIndex: index })} onStop={() => stopGroup(group,index)} onMove={delta => setGroups(current => move(current,index,delta))} onRemove={() => setGroups(current => current.filter(item => item.id !== group.id))} onCueChange={(cueId,patch) => updateCue(group.id,cueId,patch)} onCueBlur={cueId => { const cue = groupsRef.current.find(item => item.id === group.id)?.cues.find(item => item.id === cueId); updateCue(group.id,cueId,{ command: normalizeCommand(cue?.command) }); }} onCueInsert={cueIndex => setGroups(current => current.map(item => item.id === group.id ? { ...item, cues: [...item.cues.slice(0,cueIndex + 1), createCue({ number: String(cueIndex + 2) }), ...item.cues.slice(cueIndex + 1)] } : item))} onCueMove={(cueIndex,delta) => setGroups(current => current.map(item => item.id === group.id ? { ...item, cues: move(item.cues,cueIndex,delta) } : item))} onCueRemove={cueId => setGroups(current => current.map(item => item.id === group.id ? { ...item, cues: item.cues.filter(cue => cue.id !== cueId) } : item))} />)}
      {!groups.length && <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700"><p className="font-bold">No cue groups</p><p className="text-sm text-slate-500">Use Q-Group + to start a sequence.</p></div>}</main><ActiveCuePanel groups={groups} open={panelOpen} /></div>
    <div className="sr-only" aria-label="TX_JSON_CMD">{txJsonCmd ? JSON.stringify(txJsonCmd) : ''}</div><div role="status" aria-live="polite" className="fixed bottom-4 right-4 max-w-sm rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl empty:hidden">{message}</div>
  </div>;
}
