import type { RunRequest } from '../types.js';
import type { ProviderAdapter } from '../tool-loop.js';
/**
 * Creates a ProviderAdapter for the Google Gemini API.
 */
export declare function createGoogleAdapter(request: RunRequest): {
    adapter: ProviderAdapter;
    model: string;
};
//# sourceMappingURL=google.d.ts.map