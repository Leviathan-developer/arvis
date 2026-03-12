/** Simple token estimator: ~3.5 chars per token for English text */
export function estimateTokens(text) {
    return Math.ceil(text.length / 3.5);
}
//# sourceMappingURL=token-utils.js.map