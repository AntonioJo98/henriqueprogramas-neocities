import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const projectRoot = new URL('../site/projects/whack-a-mole/', import.meta.url);

test('Whack-a-Mole page exposes score, timer, start button and nine playable holes', async () => {
  const html = await readFile(new URL('index.html', projectRoot), 'utf8');

  assert.match(html, /id="score"/);
  assert.match(html, /id="timer"/);
  assert.match(html, /id="start-button"/);
  assert.equal((html.match(/data-hole=/g) || []).length, 9);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /game\.mjs/);
});

test('Whack-a-Mole project has styles and JavaScript entry point', async () => {
  const [css, script] = await Promise.all([
    readFile(new URL('style.css', projectRoot), 'utf8'),
    readFile(new URL('game.mjs', projectRoot), 'utf8'),
  ]);

  assert.match(css, /\.hole/);
  assert.match(script, /whackMole/);
  assert.match(script, /setInterval/);
});
