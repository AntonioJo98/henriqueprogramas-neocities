export function createStudyState(cards, random = Math.random) {
  return buildState(cards, [], random);
}

export function restoreProgress(cards, knownIds, random = Math.random) {
  const validIds = new Set(cards.map((card) => card.id));
  const known = [...new Set(knownIds)].filter((id) => validIds.has(id));
  return buildState(cards, known, random);
}

export function revealAnswer(state) {
  return state.current ? { ...state, revealed: true } : state;
}

export function markKnown(state, random = Math.random) {
  if (!state.current) return state;
  const knownIds = [...new Set([...state.knownIds, state.current.id])];
  return buildState(state.cards, knownIds, random);
}

export function skipCard(state, random = Math.random) {
  if (!state.current) return state;
  const available = state.cards.filter((card) => !state.knownIds.includes(card.id));
  const alternatives = available.filter((card) => card.id !== state.current.id);
  const pool = alternatives.length > 0 ? alternatives : available;
  return {
    ...state,
    current: pick(pool, random),
    revealed: false,
    checking: false,
    options: [],
    lastAnswerCorrect: null,
  };
}

export function beginKnowledgeCheck(state, random = Math.random) {
  if (!state.current || state.complete) return state;
  const distractors = shuffle(
    state.cards.filter((card) => card.id !== state.current.id).map((card) => card.english),
    random,
  ).slice(0, 3);
  const options = shuffle([state.current.english, ...distractors], random);
  return { ...state, checking: true, options, lastAnswerCorrect: null };
}

export function answerKnowledgeCheck(state, answer, random = Math.random) {
  if (!state.checking || !state.current) return { correct: false, state };
  if (answer !== state.current.english) {
    return { correct: false, state: { ...state, lastAnswerCorrect: false } };
  }
  return { correct: true, state: markKnown(state, random) };
}

function buildState(cards, knownIds, random) {
  const available = cards.filter((card) => !knownIds.includes(card.id));
  return {
    cards,
    knownIds,
    current: pick(available, random),
    revealed: false,
    remaining: available.length,
    complete: available.length === 0,
    checking: false,
    options: [],
    lastAnswerCorrect: null,
  };
}

function pick(cards, random) {
  if (cards.length === 0) return null;
  return cards[Math.min(Math.floor(random() * cards.length), cards.length - 1)];
}

function shuffle(items, random) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.min(Math.floor(random() * (index + 1)), index);
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}
