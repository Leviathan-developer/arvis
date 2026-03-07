# 04 — LLM Providers & Account Management

> Connect your AI accounts, set up failover, never hit rate limits.

---

## Quick Start — Which provider should I use?

| If you want... | Use this | Cost |
|----------------|----------|------|
| Cheapest possible | **Claude CLI** (Max subscription) | $20/month flat, unlimited |
| Best quality + speed | **Anthropic API** | ~$3-15/MTok |
| Access to everything | **OpenRouter** | Varies by model |
| Free + private | **Ollama** (local) | $0 (runs on your hardware) |
| Mix of all | **All of the above** | Arvis auto-rotates between them |

**The recommended setup:** Claude CLI as primary (cheap, unlimited) + one API key as backup.

---

## Provider Setup Guides

### 1. Claude CLI (Max Subscription — $20/month, unlimited)

Use your Claude Max subscription with Arvis. No per-token cost — just your monthly subscription. This is the cheapest way to run Arvis.

#### Windows

**Step 1: Install Claude Code**
```
npm install -g @anthropic-ai/claude-code
```

**Step 2: Log in**
```
claude login
```
Your browser opens — sign in with your Anthropic account. Session saves to `C:\Users\YourName\.claude\`

**Step 3: Copy session to a permanent folder**
```
xcopy %USERPROFILE%\.claude C:\Users\YourName\.claude-account1 /E /I
```

**Step 4: Add more accounts (optional — for zero rate limits)**
```
rd /s /q %USERPROFILE%\.claude
claude login
xcopy %USERPROFILE%\.claude C:\Users\YourName\.claude-account2 /E /I
```
Sign in with a different Anthropic account each time. Repeat as many times as you want.

**Step 5: Add to `.env`**
```env
CLAUDE_CLI_HOME=C:\Users\YourName\.claude-account1
CLAUDE_CLI_HOME_1=C:\Users\YourName\.claude-account2
CLAUDE_CLI_HOME_2=C:\Users\YourName\.claude-account3
```

#### macOS

**Step 1: Install Claude Code**
```bash
npm install -g @anthropic-ai/claude-code
```

**Step 2: Log in**
```bash
claude login
```
Browser opens — sign in. Session saves to `~/.claude/`

**Step 3: Copy session**
```bash
cp -r ~/.claude ~/claude-account1
```

**Step 4: Add more accounts (optional)**
```bash
rm -rf ~/.claude
claude login
cp -r ~/.claude ~/claude-account2
```

**Step 5: Add to `.env`**
```env
CLAUDE_CLI_HOME=/Users/yourname/claude-account1
CLAUDE_CLI_HOME_1=/Users/yourname/claude-account2
CLAUDE_CLI_HOME_2=/Users/yourname/claude-account3
```

#### Linux / VPS

**Step 1: Install Claude Code**
```bash
npm install -g @anthropic-ai/claude-code
```

**Step 2: Log in**
```bash
claude login
```
On a headless server (no browser), this prints a URL — open it on your phone or laptop to complete login.

**Step 3: Copy session**
```bash
cp -r ~/.claude /home/you/claude-account1
```

**Step 4: Add more accounts (optional)**
```bash
rm -rf ~/.claude
claude login
cp -r ~/.claude /home/you/claude-account2
```

**Step 5: Add to `.env`**
```env
CLAUDE_CLI_HOME=/home/you/claude-account1
CLAUDE_CLI_HOME_1=/home/you/claude-account2
CLAUDE_CLI_HOME_2=/home/you/claude-account3
```

#### Session expired? Re-login a specific account:
```bash
# Linux/Mac
HOME=/home/you/claude-account1 claude login

