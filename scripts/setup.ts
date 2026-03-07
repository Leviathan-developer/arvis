/**
 * First-time setup helper.
 * Usually not needed — `npm start` handles everything automatically.
 * Use this if you want to verify your config before starting.
 */
import { loadConfig, ArvisDatabase, AccountManager } from '@arvis/core';
import initialMigration from '../packages/core/src/db/migrations/001-initial.js';
import multiProviderMigration from '../packages/core/src/db/migrations/002-multi-provider.js';
import botInstancesMigration from '../packages/core/src/db/migrations/003-bot-instances.js';
import variablesMigration from '../packages/core/src/db/migrations/004-variables.js';
import fs from 'fs';
import path from 'path';

async function setup() {
  console.log('\n  Arvis Setup\n');

  // Auto-create .env if missing
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    const examplePath = path.resolve(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      console.log('  Created .env from .env.example');
      console.log('  Edit .env with your API keys, then run: npm start\n');
      process.exit(0);
    } else {
      console.error('  No .env.example found.');
      process.exit(1);
    }
  }

  const config = loadConfig();
  console.log(`  Data directory: ${config.dataDir}`);

  // Run all migrations
  const db = new ArvisDatabase(config);
  db.migrate([initialMigration, multiProviderMigration, botInstancesMigration, variablesMigration]);
  console.log('  Database ready.');

  // Sync accounts
  const accounts = new AccountManager(db);
  accounts.syncFromConfig(config.accounts);
  console.log(`  ${config.accounts.length} LLM account(s) configured.`);

  // Create data subdirectories
  for (const sub of ['logs', 'backups', 'uploads', 'sessions']) {
    const dir = path.join(config.dataDir, sub);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  db.close();
  console.log('\n  Setup complete. Run: npm start\n');
}

setup().catch((err) => {
  console.error('  Setup failed:', err.message);
  process.exit(1);
});
