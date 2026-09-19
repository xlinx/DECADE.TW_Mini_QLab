# Background Playback Resilience

## Goal

Make cue playback resilient when a browser tab loses focus, becomes hidden, or resumes after timer throttling, and allow the Electron build to keep scheduling while minimized.

## Browser Scheduling

- Cue phases use absolute deadlines rather than depending on the number or frequency of timer ticks.
- Each phase schedules its completion against its deadline. If a callback runs late, playback immediately advances using the current wall-clock time.
- When the document becomes visible again, the cue engine reconciles every active run against the current time so overdue phase transitions execute without waiting for another throttled progress tick.
- Progress rendering remains derived from absolute timestamps. The playhead can pause visually while hidden and returns to the correct position when rendering resumes.

## Late Dispatch Reporting

- A command dispatched after its intended deadline includes its lateness in milliseconds.
- Late dispatches are added to the cue log with warning styling while preserving the normal command event and WebSocket dispatch.
- On-time commands keep the existing log presentation.

## Electron

- Set `backgroundThrottling: false` in the BrowserWindow web preferences so renderer timers and WebSocket processing continue while the window is unfocused or minimized.

## Limitations

- A normal browser may completely freeze or discard a background tab. JavaScript cannot dispatch during that frozen interval.
- After execution resumes, overdue cues run in sequence immediately based on their absolute deadlines; the app does not claim hard real-time guarantees in browser mode.
- Computer sleep and operating-system suspension have the same catch-up behavior.

## Verification

- Add deterministic engine tests that delay timer callbacks and verify deadline-based catch-up and lateness metadata.
- Add an integration test for visibility-resume reconciliation and warning logging.
- Assert the Electron background-throttling preference.
- Run the complete test suite and production build.

