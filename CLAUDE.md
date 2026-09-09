# CLAUDE.md — weihsin.dev

履歷網站。全域規則仍然適用,以下只列「看起來合理但會壞事」的動作。
專案說明見 `README` 性質的內容散在各檔註解與 `design/README.md`。

## 不要做

- **不要改 `wrangler.jsonc` 的 `name`。** 那是 Cloudflare Worker 的身分,不是專案名稱。
  改掉再部署會建立**新的** Worker,舊的仍綁著 `weihsin.dev` 繼續服務 —— 部署顯示成功,
  線上永遠不更新。目前值必須維持 `weihsin-dev`。
- **不要把手機、通訊地址、期望待遇、「待業中」寫進 `src/content/resume.yaml`。**
  這是公開網站。狀態一律用「開放新機會」。根目錄的來源履歷 PDF 已由 `.gitignore` 排除。
- **不要引入 Tailwind。** 單頁精確網格設計,utility 複用沒有發揮空間;
  設計 token 集中在 `src/styles/resume.css` 的 `:root`。
- **不要把手機斷點的 `@media screen and (max-width: 760px)` 改成 `@media (max-width: 760px)`。**
  A4 列印時內容寬約 695px,少了 `screen and` 會誤觸手機版面。

## 要記得

- **`resume.yaml` 是唯一資料來源。** 改完必須跑 `npm run pdf` 重出 PDF,
  否則 `npm run build` 會比對內容雜湊並中斷建置(這是刻意的)。
- **年資用 104 的含頭含尾算法(月數 +1)。** `src/lib/resume.ts` 的 `duration()`。
  看起來像 off-by-one,但改掉會讓網站和投遞出去的履歷對不起來。
- **Playwright 優先使用系統的 Google Chrome**,因為 `cdn.playwright.dev` 在此環境連不上。
  換機器要先 `npx playwright install chromium`。
- **Chrome 列印時忽略 grid 容器的 `break-inside`**,所以 `@media print` 內把 `.row`
  改成 float 排版。動列印樣式前先看那段註解。
