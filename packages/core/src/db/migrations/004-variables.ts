import type { Migration } from '../database.js';

const migration: Migration = {
  name: '004-variables',

  up(db) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS variables (
        id          INTEGER PRIMARY KEY,
        key         TEXT NOT NULL UNIQUE,
        value       TEXT NOT NULL,
        description TEXT,
        is_secret   INTEGER DEFAULT 0,
        created_at  TEXT DEFAULT (datetime('now'))
      );
    `);
  },

  down(db) {
    db.exec('DROP TABLE IF EXISTS variables');
  },
};

export default migration;
