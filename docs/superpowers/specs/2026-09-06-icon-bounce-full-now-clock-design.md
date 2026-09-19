# Icon bounce and full now-clock design

## Goal

Keep toggle feedback visible without moving controls, and display complete local wall-clock time in the timeline header.

## Full now clock

- The timeline header readout changes from `NOW mm:ss.mmm` to `NOW HH:mm:ss.mmm` using local 24-hour time.
- Hours, minutes, seconds, and milliseconds are each zero-padded. The existing isolated animation-frame update loop remains unchanged.

## Icon-only toggle feedback

- Toggle container buttons and labels no longer receive the bounce class; their dimensions and position remain stable.
- A compact state indicator inside each toggle receives the one-shot animation instead:
  - Toolbar active-cues and theme controls receive small state dots.
  - Timeline and WebSocket collapse controls receive their plus/minus glyph as the animated indicator.
  - Cue-group mode dots animate, not the checkbox label.
  - The WebSocket enable/status dot animates, not its label.
  - The group color picker receives a swatch indicator that reflects the selected color and animates after color changes.
- The existing `prefers-reduced-motion` handling continues to disable animation.

## Verification

- Update formatter unit coverage for hour padding and the complete `HH:mm:ss.mmm` result.
- Component tests verify the timeline clock output and that toggle shells remain unanimated while their indicators receive and clear the animation class.
- Verify color picker feedback targets its swatch and preserves group color persistence.
