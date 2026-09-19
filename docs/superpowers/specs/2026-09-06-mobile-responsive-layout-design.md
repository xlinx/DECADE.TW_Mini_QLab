# Mobile responsive layout design

## Goal

Make Mini QLab practical to operate and edit on a phone without changing the established tablet and desktop workspace.

## Breakpoints and page shell

- The mobile layout applies below `640px` (Tailwind's `sm` breakpoint).
- The page remains usable from the existing `320px` minimum viewport width upward, with no accidental document-level horizontal overflow.
- The toolbar uses a compact, wrapping layout below the breakpoint. GO-ALL and STOP-ALL remain visible primary controls; the remaining controls flow onto subsequent rows without shrinking text or touch targets below their current minimum height.
- At `sm` and above, retain the existing desktop toolbar and workspace geometry.

## Cue groups

- Expanded groups render a mobile cue-card editor below `sm`; the desktop cue table remains the only presentation at `sm` and above.
- Each card includes the cue status, name, type and command or trigger targets, hotkey, LTC trigger, cron value and next-run metadata, before/after waits with progress, and the existing insert, move, and delete actions.
- Card inputs use the existing controlled updates and labels, so validation, normalization, persistence, playback, and accessibility behavior are shared with the table rather than reimplemented.
- Group controls wrap at small widths. Color selection, reset, group modes, and GO/STOP remain available.

## Timeline

- The timeline remains a horizontally scrollable precision surface on all viewport sizes; it is not compressed into an unreadable mini timeline.
- On mobile, the group-name gutter narrows and timeline controls can wrap. Cue clips retain their existing touch drag, resize, right-click/edit, and wheel/trackpad zoom behavior where the device provides those inputs.
- The current adaptive cue labels continue to show the cue name, then content only when the clip has enough rendered width.

## Verification

- Add component coverage that verifies mobile view renders cue cards and does not render the desktop table.
- Verify desktop view continues to render the table and its resizable column controls.
- Cover command and trigger card fields plus cue actions sufficiently to prove they call the established update callbacks.
- Run the full feature suite excluding the known unrelated packaging assertion caused by the user-owned `vite.config.js` `build2` key.
