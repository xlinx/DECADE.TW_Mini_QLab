# Timeline Wheel Capture

## Goal

Ensure mouse-wheel input over an expanded timeline controls only timeline zoom and never scrolls the browser page.

## Behavior

- Install a native `wheel` event listener on the timeline scroll container with `passive: false`.
- The handler always calls `preventDefault()` while the timeline is expanded, including when zoom is already at its minimum or maximum.
- The handler retains the current zoom calculation and pointer-anchored scroll adjustment.
- Remove the React `onWheel` binding so the event is processed once.
- Collapsed timelines have no scroll container and therefore no wheel listener.

## Verification

- Add a test that dispatches a cancelable wheel event to the timeline scroll container and verifies that it is prevented.
- Verify zoom still changes from wheel input.
- Run the complete test suite and production build.

