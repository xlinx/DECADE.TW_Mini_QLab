import {useEffect, useMemo, useRef, useState} from 'react';
import {
    cueInsertionAt,
    extendTimelineDuration,
    layoutCues,
    msToPixels,
    pixelsToMs,
    playbackObservation,
    safeWaitMs,
    snapWaitMs,
    timelineDuration,
    zoomScrollLeft
} from '../lib/timeline.js';
import {normalizeCommand} from '../lib/cues.js';
import {useToggleFeedback} from '../hooks/useToggleFeedback.js';

const LABEL_WIDTH = 152;
const MIN_CLIP_WIDTH = 50;
const MOVE_THRESHOLD = 5;
const MIN_ZOOM = 1;
const MAX_ZOOM = 240;

function cueLabel(cue) {
    return cue.name || cue.command || 'Unnamed cue';
}

function cueContentLabel(cue) {
    if (cue.type === 'trigger') return `Trigger → ${cue.targetGroupName || 'group'} / ${cue.targetCueName || 'cue'}`;
    return normalizeCommand(cue.command) || 'Command';
}

export function formatTimelineNow(value) {
    const date = value instanceof Date ? value : new Date(value);
    const pad = (number, width = 2) => String(number).padStart(width, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

function TimelineNow() {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        let frame;
        const update = () => { setNow(Date.now()); frame = requestAnimationFrame(update); };
        frame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frame);
    }, []);
    return <time aria-label="Timeline now time" className="rounded-md bg-slate-200 px-2 py-1 font-mono text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">NOW {formatTimelineNow(now)}</time>;
}

function rulerMarks(durationMs) {
    const marks = [];
    for (let value = 0; value <= durationMs; value += 1000) marks.push(value);
    return marks;
}

function editableDraft(cue) {
    return {
        name: String(cue.name ?? cue.number ?? ''),
        type: ['command', 'trigger', 'audio'].includes(cue.type) ? cue.type : 'command',
        audioAction: ['play', 'pause', 'stop'].includes(cue.audioAction) ? cue.audioAction : 'play',
        targetGroupName: String(cue.targetGroupName ?? ''),
        targetCueName: String(cue.targetCueName ?? ''),
        hotkey: String(cue.hotkey ?? '').slice(0, 1),
        command: String(cue.command ?? ''),
        ltcTrigger: String(cue.ltcTrigger ?? ''),
        cron: String(cue.cron ?? ''),
        beforeWaitMs: safeWaitMs(cue.beforeWaitMs),
        afterWaitMs: safeWaitMs(cue.afterWaitMs)
    };
}

function TimelinePlayhead({group, groupEndMs, pixelsPerSecond}) {
    const lineRef = useRef(null);
    const retainedPosition = useRef(0);
    useEffect(() => {
        const line = lineRef.current;
        if (!line) return undefined;
        const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
        let frame;
        const renderPosition = position => {
            const clamped = Math.min(groupEndMs, Math.max(0, position));
            retainedPosition.current = clamped;
            line.style.transform = `translate3d(${msToPixels(clamped, pixelsPerSecond)}px, 0, 0)`;
            line.dataset.playheadMs = String(Math.round(clamped));
        };
        const observation = playbackObservation(group.cues);
        if (!observation) {
            renderPosition(retainedPosition.current);
            return undefined;
        }
        renderPosition(observation.positionMs);
        if (reducedMotion || !observation.moving) return undefined;
        const animate = () => {
            const current = playbackObservation(group.cues);
            if (!current) return;
            renderPosition(current.positionMs);
            if (current.moving) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [group.cues, groupEndMs, pixelsPerSecond]);
    return <div ref={lineRef} aria-label={`Playhead for ${group.name}`} data-playhead-ms="0"
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-0.5 bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,.8)] will-change-transform"/>;
}

