CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game TEXT NOT NULL CHECK(game IN ('snake', 'turtle-crossing', 'whack-a-mole')),
  player_name TEXT NOT NULL CHECK(length(player_name) BETWEEN 2 AND 20),
  score INTEGER NOT NULL CHECK(score >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_game_rank
ON scores (game, score DESC, created_at ASC);
