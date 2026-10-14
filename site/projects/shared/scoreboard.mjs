const API_URL = 'https://henriquemaulaz-scoreboard.ajontosenio.workers.dev';
const NAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} _-]*$/u;

export function normalisePlayerName(value) {
  const name = typeof value === 'string' ? value.trim() : '';
  return name.length >= 2 && name.length <= 20 && NAME_PATTERN.test(name) ? name : null;
}

export function sortScores(scores) {
  return [...scores].sort((a, b) => b.score - a.score || new Date(a.createdAt) - new Date(b.createdAt));
}

export function formatScoreDate(value, locale = 'pt-PT', timeZone) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(timeZone ? { timeZone } : {}),
  }).format(new Date(value));
}

export function createScoreboard({ game, form, tableBody, status, language = () => document.documentElement.lang }) {
  let playerName = '';

  async function load() {
    status.textContent = language() === 'pt-PT' ? 'A carregar scoreboard…' : 'Loading scoreboard…';
    try {
      const response = await fetch(`${API_URL}/scores/${game}`);
      if (!response.ok) throw new Error('load failed');
      const { scores } = await response.json();
      renderScores(scores);
      status.textContent = scores.length
        ? (language() === 'pt-PT' ? '20 melhores resultados globais.' : 'Top 20 global scores.')
        : (language() === 'pt-PT' ? 'Ainda não existem resultados.' : 'No scores yet.');
    } catch {
      status.textContent = language() === 'pt-PT' ? 'Scoreboard temporariamente indisponível.' : 'Scoreboard temporarily unavailable.';
    }
  }

  function renderScores(scores) {
    tableBody.replaceChildren(...sortScores(scores).slice(0, 20).map((entry, index) => {
      const row = document.createElement('tr');
      for (const value of [index + 1, entry.playerName, entry.score, formatScoreDate(entry.createdAt, language())]) {
        const cell = document.createElement('td');
        cell.textContent = String(value);
        row.append(cell);
      }
      return row;
    }));
  }

  function capturePlayer() {
    const data = new FormData(form);
    const nextName = normalisePlayerName(data.get('playerName'));
    if (!nextName) {
      form.querySelector('[name="playerName"]').setCustomValidity(
        language() === 'pt-PT' ? 'Usa 2–20 letras, números, espaços, _ ou -.' : 'Use 2–20 letters, numbers, spaces, _ or -.',
      );
      form.reportValidity();
      return null;
    }
    form.querySelector('[name="playerName"]').setCustomValidity('');
    playerName = nextName;
    return playerName;
  }

  async function submit(score) {
    if (!playerName) return;
    status.textContent = language() === 'pt-PT' ? 'A guardar resultado…' : 'Saving score…';
    try {
      const response = await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game, playerName, score }),
      });
      if (!response.ok) throw new Error('submit failed');
      await load();
    } catch {
      status.textContent = language() === 'pt-PT' ? 'Não foi possível guardar este resultado.' : 'Could not save this score.';
    }
  }

  return { capturePlayer, load, submit };
}
