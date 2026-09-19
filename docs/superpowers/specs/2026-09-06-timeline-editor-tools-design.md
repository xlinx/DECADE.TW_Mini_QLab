# Timeline Editor Tools Design

## Goal

Extend the cue timeline into a basic editor covering cue creation, removal, full-content editing, cue movement, timeline panning, and wheel zoom. The time domain begins at zero and can extend forward without a fixed upper limit.

## Interaction Model

The timeline distinguishes interactions by target and mouse button:

- Left-drag on empty track space pans the timeline.
- Left-drag on a cue changes that cue's `beforeWaitMs` using the existing 100 ms snap grid.
- Left-drag on a cue's right resize handle changes its `afterWaitMs`.
- A vertical-first cue drag reorders that cue within its current group only.
- Mouse-wheel movement over the timeline zooms in or out.
- Right-click on empty track space opens a full editor for a new cue at the clicked time.
- Right-click on an existing cue opens the full editor for that cue.

The native browser context menu is suppressed only within the timeline editor.

## Infinite Forward Timeline

The timeline uses an elastic DOM canvas rather than a permanently enormous element. It starts wide enough to cover the current cues and viewport. When the viewport approaches the right edge, the canvas extends by another time segment. There is no user-visible maximum time.

The left edge is always time `0`; panning cannot expose negative time. Empty-space left-drag changes the timeline scroll position and does not change cue data.

Zoom remains bounded to keep labels and clips usable, but those presentation bounds do not restrict the time domain. Wheel zoom is anchored at the pointer: after changing pixels per second, scroll position is corrected so the time beneath the pointer remains in the same screen position. The wheel event prevents page scrolling only while the pointer is over the timeline.

## Cue Editor

A single context editor serves both creation and modification. It exposes:

- cue number;
- command;
- one-character hotkey;
- LTC trigger;
- cron expression;
- before-wait in milliseconds;
- after-wait in milliseconds.

For an existing cue, the editor opens with a draft copy. Save commits all fields through the shared group state, Cancel discards the draft, and Remove deletes the cue after the user explicitly presses the destructive action.

For empty-space creation, the editor opens with a new draft whose visual start equals the clicked time and whose default `afterWaitMs` is 1000. Saving inserts it into the clicked group in chronological order. Its `beforeWaitMs` is the non-negative gap between the preceding cue's end and the clicked time. If the click lies inside a preceding cue or before the calculated insertion boundary, the before-wait is clamped to zero. Cancel creates nothing.

Command values use the existing command normalizer when saved. Hotkeys are limited to one character. Wait values are converted to finite non-negative integers. Other fields use the same string representation as the cue table.

The editor is positioned beside the context-click location when space allows and kept inside the timeline panel or viewport. Escape and clicking outside cancel it. Form interaction never begins a pan or cue drag.

## State and Data Flow

`MiniQLab` remains the sole owner of `groups`. `TimelineEditor` receives explicit callbacks for cue creation, replacement, removal, and reordering. The context editor stores only temporary draft data.

Every saved timeline operation updates the same cue objects consumed by the cue table, engine, import/export, and local-storage persistence. No independent timeline records or explicit start-time fields are added.

Elastic canvas duration, zoom, scroll position, pan state, and editor draft are presentation state and are not persisted.

## Error and Gesture Handling

- Pointer cancellation ends a pan, drag, resize, or reorder safely.
- A removed group or cue closes its related editor and cancels its gesture.
- Right-click never starts left-button drag behavior.
- Dragging an interactive editor control never pans the timeline.
- Scroll position and zoom calculations are guarded against missing geometry and non-finite values.
- Removing a running cue uses the existing state update path; the cue engine itself is unchanged.

## Testing

Unit tests cover canvas extension, zoom anchoring calculations, cue insertion placement, normalization, and zero-time clamping.

Integration tests cover:

- empty-space left-drag panning without cue mutation;
- inability to pan before zero;
- canvas extension near the right edge;
- mouse-wheel zoom in and out around the pointer;
- right-click creation with a 1000 ms default after-wait;
- right-click editing of every cue field;
- Save, Cancel, outside-click, Escape, and Remove behavior;
- existing cue move, resize, and within-group reorder behavior;
- immediate synchronization with the cue table and local storage;
- native context-menu suppression limited to the timeline.

## Acceptance Criteria

The feature is complete when users can navigate an unlimited forward timeline using left-drag pan and wheel zoom, add cues through an empty-space right-click, modify or remove cues through a cue right-click, retain the existing drag/resize/reorder behavior, and observe all saved edits immediately in the cue table and persisted group data without changing cue execution semantics.