# Windows
set HOME=C:\Users\YourName\.claude-account1 && claude login
```

#### Good to know
- Each account = one Claude Max subscription ($20/month each)
- Numbering must be sequential: `_1`, `_2`, `_3` — skip a number and Arvis stops scanning
- 3 accounts = practically unlimited messages
- Session folders contain auth tokens — don't share them or commit them to git

---

### 2. Anthropic API (pay-per-token)

Best for: fast responses, full tool support, precise cost control.

**Get your key:** [console.anthropic.com](https://console.anthropic.com/) → API Keys → Create Key

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

**Multiple keys** (for higher rate limits):
```env
ANTHROPIC_API_KEY=sk-ant-main-key
ANTHROPIC_API_KEY_1=sk-ant-backup-key
ANTHROPIC_API_KEY_2=sk-ant-team-key
```

**Available models:**

| Model | Speed | Quality | Cost (input/output per MTok) |
|-------|-------|---------|------------------------------|
| `claude-opus-4-6` | Slow | Best | $15 / $75 |
| `claude-sonnet-4-6` | Fast | Great | $3 / $15 |
| `claude-haiku-4-5-20251001` | Fastest | Good | $0.80 / $4 |

Agent model spec: `claude-sonnet-4-6` or `anthropic/claude-sonnet-4-6`

---

### 3. OpenAI (pay-per-token)

**Get your key:** [platform.openai.com](https://platform.openai.com/api-keys) → Create new secret key

```env
OPENAI_API_KEY=sk-xxxxx
```

**Multiple keys:**
```env
OPENAI_API_KEY=sk-main
OPENAI_API_KEY_1=sk-backup
```

**Available models:**

| Model | Speed | Quality | Cost (input/output per MTok) |
|-------|-------|---------|------------------------------|
| `gpt-4.1` | Fast | Great | $2 / $8 |
| `gpt-4.1-mini` | Fastest | Good | $0.40 / $1.60 |
| `gpt-4.1-nano` | Instant | Basic | $0.10 / $0.40 |
| `o4-mini` | Slow | Reasoning | $1.10 / $4.40 |

Agent model spec: `openai/gpt-4.1-mini`

---

### 4. OpenRouter (one key, all models)

Best for: trying different models without managing multiple API keys.

**Get your key:** [openrouter.ai](https://openrouter.ai/keys) → Create Key

```env
OPENROUTER_API_KEY=sk-or-xxxxx
```

Access to 200+ models: Claude, GPT-4, Gemini, Llama, DeepSeek, Qwen, Mistral, and more. Pricing varies per model.

Agent model spec: `openrouter/claude-sonnet-4-6` or `openrouter/meta-llama/llama-4-maverick`

---

### 5. Google Gemini (pay-per-token)

**Get your key:** [aistudio.google.com](https://aistudio.google.com/apikey) → Create API Key

```env
GOOGLE_API_KEY=AIzaSyxxxxx
```

**Available models:**

| Model | Speed | Quality | Cost (input/output per MTok) |
|-------|-------|---------|------------------------------|
| `gemini-2.5-pro` | Medium | Great | $1.25 / $10 |
| `gemini-2.5-flash` | Fast | Good | $0.30 / $2.50 |
| `gemini-2.0-flash-lite` | Fastest | Basic | Free tier available |

Agent model spec: `google/gemini-2.5-flash`

---

### 6. Ollama (free, runs locally)

Best for: privacy, offline use, zero cost. Requires a decent GPU.

**Install:** [ollama.com/download](https://ollama.com/download)

```bash
# Pull a model
ollama pull llama3
# or
ollama pull qwen2.5-coder:7b
```

```env
OLLAMA_BASE_URL=http://localhost:11434
```

Agent model spec: `ollama/llama3`

---

### 7. Custom OpenAI-Compatible Provider

Any service with an OpenAI-compatible API (Together AI, Groq, Fireworks, etc.):

```env
CUSTOM_BASE_URL=https://api.together.xyz/v1
CUSTOM_API_KEY=your-key
```

---

## How Arvis Picks Which Account to Use

You don't have to think about this — it's automatic. But here's what happens:

### Priority order (tries top to bottom)

| Priority | Provider | Why |
|----------|----------|-----|
| 10 | Claude CLI | Free with subscription |
| 20 | Anthropic API | Fast + best Claude models |
| 50 | OpenAI | Good alternative |
| 60 | OpenRouter | Access to everything |
| 70 | Google Gemini | Solid backup |
| 200 | Ollama | Free, local, last resort |

Within the same provider, the account with the fewest messages used is picked (load balancing).

### When one gets rate limited

Arvis automatically switches to the next available account. You don't see anything — maybe a slightly delayed response.

| Retry | Cooldown before retrying that account |
|-------|---------------------------------------|
| 1st | 1 minute |
| 2nd | 5 minutes |
| 3rd | 25 minutes |
| 4th+ | 60 minutes (cap) |

If ALL accounts are exhausted, you'll see: *"All AI accounts are rate-limited. Retrying automatically in ~X minutes."*

### Smart model selection

When Arvis has to use a backup provider, it picks the right size model:
- Short/simple messages ("hi", "what time is it") → cheap model (haiku/mini/flash)
- Long/complex messages ("analyze this code", "design a system") → powerful model (sonnet/opus/pro)

---

## Recommended Setups

### Budget setup (free or almost free)
```env
# Just Claude CLI — $20/month, covers most usage
CLAUDE_CLI_HOME=/path/to/claude-account1

