/**
 * Register the `cursor` provider, the AgentService chat adapter,
 * the `llm-cursor` settings section, and the loopback `/cursor` RPC.
 * @module dsh-llm-cursor
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { ConnectionRpcHandler } from '@deepseek-ai/dsh-client-connection';
import type { RetryPolicyConfig } from '@deepseek-ai/dsh-llm';
import type { CursorConnectionOptions } from './adapter.ts';
import type { CursorCatalogModel } from './client-contract.ts';
import type { CursorOAuthRuntime } from './oauth.ts';
export { CursorAdapter, resolveCursorAccessToken, defaultCursorConnection } from './adapter.ts';
export type { CursorAdapterOptions, CursorConnectionOptions } from './adapter.ts';
export { CURSOR_CATALOG, CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS, CURSOR_PROVIDER, CURSOR_SETTINGS_NAMESPACE, CURSOR_RPC_CHANNEL, CURSOR_AUTH_START_ENDPOINT, CURSOR_AUTH_STATUS_ENDPOINT, CURSOR_AUTH_LOGOUT_ENDPOINT, CURSOR_MODELS_ENDPOINT, CURSOR_USAGE_ENDPOINT, CURSOR_MCP_PROVIDER_ID, decodeCursorSettings, decodeCursorAuthStatus, decodeCursorAuthStartReply, decodeCursorAuthLogoutReply, decodeCursorEmptyRequest, decodeCursorUsageView, decodeCursorUsageReply, decodeCursorModelsReply, } from './client-contract.ts';
export type { CursorCatalogModel, CursorSettingsView, CursorAuthStatus, CursorAuthStartReply, CursorAuthLogoutReply, CursorUsageWindow, CursorUsageView, CursorUsageReply, CursorModelsReply, } from './client-contract.ts';
export { CURSOR_LOGIN_URL, CURSOR_POLL_URL, CURSOR_REFRESH_URL, createCursorAuthRuntime, ensureFreshSession, startPkceLogin, refreshCursorToken, } from './oauth.ts';
export type { CursorOAuthRuntime } from './oauth.ts';
export { CURSOR_SESSION_FILENAME, resolveCursorSessionPath, sessionPathForHome, readSession, writeSession, deleteSession, statusFromSession, } from './session.ts';
export type { CursorSession } from './session.ts';
export { CURSOR_API_URL, CURSOR_CLIENT_VERSION, CURSOR_PLUGIN_IDENTITY_HEADER } from './identity.ts';
export { readCursorModels, fallbackCursorCatalog, catalogFromSettings } from './catalog.ts';
export { readCursorUsage, parseCursorAuthUsage, parseCursorUsageSummary } from './usage.ts';
export { DEFAULT_HEARTBEAT_INTERVAL_MS } from './run.ts';
export declare const name = "llm-cursor";
export declare const inject: string[];
export type ResolvedCursorOptions = CursorConnectionOptions;
export declare function resolveAdapterOptions(config: Config): ResolvedCursorOptions;
export interface Config {
    streamIdleTimeoutMs?: number;
    retryPolicy?: RetryPolicyConfig;
    models?: CursorCatalogModel[];
}
export declare const Config: z<Config>;
export interface CursorRpcHandlerOptions {
    apiURL?: string;
    usageURL?: string;
    usageSummaryURL?: string;
    authMeURL?: string;
    adoptCatalog?: (models: readonly CursorCatalogModel[]) => void;
}
export declare function createCursorRpcHandler(runtime: CursorOAuthRuntime, options?: CursorRpcHandlerOptions): ConnectionRpcHandler;
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map