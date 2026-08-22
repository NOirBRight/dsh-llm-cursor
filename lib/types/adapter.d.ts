/**
 * Cursor subscription chat adapter. Implements LlmAdapter directly.
 */
import { LlmAdapter } from '@deepseek-ai/dsh-llm';
import type { GenerateOptions, LlmModelInfo, LlmProviderInfo, LlmResolvedModelInfo, ResolvedRetryPolicy, StreamChunk } from '@deepseek-ai/dsh-llm';
import type { AttachmentStore } from '@deepseek-ai/dsh-attachment';
import type { CursorCatalogModel } from './client-contract.ts';
import type { CursorOAuthRuntime } from './oauth.ts';
export { CURSOR_DEFAULT_CONTEXT_WINDOW, CURSOR_MAX_CONTEXT_WINDOW } from './catalog.ts';
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
    refreshApiKey?: () => Promise<string>;
    resolveAttachments?: () => AttachmentStore | undefined;
    debug?: (message: string) => void;
}
export declare function resolveCursorAccessToken(runtime: CursorOAuthRuntime): Promise<string>;
export declare function refreshCursorAccessToken(runtime: CursorOAuthRuntime): Promise<string>;
export declare class CursorAdapter extends LlmAdapter {
    private readonly config;
    constructor(config: CursorAdapterOptions);
    providerInfo(provider: string): LlmProviderInfo;
    providerRetryPolicy(_provider: string): ResolvedRetryPolicy | undefined;
    listModels(_provider: string): Promise<readonly LlmModelInfo[]>;
    resolveModel(provider: string, model: string, _signal?: AbortSignal): Promise<LlmResolvedModelInfo>;
    /** Own the method so rc.2 Host can call it even when this class extends an older LlmAdapter. */
    prepareCall(provider: string, model: string, signal?: AbortSignal): Promise<{
        model: LlmResolvedModelInfo;
        stream: (options: GenerateOptions) => AsyncIterable<StreamChunk>;
    }>;
    stream(options: GenerateOptions): AsyncIterable<StreamChunk>;
    private streamWith;
}
export declare function defaultCursorConnection(overrides: Partial<CursorConnectionOptions> & Pick<CursorConnectionOptions, 'retryPolicy' | 'streamIdleTimeoutMs'>): CursorConnectionOptions;
//# sourceMappingURL=adapter.d.ts.map