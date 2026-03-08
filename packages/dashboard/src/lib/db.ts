import {
  ArvisDatabase,
  AgentRegistry,
  ConversationManager,
  MemoryManager,
  QueueManager,
  BillingManager,
  AccountManager,
  VariableManager,
  initialMigration,
  multiProviderMigration,
  botInstancesMigration,
  variablesMigration,
} from '@arvis/core';
import type { ArvisConfig } from '@arvis/core';
import path from 'path';
import fs from 'fs';

let _db: ArvisDatabase | null = null;

function resolveDataDir(): string {
  // Explicit env var takes priority (absolute path recommended)
  if (process.env.ARVIS_DATA_DIR) {
    return path.resolve(process.env.ARVIS_DATA_DIR);
  }
  // Try <cwd>/data first (Docker / standalone — CWD is project root)
  const cwdData = path.resolve(process.cwd(), 'data');
  if (fs.existsSync(path.join(cwdData, 'arvis.db'))) {
    return cwdData;
  }
  // Next.js workspace: CWD = packages/dashboard/ — project root is 2 levels up
  const workspaceData = path.resolve(process.cwd(), '..', '..', 'data');
  if (fs.existsSync(path.join(workspaceData, 'arvis.db'))) {
    return workspaceData;
  }
  // No existing DB found — default to workspace layout (core will create it)
  return workspaceData;
}

function getDb(): ArvisDatabase {
  if (!_db) {
    // Minimal config — dashboard only needs dataDir for DB access
    const config = {
      dataDir: resolveDataDir(),
      discord: { token: '', ownerId: '' },
      telegram: {},
      slack: {},
      whatsapp: {},
      matrix: {},
      web: { port: 5070 },
      accounts: [],
      webhook: { port: 5080 },
      dashboard: { port: 5100 },
      logLevel: 'info' as const,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    } satisfies ArvisConfig;

    _db = new ArvisDatabase(config);
    _db.migrate([initialMigration, multiProviderMigration, botInstancesMigration, variablesMigration]);
  }
  return _db;
}

export const db = getDb();
export const registry = new AgentRegistry(db);
export const conversations = new ConversationManager(db);
export const memory = new MemoryManager(db);
export const queue = new QueueManager(db);
export const billing = new BillingManager(db);
export const accounts = new AccountManager(db);
export const variables = new VariableManager(db);
