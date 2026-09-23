import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createGame,
  showMole,
  whackMole,
  tick,
} from '../site/projects/whack-a-mole/game-engine.mjs';

test('createGame starts ready with a nine-hole board and zero score', () => {
  const game = createGame();

  assert.equal(game.status, 'ready');
  assert.equal(game.score, 0);
  assert.equal(game.timeLeft, 30);
  assert.equal(game.activeHole, null);
  assert.equal(game.holes, 9);
});

test('showMole starts the game and selects a valid hole', () => {
  const next = showMole(createGame(), () => 0.45);

  assert.equal(next.status, 'playing');
  assert.equal(next.activeHole, 4);
});

test('whackMole scores once and immediately moves the mole', () => {
  const game = { ...showMole(createGame(), () => 0), activeHole: 0 };
  const hit = whackMole(game, 0, () => 0.8);
  const miss = whackMole(hit, 0, () => 0.2);

  assert.equal(hit.score, 1);
  assert.equal(hit.hits, 1);
  assert.equal(hit.activeHole, 7);
  assert.equal(miss.score, 1);
});

test('tick counts down and ends the game at zero', () => {
  const playing = { ...showMole(createGame(), () => 0), timeLeft: 1 };
  const finished = tick(playing, () => 0.4);

  assert.equal(finished.timeLeft, 0);
  assert.equal(finished.status, 'finished');
  assert.equal(finished.activeHole, null);
});
