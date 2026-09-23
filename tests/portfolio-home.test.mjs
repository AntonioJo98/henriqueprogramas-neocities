import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const siteRoot = new URL('../site/', import.meta.url);

test('portfolio homepage keeps four course-inspired cards and adds Whack-a-Mole', async () => {
  const html = await readFile(new URL('index.html', siteRoot), 'utf8');
  const cards = [...html.matchAll(/<article[^>]+data-project="([^"]+)"/g)];

  assert.deepEqual(cards.map((match) => match[1]), [
    'snake',
    'turtle-crossing',
    'flash-cards',
    'coffee-wifi',
    'whack-a-mole',
    'calculator',
  ]);
});

test('Snake card links to the playable demo and repository', async () => {
  const html = await readFile(new URL('index.html', siteRoot), 'utf8');

  assert.match(html, /href="\/projects\/snake\/"[^>]*>\s*Play Snake/);
  assert.match(html, /href="https:\/\/github\.com\/AntonioJo98\/henriqueprogramas-neocities"/);
});

test('Turtle Crossing card links to its playable demo', async () => {
  const html = await readFile(new URL('index.html', siteRoot), 'utf8');

  assert.match(html, /href="\/projects\/turtle-crossing\/"[^>]*>\s*Play Turtle Crossing/);
});

test('Flash Cards card links to its playable demo', async () => {
  const html = await readFile(new URL('index.html', siteRoot), 'utf8');

  assert.match(html, /href="\/projects\/flash-cards\/"[^>]*>\s*Study Flash Cards/);
});

test('Coffee & WiFi card links to its playable demo', async () => {
  const html = await readFile(new URL('index.html', siteRoot), 'utf8');

  assert.match(html, /href="\/projects\/coffee-wifi\/"[^>]*>\s*Explore Coffee &amp; WiFi/);
});

test('homepage labels all six built projects as live', async () => {
  const html = await readFile(new URL('index.html', siteRoot), 'utf8');

  assert.equal((html.match(/Coming next/g) || []).length, 0);
  assert.equal((html.match(/>Live</g) || []).length, 6);
});

test('homepage contains an accessible introduction and project section', async () => {
  const html = await readFile(new URL('index.html', siteRoot), 'utf8');

  assert.match(html, /<main/);
  assert.match(html, /<h1/);
  assert.match(html, /aria-labelledby="projects-title"/);
  assert.match(html, /Skip to projects/);
});
