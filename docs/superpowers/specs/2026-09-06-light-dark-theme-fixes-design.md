# Light and Dark Theme Fixes

## Goal

Make the timeline and primary toolbar actions readable and visually consistent in both application themes.

## Design

- The timeline container, header, ruler, group labels, tracks, grid lines, borders, instructions, and empty state will use light colors by default and retain the existing slate palette under the `dark` class.
- Cue clips keep their semantic status colors in both themes so LIVE, DONE, trigger, and command cues remain recognizable.
- The DECADE.TW logo uses its original image colors in light mode and the existing inverted treatment only in dark mode.
- GO-ALL and STOP-ALL use explicit high-contrast text colors in both themes, independent of the shared toolbar button theme styles.

## Components

- `Toolbar.jsx` owns theme-aware logo and primary-action presentation.
- `TimelineEditor.jsx` owns theme-aware timeline presentation.
- No cue data, timing behavior, persistence format, or engine behavior changes.

## Verification

- Add or update component tests to assert theme-specific classes for the logo and primary actions.
- Run the complete automated test suite and production build.
- Open the app in a browser and visually inspect both light and dark modes, including the timeline and toolbar actions.

