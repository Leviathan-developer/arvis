/**
 * Auto-loads plugin files from the plugins/ directory.
 * Each plugin file can call registerTool() to add custom tools,
 * or import connectors/hooks to extend Arvis functionality.
 *
 * Files are loaded in alphabetical order.
 * Errors in individual plugins are caught and logged — one bad plugin
 * won't crash the whole system.
 */
export declare function loadPlugins(pluginsDir: string): Promise<void>;
//# sourceMappingURL=plugin-loader.d.ts.map