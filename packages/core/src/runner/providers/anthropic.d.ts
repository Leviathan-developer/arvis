import type { RunRequest } from '../types.js';
import type { ProviderAdapter } from '../tool-loop.js';
/**
 * Creates a ProviderAdapter for the Anthropic Messages API.
 * The adapter holds mutable message state (conversation history) in a closure.
 */
export declare function createAnthropicAdapter(request: RunRequest): {
    adapter: ProviderAdapter;
    model: string;
};
//# sourceMappingURL=anthropic.d.ts.map