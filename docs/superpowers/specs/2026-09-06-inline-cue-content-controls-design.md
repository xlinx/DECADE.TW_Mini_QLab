# Inline Cue Content Controls

## Goal

Arrange cue type and content controls horizontally so related selections can be read and edited on one row.

## Table Layout

- A command cue uses a two-column row: cue type and command.
- A trigger cue uses a three-column row: cue type, target group, and target cue.
- The Type / Content cell receives enough minimum width to keep the controls usable.
- The existing cue-table horizontal scrolling remains available when the viewport cannot fit the full table.

## Timeline Editor Layout

- The timeline popup uses the same two-column command layout and three-column trigger layout.
- The popup widens as needed on desktop and stays constrained to the viewport on small screens.
- Remaining fields keep their current grouping and behavior.

## Behavior

- No cue type, target resolution, validation, persistence, or playback behavior changes.
- Changing target group continues to clear the selected target cue.

## Verification

- Add layout assertions for command and trigger controls.
- Run the complete test suite and production build.
- Inspect command and trigger states in the browser at desktop and narrow widths.

