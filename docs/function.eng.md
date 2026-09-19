# Mini QLab — Function & Feature Reference

> A browser-based cue-list controller for multimedia show control (audio, video, lighting), inspired by QLab (https://qlab.app/).
> UI: React 19 + Vite + Tailwind CSS · npm package `mini-qlab` v2.1.0
> Online demo: https://www.decade.tw/qlab

---

## 1. Overview

Mini QLab is a responsive React cue-list controller for show-control workflows. It organizes cues into **cue groups** and can run a group:

- **Manually** (GO button),
- **Sequentially** (cues run in table order),
- **From cron schedules**,
- **From browser hotkeys**, or
- **From externally supplied timecode (TC/LTC)**.

Output is delivered through an **event callback** (`onEvent`) so the host application can connect its own OSC, MIDI, WebSocket, REST, or device transport. The UI also ships a built-in **WebSocket client** that sends each dispatched cue to a configurable endpoint.

### Tech stack

| Layer | Technology |
| --- | --- |
| UI framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 3 (light/dark themes) |
| Cron engine | cron-parser 5 |
| Tests | Vitest + Testing Library |
| Standalone app | Electron (macOS arm64/intel, Windows arm64/intel, Linux snap/AppImage) |

---

## 2. Architecture

```
src/
├── PAGEXQ.jsx          # Main component <MiniQLab> (library entry)
├── main.jsx            # Standalone app entry
├── styles.css
├── components/
│   ├── Toolbar.jsx         # Top bar: GO-ALL, STOP-ALL, theme, group mgmt, export/import
│   ├── CueGroup.jsx        # One cue group card (name, modes, GO/STOP)
│   ├── CueTable.jsx        # Cue rows: status, fields, waits, actions
│   └── ActiveCuePanel.jsx  # Side panel listing LIVE cues
└── lib/
    ├── cueEngine.js        # CueEngine: sequencing, waits, loop, stop
    ├── cues.js             # Data model, persistence (localStorage), import/export, name validation
    ├── cueColumns.js       # Cue table column definitions + resizable-width helpers
    └── triggers.js         # Cron evaluation, trigger matching, dedupe gate

electron/                   # Standalone desktop app (Electron)
├── main.js                 # Main process (ESM): window, dev-server vs dist-app loading
└── preload.js              # Preload (placeholder; contextBridge API later)
src/electron-entry.jsx      # Desktop app entry (renders <MiniQLab>)
```

### Data flow

```
Trigger (GO / cron / timecode / hotkey)
        │
        ▼
CueEngine.start() ──► runCue(): before-wait → dispatch → after-wait → next cue
        │
        ├──► onStatus(groupId, cueId, patch)   → React state (UI update)
        └──► onEvent(event)                    → emit()
                 ├──► TX_JSON_CMD store (localStorage)
                 ├──► Cue log (UI list, max 200 entries)
                 ├──► WebSocket send { command, timestamp }
                 └──► onEvent callback (host app: OSC / MIDI / REST / …)
```

---

## 3. Main screen (Toolbar)

| Control | Function |
| --- | --- |
| **GO-ALL** | Starts every cue group simultaneously. |
| **STOP-ALL** | Stops every running cue group. |
| **Active cues** | Shows or hides the active-cue side panel (lists cues currently in `LIVE` / before-wait). |
| **Light / Dark** | Toggles the application theme. The selection is persisted in browser storage under `mini-qlab-theme`. |
| **Q-Group +** | Adds a new cue group named `Cue Group N`. |
| **Q-Group −** | Removes the last cue group. |
| **Reset** | Restores the default group configuration (one "Main Sequence" group) and disposes the running engine. |
| **Export** | Downloads the current cue-group configuration as `mini-qlab-cues.json`. |
| **Import** | Uploads a cue-group JSON file (must be a JSON array). |

The top bar also displays the DECADE.TW logo and title.

---

## 4. Cue groups

Each cue group is an expandable card containing:

- **Editable group name** (large text input).
- **Expand/collapse button** (`+` / `−`).
- **Trigger-mode enable switches**, each with a state dot (green = enabled, grey = disabled):
  - **Clock** — cron scheduling is active for this group.
  - **TC/LTC** — timecode triggers are active for this group.
  - **Loop** — the group restarts after a natural completion.
  - **Hotkey** — browser hotkey triggers are active for this group.
- **Movement controls**: move group up (`↑`) / down (`↓`).
- **Remove button** (`×`) — deletes the group.
- **GO button** — starts this group's sequence.
- **STOP button** — stops this group's sequence.

The group footer displays:

- Group index (`GROUP 1`, `GROUP 2`, …)
- Currently enabled trigger modes (e.g. `Clock · Loop`) or `MANUAL`
- The most recently pressed browser key (`KEY a`)

A group can only be triggered by a mode if that mode's switch is enabled on the group.

---

## 5. Cue table

Each row is one cue. The table is **fixed-width** (`table-fixed`); every column has a default width and is **user-resizable**. On narrow screens only the table area scrolls horizontally.

| Column | Default width | Meaning |
| --- | --- | --- |
| **Status** | 96px | `IDLE` (grey), `LIVE` (amber, before-wait counting down), or `DONE` (green). |
| **Name** | 160px | Editable cue name. Group names and cue names must be **unique** (case-insensitive) — enforced on import and on edit. |
| **Type / Content** | 420px | A **type selector** plus its content: |
| **HKey.** | 90px | One-character hotkey value (max 1 char). |
| **LTC Trigger** | 160px | Timecode target (e.g. `01:00:00:00`) and, while counting, the current countdown display. |
| **Clock** | 176px | Cron expression (6-field, e.g. `* * * * * *`) plus the calculated next-run time (`next HH:MM:SS`) or `invalid cron`. |
| **Before-wait(ms)** | 152px | Delay before the cue is dispatched. While `LIVE`, it counts down with a 3px violet progress bar showing its percentage. |
| **After-wait(ms)** | 152px | Delay after dispatch before the next cue begins. Counts down with a 3px cyan progress bar showing its percentage. |
| **Actions** | 208px | `+` insert a cue below, `↑` move up, `↓` move down, `×` delete. |

### Type / Content

The **Type / Content** column starts with a type selector:

- **Command** (default) — a single editable **Command** field. A trailing `/` is automatically added when the field loses focus (e.g. `welcome` → `welcome/`).
- **Trigger cue** — replaces the command field with two selectors:
  - **Target group** — pick another cue group by name.
  - **Target cue** — pick a cue within that group by name.

  A trigger cue fires the selected target cue (cross-group referencing).

### Resizable columns

Each column header has a drag handle (right edge):

- **Drag** the handle to resize that column (clamped to its minimum width).
- **Double-click** the header (or press `Home` on the handle) to reset that column to its default width.
- **Arrow keys** (`←` / `→`) on the focused handle nudge the width by 10px.

Column widths are defined in `lib/cueColumns.js` (`CUE_COLUMNS`) and normalized by `normalizeCueColumnWidths`.

### Cue status lifecycle

```
IDLE ──(GO / trigger)──► LIVE ──(before-wait = 0)──► dispatch ──► DONE
  ▲                                              (after-wait = 0)
  └──────────────────(STOP / sequence end)──────────────────────┘
```

---

## 6. Running cues

1. Edit each cue's **Command**, **Before-wait** and **After-wait**.
2. Press **GO** on a group, or **GO-ALL** for all groups.
3. Cues run in table order:
   - A cue becomes `LIVE` while its **before-wait** counts down.
   - At zero, the cue is **dispatched** (command + timestamp emitted).
   - The cue becomes `DONE` while its **after-wait** counts down.
   - When after-wait reaches zero, the next cue starts.
4. Press **STOP** or **STOP-ALL** to stop the active sequence. All cues return to `IDLE`.
5. If **Loop** is enabled, a successfully completed group begins again automatically until stopped.

Triggered cues (clock, TC/LTC, hotkey) run as a **single cue** and follow the same before/after-wait rule. Re-triggering the same cue while it is running is ignored (dedupe gate).

### Dispatch output

When a cue is dispatched:

- Its `command` plus an ISO `timestamp` is written to the shared **`TX_JSON_CMD`** localStorage value: `{ "command": "welcome/", "timestamp": "2026-09-05T12:00:00.000Z" }`.
- The entry is appended to the **Cue log** (UI list, capped at 200 entries).
- If WebSocket is enabled and connected, `{ command, timestamp }` is sent as JSON to the configured endpoint.
- The `onEvent` callback fires with a `cue:dispatched` event (see §8).

---

## 7. Trigger modes

| Mode | How it works |
| --- | --- |
| **Clock** | Valid 6-field cron expressions are evaluated once per second (via `cron-parser`). A cue fires when the current second matches its expression. The next-run time is shown live in the table. |
| **TC/LTC** | A cue fires when its configured timecode string exactly matches the received `rxJson.TC.string` value (e.g. `01:00:00:00`). The host app (or an LTC audio-device decoder) supplies this value. |
| **Loop** | Repeats the group after a natural completion, until STOP. |
| **Hotkey** | The UI listens for browser `keydown` events. A cue fires when the pressed key matches its one-character `HKey.` value (case-insensitive). The last pressed key is shown in each group footer. Hardware/USB-HID hotkey transport is not implemented in the browser UI (planned for the Electron build). |

### Dedupe gate

Each trigger source keeps a per-cue "last observed value" map (`createTriggerGate`). A trigger only dispatches when the observed value changes — e.g. the same timecode value does not re-fire the same cue twice, and a cron cue fires at most once per matching second.

---

## 8. Event output interface (library API)

When using Mini QLab as a React library, pass `onEvent` to the `<MiniQLab>` component:

```jsx
import MiniQLab from 'mini-qlab';
import 'mini-qlab/styles.css';

export function ShowControl() {
  return (
    <MiniQLab
      rxJson={{ TC: { string: '01:00:00:00' } }}
      onEvent={(event) => {
        if (event.type === 'cue:dispatched') {
          console.log(event.source, event.command);
        }
      }}
    />
  );
}
```

### Props

| Prop | Type | Description |
| --- | --- | --- |
| `onEvent` | `(event: object) => void` | Called for every sequence/cue lifecycle event. |
| `rxJson` | `object` (optional) | Received-state object. Provide `rxJson.TC.string` (e.g. `'01:00:00:00'`) to use TC/LTC triggers. |
| `initialGroups` | `array` (optional) | Initial cue groups. Used only when nothing is stored in localStorage. |

### Event shape

Every event is a plain object:

```js
{
  type: string,          // event type (below)
  timestamp: string,     // ISO 8601
  group: { index: number, name: string },
  cue?: { id, name, type, targetGroupName, targetCueName, hotkey, command, ltcTrigger, cron, beforeWaitMs, afterWaitMs, status, ... },
  // event-specific fields:
  command?: string,      // cue:dispatched
  source?: string        // cue:dispatched
}
```

### Event types

| Type | Fired when |
| --- | --- |
| `sequence:started` | A group sequence starts (GO or trigger). |
| `sequence:completed` | A group finishes its last cue (and loop is disabled). |
| `sequence:stopped` | A group sequence is stopped manually. |
| `cue:started` | A cue enters the `LIVE` phase. |
| `cue:dispatched` | A cue's command is emitted. Includes `command` and `source`. |

### `source` values

| Value | Meaning |
| --- | --- |
| `sequence` | Dispatched as part of a GO/GO-ALL sequence run. |
| `cron` | Dispatched by the Clock trigger. |
| `timecode` | Dispatched by the TC/LTC trigger. |
| `hotkey` | Dispatched by the Hotkey trigger. |

Use this callback to send commands to OSC, WebSocket, MIDI, REST, or any custom device-control layer.

---

## 9. WebSocket output

The Cue log card contains a built-in WebSocket client:

| Control | Function |
| --- | --- |
| **WS** checkbox | Enables/disables the WebSocket connection. |
| **host** input | Target host (default `127.0.0.1`). |
| **port** input | Target port (default `8888`; digits only). |
| **Status pill** | `Off` (grey), `Connecting` (amber), `Connected` (green), `Error` (red). |

- On every dispatched cue, the client sends `{ "command": "…", "timestamp": "…" }` as JSON.
- Cue log entries that were delivered show a green **WS** badge.
- The configuration is persisted in localStorage under `mini-qlab-ws` and reconnected automatically on reload.
- A companion echo server is included in `quick_ws_server/` (Node `ws`, default port `8080`).

```bash
cd quick_ws_server && npm install && node index.js
# Server running on ws://localhost:8080
```

UDP/OSC transport is not built in; implement it in your own consumer using the `onEvent` callback or the `TX_JSON_CMD` store value.

---

## 10. Active Cue panel

The side panel (toggled from the toolbar) lists all cues currently in the `LIVE` state across all groups:

- Cue command (or "Untitled cue")
- Group name
- Current before-wait progress percentage

When no cue is live, the panel shows "No live cues".

---

## 11. Configuration & persistence

| Key | Storage | Content |
| --- | --- | --- |
| `qlab_cues` | localStorage | All cue groups (runtime status fields are stripped on save). |
| `mini-qlab-theme` | localStorage | `'light'` or `'dark'`. |
| `mini-qlab-ws` | localStorage | `{ enabled, host, port }` WebSocket config. |
| `TX_JSON_CMD` | localStorage | Last dispatched entry `{ command, timestamp }`. |

- **Export** writes `toPersistedGroups(groups)` as pretty-printed JSON (downloaded as `mini-qlab-cues.json`).
- **Import** must be a **JSON array** of group objects; each group must contain a `cues` array. Names are validated for uniqueness (see below). Invalid files show an error message.
- **Reset** discards stored groups and restores the default configuration.

### Name validation

On import (and on edit) `validateUniqueNames` enforces:

- Every group has a non-empty name; group names are unique (case-insensitive).
- Every cue has a non-empty name; cue names are unique **within their group** (case-insensitive).

Violations throw and surface as an import error message.

### JSON format (export / import)

```json
[
  {
    "id": "group-1",
    "name": "Main Sequence",
    "expanded": true,
    "loopEnabled": false,
    "clockEnabled": true,
    "timecodeEnabled": false,
    "hotkeyEnabled": true,
    "cues": [
      {
        "id": "cue-1",
        "name": "Welcome",
        "type": "command",
        "hotkey": "a",
        "command": "/cue/welcome/",
        "ltcTrigger": "01:00:00:00",
        "cron": "0 0 * * * *",
        "beforeWaitMs": 0,
        "afterWaitMs": 500
      },
      {
        "id": "cue-2",
        "name": "Fire Act 2",
        "type": "trigger",
        "targetGroupName": "Act 2",
        "targetCueName": "Start",
        "hotkey": "",
        "command": "",
        "beforeWaitMs": 0,
        "afterWaitMs": 0
      }
    ]
  }
]
```

Cue fields: `name` (unique per group), `type` (`command` | `trigger`), `targetGroupName` / `targetCueName` (only for `trigger` cues), `hotkey`, `command`, `ltcTrigger`, `cron`, `beforeWaitMs`, `afterWaitMs`.

---

## 12. Standalone app (Electron)

A standalone Mini-QLab desktop app is built with **Electron** (pure shell — the same React app, no UI changes).

### How it works

- **Dev** (`electron:dev`): runs the Vite dev server and loads it in an Electron window (hot reload).
- **Production**: Vite builds a **self-contained** `dist-app/` (React inlined, `base: './'`), and Electron loads `dist-app/index.html`.
- The main process (`electron/main.js`, ESM) creates a 1280×800 window; `preload.js` is a placeholder for future `contextBridge` APIs (file dialogs, tray, global hotkeys).

### Build targets

| Platform | Target | Script |
| --- | --- | --- |
| macOS | `.dmg` | `npm run electron:build:mac` |
| Windows | NSIS installer (`.exe`) | `npm run electron:build:win` |
| Linux | `.AppImage` | `npm run electron:build:linux` |
| All three | — | `npm run electron:build:all` |

> Cross-platform note: building Windows/Linux from a macOS host is supported by electron-builder but code signing and some toolchains are most reliable on the native OS or CI.

Planned for the desktop build:
- **Hotkey by USB-HID** (no window focus required)
- **Hotkey** (requires window focus)
- **[TX] TimeCode (LTC)** output
- **[RX] TimeCode (LTC)** input from an audio device (tested on macOS; Windows expected to work):

```javascript
initAudioDevice({ deviceName: 'aggX1', onFrame: onFrame });
```

---

## 13. Development

```bash
npm install
npm run dev              # start Vite dev server
npm test                 # run Vitest suite
npm run build            # build npm library to dist/
npm run build:electron   # build self-contained desktop bundle to dist-app/
```

### Electron scripts

```bash
npm run electron:dev         # Vite dev server + Electron window (hot reload)
npm run electron:pack        # build + unpacked .app (local verify, no installer)
npm run electron:build       # = electron:build:mac (dmg)
npm run electron:build:mac   # macOS dmg
npm run electron:build:win   # Windows NSIS installer
npm run electron:build:linux # Linux AppImage
npm run electron:build:all   # all three platforms
```

Test files: `tests/cueEngine.test.js`, `tests/cues.test.js`, `tests/triggers.test.js`, `tests/PAGEXQ.test.jsx`, `tests/smoke.test.jsx`, `tests/package.test.js`.

---

## 14. Notes & limitations

- This project is a **front-end cue controller**. It does not include a built-in network/OSC transmitter, LTC audio-device decoder, or USB-HID driver (those are handled by the host app or the Electron build).
- Browser hotkey detection requires the browser window to receive keyboard events (i.e. the window must be focused).
- Clock (cron) and TC/LTC modes require valid cue data and an external process to populate the received timecode state (`rxJson`).
- The responsive layout prioritizes readable controls; wide tables use their own scroll container instead of widening the whole page.
- Cue log is capped at 200 entries.
- WebSocket uses the `ws://` scheme (plain, unencrypted).
