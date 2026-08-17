/**
 * Frozen seed catalog plus GetUsableModels refresh after sign-in.
 */

import { create, fromBinary, toBinary } from '@bufbuild/protobuf'
import { CURSOR_CATALOG } from './client-contract.ts'
import type { CursorCatalogModel } from './client-contract.ts'
import { CURSOR_API_URL, cursorRequestHeaders } from './identity.ts'
import { connectUnary } from './wire/http2.ts'
import {
  GetUsableModelsRequestSchema,
  GetUsableModelsResponseSchema,
} from './wire/vendor/agent_pb.ts'

export const GET_USABLE_MODELS_PATH = '/agent.v1.AgentService/GetUsableModels'

export function fallbackCursorCatalog(): CursorCatalogModel[] {
  return CURSOR_CATALOG.map(model => ({ ...model }))
}

export function catalogFromSettings(models: readonly CursorCatalogModel[] | undefined): CursorCatalogModel[] {
  if (models === undefined || models.length === 0) return fallbackCursorCatalog()
  return models.map(model => ({ ...model }))
}

export function parseUsableModels(models: readonly { modelId: string, displayName: string, maxMode?: boolean | undefined, thinkingDetails?: unknown }[]): CursorCatalogModel[] {
  const out: CursorCatalogModel[] = []
  const seen = new Set<string>()
  for (const entry of models) {
    if (entry.modelId.length === 0 || seen.has(entry.modelId)) continue
    seen.add(entry.modelId)
    out.push({
      id: entry.modelId,
      name: entry.displayName.length > 0 ? entry.displayName : entry.modelId,
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

export async function readCursorModels(request: CursorModelsRequest): Promise<CursorCatalogModel[] | undefined> {
  const origin = request.apiURL ?? CURSOR_API_URL
  try {
    const payload = toBinary(GetUsableModelsRequestSchema, create(GetUsableModelsRequestSchema, {}))
    const response = await connectUnary({
      origin,
      path: GET_USABLE_MODELS_PATH,
      headers: cursorRequestHeaders(request.accessToken),
      body: payload,
      ...request.signal === undefined ? {} : { signal: request.signal },
    })
    const decoded = fromBinary(GetUsableModelsResponseSchema, response)
    const models = parseUsableModels(decoded.models)
    return models.length > 0 ? models : undefined
  } catch {
    return undefined
  }
}
