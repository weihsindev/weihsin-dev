import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));

for (const scenario of ['valid', 'missing link', 'missing PDF', 'HTML instead of PDF', 'truncated PDF']) {
  test(`site check: ${scenario}`, async (t) => {
    const dir = await mkdtemp(join(tmpdir(), 'resume-site-test-'));
    t.after(() => rm(dir, { recursive: true, force: true }));
    await mkdir(join(dir, 'dist'));
    await writeFile(join(dir, 'dist/index.html'), '<h1>Resume</h1><a href="/resume.pdf">CV.PDF</a>');
    await cp(join(root, 'public/resume.pdf'), join(dir, 'dist/resume.pdf'));
    if (scenario === 'missing link') await writeFile(join(dir, 'dist/index.html'), '<h1>Resume</h1>');
    if (scenario === 'missing PDF') await rm(join(dir, 'dist/resume.pdf'));
    if (scenario === 'HTML instead of PDF') await writeFile(join(dir, 'dist/resume.pdf'), '<html>Not found</html>');
    if (scenario === 'truncated PDF') {
      const pdf = await readFile(join(dir, 'dist/resume.pdf'));
      await writeFile(join(dir, 'dist/resume.pdf'), pdf.subarray(0, 100));
    }
    const result = spawnSync(process.execPath, [join(root, 'scripts/check-site.mjs')], { cwd: dir, encoding: 'utf8' });
    assert.equal(result.status, scenario === 'valid' ? 0 : 1, result.stderr);
  });
}
