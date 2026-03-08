import { createLogger } from '../logger.js';

const log = createLogger('script-runner');

/**
 * Script heartbeat config stored in heartbeat_configs.run_condition as JSON.
 *
 * Example:
 * {
 *   "type": "script",
 *   "url": "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true",
 *   "template": "SOL: ${{solana.usd}} ({{solana.usd_24h_change}}% 24h)",
 *   "condition": {
 *     "path": "solana.usd_24h_change",
 *     "op": "<",
 *     "value": -5,
 *     "triggerPrompt": "SOL dropped {{solana.usd_24h_change}}% in 24h (now ${{solana.usd}}). Analyze the crash and advise."
 *   }
 * }
 */
export interface ScriptConfig {
  type: 'script';
  url: string;
  headers?: Record<string, string>;
  template: string;
  condition?: {
    path: string;
    op: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number | string;
    triggerPrompt: string;
  };
}

export interface ScriptResult {
  /** Formatted message to post to channel */
  message: string;
  /** If condition matched, the prompt to send to the agent */
  triggerPrompt?: string;
}

/**
 * Runs script heartbeats — fetch URL, format template, check conditions.
 * No LLM involved. Only triggers agent if condition matches.
 */
export async function executeScript(config: ScriptConfig): Promise<ScriptResult> {
  // 1. Fetch the URL
  const res = await fetch(config.url, {
    headers: { 'User-Agent': 'Arvis/3.0', ...(config.headers || {}) },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Script fetch failed: HTTP ${res.status} from ${config.url}`);
  }

  const data = await res.json();
  log.debug({ url: config.url, data }, 'Script fetched data');

  // 2. Apply template — replace {{path.to.value}} with actual values
  const message = applyTemplate(config.template, data);

  // 3. Check condition (if any)
  let triggerPrompt: string | undefined;
  if (config.condition) {
    const actual = resolvePath(data, config.condition.path);
    const matched = evaluateCondition(actual, config.condition.op, config.condition.value);
    if (matched) {
      triggerPrompt = applyTemplate(config.condition.triggerPrompt, data);
      log.info({ path: config.condition.path, actual, op: config.condition.op, threshold: config.condition.value }, 'Script condition matched — triggering agent');
    }
  }

  return { message, triggerPrompt };
}

/**
 * Check if a run_condition JSON is a script config.
 */
export function isScriptConfig(runCondition: string | null): ScriptConfig | null {
  if (!runCondition) return null;
  try {
    const parsed = JSON.parse(runCondition);
    if (parsed && parsed.type === 'script' && parsed.url && parsed.template) {
      return parsed as ScriptConfig;
    }
  } catch {
    // Not valid JSON or not a script config
  }
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve a dot-path like "solana.usd" from a nested object */
function resolvePath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** Replace {{path.to.value}} in a template string with values from data */
function applyTemplate(template: string, data: unknown): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path: string) => {
    const value = resolvePath(data, path.trim());
    if (value == null) return '??';
    if (typeof value === 'number') {
      // Format numbers nicely
      if (Math.abs(value) >= 1) return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
      return value.toFixed(4);
    }
    return String(value);
  });
}

/** Evaluate a comparison condition */
function evaluateCondition(actual: unknown, op: string, expected: number | string): boolean {
  if (actual == null) return false;
  const a = typeof expected === 'number' ? Number(actual) : String(actual);
  const b = expected;

  switch (op) {
    case '>':  return a > b;
    case '<':  return a < b;
    case '>=': return a >= b;
    case '<=': return a <= b;
    case '==': return a == b;
    case '!=': return a != b;
    default:   return false;
  }
}
