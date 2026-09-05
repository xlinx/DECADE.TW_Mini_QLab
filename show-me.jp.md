# Mini QLab — 構造

```text
DECADE.TW_Mini_QLab3/
├── src/                          # React アプリ本体
│   ├── main.jsx                  # エントリーポイント
│   ├── PAGEXQ.jsx                # ページ
│   ├── components/
│   │   ├── ActiveCuePanel.jsx    # 現在のキューパネル
│   │   ├── CueGroup.jsx          # キューグループ
│   │   ├── CueTable.jsx          # キューリスト
│   │   └── Toolbar.jsx           # ツールバー
│   └── lib/
│       ├── cueEngine.js          # キューエンジン（スケジューリング／状態機械）
│       ├── cues.js               # キューデータモデル
│       └── triggers.js           # トリガー（cron など）
├── quick_ws_server/              # WebSocket バックエンド（独立 Node サーバー）
│   └── index.js
├── qlab/                         # ビルド成果物（静的）
├── tests/                        # vitest
└── docs/
```

**ひとことで**：ブラウザ上の React キューリストコントローラー（`mini-qlab` v2.1.0）。WebSocket 経由で `quick_ws_server` に接続してキュー再生を制御し、cron トリガーにも対応。
