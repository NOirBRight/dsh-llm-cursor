/**
 * Frozen seed catalog plus GetUsableModels refresh after sign-in.
 * Cursor encodes thinking level and speed in the wire id; we collapse thinking
 * levels into one family and keep Fast as its own model. Fetch sorts Auto,
 * then Cursor (Composer, Cursor Grok 4.5/4.6, and other first-party SKUs),
 * then other brands. Fetch may offer a `-1m` sibling for families Cursor
 * actually has Max Context for; a saved catalog keeps only the rows you picked.
 */
import type { CursorCatalogModel } from './client-contract.ts';
export declare const GET_USABLE_MODELS_PATH = "/agent.v1.AgentService/GetUsableModels";
export { CURSOR_DEFAULT_CONTEXT_WINDOW, CURSOR_GROK_CONTEXT_WINDOW, CURSOR_GPT_56_CONTEXT_WINDOW, CURSOR_CLAUDE_5_CONTEXT_WINDOW, CURSOR_MAX_CONTEXT_WINDOW, CURSOR_MAX_SUFFIX, CURSOR_EFFORT_ORDER, CURSOR_EFFORT_LABELS, cursorBaseFamilyId, isCursorMaxRow, splitCursorWireId, canonicalizeFamilyId, cleanFamilyName, groupCursorModels, brandOfCursorFamily, cursorBrandSections, CURSOR_BRAND_LABELS, modelMatchesQuery, findCatalogModel, effortsForCursorModel, resolveCursorWireId, variantMaxMode, suggestedDefaultEffort, resolveCursorDefaultEffort, familyHasExtendedContext, defaultContextWindowForFamily, } from './catalog-group.ts';
export type { CursorBrandSection, CursorCatalogSort, CursorModelBrand } from './catalog-group.ts';
export declare function fallbackCursorCatalog(): CursorCatalogModel[];
export declare function catalogFromSettings(models: readonly CursorCatalogModel[] | undefined): CursorCatalogModel[];
export interface UsableModelEntry {
    modelId: string;
    displayName: string;
    displayModelId?: string;
    displayNameShort?: string;
    maxMode?: boolean | undefined;
    thinkingDetails?: unknown;
}
export declare function parseUsableModels(models: readonly UsableModelEntry[]): CursorCatalogModel[];
export interface CursorModelsRequest {
    accessToken: string;
    apiURL?: string;
    signal?: AbortSignal;
}
export declare function readCursorModels(request: CursorModelsRequest): Promise<CursorCatalogModel[]>;
//# sourceMappingURL=catalog.d.ts.map