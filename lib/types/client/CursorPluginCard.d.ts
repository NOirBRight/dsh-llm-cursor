/** Cursor Plugin configuration card: Host-owned Deep Control login, usage, and a read-only catalog. */
import type { ReactNode } from 'react';
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { CursorAuthStartReply, CursorAuthStatus, CursorCatalogModel, CursorUsageReply } from '../client-contract.ts';
import type { CursorSettingsKey } from './locales.ts';
export interface CursorPluginCardFace {
    t: (key: CursorSettingsKey) => string;
    startAuth: () => Promise<CursorAuthStartReply>;
    readAuthStatus: () => Promise<CursorAuthStatus>;
    logout: () => Promise<void>;
    fetchUsage: () => Promise<CursorUsageReply>;
    fetchModels: () => Promise<readonly CursorCatalogModel[]>;
}
export type CursorPluginCardProps = PropsRuntime<'settings.plugin.item'> & InjectFace<CursorPluginCardFace>;
export declare function CursorPluginCard(props: CursorPluginCardProps): ReactNode;
//# sourceMappingURL=CursorPluginCard.d.ts.map