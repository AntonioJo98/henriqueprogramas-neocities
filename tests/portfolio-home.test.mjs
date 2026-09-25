import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('../site/',import.meta.url);
test('homepage groups JavaScript demos and presents Data Science honestly',async()=>{const h=await readFile(new URL('index.html',root),'utf8');const cards=[...h.matchAll(/data-project="([^"]+)"/g)].map(x=>x[1]);assert.deepEqual(cards,['javascript-projects','data-science']);assert.match(h,/href="\/projects\/"[^>]*data-en="Explore JavaScript Projects →"/);assert.match(h,/Data Science/);assert.match(h,/Coming next/);assert.doesNotMatch(h,/href="\/projects\/data-science\//);assert.doesNotMatch(h,/7 demos JavaScript|Data Science em preparação|class="build-status"/)});