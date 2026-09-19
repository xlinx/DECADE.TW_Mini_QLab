# Mini QLab — 功能修改清單（舊版 → 新版）

本文件依據 `docs/superpowers/specs/` 的已核准設計，整理 Mini QLab 從原始 Cue List 介面到目前版本的功能變更。以下以繁體中文說明。

| 項目 | 舊版 | 新版 |
| --- | --- | --- |
| Cue 識別 | 以 Cue 編號為主要識別。 | 改為 Cue **名稱**；同一群組內名稱不可重複（不分大小寫），舊有編號資料會遷移為名稱。 |
| Cue 型別 | 僅可執行 Command。 | 支援 **Command** 與 **Trigger cue**；Trigger cue 可依群組名稱與 Cue 名稱啟動其他群組的序列。 |
| Trigger 失敗處理 | 無跨群組 Cue 目標驗證。 | 找不到目標、目標群組已執行或自我觸發時，忽略觸發並寫入警告 log。 |
| Cue 表格內容 | Command 欄位較寬，控制項配置分散。 | Type／Content 以同列多欄方式呈現；Trigger 顯示型別、目標群組與目標 Cue。 |
| 表格欄寬 | 欄寬固定。 | 使用者可拖曳欄位標題右側把手調整欄寬；可雙擊或按 `Home` 重設，方向鍵每次調整 10px。 |
| Cue 群組外觀 | 群組使用固定背景色。 | 每個群組可選擇背景色、顯示色彩圓點並可重設；顏色會持久化。 |
| 版面與字體 | 內容較窄、文字偏小。 | 內容最大寬度為視窗約 90%，整體字級與操作目標加大。 |
| 淺色／深色主題 | 部分淺色模式文字與標誌對比不足。 | Timeline、標誌、GO-ALL／STOP-ALL 等元件完整支援淺色／深色模式。 |
| 行動裝置 | 窄螢幕主要依賴橫向捲動表格。 | 小於 640px 時改用可完整編輯的 Cue 卡片；平板／桌面保留可調欄寬表格。 |
| Timeline 範圍 | 時間線使用有限可視範圍。 | 從 0 秒向前無限延伸；接近右端時自動增加畫布時間。 |
| Timeline 操作 | 缺少完整編輯工具。 | 空白軌道左鍵拖曳可平移；拖曳 Cue 可改變時間／排序；右鍵可新增或編輯 Cue；右側把手可調整 after-wait。 |
| Timeline 縮放 | 未提供可靠的滑鼠滾輪縮放。 | 游標位於 Timeline 時，滾輪縮放會攔截頁面捲動，並保持游標下的時間點。 |
| Timeline Cue 顯示 | Cue 區塊只顯示有限文字。 | 永遠顯示 Cue 名稱；區塊足夠寬時，同時顯示 Command 或 `Trigger → 群組 / Cue` 內容。 |
| 播放頭與 Loop | 播放頭可能因定時更新而顯得跳動，Loop 邊界不明顯。 | 每個群組都有持續顯示、`requestAnimationFrame` 平滑更新的紅色播放頭；啟用 Loop 時顯示起點／終點重複圖示。 |
| Timeline 面板 | Timeline 固定展開。 | Timeline 可收合並記住設定，以減少不需要時的渲染負擔。 |
| Timeline 現在時間 | 未顯示精確本機時間。 | 標題顯示即時 `NOW HH:mm:ss.mmm` 本機時間，即使 Timeline 收合仍可見。 |
| 切換回饋 | 切換控制項沒有一致視覺回饋。 | 狀態圓點、色彩圓點與收合符號會短暫彈跳；按鈕容器本身不移動，且尊重減少動態效果設定。 |
| 背景執行 | 瀏覽器分頁失焦或最小化時，更新可能被節流。 | 重新取得焦點／頁面可見時會校正 CueEngine；Electron 視窗關閉背景節流。 |
| WebSocket 介面 | WebSocket 設定與事件資訊混在 Cue log 區域，僅送出 Cue。 | WebSocket 設定與事件 log 獨立成可收合面板，保留連線、傳送、接收與錯誤紀錄。 |
| WebSocket 接收控制 | 無法由外部 WebSocket 控制 Cue。 | 可接收純文字或 JSON `command`：`/cue/<cue_name>/start`、`/cue/<cue_name>/stop`；名稱不分大小寫。若不同群組有相同 Cue 名稱，`start` 會全部啟動；`stop` 只停止由 WebSocket 啟動的同名單一 Cue。 |
| WebSocket 安全與可觀測性 | 接收資料沒有 Cue 控制驗證。 | 只接受嚴格的 Cue 控制路徑；格式錯誤、未知動作或找不到 Cue 都會安全忽略並寫入警告 log。 |

## 相容性說明

- 既有包含 `number` 的 Cue 匯入資料會自動轉為 `name`。
- 匯出資料會保存群組背景色、Cue 名稱、型別與 Trigger 目標；可調欄寬則獨立保存在瀏覽器 localStorage。
- 原有 Command、Cron、TC/LTC、Hotkey、Loop、GO／STOP、匯入／匯出與 `onEvent` 輸出流程仍保留。
