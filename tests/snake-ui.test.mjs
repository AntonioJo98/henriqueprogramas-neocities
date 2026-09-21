import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const projectRoot = new URL('../site/projects/snake/', import.meta.url);

test('Snake page exposes the game canvas, score and controls', async () => {
  const html = await readFile(new URL('index.html', projectRoot), 'utf8');

  assert.match(html, /<canvas[^>]+id="game-board"/);
  assert.match(html, /id="score"/);
  assert.match(html, /id="high-score"/);
  assert.match(html, /id="start-button"/);
  assert.match(html, /aria-label="Move up"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /game\.mjs/);
});

test('Snake project has local stylesheet and JavaScript entry point', async () => {
  const [css, script] = await Promise.all([
    readFile(new URL('style.css', projectRoot), 'utf8'),
    readFile(new URL('game.mjs', projectRoot), 'utf8'),
  ]);

  assert.match(css, /#game-board/);
  assert.match(script, /createGame/);
  assert.match(script, /localStorage/);
});
