export const SITE_ORIGIN = 'https://henriquemaulaz.neocities.org';
export const ALLOWED_GAMES = new Set(['snake', 'turtle-crossing', 'whack-a-mole']);
const PLAYER_NAME = /^[\p{L}\p{N}][\p{L}\p{N} _-]*$/u;

export function isAllowedOrigin(origin) {
  return origin === SITE_ORIGIN;
}

export function normaliseScoreSubmission(value) {
  if (!value || typeof value !== 'object') return null;
  const game = value.game;
  const playerName = typeof value.playerName === 'string' ? value.playerName.trim() : '';
  const score = value.score;

  if (!ALLOWED_GAMES.has(game)) return null;
  if (playerName.length < 2 || playerName.length > 20 || !PLAYER_NAME.test(playerName)) return null;
  if (!Number.isSafeInteger(score) || score < 0) return null;

  return { game, playerName, score };
}

export function scoreQueryForGame(game) {
  if (!ALLOWED_GAMES.has(game)) throw new Error('Unknown game.');
  return `SELECT player_name AS playerName, score, created_at AS createdAt
    FROM scores
    WHERE game = ?
    ORDER BY score DESC, created_at ASC
    LIMIT 20`;
}

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : SITE_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  Vary: 'Origin',
});

const json = (body, status = 200, origin = SITE_ORIGIN) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(origin) },
});

async function handle(request, env) {
  const origin = request.headers.get('Origin') || '';
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return isAllowedOrigin(origin)
      ? new Response(null, { headers: corsHeaders(origin) })
      : new Response(null, { status: 403 });
  }

  const getMatch = url.pathname.match(/^\/scores\/([a-z-]+)$/);
  if (request.method === 'GET' && getMatch) {
    const game = getMatch[1];
    if (!ALLOWED_GAMES.has(game)) return json({ error: 'Unknown game.' }, 404, origin);
    const { results } = await env.SCORES_DB.prepare(scoreQueryForGame(game)).bind(game).all();
    return json({ game, scores: results }, 200, origin);
  }

  if (url.pathname !== '/scores' || request.method !== 'POST') {
    return json({ error: 'Not found.' }, 404, origin);
  }
  if (!isAllowedOrigin(origin)) return json({ error: 'Origin not allowed.' }, 403, origin);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON.' }, 400, origin); }
  const score = normaliseScoreSubmission(body);
  if (!score) return json({ error: 'Invalid score.' }, 400, origin);

  const actorKey = `${request.headers.get('CF-Connecting-IP') || 'unknown'}:${score.game}`;
  const rate = await env.SCORE_RATE_LIMITER?.limit({ key: actorKey });
  if (rate && !rate.success) return json({ error: 'Please wait before submitting another score.' }, 429, origin);

  await env.SCORES_DB.prepare(
    'INSERT INTO scores (game, player_name, score) VALUES (?, ?, ?)',
  ).bind(score.game, score.playerName, score.score).run();

  return json({ score: { ...score, createdAt: new Date().toISOString() } }, 201, origin);
}

export default { fetch: handle };
