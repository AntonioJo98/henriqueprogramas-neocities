import {
  filterCafes,
  addCafeSuggestion,
  normaliseStoredSuggestions,
} from './coffee-engine.mjs';

const STORAGE_KEY = 'henrique-programas-coffee-wifi-suggestions-v1';
const search = document.querySelector('#cafe-search');
const wifiFilter = document.querySelector('#wifi-filter');
const powerFilter = document.querySelector('#power-filter');
const results = document.querySelector('#cafe-results');
const resultCount = document.querySelector('#result-count');
const noResults = document.querySelector('#no-results');
const form = document.querySelector('#suggestion-form');
const suggestionStatus = document.querySelector('#suggestion-status');
let cafes = [];

async function initialise() {
  try {
    const response = await fetch('cafes.json');
    if (!response.ok) throw new Error('The demo café data could not be loaded.');
    const baseCafes = await response.json();
    cafes = [...baseCafes, ...readSuggestions()];
    renderResults();
  } catch (error) {
    resultCount.textContent = 'Directory unavailable';
    noResults.hidden = false;
    noResults.textContent = error.message;
  }
}

function renderResults() {
  const filtered = filterCafes(cafes, {
    query: search.value,
    minWifi: wifiFilter.value,
    needsPower: powerFilter.checked,
  });
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'café' : 'cafés'} found`;
  noResults.hidden = filtered.length > 0;
  results.replaceChildren(...filtered.map(createCafeCard));
}

function createCafeCard(cafe) {
  const card = document.createElement('article');
  card.className = 'cafe-card';
  if (cafe.custom) {
    const badge = document.createElement('span');
    badge.className = 'custom-badge';
    badge.textContent = 'Saved locally';
    card.append(badge);
  }
  const title = document.createElement('h3');
  title.textContent = cafe.name;
  const area = document.createElement('p');
  area.className = 'cafe-area';
  area.textContent = cafe.area;
  const hours = document.createElement('p');
  hours.className = 'hours';
  hours.textContent = `${cafe.open} – ${cafe.close}`;
  card.append(title, area, hours, rating('Coffee', cafe.coffee), rating('Wi-Fi', cafe.wifi), rating('Power', cafe.power));
  return card;
}

function rating(label, value) {
  const row = document.createElement('div');
  row.className = 'rating';
  const text = document.createElement('span');
  text.textContent = label;
  const dots = document.createElement('span');
  dots.className = 'dots';
  dots.setAttribute('aria-label', `${label}: ${value} out of 5`);
  dots.textContent = '●'.repeat(value) + '○'.repeat(5 - value);
  row.append(text, dots);
  const wrapper = document.createElement('div');
  wrapper.className = 'ratings';
  wrapper.append(row);
  return wrapper;
}

function readSuggestions() {
  try {
    return normaliseStoredSuggestions(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return [];
  }
}

function saveSuggestions() {
  const custom = cafes.filter((cafe) => cafe.custom);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  const result = addCafeSuggestion(cafes, values);
  if (!result.ok) {
    suggestionStatus.textContent = 'Please complete every field and choose ratings from 1 to 5.';
    return;
  }
  cafes = [...cafes, result.cafe];
  saveSuggestions();
  form.reset();
  suggestionStatus.textContent = `Saved “${result.cafe.name}” in this browser only.`;
  renderResults();
});

[search, wifiFilter, powerFilter].forEach((control) => control.addEventListener('input', renderResults));
initialise();
