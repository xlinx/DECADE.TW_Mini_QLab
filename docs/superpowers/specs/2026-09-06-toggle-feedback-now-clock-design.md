# Toggle feedback and timeline now-clock design

## Goal

Provide clear, restrained feedback for state changes and a precise current-time reference in the timeline header.

## Toggle feedback

- State-toggle controls use a one-shot CSS bounce when their state changes: theme, active-cue-panel visibility, timeline and WebSocket panel collapse, and cue-group mode checkboxes.
- The effect is a brief scale-down then scale-up animation of roughly 180ms. It does not loop and is removed after it completes so a later toggle can replay it.
- Action controls, including GO, STOP, add, remove, import, export, and cue movement controls do not receive the effect.
- `prefers-reduced-motion: reduce` disables the animation while preserving the state change.
- A small reusable React hook owns temporary feedback state, allowing controls to compose their existing callbacks with the animation without altering persisted values or playback behavior.

## Timeline now clock

- The timeline header shows a compact monospaced `NOW mm:ss.mmm` readout.
- It represents wall-clock local time modulo one hour: minutes, seconds, and milliseconds. This avoids introducing a new transport position and remains meaningful when no cue is running.
- The readout updates with `requestAnimationFrame` while mounted so milliseconds advance smoothly; its update is isolated to the clock component and does not re-render timeline tracks or cue groups.
- It remains visible when the timeline is collapsed. At narrow widths it wraps naturally with the existing header controls.

## Verification

- Unit test the clock formatter at minute, second, and millisecond boundaries.
- Component tests verify the NOW readout is present even when collapsed.
- Component tests verify toggles acquire feedback on interaction and can replay after the animation end.
- Respect the existing reduced-motion base rule and run the feature suite excluding the known unrelated packaging assertion caused by the user-owned `vite.config.js` `build2` key.
