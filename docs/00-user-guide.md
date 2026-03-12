# 00 — User Guide: How Arvis Works (Plain English)
> Read this first. No jargon. Just what you need to know to use it.

---

## Installation

### Prerequisites
- **Node.js 20+** (LTS recommended)
- **Git**
- A text editor

### Windows

```powershell
# 1. Install Node.js 20+ from https://nodejs.org (LTS)
# 2. Install Git from https://git-scm.com/download/win
# 3. Install build tools for native modules (better-sqlite3)
npm install -g windows-build-tools
# OR: Install Visual Studio Build Tools with "C++ build tools" workload

# 4. Clone and install
git clone https://github.com/Arvis-agent/arvis
cd arvis
npm install

# 5. Install Claude CLI (for CLI subscription accounts)
npm install -g @anthropic-ai/claude-code

# 6. Configure
copy .env.example .env
# Edit .env — add your Discord/Telegram bot tokens

# 7. Add an LLM account (pick one):
#    CLI subscription (uses your Claude Pro/Max sub):
npm run add-account
#    OR just add an API key to .env:
#    ANTHROPIC_API_KEY=sk-ant-your-key

# 8. Start core + dashboard
npm start
npm run dashboard
```

### macOS

```bash
# 1. Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js and Git
brew install node@20 git

# 3. Xcode Command Line Tools (for native modules)
xcode-select --install

# 4. Clone and install
git clone https://github.com/Arvis-agent/arvis
cd arvis && npm install

# 5. Install Claude CLI (for CLI subscription accounts)
npm install -g @anthropic-ai/claude-code

# 6. Configure
cp .env.example .env
# Edit .env — add your Discord/Telegram bot tokens

# 7. Add an LLM account (pick one):
#    CLI subscription:
npm run add-account
#    OR just add an API key to .env:
#    ANTHROPIC_API_KEY=sk-ant-your-key

# 8. Start
npm start
npm run dashboard
```

### Linux (Ubuntu/Debian)

```bash
# 1. Install Node.js 20+ (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git build-essential python3

# 2. Clone and install
git clone https://github.com/Arvis-agent/arvis
cd arvis && npm install

# 3. Install Claude CLI (for CLI subscription accounts)
npm install -g @anthropic-ai/claude-code

# 4. Configure
cp .env.example .env
nano .env   # Add your Discord/Telegram bot tokens

# 5. Add an LLM account (pick one):
#    CLI subscription:
npm run add-account
#    OR just add an API key to .env:
#    ANTHROPIC_API_KEY=sk-ant-your-key

# 6. Start
npm start
npm run dashboard
```

### Docker (Easiest for VPS)

```bash
git clone https://github.com/Arvis-agent/arvis
cd arvis
cp .env.example .env
# Edit .env — add bot tokens + at least one API key
docker-compose up -d
# Core + dashboard start together
```

> **Note:** Docker doesn't support CLI subscription accounts (they need a browser login). Use API keys instead, or set up CLI accounts on the host and mount `data/accounts/` into the container.

### After Installation

1. Open `http://localhost:5100` (dashboard)
2. Go to Chat → talk to the Conductor
3. Ask it to create your first agent
4. Go to Settings to see your detected accounts

---

## What Is Arvis?

Arvis is your personal AI agent platform. Think of it like having a team of AI assistants — each one specialized for a different job — that you can talk to through Discord, Telegram, your browser, or any messaging app.

**The key idea:** You're the boss. You have one main AI (the **Conductor**) that manages everything. When you ask it to do something, it can either do it itself or spin up a specialized sub-agent for that task.

---

## The Two Things Running

```
┌──────────────────────────────────────────────────────────┐
│  ARVIS CORE  (the brain)                                 │
│  - Your AI agents live here                              │
│  - Connects to Discord, Telegram, etc.                   │
│  - Does all the actual LLM work                          │
│  Start with: node src/main.ts                            │
└──────────────────────────────────────────────────────────┘
         │ shares same database
┌──────────────────────────────────────────────────────────┐
│  DASHBOARD  (the control panel)                          │
│  - Web UI at http://localhost:5100                       │
│  - See conversations, manage agents, check usage         │
│  Start with: npm run dev (in packages/dashboard)         │
└──────────────────────────────────────────────────────────┘
```

