#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { Arvis, createLogger } from '@arvis/core';

const log = createLogger('main');
const VERSION = '3.1.0';

const BANNER = `
  \x1b[35m█████╗ ██████╗ ██╗   ██╗██╗███████╗\x1b[0m
  \x1b[35m██╔══██╗██╔══██╗██║   ██║██║██╔════╝\x1b[0m
  \x1b[35m███████║██████╔╝██║   ██║██║███████╗\x1b[0m
  \x1b[35m██╔══██║██╔══██╗╚██╗ ██╔╝██║╚════██║\x1b[0m
  \x1b[35m██║  ██║██║  ██║ ╚████╔╝ ██║███████║\x1b[0m
  \x1b[35m╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝\x1b[0m
  \x1b[90mv${VERSION} — self-hosted AI agent platform\x1b[0m
`;

// Auto-create .env from .env.example if missing
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  const examplePath = path.resolve(process.cwd(), '.env.example');
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('\n  \x1b[33m.env created from .env.example\x1b[0m');
    console.log('  Edit .env with your API keys, then run \x1b[36mnpm start\x1b[0m again.\n');
    process.exit(0);
  }
}

// Create data directories
const dataDir = process.env.ARVIS_DATA_DIR || './data';
for (const sub of ['logs', 'backups', 'uploads', 'sessions']) {
  const dir = path.join(dataDir, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const arvis = new Arvis();

async function main() {
  console.log(BANNER);

  await arvis.start();

  // Seed env-var bots into DB (no-op if already present), then start all enabled bots
  arvis.connectorManager.seedFromEnv();
  await arvis.connectorManager.startAll();

  // Web connector always starts (powers dashboard chat + REST API)
  if (arvis.config.web.port) {
    try {
      const { WebConnector } = await import('@arvis/connector-web');
      const web = new WebConnector(arvis.bus, {
        port: arvis.config.web.port,
        apiKey: arvis.config.web.apiKey,
      });
      await web.start();
      log.info({ port: arvis.config.web.port }, 'Web connector started');
    } catch (err) {
      log.error({ err }, 'Web connector failed to start');
    }
  }

  const dashPort = arvis.config.dashboard.port || 5100;
  const accounts = arvis.accountManager.getStatus().length;
  const agents = arvis.registry.getAll().length;

  console.log('');
  console.log(`  \x1b[32m✓\x1b[0m Core running`);
  console.log(`  \x1b[32m✓\x1b[0m ${accounts} LLM account(s) loaded`);
  console.log(`  \x1b[32m✓\x1b[0m ${agents} agent(s) registered`);
  console.log('');
  console.log(`  Dashboard:  \x1b[36mnpm run dashboard\x1b[0m  →  http://localhost:${dashPort}`);
  console.log('');
}

process.on('SIGINT',  async () => { await arvis.stop(); process.exit(0); });
process.on('SIGTERM', async () => { await arvis.stop(); process.exit(0); });

main().catch((err) => {
  console.error('\n  \x1b[31m✗ Fatal error:\x1b[0m', err.message || err);
  if (err.message?.includes('no such table')) {
    console.error('  \x1b[90mThis usually means the database is corrupted. Delete data/arvis.db and restart.\x1b[0m');
  }
  if (err.message?.includes('no LLM accounts')) {
    console.error('  \x1b[90mAdd at least one API key or Claude CLI account to your .env file.\x1b[0m');
  }
  console.error('');
  process.exit(1);
});
