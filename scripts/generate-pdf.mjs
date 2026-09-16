import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { serveDist } from './serve-dist.mjs';
import { pdfSourceHash } from './pdf-source-hash.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const OUT = `${root}public/resume.pdf`;
const HASH = `${root}.resume-pdf.hash`;

/**
 * 從 build 好的網站列印出 PDF。
 * 螢幕版與 PDF 版共用 src/styles/resume.css 的 @media print,
 * 所以版面只有一份,不會出現兩邊對不起來的狀況。
 */
async function launch() {
  // 這台機器上的 Chrome 優先;沒有的話才用 playwright 自己下載的 chromium。
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch {
    return await chromium.launch();
  }
}

const site = await serveDist(`${root}dist`);
const browser = await launch();

try {
  const page = await browser.newPage();
  const res = await page.goto(site.url, { waitUntil: 'networkidle' });
  if (!res?.ok()) throw new Error(`載入首頁失敗:HTTP ${res?.status()}`);

  // 等 Google Fonts 真的就位,否則印出來會是備援字體
  await page.evaluate(() => document.fonts.ready);

  await mkdir(`${root}public`, { recursive: true });
  await page.pdf({
    path: OUT,
    format: 'A4',
    printBackground: true,
    margin: { top: '14mm', bottom: '14mm', left: '13mm', right: '13mm' },
  });

  // 記下資料、版面與列印流程的版本,供 build 時檢查
  const hash = await pdfSourceHash();
  await writeFile(HASH, `${hash}\n`);

  console.log(`✓ public/resume.pdf 已產生(來源版本 ${hash.slice(0, 12)})`);
} finally {
  await browser.close();
  await site.close();
}
