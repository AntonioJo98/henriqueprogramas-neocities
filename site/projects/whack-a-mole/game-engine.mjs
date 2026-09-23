export function createGame({ holes = 9, duration = 30 } = {}) {
  return { holes, duration, status: 'ready', score: 0, hits: 0, timeLeft: duration, activeHole: null };
}

export function showMole(game, random = Math.random) {
  if (game.status === 'finished') return game;
  const activeHole = Math.min(Math.floor(random() * game.holes), game.holes - 1);
  return { ...game, status: 'playing', activeHole };
}

export function whackMole(game, hole, random = Math.random) {
  if (game.status !== 'playing' || hole !== game.activeHole) return game;
  return showMole({ ...game, score: game.score + 1, hits: game.hits + 1 }, random);
}

export function tick(game, random = Math.random) {
  if (game.status !== 'playing') return game;
  const timeLeft = Math.max(0, game.timeLeft - 1);
  if (timeLeft === 0) return { ...game, timeLeft, status: 'finished', activeHole: null };
  return showMole({ ...game, timeLeft }, random);
}
