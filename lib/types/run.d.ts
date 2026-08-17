/**
 * One DSH GenerateOptions turn: start or resume a Cursor AgentService/Run.
 */
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm';
import type { CursorCatalogModel } from './client-contract.ts';
import { type BlobStore, type CursorImageBytes } from './history.ts';
export declare const DEFAULT_HEARTBEAT_INTERVAL_MS = 5000;
export interface CursorRunOptions {
    apiURL: string;
    accessToken: string;
    catalog: readonly CursorCatalogModel[];
    heartbeatIntervalMs: number;
    streamIdleTimeoutMs: number;
    images?: CursorImageBytes;
    debug?: (message: string) => void;
}
export interface ConversationBinding {
    conversationId: string;
    blobStore: BlobStore;
}
export declare function conversationBinding(sessionId: string | undefined): ConversationBinding;
export declare function rotateConversationId(sessionId: string | undefined): string;
export declare function runCursorTurn(options: GenerateOptions, runtime: CursorRunOptions): AsyncGenerator<StreamChunk>;
//# sourceMappingURL=run.d.ts.map