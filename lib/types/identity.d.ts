/** Chat API origin used by the Cursor CLI session entry. */
export declare const CURSOR_API_URL = "https://api2.cursor.sh";
/** Pinned CLI version the session entry currently accepts. Bump in changelog when it breaks. */
export declare const CURSOR_CLIENT_VERSION = "cli-2026.01.09-231024f";
/** Plugin identity sent beside the required CLI compatibility headers. */
export declare const CURSOR_PLUGIN_IDENTITY_HEADER: string;
export declare function cursorRequestHeaders(accessToken: string): Record<string, string>;
//# sourceMappingURL=identity.d.ts.map