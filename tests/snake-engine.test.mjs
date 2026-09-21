import test from 'node:test';
import assert from 'node:assert/strict';

import {
  changeDirection,
  createGame,
  stepGame,
} from '../site/projects/snake/game-engine.mjs';

test('createGame starts with a three-segment snake moving right', () => {
  const game = createGame({ columns: 12, rows: 12, random: () => 0 });

  assert.deepEqual(game.snake, [
    { x: 6, y: 6 },
    { x: 5, y: 6 },
    { x: 4, y: 6 },
  ]);
  assert.deepEqual(game.direction, { x: 1, y: 0 });
  assert.equal(game.score, 0);
  assert.equal(game.status, 'ready');
});

test('stepGame moves the head one cell in the current direction', () => {
  const game = createGame({ columns: 12, rows: 12, random: () => 0 });
  const next = stepGame({ ...game, status: 'playing' });

  assert.deepEqual(next.snake, [
    { x: 7, y: 6 },
    { x: 6, y: 6 },
    { x: 5, y: 6 },
  ]);
});

test('changeDirection rejects an immediate reverse', () => {
  const game = createGame({ columns: 12, rows: 12, random: () => 0 });

  assert.deepEqual(changeDirection(game, { x: -1, y: 0 }).direction, { x: 1, y: 0 });
  assert.deepEqual(changeDirection(game, { x: 0, y: -1 }).direction, { x: 0, y: -1 });
});

test('eating food grows the snake and increases the score', () => {
  const game = {
    ...createGame({ columns: 12, rows: 12, random: () => 0 }),
    status: 'playing',
    food: { x: 7, y: 6 },
  };
  const next = stepGame(game, () => 0.5);

  assert.equal(next.snake.length, 4);
  assert.equal(next.score, 1);
  assert.notDeepEqual(next.food, { x: 7, y: 6 });
});

test('hitting a wall ends the game', () => {
  const game = {
    ...createGame({ columns: 5, rows: 5, random: () => 0 }),
    snake: [{ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }],
    status: 'playing',
  };

  assert.equal(stepGame(game).status, 'gameover');
});

test('moving into the snake body ends the game', () => {
  const game = {
    ...createGame({ columns: 8, rows: 8, random: () => 0 }),
    snake: [
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 2, y: 4 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
    ],
    direction: { x: -1, y: 0 },
    status: 'playing',
  };

  assert.equal(stepGame(game).status, 'gameover');
});
