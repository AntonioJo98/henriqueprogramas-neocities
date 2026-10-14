import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalisePlayerName,
  sortScores,
  formatScoreDate,
} from '../site/projects/shared/scoreboard.mjs';

test('normalisePlayerName trims safe names and rejects personal-data-like input', () => {
  assert.equal(normalisePlayerName('  Pixel Fox  '), 'Pixel Fox');
  assert.equal(normalisePlayerName('A'), null);
  assert.equal(normalisePlayerName('x'.repeat(21)), null);
  assert.equal(normalisePlayerName('<script>'), null);
  assert.equal(normalisePlayerName('ana@example.com'), null);
});

test('sortScores orders high to low and older ties first without dropping entries', () => {
  const scores = [
    { playerName: 'B', score: 4, createdAt: '2026-10-08T12:00:00Z' },
    { playerName: 'A', score: 8, createdAt: '2026-10-08T13:00:00Z' },
    { playerName: 'C', score: 8, createdAt: '2026-10-08T11:00:00Z' },
  ];
  assert.deepEqual(sortScores(scores).map((x) => x.playerName), ['C', 'A', 'B']);
  assert.equal(scores[0].playerName, 'B');
});

test('formatScoreDate uses the selected website locale', () => {
  const value = '2026-10-08T13:05:00Z';
  assert.match(formatScoreDate(value, 'pt-PT', 'UTC'), /08\/10\/2026|08-10-2026/);
  assert.match(formatScoreDate(value, 'en', 'UTC'), /10\/08\/2026|10-08-2026/);
});
