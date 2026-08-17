/**
 * Frozen seed catalog plus GetUsableModels refresh after sign-in.
 * Cursor encodes thinking level and speed in the wire id; we collapse thinking
 * levels into one family and keep Fast as its own model. Fetch sorts Auto,
 * then Cursor (Composer and other first-party SKUs), then other brands.
 */

import { create, fromBinary, toBinary } from '@bufbuild/protobuf'
import { CURSOR_CATALOG } from './client-contract.ts'
import type { CursorCatalogModel } from './client-contract.ts'
import { groupCursorModels } from './catalog-group.ts'
import { CURSOR_API_URL, cursorRequestHeaders } from './identity.ts'
import { connectUnaryProto } from './wire/http2.ts'
import {
  GetUsableModelsRequestSchema,
  GetUsableModelsResponseSchema,
} from './wire/vendor/agent_pb.ts'

export const GET_USABLE_MODELS_PATH = '/agent.v1.AgentService/GetUsableModels'

export {
  CURSOR_EFFORT_ORDER,
  CURSOR_EFFORT_LABELS,
  splitCursorWireId,
  cleanFamilyName,
  groupCursorModels,
  brandOfCursorFamily,
  cursorBrandSections,
  CURSOR_BRAND_LABELS,
  modelMatchesQuery,
  findCatalogModel,
  effortsForCursorModel,
  resolveCursorWireId,
  variantMaxMode,
  suggestedDefaultEffort,
  resolveCursorDefaultEffort,
} from './catalog-group.ts'
export type { CursorBrandSection, CursorCatalogSort, CursorModelBrand } from './catalog-group.ts'

export function fallbackCursorCatalog(): CursorCatalogModel[] {
  return CURSOR_CATALOG.map(model => ({ ...model }))
}

export function catalogFromSettings(models: readonly CursorCatalogModel[] | undefined): CursorCatalogModel[] {
  if (models === undefined) return fallbackCursorCatalog()
  return groupCursorModels(models)
}

export function parseUsableModels(models: readonly { modelId: string, displayName: string, maxMode?: boolean | undefined, thinkingDetails?: unknown }[]): CursorCatalogModel[] {
  const out: CursorCatalogModel[] = []
  const seen = new Set<string>()
  for (const entry of models) {
    if (entry.modelId.length === 0 || seen.has(entry.modelId)) continue
    seen.add(entry.modelId)
    const name = entry.modelId === 'default'
      ? (entry.displayName.length > 0 && entry.displayName !== 'default' ? entry.displayName : 'Auto')
      : entry.displayName.length > 0 ? entry.displayName : entry.modelId
    out.push({
      id: entry.modelId,
      name,
      thinking: entry.thinkingDetails !== undefined,
      vision: true,
      ...entry.maxMode === true ? { maxMode: true } : {},
    })
  }
  return out
}

export interface CursorModelsRequest {
  accessToken: string
  apiURL?: string
  signal?: AbortSignal
}

export async function readCursorModels(request: CursorModelsRequest): Promise<CursorCatalogModel[]> {
  const origin = request.apiURL ?? CURSOR_API_URL
  const payload = toBinary(GetUsableModelsRequestSchema, create(GetUsableModelsRequestSchema, {}))
  const response = await connectUnaryProto({
    origin,
    path: GET_USABLE_MODELS_PATH,
    headers: cursorRequestHeaders(request.accessToken),
    body: payload,
    ...request.signal === undefined ? {} : { signal: request.signal },
  })
  const decoded = fromBinary(GetUsableModelsResponseSchema, response)
  const models = groupCursorModels(parseUsableModels(decoded.models), 'brand')
  if (models.length === 0) throw new Error('Cursor returned no models')
  return models
}
