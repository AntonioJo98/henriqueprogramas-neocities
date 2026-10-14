import test from 'node:test';
import assert from 'node:assert/strict';
import worker, {
  ALLOWED_GAMES,
  isAllowedOrigin,
  normaliseScoreSubmission,
  scoreQueryForGame,
} from '../src/index.mjs';

const SITE = 'https://henriquemaulaz.neocities.org';

test('normaliseScoreSubmission accepts a safe score submission', () => {
  assert.deepEqual(
    normaliseScoreSubmission({
      game: 'snake',
      playerName: '  PixelFox  ',
      score: 12,
    }),
    { game: 'snake', playerName: 'PixelFox', score: 12 },
  );
});

test('normaliseScoreSubmission rejects unknown games and unsafe player data', () => {
  assert.equal(normaliseScoreSubmission({ game: 'blackjack', playerName: 'Ana', score: 3 }), null);
  assert.equal(normaliseScoreSubmission({ game: 'snake', playerName: '', score: 3 }), null);
  assert.equal(normaliseScoreSubmission({ game: 'snake', playerName: 'x'.repeat(21), score: 3 }), null);
  assert.equal(normaliseScoreSubmission({ game: 'snake', playerName: '<img>', score: 3 }), null);
  assert.equal(normaliseScoreSubmission({ game: 'snake', playerName: 'Ana', score: -1 }), null);
  assert.equal(normaliseScoreSubmission({ game: 'snake', playerName: 'Ana', score: 1.5 }), null);
});

test('scoreboard allows exactly the portfolio origin', () => {
  assert.equal(isAllowedOrigin(SITE), true);
  assert.equal(isAllowedOrigin('https://evil.example'), false);
  assert.equal(isAllowedOrigin(''), false);
});

test('score query sorts highest score first and returns twenty entries', () => {
  assert.equal(ALLOWED_GAMES.has('whack-a-mole'), true);
  assert.match(scoreQueryForGame('whack-a-mole'), /ORDER BY score DESC, created_at ASC/);
  assert.match(scoreQueryForGame('whack-a-mole'), /LIMIT 20/);
});

function fakeEnv({ results = [] } = {}) {
  const calls = [];
  const statement = {
    bind(...values) { calls.push(values); return this; },
    async all() { return { results }; },
    async run() { return { success: true }; },
  };
  return {
    calls,
    env: {
      SCORES_DB: { prepare() { return statement; } },
      SCORE_RATE_LIMITER: { async limit() { return { success: true }; } },
    },
  };
}

test('GET returns the top twenty payload for one valid game', async () => {
  const scores = [{ playerName: 'Ana', score: 12, createdAt: '2026-10-08 12:00:00' }];
  const { env, calls } = fakeEnv({ results: scores });
  const response = await worker.fetch(new Request('https://api.example/scores/snake', {
    headers: { Origin: SITE },
  }), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { game: 'snake', scores });
  assert.deepEqual(calls[0], ['snake']);
});

test('POST uses server time and inserts every valid result', async () => {
  const { env, calls } = fakeEnv();
  const response = await worker.fetch(new Request('https://api.example/scores', {
    method: 'POST',
    headers: { Origin: SITE, 'Content-Type': 'application/json' },
    body: JSON.stringify({ game: 'whack-a-mole', playerName: 'Rui', score: 21, createdAt: 'fake' }),
  }), env);
  assert.equal(response.status, 201);
  assert.deepEqual(calls[0], ['whack-a-mole', 'Rui', 21]);
  const body = await response.json();
  assert.equal(body.score.playerName, 'Rui');
  assert.match(body.score.createdAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('POST rejects another origin before writing', async () => {
  const { env, calls } = fakeEnv();
  const response = await worker.fetch(new Request('https://api.example/scores', {
    method: 'POST',
    headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
    body: JSON.stringify({ game: 'snake', playerName: 'Ana', score: 4 }),
  }), env);
  assert.equal(response.status, 403);
  assert.equal(calls.length, 0);
});
