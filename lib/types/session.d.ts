/**
 * Host-only Cursor OAuth session file. Tokens never leave this module through
 * the RPC contract; the browser only sees {@link statusFromSession}.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { CursorAuthStatus } from './client-contract.ts';
/** File name under `$DSH_HOME`. Never `~/.cursor` auth files. */
export declare const CURSOR_SESSION_FILENAME = "cursor-oauth.json";
/** Access and refresh material stored only on the Host. */
export interface CursorSession {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    email?: string;
    userId?: string;
}
export declare function resolveCursorSessionPath(ctx: Context): string;
export declare function sessionPathForHome(dshHome: string): string;
export declare function decodeCursorSession(value: unknown): CursorSession | undefined;
export declare function readSession(path: string): Promise<CursorSession | undefined>;
export declare function writeSession(path: string, session: CursorSession): Promise<void>;
export declare function deleteSession(path: string): Promise<void>;
export declare function statusFromSession(session: CursorSession | undefined): CursorAuthStatus;
//# sourceMappingURL=session.d.ts.map