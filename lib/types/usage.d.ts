/**
 * Host-only Cursor usage reads. The browser receives a decoded window view.
 */
import type { CursorUsageReply, CursorUsageWindow } from './client-contract.ts';
export declare const CURSOR_USAGE_URL = "https://api2.cursor.sh/auth/usage";
export declare const CURSOR_USAGE_SUMMARY_URL = "https://cursor.com/api/usage-summary";
export declare const CURSOR_AUTH_ME_URL = "https://cursor.com/api/auth/me";
export declare const DEFAULT_USAGE_REQUEST_TIMEOUT_MS = 15000;
export interface CursorUsageRequest {
    accessToken: string;
    userId?: string;
    usageURL?: string;
    usageSummaryURL?: string;
    authMeURL?: string;
    fetch?: typeof fetch;
    now?: () => number;
    signal?: AbortSignal;
}
/** Decode GET /auth/usage. A null maxRequestUsage still yields a used window. */
export declare function parseCursorAuthUsage(payload: unknown): CursorUsageWindow[];
/** Decode cursor.com/api/usage-summary individualUsage. */
export declare function parseCursorUsageSummary(payload: unknown): CursorUsageWindow[];
export declare function readCursorUsage(request: CursorUsageRequest): Promise<CursorUsageReply>;
//# sourceMappingURL=usage.d.ts.map