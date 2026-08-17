/** Browser-safe constants and JSON decoders shared by the Host and client plugin faces. */
/** Settings namespace owned by the Cursor plugin. */
export declare const CURSOR_SETTINGS_NAMESPACE = "llm-cursor";
/** Provider route owned by this plugin. */
export declare const CURSOR_PROVIDER = "cursor";
/** Default maximum idle interval while a stream read is outstanding. */
export declare const CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS = 300000;
/** Private Connection RPC channel used by this package's Host and Web faces. */
export declare const CURSOR_RPC_CHANNEL = "/cursor";
/** Begin a Host-owned Deep Control sign-in. */
export declare const CURSOR_AUTH_START_ENDPOINT = "auth/start";
/** Secret-free login snapshot. */
export declare const CURSOR_AUTH_STATUS_ENDPOINT = "auth/status";
/** Delete the Host session file. */
export declare const CURSOR_AUTH_LOGOUT_ENDPOINT = "auth/logout";
/** Secret-free subscription-usage snapshot. */
export declare const CURSOR_USAGE_ENDPOINT = "usage/read";
/** Account model list. */
export declare const CURSOR_MODELS_ENDPOINT = "models/list";
/** MCP / history provider identifier; must match on advertise and replay. */
export declare const CURSOR_MCP_PROVIDER_ID = "dsh-llm-cursor";
/** One model in the plugin catalog. */
export interface CursorCatalogModel {
    /** Wire model id accepted by AgentService/Run. */
    id: string;
    /** Selector label; omission uses {@link id}. */
    name?: string;
    /** Whether the model supports native thinking. */
    thinking?: boolean;
    /** Whether the model accepts image input. */
    vision?: boolean;
    /** Whether requests may set maxMode. */
    maxMode?: boolean;
}
/**
 * Offline fallback when the account catalog cannot be read.
 * Live ids come from GetUsableModels after sign-in.
 */
export declare const CURSOR_CATALOG: readonly CursorCatalogModel[];
/** Settings fields presented by the package's Web configuration card. No apiKeyEnv. */
export interface CursorSettingsView {
    /** Stream idle timeout in milliseconds. */
    streamIdleTimeoutMs: number;
    /** Last successful catalog; empty means use {@link CURSOR_CATALOG}. */
    models?: readonly CursorCatalogModel[];
}
/** Secret-free login snapshot. */
export interface CursorAuthStatus {
    /** Whether the Host currently holds a usable session file. */
    loggedIn: boolean;
    /** Account email when the session recorded one. */
    email?: string;
    /** ISO-8601 access-token expiry when the session recorded one. */
    expiresAt?: string;
}
export type CursorAuthStartReply = {
    ok: true;
} | {
    ok: false;
    retryable: true;
    message: string;
};
export interface CursorAuthLogoutReply {
    ok: true;
}
export interface CursorUsageWindow {
    id: string;
    used: number;
    limit: number;
    period?: string;
    unit?: 'percent';
}
export interface CursorUsageView {
    fetchedAt: string;
    windows: CursorUsageWindow[];
}
export interface CursorModelsReply {
    models: CursorCatalogModel[];
}
export type CursorUsageReply = {
    status: 'ok';
    usage: CursorUsageView;
} | {
    status: 'unsupported';
} | {
    status: 'logged-out';
};
export declare function decodeCursorCatalogModel(value: unknown): CursorCatalogModel | undefined;
export declare function decodeCursorSettings(value: unknown): CursorSettingsView | undefined;
export declare function decodeCursorEmptyRequest(value: unknown): Record<string, never> | undefined;
export declare function decodeCursorAuthStartReply(value: unknown): CursorAuthStartReply | undefined;
export declare function decodeCursorAuthStatus(value: unknown): CursorAuthStatus | undefined;
export declare function decodeCursorAuthLogoutReply(value: unknown): CursorAuthLogoutReply | undefined;
export declare function decodeCursorUsageView(value: unknown): CursorUsageView | undefined;
export declare function decodeCursorUsageReply(value: unknown): CursorUsageReply | undefined;
export declare function decodeCursorModelsReply(value: unknown): CursorModelsReply | undefined;
//# sourceMappingURL=client-contract.d.ts.map