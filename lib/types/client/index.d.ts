/** Browser half: Cursor setup inside Plugin configuration. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import type { CursorSettingsKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'settings.cursor': CursorSettingsKey;
    }
}
export declare const name = "dsh-llm-cursor-client";
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map