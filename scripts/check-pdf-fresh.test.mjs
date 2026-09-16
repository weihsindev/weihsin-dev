import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { appendFile, cp, mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'resume-pdf-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await mkdir(join(dir, 'public'));
  for (const path of ['src', 'scripts', 'astro.config.mjs', '.resume-pdf.hash', 'public/resume.pdf']) {
    await cp(join(root, path), join(dir, path), { recursive: true });
  }
  return dir;
}

function check(dir) {
  return spawnSync(process.execPath, ['scripts/check-pdf-fresh.mjs'], { cwd: dir, encoding: 'utf8' });
}

test('accepts the PDF generated from the current sources', async (t) => {
  const result = check(await fixture(t));
  assert.equal(result.status, 0, result.stderr);
});

for (const path of [
  'src/content/resume.yaml',
  'src/pages/index.astro',
  'src/styles/resume.css',
  'src/lib/resume.ts',
  'scripts/generate-pdf.mjs',
  'scripts/serve-dist.mjs',
  'scripts/pdf-source-hash.mjs',
  'astro.config.mjs',
]) {
  test(`rejects a stale PDF after changing ${path}`, async (t) => {
    const dir = await fixture(t);
    await appendFile(join(dir, path), '\n');
    const result = check(dir);
    assert.equal(result.status, 1, result.stdout);
    assert.match(result.stderr, /PDF 還是舊的/);
  });
}

test('rejects a missing PDF even when the hash matches', async (t) => {
  const dir = await fixture(t);
  await rm(join(dir, 'public/resume.pdf'));
  const result = check(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /找不到 public\/resume.pdf/);
});
