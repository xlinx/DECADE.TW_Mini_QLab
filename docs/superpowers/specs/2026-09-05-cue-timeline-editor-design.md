# Cue Timeline Editor Design

## Goal

Add a Premiere-style timeline editor that presents every cue group as a track and keeps timeline edits synchronized with the existing cue-list editor. Users can retime, resize, and reorder cues from the timeline without introducing a second source of cue data.

## Scope

The timeline supports these editing operations:

- Drag a cue horizontally to change its `beforeWaitMs`.
- Resize a cue from its right edge to change its `afterWaitMs`.
- Drag a cue vertically within its own group track to reorder that group's cues.
- Reflect edits from the cue table immediately in the timeline and timeline edits immediately in the cue table and persisted data.

Cues cannot move between groups. The feature does not add explicit start-time or duration fields, multiselect, transitions, media thumbnails, or changes to cue execution semantics.

## Architecture

`MiniQLab` remains the owner of the `groups` state. The timeline receives groups plus the same cue-update and cue-move callbacks used by the cue-list UI. It derives all visual geometry from the cue array and its existing wait fields; it does not maintain a second timeline model.

The feature is split into focused units:

- `TimelineEditor`: panel controls, ruler, scrolling, zoom, and group tracks.
- `TimelineTrack`: one cue group's label and editable cue lane.
- `TimelineCue`: one pointer-editable cue clip with a resize handle.
- Timeline utility module: deterministic time-to-pixel conversion, cumulative placement, snapping, and clamping.

Pointer interaction state is temporary UI state. Committed timing and order always live in `groups`.

## Timing Model and Geometry

Each group is an independent sequential track. For cue `n`:

- Its visual start is the sum of all preceding cues' `beforeWaitMs + afterWaitMs`, plus its own `beforeWaitMs`.
- Its logical width is its `afterWaitMs`.
- A zero or very short `afterWaitMs` uses a minimum rendered width so the cue remains visible and editable. The minimum visual width does not alter stored timing.

The ruler and clip geometry share one zoom value expressed as pixels per second. Zoom controls alter only presentation. The timeline scrolls horizontally when its derived duration exceeds the viewport.

Horizontal drag converts pointer delta to milliseconds, snaps it to the grid, and updates only the dragged cue's `beforeWaitMs`. Because groups execute sequentially, this naturally moves later cues as a ripple without modifying their stored values. Right-edge resize performs the same conversion but updates only `afterWaitMs`.

The default snap interval is 100 milliseconds. Timing values are finite non-negative integers after every edit.

## Reordering

Dragging a cue vertically within its current track changes its array position. The insertion target is determined from the pointer's horizontal position relative to the other cue centers, allowing rearrangement within the lane while preventing cross-group moves. Reordering preserves the cue object, including its id, timing, trigger configuration, and runtime status.

Clicking or making a horizontal gesture does not reorder. A movement threshold distinguishes a click from a drag, and the active operation is locked once classified as move, resize, or reorder.

## Synchronization and Persistence

Timeline edits use the existing `updateCue` and cue-order update paths in `PAGEXQ.jsx`. Consequently:

1. A pointer edit commits a cue field or ordering change.
2. React updates the shared `groups` state.
3. Both the timeline and cue table rerender from that state.
4. The existing local-storage persistence saves the updated group configuration.

Import, group creation/removal, and table insertion/removal require no timeline-specific synchronization because the timeline always derives its contents from `groups`.

## Playback Feedback

Cue clips reuse the existing status vocabulary:

- `IDLE`: neutral clip styling.
- `LIVE`: highlighted active styling with before-wait progress.
- `DONE`: completed styling.

The active playhead is derived from the running cue and its existing progress fields. It is display-only and does not seek or alter playback. When no cue is active, no animated playhead is shown.

## Accessibility and Responsive Behavior

Every cue clip has an accessible name containing its cue number or command. Timing values remain editable through the existing table, which is the keyboard-accessible fallback. Resize handles have explicit labels. Pointer capture keeps drag operations stable when the pointer leaves a clip.

The track-name column remains visible while the time area scrolls horizontally. On narrow screens the timeline keeps a usable minimum time-area width and scrolls inside its panel instead of widening the page.

## Error Handling

- Missing, negative, non-finite, or malformed wait values are treated as zero for geometry.
- Committed values are clamped to non-negative integers.
- Pointer cancellation or component unmount discards temporary interaction state.
- A disappearing cue or group ends the active gesture without mutating another cue.
- Cross-group pointer movement never transfers a cue.

## Testing

Unit tests cover cumulative cue placement, milliseconds/pixel conversion, snapping, zero-value handling, and clamping.

Component and integration tests cover:

- rendering one synchronized track per group;
- table timing edits updating clip geometry;
- horizontal dragging updating `beforeWaitMs`;
- right-edge resizing updating `afterWaitMs`;
- reordering only within the current group;
- preventing cross-group transfer;
- preserving cue identity and fields while reordering;
- imported, inserted, and removed cues appearing correctly;
- status and active-playhead feedback;
- persistence through the existing storage flow.

## Acceptance Criteria

The feature is complete when every cue and cue group appears in the timeline, table and timeline edits stay synchronized, users can drag and resize cue clips using the agreed wait-field mapping, cues can be reordered only inside their group, playback behavior remains unchanged, and the full automated test suite passes.
