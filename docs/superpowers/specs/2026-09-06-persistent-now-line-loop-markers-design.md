# Persistent Now Line and Loop Markers Design

## Goal

Make playback position continuously visible on every cue-group track and visually mark the boundaries of loop-enabled groups.

## Now-Line Behavior

Each group track owns an independent red now line. A group that has never run displays its line at `0s`.

While a sequence runs, its position is derived from the existing cue timing and runtime progress fields:

- During a cue's before-wait, the line advances from the preceding cue's end toward the cue's visual start using `beforeProgress`.
- During a cue's after-wait, the line advances from that cue's start toward its end using `afterProgress`.
- At sequence completion, the line reaches the final cue's end.
- When a loop begins another pass, the line returns to the start and advances again.

`TimelineEditor` remembers the most recently derived position for each group. When a sequence stops and the engine resets cue runtime fields, the line remains at that last position. This remembered position is presentation state only and is not exported or stored in local storage.

If a group is removed, its remembered position is removed. If edits shorten the group while it is idle, its remembered position is clamped to the group's new end. Empty groups always show the line at `0s`.

## Smooth Motion

Active now lines use `requestAnimationFrame` to interpolate between observed engine progress updates. Each runtime update re-anchors the visual line to the engine-derived position and refreshes its short forward projection, preventing accumulated drift. The animation never changes cue state or engine timing.

STOP cancels forward interpolation immediately and retains the last rendered position. Completion settles exactly on the group end. A looping group returns to `0s` only when runtime state shows that a new pass has begun.

When the browser reports `prefers-reduced-motion: reduce`, the line uses direct engine-derived position updates without interpolation.

## Loop Markers

When `loopEnabled` is true, the track displays small repeat icons at both playback boundaries:

- the track head at `0s`;
- the calculated end of the group's final cue.

The markers are display-only, do not accept pointer input, and do not modify loop execution. Their accessible labels identify the group and whether the marker is the loop start or end. For an empty group, both markers share the `0s` position but are offset vertically so both remain recognizable.

## Architecture

The existing cue engine, event API, cue schema, and persistence remain unchanged. A pure timeline helper calculates the best observable position from cue layout and runtime fields. `TimelineEditor` maintains group-id-to-position animation records, updates them when observable progress changes, and renders the persistent lines and loop markers.

## Error Handling

- Progress values are clamped to the `0–100` range.
- Missing or non-finite progress and timing values are treated as zero.
- Remembered positions cannot become negative or exceed the current group end.
- Runtime transitions with no active progress retain the previously observed position.
- Animation frames are cancelled when no group is moving or when the timeline unmounts.

## Testing

Unit tests cover before-wait position, after-wait position, interpolation, completion, malformed progress, and end clamping.

Component tests verify:

- every track has a line at `0s` before playback;
- each group maintains an independent position;
- stop retains the last observed position;
- completion leaves the line at the group end;
- loop restart returns the line to the beginning;
- active lines update smoothly without exceeding the engine-derived projection;
- reduced-motion mode uses direct progress updates;
- loop markers appear only for loop-enabled groups and align with group start and end;
- empty loop-enabled groups show both markers at `0s`.

## Acceptance Criteria

The feature is complete when each cue-group track always displays its independent red now line, idle lines retain their last playback position, and loop-enabled tracks show non-interactive repeat icons at their start and end without changing execution or persisted cue data.
