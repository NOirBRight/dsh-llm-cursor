/**
 * Cursor exec / KV handshake. DSH never executes native tools.
 */
import type { ToolSchema } from '@deepseek-ai/dsh-llm';
import type { BlobStore } from './history.ts';
import type { ClientHttp2Stream } from 'node:http2';
import { type AgentServerMessage, type ExecServerMessage, type KvServerMessage } from './wire/vendor/agent_pb.ts';
export interface PendingMcpInvocation {
    execId: string;
    execMessageId: number;
    toolCallId: string;
    name: string;
}
export declare function buildMcpToolDefinitions(tools: readonly ToolSchema[] | undefined): import("./wire/vendor/agent_pb.ts").McpToolDefinition[];
export declare function handleKvServerMessage(kvMsg: KvServerMessage, blobStore: BlobStore, stream: ClientHttp2Stream): void;
export declare function handleExecServerMessage(execMsg: ExecServerMessage, stream: ClientHttp2Stream, tools: readonly ToolSchema[] | undefined, pending: PendingMcpInvocation[]): 'context' | 'mcp-probe' | 'mcp-invoke' | 'native-reject' | 'ignored';
export declare function writeMcpResult(stream: ClientHttp2Stream, pending: PendingMcpInvocation, text: string, isError: boolean): void;
export declare function handleServerSideChannel(message: AgentServerMessage, blobStore: BlobStore, stream: ClientHttp2Stream, tools: readonly ToolSchema[] | undefined, pending: PendingMcpInvocation[]): 'interaction' | 'exec' | 'kv' | 'checkpoint' | 'other';
//# sourceMappingURL=exec.d.ts.map