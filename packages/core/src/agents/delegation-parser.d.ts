/**
 * Multi-agent delegation parser.
 *
 * Agents can delegate subtasks by including markers in their response:
 *
 *   [DELEGATE:agent-slug] task description here [/DELEGATE]
 *
 * Delegation is fire-and-forget: the main agent's response is sent
 * immediately; the sub-agent's result arrives later in the same channel.
 *
 * Example:
 *   Let me research that for you.
 *   [DELEGATE:researcher] What is the current USD/EUR exchange rate? [/DELEGATE]
 *   I'll share the findings once the researcher gets back to us.
 */
export interface DelegationRequest {
    agentSlug: string;
    task: string;
}
/** Extract all delegation requests from a response string */
export declare function parseDelegations(text: string): DelegationRequest[];
/** Remove all delegation markers from a response string */
export declare function stripDelegations(text: string): string;
//# sourceMappingURL=delegation-parser.d.ts.map