import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const projectRoot = new URL('../site/projects/flash-cards/', import.meta.url);

test('Flash Cards page exposes a study card, progress, and learning actions', async () => {
  const html = await readFile(new URL('index.html', projectRoot), 'utf8');

  assert.match(html, /id="flash-card"/);
  assert.match(html, /id="card-language"/);
  assert.match(html, /id="card-word"/);
  assert.match(html, /id="remaining-count"/);
  assert.match(html, /id="reveal-button"/);
  assert.match(html, /id="known-button"/);
  assert.match(html, /id="skip-button"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /flash-cards\.mjs/);
});

test('Flash Cards project has local data, styles and JavaScript entry point', async () => {
  const [css, script, data] = await Promise.all([
    readFile(new URL('style.css', projectRoot), 'utf8'),
    readFile(new URL('flash-cards.mjs', projectRoot), 'utf8'),
    readFile(new URL('cards.json', projectRoot), 'utf8'),
  ]);

  assert.match(css, /\.flash-card/);
  assert.match(script, /localStorage/);
  assert.match(script, /markKnown/);
  assert.match(data, /"french"/);
});
