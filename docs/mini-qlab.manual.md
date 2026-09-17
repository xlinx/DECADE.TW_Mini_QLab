# Mini QLab Manual / Mini QLab 使用手冊

> UI: React + Vite + Tailwind CSS


## English

### 1. Overview

this is npm lib for user can quick import use.
Mini-QLab is a QLab(https://qlab.app/) like  browser-based cue-list controller for show-control workflows. It organizes cues into groups and can run a group sequentially, repeatedly, or in response to schedule/timecode state. The UI is responsive and supports light and dark themes.

### 2. Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To run the automated smoke test:

```bash
npm test
```

### 3. Main screen

| Control | Function |
| --- | --- |
| GO-ALL | Starts every cue group. |
| STOP-ALL | Stops every running cue group. |
| Active-Cue-Panel switch | Shows or hides the active-cue side panel. |
| Light / Dark | Changes the application theme. The selected theme is saved in browser storage. |
| Q-Group + / - | Adds or removes cue groups. |
| Reset | Restores the default group configuration. |
| Export / Import | Downloads or uploads the cue-group JSON configuration. |

### 4. Cue groups

Each expandable cue group has:

- An editable group name.
- State indicators for Clock, TC/LTC, Loop, and Hotkey.
- Enable switches for the available trigger modes.
- Group movement controls (up/down) and removal controls.
- A GO button to run the group and a STOP button to stop it.

The group footer displays the current trigger-mode state and global key activity.

### 5. Cue table

Each row is one cue. The table uses Tailwind `table-auto`; columns with a configured width keep that width, and the rest size automatically. On a very narrow screen, only the table area can scroll horizontally.

| Column | Meaning |
| --- | --- |
| Status | `IDLE`, `LIVE`, or `DONE`. |
| No. | Editable cue number. |
| HKey. | One-character hotkey value. |
| Command | Editable command/name. A trailing `/` is added when this field is edited. |
| LTC Trigger | Timecode target and current countdown. |
| Clock | Cron expression plus calculated next-run/countdown information. |
| Wait(ms) | Delay before the cue fires during a sequence. |
| Progress | Cue wait progress. |
| Actions | Insert below, move up, move down, and delete the cue. |

### 6. Running cues

1. Edit the cue command and wait time.
2. Press **GO** on a group, or use **GO-ALL**.
3. Cues run in table order. A cue becomes `LIVE` while waiting, then `DONE` when dispatched.
4. Press **STOP** or **STOP-ALL** to stop the active sequence.
5. If Loop is enabled, a successfully completed group begins again until stopped.

When a cue is dispatched, its command plus a timestamp is written to the shared `TX_JSON_CMD` store value. This UI project records that command state; connecting it to a network, OSC, or device transport requires a separate consumer of that store value.

### 7. Trigger modes

- **Clock:** Valid cron expressions are evaluated once per second.
- **TC/LTC:** A cue fires when its configured timecode matches the received `RX_JSON.TC.string` value.
- **Loop:** Repeats the group after a natural completion.
- **Hotkey:** The UI displays the most recently pressed browser key. Hardware/USB-HID hotkey transport is not implemented in this browser UI.

### 8. Public event-output interface

When using Mini QLab as a React library, pass `onEvent` to the default component exported by `PAGEXQ.jsx`:

```jsx
import MiniQLab from 'mini-qlab';
import 'mini-qlab/styles.css';

<MiniQLab onEvent={(event) => {
  console.log(event.type, event.command);
}} />
```

Each event is a plain object with `type`, ISO `timestamp`, `group` (`index`, `name`), optional `cue`, and event-specific fields. Current event types are:

- `sequence:started`, `sequence:completed`, `sequence:stopped`
- `cue:started`
- `cue:dispatched` — includes `command` and `source` (`sequence`, `cron`, `timecode`, or `hotkey`)

Use this callback to send commands to OSC, WebSocket, MIDI, REST, or your own device-control layer.

### 9. Configuration and persistence

- Cue groups are maintained in browser local storage under `qlab_cues`.
- Group configuration can be exported as JSON and imported later.
- Imported MiniQ cue lists must be JSON arrays.
- The theme is stored under `mini-qlab-theme`.

### 10. Notes and limitations

- This project is a front-end cue controller. It does not include a built-in network/OSC transmitter, LTC audio-device decoder, or USB-HID driver.
- Browser keyboard detection requires the browser window to receive keyboard events.
- Cron and LTC modes require valid cue data and an external process to populate received timecode state.
- The responsive layout prioritizes readable controls; wide tables use their own scroll container instead of widening the whole page.

---

## 繁體中文

### 1. 概述

Mini-QLab is QLab like(https://qlab.app/) 是一套以瀏覽器執行的 Cue List 控制介面，適用於演出控制工作流程。它可將 Cue 分成多個群組，並依序執行、循環執行，或依排程／時間碼狀態觸發。介面支援響應式版面、淺色與深色主題。

### 2. 安裝與啟動

```bash
npm install
npm run dev
```

開啟 Vite 顯示的本機網址。執行自動化基本測試：

```bash
npm test
```

### 3. 主畫面功能

| 控制項 | 功能 |
| --- | --- |
| GO-ALL | 啟動所有 Cue 群組。 |
| STOP-ALL | 停止所有正在執行的 Cue 群組。 |
| Active-Cue-Panel 開關 | 顯示或隱藏右側 Active Cue 面板。 |
| Light / Dark | 切換淺色／深色主題；選擇會儲存在瀏覽器中。 |
| Q-Group + / - | 新增或刪除 Cue 群組。 |
| Reset | 還原預設群組設定。 |
| Export / Import | 下載或上傳 Cue 群組 JSON 設定。 |

### 4. Cue 群組

每個可展開的 Cue 群組包含：

- 可編輯的群組名稱。
- Clock、TC/LTC、Loop 與 Hotkey 狀態指示。
- 可用觸發模式的啟用開關。
- 群組上移、下移與刪除控制。
- 執行群組的 GO 與停止群組的 STOP 按鈕。

群組底部會顯示目前觸發模式狀態與全域按鍵活動。

### 5. Cue 表格

每一列代表一個 Cue。表格採用 Tailwind 的 `table-auto`：有設定寬度的欄位會使用指定寬度，其餘欄位由瀏覽器自動計算。在很窄的螢幕上，只有表格區域可水平捲動，不會撐寬整個頁面。

| 欄位 | 說明 |
| --- | --- |
| Status | `IDLE`、`LIVE` 或 `DONE`。 |
| No. | 可編輯的 Cue 編號。 |
| HKey. | 一個字元的熱鍵值。 |
| Command | 可編輯的命令／名稱；編輯時會自動補上結尾 `/`。 |
| LTC Trigger | 時間碼目標與目前倒數。 |
| Clock | Cron 表達式，以及下一次執行／倒數資訊。 |
| Wait(ms) | 序列執行時，Cue 送出前的等待時間。 |
| Progress | Cue 等待進度。 |
| Actions | 在下方插入、上移、下移與刪除 Cue。 |

### 6. 執行 Cue

1. 編輯 Cue 的 Command 與 Wait 時間。
2. 按群組的 **GO**，或按 **GO-ALL**。
3. Cue 會依表格順序執行；等待時為 `LIVE`，送出後為 `DONE`。
4. 按 **STOP** 或 **STOP-ALL** 可停止目前序列。
5. 若啟用 Loop，群組正常完成後會持續重新執行，直到停止為止。

Cue 送出時，系統會將「命令 + 時間戳記」寫入共用狀態 `TX_JSON_CMD`。目前專案只記錄此狀態；如需實際送往網路、OSC 或外部設備，需另外建立讀取此狀態的傳輸模組。

### 7. 觸發模式

- **Clock：** 每秒檢查一次有效的 Cron 表達式。
- **TC/LTC：** 當 Cue 設定的時間碼與 `RX_JSON.TC.string` 相符時觸發。
- **Loop：** 群組正常結束後重複執行。
- **Hotkey：** 介面會顯示最近一次按下的瀏覽器按鍵；此瀏覽器版尚未實作 USB-HID 硬體熱鍵傳輸。

### 8. 公開事件輸出介面

若將 Mini QLab 當作 React 函式庫使用，可對 `PAGEXQ.jsx` 的預設元件傳入 `onEvent`：

```jsx
import MiniQLab from 'mini-qlab';
import 'mini-qlab/styles.css';

<MiniQLab onEvent={(event) => {
  console.log(event.type, event.command);
}} />
```

每個事件都是一般物件，包含 `type`、ISO 格式 `timestamp`、`group`（`index`、`name`）、選用的 `cue`，以及事件專用欄位。目前事件類型：

- `sequence:started`、`sequence:completed`、`sequence:stopped`
- `cue:started`
- `cue:dispatched`：包含 `command` 與 `source`（`sequence`、`cron`、`timecode` 或 `hotkey`）

可在此 callback 中將命令轉送至 OSC、WebSocket、MIDI、REST 或自訂設備控制層。

### 9. 設定與保存

- Cue 群組以 `qlab_cues` 儲存在瀏覽器 local storage。
- 可匯出 JSON 設定，之後再匯入。
- MiniQ Cue List 匯入檔必須是 JSON 陣列。
- 主題以 `mini-qlab-theme` 儲存。

### 10. 注意事項與限制

- 本專案是前端 Cue 控制介面，未內建網路／OSC 發送器、LTC 音訊裝置解碼器或 USB-HID 驅動。
- 瀏覽器熱鍵偵測需要視窗收到鍵盤事件。
- Cron 與 LTC 模式需要正確的 Cue 資料，以及外部程式提供接收時間碼狀態。
- 響應式版面以控制項可讀性為優先；寬表格只在自身容器捲動，不會讓整頁變寬。
