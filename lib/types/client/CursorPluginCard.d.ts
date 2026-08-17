/** Cursor Plugin configuration card: Host-owned login, usage, and an editable catalog. */
import type { ReactNode } from 'react';
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client';
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { CursorAuthStartReply, CursorAuthStatus, CursorCatalogModel, CursorSaveResult, CursorSettingsView, CursorUsageReply } from '../client-contract.ts';
import type { CursorSettingsKey } from './locales.ts';
export interface CursorPluginCardFace {
    t: (key: CursorSettingsKey) => string;
    hooks: {
        cursorSettings: SettingsScope<CursorSettingsView>;
    };
    startAuth: () => Promise<CursorAuthStartReply>;
    readAuthStatus: () => Promise<CursorAuthStatus>;
    logout: () => Promise<void>;
    fetchUsage: () => Promise<CursorUsageReply>;
    discoverModels: () => Promise<readonly CursorCatalogModel[]>;
    saveConfiguration: (settings: CursorSettingsView) => Promise<CursorSaveResult>;
    beginModelPicker: (initiallyPicked: ReadonlySet<string>, onAdopt: (models: readonly CursorCatalogModel[]) => void) => void;
    completeModelPicker: (candidates: readonly CursorCatalogModel[]) => void;
    failModelPicker: (message: string) => void;
    closeModelPicker: () => void;
}
export type CursorPluginCardProps = PropsRuntime<'settings.plugin.item'> & InjectFace<CursorPluginCardFace>;
export declare function CursorPluginCard(props: CursorPluginCardProps): ReactNode;
//# sourceMappingURL=CursorPluginCard.d.ts.map