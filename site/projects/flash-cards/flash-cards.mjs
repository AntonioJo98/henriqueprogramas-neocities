import {
  createStudyState,
  revealAnswer,
  markKnown,
  skipCard,
  restoreProgress,
} from './flash-engine.mjs';

const STORAGE_KEY = 'henrique-programas-flash-cards-known-v1';
const card = document.querySelector('#flash-card');
const language = document.querySelector('#card-language');
const word = document.querySelector('#card-word');
const hint = document.querySelector('#card-hint');
const remaining = document.querySelector('#remaining-count');
const status = document.querySelector('#study-status');
const revealButton = document.querySelector('#reveal-button');
const knownButton = document.querySelector('#known-button');
const skipButton = document.querySelector('#skip-button');
const resetButton = document.querySelector('#reset-button');

let state;

async function initialise() {
  try {
    const response = await fetch('cards.json');
    if (!response.ok) throw new Error('The vocabulary deck could not be loaded.');
    const cards = await response.json();
    state = restoreProgress(cards, readSavedKnownIds());
    render('Deck ready. Reveal the answer when you are ready.');
  } catch (error) {
    card.classList.add('is-revealed');
    language.textContent = 'Deck unavailable';
    word.textContent = 'Try refreshing';
    hint.textContent = '';
    status.textContent = error.message;
    disableActions(true);
  }
}

function render(message) {
  const complete = state.complete;
  remaining.textContent = String(state.remaining);
  if (complete) {
    card.classList.add('is-revealed');
    language.textContent = 'Great work';
    word.textContent = 'Deck complete!';
    hint.textContent = 'Reset your progress to study the deck again.';
    card.setAttribute('aria-label', 'Deck complete. Reset saved progress to study again.');
    status.textContent = 'You marked every card as known.';
    disableActions(true);
    return;
  }

  card.classList.toggle('is-revealed', state.revealed);
  language.textContent = state.revealed ? 'English' : 'French';
  word.textContent = state.revealed ? state.current.english : state.current.french;
  hint.textContent = state.revealed ? 'Choose whether you know this word, or keep practising it.' : 'Tap, press Enter, or use Reveal answer.';
  card.setAttribute('aria-label', state.revealed ? `English translation: ${state.current.english}` : `French word: ${state.current.french}. Activate to reveal its translation.`);
  status.textContent = message;
  disableActions(false);
  revealButton.disabled = state.revealed;
}

function reveal() {
  if (!state || state.complete || state.revealed) return;
  state = revealAnswer(state);
  render('Answer revealed. Do you know this word?');
}

function markAsKnown() {
  if (!state || state.complete) return;
  state = markKnown(state);
  saveKnownIds(state.knownIds);
  render(state.complete ? 'You completed this vocabulary deck!' : 'Saved as known. Here is another card.');
}

function skip() {
  if (!state || state.complete) return;
  state = skipCard(state);
  render('Kept for practice. Here is another card.');
}

function resetProgress() {
  if (!state) return;
  localStorage.removeItem(STORAGE_KEY);
  state = createStudyState(state.cards);
  render('Progress reset. The full deck is ready again.');
}

function readSavedKnownIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveKnownIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function disableActions(disabled) {
  revealButton.disabled = disabled;
  knownButton.disabled = disabled;
  skipButton.disabled = disabled;
}

revealButton.addEventListener('click', reveal);
knownButton.addEventListener('click', markAsKnown);
skipButton.addEventListener('click', skip);
resetButton.addEventListener('click', resetProgress);
card.addEventListener('click', reveal);
card.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    reveal();
  }
});
window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === ' ') {
    event.preventDefault();
    reveal();
  }
  if (event.key.toLowerCase() === 'k') markAsKnown();
  if (event.key.toLowerCase() === 's') skip();
});

initialise();
