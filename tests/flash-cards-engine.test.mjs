import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createStudyState,
  revealAnswer,
  markKnown,
  skipCard,
  restoreProgress,
} from '../site/projects/flash-cards/flash-engine.mjs';

const cards = [
  { id: 'bonjour', french: 'bonjour', english: 'hello' },
  { id: 'merci', french: 'merci', english: 'thank you' },
  { id: 'livre', french: 'livre', english: 'book' },
];

test('createStudyState starts on the first unknown card with the answer hidden', () => {
  const state = createStudyState(cards, () => 0);

  assert.equal(state.current.id, 'bonjour');
  assert.equal(state.revealed, false);
  assert.deepEqual(state.knownIds, []);
  assert.equal(state.remaining, 3);
});

test('revealAnswer shows the translation without changing progress', () => {
  const state = createStudyState(cards, () => 0);
  const revealed = revealAnswer(state);

  assert.equal(revealed.revealed, true);
  assert.equal(revealed.current.english, 'hello');
  assert.equal(revealed.remaining, 3);
});

test('markKnown stores the card and moves to an unknown replacement', () => {
  const state = createStudyState(cards, () => 0);
  const next = markKnown(state, () => 0);

  assert.deepEqual(next.knownIds, ['bonjour']);
  assert.equal(next.current.id, 'merci');
  assert.equal(next.remaining, 2);
  assert.equal(next.revealed, false);
});

test('skipCard keeps progress and moves to another card', () => {
  const state = createStudyState(cards, () => 0);
  const next = skipCard(state, () => 0.8);

  assert.deepEqual(next.knownIds, []);
  assert.equal(next.current.id, 'livre');
  assert.equal(next.remaining, 3);
});

test('restoreProgress removes saved known cards and reports completion', () => {
  const inProgress = restoreProgress(cards, ['bonjour'], () => 0);
  const complete = restoreProgress(cards, cards.map((card) => card.id), () => 0);

  assert.equal(inProgress.current.id, 'merci');
  assert.equal(inProgress.remaining, 2);
  assert.equal(complete.current, null);
  assert.equal(complete.remaining, 0);
  assert.equal(complete.complete, true);
});
