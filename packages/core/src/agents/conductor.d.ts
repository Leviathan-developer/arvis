import type { AgentRegistry } from './agent-registry.js';
import type { AgentRole } from './agent.js';
interface CreateAgentData {
    slug: string;
    name?: string;
    role?: AgentRole;
    model?: string;
    description?: string;
    project_path?: string;
    projectPath?: string;
    allowed_tools?: string | string[];
    personality?: Record<string, unknown> | string;
    channels?: Record<string, unknown>[] | string;
}
interface UpdateAgentData {
    slug: string;
    name?: string;
    role?: AgentRole;
    model?: string;
    description?: string;
    project_path?: string;
    projectPath?: string;
    allowed_tools?: string | string[];
    personality?: Record<string, unknown> | string;
    channels?: Record<string, unknown>[] | string;
}
interface CreateClientData {
    name: string;
    platform: string;
    token?: string;
    account_id?: string;
    accountId?: string;
    [key: string]: unknown;
}
interface CreateCronData {
    agent: string;
    schedule: string;
    prompt: string;
    enabled?: boolean;
    [key: string]: unknown;
}
interface CreateHeartbeatData {
    agent: string;
    interval_seconds?: number;
    intervalSeconds?: number;
    prompt: string;
    enabled?: boolean;
    [key: string]: unknown;
}
export type ConductorAction = {
    type: 'create_agent';
    data: CreateAgentData;
} | {
    type: 'update_agent';
    data: UpdateAgentData;
} | {
    type: 'create_client';
    data: CreateClientData;
} | {
    type: 'create_cron';
    data: CreateCronData;
} | {
    type: 'create_heartbeat';
    data: CreateHeartbeatData;
};
export type ConductorActionType = ConductorAction['type'];
export interface ExecutionResult {
    action: ConductorAction;
    success: boolean;
    error?: string;
    result?: unknown;
}
/**
 * Parses Conductor output for structured action tags and executes them.
 */
export declare class ConductorParser {
    /** Parse all action tags from Conductor output */
    parse(output: string): ConductorAction[];
    /** Execute parsed actions against the registry and other managers */
    execute(actions: ConductorAction[], registry: AgentRegistry, deps?: {
        createClient?: (data: Record<string, unknown>) => void;
        createCron?: (data: Record<string, unknown>) => void;
        createHeartbeat?: (data: Record<string, unknown>) => void;
    }): Promise<ExecutionResult[]>;
    /** Strip all action blocks from output before showing to user */
    stripActions(output: string): string;
    private buildAgentConfig;
}
/** The Conductor's system prompt */
export declare const CONDUCTOR_SYSTEM_PROMPT: string;
export {};
//# sourceMappingURL=conductor.d.ts.map