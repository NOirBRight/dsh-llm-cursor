/**
 * Frozen seed catalog plus GetUsableModels refresh after sign-in.
 */
import type { CursorCatalogModel } from './client-contract.ts';
export declare const GET_USABLE_MODELS_PATH = "/agent.v1.AgentService/GetUsableModels";
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
export declare function readCursorModels(request: CursorModelsRequest): Promise<CursorCatalogModel[] | undefined>;
//# sourceMappingURL=catalog.d.ts.map