function CueEditor({editor, groups, onChange, onCancel, onSave, onRemove}) {
    const input = 'rounded-md border border-slate-600 bg-slate-950 px-2 py-2 text-base text-white focus:border-cyan-400 focus:outline-none';
    const draft = editor.draft;
    const update = patch => onChange({...draft, ...patch});
    const editorWidth = Math.min(window.innerWidth * .9, 768);
    return <div role="dialog" aria-label={editor.mode === 'create' ? 'Add cue' : 'Edit cue'}
                className="fixed z-50 w-[min(90vw,48rem)] rounded-xl border border-slate-600 bg-slate-900 p-4 text-base text-slate-100 shadow-2xl"
                style={{
                    left: Math.min(editor.x, Math.max(8, window.innerWidth - editorWidth - 8)),
                    top: Math.min(editor.y, Math.max(8, window.innerHeight - 580))
                }} onPointerDown={event => event.stopPropagation()} onContextMenu={event => event.preventDefault()}>
        <h3 className="mb-3 text-xl font-black">{editor.mode === 'create' ? 'Add cue' : 'Edit cue'}</h3>
        <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-sm font-bold text-slate-400">Name<input autoFocus
                                                                                               className={input}
                                                                                               value={draft.name}
                                                                                               onChange={event => update({name: event.target.value})}/></label>
            <label className="flex flex-col gap-1 text-sm font-bold text-slate-400">Hotkey<input className={input}
                                                                                                 maxLength={1}
                                                                                                 value={draft.hotkey}
                                                                                                 onChange={event => update({hotkey: event.target.value.slice(0, 1)})}/></label>
            <div className="col-span-2 overflow-x-auto">
                <div
                    className={`grid gap-2 ${draft.type === 'trigger' ? 'min-w-[42rem] grid-cols-3' : 'min-w-[32rem] grid-cols-2'}`}>
                    <label className="flex flex-col gap-1 text-sm font-bold text-slate-400">Type<select
                        className={input} value={draft.type}
                        onChange={event => update({type: event.target.value, audioAction: event.target.value === 'audio' ? 'play' : draft.audioAction, targetGroupName: '', targetCueName: ''})}>
                        <option value="command">Command</option>
                        <option value="trigger">Trigger cue</option>
                        <option value="audio">Audio</option>
                    </select></label>
                    {draft.type === 'trigger' ? <><label
                            className="flex flex-col gap-1 text-sm font-bold text-slate-400">Target group<select
                            className={input} value={draft.targetGroupName}
                            onChange={event => update({targetGroupName: event.target.value, targetCueName: ''})}>
                            <option value="">Select group…</option>
                            {groups.map(group => <option key={group.id} value={group.name}>{group.name}</option>)}</select></label><label
                            className="flex flex-col gap-1 text-sm font-bold text-slate-400">Target cue<select
                            className={input} value={draft.targetCueName}
                            onChange={event => update({targetCueName: event.target.value})}>
                            <option value="">Select cue…</option>
                            {groups.find(group => group.name === draft.targetGroupName)?.cues.map(cue => <option
                                key={cue.id} value={cue.name}>{cue.name}</option>)}</select></label></> : draft.type === 'audio' ?
                        <label className="flex flex-col gap-1 text-sm font-bold text-slate-400">Audio action<select
                            className={input} value={draft.audioAction}
                            onChange={event => update({audioAction: event.target.value})}>
                            <option value="play">Play</option><option value="pause">Pause</option><option value="stop">Stop</option>
                        </select></label> :
                        <label className="flex flex-col gap-1 text-sm font-bold text-slate-400">Command<input
                            className={input} value={draft.command}
                            onChange={event => update({command: event.target.value})}/></label>}
                </div>
            </div>
            <label className="col-span-2 flex flex-col gap-1 text-sm font-bold text-slate-400">LTC trigger<input
                className={input} placeholder="01:00:00:00" value={draft.ltcTrigger}
                onChange={event => update({ltcTrigger: event.target.value})}/></label>
            <label className="col-span-2 flex flex-col gap-1 text-sm font-bold text-slate-400">Cron<input
                className={input} placeholder="* * * * * *" value={draft.cron}
                onChange={event => update({cron: event.target.value})}/></label>
            <label className="flex flex-col gap-1 text-sm font-bold text-slate-400">Before-wait (ms)<input
                className={input} type="number" min="0" value={draft.beforeWaitMs}
                onChange={event => update({beforeWaitMs: event.target.value})}/></label>
            <label className="flex flex-col gap-1 text-sm font-bold text-slate-400">After-wait (ms)<input
                className={input} type="number" min="0" value={draft.afterWaitMs}
                onChange={event => update({afterWaitMs: event.target.value})}/></label>
        </div>
        <div className="mt-4 flex gap-2">
            {editor.mode === 'edit' &&
                <button className="rounded-md border border-rose-500 px-3 py-2 text-base font-bold text-rose-400"
                        onClick={onRemove}>Remove</button>}
            <button className="ml-auto rounded-md border border-slate-600 px-3 py-2 text-base font-bold"
                    onClick={onCancel}>Cancel
            </button>
            <button className="rounded-md bg-cyan-500 px-3 py-2 text-base font-black text-slate-950"
                    onClick={onSave}>Save
            </button>
        </div>
    </div>;
}

