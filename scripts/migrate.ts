/**
 * Run database migrations manually.
 * Usually not needed — migrations run automatically on startup.
 */
import { loadConfig, ArvisDatabase } from '@arvis/core';
import initialMigration from '../packages/core/src/db/migrations/001-initial.js';
import multiProviderMigration from '../packages/core/src/db/migrations/002-multi-provider.js';
import botInstancesMigration from '../packages/core/src/db/migrations/003-bot-instances.js';
import variablesMigration from '../packages/core/src/db/migrations/004-variables.js';

const ALL_MIGRATIONS = [initialMigration, multiProviderMigration, botInstancesMigration, variablesMigration];

const config = loadConfig();
const db = new ArvisDatabase(config);

const arg = process.argv[2];

if (arg === 'rollback') {
  const name = db.rollback(ALL_MIGRATIONS);
  console.log(name ? `Rolled back: ${name}` : 'Nothing to rollback.');
} else {
  db.migrate(ALL_MIGRATIONS);
  console.log('All migrations applied.');
}

db.close();