---

## The Agent System — Conductor + Sub-Agents

```
         YOU
          │
          │ (message on Discord / Telegram / Dashboard)
          ▼
    ┌─────────────┐
    │  CONDUCTOR  │  ← The main AI. Manages everything.
    │  (Agent #1) │     Can create other agents.
    └─────────────┘
          │
          │ Creates and delegates to:
    ┌─────┴──────┬──────────────┬──────────────────┐
    ▼            ▼              ▼                  ▼
┌─────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────┐
│  SOL    │ │ Research │ │   Support    │ │  Any job │
│  Price  │ │  Agent   │ │   Agent      │ │  you want│
│ Monitor │ │          │ │              │ │          │
└─────────┘ └──────────┘ └──────────────┘ └──────────┘
```

### The Conductor
- The Conductor is **always there** — it's created automatically when Arvis starts
- It's the "manager" AI — you tell it what you want, it figures out how to do it
- It can **create new agents** for specific tasks
- It can **delegate work** to specialist agents
- Talk to it through the dashboard chat or any channel you've set it up on

### Sub-Agents
- Created by the Conductor when you ask for them
- Each has its own **personality, tools, and purpose**
- Examples: price monitor bot, customer support agent, research assistant
- Each agent can be connected to different channels
- They remember things independently (their own memory)

---

## How To Connect Social Platforms

### Step 1: Get your bot tokens

**Discord:**
1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Create New Application → Add a Bot
3. Copy the bot token
4. Invite the bot to your server (OAuth2 → URL Generator → bot + applications.commands)
5. Enable "Message Content Intent" in Bot settings

**Telegram:**
1. Open Telegram, message @BotFather
2. `/newbot` → give it a name and username
3. Copy the token it gives you