export function TimelineEditor({
                                   groups, audioMediaByCueId = {}, collapsed = false, onCollapsedChange = () => {
    }, onCueAdd, onCueChange, onCueRemove, onCueReorder
                               }) {
    const [pixelsPerSecond, setPixelsPerSecond] = useState(80);
    const [framesPerSecond, setFramesPerSecond] = useState(30);
    const [canvasDurationMs, setCanvasDurationMs] = useState(() => extendTimelineDuration(0, timelineDuration(groups) + 1000));
    const [interaction, setInteraction] = useState(null);
    const [editor, setEditor] = useState(null);
    const feedback = useToggleFeedback();
    const scrollRef = useRef(null);
    const durationMs = extendTimelineDuration(canvasDurationMs, timelineDuration(groups) + 1000);
    const canvasWidth = msToPixels(durationMs, pixelsPerSecond);
    const marks = useMemo(() => rulerMarks(durationMs), [durationMs]);

    useEffect(() => {
        if (durationMs !== canvasDurationMs) setCanvasDurationMs(durationMs);
    }, [canvasDurationMs, durationMs]);
    useEffect(() => {
        if (collapsed) {
            setEditor(null);
            setInteraction(null);
        }
    }, [collapsed]);
    useEffect(() => {
        if (!editor) return undefined;
        const keydown = event => {
            if (event.key === 'Escape') setEditor(null);
        };
        const outside = event => {
            if (!event.target.closest('[role="dialog"]')) setEditor(null);
        };
        window.addEventListener('keydown', keydown);
        window.addEventListener('pointerdown', outside);
        return () => {
            window.removeEventListener('keydown', keydown);
            window.removeEventListener('pointerdown', outside);
        };
    }, [editor]);

    useEffect(() => {
        if (!interaction) return undefined;
        const finish = () => setInteraction(null);
        const move = event => {
            if (interaction.mode === 'pan') {
                if (scrollRef.current) scrollRef.current.scrollLeft = Math.max(0, interaction.initialScrollLeft - (event.clientX - interaction.originX));
                return;
            }
            const group = groups.find(item => item.id === interaction.groupId);
            const cueIndex = group?.cues.findIndex(item => item.id === interaction.cueId) ?? -1;
            if (!group || cueIndex < 0) return finish();
            const dx = event.clientX - interaction.originX;
            const dy = event.clientY - interaction.originY;
            let mode = interaction.mode;
            if (mode === 'pending') {
                if (Math.max(Math.abs(dx), Math.abs(dy)) < MOVE_THRESHOLD) return;
                mode = Math.abs(dy) > Math.abs(dx) ? 'reorder' : 'move';
                setInteraction(current => current ? {...current, mode} : null);
            }
            if (mode === 'resize') onCueChange(interaction.groupId, interaction.cueId, {afterWaitMs: snapWaitMs(interaction.initialAfter + pixelsToMs(dx, pixelsPerSecond))});
            else if (mode === 'move') onCueChange(interaction.groupId, interaction.cueId, {beforeWaitMs: snapWaitMs(interaction.initialBefore + pixelsToMs(dx, pixelsPerSecond))});
            else if (mode === 'reorder') {
                const timeMs = Math.max(0, pixelsToMs(event.clientX - interaction.trackLeft, pixelsPerSecond));
                const layout = layoutCues(group.cues);
                let target = layout.findIndex(item => timeMs < (item.startMs + item.endMs) / 2);
                if (target < 0) target = layout.length - 1;
                if (target !== cueIndex) onCueReorder(interaction.groupId, cueIndex, target);
            }
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', finish);
        window.addEventListener('pointercancel', finish);
        return () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', finish);
            window.removeEventListener('pointercancel', finish);
        };
    }, [groups, interaction, onCueChange, onCueReorder, pixelsPerSecond]);

    const beginCue = (event, group, cue, mode) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const track = event.currentTarget.closest('[data-timeline-track]');
        setInteraction({
            mode,
            groupId: group.id,
            cueId: cue.id,
            originX: event.clientX,
            originY: event.clientY,
            trackLeft: track?.getBoundingClientRect().left ?? LABEL_WIDTH,
            initialBefore: safeWaitMs(cue.beforeWaitMs),
            initialAfter: safeWaitMs(cue.afterWaitMs)
        });
    };
    const beginPan = event => {
        if (event.button !== 0 || event.target !== event.currentTarget) return;
        event.preventDefault();
        setInteraction({mode: 'pan', originX: event.clientX, initialScrollLeft: scrollRef.current?.scrollLeft ?? 0});
    };
    const openNew = (event, group) => {
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        const timeMs = pixelsToMs(event.clientX - event.currentTarget.getBoundingClientRect().left, pixelsPerSecond);
        const insertion = cueInsertionAt(group.cues, timeMs);
        let suffix = group.cues.length + 1;
        while (group.cues.some(cue => cue.name.toLocaleLowerCase() === `cue ${suffix}`.toLocaleLowerCase())) suffix++;
        setEditor({
            mode: 'create',
            groupId: group.id,
            index: insertion.index,
            x: event.clientX,
            y: event.clientY,
            draft: editableDraft({name: `Cue ${suffix}`, beforeWaitMs: insertion.beforeWaitMs, afterWaitMs: 1000})
        });
    };
    const openExisting = (event, group, cue) => {
        event.preventDefault();
        event.stopPropagation();
        setEditor({
            mode: 'edit',
            groupId: group.id,
            cueId: cue.id,
            x: event.clientX,
            y: event.clientY,
            draft: editableDraft(cue)
        });
    };
    const saveEditor = () => {
        const draft = {
            ...editor.draft,
            command: normalizeCommand(editor.draft.command),
            hotkey: String(editor.draft.hotkey).slice(0, 1),
            beforeWaitMs: safeWaitMs(editor.draft.beforeWaitMs),
            afterWaitMs: safeWaitMs(editor.draft.afterWaitMs)
        };
        if (editor.mode === 'create') onCueAdd(editor.groupId, editor.index, draft); else onCueChange(editor.groupId, editor.cueId, draft);
        setEditor(null);
    };
    const wheelZoom = event => {
        event.preventDefault();
        const scroller = scrollRef.current;
        if (!scroller) return;
        const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pixelsPerSecond + (event.deltaY < 0 ? 1 : -1)));
        if (nextZoom === pixelsPerSecond) return;
        const pointerOffset = event.clientX - scroller.getBoundingClientRect().left;
        const nextScrollLeft = zoomScrollLeft({
            scrollLeft: scroller.scrollLeft,
            pointerOffset,
            oldPixelsPerSecond: pixelsPerSecond,
            newPixelsPerSecond: nextZoom
        });
        setPixelsPerSecond(nextZoom);
        requestAnimationFrame(() => {
            if (scrollRef.current) scrollRef.current.scrollLeft = nextScrollLeft;
        });
    };
    useEffect(() => {
        const scroller = scrollRef.current;
        if (collapsed || !scroller) return undefined;
        scroller.addEventListener('wheel', wheelZoom, {passive: false});
        return () => scroller.removeEventListener('wheel', wheelZoom);
    }, [collapsed, pixelsPerSecond]);
    const extendIfNeeded = event => {
        const node = event.currentTarget;
        if (node.scrollWidth - node.clientWidth - node.scrollLeft < 500) setCanvasDurationMs(value => extendTimelineDuration(value, value + 60000));
    };
    const frameLabelStep = Math.max(1, Math.ceil(48 * framesPerSecond / pixelsPerSecond));

    return <section aria-label="Cue timeline"
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    onContextMenu={event => event.preventDefault()}>
        <header
            className={`flex flex-wrap items-center gap-3 bg-slate-50 px-4 py-3 dark:bg-slate-900 ${collapsed ? '' : 'border-b border-slate-200 dark:border-slate-700'}`}>
            <button
                className="h-10 w-10 rounded-md border border-slate-300 bg-white text-base font-bold dark:border-slate-600 dark:bg-slate-900"
                aria-label={collapsed ? 'Expand cue timeline' : 'Collapse cue timeline'} aria-expanded={!collapsed}
                onClick={() => feedback.trigger('collapse', () => onCollapsedChange(!collapsed))}><span data-testid="timeline-collapse-icon" onAnimationEnd={feedback.clear} className={`inline-block ${feedback.bouncing === 'collapse' ? 'toggle-bounce' : ''}`}>{collapsed ? '+' : '−'}</span></button>
            <div><p
                className="text-sm font-bold uppercase tracking-[.2em] text-cyan-600 dark:text-cyan-400">Timeline</p><h2
                className="text-xl font-black">Cue timeline</h2></div>
            <TimelineNow />
            {!collapsed && <div className="ml-auto flex items-center gap-2" aria-label="Timeline zoom controls">
                <label className="flex items-center gap-1 text-sm font-bold">FPS<input className="h-10 w-16 rounded-md border border-slate-300 bg-white px-2 font-mono dark:border-slate-600 dark:bg-slate-900" type="number" min="1" max="120" aria-label="Timeline frames per second" value={framesPerSecond} onChange={event => setFramesPerSecond(Math.min(120, Math.max(1, Number(event.target.value) || 1)))}/></label>
                <button
                    className="h-10 w-10 rounded-md border border-slate-300 bg-white text-base font-bold hover:border-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-cyan-400"
                    aria-label="Zoom timeline out"
                    onClick={() => setPixelsPerSecond(value => Math.max(MIN_ZOOM, value - 1))}>−
                </button>
                <span className="w-20 text-center font-mono text-sm">{pixelsPerSecond}px/s</span>
                <button
                    className="h-10 w-10 rounded-md border border-slate-300 bg-white text-base font-bold hover:border-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-cyan-400"
                    aria-label="Zoom timeline in"
                    onClick={() => setPixelsPerSecond(value => Math.min(MAX_ZOOM, value + 1))}>+
                </button>
            </div>}</header>
        {!collapsed && <>
            <div ref={scrollRef} className="overflow-x-auto" data-testid="timeline-scroll" onScroll={extendIfNeeded}>
                <div style={{minWidth: LABEL_WIDTH + canvasWidth}}>
                    <div
                        className="flex h-8 border-b border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80">
                        <div
                            className="sticky left-0 z-20 shrink-0 border-r border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
                            style={{width: LABEL_WIDTH}}/>
                        <div className="relative" style={{width: canvasWidth}}>{marks.map(mark => <span key={mark}
                                                                                                        className="absolute bottom-1 font-mono text-xs text-slate-500 dark:text-slate-400"
                                                                                                        style={{left: msToPixels(mark, pixelsPerSecond)}}>{mark / 1000}s</span>)}</div>
                    </div>
                    <div className="flex h-6 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/80">
                        <div className="sticky left-0 z-20 shrink-0 border-r border-slate-200 dark:border-slate-700" style={{width: LABEL_WIDTH}}/>
                        <div className="relative" style={{width: canvasWidth}}>{Array.from({length: Math.floor(canvasDurationMs / 1000 * framesPerSecond) + 1}, (_, frame) => frame).filter(frame => frame % frameLabelStep === 0).map(frame => <span key={frame} className="absolute bottom-1 font-mono text-[10px] text-slate-400" style={{left: msToPixels(frame * 1000 / framesPerSecond, pixelsPerSecond)}}>{frame}f</span>)}</div>
                    </div>
                    {groups.map(group => {
                        const layout = layoutCues(group.cues);
                        const groupEndMs = layout.at(-1)?.endMs ?? 0;
                        return <div key={group.id}
                                    className="flex h-20 border-b border-slate-200 last:border-b-0 dark:border-slate-800">
                            <div
                                className="sticky left-0 z-20 flex shrink-0 items-center border-r border-slate-200 bg-slate-100 px-3 dark:border-slate-700 dark:bg-slate-900"
                                style={{width: 'clamp(96px, 24vw, 152px)', backgroundColor: group.backgroundColor ? `${group.backgroundColor}18` : undefined}}><span className="truncate text-base font-bold"
                                                                   title={group.name}>{group.name}</span></div>
                            <div
                                className={`relative bg-slate-50 bg-[linear-gradient(to_right,rgba(100,116,139,.2)_1px,transparent_1px)] dark:bg-slate-950/80 dark:bg-[linear-gradient(to_right,rgba(100,116,139,.18)_1px,transparent_1px)] ${interaction?.mode === 'pan' ? 'cursor-grabbing' : 'cursor-grab'}`}
                                data-timeline-track={group.id}
                                style={{width: canvasWidth, backgroundColor: group.backgroundColor || undefined, backgroundSize: `${pixelsPerSecond}px 100%`}}
                                onPointerDown={beginPan} onContextMenu={event => openNew(event, group)}>
                                {layout.map(item => {
                                    const status = item.cue.status;
                                    const statusClass = status === 'LIVE' ? 'border-amber-300 bg-amber-500 text-slate-950' : status === 'DONE' ? 'border-emerald-400 bg-emerald-700' : item.cue.type === 'trigger' ? 'border-violet-400 bg-violet-800' : 'border-cyan-400 bg-cyan-800';
                                    const media = audioMediaByCueId[item.cue.id];
                                    const clipWidth = Math.max(MIN_CLIP_WIDTH, msToPixels(media?.durationMs || item.afterMs, pixelsPerSecond));
                                    const contentLabel = cueContentLabel(item.cue);
                                    return <div key={item.cue.id} role="button" tabIndex={0}
                                                aria-label={`${cueLabel(item.cue)} timeline cue`}
                                                data-cue-id={item.cue.id}
                                                className={`absolute top-3 flex h-14 select-none items-center overflow-hidden rounded-md border shadow-lg ${statusClass}`}
                                                style={{
                                                    left: msToPixels(item.startMs, pixelsPerSecond),
                                                    width: clipWidth,
                                                    backgroundColor: status === 'IDLE' && group.backgroundColor ? group.backgroundColor : undefined,
                                                    touchAction: 'none'
                                                }} onPointerDown={event => beginCue(event, group, item.cue, 'pending')}
                                                onContextMenu={event => openExisting(event, group, item.cue)}><span
                                        className="min-w-0 flex-1 px-3" title={`${cueLabel(item.cue)} · ${contentLabel}`}><span
                                        className="block truncate text-sm font-bold">{item.cue.type === 'audio' ? '♪ ' : item.cue.type === 'trigger' ? '↪ ' : '⌘ '}{cueLabel(item.cue)}</span>{media?.peaks?.length > 0 && <span data-testid={`audio-waveform-${item.cue.id}`} className="flex h-5 items-center gap-px px-1">{media.peaks.map((peak, index) => <i key={index} className="w-px bg-white/70" style={{height: `${Math.max(8, peak * 100)}%`}} />)}</span>}{clipWidth >= 180 && <span
                                        className="block truncate text-xs opacity-80">{contentLabel}</span>}</span><span
                                        role="separator" aria-label={`Resize ${cueLabel(item.cue)}`}
                                        className="h-full w-3 shrink-0 cursor-ew-resize border-l border-white/40 bg-black/20"
                                        onPointerDown={event => beginCue(event, group, item.cue, 'resize')}/></div>;
                                })}
                                {group.loopEnabled && <><span aria-label={`Loop start for ${group.name}`}
                                                              className="pointer-events-none absolute top-0 z-20 -translate-x-1/2 text-base text-cyan-300"
                                                              style={{left: 0}}>↻</span><span
                                    aria-label={`Loop end for ${group.name}`}
                                    className={`pointer-events-none absolute z-20 -translate-x-1/2 text-base text-cyan-300 ${groupEndMs === 0 ? 'top-5' : 'top-0'}`}
                                    style={{left: msToPixels(groupEndMs, pixelsPerSecond)}}>↻</span></>}
                                <TimelinePlayhead group={group} groupEndMs={groupEndMs}
                                                  pixelsPerSecond={pixelsPerSecond}/>
                            </div>
                        </div>;
                    })}
                    {!groups.length &&
                        <p className="p-6 text-center text-base text-slate-500 dark:text-slate-400">Add a cue group to
                            begin editing the timeline.</p>}
                </div>
            </div>
            <footer
                className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">Left-drag
                empty space to pan · wheel to zoom · right-click to add or edit · drag cues to retime
            </footer>
            {editor && <CueEditor editor={editor} groups={groups}
                                  onChange={draft => setEditor(current => ({...current, draft}))}
                                  onCancel={() => setEditor(null)} onSave={saveEditor} onRemove={() => {
                onCueRemove(editor.groupId, editor.cueId);
                setEditor(null);
            }}/>}</>}
    </section>;
}
