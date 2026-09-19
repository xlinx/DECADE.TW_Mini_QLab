# Mini QLab — 功能與特性說明

> 以瀏覽器執行的多媒體演出控制（音訊、影片、燈光）Cue List 控制器，靈感來自 QLab（https://qlab.app/）。
> UI：React 19 + Vite + Tailwind CSS · npm 套件 `mini-qlab` v2.1.0
> 線上體驗：https://www.decade.tw/qlab

---

## 1. 概述

Mini QLab 是一套響應式 React Cue List 控制器，適用於演出控制工作流程。它將 Cue 分成多個**群組（Cue Group）**，群組可以：

- **手動**執行（GO 按鈕），
- **依序**執行（Cue 依表格順序執行），
- 由 **Cron 排程**觸發，
- 由**瀏覽器熱鍵**觸發，或
- 由**外部提供的時間碼（TC/LTC）**觸發。

輸出透過**事件回呼**（`onEvent`）交付，讓宿主程式自行連接 OSC、MIDI、WebSocket、REST 或設備傳輸。介面內建**WebSocket 客戶端**，可將每個送出的 Cue 傳送至可設定的端點。

### 技術堆疊

| 層級 | 技術 |
| --- | --- |
| UI 框架 | React 19 |
| 建置工具 | Vite 8 |
| 樣式 | Tailwind CSS 3（淺色／深色主題） |
| Cron 引擎 | cron-parser 5 |
| 測試 | Vitest + Testing Library |
| 獨立應用 | Electron（macOS arm64/intel、Windows arm64/intel、Linux snap/AppImage） |

---

## 2. 架構

```
src/
├── PAGEXQ.jsx          # 主元件 <MiniQLab>（函式庫入口）
├── main.jsx            # 獨立應用入口
├── styles.css
├── components/
│   ├── Toolbar.jsx         # 頂端工具列：GO-ALL、STOP-ALL、主題、群組管理、匯入匯出
│   ├── CueGroup.jsx        # 單一 Cue 群組卡片（名稱、模式、GO/STOP）
│   ├── CueTable.jsx        # Cue 列：狀態、欄位、等待、操作
│   └── ActiveCuePanel.jsx  # 側邊面板，列出 LIVE 中的 Cue
└── lib/
    ├── cueEngine.js        # CueEngine：序列執行、等待、循環、停止
    ├── cues.js             # 資料模型、持久化（localStorage）、匯入匯出、名稱驗證
    ├── cueColumns.js       # Cue 表格欄位定義＋可調寬度輔助
    └── triggers.js         # Cron 評估、觸發比對、去重閘門

electron/                   # 獨立桌面應用（Electron）
├── main.js                 # 主行程（ESM）：視窗、dev-server 與 dist-app 載入
└── preload.js              # 預載入（佔位；日後 contextBridge API）
src/electron-entry.jsx      # 桌面應用入口（渲染 <MiniQLab>）
```

### 資料流

```
觸發（GO / cron / timecode / hotkey）
        │
        ▼
CueEngine.start() ──► runCue()：before-wait → 送出 → after-wait → 下一個 Cue
        │
        ├──► onStatus(groupId, cueId, patch)   → React state（UI 更新）
        └──► onEvent(event)                    → emit()
                 ├──► TX_JSON_CMD 儲存（localStorage）
                 ├──► Cue log（UI 清單，最多 200 筆）
                 ├──► WebSocket 送出 { command, timestamp }
                 └──► onEvent 回呼（宿主程式：OSC / MIDI / REST / …）
```

---

## 3. 主畫面（工具列）

