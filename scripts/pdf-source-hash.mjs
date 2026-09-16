import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

// 產生與檢查共用同一份來源清單,版面或列印流程變動也必須重出 PDF。
export async function pdfSourceHash() {
  const hash = createHash('sha256');
  for (const path of [
    'src/content/resume.yaml',
    'src/pages/index.astro',
    'src/styles/resume.css',
    'src/lib/resume.ts',
    'astro.config.mjs',
    'scripts/generate-pdf.mjs',
    'scripts/serve-dist.mjs',
    'scripts/pdf-source-hash.mjs',
  ]) {
    hash.update(path).update('\0');
    hash.update(await readFile(new URL(`../${path}`, import.meta.url))).update('\0');
  }
  return hash.digest('hex');
}
