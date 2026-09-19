# Collapsible Timeline and WebSocket Panel

## Goal

Reduce rendering work when the timeline is not needed and separate WebSocket configuration and transport history from cue activity.

## Timeline Panel

- Add an accessible collapse/expand button to the timeline header.
- While collapsed, retain only the timeline header and unmount the ruler, tracks, playheads, cue editor, footer instructions, and their pointer/wheel behavior.
- Persist the collapsed state in local storage and restore it when the application opens.
- Cue playback and scheduling continue normally while the timeline is collapsed.

## Cue Log

- Keep cue dispatches, trigger results, ignored-trigger warnings, and late-dispatch warnings in the existing Cue log.
- Remove WebSocket controls and transport status from the Cue log header.
- Keep the current 200-entry cue-log limit.

## WebSocket Panel

- Add a separate panel below the Cue log.
- Its header contains enable, host, port, and connection-status controls.
- Add an accessible collapse/expand button and persist its collapsed state.
- Its dedicated event log records connecting, connected, disconnected, errors, successful sends, and send failures.
- Each entry includes a timestamp, event type, and useful detail without duplicating unrelated cue events.
- Keep a 200-entry WebSocket-log limit.

## State and Data Flow

- `PAGEXQ` owns persisted panel state, WebSocket configuration, and WebSocket log entries.
- `TimelineEditor` receives its collapsed state and toggle callback and avoids constructing visible timeline content while collapsed.
- Cue dispatch continues writing to the cue log and TX store. WebSocket delivery additionally writes a transport result to the WebSocket log.

## Error Handling

- Invalid or incomplete WebSocket settings leave the connection off and add a useful transport event when connection is attempted.
- Connection construction, runtime errors, close events, and send failures are isolated in the WebSocket log.
- Transport failures do not stop cue playback or remove cue-log entries.

## Verification

- Test that collapsed timeline content is unmounted and restored.
- Test persistence of both panel collapse states.
- Test that cue events and WebSocket events appear only in their respective logs.
- Run the complete test suite and production build.
- Inspect expanded and collapsed panels in the browser at desktop and narrow widths.

