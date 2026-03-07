/** Typed payload shape for message/heartbeat/cron queue jobs */
export interface JobPayload {
    conversationId?: number;
    systemPrompt?: string;
    prompt: string;
    channelId?: string;
    channel?: string;
    platform?: string;
    messageId?: string;
    configId?: number;
    cronId?: number;
    images?: {
        base64: string;
        mimeType: string;
    }[];
}
export interface QueueJob {
    id: number;
    agentId: number;
    priority: number;
    type: 'message' | 'heartbeat' | 'cron' | 'webhook';
    payload: Record<string, unknown>;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    accountId: number | null;
    result: string | null;
    error: string | null;
    attempts: number;
    maxAttempts: number;
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
}
export interface QueueStatus {
    pending: number;
    running: number;
    completed: number;
    failed: number;
}
export interface ProcessResult {
    jobId: number;
    success: boolean;
    result?: string;
    error?: string;
}
/** Type guard to safely assert a value is a JobPayload */
export declare function assertJobPayload(val: unknown): asserts val is JobPayload;
//# sourceMappingURL=types.d.ts.map