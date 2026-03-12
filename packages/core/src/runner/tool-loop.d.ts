export interface ParsedToolCall {
    id: string;
    name: string;
    input: Record<string, unknown>;
}
export interface ParsedResponse {
    text: string;
    toolCalls: ParsedToolCall[];
    usage: {
        inputTokens: number;
        outputTokens: number;
    };
    model: string;
    /** Raw assistant turn (opaque — passed back to appendTurns) */
    raw: unknown;
}
/**
 * Provider adapter interface.
 * Each provider implements this to plug into the shared tool loop.
 * The adapter owns its mutable message state internally (closure).
 */
export interface ProviderAdapter {
    /** Make one API call and return the raw response */
    callApi(): Promise<unknown>;
    /** Extract text, tool calls, usage from the raw response */
    parseResponse(resp: unknown): ParsedResponse;
    /** Append assistant turn + tool results to the message history */
    appendTurns(rawAssistant: unknown, toolResults: {
        id: string;
        name: string;
        result: string;
    }[]): void;
}
export interface ToolLoopResult {
    content: string;
    totalInputTokens: number;
    totalOutputTokens: number;
    finalModel: string;
}
/**
 * Drives the multi-turn tool-calling loop for any provider.
 * The adapter supplies provider-specific API calls and message formatting.
 * Zero duplication — adding a new provider = one new adapter file.
 */
export declare function executeToolLoop(adapter: ProviderAdapter, initialModel: string, maxTurns: number): Promise<ToolLoopResult>;
//# sourceMappingURL=tool-loop.d.ts.map