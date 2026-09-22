import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createGame,
  movePlayer,
  stepGame,
} from '../site/projects/turtle-crossing/game-engine.mjs';

test('createGame starts the player at the bottom on level one', () => {
  const game = createGame({ columns: 20, rows: 20 });

  assert.deepEqual(game.player, { x: 10, y: 18 });
  assert.equal(game.level, 1);
  assert.equal(game.status, 'ready');
  assert.deepEqual(game.cars, []);
});

test('movePlayer moves one cell and stays inside the board', () => {
  const game = { ...createGame(), status: 'playing' };
  const moved = movePlayer(game, { x: 0, y: -1 });
  const leftEdge = { ...moved, player: { x: 0, y: moved.player.y } };

  assert.deepEqual(moved.player, { x: 10, y: 17 });
  assert.equal(movePlayer(leftEdge, { x: -1, y: 0 }).player.x, 0);
});

test('reaching the finish line increases the level and resets the player', () => {
  const game = {
    ...createGame(),
    status: 'playing',
    player: { x: 7, y: 2 },
  };
  const next = movePlayer(game, { x: 0, y: -1 });

  assert.equal(next.level, 2);
  assert.deepEqual(next.player, { x: 10, y: 18 });
  assert.ok(next.carSpeed > game.carSpeed);
});

test('stepGame moves traffic to the left and removes cars beyond the board', () => {
  const game = {
    ...createGame(),
    status: 'playing',
    carSpeed: 0.5,
    cars: [
      { x: 8, y: 10, color: '#ff756e' },
      { x: -2.2, y: 8, color: '#78b8ff' },
    ],
  };
  const next = stepGame(game, () => 1);

  assert.deepEqual(next.cars, [{ x: 7.5, y: 10, color: '#ff756e' }]);
});

test('colliding with a car ends the game', () => {
  const game = {
    ...createGame(),
    status: 'playing',
    player: { x: 10, y: 10 },
    cars: [{ x: 10.3, y: 10, color: '#ff756e' }],
  };

  assert.equal(stepGame(game, () => 1).status, 'gameover');
});

test('traffic can spawn in a playable lane', () => {
  const values = [0.01, 0.5, 0.1];
  const random = () => values.shift() ?? 1;
  const game = { ...createGame(), status: 'playing' };
  const next = stepGame(game, random);

  assert.equal(next.cars.length, 1);
  assert.equal(next.cars[0].x, 21);
  assert.ok(next.cars[0].y >= 3 && next.cars[0].y <= 16);
});
