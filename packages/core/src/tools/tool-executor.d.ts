export interface ToolParam {
    type: string;
    description: string;
    enum?: string[];
}
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, ToolParam>;
        required?: string[];
    };
}
export declare const BUILT_IN_TOOLS: ToolDefinition[];
/** Names of all built-in tools */
export declare const BUILT_IN_TOOL_NAMES: string[];
type ToolHandler = (input: Record<string, unknown>) => Promise<string> | string;
/**
 * Register a custom tool that agents can use.
 * Call this in your plugins/ files before starting Arvis.
 *
 * Example:
 *   registerTool(
 *     { name: 'get_weather', description: '...', parameters: { ... } },
 *     async (input) => {
 *       const res = await fetch(`https://wttr.in/${input.city}?format=3`);
 *       return await res.text();
 *     }
 *   );
 */
export declare function registerTool(definition: ToolDefinition, handler: ToolHandler): void;
/** Unregister a plugin tool by name */
export declare function unregisterTool(name: string): void;
/** All tool names: built-in + registered plugins */
export declare function getAllToolNames(): string[];
/** Get tool definitions filtered to the allowed set (built-in + plugins) */
export declare function getEnabledTools(allowedNames: string[]): ToolDefinition[];
export declare class ToolExecutor {
    /** Execute a tool by name with given arguments. Returns a string result. */
    execute(name: string, input: Record<string, unknown>): Promise<string>;
    private webSearch;
    private calculate;
    private httpFetch;
    private writePlugin;
    private listPlugins;
    private deletePlugin;
    private runShell;
    private readFileContents;
    private writeFileContents;
}
export {};
//# sourceMappingURL=tool-executor.d.ts.map