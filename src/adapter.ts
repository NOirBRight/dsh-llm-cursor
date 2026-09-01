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
import {
  CURSOR_DEFAULT_CONTEXT_WINDOW,
  CURSOR_EFFORT_LABELS,
  CURSOR_MAX_CONTEXT_WINDOW,
  effortsForCursorModel,
  expandCursorDirectoryRows,
  findCatalogModel,
  isCursorMaxRow,
  resolveCursorDefaultEffort,
  variantMaxMode,
} from './catalog.ts'
import { CURSOR_API_URL } from './identity.ts'
import { ensureFreshSession, isCursorUnauthorized, refreshStoredSession } from './oauth.ts'
import type { CursorOAuthRuntime } from './oauth.ts'
import type { ParkedRun } from './park.ts'
import { runCursorTurn } from './run.ts'
import { CursorRunRegistry, DEFAULT_RUN_LIFECYCLE } from './run-registry.ts'
import type { RunLifecycleOptions } from './run-registry.ts'
import { loadCursorImages } from './history.ts'
import { readSession } from './session.ts'

export { CURSOR_DEFAULT_CONTEXT_WINDOW, CURSOR_MAX_CONTEXT_WINDOW } from './catalog.ts'

export interface CursorConnectionOptions {
  apiURL: string
  models: readonly CursorCatalogModel[]
  streamIdleTimeoutMs: number
  /** Bounded transport and conversation-state lifecycle settings. */
  runLifecycle: RunLifecycleOptions
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

const SANDBOX_MODE_RANK: Record<string, number> = {
  'read-only': 0,
  'workspace-write': 1,
  'danger-full-access': 2,
}

/**
 * Remove sandbox escalation choices that cannot be strictly wider than the
 * current DSH policy. Core still validates every retained request; this only
 * prevents Cursor from selecting an impossible optional enum value.
 * Scans both options.system and context-injected messages.
 */
export function narrowCursorEscalationSchemas(options: GenerateOptions): GenerateOptions {
  const mode = sandboxModeOf(options)
  const currentRank = mode === undefined ? undefined : SANDBOX_MODE_RANK[mode]
  if (currentRank === undefined || options.tools === undefined) return options
  let changed = false
  const tools = options.tools.map((tool) => {
    const parameters = tool.parameters
    const properties = isRecord((parameters as Record<string, unknown>).properties) ? (parameters as Record<string, unknown>).properties as Record<string, unknown> : undefined
    const permission = properties === undefined || !isRecord(properties.sandbox_permissions)
      ? undefined
      : properties.sandbox_permissions as Record<string, unknown>
    if (permission === undefined || !Array.isArray((permission as Record<string, unknown>).enum)) return tool
    const wider = (permission.enum as unknown[]).filter((candidate): candidate is string => {
      return typeof candidate === 'string' && (SANDBOX_MODE_RANK[candidate] ?? -1) > currentRank
    })
    if (wider.length === (permission.enum as unknown[]).length) return tool
    changed = true
    const nextProperties = { ...properties } as Record<string, unknown>
    if (wider.length === 0) {
      delete nextProperties.sandbox_permissions
      delete nextProperties.justification
    } else {
      nextProperties.sandbox_permissions = { ...permission, enum: wider }
    }
    const required = Array.isArray((parameters as Record<string, unknown>).required)
      ? ((parameters as Record<string, unknown>).required as string[]).filter(name => name !== 'sandbox_permissions' && name !== 'justification')
      : undefined
    return {
      ...tool,
      parameters: {
        ...parameters,
        properties: nextProperties,
        ...(required === undefined ? {} : { required }),
      },
    }
  })
  return changed ? { ...options, tools } : options
}

function sandboxModeOf(options: GenerateOptions): string | undefined {
  for (let index = options.messages.length - 1; index >= 0; index -= 1) {
    const message = options.messages[index] as unknown
    if (!isRecord(message)) continue
    const found = sandboxModeIn((message as Record<string, unknown>).content)
    if (found !== undefined) return found
    const fallback = sandboxModeIn(message)
    if (fallback !== undefined) return fallback
  }
  return sandboxModeIn(options.system)
}

function sandboxModeIn(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return /Current DSH file policy:\s*(read-only|workspace-write|danger-full-access)\./u.exec(value)?.[1]
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = sandboxModeIn(item)
      if (found !== undefined) return found
    }
    return undefined
  }
  if (!isRecord(value)) return undefined
  return sandboxModeIn((value as Record<string, unknown>).text) ?? sandboxModeIn((value as Record<string, unknown>).content)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export class CursorAdapter extends LlmAdapter {
  /** Adapter-owned Cursor Run and conversation-binding registry. */
  readonly registry: CursorRunRegistry<ParkedRun>

  constructor(private readonly config: CursorAdapterOptions) {
    super()
    this.registry = new CursorRunRegistry(config.options().runLifecycle, {
      ...config.debug === undefined ? {} : { debug: config.debug },
    })
  }

  override providerInfo(provider: string): LlmProviderInfo {
    return { id: provider, name: 'Cursor' }
  }

  override providerRetryPolicy(_provider: string): ResolvedRetryPolicy | undefined {
    return this.config.options().retryPolicy
  }

  /**
   * Declare neutral request-image pricing so the Host applies its heuristic image pricing.
   * @param _provider - provider route.
   * @param _model - model id.
   * @returns `undefined` so the Host uses heuristic image pricing.
   */
  override imageRequestPricing(_provider: string, _model: string): undefined {
    return undefined
  }

  override async listModels(_provider: string): Promise<readonly LlmModelInfo[]> {
    return this.directory().map(asModelInfo)
  }

  override resolveModel(
    provider: string,
    model: string,
    _signal?: AbortSignal,
  ): Promise<LlmResolvedModelInfo> {
    const directory = this.directory()
    const listed = directory.find(entry => entry.id === model)
    const found = listed ?? findCatalogModel(directory, model)
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
      ...asModelInfo(listed ?? found),
      id: model,
      provider,
      context: {
        contextWindow: isCursorMaxRow(model) || variantMaxMode(found, undefined, model)
          ? CURSOR_MAX_CONTEXT_WINDOW
          : found.contextWindow
            ?? (isCursorMaxRow(found.id) ? CURSOR_MAX_CONTEXT_WINDOW : CURSOR_DEFAULT_CONTEXT_WINDOW),
      },
      ...reasoning === undefined ? {} : { reasoning },
    })
  }

  private directory(): CursorCatalogModel[] {
    return expandCursorDirectoryRows(this.config.options().models)
  }

  /**
   * Resolve a model and create its request-scoped stream factory for Host dispatch.
   * @param provider - provider route copied into the resolved model.
   * @param model - configured Cursor catalog model id.
   * @param signal - optional model-resolution cancellation signal.
   * @returns the resolved model and a stream factory bound to request-scoped connection values.
   */
  override async prepareCall(provider: string, model: string, signal?: AbortSignal) {
    const runtime = this.config.options()
    this.registry.reconfigure(runtime.runLifecycle)
    return {
      model: await this.resolveModel(provider, model, signal),
      stream: (options: GenerateOptions) => this.streamWith(runtime, narrowCursorEscalationSchemas(options)),
    }
  }

  override stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    const runtime = this.config.options()
    this.registry.reconfigure(runtime.runLifecycle)
    return this.streamWith(runtime, narrowCursorEscalationSchemas(options))
  }

  private streamWith(runtime: CursorConnectionOptions, options: GenerateOptions): AsyncIterable<StreamChunk> {
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
          streamIdleTimeoutMs: runtime.streamIdleTimeoutMs,
          ...images.size > 0 ? { images } : {},
          ...self.config.debug === undefined ? {} : { debug: self.config.debug },
        }, self.registry)
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
          if (options.signal?.aborted) throw error
          if (yielded || self.config.refreshApiKey === undefined || !isCursorUnauthorized(error)) throw error
          accessToken = await self.config.refreshApiKey()
          yield* run(accessToken)
        }
      } catch (error) {
        throw error
      }
    })()
  }
}

/**
 * Build a Cursor connection snapshot with stable endpoint, catalog, and lifecycle defaults.
 * @param overrides - required retry/idle settings plus optional connection overrides.
 * @returns resolved connection settings suitable for one adapter request snapshot.
 */
export function defaultCursorConnection(
  overrides: Partial<CursorConnectionOptions> & Pick<CursorConnectionOptions, 'retryPolicy' | 'streamIdleTimeoutMs'>,
): CursorConnectionOptions {
  return {
    apiURL: CURSOR_API_URL,
    models: CURSOR_CATALOG,
    runLifecycle: DEFAULT_RUN_LIFECYCLE,
    ...overrides,
  }
}
