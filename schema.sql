CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  lang TEXT NOT NULL,
  feeling TEXT,
  message TEXT,
  contact TEXT
);
