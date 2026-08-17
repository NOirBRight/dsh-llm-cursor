/**
 * Rebuild Cursor conversationState from DSH messages.
 * Checkpoint history is not authoritative.
 */
import type { Message } from '@deepseek-ai/dsh-llm';
export type BlobStore = Map<string, Uint8Array>;
export declare function createBlobId(data: Uint8Array): Uint8Array;
export declare function storeCursorBlob(blobStore: BlobStore, data: Uint8Array): Uint8Array;
export declare function readCursorBlob(blobStore: BlobStore, blobId: Uint8Array): Uint8Array | undefined;
export declare function findLastUserMessageIndex(messages: readonly Message[]): number;
/** Active user only when the request ends on a new user turn; tool-result tails resume. */
export declare function findActiveUserMessageIndex(messages: readonly Message[]): number;
export declare function buildRootPromptMessagesJson(messages: readonly Message[], system: string | undefined, blobStore: BlobStore, activeUserMessageIndex: number, provider: string, model: string): Uint8Array[];
export declare function buildConversationTurns(messages: readonly Message[], blobStore: BlobStore, activeUserMessageIndex: number, provider: string, model: string): Uint8Array[];
export declare function buildRunAction(messages: readonly Message[], activeUserMessageIndex: number): import("./wire/vendor/agent_pb.ts").ConversationAction;
export declare function buildConversationState(messages: readonly Message[], system: string | undefined, blobStore: BlobStore, provider: string, model: string): {
    conversationState: import("./wire/vendor/agent_pb.ts").ConversationStateStructure;
    action: import("./wire/vendor/agent_pb.ts").ConversationAction;
    activeUserMessageIndex: number;
};
//# sourceMappingURL=history.d.ts.map