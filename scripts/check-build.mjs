import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';

const root = resolve('dist');
const base = '/continuumos-site/';
const origin = 'https://continuum-foundry.github.io';
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? files(join(directory, entry.name)) : join(directory, entry.name),
      ),
    )
  ).flat();
}
const html = (await files(root)).filter((file) => file.endsWith('.html'));
for (const route of [
  'index.html',
  'concepts/index.html',
  'architecture/index.html',
  'progress/index.html',
  'developers/index.html',
  'privacy/index.html',
  '404.html',
])
  assert.ok(html.includes(join(root, route)), `Missing ${route}`);
let references = 0;
for (const file of html) {
  const source = await readFile(file, 'utf8');
  assert.match(source, /<html lang="en"/);
  assert.match(source, /<title>[^<]+<\/title>/);
  assert.match(source, /<main id="main"/);
  assert.doesNotMatch(source, /localhost|127\.0\.0\.1|C:\\Users\\|\.\.\/docs\//i);
  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    let url = match[1];
    if (url.startsWith(origin)) url = url.slice(origin.length);
    if (!url.startsWith('/')) continue;
    assert.ok(url.startsWith(base), `Unprefixed local URL ${url} in ${file}`);
    const path = decodeURIComponent(url.slice(base.length).split(/[?#]/)[0]);
    let target = resolve(root, path || 'index.html');
    assert.ok(target.startsWith(root), `Escaping path ${url}`);
    const info = await stat(target).catch(() => null);
    if (info?.isDirectory()) target = join(target, 'index.html');
    assert.ok(await stat(target).catch(() => null), `Missing target ${url} in ${file}`);
    references++;
  }
}
const home = await readFile(join(root, 'index.html'), 'utf8');
assert.match(home, /Build the system\./, 'Static hero content must remain present');
assert.match(home, /data-hero-play/, 'Homepage enhancement controls are present');
function scripts(source) {
  return [...source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .map((match) => {
      const src = match[1].match(/src="([^"]+)"/);
      return src ? { key: src[1], src: src[1] } : { key: match[2], code: match[2] };
    })
    .filter((script) => script.src || script.code.trim());
}
const scriptSets = await Promise.all(
  html.map(async (file) => scripts(await readFile(file, 'utf8'))),
);
const shared = scriptSets[0].filter((script) =>
  scriptSets.every((set) => set.some((other) => other.key === script.key)),
);
async function scriptBytes(sources) {
  const visited = new Set();
  async function visit(file) {
    if (visited.has(file)) return 0;
    visited.add(file);
    const content = await readFile(file);
    let bytes = gzipSync(content).length;
    for (const match of content.toString().matchAll(/(?:from|import)\s*["'](\.[^"']+\.js)["']/g))
      bytes += await visit(resolve(file, '..', match[1]));
    return bytes;
  }
  let bytes = 0;
  for (const script of sources)
    bytes += script.src
      ? await visit(resolve(root, script.src.slice(base.length)))
      : gzipSync(script.code).length;
  return bytes;
}
const sharedBytes = await scriptBytes(shared);
const homeScripts = scripts(home);
const heroBytes = await scriptBytes(
  homeScripts.filter((script) => !shared.some((other) => other.key === script.key)),
);
assert.ok(sharedBytes <= 6144, `Shared JavaScript budget exceeded: ${sharedBytes}`);
assert.ok(heroBytes <= 6144, `Hero JavaScript budget exceeded: ${heroBytes}`);
const concepts = await readFile(join(root, 'concepts/index.html'), 'utf8');
assert.match(concepts, /Interactive concept — simulated in your browser/);
assert.match(concepts, /id="demo-editor"/);
const conceptBytes = await scriptBytes(scripts(concepts));
assert.ok(conceptBytes <= 30720, `Concepts JavaScript budget exceeded: ${conceptBytes}`);
console.log(
  `Static output verified: ${html.length} pages, ${references} local references; static content and simulation labels intact.`,
);
console.log(
  `JavaScript gzip: shared ${sharedBytes} B / 6144; hero ${heroBytes} B / 6144; Concepts total ${conceptBytes} B / 30720.`,
);
