export function createGame({ columns = 20, rows = 20, random = Math.random } = {}) {
  const centerX = Math.floor(columns / 2);
  const centerY = Math.floor(rows / 2);
  const snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];

  return {
    columns,
    rows,
    snake,
    direction: { x: 1, y: 0 },
    food: placeFood(columns, rows, snake, random),
    score: 0,
    status: 'ready',
  };
}

export function changeDirection(game, nextDirection) {
  const reversesCurrentDirection =
    game.direction.x + nextDirection.x === 0 &&
    game.direction.y + nextDirection.y === 0;

  if (reversesCurrentDirection) {
    return game;
  }

  return { ...game, direction: nextDirection };
}

export function stepGame(game, random = Math.random) {
  if (game.status !== 'playing') {
    return game;
  }

  const head = game.snake[0];
  const nextHead = {
    x: head.x + game.direction.x,
    y: head.y + game.direction.y,
  };
  const ateFood = sameCell(nextHead, game.food);
  const nextSnake = ateFood
    ? [nextHead, ...game.snake]
    : [nextHead, ...game.snake.slice(0, -1)];

  if (
    outsideBoard(nextHead, game.columns, game.rows) ||
    nextSnake.slice(1).some((segment) => sameCell(segment, nextHead))
  ) {
    return { ...game, status: 'gameover' };
  }

  return {
    ...game,
    snake: nextSnake,
    food: ateFood
      ? placeFood(game.columns, game.rows, nextSnake, random)
      : game.food,
    score: game.score + (ateFood ? 1 : 0),
  };
}

function placeFood(columns, rows, snake, random) {
  const openCells = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const cell = { x, y };
      if (!snake.some((segment) => sameCell(segment, cell))) {
        openCells.push(cell);
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.min(
    openCells.length - 1,
    Math.floor(random() * openCells.length),
  );
  return openCells[index];
}

function outsideBoard(cell, columns, rows) {
  return cell.x < 0 || cell.y < 0 || cell.x >= columns || cell.y >= rows;
}

function sameCell(first, second) {
  return Boolean(second) && first.x === second.x && first.y === second.y;
}
