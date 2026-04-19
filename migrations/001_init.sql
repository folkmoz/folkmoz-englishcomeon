CREATE TABLE IF NOT EXISTS vocab (
  id TEXT PRIMARY KEY,
  front TEXT NOT NULL,
  back TEXT NOT NULL DEFAULT '',
  pos TEXT NOT NULL DEFAULT 'other',
  phrase TEXT,
  phrase_html TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_vocab_front ON vocab(front COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_vocab_pos ON vocab(pos);
