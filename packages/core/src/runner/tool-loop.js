import { ToolExecutor } from '../tools/tool-executor.js';
import { createLogger } from '../logger.js';
const log = createLogger('tool-loop');
const toolExecutor = new ToolExecutor();
// ─── Shared tool-calling loop ─────────────────────────────────────────────────
/**
 * Drives the multi-turn tool-calling loop for any provider.
 * The adapter supplies provider-specific API calls and message formatting.
 * Zero duplication — adding a new provider = one new adapter file.
 */
export async function executeToolLoop(adapter, initialModel, maxTurns) {
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let finalContent = '';
    let finalModel = initialModel;
    for (let turn = 0; turn <= maxTurns; turn++) {
        const resp = await adapter.callApi();
        const parsed = adapter.parseResponse(resp);
        totalInputTokens += parsed.usage.inputTokens;
        totalOutputTokens += parsed.usage.outputTokens;
        if (parsed.model)
            finalModel = parsed.model;
        // No tool calls (or turn limit reached) — we're done
        if (!parsed.toolCalls.length || turn >= maxTurns) {
            finalContent = parsed.text;
            break;
        }
        // Execute all tool calls in parallel
        const toolResults = await Promise.all(parsed.toolCalls.map(async (tc) => {
            const result = await toolExecutor.execute(tc.name, tc.input);
            log.debug({ tool: tc.name, resultLength: result.length }, 'Tool executed');
            return { id: tc.id, name: tc.name, result };
        }));
        // Append assistant turn + results to message history
        adapter.appendTurns(parsed.raw, toolResults);
    }
    return { content: finalContent, totalInputTokens, totalOutputTokens, finalModel };
}
//# sourceMappingURL=tool-loop.js.map