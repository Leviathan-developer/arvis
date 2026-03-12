import type { RunRequest, RunResult } from './types.js';
/**
 * Executes LLM requests across multiple providers.
 * Each provider is a separate adapter in ./providers/ — adding a new provider
 * means adding one new file, not touching this class.
 */
export declare class ProviderRunner {
    execute(request: RunRequest): Promise<RunResult>;
    private createAdapter;
    /** Calculate cost for a request */
    static calculateCost(provider: string, model: string, inputTokens: number, outputTokens: number): number;
}
//# sourceMappingURL=provider-runner.d.ts.map