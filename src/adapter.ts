/**
 * Cursor subscription chat adapter. Implements LlmAdapter directly.
 */

import { LlmAdapter, LlmError, ReasoningEffortId } from '@deepseek-ai/dsh-llm'
import type {
  GenerateOptions,
  LlmModelInfo,
  LlmProviderInfo,
  LlmResolvedModelInfo,
  ResolvedRetryPolicy,
  StreamChunk,
} from '@deepseek-ai/dsh-llm'
import type { AttachmentStore } from '@deepseek-ai/dsh-attachment'
import { CURSOR_CATALOG, CURSOR_PROVIDER } from './client-contract.ts'
import type { CursorCatalogModel } from './client-contract.ts'
import { CURSOR_API_URL } from './identity.ts'
import { ensureFreshSession } from './oauth.ts'
import type { CursorOAuthRuntime } from './oauth.ts'
import { clearPark } from './park.ts'
import { DEFAULT_HEARTBEAT_INTERVAL_MS, runCursorTurn } from './run.ts'
import { readSession } from './session.ts'

export const CURSOR_DEFAULT_CONTEXT_WINDOW = 200_000
export const CURSOR_DEFAULT_MODEL_MAX_TOKENS = 16_384

export interface CursorConnectionOptions {
  apiURL: string
  models: readonly CursorCatalogModel[]
  streamIdleTimeoutMs: number
  heartbeatIntervalMs: number
  retryPolicy: ResolvedRetryPolicy
}

export interface CursorAdapterOptions {
  options: () => CursorConnectionOptions
  resolveApiKey: () => Promise<string>
  resolveAttachments?: () => AttachmentStore | undefined
  refreshCatalog?: () => Promise<void>
  debug?: (message: string) => void
}

export async function resolveCursorAccessToken(runtime: CursorOAuthRuntime): Promise<string> {
  const path = runtime.resolveSessionPath()
  const existing = await readSession(path)
  const session = await ensureFreshSession(runtime)
  if (session !== undefined) return session.accessToken
  const fromEnv = process.env['CURSOR_ACCESS_TOKEN']
  if (fromEnv !== undefined && fromEnv.length > 0) return fromEnv
  if (existing !== undefined) {
    throw new LlmError(
      'llm-cursor: session refresh failed; sign in again from Plugin configuration',
      'AUTH',
    )
  }
  throw new LlmError(
    'llm-cursor: not signed in; sign in with a Cursor subscription from Plugin configuration',
    'MISSING_CREDENTIAL',
  )
}

function asModelInfo(model: CursorCatalogModel): LlmModelInfo {
  return {
    provider: CURSOR_PROVIDER,
    id: model.id,
    name: model.name ?? model.id,
    ...model.vision === true ? { inputModalities: ['text', 'image'] as const } : { inputModalities: ['text'] as const },
  }
}

const MAX_MODE_EFFORTS = [
  { id: ReasoningEffortId('low'), name: 'Low' },
  { id: ReasoningEffortId('medium'), name: 'Medium' },
  { id: ReasoningEffortId('high'), name: 'High' },
  { id: ReasoningEffortId('max'), name: 'Max' },
] as const

export class CursorAdapter extends LlmAdapter {
  constructor(private readonly config: CursorAdapterOptions) {
    super()
  }

  override providerInfo(provider: string): LlmProviderInfo {
    return { id: provider, name: 'Cursor' }
  }

  override providerRetryPolicy(_provider: string): ResolvedRetryPolicy | undefined {
    return this.config.options().retryPolicy
  }

  override async listModels(_provider: string): Promise<readonly LlmModelInfo[]> {
    await this.config.refreshCatalog?.()
    const models = this.config.options().models
    return (models.length > 0 ? models : CURSOR_CATALOG).map(asModelInfo)
  }

  override resolveModel(
    provider: string,
    model: string,
    _signal?: AbortSignal,
  ): Promise<LlmResolvedModelInfo> {
    const found = this.config.options().models.find(entry => entry.id === model)
      ?? CURSOR_CATALOG.find(entry => entry.id === model)
    if (found === undefined) {
      return Promise.reject(new LlmError(
        `llm-cursor: model ${model} is not in the Cursor catalog`,
        'INVALID_REQUEST',
      ))
    }
    return Promise.resolve({
      ...asModelInfo(found),
      provider,
      context: { contextWindow: CURSOR_DEFAULT_CONTEXT_WINDOW },
      defaultMaxTokens: CURSOR_DEFAULT_MODEL_MAX_TOKENS,
      ...found.maxMode === true
        ? { reasoning: { efforts: MAX_MODE_EFFORTS, defaultEffort: ReasoningEffortId('medium') } }
        : {},
    })
  }

  override stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    const runtime = this.config.options()
    const self = this
    return (async function* () {
      try {
        const accessToken = await self.config.resolveApiKey()
        yield* runCursorTurn(options, {
          apiURL: runtime.apiURL,
          accessToken,
          catalog: runtime.models.length > 0 ? runtime.models : CURSOR_CATALOG,
          heartbeatIntervalMs: runtime.heartbeatIntervalMs,
          streamIdleTimeoutMs: runtime.streamIdleTimeoutMs,
          ...self.config.debug === undefined ? {} : { debug: self.config.debug },
        })
      } catch (error) {
        if (options.signal?.aborted) clearPark(options.sessionId)
        throw error
      }
    })()
  }
}

export function defaultCursorConnection(
  overrides: Partial<CursorConnectionOptions> & Pick<CursorConnectionOptions, 'retryPolicy' | 'streamIdleTimeoutMs'>,
): CursorConnectionOptions {
  return {
    apiURL: CURSOR_API_URL,
    models: CURSOR_CATALOG,
    heartbeatIntervalMs: DEFAULT_HEARTBEAT_INTERVAL_MS,
    ...overrides,
  }
}
