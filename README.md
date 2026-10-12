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

日常流程是：**修改內容 → 本機確認 → 提交並推送到 `main` → 查看 Actions 結果**。
履歷站與 blog 各自獨立，推送這個 repo 只會部署履歷站。

### 日常操作

在 `weihsin-dev` 目錄操作。首次安裝或套件鎖定檔更新後先執行 `npm ci`，
修改時可用 `npm run dev` 預覽，結束時按 `Ctrl+C`。

資料、版面或列印流程有修改時，先執行 `npm run pdf`，接著確認：

```bash
npm test
npm run build
npm run check:site
```

全部通過後，檢查差異並提交要發布的修改，再執行：

```bash
git push origin main
```

到這個 repo 的 **GitHub → Actions → deploy**，查看最新一次執行。
整個流程顯示綠色成功，才代表部署與線上檢查全部完成。
正式發布只走 Actions；本機的 `npm run deploy` 已移除，不直接執行 `wrangler deploy`。

### Actions 自動執行的步驟

工作流程定義在 `.github/workflows/deploy.yml`：

1. 取得這次提交的程式，使用 `npm ci` 安裝鎖定版本的套件。
2. 執行 PDF 同步檢查與網站檢查腳本的回歸測試。
3. 建置網站，確認 PDF 來源一致，並檢查產物中的首頁、下載連結與 PDF。
4. 確認這次提交仍是 `main` 最新版本，舊版本會跳過部署。
5. 將 commit SHA 寫入版本標記，部署到 Cloudflare。
6. 比對線上版本，再實際讀取首頁與下載 PDF，確認狀態與內容正確。

同站的部署流程一次只執行一個，進行中的工作會先完成；新的等待工作會取代舊的等待工作。

### 重新執行、失敗處理與回復

- **重新發布目前版本**：到 GitHub Actions 選擇 `deploy` → `Run workflow`，分支選 `main`。
- **流程失敗**：打開紅色步驟查看紀錄。暫時的連線問題可重跑最新版本的失敗流程；
  程式或內容有誤則先修正，再提交並推送。
- **需要回復**：將有問題的修改以新的 revert commit 推到 `main`。
  舊 commit 的 workflow 重跑會被版本檢查跳過，不作為回滾方式。

**部署後的檢查失敗不會自動回滾。** 此時新版可能已上線，需依失敗紀錄決定修正或回復。
