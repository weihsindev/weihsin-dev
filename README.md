# weihsin-dev

`weihsin.dev` —— 個人履歷網站。Astro 靜態輸出，部署在 Cloudflare Workers。

## 本機維護

```bash
npm ci
npm run dev          # 本機預覽
npm run pdf          # 資料、版面或列印流程修改後重出 PDF
npm test             # PDF 同步檢查的回歸測試
npm run build
npm run check:site   # 檢查產物中的首頁、下載連結與 PDF
npm run preview     # 預覽建置結果
```

履歷資料集中在 `src/content/resume.yaml`。重出 PDF 後，將 `public/resume.pdf`
與 `.resume-pdf.hash` 一起提交。PDF 產生流程優先使用系統 Google Chrome。

## 正式發布

正式發布統一由 `.github/workflows/deploy.yml` 執行，不提供本機直接部署指令。
推送到 `main` 後自動觸發；需要重新發布目前版本時，可在 GitHub Actions
選擇 `deploy` → `Run workflow`，分支選 `main`。

流程依序執行測試、建置、產物檢查、部署、線上版本比對，以及首頁與 PDF 下載檢查。
發布後應確認整個 workflow 成功；檢查失敗不會自動回滾。

需要回復時，將有問題的修改以新的 revert commit 推到 `main`。
舊 commit 的 workflow 重跑會被版本檢查跳過，不作為回滾方式。
