import { changeDirection, createGame, stepGame } from './game-engine.mjs';

const canvas = document.querySelector('#game-board');
const context = canvas.getContext('2d');
const scoreElement = document.querySelector('#score');
const highScoreElement = document.querySelector('#high-score');
const statusElement = document.querySelector('#game-status');
const overlay = document.querySelector('#game-overlay');
const overlayTitle = document.querySelector('#overlay-title');
const overlayCopy = document.querySelector('#overlay-copy');
const startButton = document.querySelector('#start-button');
const directionButtons = document.querySelectorAll('[data-direction]');

const COLUMNS = 20;
const ROWS = 20;
const CELL_SIZE = canvas.width / COLUMNS;
const TICK_MS = 125;
const STORAGE_KEY = 'henriqueprogramas-snake-high-score';

const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const keyDirections = new Map([
  ['ArrowUp', directions.up],
  ['w', directions.up],
  ['ArrowDown', directions.down],
  ['s', directions.down],
  ['ArrowLeft', directions.left],
  ['a', directions.left],
  ['ArrowRight', directions.right],
  ['d', directions.right],
]);

let game = createGame({ columns: COLUMNS, rows: ROWS });
let timer = null;
let highScore = Number.parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);

function startGame() {
  stopTimer();
  game = { ...createGame({ columns: COLUMNS, rows: ROWS }), status: 'playing' };
  overlay.hidden = true;
  statusElement.textContent = 'Game in progress.';
  timer = window.setInterval(tick, TICK_MS);
  render();
  canvas.focus?.();
}

function tick() {
  game = stepGame(game);
  updateHighScore();
  render();

  if (game.status === 'gameover') {
    stopTimer();
    overlayTitle.textContent = 'Game over';
    overlayCopy.textContent = `Final score: ${game.score}. Ready for another run?`;
    startButton.textContent = 'Play again';
    overlay.hidden = false;
    statusElement.textContent = `Game over. Final score ${game.score}.`;
  }
}

function setDirection(nextDirection) {
  if (game.status === 'playing') {
    game = changeDirection(game, nextDirection);
  }
}

function updateHighScore() {
  if (game.score > highScore) {
    highScore = game.score;
    localStorage.setItem(STORAGE_KEY, String(highScore));
  }
}

function stopTimer() {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
}

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (game.food) {
    drawRoundedCell(game.food, '#ff5f73', CELL_SIZE * 0.32);
  }

  game.snake.forEach((segment, index) => {
    drawRoundedCell(segment, index === 0 ? '#d2ff72' : '#73e65b', CELL_SIZE * 0.2);
  });

  scoreElement.textContent = String(game.score);
  highScoreElement.textContent = String(highScore);
}

function drawRoundedCell(cell, color, inset) {
  const size = CELL_SIZE - inset * 2;
  const x = cell.x * CELL_SIZE + inset;
  const y = cell.y * CELL_SIZE + inset;
  const radius = Math.min(5, size / 3);

  context.fillStyle = color;
  context.beginPath();
  context.roundRect(x, y, size, size, radius);
  context.fill();
}

startButton.addEventListener('click', startGame);

directionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setDirection(directions[button.dataset.direction]);
  });
});

window.addEventListener('keydown', (event) => {
  const nextDirection = keyDirections.get(event.key) || keyDirections.get(event.key.toLowerCase());
  if (!nextDirection) return;
  event.preventDefault();
  setDirection(nextDirection);
});

render();
