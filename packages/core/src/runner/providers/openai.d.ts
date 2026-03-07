import type { RunRequest, Provider } from '../types.js';
import type { ProviderAdapter } from '../tool-loop.js';
/**
 * Creates a ProviderAdapter for OpenAI-compatible APIs.
 * Covers: OpenAI, OpenRouter, Ollama, and any custom OpenAI-compat endpoint.
 */
export declare function createOpenAIAdapter(request: RunRequest, provider: Provider): {
    adapter: ProviderAdapter;
    model: string;
};
//# sourceMappingURL=openai.d.ts.map