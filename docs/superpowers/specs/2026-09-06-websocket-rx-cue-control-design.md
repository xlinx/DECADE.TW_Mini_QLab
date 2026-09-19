# WebSocket received cue-control design

## Goal

Allow incoming WebSocket messages to start or stop cues by name, including every cue with the same name across groups.

## Accepted messages

- The receiver accepts either plain text paths or JSON objects containing a string `command` field.
- Valid paths are exactly `/cue/<cue_name>/start` and `/cue/<cue_name>/stop` after trimming whitespace. The action is case-insensitive; the cue-name path segment is URI-decoded and compared case-insensitively to cue names.
- Names are a single path segment. A sender must percent-encode a slash in a cue name. Other JSON payloads, malformed JSON, malformed paths, and unsupported actions are ignored safely and recorded as warnings.

## Start and stop behavior

- `start` finds every matching cue in every group, including duplicate cue names in separate groups, and starts each as a single-cue engine run with source `websocket`.
- A start replaces only an existing run in the same target group, following the engine's existing start behavior; it never starts adjacent cues.
- `stop` finds running groups whose currently active single cue has the matching name and stops only those runs. It does not stop a regular sequence simply because it contains a cue of that name.
- Matching is performed from the current group state at message receipt.

## Observability

- Every received payload is recorded in the WebSocket event log.
- Accepted controls produce an info cue-log entry that names the action, target, and number of matching cues acted on.
- Invalid, unsupported, or no-match commands produce warning entries and do not mutate playback.

## Verification

- Unit-test parsing plain text, JSON, URI-encoded names, malformed messages, and unsupported actions.
- Component-test starting duplicate cue names in distinct groups, stopping only matching WebSocket single-cue runs, and logging accepted and rejected commands.
- Run the feature suite excluding the known unrelated packaging assertion caused by the user-owned `vite.config.js` `build2` key.
