# fahhh! 迷因音效板

一個免安裝的迷因音效板：點一下就播放，也能上傳自己的音檔，加入手機主畫面後像 App 一樣使用。
全部在瀏覽器裡執行，沒有後端、沒有帳號、不蒐集資料。

*A free, installable meme soundboard. Tap to play, upload your own sounds, runs entirely in your browser. [English summary below.](#english)*

網址（canonical）：<https://s97158latte-max.github.io/fahhh-/>

created by [邊境部署 EdgeDeploy](https://www.edgedeploy.tw/)

---

## 功能

- **內建音效**：`FAHHH!`（音檔）、`Bruh`、`Boom`、`Wah Wah`（用 Web Audio 即時合成）。
- **釘選**：勾選的音效會出現在右下角小白點展開的輪狀選單，單手也能快速點。
- **上傳自己的音檔**：可一次選多個。每個檔案上限 10 MB、30 秒，會先試著解碼，壞檔或偽裝副檔名的檔案會被擋下並說明原因。支援 mp3、m4a、wav、aac、flac、caf、ogg（ogg 在 Safari/iOS 可能無法解碼）。電腦版可直接把音檔從 Finder／檔案總管拖進頁面上傳。
- **改名、刪除可復原**：自訂音效可重新命名；刪除後 6 秒內可復原。
- **同一時間只播一個音效**：新的音效一觸發，前一個會在約 30 ms 內淡出。
- **電腦版**：多欄方塊版面、滑鼠懸停回饋，以及鍵盤快捷鍵（見下）。
- **中文 / English**：頁面右上角切換；第一次依瀏覽器語言決定，之後記住選擇。
- **深色模式**：跟隨系統外觀（`prefers-color-scheme`），沒有手動切換鈕；維持黑白手繪風格，深色下是黑底白線的反相版。
- **可離線使用**：service worker 預快取所有檔案；可加入主畫面。
- **新手導覽**：第一次造訪時以聚光燈和手繪箭頭帶路（共 5 步，每步一個圖示加一句短話：點 ▶ 播放、勾選加入快捷選單、點圓點展開、點按鈕播放，電腦版再提示按鍵盤快捷鍵）；頂部橫幅左側的「?」可隨時重看。
- **載入畫面**、播放時的震動與音效名稱字泡、「播放中」螢光黃標示、新手導覽，都尊重系統的「減少動態效果」設定。

### 鍵盤快捷鍵（有鍵盤的電腦）

已釘選的音效依清單順序對應按鍵，最多 20 個：

```
1 2 3 4 5 6 7 8 9 0  Q W E R T Y U I O P
```

使用實體按鍵位置判斷，不受輸入法影響；帶 Ctrl / Cmd / Alt 的組合、按住不放、在改名輸入框中輸入時都不會觸發。

---

## 在本機執行

沒有建置步驟，也不需要安裝任何套件。任何靜態伺服器都可以：

```bash
python3 -m http.server 8000
# 開啟 http://localhost:8000/
```

> 直接用 `file://` 開啟時，service worker 和部分功能不會運作；請用 `localhost` 或 https。
> service worker 只會在 https 或 localhost 註冊。

## 專案結構

```
index.html            頁面、SEO / Open Graph 標籤、結構化資料、內容安全政策 (CSP)
manifest.json         PWA 設定
sw.js                 service worker（離線快取）
robots.txt, sitemap.xml
audio/fahhh.m4a       內建的 FAHHH! 音檔
images/               角色圖、分享圖、邊境部署標誌
images/splash/        iOS 加入主畫面的啟動圖（由 tools/make_splash.py 產生，不進 sw.js 預快取）
tools/make_splash.py  啟動圖產生腳本（需 Pillow；開發用，不會被網站載入）
icons/                App 圖示與 favicon

css/
  base.css            基本樣式、清單、電腦版版面
  dock.css            右下角小白點、輪狀選單、頂部橫幅、懸停
  characters.css      Wojak 角色圖與其定位
  boot.css            載入畫面
  tour.css            新手導覽

js/
  boot.js             載入畫面（放在 <head>，同步執行）
  util.js             共用小工具（F.$、F.esc）
  i18n.js             中英文字典與語言切換
  feedback.js         播放時的震動、字泡、播放中狀態
  audio.js            Web Audio：解碼、單聲道播放、合成音效
  sounds.js           內建音效定義
  storage.js          IndexedDB（自訂音效）與 localStorage（釘選、語言）
  list.js             音效清單、改名、刪除與復原
  menu.js             輪狀快捷選單(可中斷的彈簧展開/收合動畫)
  keys.js             鍵盤快捷鍵
  tour.js             新手導覽
  hints.js            情境提示（iPhone 靜音鍵提醒、資料保存說明面板）
  upload.js           上傳、驗證與訊息
  main.js             啟動流程、service worker 註冊
```

所有 js 都掛在全域命名空間 `window.Fahhh`（程式內以 `F` 表示）。

### 啟動流程

`boot.js` 先顯示載入畫面；`main.js` 分三階段完成（讀出資料庫、第一次渲染、內建音檔解碼），每完成一階段在 `document` 派發 `fahhh:progress`（`detail: {done, total}`），全部完成後派發一次 `fahhh:ready`。載入畫面收到 `fahhh:ready` 才收起；沒收到時有後備的逾時機制，不會卡住。載入畫面移除時派發 `fahhh:booted`，新手導覽等它出現後才開始。自訂音效在就緒之後才在瀏覽器閒置時逐一解碼。

### 資料存放

| 位置 | 內容 |
| --- | --- |
| IndexedDB `fahhh` / `sounds` | 自訂音效（名稱、二進位音檔、MIME 類型）。舊版的 base64 資料仍可讀取 |
| localStorage `fahhh_eq` | 已釘選的音效清單 |
| localStorage `fahhh_lang` | 語言 |
| localStorage `fahhh_tour` | 是否看過新手導覽 |
| localStorage `fahhh_silent_hint` | 是否已顯示過 iPhone 靜音鍵提醒 |
| localStorage `fahhh_store_info` | 是否已在第一次上傳後主動展開過資料保存說明 |

**資料只存在使用者自己的瀏覽器。**頁面上不放常駐的長段說明，改用圖示：上傳鈕旁的 💾 可展開這項提醒，第一次成功上傳後也會主動展開一次。 iPhone 的「主畫面 App」與 Safari 的儲存空間是分開的，加入主畫面後需要重新上傳。第一次成功上傳後，頁面會向瀏覽器申請持久保存（`navigator.storage.persist()`），降低被瀏覽器清除的機率，但不保證。

## 開發注意事項

- **不要加行內 `<script>` 或行內 `style`**：`index.html` 的 CSP 是 `script-src 'self'`、`style-src 'self'` 加 Google Fonts。需要動態設定位置或尺寸時，用 JavaScript 的 CSSOM（`el.style.left = ...`），不要用 `setAttribute('style', ...)`。圖片來源只允許自己的網域（`img-src 'self'`），所以 CSS 不能使用 `data:` 圖。
- **新增或更名檔案時，要同步更新 `sw.js` 的預快取清單，並把 `CACHE` 版本號加一**；只是修改既有檔案內容不需要，service worker 採「先用快取、背景更新」，使用者下次開啟就會拿到新版。
- **啟動圖由腳本產生，更換圖示時要重生**：改了 `icons/icon-512.png` 或邊境部署標誌後，執行 `python3 tools/make_splash.py`。這些圖只有 iOS 加入主畫面時會讀，所以不放進 `sw.js` 預快取，新增或重生它們不需要改 `CACHE`。
- **字級用 `rem`，新增文字樣式請勿用 `px`**：這樣文字才會跟著使用者的文字大小設定縮放；預設根字級 16px 時 1rem = 16px。邊框、圖示與圖片尺寸等非文字的數值仍可用 px。
- 中英文字典的**鍵集合必須一致**（`js/i18n.js` 的 zh 與 en）。找不到英文時會退回中文，並在主控台警告。
- 分享圖更換內容時，請換檔名或在 `og:image` 網址後加參數，否則 LINE、Facebook 會繼續用舊的快取。
- 開發時若發現沒有更新，是 service worker 快取造成的：在開發者工具的 Application 面板解除註冊並清除網站資料。

## 瀏覽器支援

使用 Web Audio、IndexedDB、service worker、CSS `:has()`、`content-visibility`、`overflow: clip` 等較新的功能，建議使用近兩年內的 Chrome、Edge、Safari、Firefox。較舊的瀏覽器會退回基本排版，不會壞掉，但部分版面（例如窄螢幕的兩排清單列）會是原本的單排樣式。

---

## English

**fahhh!** is a free meme soundboard that runs entirely in your browser — no backend, no accounts, no tracking.

- Built-in sounds: `FAHHH!` (an audio file) plus `Bruh`, `Boom` and `Wah Wah` (synthesised with Web Audio).
- Pin sounds to the quick menu behind the little white dot at the bottom right.
- Upload your own audio: up to 10 MB and 30 seconds per file, validated by decoding it first. Formats: mp3, m4a, wav, aac, flac, caf, ogg (ogg may not decode on Safari/iOS). On desktop you can also drag audio files straight onto the page.
- Only one sound plays at a time; a new one cuts the previous one off.
- Desktop: multi-column tiles, hover feedback, and keyboard shortcuts (`1`–`0`, then `Q`–`P`, for your first 20 pinned sounds).
- Dark mode follows the system appearance (`prefers-color-scheme`); there is no manual toggle.
- A short picture-based tour on the first visit (replayable from the "?" button); Chinese / English interface with a language switch; works offline and can be added to the home screen.
- Your sounds are stored in your own browser only (IndexedDB). On iPhone, the Home Screen app and Safari do not share storage.

Run it locally with any static server, for example `python3 -m http.server 8000`. There is no build step. See the Chinese sections above for the project structure and development notes — in particular, keep the CSP in mind (no inline scripts or styles), and bump `CACHE` in `sw.js` whenever the precache list changes.

Created by [邊境部署 EdgeDeploy](https://www.edgedeploy.tw/).
