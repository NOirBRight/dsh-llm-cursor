/**
 * Cursor subscription chat adapter. Implements LlmAdapter directly.
 */
import { LlmAdapter } from '@deepseek-ai/dsh-llm';
import type { GenerateOptions, LlmModelInfo, LlmProviderInfo, LlmResolvedModelInfo, ResolvedRetryPolicy, StreamChunk } from '@deepseek-ai/dsh-llm';
import type { AttachmentStore } from '@deepseek-ai/dsh-attachment';
import type { CursorCatalogModel } from './client-contract.ts';
import type { CursorOAuthRuntime } from './oauth.ts';
export declare const CURSOR_DEFAULT_CONTEXT_WINDOW = 200000;
export declare const CURSOR_DEFAULT_MODEL_MAX_TOKENS = 16384;
export interface CursorConnectionOptions {
    apiURL: string;
    models: readonly CursorCatalogModel[];
    streamIdleTimeoutMs: number;
    heartbeatIntervalMs: number;
    retryPolicy: ResolvedRetryPolicy;
}
export interface CursorAdapterOptions {
    options: () => CursorConnectionOptions;
    resolveApiKey: () => Promise<string>;
    resolveAttachments?: () => AttachmentStore | undefined;
    refreshCatalog?: () => Promise<void>;
    debug?: (message: string) => void;
}
export declare function resolveCursorAccessToken(runtime: CursorOAuthRuntime): Promise<string>;
export declare class CursorAdapter extends LlmAdapter {
    private readonly config;
    constructor(config: CursorAdapterOptions);
    providerInfo(provider: string): LlmProviderInfo;
    providerRetryPolicy(_provider: string): ResolvedRetryPolicy | undefined;
    listModels(_provider: string): Promise<readonly LlmModelInfo[]>;
    resolveModel(provider: string, model: string, _signal?: AbortSignal): Promise<LlmResolvedModelInfo>;
    stream(options: GenerateOptions): AsyncIterable<StreamChunk>;
}
export declare function defaultCursorConnection(overrides: Partial<CursorConnectionOptions> & Pick<CursorConnectionOptions, 'retryPolicy' | 'streamIdleTimeoutMs'>): CursorConnectionOptions;
//# sourceMappingURL=adapter.d.ts.map