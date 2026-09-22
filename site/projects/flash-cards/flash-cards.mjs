import {
  createStudyState,
  revealAnswer,
  skipCard,
  restoreProgress,
  beginKnowledgeCheck,
  answerKnowledgeCheck,
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
const knowledgeCheck = document.querySelector('#knowledge-check');
const checkFrenchWord = document.querySelector('#check-french-word');
const answerOptions = document.querySelector('#answer-options');
const checkFeedback = document.querySelector('#check-feedback');
const cancelCheck = document.querySelector('#cancel-check');

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
  hint.textContent = state.revealed ? 'Select “I know this” to try a quick four-answer check.' : 'Tap, press Enter, or use Reveal answer.';
  card.setAttribute('aria-label', state.revealed ? `English translation: ${state.current.english}` : `French word: ${state.current.french}. Activate to reveal its translation.`);
  status.textContent = message;
  disableActions(state.checking);
  revealButton.disabled = state.revealed || state.checking;
}

function reveal() {
  if (!state || state.complete || state.revealed || state.checking) return;
  state = revealAnswer(state);
  render('Answer revealed. Do you know this word?');
}

function startKnowledgeCheck() {
  if (!state || state.complete || state.checking) return;
  state = beginKnowledgeCheck(state);
  checkFrenchWord.textContent = state.current.french;
  checkFeedback.textContent = 'Choose the correct English translation.';
  answerOptions.replaceChildren(...state.options.map((option) => {
    const button = document.createElement('button');
    button.className = 'answer-option';
    button.type = 'button';
    button.textContent = option;
    button.addEventListener('click', () => answerCheck(option, button));
    return button;
  }));
  knowledgeCheck.hidden = false;
  answerOptions.querySelector('button')?.focus();
  render('Quick check open. Choose the matching English word.');
}

function answerCheck(answer, button) {
  const result = answerKnowledgeCheck(state, answer);
  state = result.state;
  if (!result.correct) {
    button.classList.add('is-wrong');
    button.disabled = true;
    checkFeedback.textContent = 'Not quite — choose another answer or keep practising.';
    return;
  }
  saveKnownIds(state.knownIds);
  knowledgeCheck.hidden = true;
  render(state.complete ? 'You completed this vocabulary deck!' : 'Correct! Saved as known. Here is another card.');
  knownButton.focus();
}

function closeKnowledgeCheck() {
  if (!state?.checking) return;
  state = { ...state, checking: false, options: [], lastAnswerCorrect: null };
  knowledgeCheck.hidden = true;
  render('Kept for practice. Reveal the answer whenever you want.');
  knownButton.focus();
}

function skip() {
  if (!state || state.complete || state.checking) return;
  state = skipCard(state);
  render('Kept for practice. Here is another card.');
}

function resetProgress() {
  if (!state) return;
  localStorage.removeItem(STORAGE_KEY);
  state = createStudyState(state.cards);
  knowledgeCheck.hidden = true;
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
knownButton.addEventListener('click', startKnowledgeCheck);
skipButton.addEventListener('click', skip);
resetButton.addEventListener('click', resetProgress);
cancelCheck.addEventListener('click', closeKnowledgeCheck);
card.addEventListener('click', reveal);
card.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    reveal();
  }
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeKnowledgeCheck();
  if (state?.checking) return;
  if (event.key === ' ') {
    event.preventDefault();
    reveal();
  }
  if (event.key.toLowerCase() === 'k') startKnowledgeCheck();
  if (event.key.toLowerCase() === 's') skip();
});

initialise();
