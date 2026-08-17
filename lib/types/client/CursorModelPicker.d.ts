/** Frame-level model selection overlay opened by the Cursor settings card. */
import type { ReactNode } from 'react';
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { CursorCatalogModel } from '../client-contract.ts';
import type { CursorSettingsKey } from './locales.ts';
export interface CursorModelPickerSnapshot {
    open: boolean;
    loading: boolean;
    candidates: readonly CursorCatalogModel[];
    picked: ReadonlySet<string>;
    error?: string;
}
type Listener = () => void;
type Adopt = (models: readonly CursorCatalogModel[]) => void;
export declare class CursorModelPickerController {
    private snapshot;
    private readonly listeners;
    private onAdopt;
    getSnapshot: () => CursorModelPickerSnapshot;
    subscribe: (listener: Listener) => (() => void);
    begin(onAdopt: Adopt, initiallyPicked?: ReadonlySet<string>): void;
    complete(candidates: readonly CursorCatalogModel[]): void;
    fail(message: string): void;
    close: () => void;
    toggle: (id: string) => void;
    adopt: () => void;
    private publish;
}
export interface CursorModelPickerFace {
    t: (key: CursorSettingsKey) => string;
    hooks: {
        cursorModelPicker: CursorModelPickerController;
    };
    closePicker: () => void;
    togglePickerModel: (id: string) => void;
    adoptPickerModels: () => void;
}
export type CursorModelPickerProps = PropsRuntime<'shell.overlay'> & InjectFace<CursorModelPickerFace>;
export declare function CursorModelPicker(props: CursorModelPickerProps): ReactNode;
export {};
//# sourceMappingURL=CursorModelPicker.d.ts.map