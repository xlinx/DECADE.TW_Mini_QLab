# Trigger Cue Design

## Goal

Add a special cue that targets another cue by unique group name and cue name. When dispatched, it starts the target group's sequence at the named cue and continues through the remaining cues.

## Naming Model and Migration

Replace the cue `number` field with a required `name` field throughout the cue table, timeline, editor, imports, exports, events, and documentation.

Backward-compatible hydration maps a legacy cue's `number` to `name` when `name` is absent. Newly persisted and exported data contains `name` only. Runtime code reads `name`; it does not maintain two synchronized naming fields.

Group names must be unique across the complete cue list. Cue names must be unique within their group. Names are trimmed for validation and compared case-insensitively so `Intro` and `intro` conflict. Display casing is preserved.

Edits that would create a duplicate or empty name are rejected with an actionable status message. Imports with duplicate or empty group/cue names fail validation rather than silently renaming or selecting the first match.

## Cue Types

Every cue has a `type`:

- `command`: the existing cue behavior and default for migrated data.
- `trigger`: an internal cue that starts another group from a named cue.

A trigger cue stores `targetGroupName` and `targetCueName`. Its wait, cron, LTC, and hotkey fields work like any other cue. Its command field is not dispatched to external consumers or WebSocket transport.

The cue table and timeline context editor expose the cue type. Selecting `trigger` replaces or disables command editing and presents target-group and target-cue selectors populated from the current group state. Choosing a target group resets an incompatible cue selection.

## Execution Flow

The cue engine remains responsible for timing and sequential execution. When a command cue reaches its dispatch point, it emits the existing `cue:dispatched` event. When a trigger cue reaches its dispatch point, it emits `cue:target-requested` with its target names and does not emit an external command dispatch.

`MiniQLab` handles `cue:target-requested`:

1. Resolve the group by case-insensitive unique name.
2. Resolve the cue within that group by case-insensitive unique name.
3. Check whether the target group is already running.
4. Start the group at the target cue if resolution succeeds and the group is idle.
5. Record the result in the cue log.

`CueEngine.start` gains a `startCueId` option distinct from `singleCueId`. `startCueId` selects the first cue and then follows normal sequential and loop behavior. Existing cron, LTC, and hotkey single-cue runs continue to use `singleCueId` and remain unchanged.

The engine exposes `isRunning(groupId)` as a read-only running-state query.

## Running Targets and Recursion Safety

If the target group is already running, the request is ignored. The engine does not restart or alter that run, and the cue log receives a warning naming the source cue and target group.

This rule also bounds self-targets and circular chains. A self-target finds its source group running and is rejected. In an `A → B → A` chain, the final request back to A is rejected because A is still running. No separate recursion counter is required.

## Logging and Events

Successful internal triggers add an informational cue-log entry containing source group/cue and target group/cue. Ignored or invalid triggers add a warning entry with the reason:

- target group is already running;
- target group does not exist;
- target cue does not exist.

Warning entries are visually distinct from dispatched-command entries and are not sent over WebSocket. The public `onEvent` callback receives `cue:target-requested` plus a result event describing success or rejection, allowing hosts to observe internal routing.

## State and Validation Boundaries

Pure cue helpers handle normalized-name comparison, uniqueness validation, and legacy migration. `MiniQLab` owns cross-group resolution because it already owns current group state. `CueEngine` receives resolved ids and does not search application state by display names.

Renaming a group or cue does not silently rewrite trigger targets. A stale reference remains visible in the editor and produces a clear warning if fired. This avoids an edit unexpectedly changing many cues; users can explicitly select the new target.

## Error Handling

- Empty or duplicate names cannot be saved.
- Invalid imported naming fails the entire import and preserves current state.
- A missing target never dispatches an external command.
- An already-running target remains untouched.
- Deleting or renaming a target does not crash trigger-cue rendering or execution.
- A trigger cue still completes its own before/after-wait lifecycle after its target request.

## Testing

Unit tests cover:

- legacy `number` to `name` migration;
- name trimming and case-insensitive uniqueness;
- trigger-cue schema hydration and persistence;
- `startCueId` execution through the remaining sequence;
- `isRunning` during and after execution;
- trigger cues emitting target requests without command dispatches.

Integration tests cover:

- creating and editing command and trigger cues;
- target selectors and incompatible-selection reset;
- successful cross-group start from the named cue;
- target cue and subsequent cues executing with normal waits;
- ignored requests to running groups;
- self-target and circular-chain rejection;
- missing or renamed target warnings;
- informational and warning cue-log presentation;
- command-only WebSocket delivery;
- validation failures preserving existing data.

## Acceptance Criteria

The feature is complete when cues use unique names instead of numbers, a trigger cue can select a unique target group and cue, firing it starts the idle target group at that cue and continues normally, running or invalid targets are ignored with warning logs, and external command dispatch behavior remains unchanged for ordinary cues.
