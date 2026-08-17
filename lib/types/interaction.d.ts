/**
 * Map Cursor interactionUpdate frames onto DSH StreamChunks.
 * args_text_delta is a cumulative snapshot; only the unmatched suffix is emitted.
 */
import type { StreamChunk } from '@deepseek-ai/dsh-llm';
import type { InteractionUpdate, ToolCall } from './wire/vendor/agent_pb.ts';
export declare function isMcpToolCall(toolCall: ToolCall | undefined): boolean;
export declare function isIgnoredToolCall(toolCall: ToolCall | undefined): boolean;
export declare function mcpToolName(toolCall: ToolCall | undefined): string | undefined;
export declare function snapshotDelta(previous: string, snapshot: string): string;
export interface OpenMcpBlock {
    envelopeCallId: string;
    index: number;
    name: string;
    arguments: string;
    completed: boolean;
}
export declare class InteractionMapper {
    private nextIndex;
    private textIndex;
    private text;
    private reasoningIndex;
    private reasoning;
    private readonly mcp;
    outputTokens: number;
    inputTokens: number;
    sawTokenDelta: boolean;
    turnEnded: boolean;
    chunks: StreamChunk[];
    take(): StreamChunk[];
    openMcpBlocks(): OpenMcpBlock[];
    completedMcpBlocks(): OpenMcpBlock[];
    hasIncompleteMcp(): boolean;
    applyCheckpointUsedTokens(used: number): void;
    handle(update: InteractionUpdate): void;
    flushOpenText(): void;
    private ensureText;
    private closeText;
    private ensureReasoning;
    private closeReasoning;
    private openMcp;
    private applyArgsSnapshot;
    private completeMcp;
}
//# sourceMappingURL=interaction.d.ts.map