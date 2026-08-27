/**
 * Park an unfinished HTTP/2 Run until the next DSH turn writes mcpResult.
 * Heartbeats continue while the adapter-owned registry enforces park expiry.
 */
import type { ClientHttp2Session, ClientHttp2Stream } from 'node:http2';
import type { Message } from '@deepseek-ai/dsh-llm';
import type { PendingMcpInvocation } from './exec.ts';
import type { BlobStore } from './history.ts';
import type { InteractionMapper, OpenMcpBlock } from './interaction.ts';
export interface ParkedMcpCall {
    envelopeCallId: string;
    pending: PendingMcpInvocation;
}
export interface ParkedRun {
    sessionKey: string;
    conversationId: string;
    session: ClientHttp2Session;
    stream: ClientHttp2Stream;
    blobStore: BlobStore;
    calls: ParkedMcpCall[];
    mapper: InteractionMapper;
    closed: boolean;
    pendingWork: Promise<void>[];
    push: (chunk: Buffer) => void;
    waitChunk: () => Promise<Buffer | undefined>;
    trailers: Record<string, string>;
    getHttpStatus: () => number;
    inbox: Buffer;
}
export declare function trailingToolResults(messages: readonly Message[]): Array<{
    callId: string;
    text: string;
    isError: boolean;
}>;
export declare function parkMatches(parked: ParkedRun, messages: readonly Message[]): boolean;
export declare function pairParkResults(parked: ParkedRun, messages: readonly Message[]): Array<{
    call: ParkedMcpCall;
    text: string;
    isError: boolean;
}>;
export declare function parkCompletedMcp(parked: ParkedRun, completed: OpenMcpBlock[], pending: PendingMcpInvocation[]): void;
//# sourceMappingURL=park.d.ts.map