| 控制項 | 功能 |
| --- | --- |
| **GO-ALL** | 同時啟動所有 Cue 群組。 |
| **STOP-ALL** | 停止所有正在執行的 Cue 群組。 |
| **Active cues** | 顯示或隱藏右側 Active Cue 面板（列出目前處於 `LIVE`／before-wait 的 Cue）。 |
| **Light / Dark** | 切換淺色／深色主題；選擇會儲存在瀏覽器（`mini-qlab-theme`）。 |
| **Q-Group +** | 新增一個名為 `Cue Group N` 的群組。 |
| **Q-Group −** | 刪除最後一個群組。 |
| **Reset** | 還原預設群組設定（一個「Main Sequence」群組），並結束執行中的引擎。 |
| **Export** | 下載目前群組設定為 `mini-qlab-cues.json`。 |
| **Import** | 上傳群組 JSON 檔（必須是 JSON 陣列）。 |

工具列同時顯示 DECADE.TW 標誌與標題。

---

## 4. Cue 群組

每個 Cue 群組是一個可展開的卡片，包含：

- **可編輯的群組名稱**（大型文字輸入框）。
- **展開／收合按鈕**（`+` / `−`）。
- **觸發模式啟用開關**，各附狀態圓點（綠＝啟用，灰＝停用）：
  - **Clock** — 本群組啟用 Cron 排程。
  - **TC/LTC** — 本群組啟用時間碼觸發。
  - **Loop** — 群組正常結束後自動重新執行。
  - **Hotkey** — 本群組啟用瀏覽器熱鍵觸發。
- **移動控制**：群組上移（`↑`）／下移（`↓`）。
- **刪除按鈕**（`×`）— 刪除該群組。
- **GO 按鈕** — 啟動本群組序列。
- **STOP 按鈕** — 停止本群組序列。

群組底部顯示：

- 群組索引（`GROUP 1`、`GROUP 2`…）
- 目前啟用的觸發模式（例如 `Clock · Loop`）或 `MANUAL`
- 最近一次按下的瀏覽器按鍵（`KEY a`）

只有當該模式的開關在群組上啟用時，群組才能被該模式觸發。

---

## 5. Cue 表格

每一列代表一個 Cue。表格為**固定寬度**（`table-fixed`）：每個欄位有預設寬度，且**可由使用者拖曳調整**。在窄螢幕上，只有表格區域可水平捲動。

| 欄位 | 預設寬度 | 說明 |
| --- | --- | --- |
| **Status** | 96px | `IDLE`（灰）、`LIVE`（琥珀色，before-wait 倒數中）或 `DONE`（綠）。 |
| **Name** | 160px | 可編輯的 Cue 名稱。群組名稱與 Cue 名稱必須**唯一**（不分大小寫）——匯入與編輯時都會驗證。 |
| **Type / Content** | 420px | 一個**型別選擇器**與其內容： |
| **HKey.** | 90px | 一個字元的熱鍵值（最多 1 字元）。 |
| **LTC Trigger** | 160px | 時間碼目標（例如 `01:00:00:00`），倒數中會顯示目前倒數。 |
| **Clock** | 176px | Cron 表達式（6 欄，例如 `* * * * * *`），以及計算出的下一次執行時間（`next HH:MM:SS`）或 `invalid cron`。 |
| **Before-wait(ms)** | 152px | 送出前的延遲。Cue 為 `LIVE` 時倒數，下方 3px 紫色進度條顯示百分比。 |
| **After-wait(ms)** | 152px | 送出後、下一個 Cue 開始前的延遲。倒數時下方 3px 青色進度條顯示百分比。 |
| **Actions** | 208px | `+` 在下方插入 Cue、`↑` 上移、`↓` 下移、`×` 刪除。 |

### 型別／內容（Type / Content）

**Type / Content** 欄以一個型別選擇器開頭：

- **Command**（預設）— 一個可編輯的 **Command** 欄位。欄位失去焦點時會自動補上結尾 `/`（例如 `welcome` → `welcome/`）。
- **Trigger cue** — 以兩個選擇器取代命令欄位：
  - **Target group** — 依名稱選擇另一個 Cue 群組。
  - **Target cue** — 在該群組中依名稱選擇一個 Cue。

  Trigger cue 會觸發所選的目標 Cue（跨群組參照）。

### 可調欄寬

每個欄位標題右側有拖曳把手：

