/**
 * Host-owned Cursor Deep Control login (PKCE + poll).
 * Tokens stay on the Host; this module never logs Authorization headers.
 */
import type { CursorAuthStartReply } from './client-contract.ts';
import type { CursorSession } from './session.ts';
export declare const CURSOR_LOGIN_URL = "https://cursor.com/loginDeepControl";
export declare const CURSOR_POLL_URL = "https://api2.cursor.sh/auth/poll";
export declare const CURSOR_REFRESH_URL = "https://api2.cursor.sh/auth/exchange_user_api_key";
export declare const CURSOR_POLL_MAX_ATTEMPTS = 150;
export declare const CURSOR_POLL_BASE_DELAY_MS = 1000;
export declare const CURSOR_POLL_MAX_DELAY_MS = 10000;
export declare const CURSOR_POLL_BACKOFF = 1.2;
export declare const CURSOR_REFRESH_SKEW_MS: number;
export interface CursorAuthParams {
    verifier: string;
    challenge: string;
    uuid: string;
    loginUrl: string;
}
export interface CursorOAuthRuntime {
    resolveSessionPath: () => string;
    loginURL: string;
    pollURL: string;
    refreshURL: string;
    authMeURL: string;
    openBrowser: (url: string) => Promise<void>;
    fetch: typeof fetch;
    now: () => number;
    sleep: (ms: number) => Promise<void>;
    pollMaxAttempts: number;
    pollBaseDelayMs: number;
    pollMaxDelayMs: number;
    refreshSkewMs: number;
}
export declare function generatePkce(): {
    verifier: string;
    challenge: string;
};
export declare function decodeJwtPayload(token: string): Record<string, unknown> | undefined;
export declare function extractCursorAccessTokenEmail(accessToken: string): string | undefined;
export declare function extractCursorAccessTokenUserId(accessToken: string): string | undefined;
export declare function isCursorUnauthorized(error: unknown): boolean;
export declare function tokenExpiryMs(token: string, now: () => number): number;
export declare function isCursorTokenExpiringSoon(token: string, now: () => number, skewMs?: number): boolean;
export declare function createCursorAuthRuntime(overrides: Partial<CursorOAuthRuntime> & Pick<CursorOAuthRuntime, 'resolveSessionPath'>): CursorOAuthRuntime;
export declare function generateCursorAuthParams(): CursorAuthParams;
export declare function pollCursorAuth(runtime: CursorOAuthRuntime, uuid: string, verifier: string, signal?: AbortSignal): Promise<{
    accessToken: string;
    refreshToken: string;
    email?: string;
}>;
export declare function refreshStoredSession(runtime: CursorOAuthRuntime): Promise<CursorSession>;
export declare function withUnauthorizedRetry<T>(runtime: CursorOAuthRuntime, accessToken: string, run: (token: string) => Promise<T>): Promise<T>;
export declare function refreshCursorToken(runtime: CursorOAuthRuntime, apiKeyOrRefreshToken: string, previous?: CursorSession): Promise<CursorSession>;
export declare function startPkceLogin(runtime: CursorOAuthRuntime, signal?: AbortSignal): Promise<CursorAuthStartReply>;
export declare function ensureFreshSession(runtime: CursorOAuthRuntime): Promise<CursorSession | undefined>;
//# sourceMappingURL=oauth.d.ts.map