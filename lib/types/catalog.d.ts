/**
 * Frozen seed catalog plus GetUsableModels refresh after sign-in.
 * Cursor encodes thinking level and speed in the wire id; we collapse thinking
 * levels into one family and keep Fast as its own model. Fetch sorts Auto,
 * then Cursor (Composer and other first-party SKUs), then other brands.
 */
import type { CursorCatalogModel } from './client-contract.ts';
export declare const GET_USABLE_MODELS_PATH = "/agent.v1.AgentService/GetUsableModels";
export { CURSOR_EFFORT_ORDER, CURSOR_EFFORT_LABELS, splitCursorWireId, cleanFamilyName, groupCursorModels, brandOfCursorFamily, cursorBrandSections, CURSOR_BRAND_LABELS, modelMatchesQuery, findCatalogModel, effortsForCursorModel, resolveCursorWireId, variantMaxMode, suggestedDefaultEffort, resolveCursorDefaultEffort, } from './catalog-group.ts';
export type { CursorBrandSection, CursorCatalogSort, CursorModelBrand } from './catalog-group.ts';
export declare function fallbackCursorCatalog(): CursorCatalogModel[];
export declare function catalogFromSettings(models: readonly CursorCatalogModel[] | undefined): CursorCatalogModel[];
export declare function parseUsableModels(models: readonly {
    modelId: string;
    displayName: string;
    maxMode?: boolean | undefined;
    thinkingDetails?: unknown;
}[]): CursorCatalogModel[];
export interface CursorModelsRequest {
    accessToken: string;
    apiURL?: string;
    signal?: AbortSignal;
}
export declare function readCursorModels(request: CursorModelsRequest): Promise<CursorCatalogModel[]>;
//# sourceMappingURL=catalog.d.ts.map