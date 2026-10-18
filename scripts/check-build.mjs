import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';

const root=resolve('dist');
const base='/continuumos-site/';
const origin='https://continuum-foundry.github.io';
async function files(directory){const entries=await readdir(directory,{withFileTypes:true});return (await Promise.all(entries.map(entry=>entry.isDirectory()?files(join(directory,entry.name)):join(directory,entry.name)))).flat();}
const html=(await files(root)).filter(file=>file.endsWith('.html'));
for(const route of ['index.html','concepts/index.html','architecture/index.html','progress/index.html','developers/index.html','privacy/index.html','404.html'])assert.ok(html.includes(join(root,route)),`Missing ${route}`);
let references=0;
for(const file of html){
  const source=await readFile(file,'utf8');
  assert.match(source,/<html lang="en"/);assert.match(source,/<title>[^<]+<\/title>/);assert.match(source,/<main id="main"/);
  assert.doesNotMatch(source,/localhost|127\.0\.0\.1|C:\\Users\\|\.\.\/docs\//i);
  for(const match of source.matchAll(/(?:href|src)="([^"]+)"/g)){
    let url=match[1];if(url.startsWith(origin))url=url.slice(origin.length);
    if(!url.startsWith('/'))continue;
    assert.ok(url.startsWith(base),`Unprefixed local URL ${url} in ${file}`);
    const path=decodeURIComponent(url.slice(base.length).split(/[?#]/)[0]);
    let target=resolve(root,path||'index.html');assert.ok(target.startsWith(root),`Escaping path ${url}`);
    const info=await stat(target).catch(()=>null);
    if(info?.isDirectory())target=join(target,'index.html');
    assert.ok(await stat(target).catch(()=>null),`Missing target ${url} in ${file}`);references++;
  }
}
const home=await readFile(join(root,'index.html'),'utf8');
assert.doesNotMatch(home,/<script\b/i,'Homepage must remain script-free');
const concepts=await readFile(join(root,'concepts/index.html'),'utf8');
assert.match(concepts,/Interactive concept — simulated in your browser/);
assert.match(concepts,/id="demo-editor"/);
console.log(`Static output verified: ${html.length} pages, ${references} local references; script-free homepage; explicit simulation label.`);