- **拖曳**把手可調整該欄寬度（下限為該欄最小寬度）。
- **雙擊**標題（或在把手上按 `Home`）可將該欄重置為預設寬度。
- 在聚焦的把手上按**方向鍵**（`←` / `→`）可每次增減 10px。

欄寬定義於 `lib/cueColumns.js`（`CUE_COLUMNS`），並由 `normalizeCueColumnWidths` 正規化。

### Cue 狀態生命週期

```
IDLE ──(GO / 觸發)──► LIVE ──(before-wait = 0)──► 送出 ──► DONE
  ▲                                              (after-wait = 0)
  └──────────────────(STOP / 序列結束)──────────────────────┘
```

---

## 6. 執行 Cue

1. 編輯每個 Cue 的 **Command**、**Before-wait** 與 **After-wait**。
2. 按群組的 **GO**，或按 **GO-ALL** 啟動所有群組。
3. Cue 依表格順序執行：
   - Cue 進入 `LIVE`，**before-wait** 開始倒數。
   - 歸零時該 Cue 被**送出**（發出 command + timestamp）。
   - Cue 轉為 `DONE`，**after-wait** 開始倒數。
   - after-wait 歸零後開始下一個 Cue。
4. 按 **STOP** 或 **STOP-ALL** 可停止目前序列，所有 Cue 回到 `IDLE`。
5. 若啟用 **Loop**，群組正常完成後會自動重新執行，直到停止為止。

觸發式 Cue（Clock、TC/LTC、Hotkey）以**單一 Cue** 方式執行，同樣遵循 before/after-wait 規則。同一個 Cue 執行中再次觸發會被忽略（去重閘門）。

### 送出輸出

Cue 送出時：

- 其 `command` 與 ISO `timestamp` 會寫入共用的 **`TX_JSON_CMD`** localStorage 值：`{ "command": "welcome/", "timestamp": "2026-09-05T12:00:00.000Z" }`。
- 該筆記錄會加入 **Cue log**（UI 清單，上限 200 筆）。
- 若 WebSocket 已啟用且已連接，則以 JSON 送出 `{ command, timestamp }` 至設定的端點。
- `onEvent` 回呼會收到 `cue:dispatched` 事件（見第 8 節）。

---

## 7. 觸發模式

| 模式 | 運作方式 |
| --- | --- |
| **Clock** | 有效的 6 欄 Cron 表達式每秒評估一次（透過 `cron-parser`）。目前秒數與表達式相符時觸發。表格中即時顯示下一次執行時間。 |
| **TC/LTC** | 當 Cue 設定的時間碼字串與接收到的 `rxJson.TC.string` 值完全相符時觸發（例如 `01:00:00:00`）。此值由宿主程式（或 LTC 音訊裝置解碼器）提供。 |
| **Loop** | 群組正常結束後重複執行，直到停止。 |
| **Hotkey** | UI 監聽瀏覽器 `keydown` 事件。按下的按鍵與 Cue 的一個字元 `HKey.` 值相符時（不分大小寫）觸發。最近按下的按鍵顯示在每個群組底部。瀏覽器版未實作 USB-HID 硬體熱鍵傳輸（Electron 版規劃中）。 |

### 去重閘門

每個觸發來源維持一張「每個 Cue 最近觀察值」的 map（`createTriggerGate`）。只有當觀察值改變時才會送出——例如相同時間碼值不會對同一 Cue 重複觸發，Cron Cue 在相符的秒數內最多觸發一次。

---

## 8. 事件輸出介面（函式庫 API）

將 Mini QLab 當作 React 函式庫使用时，對 `<MiniQLab>` 元件傳入 `onEvent`：

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

