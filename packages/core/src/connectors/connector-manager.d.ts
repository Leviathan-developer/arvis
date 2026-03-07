import type { ArvisDatabase } from '../db/database.js';
import type { MessageBus } from '../bus/message-bus.js';
export declare class ConnectorManager {
    private db;
    private bus;
    private running;
    private runningConfig;
    private pollTimer;
    constructor(db: ArvisDatabase, bus: MessageBus);
    /**
     * Seed env-var-configured bots into the DB if not already present.
     * This ensures existing deployments see their bots in the dashboard immediately.
     */
    seedFromEnv(env?: NodeJS.ProcessEnv): void;
    /** Start all enabled bots and begin polling for changes */
    startAll(): Promise<void>;
    /** Stop all running bots and cancel polling */
    stopAll(): Promise<void>;
    /** Sync running connectors with DB state */
    private sync;
    private startOne;
    private stopOne;
    /** Immediately start a bot by ID (used after dashboard creates one) */
    startById(id: number): Promise<void>;
    /** Immediately stop a bot by ID (used before dashboard deletes one) */
    stopById(id: number): Promise<void>;
    isRunning(id: number): boolean;
}
//# sourceMappingURL=connector-manager.d.ts.map