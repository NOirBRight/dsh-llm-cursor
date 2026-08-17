/**
 * Collapse Cursor thinking-level wire ids into one family row.
 * Fast SKUs stay their own family (`gpt-5.2-fast`). Fetch sorts Auto, then
 * Cursor (Composer, Cursor Grok, and other first-party SKUs), then other
 * brands, with each standard model beside its Fast sibling.
 * A saved catalog keeps input order so drag-reorder survives reload.
 * Browser-safe: the plugin card and Host adapter share this module.
 */
import type { CursorCatalogModel, CursorEffort } from './client-contract.ts';
/** Picker suffix for a first-class Max / 1M row. Avoids colliding with effort `-max`. */
export declare const CURSOR_MAX_SUFFIX = "-1m";
/** Ordinary Cursor request budget. */
export declare const CURSOR_DEFAULT_CONTEXT_WINDOW = 200000;
/** DSH budget for Max rows. Cursor does not disclose the real ceiling. */
export declare const CURSOR_MAX_CONTEXT_WINDOW = 1000000;
export declare function isCursorMaxRow(id: string): boolean;
export declare function cursorBaseFamilyId(id: string): string;
export declare const CURSOR_EFFORT_ORDER: readonly CursorEffort[];
export declare const CURSOR_EFFORT_LABELS: Record<CursorEffort, string>;
export declare function splitCursorWireId(id: string): {
    family: string;
    effort?: CursorEffort;
    fast: boolean;
};
export declare function cleanFamilyName(name: string): string;
declare const BRAND_RANK: {
    readonly cursor: 1;
    readonly openai: 2;
    readonly anthropic: 3;
    readonly google: 4;
    readonly xai: 5;
    readonly deepseek: 6;
    readonly moonshot: 7;
    readonly zhipu: 8;
    readonly minimax: 9;
    readonly mistral: 10;
    readonly meta: 11;
    readonly alibaba: 12;
    readonly other: 99;
};
export type CursorModelBrand = keyof typeof BRAND_RANK;
/** Infer the lab / first-party brand from a family id and display name. */
export declare function brandOfCursorFamily(familyId: string, name?: string): CursorModelBrand;
export declare const CURSOR_BRAND_LABELS: Record<CursorModelBrand, string>;
export interface CursorBrandSection {
    brand: CursorModelBrand;
    label: string;
    models: CursorCatalogModel[];
}
/** Partition an already-sorted catalog into brand sections for the picker. */
export declare function cursorBrandSections(models: readonly CursorCatalogModel[]): CursorBrandSection[];
export type CursorCatalogSort = 'stable' | 'brand';
export declare function groupCursorModels(models: readonly CursorCatalogModel[], sort?: CursorCatalogSort): CursorCatalogModel[];
export declare function modelMatchesQuery(model: CursorCatalogModel, query: string): boolean;
export declare function findCatalogModel(catalog: readonly CursorCatalogModel[], id: string): CursorCatalogModel | undefined;
export declare function effortsForCursorModel(model: CursorCatalogModel): CursorEffort[];
export declare function resolveCursorWireId(model: CursorCatalogModel, effort?: string): string;
export declare function variantMaxMode(model: CursorCatalogModel, _effort?: string): boolean;
/** Plugin default when the chat has not picked a thinking level. */
export declare function suggestedDefaultEffort(familyId: string, efforts: readonly CursorEffort[]): CursorEffort | undefined;
export declare function resolveCursorDefaultEffort(model: CursorCatalogModel): CursorEffort | undefined;
export {};
//# sourceMappingURL=catalog-group.d.ts.map