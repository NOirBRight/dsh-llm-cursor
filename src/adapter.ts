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
import { CURSOR_EFFORT_LABELS, effortsForCursorModel, findCatalogModel, resolveCursorDefaultEffort } from './catalog.ts'
import { CURSOR_API_URL } from './identity.ts'
import { ensureFreshSession, isCursorUnauthorized, refreshStoredSession } from './oauth.ts'
import type { CursorOAuthRuntime } from './oauth.ts'
import { clearPark } from './park.ts'
import { DEFAULT_HEARTBEAT_INTERVAL_MS, runCursorTurn } from './run.ts'
import { loadCursorImages } from './history.ts'
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
  refreshApiKey?: () => Promise<string>
  resolveAttachments?: () => AttachmentStore | undefined
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

export async function refreshCursorAccessToken(runtime: CursorOAuthRuntime): Promise<string> {
  try {
    const session = await refreshStoredSession(runtime)
    return session.accessToken
  } catch {
    throw new LlmError(
      'llm-cursor: session refresh failed; sign in again from Plugin configuration',
      'AUTH',
    )
  }
}

function asModelInfo(model: CursorCatalogModel): LlmModelInfo {
  return {
    provider: CURSOR_PROVIDER,
    id: model.id,
    name: model.name ?? model.id,
    ...model.vision === true ? { inputModalities: ['text', 'image'] as const } : { inputModalities: ['text'] as const },
  }
}

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
    return this.config.options().models.map(asModelInfo)
  }

  override resolveModel(
    provider: string,
    model: string,
    _signal?: AbortSignal,
  ): Promise<LlmResolvedModelInfo> {
    const found = findCatalogModel(this.config.options().models, model)
    if (found === undefined) {
      return Promise.reject(new LlmError(
        `llm-cursor: model ${model} is not in the Cursor catalog`,
        'INVALID_REQUEST',
      ))
    }
    const efforts = effortsForCursorModel(found)
    const defaultEffort = resolveCursorDefaultEffort(found)
    const reasoning = efforts.length > 0 && defaultEffort !== undefined
      ? {
        efforts: efforts.map(effort => ({
          id: ReasoningEffortId(effort),
          name: CURSOR_EFFORT_LABELS[effort],
        })),
        defaultEffort: ReasoningEffortId(defaultEffort),
      }
      : undefined
    return Promise.resolve({
      ...asModelInfo(found),
      provider,
      context: { contextWindow: CURSOR_DEFAULT_CONTEXT_WINDOW },
      defaultMaxTokens: CURSOR_DEFAULT_MODEL_MAX_TOKENS,
      ...reasoning === undefined ? {} : { reasoning },
    })
  }

  override stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    const runtime = this.config.options()
    const self = this
    return (async function* () {
      const run = async function* (accessToken: string): AsyncGenerator<StreamChunk> {
        const images = await loadCursorImages(
          options.messages,
          self.config.resolveAttachments?.(),
          options.signal,
        )
        yield* runCursorTurn(options, {
          apiURL: runtime.apiURL,
          accessToken,
          catalog: runtime.models,
          heartbeatIntervalMs: runtime.heartbeatIntervalMs,
          streamIdleTimeoutMs: runtime.streamIdleTimeoutMs,
          ...images.size > 0 ? { images } : {},
          ...self.config.debug === undefined ? {} : { debug: self.config.debug },
        })
      }
      try {
        let accessToken = await self.config.resolveApiKey()
        let yielded = false
        try {
          for await (const chunk of run(accessToken)) {
            yielded = true
            yield chunk
          }
          return
        } catch (error) {
          if (options.signal?.aborted) {
            clearPark(options.sessionId)
            throw error
          }
          if (yielded || self.config.refreshApiKey === undefined || !isCursorUnauthorized(error)) throw error
          accessToken = await self.config.refreshApiKey()
          yield* run(accessToken)
        }
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
