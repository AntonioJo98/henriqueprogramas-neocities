import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const games = ['snake', 'turtle-crossing', 'whack-a-mole'];

for (const game of games) {
  test(`${game} asks for a public player name and displays a scoreboard`, async () => {
    const base = new URL(`../site/projects/${game}/`, import.meta.url);
    const html = await readFile(new URL('index.html', base), 'utf8');
    const script = await readFile(new URL('game.mjs', base), 'utf8');
    assert.match(html, /id="player-form"/);
    assert.match(html, /name="playerName"/);
    assert.match(html, /id="scoreboard-body"/);
    assert.match(html, /All valid results remain stored/);
    assert.match(script, /createScoreboard/);
    assert.match(script, /publicScores\.submit/);
  });
}
