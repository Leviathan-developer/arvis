# 13 — Build Your First Agent: Step-by-Step Tutorial
> From zero to a working agent in 15 minutes. Concrete example: a Bitcoin price monitor.

---

## What You'll Build

A Bitcoin price monitoring agent that:
1. Checks BTC/USD price on demand
2. Runs every 5 minutes on a schedule (heartbeat)
3. Posts updates to your Discord channel
4. Remembers historical prices it's seen

---

## Step 1: Start Arvis

```bash
# Make sure you have at least one LLM account configured in .env
# Either a Claude subscription:
CLAUDE_CLI_HOME=/home/you/.claude

# Or an API key:
ANTHROPIC_API_KEY=sk-ant-...

# Start the core
npm start

# In another terminal, start the dashboard
npm run dashboard
```

Open `http://localhost:5100` in your browser.

---

## Step 2: Talk to the Conductor

Go to **Chat** in the dashboard. You'll see the Conductor agent — it's created automatically.

Type:

```
Create an agent called "BTC Price Monitor" that checks Bitcoin price using the CoinGecko API.
It should use the http_fetch and calculate tools. Make it a specialist agent using haiku.
```

The Conductor will output `[CREATE_AGENT]` tags and create the agent for you. You'll see it appear in the **Agents** page.

---

## Step 3: Test Your Agent

1. Go to **Agents** → click on "BTC Price Monitor"
2. Click the **Chat** tab
3. Type: `What's the current Bitcoin price?`

The agent will use `http_fetch` to call the CoinGecko API and return the current price.

---

## Step 4: Add a Skill

Create a file `skills/community/btc-price.md`:

```markdown
---
slug: btc-price
name: Bitcoin Price
description: How to fetch and format BTC price
category: crypto
author: you
triggers:
  keywords: [bitcoin, btc, price, crypto]
  patterns: [".*btc.*price.*"]
---

# Bitcoin Price Monitoring

## Fetching Price
Use the http_fetch tool to get real-time BTC price:
URL: https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true

## Response Format
The API returns: `{"bitcoin":{"usd":65000.00,"usd_24h_change":2.5}}`

## How to Format
- Always show: `BTC: $XX,XXX.XX (▲/▼ X.XX% 24h)`
- Use ▲ for positive change, ▼ for negative
- Round to 2 decimal places
```

Restart Arvis or go to **Skills** → click "Reload" to pick up the new skill.

---

## Step 5: Connect to Discord

1. Create a Discord bot at [discord.com/developers](https://discord.com/developers/applications)
2. Copy the bot token
3. Go to **Settings** → **Bot Instances** → click "Add Bot"
4. Select platform: Discord, paste token, assign to "BTC Price Monitor"
5. Click Create — the bot comes online

Now messages in Discord channels go to your BTC agent.

---

## Step 6: Add a Scheduled Heartbeat

Ask the Conductor:

```
Create a heartbeat for the BTC Price Monitor agent that runs every 5 minutes.
The prompt should be: "Fetch the current BTC price and post a brief update."
Post to channel 1234567890 on Discord.
```

(Replace `1234567890` with your actual Discord channel ID)

Or do it manually:
1. Go to **Workflows** → click "Heartbeat"
2. Select "BTC Price Monitor" as the agent
3. Schedule: `*/5 * * * *`
4. Prompt: "Fetch the current BTC price and post a brief update with price and 24h change."
5. Click Create

---

## Step 7: Store an API Key (Optional)

If you need a premium CoinGecko API key:

1. Go to **Settings** → **Variables & Secrets**
2. Click "Add Variable"
3. Key: `COINGECKO_API_KEY`
4. Value: your API key
5. Check "Secret"
6. Click Create

Now update your skill to tell the agent:
```
If you need an API key, use the get_variable tool with key "COINGECKO_API_KEY"
and pass it as the x-cg-pro-api-key header.
```

---

## Step 8: Add Memory

The agent automatically remembers things using memory tags. Try chatting:

```
You: Remember that I want alerts only when BTC moves more than 2% in a day
Agent: [MEMORY:user_preference] Only alert when BTC 24h change exceeds 2% [/MEMORY]
       Got it! I'll only send alerts for moves larger than 2%.
```

This fact persists across conversations and restarts.

---

## What You've Built

```
┌──────────────────────────────────────────────────────┐
│  BTC Price Monitor                                    │
│                                                       │
│  Tools:     http_fetch, calculate, get_variable       │
│  Skill:     btc-price (auto-injected on keywords)     │
│  Schedule:  Every 5 minutes (heartbeat)               │
│  Channel:   #crypto-prices on Discord                 │
│  Memory:    Remembers user preferences                │
│  Secrets:   API key stored in Variables (not in env)  │
└──────────────────────────────────────────────────────┘
```

---

## Next Steps

- **Add more agents** — research, support, creative writer
- **Connect more platforms** — Telegram, Slack, WhatsApp
- **Write plugins** — extend with custom tools (see [08-extensibility](08-extensibility))
- **Set up delegation** — agents working together on complex tasks
- **Deploy to VPS** — see [11-deployment](11-deployment)
