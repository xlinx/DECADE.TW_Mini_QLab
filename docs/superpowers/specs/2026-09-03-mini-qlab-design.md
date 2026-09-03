# Mini QLab Design

## Goal

Create Mini QLab as a Vite-powered React component library and local demo
application. It lets an operator organize cues into groups, dispatch them in
order, and trigger them from manual GO actions, cron schedules, or received
timecode. The library exposes every operational event through `onEvent`; it
does not contain a network, OSC, MIDI, or HID transport.

## Scope and constraints

- The package uses React, Vite, Tailwind CSS, and Vitest with Testing Library.
- `src/PAGEXQ.jsx` is the default library export. `src/styles.css` is the
  documented stylesheet entry point.
- A standalone Vite demo mounts the same component, rather than maintaining a
  separate application implementation.
- Configuration is persisted under `qlab_cues`; theme preference uses
  `mini-qlab-theme`.
- Imported configuration must be a JSON array. Invalid input must leave the
  existing configuration intact and show an operator-visible error.
- Cue command edits normalize non-empty values with one trailing `/`.
- All timer work is cleaned up when a group is stopped or the component
  unmounts.

## Data model

`CueGroup` has a stable `id`, editable `name`, expanded state, and boolean
`loopEnabled`, `clockEnabled`, `timecodeEnabled`, and `hotkeyEnabled` flags.
It owns an ordered `cues` array. A `Cue` has a stable `id`, editable `number`,
`hotkey`, `command`, `ltcTrigger`, `cron`, and non-negative `waitMs`, plus
runtime-only `status` (`IDLE`, `LIVE`, or `DONE`) and progress (0–100).

Persisted/exported JSON contains only editable group and cue configuration.
Runtime state is rebuilt after load/import so incomplete work is never resumed
accidentally.

## Cue engine

The pure cue-engine module owns execution semantics and is tested independent
of React. Starting a group cancels that group's existing execution, resets
statuses, emits `sequence:started`, then processes cues in order. For each
cue it emits `cue:started`, marks it LIVE while its wait elapses, and then
marks it DONE and emits `cue:dispatched` with the normalized command and a
source of `sequence`.

When all cues dispatch, it emits `sequence:completed`. If loop is enabled,
the engine begins a fresh sequence after completion until explicitly stopped.
Stopping cancels pending waits, returns any LIVE cues to IDLE, and emits
`sequence:stopped`. GO-ALL and STOP-ALL delegate to each group engine.

The component holds the latest dispatched payload in `TX_JSON_CMD` state:
`{ command, timestamp }`. It accepts an optional `rxJson` prop so a host can
provide `RX_JSON`; a matching `rxJson?.TC?.string` dispatches an eligible cue
with source `timecode`. A document-level `keydown` listener records the most
recent key and dispatches matching eligible hotkey cues with source `hotkey`.

Once per second, the component evaluates enabled valid cron expressions and
dispatches matching cues with source `cron`. Cron and timecode dispatches do
not start a sequence: each matched cue dispatches once for the observed
matching tick/value, with duplicate suppression until the cron second or
timecode value changes. Invalid cron expressions are displayed as invalid and
never throw.

## Event contract

`onEvent` is optional. Each emitted object contains an ISO `timestamp`, a
`type`, and `group: { index, name }`; cue events additionally contain a
snapshot of the relevant cue. `cue:dispatched` includes `command` and
`source`, one of `sequence`, `cron`, `timecode`, or `hotkey`. The other event
types are `sequence:started`, `sequence:completed`, `sequence:stopped`, and
`cue:started`.

`onEvent` is called after the associated state transition. A consumer can use
`cue:dispatched` to forward commands to an external transport.

## Component interface

```jsx
<MiniQLab
  onEvent={(event) => send(event)}
  rxJson={{ TC: { string: '01:00:00:00' } }}
/>
```

The default export uses local storage by default. Optional `initialGroups`
provides a starting configuration only when no stored configuration exists.
The component deliberately exposes neither a transport implementation nor a
hardware keyboard driver.

## UI structure

The top toolbar provides GO-ALL, STOP-ALL, active-cue-panel visibility,
Light/Dark theme selection, group add/remove, reset, export, and import.
The central column renders expandable cue-group cards. Each card exposes the
editable group name; status indicators and switches for Clock, TC/LTC, Loop,
and Hotkey; reorder/remove controls; GO and STOP; and a footer describing
active trigger modes and the last browser key.

Each expanded card renders a `table-auto` cue table. Configured narrow
columns keep their widths while command and schedule columns receive flexible
space. The table wrapper, not the page, scrolls horizontally on narrow
screens. Row actions insert below, move, and delete. A collapsible side panel
lists all LIVE cues and their wait progress.

Tailwind utility styles implement a readable light/dark visual system with
clear LIVE and DONE state contrast, keyboard-accessible controls, and labels
for every input.

## Persistence and import/export

Every configuration mutation serializes the persistable group shape to
`localStorage`. Reset replaces it with a documented default group setup.
Export creates a downloadable JSON file. Import reads a chosen local file,
parses and validates the top-level array and cue/group shapes, adds missing
stable IDs, then replaces the configuration only after validation succeeds.

## Error handling

Local-storage access is wrapped so restricted browser storage does not break
the app. Parse/validation errors and export/import failures appear in an
`aria-live` status region. Timer cancellation and repeated manual GO calls
are idempotent. An invalid wait is normalized to zero; invalid cron entries
are non-operative and visibly marked.

## Testing

Vitest unit tests cover the pure engine's ordered waits, dispatch event
payloads, cancellation, and looping with fake timers. Configuration tests
cover command normalization, persistence serialization, import validation,
and runtime-state stripping. Component tests cover toolbar actions, editable
cue rows, event callback delivery, active-cue visibility, theme persistence,
and the user-visible import failure path. The smoke test mounts the demo and
confirms the main controls render.

## Delivery

The repository includes npm scripts for development, production build, test,
and test watch mode; package export metadata for the component and stylesheet;
the bilingual manual retained at the repository root; and a README that links
to it and gives library-consumption instructions.
