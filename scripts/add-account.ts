#!/usr/bin/env tsx
/**
 * npx tsx scripts/add-account.ts [name]
 *
 * Sets up a new Claude CLI subscription account for Arvis.
 *
 * What it does:
 *   1. Creates  data/accounts/<name>/
 *   2. Launches `claude` with HOME pointed there so auth files land inside
 *   3. After you log in, it prints the .env line to add
 *
 * Usage:
 *   npx tsx scripts/add-account.ts            → account named "acc1" (auto-increments)
 *   npx tsx scripts/add-account.ts work       → account named "work"
 *   npx tsx scripts/add-account.ts personal   → account named "personal"
 */
import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const ACCOUNTS_DIR = path.join(ROOT, 'data', 'accounts');

// Determine account name
let name = process.argv[2];
if (!name) {
  // Auto-increment: acc1, acc2, acc3...
  if (!fs.existsSync(ACCOUNTS_DIR)) fs.mkdirSync(ACCOUNTS_DIR, { recursive: true });
  const existing = fs.readdirSync(ACCOUNTS_DIR).filter(d =>
    fs.statSync(path.join(ACCOUNTS_DIR, d)).isDirectory()
  );
  let n = 1;
  while (existing.includes(`acc${n}`)) n++;
  name = `acc${n}`;
}

const accountDir = path.join(ACCOUNTS_DIR, name);

console.log('');
console.log(`  \x1b[35m▸ Arvis — Add CLI Subscription Account\x1b[0m`);
console.log('');

// Create account directory
if (!fs.existsSync(accountDir)) {
  fs.mkdirSync(accountDir, { recursive: true });
  console.log(`  \x1b[32m✓\x1b[0m Created ${path.relative(ROOT, accountDir)}/`);
} else {
  console.log(`  \x1b[33m⚠\x1b[0m Directory already exists: ${path.relative(ROOT, accountDir)}/`);
}

// Check if claude is installed
try {
  execSync('claude --version', { stdio: 'pipe' });
} catch {
  console.log('  \x1b[31m✗\x1b[0m Claude CLI not found. Install it first:');
  console.log('    npm install -g @anthropic-ai/claude-code');
  console.log('');
  process.exit(1);
}

// Check if already authenticated
const claudeDir = path.join(accountDir, '.claude');
if (fs.existsSync(claudeDir) && fs.readdirSync(claudeDir).length > 0) {
  console.log(`  \x1b[32m✓\x1b[0m Account "${name}" already authenticated`);
  printEnvInstructions();
  process.exit(0);
}

console.log(`  \x1b[36m⏳\x1b[0m Launching Claude CLI login for account "${name}"...`);
console.log(`  \x1b[90m   (A browser window will open — log in with your Claude account)\x1b[0m`);
console.log('');

// Spawn `claude auth login` — authenticates and exits cleanly (no interactive terminal)
const env = { ...process.env } as Record<string, string | undefined>;
if (process.platform === 'win32') {
  env.USERPROFILE = accountDir;
} else {
  env.HOME = accountDir;
}
// Remove CLAUDECODE so it doesn't block nested launch from within Claude Code
delete env.CLAUDECODE;

const child = spawn('claude', ['auth', 'login'], {
  cwd: accountDir,
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('close', (code) => {
  console.log('');
  if (code === 0 || fs.existsSync(claudeDir)) {
    console.log(`  \x1b[32m✓\x1b[0m Account "${name}" authenticated successfully!`);
    printEnvInstructions();
  } else {
    console.log(`  \x1b[31m✗\x1b[0m Authentication failed (exit code ${code})`);
    console.log(`  \x1b[90m   Try running manually: claude\x1b[0m`);
  }
  console.log('');
});

function printEnvInstructions() {
  const existingAccounts = fs.readdirSync(ACCOUNTS_DIR).filter(d =>
    fs.statSync(path.join(ACCOUNTS_DIR, d)).isDirectory() &&
    fs.existsSync(path.join(ACCOUNTS_DIR, d, '.claude'))
  );

  console.log('');
  console.log(`  \x1b[32m✓ Account auto-detected!\x1b[0m`);
  console.log(`  \x1b[90m  Arvis scans data/accounts/ on startup — no .env changes needed.\x1b[0m`);
  console.log('');
  console.log(`  \x1b[90m  Authenticated accounts (${existingAccounts.length}):\x1b[0m`);
  for (const acc of existingAccounts) {
    console.log(`    \x1b[90m• ${acc}\x1b[0m`);
  }
  console.log('');
  console.log(`  \x1b[90m  Run \x1b[0mnpm run add-account\x1b[90m again to add more accounts.\x1b[0m`);
}
