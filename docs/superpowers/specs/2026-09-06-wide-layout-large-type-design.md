# Wide Layout and Large Typography

## Goal

Use 90% of the browser window for application content and make text throughout Mini QLab easier to read.

## Layout

- The toolbar's inner content and the main workspace use `width: 90%` and remain horizontally centered.
- The existing fixed 1600px content cap is removed so the interface scales with large displays.
- Existing responsive wrapping and cue-table horizontal scrolling remain intact on narrow windows.

## Typography

- Increase existing extra-small text to small text and small text to base text.
- Increase prominent headings by one typography step.
- Increase the timeline ruler from 10px to 12px.
- Increase control height or padding only where larger text would otherwise clip.
- Preserve monospaced text, font weights, semantic colors, and the relative hierarchy between labels, content, and headings.

## Scope

- Apply the changes across the toolbar, workspace headings, cue groups, cue table, timeline and its editor, active-cue panel, cue log, status message, and empty states.
- Do not alter cue timing, timeline scale, data, persistence, or playback behavior.

## Verification

- Add regression assertions for the 90% containers and representative enlarged typography.
- Run the complete automated test suite and production build.
- Inspect the application in a browser at desktop and narrower viewport widths in both themes.

