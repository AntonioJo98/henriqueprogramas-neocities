import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createStudyState,
  revealAnswer,
  markKnown,
  skipCard,
  restoreProgress,
  beginKnowledgeCheck,
  answerKnowledgeCheck,
} from '../site/projects/flash-cards/flash-engine.mjs';

const cards = [
  { id: 'bonjour', french: 'bonjour', english: 'hello' },
  { id: 'merci', french: 'merci', english: 'thank you' },
  { id: 'livre', french: 'livre', english: 'book' },
  { id: 'maison', french: 'maison', english: 'house' },
];

test('createStudyState starts on the first unknown card with the answer hidden', () => {
  const state = createStudyState(cards, () => 0);

  assert.equal(state.current.id, 'bonjour');
  assert.equal(state.revealed, false);
  assert.deepEqual(state.knownIds, []);
  assert.equal(state.remaining, 4);
});

test('revealAnswer shows the translation without changing progress', () => {
  const state = createStudyState(cards, () => 0);
  const revealed = revealAnswer(state);

  assert.equal(revealed.revealed, true);
  assert.equal(revealed.current.english, 'hello');
  assert.equal(revealed.remaining, 4);
});

test('markKnown stores the card and moves to an unknown replacement', () => {
  const state = createStudyState(cards, () => 0);
  const next = markKnown(state, () => 0);

  assert.deepEqual(next.knownIds, ['bonjour']);
  assert.equal(next.current.id, 'merci');
  assert.equal(next.remaining, 3);
  assert.equal(next.revealed, false);
});

test('skipCard keeps progress and moves to another card', () => {
  const state = createStudyState(cards, () => 0);
  const next = skipCard(state, () => 0.5);

  assert.deepEqual(next.knownIds, []);
  assert.equal(next.current.id, 'livre');
  assert.equal(next.remaining, 4);
});

test('a knowledge check offers four English options including the correct translation', () => {
  const state = createStudyState(cards, () => 0);
  const checking = beginKnowledgeCheck(state, () => 0);

  assert.equal(checking.checking, true);
  assert.equal(checking.options.length, 4);
  assert.equal(new Set(checking.options).size, 4);
  assert.ok(checking.options.includes('hello'));
});

test('an incorrect knowledge-check answer keeps the current card for practice', () => {
  const state = beginKnowledgeCheck(createStudyState(cards, () => 0), () => 0);
  const result = answerKnowledgeCheck(state, 'book', () => 0);

  assert.equal(result.correct, false);
  assert.equal(result.state.current.id, 'bonjour');
  assert.deepEqual(result.state.knownIds, []);
  assert.equal(result.state.checking, true);
});

test('a correct knowledge-check answer saves the card and advances', () => {
  const state = beginKnowledgeCheck(createStudyState(cards, () => 0), () => 0);
  const result = answerKnowledgeCheck(state, 'hello', () => 0);

  assert.equal(result.correct, true);
  assert.deepEqual(result.state.knownIds, ['bonjour']);
  assert.equal(result.state.current.id, 'merci');
  assert.equal(result.state.remaining, 3);
  assert.equal(result.state.checking, false);
});

test('restoreProgress removes saved known cards and reports completion', () => {
  const inProgress = restoreProgress(cards, ['bonjour'], () => 0);
  const complete = restoreProgress(cards, cards.map((card) => card.id), () => 0);

  assert.equal(inProgress.current.id, 'merci');
  assert.equal(inProgress.remaining, 3);
  assert.equal(complete.current, null);
  assert.equal(complete.remaining, 0);
  assert.equal(complete.complete, true);
});
