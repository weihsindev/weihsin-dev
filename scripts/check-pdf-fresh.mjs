import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

/**
 * 擋住「改了履歷卻忘記重出 PDF」。
 * 用內容雜湊而不是檔案時間,因為 git clone 不會保留 mtime,
 * 在 CI 上比對時間會誤判。
 */
const root = fileURLToPath(new URL('..', import.meta.url));

const fail = (msg) => {
  console.error(`\n✘ ${msg}\n  執行 npm run pdf 重新產生,再 commit。\n`);
  process.exit(1);
};

const current = createHash('sha256')
  .update(await readFile(`${root}src/content/resume.yaml`))
  .digest('hex');

let recorded;
try {
  recorded = (await readFile(`${root}.resume-pdf.hash`, 'utf8')).trim();
} catch {
  fail('找不到 .resume-pdf.hash,PDF 版履歷還沒產生過。');
}

try {
  await readFile(`${root}public/resume.pdf`);
} catch {
  fail('找不到 public/resume.pdf。');
}

if (recorded !== current) {
  fail(`resume.yaml 已變更,但 PDF 還是舊的(PDF 用的是 ${recorded.slice(0, 12)},目前是 ${current.slice(0, 12)})。`);
}

console.log('✓ PDF 與履歷資料一致');