**Slack:**
1. Create app at [api.slack.com/apps](https://api.slack.com/apps)
2. Add OAuth scopes: `chat:write`, `channels:history`, `im:history`
3. Get Bot Token (xoxb-...) and App Token (xapp-...)

### Step 2: Add to .env file

```env
DISCORD_TOKEN=your-discord-bot-token
DISCORD_OWNER_ID=your-discord-user-id

TELEGRAM_BOT_TOKEN=your-telegram-token

SLACK_BOT_TOKEN=xoxb-your-token
SLACK_APP_TOKEN=xapp-your-token
SLACK_SIGNING_SECRET=your-signing-secret
```

### Step 3: Restart Arvis Core

Arvis automatically picks up the tokens and starts the bots. You'll see them come online in the dashboard under **Channels**.

### Step 4: Link a bot to an agent

In the dashboard → Channels → click on the platform → assign which agent should handle messages from it.

If not assigned, all messages go to the **Conductor** by default.

---

## How To Add AI Accounts

You can use multiple AI services — Arvis automatically switches between them when one hits a rate limit.

### Option A: Claude CLI Subscription (Best Value)

Uses your Claude Pro/Max subscription via the Claude CLI tool. No per-token cost — just your monthly subscription.

**Step 1:** Install the Claude CLI globally:
```bash
npm install -g @anthropic-ai/claude-code
```

**Step 2:** Add an account:
```bash
npm run add-account
# Or with a custom name:
npm run add-account work
npm run add-account personal
```

This opens a browser window — log in with your Claude account. Auth files are saved to `data/accounts/<name>/.claude/`. That's it.

**Step 3:** There is no step 3. Arvis auto-detects all accounts in `data/accounts/` on startup. No `.env` changes needed.

Want to add more accounts? Run `npm run add-account` again. Each account gets its own isolated auth — you can use different Claude subscriptions (work, personal, etc.).

**How it works under the hood:**
- `npm run add-account` creates `data/accounts/<name>/` and runs `claude auth login` with HOME pointed there
- On startup, Arvis scans `data/accounts/` for directories containing `.claude/` auth files
- Each discovered directory becomes a CLI subscription account
- Accounts are named `cli-<dirname>` (e.g., `cli-acc1`, `cli-work`)

**Advanced: Manual env var setup** (if you prefer):
```env
CLAUDE_CLI_HOME=/home/you/.claude
CLAUDE_CLI_HOME_1=/path/to/another/.claude
```

### Option B: API Keys (Pay Per Token)

#### Anthropic API
```env
ANTHROPIC_API_KEY=sk-ant-your-key
# Add more:
ANTHROPIC_API_KEY_1=sk-ant-key-one
ANTHROPIC_API_KEY_2=sk-ant-key-two
```

#### OpenAI
```env
OPENAI_API_KEY=sk-your-openai-key
```

#### OpenRouter (access many models with one key)
```env
OPENROUTER_API_KEY=sk-or-your-key
```

#### Google Gemini
```env
GOOGLE_API_KEY=AIza-your-key
```

#### Ollama (local, free)
```env
OLLAMA_BASE_URL=http://localhost:11434
```

### Mixing Accounts

You can use any combination. Example `.env`:
```env
# CLI subscription for heavy use (no per-token cost)
# (auto-detected from data/accounts/ — no env var needed)

# Cheap API key as fallback when CLI is rate-limited
ANTHROPIC_API_KEY=sk-ant-your-key

# Local model as last resort
OLLAMA_BASE_URL=http://localhost:11434
```

**Arvis handles rate limits automatically.** If one account hits a limit, it silently switches to the next available one. You never see an error — it just keeps working.

---

## Account Switching — How It Works

```
You send a message
  ↓
Arvis checks: which accounts are available?
  ↓
  ┌─ Has a preferred provider for this agent? (e.g. "anthropic")
  │   → Try that first
  │
  ├─ That account rate-limited?
  │   → Try agent's fallback providers
  │
  ├─ All fallbacks rate-limited?
  │   → Try ANY available account
  │
  └─ Everything rate-limited?
      → Retry automatically in 2 min (exponential backoff)
      → You still get a response, just a bit later
```

### What Happens When Rate-Limited?

If ALL your accounts are rate-limited at the same time, Arvis tells you:

> *"All AI accounts are rate-limited. Retrying automatically in ~2 minutes."*

It retries with exponential backoff (2, 4, 8 minutes). You **will** get a response — just delayed. Once any account becomes available again, your message is processed automatically.

**How to avoid this:** Add multiple accounts. Even 2 Claude CLI homes + 1 cheap API key (Anthropic haiku or OpenAI mini) means you'll almost never see this message.

**Account memory:** When it switches accounts, the conversation history is rebuilt from the database. So even if account A was doing the conversation and account B takes over, it gets the full context. Nothing is lost.

---

## How The Conductor Creates Agents

When you ask the Conductor to create something, it outputs **special tags** that Arvis parses:

**You say:** "Create a bot that checks Bitcoin price every 5 minutes and posts to #prices"

**Conductor outputs:**
```
Sure! Creating that now.

[CREATE_AGENT]
slug: btc-price-monitor
name: BTC Price Monitor
role: custom
model: claude-haiku-4-5
allowed_tools: ["http_fetch"]
description: Monitors Bitcoin price and posts updates
[/CREATE_AGENT]

[CREATE_HEARTBEAT]
agent: btc-price-monitor
name: BTC Price Alert
schedule: every 5m
prompt: Fetch BTC price from CoinGecko API and post a brief update with current price and 24h change.
channel: 1234567890
platform: discord
[/CREATE_HEARTBEAT]

Done! The BTC Price Monitor agent is created and will check every 5 minutes.
```

Arvis parses those tags and:
1. Creates the agent in the database
2. Creates the heartbeat schedule
3. Strips the tags from the response (you just see "Done! The BTC Price Monitor...")

**Important:** The conductor MUST use tags to create things. If it says "I'll create that agent" but doesn't include the tag, nothing happens. The tags are the actual commands.

---

## Agent Memory — How Agents Remember Things

Each agent can remember facts between conversations using **memory tags** in its responses:

```
[MEMORY:user_preference] User prefers concise bullet-point answers [/MEMORY]
[MEMORY:sticky] User's name is John, always greet by name [/MEMORY]
[STATE:last_project] arvis-v3 [/STATE]
```

**Types of memory:**
- `sticky` — Critical facts, always included in every prompt, never deleted
- `user_preference` — How the user likes things done
- `project_context` — Technical details, decisions
- `learned_pattern` — Things the agent has figured out

**Context compaction:** When a conversation gets very long (75% of model's context window), Arvis:
1. Extracts important facts to memory (so they survive)
2. Summarizes old messages
3. Deletes the old messages
4. The summary + extracted facts get injected in future contexts

This means agents can have infinitely long conversations without running out of context.

---

## The Dashboard — What Each Page Does

```
http://localhost:5100

├── Overview          — Metrics: messages today, active agents, queue status
├── Chat              — Talk directly to any agent (like a chat app)
├── Agents            — List all agents, create new ones
│   └── [Agent]       — Details, chat, memory, config for one agent
├── Sessions          — Browse all conversations
├── Logs              — Job queue history (every LLM call logged)
├── Usage             — Token usage and costs by agent/provider
├── Workflows         — Cron jobs and heartbeats management
├── Skills            — Browse/manage skills (agent capabilities)
├── Channels          — Connect Discord, Telegram, Slack, etc.
├── Queue             — Live monitor of pending/running/failed jobs
└── Settings          — Accounts, orchestrator config, import/export
```

---

## Built-In Tools Agents Can Use

Enable these per-agent in the Config tab:

| Tool | What It Does |
|------|-------------|
| `web_search` | Searches DuckDuckGo, gets instant answers |
| `http_fetch` | Fetches a URL, strips HTML, returns text (3000 chars max) |
| `calculate` | Safe math: `2^32`, `sqrt(144)`, `1234 * 5.67` |
| `get_time` | Returns current date and time |
| `get_variable` | Retrieve a stored variable/secret from the dashboard Variables settings |
| `write_plugin` | Write an ESM plugin to plugins/ and auto-load it |
| `list_plugins` | List all loaded plugin tools |
| `delete_plugin` | Delete a plugin file |
| `run_shell` | Run a shell command and capture output |
| `read_file` | Read any file on the filesystem |
| `write_file` | Write content to any file (creates dirs) |

Enable them for an agent → they appear as available tools in the LLM prompt. The agent decides when to use them.

---

## Skills — Adding Capabilities

Skills are `.md` files in the `skills/` folder. Each skill teaches an agent how to do something specific.

Example: `skills/sol-price.md`
```markdown
---
name: Solana Price Monitor
triggers: ["solana", "SOL", "price", "crypto"]
---

# How To Check SOL Price

Use the http_fetch tool to fetch:
https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd

Parse the JSON response and extract the USD price.
Format: "SOL is currently $XXX.XX"
```

When a user message mentions "solana" or "SOL", this skill gets injected into the agent's system prompt automatically. The agent then knows exactly how to handle it.

---

## Delegation — Agents Working Together

Any agent can delegate tasks to another:

```
User → Conductor: "Do market research on crypto and write a report"

Conductor (thinking): "I'll delegate research to the researcher agent
                       and writing to the writer agent"

Conductor outputs:
  [DELEGATE:researcher] Research top 5 crypto projects this week [/DELEGATE]
  [DELEGATE:writer] Write a professional 500-word market report [/DELEGATE]
  Working on your report, delegating to my team...

Result: researcher and writer agents both work in parallel
        Each posts their result independently to the same channel
```

This is **fire-and-forget** — the conductor doesn't wait for results. Each sub-agent picks up its job from the queue and posts when done.

---

## Security

### Dashboard Security
- Set `DASHBOARD_PASSWORD` in `.env` to enable login gate
- JWT token stored in httpOnly cookie (can't be read by JavaScript)
- All API routes verify JWT before doing anything
- Brute-force protection: 10 login attempts per 15 minutes

### Webhook Security
- HMAC-SHA256 signature verification on all incoming webhooks
- Each webhook has a unique secret generated when created
- Wrong/missing signature → 401 rejected

### Bot Security
- Discord: `DISCORD_OWNER_ID` — only this user can give commands to the conductor
- Permissions per channel: `full` or restricted
- Each agent can only access channels it's been explicitly bound to

### Tool Sandboxing
Agents have power tools (`read_file`, `write_file`, `run_shell`, `write_plugin`) but they're sandboxed:
- **Path validation**: `read_file` / `write_file` blocked outside the Arvis project directory. Blocks `.env`, `.sqlite`, `.ssh/`, `.pem`, `.key`, system dirs (`/etc/`, `C:\Windows\`)
- **Shell blocklist**: `run_shell` blocks destructive commands — `rm -rf /`, `curl | bash`, `chmod 777`, `mkfs`, `shutdown`, `passwd`, fork bombs, etc.
- **Plugin code validation**: `write_plugin` blocks `process.exit`, `child_process`, `eval()`, `new Function()` in plugin source
- **Rate limiting**: Power tools limited to 20 calls per minute per tool (prevents runaway loops)
- **Conductor self-protection**: Conductor cannot modify its own agent config via `[UPDATE_AGENT:conductor]`
- **Schedule validation**: Scheduled tasks must have ≥ 30-second intervals (prevents queue flooding)

### WebSocket / Web Connector Security
- CORS restricted to localhost origins by default (configurable via `allowedOrigins`)
- API key required for both REST and WebSocket auth when `config.apiKey` is set
- Timing-safe comparison on all API key checks (prevents timing attacks)
- File upload filenames sanitized via `path.basename()` + regex

### What Arvis Does NOT Have (compared to OpenClaw)
- **No Docker sandboxing** — agents run with your user's permissions (but tools are sandboxed, see above)
- **No cryptographic device identity** — simpler JWT cookie auth
- This is intentional: Arvis is a homeserver/personal platform. You trust your own agents.

---

## Comparison With OpenClaw

| Feature | OpenClaw | Arvis |
|---------|---------|-------|
| **Community & popularity** | 145,000+ GitHub stars, huge ecosystem | Private/personal use |
| **Skill marketplace** | 5,400+ skills on ClawHub (free) | Manual skill files |
| **Security** | Docker containers, cryptographic auth | JWT + HMAC (simpler) |
| **Memory search** | Vector/semantic (finds "similar" facts) | Keyword FTS5 (finds exact words) |
| **Agent runtime** | Embedded SDK in process | Claude CLI subprocess or direct API |
| **Multi-provider failover** | Basic fallback config | Auto-rotation across 50+ accounts |
| **Platforms** | Discord, Telegram, Slack, Signal, iMessage | + WhatsApp, SMS, Email, Matrix |
| **Billing system** | None | Built-in client/charge tracking |
| **Dashboard** | Simple web UI | Full Next.js admin panel |
| **Config format** | JSON file | Database (change without restart) |
| **Dynamic agent creation** | Config only | Conductor creates agents via chat |

### When OpenClaw Is Better
- You want a community — 145k users, shared skills, plugins
- You need Docker sandboxing for untrusted agent code
- Vector memory search (find facts by meaning, not exact words)
- You want to share your agent setup publicly

### When Arvis Is Better
- You want multiple accounts rotating automatically (no rate limits ever)
- You want to create agents by chatting (conductor pattern)
- You need WhatsApp, SMS, or Email connectors
- You want a full admin dashboard
- You need billing/client tracking
- You want everything in a database you can query

---

## Quick Start Checklist

```
□ Clone the repo and run npm install
□ Copy .env.example to .env
□ Add an LLM account:
    CLI subscription: npm run add-account
    OR API key: add ANTHROPIC_API_KEY to .env
□ Add a platform bot token (Discord or Telegram) to .env
□ Start Arvis Core:    npm start
□ Start Dashboard:     npm run dashboard
□ Open http://localhost:5100
□ Go to Chat → talk to the Conductor
□ Ask Conductor to create your first sub-agent
□ Go to Channels → assign the sub-agent to your Discord channel
```
