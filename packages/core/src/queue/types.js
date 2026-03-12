/** Type guard to safely assert a value is a JobPayload */
export function assertJobPayload(val) {
    if (!val || typeof val !== 'object') {
        throw new TypeError('Job payload is not an object');
    }
    const obj = val;
    if (typeof obj.prompt !== 'string') {
        throw new TypeError('Job payload missing required string field: prompt');
    }
}
//# sourceMappingURL=types.js.map