| Prop | 型別 | 說明 |
| --- | --- | --- |
| `onEvent` | `(event: object) => void` | 每個序列／Cue 生命週期事件都會呼叫。 |
| `rxJson` | `object`（選用） | 接收狀態物件。提供 `rxJson.TC.string`（例如 `'01:00:00:00'）即可使用 TC/LTC 觸發。 |
| `initialGroups` | `array`（選用） | 初始 Cue 群組。僅在 localStorage 沒有資料時使用。 |

### 事件結構

每個事件都是一般物件：

```js
{
  type: string,          // 事件類型（見下）
  timestamp: string,     // ISO 8601
  group: { index: number, name: string },
  cue?: { id, name, type, targetGroupName, targetCueName, hotkey, command, ltcTrigger, cron, beforeWaitMs, afterWaitMs, status, ... },
  // 事件專用欄位：
  command?: string,      // cue:dispatched
  source?: string        // cue:dispatched
}
```

### 事件類型

| 類型 | 觸發時機 |
| --- | --- |
| `sequence:started` | 群組序列開始（GO 或觸發）。 |
| `sequence:completed` | 群組完成最後一個 Cue（且未啟用 Loop）。 |
| `sequence:stopped` | 群組序列被手動停止。 |
| `cue:started` | Cue 進入 `LIVE` 階段。 |
| `cue:dispatched` | Cue 的命令被送出。包含 `command` 與 `source`。 |

### `source` 值

| 值 | 意義 |
| --- | --- |
| `sequence` | 作為 GO/GO-ALL 序列執行的一部分送出。 |
| `cron` | 由 Clock 觸發送出。 |
| `timecode` | 由 TC/LTC 觸發送出。 |
| `hotkey` | 由 Hotkey 觸發送出。 |

可在此回呼中將命令轉送至 OSC、WebSocket、MIDI、REST 或任何自訂設備控制層。

---

## 9. WebSocket 輸出

Cue log 卡片內建 WebSocket 客戶端：

| 控制項 | 功能 |
| --- | --- |
| **WS** 核取方塊 | 啟用／停用 WebSocket 連線。 |
| **host** 輸入框 | 目標主機（預設 `127.0.0.1`）。 |
| **port** 輸入框 | 目標埠（預設 `8888`；僅接受數字）。 |
| **狀態丸** | `Off`（灰）、`Connecting`（琥珀）、`Connected`（綠）、`Error`（紅）。 |

- 每個 Cue 送出時，客戶端以 JSON 送出 `{ "command": "…", "timestamp": "…" }`。
- 成功送出的 Cue log 條目會顯示綠色 **WS** 徽章。
- 設定會儲存在 localStorage（`mini-qlab-ws`），重新載入後自動重連。
- 隨附一個回顯伺服器於 `quick_ws_server/`（Node `ws`，預設埠 `8080`）。

```bash
cd quick_ws_server && npm install && node index.js
# Server running on ws://localhost:8080
```

UDP/OSC 傳輸未內建；請使用 `onEvent` 回呼或 `TX_JSON_CMD` 儲存值，在自家消費者中實作。

---

## 10. Active Cue 面板

側邊面板（從工具列切換）列出所有群組中目前處於 `LIVE` 狀態的 Cue：

- Cue 命令（或「Untitled cue」）
- 群組名稱
- 目前 before-wait 進度百分比

沒有 LIVE Cue 時，面板顯示「No live cues」。

---

## 11. 設定與持久化

| 鍵 | 儲存位置 | 內容 |
| --- | --- | --- |
| `qlab_cues` | localStorage | 所有 Cue 群組（儲存時會移除執行中狀態欄位）。 |
| `mini-qlab-theme` | localStorage | `'light'` 或 `'dark'`。 |
| `mini-qlab-ws` | localStorage | `{ enabled, host, port }` WebSocket 設定。 |
| `TX_JSON_CMD` | localStorage | 最近送出的 `{ command, timestamp }`。 |

- **Export** 將 `toPersistedGroups(groups)` 以格式化的 JSON 下載（檔名 `mini-qlab-cues.json`）。
- **Import** 必須是群組物件的 **JSON 陣列**；每個群組必須包含 `cues` 陣列。名稱會做唯一性驗證（見下）。無效檔案會顯示錯誤訊息。
- **Reset** 會捨棄已儲存的群組並還原預設設定。

### 名稱驗證

匯入（以及編輯時）`validateUniqueNames` 會強制：

- 每個群組都有非空名稱；群組名稱唯一（不分大小寫）。
- 每個 Cue 都有非空名稱；Cue 名稱在其**群組內**唯一（不分大小寫）。

違規會丟出例外，並以匯入錯誤訊息呈現。

### JSON 格式（匯出／匯入）

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

Cue 欄位：`name`（群組內唯一）、`type`（`command` | `trigger`）、`targetGroupName` / `targetCueName`（僅 `trigger` cue）、`hotkey`、`command`、`ltcTrigger`、`cron`、`beforeWaitMs`、`afterWaitMs`。

---

## 12. 獨立應用（Electron）

Mini QLab 桌面獨立應用以 **Electron** 建構（純殼——同一套 React 應用，UI 零改動）。

### 運作方式

- **開發**（`electron:dev`）：啟動 Vite dev server 並在 Electron 視窗中載入（熱重載）。
- **生產**：Vite 建置**自包含**的 `dist-app/`（React 內聯、`base: './'`），Electron 載入 `dist-app/index.html`。
- 主行程（`electron/main.js`，ESM）建立 1280×800 視窗；`preload.js` 為佔位，日後透過 `contextBridge` 暴露 API（檔案對話框、系統匣、全域熱鍵）。

### 建置目標

| 平台 | 目標 | 指令 |
| --- | --- | --- |
| macOS | `.dmg` | `npm run electron:build:mac` |
| Windows | NSIS 安裝檔（`.exe`） | `npm run electron:build:win` |
| Linux | `.AppImage` | `npm run electron:build:linux` |
| 三平台 | — | `npm run electron:build:all` |

> 跨平台說明：在 macOS 上交叉打包 Windows/Linux 受 electron-builder 支援，但程式碼簽章與部分工具鏈在原生 OS 或 CI 上最穩。

桌面版規劃中功能：
- **USB-HID 熱鍵**（不需焦點在視窗上）
- **熱鍵**（需要視窗焦點）
- **[TX] 時間碼（LTC）** 輸出
- **[RX] 時間碼（LTC）** 從音訊裝置輸入（macOS 已測試；Windows 推測可用）：

```javascript
initAudioDevice({ deviceName: 'aggX1', onFrame: onFrame });
```

---

## 13. 開發

```bash
npm install
npm run dev              # 啟動 Vite 開發伺服器
npm test                 # 執行 Vitest 測試
npm run build            # 建置 npm 函式庫至 dist/
npm run build:electron   # 建置自包含桌面套件至 dist-app/
```

### Electron 指令

```bash
npm run electron:dev         # Vite dev server + Electron 視窗（熱重載）
npm run electron:pack        # 建置 + 未打包 .app（本地驗證，不出安裝檔）
npm run electron:build       # = electron:build:mac（dmg）
npm run electron:build:mac   # macOS dmg
npm run electron:build:win   # Windows NSIS 安裝檔
npm run electron:build:linux # Linux AppImage
npm run electron:build:all   # 三平台
```

測試檔：`tests/cueEngine.test.js`、`tests/cues.test.js`、`tests/triggers.test.js`、`tests/PAGEXQ.test.jsx`、`tests/smoke.test.jsx`、`tests/package.test.js`。

---

## 14. 注意事項與限制

- 本專案是**前端 Cue 控制介面**，未內建網路／OSC 發送器、LTC 音訊裝置解碼器或 USB-HID 驅動（由宿主程式或 Electron 版處理）。
- 瀏覽器熱鍵偵測需要視窗收到鍵盤事件（即視窗需有焦點）。
- Clock（Cron）與 TC/LTC 模式需要正確的 Cue 資料，以及外部程式提供接收時間碼狀態（`rxJson`）。
- 響應式版面以控制項可讀性為優先；寬表格只在自身容器捲動，不會讓整頁變寬。
- Cue log 上限 200 筆。
- WebSocket 使用 `ws://` 協定（純文字、未加密）。
