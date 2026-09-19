# Cue Group Background Colors

## Goal

Allow each cue group to use a user-selected background color for faster visual identification.

## Interaction

- Add a labeled native color picker to each cue-group header.
- Add a reset button that clears the group color and restores the normal theme background.
- The color picker and reset action update only their own cue group.

## Data and Persistence

- Add an optional `backgroundColor` property to cue groups.
- Accept only six-digit hexadecimal colors during hydration; invalid values are discarded.
- Include valid values in exported and locally persisted group data.
- Existing groups without a color retain the current theme styling unchanged.

## Appearance

- Apply the selected color as a subtle translucent panel tint rather than an opaque flat fill.
- Keep the header, inputs, table cells, footer, borders, and status colors readable in both themes.
- Do not change timeline tracks, cue clips, playback, or command behavior.

## Timeline Cue Labels

- Timeline cue blocks always show the cue name first.
- When a cue block has enough rendered width, show a secondary type/content label.
- Command cues show their normalized command as the secondary label.
- Trigger cues show `Trigger → target group / target cue` as the secondary label.
- Narrow cue blocks show only the name so labels remain readable and do not overcrowd the timeline.
- Label visibility responds to the current block width, including user timeline zoom and cue duration changes.

## Verification

- Test group creation, hydration, persistence, invalid-value rejection, color application, reset, and independent group updates.
- Test adaptive timeline labels for command and trigger cues at narrow and wide block widths.
- Run the complete test suite and production build.
- Inspect customized groups in light and dark themes.
