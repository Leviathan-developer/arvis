import { RateLimitError } from '../types.js';
import { getEnabledTools } from '../../tools/tool-executor.js';
import { createLogger } from '../../logger.js';
const log = createLogger('google');
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
/**
 * Creates a ProviderAdapter for the Google Gemini API.
 */
export function createGoogleAdapter(request) {
    if (!request.account?.apiKey)
        throw new Error('Google provider requires an API key');
    const model = request.model || 'gemini-2.5-flash';
    const baseUrl = request.account.baseUrl || BASE_URL;
    const enabledTools = getEnabledTools(request.tools ?? []);
    // Build initial user parts (multi-modal if images present)
    const initialUserParts = request.images?.length
        ? [
            ...request.images.map(img => ({
                inlineData: { mimeType: img.mimeType, data: img.base64 },
            })),
            { text: request.prompt },
        ]
        : [{ text: request.prompt }];
    // Mutable contents array (Gemini uses "contents" not "messages")
    const contents = [{ role: 'user', parts: initialUserParts }];
    const adapter = {
        async callApi() {
            const body = {
                contents,
                generationConfig: { maxOutputTokens: 4096 },
                ...(request.systemPrompt
                    ? { systemInstruction: { parts: [{ text: request.systemPrompt }] } }
                    : {}),
                ...(enabledTools.length > 0
                    ? {
                        tools: [{
                                functionDeclarations: enabledTools.map(t => ({
                                    name: t.name,
                                    description: t.description,
                                    parameters: t.parameters,
                                })),
                            }],
                    }
                    : {}),
            };
            log.debug({ model, provider: 'google', promptLength: request.prompt.length }, 'API request');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120_000);
            let response;
            try {
                response = await fetch(`${baseUrl}/models/${model}:generateContent?key=${request.account.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                    signal: controller.signal,
                });
            }
            finally {
                clearTimeout(timeoutId);
            }
            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 429) {
                    throw new RateLimitError(`Google rate limited: ${errorText}`, new Date(Date.now() + 60_000));
                }
                throw new Error(`Google API error (${response.status}): ${errorText}`);
            }
            return response.json();
        },
        parseResponse(resp) {
            const data = resp;
            const candidate = data.candidates?.[0];
            const parts = candidate?.content?.parts || [];
            // Gemini doesn't provide stable IDs for function calls — generate them
            const toolCalls = parts
                .filter(p => p.functionCall)
                .map((p, i) => ({
                id: `fc_${i}`,
                name: p.functionCall.name,
                input: p.functionCall.args ?? {},
            }));
            const text = parts.filter(p => p.text).map(p => p.text).join('');
            return {
                text,
                toolCalls,
                usage: {
                    inputTokens: data.usageMetadata?.promptTokenCount || 0,
                    outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
                },
                model,
                raw: parts, // full parts array for appendTurns
            };
        },
        appendTurns(rawParts, toolResults) {
            contents.push({ role: 'model', parts: rawParts });
            contents.push({
                role: 'user',
                parts: toolResults.map(tr => ({
                    functionResponse: {
                        name: tr.name,
                        response: { result: tr.result },
                    },
                })),
            });
        },
    };
    return { adapter, model };
}
//# sourceMappingURL=google.js.map