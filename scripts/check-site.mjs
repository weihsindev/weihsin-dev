import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const site = process.argv[2];

async function read(path, contentType) {
  if (!site) return readFile(`dist${path === '/' ? '/index.html' : path}`);
  const url = new URL(path, site);
  url.searchParams.set('check', `${process.env.GITHUB_SHA ?? 'local'}-${Date.now()}`);
  const response = await fetch(url, {
    headers: { 'Cache-Control': 'no-cache' },
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  assert.ok(response.headers.get('content-type')?.includes(contentType), `${path}: unexpected content type`);
  return Buffer.from(await response.arrayBuffer());
}

const expected = await readFile('dist/index.html', 'utf8');
const heading = expected.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/)?.[0];
assert.ok(heading, 'Resume homepage must have a heading');
const home = (await read('/', 'text/html')).toString();
assert.ok(home.includes(heading), 'Resume heading is missing or outdated');
assert.match(home, /href="\/resume\.pdf"/, 'Resume download link is missing');
const pdf = await read('/resume.pdf', 'application/pdf');
assert.equal(pdf.subarray(0, 5).toString(), '%PDF-', 'Download is not a PDF');
assert.ok(pdf.subarray(-1024).includes('%%EOF'), 'PDF is incomplete');
console.log(`✓ ${site ?? 'dist'}: resume homepage and PDF download`);
