/**
 * Cursor subscription chat adapter. Implements LlmAdapter directly.
 */
import { LlmAdapter } from '@deepseek-ai/dsh-llm';
import type { GenerateOptions, LlmModelInfo, LlmProviderInfo, LlmResolvedModelInfo, ResolvedRetryPolicy, StreamChunk } from '@deepseek-ai/dsh-llm';
import type { AttachmentStore } from '@deepseek-ai/dsh-attachment';
import type { CursorCatalogModel } from './client-contract.ts';
import type { CursorOAuthRuntime } from './oauth.ts';
import type { ParkedRun } from './park.ts';
import { CursorRunRegistry } from './run-registry.ts';
import type { RunLifecycleOptions } from './run-registry.ts';
export { CURSOR_DEFAULT_CONTEXT_WINDOW, CURSOR_MAX_CONTEXT_WINDOW } from './catalog.ts';
export interface CursorConnectionOptions {
    apiURL: string;
    models: readonly CursorCatalogModel[];
    streamIdleTimeoutMs: number;
    /** Bounded transport and conversation-state lifecycle settings. */
    runLifecycle: RunLifecycleOptions;
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
/**
 * Remove sandbox escalation choices that cannot be strictly wider than the
 * current DSH policy. Core still validates every retained request; this only
 * prevents Cursor from selecting an impossible optional enum value.
 * Scans both options.system and context-injected messages.
 */
export declare function narrowCursorEscalationSchemas(options: GenerateOptions): GenerateOptions;
export declare class CursorAdapter extends LlmAdapter {
    private readonly config;
    /** Adapter-owned Cursor Run and conversation-binding registry. */
    readonly registry: CursorRunRegistry<ParkedRun>;
    constructor(config: CursorAdapterOptions);
    providerInfo(provider: string): LlmProviderInfo;
    providerRetryPolicy(_provider: string): ResolvedRetryPolicy | undefined;
    /**
     * Declare neutral request-image pricing so the Host applies its heuristic image pricing.
     * @param _provider - provider route.
     * @param _model - model id.
     * @returns `undefined` so the Host uses heuristic image pricing.
     */
    imageRequestPricing(_provider: string, _model: string): undefined;
    listModels(_provider: string): Promise<readonly LlmModelInfo[]>;
    resolveModel(provider: string, model: string, _signal?: AbortSignal): Promise<LlmResolvedModelInfo>;
    private directory;
    /**
     * Resolve a model and create its request-scoped stream factory for Host dispatch.
     * @param provider - provider route copied into the resolved model.
     * @param model - configured Cursor catalog model id.
     * @param signal - optional model-resolution cancellation signal.
     * @returns the resolved model and a stream factory bound to request-scoped connection values.
     */
    prepareCall(provider: string, model: string, signal?: AbortSignal): Promise<{
        model: LlmResolvedModelInfo;
        stream: (options: GenerateOptions) => AsyncIterable<StreamChunk>;
    }>;
    stream(options: GenerateOptions): AsyncIterable<StreamChunk>;
    private streamWith;
}
/**
 * Build a Cursor connection snapshot with stable endpoint, catalog, and lifecycle defaults.
 * @param overrides - required retry/idle settings plus optional connection overrides.
 * @returns resolved connection settings suitable for one adapter request snapshot.
 */
export declare function defaultCursorConnection(overrides: Partial<CursorConnectionOptions> & Pick<CursorConnectionOptions, 'retryPolicy' | 'streamIdleTimeoutMs'>): CursorConnectionOptions;
//# sourceMappingURL=adapter.d.ts.map