const START_SPEED = 0.22;
const SPEED_INCREMENT = 0.045;
const CAR_COLORS = ['#ff756e', '#78b8ff', '#ffe06a', '#b684ff', '#67e8a5'];

export function createGame({ columns = 20, rows = 20 } = {}) {
  return {
    columns,
    rows,
    player: startPosition(columns, rows),
    cars: [],
    level: 1,
    carSpeed: START_SPEED,
    status: 'ready',
  };
}

export function movePlayer(game, direction) {
  if (game.status !== 'playing') return game;

  const player = {
    x: clamp(game.player.x + direction.x, 0, game.columns - 1),
    y: clamp(game.player.y + direction.y, 1, game.rows - 2),
  };

  if (player.y <= 1) {
    return {
      ...game,
      player: startPosition(game.columns, game.rows),
      level: game.level + 1,
      carSpeed: game.carSpeed + SPEED_INCREMENT,
    };
  }

  return { ...game, player };
}

export function stepGame(game, random = Math.random) {
  if (game.status !== 'playing') return game;

  const cars = game.cars
    .map((car) => ({ ...car, x: car.x - game.carSpeed }))
    .filter((car) => car.x > -2);

  if (random() < 0.075) {
    const lane = 3 + Math.floor(random() * (game.rows - 6));
    const colorIndex = Math.floor(random() * CAR_COLORS.length);
    cars.push({
      x: game.columns + 1,
      y: lane,
      color: CAR_COLORS[Math.min(colorIndex, CAR_COLORS.length - 1)],
    });
  }

  const collided = cars.some((car) =>
    Math.abs(car.x - game.player.x) < 1.15 &&
    Math.abs(car.y - game.player.y) < 0.72,
  );

  return {
    ...game,
    cars,
    status: collided ? 'gameover' : game.status,
  };
}

function startPosition(columns, rows) {
  return { x: Math.floor(columns / 2), y: rows - 2 };
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}
