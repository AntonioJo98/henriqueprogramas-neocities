import test from 'node:test';
import assert from 'node:assert/strict';

import {
  filterCafes,
  addCafeSuggestion,
  normaliseStoredSuggestions,
} from '../site/projects/coffee-wifi/coffee-engine.mjs';

const cafes = [
  { id: 'harbour-desk', name: 'Harbour Desk', area: 'Demo Quay', open: '08:00', close: '18:00', coffee: 4, wifi: 5, power: 5 },
  { id: 'paper-moon', name: 'Paper Moon', area: 'Demo Library', open: '09:00', close: '17:00', coffee: 5, wifi: 3, power: 2 },
  { id: 'window-seat', name: 'Window Seat', area: 'Demo Square', open: '07:30', close: '15:30', coffee: 3, wifi: 4, power: 4 },
];

test('filterCafes matches a search query across name and area', () => {
  assert.deepEqual(filterCafes(cafes, { query: 'library' }).map((cafe) => cafe.id), ['paper-moon']);
  assert.deepEqual(filterCafes(cafes, { query: 'desk' }).map((cafe) => cafe.id), ['harbour-desk']);
});

test('filterCafes applies Wi-Fi and power requirements together', () => {
  const filtered = filterCafes(cafes, { minWifi: 4, needsPower: true });

  assert.deepEqual(filtered.map((cafe) => cafe.id), ['harbour-desk', 'window-seat']);
});

test('addCafeSuggestion validates and creates a local custom venue', () => {
  const result = addCafeSuggestion([], {
    name: 'Notebook Nook', area: 'Demo Park', open: '10:00', close: '19:00', coffee: '4', wifi: '5', power: '3',
  });

  assert.equal(result.ok, true);
  assert.equal(result.cafe.id, 'notebook-nook');
  assert.equal(result.cafe.wifi, 5);
  assert.equal(result.cafe.power, 3);
});

test('addCafeSuggestion rejects a blank name and invalid ratings', () => {
  const result = addCafeSuggestion([], {
    name: ' ', area: 'Demo Park', open: '10:00', close: '19:00', coffee: '8', wifi: '0', power: '3',
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.name, /required/i);
  assert.match(result.errors.coffee, /between 1 and 5/i);
});

test('normaliseStoredSuggestions discards malformed saved entries', () => {
  const saved = normaliseStoredSuggestions([
    { id: 'valid', name: 'Valid Cafe', area: 'Demo', open: '08:00', close: '16:00', coffee: 4, wifi: 4, power: 4 },
    { id: 'invalid', name: '', wifi: 10 },
  ]);

  assert.deepEqual(saved.map((cafe) => cafe.id), ['valid']);
});
