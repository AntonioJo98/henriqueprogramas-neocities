import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const siteRoot = new URL('../site/', import.meta.url);

test('portfolio homepage presents exactly the first four projects', async () => {
  const html = await readFile(new URL('index.html', siteRoot), 'utf8');
  const cards = [...html.matchAll(/<article[^>]+data-project="([^"]+)"/g)];

  assert.deepEqual(cards.map((match) => match[1]), [
    'snake',
    'turtle-crossing',
    'flash-cards',
    'coffee-wifi',
  ]);
});

test('Snake card links to the playable demo and repository', async () => {
  const html = await readFile(new URL('index.html', siteRoot), 'utf8');

  assert.match(html, /href="\/projects\/snake\/"[^>]*>\s*Play Snake/);
  assert.match(html, /href="https:\/\/github\.com\/AntonioJo98\/henriqueprogramas-neocities"/);
});

test('unbuilt projects are labelled honestly instead of linking to invented demos', async () => {
  const html = await readFile(new URL('index.html', siteRoot), 'utf8');

  assert.equal((html.match(/Coming next/g) || []).length, 3);
  assert.doesNotMatch(html, /href="\/projects\/(turtle-crossing|flash-cards|coffee-wifi)\//);
});

test('homepage contains an accessible introduction and project section', async () => {
  const html = await readFile(new URL('index.html', siteRoot), 'utf8');

  assert.match(html, /<main/);
  assert.match(html, /<h1/);
  assert.match(html, /aria-labelledby="projects-title"/);
  assert.match(html, /Skip to projects/);
});