# Optional: free local backup
OLLAMA_BASE_URL=http://localhost:11434
```

### Standard setup (reliable, low cost)
```env
# Primary: Claude CLI (free with subscription)
CLAUDE_CLI_HOME=/path/to/claude-account1
CLAUDE_CLI_HOME_1=/path/to/claude-account2

# Backup: Anthropic API with cheap model
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Power setup (never rate limited, best quality)
```env
# 3 Claude CLI accounts
CLAUDE_CLI_HOME=/path/to/claude-account1
CLAUDE_CLI_HOME_1=/path/to/claude-account2
CLAUDE_CLI_HOME_2=/path/to/claude-account3

# API backup
ANTHROPIC_API_KEY=sk-ant-main
ANTHROPIC_API_KEY_1=sk-ant-backup

# Fallback
OPENAI_API_KEY=sk-xxxxx

# Last resort
OLLAMA_BASE_URL=http://localhost:11434
```

---

## Setting Models Per Agent

In Dashboard → Agents → click your agent → Config tab:

- **Primary model:** `anthropic/claude-sonnet-4-6`
- **Fallbacks:** `openrouter/claude-sonnet-4-6, openai/gpt-4.1-mini`

Or tell the Conductor: *"Set dev-agent's model to claude-sonnet-4-6 with openai fallback"*

---

## Cost Tracking

Every API call is logged automatically. View in Dashboard → Usage page.

CLI accounts always show $0 cost (subscription model). API accounts show exact per-token costs.

You can disable expensive accounts in Dashboard → Settings → Accounts without removing them from `.env`.

---

## Advanced: How Failover Works Internally

```
Request comes in for agent with model="claude-sonnet-4-6"
│
├─ STAGE 1: Try preferred provider (anthropic)
│   → Pick account with lowest usage that isn't rate-limited
│   → If found: use it. Done.
│
├─ STAGE 2: Try fallback chain from agent config
│   → agent.modelFallbacks = ["openrouter/claude-sonnet-4-6", "openai/gpt-4.1"]
│   → Try each in order until one works
│
└─ STAGE 3: Any account at all
    → classifyComplexity(prompt) → pick appropriate model size
    → If nothing available: queue for retry with backoff
```

## Advanced: Per-Provider API Details

| Provider | Endpoint | Auth | Tool format |
|----------|----------|------|-------------|
| Anthropic | `api.anthropic.com/v1/messages` | `x-api-key` header | `tool_use` content blocks |
| OpenAI / OpenRouter / Ollama | `/v1/chat/completions` | `Bearer` token | `function_call` messages |
| Google Gemini | `generativelanguage.googleapis.com` | `key=` query param | `functionCall` / `functionResponse` |

## Advanced: Tool Call Loop

When the LLM wants to use a tool (web_search, http_fetch, etc.), the Provider Runner automatically handles multi-turn tool calls — up to 5 rounds per request. The CLI runner delegates tool use to Claude Code's built-in tools (bash, file access, etc.).
