import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const projectRoot = new URL('../site/projects/turtle-crossing/', import.meta.url);

test('Turtle Crossing page exposes canvas, level, start and movement controls', async () => {
  const html = await readFile(new URL('index.html', projectRoot), 'utf8');

  assert.match(html, /id="game-board"/);
  assert.match(html, /id="level"/);
  assert.match(html, /id="start-button"/);
  assert.match(html, /aria-label="Move up"/);
  assert.match(html, /aria-label="Move left"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /game\.mjs/);
});

test('Turtle Crossing project has local styling and JavaScript entry point', async () => {
  const [css, script] = await Promise.all([
    readFile(new URL('style.css', projectRoot), 'utf8'),
    readFile(new URL('game.mjs', projectRoot), 'utf8'),
  ]);

  assert.match(css, /#game-board/);
  assert.match(script, /createGame/);
  assert.match(script, /requestAnimationFrame/);
});
