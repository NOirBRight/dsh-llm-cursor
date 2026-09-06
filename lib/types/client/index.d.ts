/** Browser half: Cursor setup inside Plugin configuration. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { ProviderUsageReader } from 'dsh-llm-providers-ui/usage-readers';
declare module '@deepseek-ai/cordis' {
    interface Context {
        providerDirectory: {
            register(declaration: {
                key: string;
                role?: 'llm' | 'agent';
                header?: 'shared' | 'legacy';
                usage?: ProviderUsageReader;
            }): () => void;
        };
    }
}
import type { CursorSettingsKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'settings.provider.item': {
            kind: 'keyed';
            scope: 'root';
        };
    }
}
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'settings.cursor': CursorSettingsKey;
    }
}
export declare const name = "dsh-llm-cursor-client";
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map