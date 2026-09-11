/** Cursor Plugin configuration card: Host-owned login, usage, and an editable catalog. */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import { CURSOR_EFFORT_LABELS, effortsForCursorModel, groupCursorModels } from '../catalog-group.ts'
import { CURSOR_CATALOG, CURSOR_SETTINGS_NAMESPACE } from '../client-contract.ts'
import type {
  CursorAuthStartReply,
  CursorAuthStatus,
  CursorCatalogModel,
  CursorEffort,
  CursorModelVariant,
  CursorSaveResult,
  CursorSettingsView,
  CursorUsageReply,
  CursorUsageView,
  CursorUsageWindow,
} from '../client-contract.ts'
import type { CursorSettingsKey } from './locales.ts'
import { BrandMark } from './BrandMark.tsx'
import { AuthToolbar, ProviderCardHeader, ProviderQuotaMeter, UsageHeader, UsageResetAt, UsageSkeleton, UsageUpdatedAt, formatUsageClock, providerUiCss, providerQuotaHeaderProps, resetLabelOf, useProviderQuotaCache } from './provider-chrome.tsx'
import type { ProviderQuotaState } from 'dsh-llm-providers-ui/provider-ui'
import { SortableList } from 'dsh-llm-providers-ui/sortable'
import {
  ModelCatalogCapabilities,
  ModelCatalogDetails,
  ModelCatalogRow,
  fieldStyle,
  inputStyle,
  labelStyle,
  modelContentStyle,
  rowInputStyle,
  selectStyle,
} from './model-catalog-ui.tsx'

/** Display name recorded with the cached headline quota. */
const USAGE_PROVIDER_NAME = 'Cursor'

export interface CursorPluginCardFace {
  t: (key: CursorSettingsKey) => string
  hooks: {
    cursorSettings: SettingsScope<CursorSettingsView>
  }
  startAuth: () => Promise<CursorAuthStartReply>
  cancelAuth: (attemptId: string) => Promise<void>
  readAuthStatus: (attemptId?: string) => Promise<CursorAuthStatus>
  logout: () => Promise<void>
  fetchUsage: (refresh?: boolean) => Promise<CursorUsageReply>
  discoverModels: () => Promise<readonly CursorCatalogModel[]>
  saveConfiguration: (settings: CursorSettingsView) => Promise<CursorSaveResult>
  beginModelPicker: (initiallyPicked: ReadonlySet<string>, onAdopt: (models: readonly CursorCatalogModel[]) => void) => void
  completeModelPicker: (candidates: readonly CursorCatalogModel[]) => void
  failModelPicker: (message: string) => void
  closeModelPicker: () => void
}

export type CursorPluginCardProps =
  PropsRuntime<'settings.provider.item'>
  & InjectFace<CursorPluginCardFace>

interface ModelDraft {
  rowId: string
  id: string
  name?: string
  thinking?: boolean
  vision?: boolean
  maxMode?: boolean
  defaultEffort?: CursorEffort
  contextWindow: string
  variants?: CursorModelVariant[]
}

interface Draft {
  models: ModelDraft[]
}

type ModelPatch = {
  [Key in keyof ModelDraft]?: ModelDraft[Key] | undefined
}

type AuthUi =
  | { kind: 'unknown', message?: string }
  | { kind: 'signed-out', message?: string, fallbackUrl?: string }
  | { kind: 'signing-in', fallbackUrl?: string }
  | { kind: 'signed-in', email?: string }

type UsageState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready', usage: CursorUsageView }
  | { status: 'unsupported' }
  | { status: 'error', message: string }

const cardStyle: CSSProperties = {
  overflow: 'visible',
}
const bodyStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  borderTop: '1px solid var(--dsw-alias-border-l2)',
  padding: '16px 14px 18px',
}
const sectionStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 }
const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 600,
  color: 'var(--dsw-alias-label-primary)',
}
const hintStyle: CSSProperties = { margin: 0, fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' }
// labelStyle imported from model-catalog-ui.tsx
const statusStyle: CSSProperties = { margin: 0, fontSize: 13, color: 'var(--dsw-alias-label-secondary)' }
const errorStyle: CSSProperties = { ...statusStyle, color: 'var(--dsw-alias-state-error-primary)' }
const buttonStyle: CSSProperties = {
  alignSelf: 'flex-start',
  minHeight: 34,
  border: '1px solid var(--dsw-alias-border-l2)',
  borderRadius: 18,
  padding: '6px 14px',
  background: 'var(--dsw-alias-bg-layer-1)',
  color: 'var(--dsw-alias-label-primary)',
  font: 'inherit',
  cursor: 'pointer',
}
const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  borderColor: 'var(--dsw-alias-button-primary-fill)',
  background: 'var(--dsw-alias-button-primary-fill)',
  color: 'var(--dsw-alias-label-primary-foreground)',
}
const actionsStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }
// styles imported from model-catalog-ui.tsx
const iconButtonStyle: CSSProperties = {
  boxSizing: 'border-box',
  width: 28,
  height: 28,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 'none',
  border: 0,
  borderRadius: 6,
  padding: 0,
  background: 'transparent',
  color: 'var(--dsw-alias-label-tertiary)',
  font: 'inherit',
  cursor: 'pointer',
}
const disclosureStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  minWidth: 0,
  border: 0,
  padding: 0,
  background: 'transparent',
  color: 'var(--dsw-alias-label-primary)',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
}
// styles imported from model-catalog-ui.tsx

let nextModelRow = 0

function newModelRowId(): string {
  nextModelRow += 1
  return 'cursor-model-row-' + String(nextModelRow)
}

function integerOf(text: string): number | undefined {
  const trimmed = text.trim()
  if (trimmed.length === 0) return undefined
  if (!/^[1-9]\d*$/u.test(trimmed)) return Number.NaN
  return Number(trimmed)
}

function modelDraftOf(model: CursorCatalogModel): ModelDraft {
  // Thinking persistence: explicit false clears defaultEffort; old configs without thinking keep effort and are treated as thinking true if supported.
  const thinking = model.thinking
  const defaultEffort = thinking === false ? undefined : model.defaultEffort
  return {
    rowId: newModelRowId(),
    id: model.id,
    contextWindow: model.contextWindow === undefined ? '' : String(model.contextWindow),
    ...model.name === undefined ? {} : { name: model.name },
    ...thinking === undefined ? {} : { thinking },
    ...model.vision === undefined ? {} : { vision: model.vision },
    ...model.maxMode === undefined ? {} : { maxMode: model.maxMode },
    ...defaultEffort === undefined ? {} : { defaultEffort },
    ...model.variants === undefined ? {} : { variants: model.variants },
  }
}

function draftOf(settings: CursorSettingsView): Draft {
  return {
    models: groupCursorModels(settings.models ?? CURSOR_CATALOG).map(modelDraftOf),
  }
}

function sameDraft(left: Draft, right: Draft): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function modelSettingsOf(draft: ModelDraft): CursorCatalogModel {
  const contextWindow = integerOf(draft.contextWindow)
  const thinking = draft.thinking
  const defaultEffort = thinking === false ? undefined : draft.defaultEffort
  return {
    id: draft.id.trim(),
    ...draft.name === undefined || draft.name.trim().length === 0 ? {} : { name: draft.name.trim() },
    ...thinking === undefined ? {} : { thinking },
    ...draft.vision === undefined ? {} : { vision: draft.vision },
    ...draft.maxMode === undefined ? {} : { maxMode: draft.maxMode },
    ...defaultEffort === undefined ? {} : { defaultEffort },
    ...contextWindow === undefined || Number.isNaN(contextWindow) ? {} : { contextWindow },
    ...draft.variants === undefined || draft.variants.length === 0 ? {} : { variants: [...draft.variants] },
  }
}

function settingsOf(draft: Draft, current: CursorSettingsView): CursorSettingsView {
  return { ...current, models: draft.models.map(modelSettingsOf) }
}

function modelFailure(models: readonly ModelDraft[]): boolean {
  const ids = new Set<string>()
  for (const model of models) {
    const id = model.id.trim()
    if (id.length === 0 || ids.has(id)) return true
    if (Number.isNaN(integerOf(model.contextWindow))) return true
    ids.add(id)
  }
  return false
}

function formatSignedIn(t: CursorPluginCardFace['t'], email: string | undefined): string {
  if (email === undefined) return t('signedInNoEmail')
  return t('signedInAs').replace('{email}', email)
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.length > 0 ? error.message : fallback
}

function Capability({ label, checked, disabled, onChange }: {
  label: string
  checked: boolean
  disabled: boolean
  onChange: (checked: boolean) => void
}): ReactNode {
  return (
    <label style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => { onChange(event.target.checked) }}
      />
      {label}
    </label>
  )
}

function IconChevron({ open }: { open: boolean }): ReactNode {
  return (
    <svg
      width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden
      style={{ flex: 'none', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 120ms ease' }}
    >
      <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrash(): ReactNode {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2.5 4h11M6.5 4V2.5h3V4M4 4l.7 9a1 1 0 001 .9h4.6a1 1 0 001-.9L12 4M6.5 6.8v4.4M9.5 6.8v4.4"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function UsageBar({ usedText, unlimitedText, window: quota }: {
  usedText: string
  unlimitedText: string
  window: CursorUsageWindow
}): ReactNode {
  const label = quota.period === undefined ? quota.id : `${quota.id} (${quota.period})`
  if (quota.limit <= 0 && quota.unit !== 'percent') {
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <span style={labelStyle}>{label}</span>
        <span style={hintStyle}>{`${usedText} ${String(quota.used)} / ${unlimitedText}`}</span>
      </div>
    )
  }
  const remaining = quota.unit === 'percent' ? 100 - quota.used : 100 * (1 - quota.used / quota.limit)
  if (!Number.isFinite(remaining) || remaining < 0 || remaining > 100) {
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <span style={labelStyle}>{label}</span>
        <span style={hintStyle}>{`${usedText} ${String(quota.used)} / ${String(quota.limit)}`}</span>
      </div>
    )
  }
  return <ProviderQuotaMeter remainingPercent={Math.round(remaining * 10) / 10} label={label} />
}

/** Headline remaining quota from real auth values; missing renders no meter, never zero. */
function headlineQuotaOf(view: CursorUsageView | undefined, detail: string | undefined): ProviderQuotaState | undefined {
  const windows = view?.windows ?? [];
  for (const window of windows) {
    if (window.limit <= 0) continue;
    const remaining = window.unit === 'percent' ? 100 - window.used : 100 * (1 - window.used / window.limit);
    if (!Number.isFinite(remaining) || remaining < 0 || remaining > 100) continue;
    return {
      remainingPercent: Math.round(remaining * 10) / 10,
      label: window.period ?? window.id,
      ...(detail === undefined ? {} : { detail }),
    };
  }
  return undefined;
}

export function CursorPluginCard(props: CursorPluginCardProps): ReactNode {
  const { t, startAuth, cancelAuth, readAuthStatus, logout, fetchUsage, discoverModels } = props
  const snapshot = props.useCursorSettings((value: SettingsScopeSnapshot<CursorSettingsView>) => value) as SettingsScopeSnapshot<CursorSettingsView>
  const [open, setOpen] = useState(false)
  const initial = useMemo(() => snapshot.value === undefined ? undefined : draftOf(snapshot.value), [snapshot.value])
  const [source, setSource] = useState<Draft | undefined>(initial)
  const [draft, setDraft] = useState<Draft | undefined>(initial)
  const [sourceRevision, setSourceRevision] = useState<number | undefined>(snapshot.revision)
  const [auth, setAuth] = useState<AuthUi>({ kind: 'unknown' })
  const [authAttemptId, setAuthAttemptId] = useState<string | undefined>()
  const [usage, setUsage] = useState<UsageState>({ status: 'idle' })
  const [lastUsage, setLastUsage] = useState<CursorUsageView | undefined>(undefined)
  const [usageUpdatedAt, setUsageUpdatedAt] = useState<Date | undefined>(undefined)
  /** Drops late usage reads mid-flight across account change and unmount. */
  const usageEpoch = useRef(0)
  /** Parked usage state and in-flight reads belong to the previous account: drop both. */
  const noteAccountChange = (): void => {
    usageEpoch.current += 1
    setLastUsage(undefined)
    setUsageUpdatedAt(undefined)
    setUsage({ status: 'idle' })
  }
  const [busy, setBusy] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [failure, setFailure] = useState<string | undefined>(undefined)
  const [notice, setNotice] = useState<string | undefined>(undefined)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [modelSorting, setModelSorting] = useState(false)
  const [expandedModels, setExpandedModels] = useState<ReadonlySet<string>>(new Set())
  const dirty = source !== undefined && draft !== undefined && !sameDraft(source, draft)
  const title = t('title')

  useEffect(() => {
    if (snapshot.status !== 'ready' || snapshot.value === undefined) return
    if (snapshot.revision === sourceRevision) return
    if (dirty) return
    const next = draftOf(snapshot.value)
    setSource(next)
    setDraft(next)
    setSourceRevision(snapshot.revision)
  }, [dirty, snapshot.revision, snapshot.status, snapshot.value, sourceRevision])

  useEffect(() => () => { props.closeModelPicker() }, [props.closeModelPicker])

  useEffect(() => () => { usageEpoch.current += 1 }, [])

  const loadUsage = async (refresh = false): Promise<void> => {
    const request = usageEpoch.current
    setUsage({ status: 'loading' })
    try {
      const read = await fetchUsage(refresh)
      if (request !== usageEpoch.current) return
      if (read.status === 'logged-out') {
        noteAccountChange()
        setAuth({ kind: 'signed-out' })
        return
      }
      if (read.status === 'unsupported') {
        setUsage({ status: 'unsupported' })
        return
      }
      setLastUsage(read.usage)
      setUsageUpdatedAt(new Date())
      setUsage({ status: 'ready', usage: read.usage })
      rememberHeadlineQuota('llm-cursor', 'Cursor', headlineQuotaOf(read.usage, undefined))
    } catch (error: unknown) {
      if (request !== usageEpoch.current) return
      setUsage({ status: 'error', message: messageOf(error, t('usageFailed')) })
    }
  }

  useEffect(() => {
    let cancelled = false
    const request = usageEpoch.current
    void readAuthStatus().then((status) => {
      if (cancelled || request !== usageEpoch.current) return
      if (status.loggedIn) {
        setAuth({ kind: 'signed-in', ...status.email === undefined ? {} : { email: status.email } })
        return
      }
      setAuth({ kind: 'signed-out' })
      noteAccountChange()
    }).catch(() => {
      if (!cancelled && request === usageEpoch.current) {
        setAuth({ kind: 'unknown', message: t('statusFailed') })
        setUsage({ status: 'idle' })
      }
    })
    return () => { cancelled = true }
  }, [readAuthStatus, t])

  useEffect(() => {
    if (authAttemptId === undefined) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const poll = async (): Promise<void> => {
      try {
        const status = await readAuthStatus(authAttemptId)
        if (cancelled) return
        if (status.loggedIn || status.attempt === 'succeeded') {
          setAuthAttemptId(undefined)
          setAuth({ kind: 'signed-in', ...status.email === undefined ? {} : { email: status.email } })
          noteAccountChange()
          return
        }
        if (status.attempt === 'failed' || status.attempt === 'cancelled') {
          setAuthAttemptId(undefined)
          setAuth({ kind: 'signed-out', message: status.message ?? t('signInFailed') })
          return
        }
        timer = setTimeout(() => { void poll() }, 1000)
      } catch {
        if (!cancelled) timer = setTimeout(() => { void poll() }, 1000)
      }
    }
    window.addEventListener('focus', poll)
    document.addEventListener('visibilitychange', poll)
    void poll()
    return () => {
      cancelled = true
      window.removeEventListener('focus', poll)
      document.removeEventListener('visibilitychange', poll)
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [authAttemptId, readAuthStatus, t])

  // Header quota loads collapsed on sign-in; idle status dedups so expansion never refires.
  useEffect(() => {
    if (auth.kind !== 'signed-in' || usage.status !== 'idle') return
    void loadUsage()
  }, [auth.kind, usage.status])

  if (snapshot.status === 'unavailable') {
    return (
      <li style={cardStyle} data-provider-card="" data-provider-role="llm">
        <style>{providerUiCss}</style>
        <button
          type="button"
          data-provider-card-header=""
          aria-expanded={open}
          aria-label={t(open ? 'collapse' : 'expand') + ': ' + title}
          onClick={() => { setOpen(!open) }}
        >
          <ProviderCardHeader
            title={title}
            mark={<BrandMark />}
            summary={t('summaryModels').replace('{count}', '0')}
            status={t('summaryOff')}
            open={open}
            role="llm"
          />
        </button>
        {open
          ? (
            <div style={bodyStyle} data-provider-body="">
              <p style={statusStyle} role="status">{t('settingsUnavailable')}</p>
            </div>
          )
          : null}
      </li>
    )
  }

  const disabled = snapshot.status !== 'ready' || !snapshot.writable || busy || auth.kind === 'signing-in'
  const customModels = snapshot.user !== undefined
    && Object.prototype.hasOwnProperty.call(snapshot.user, 'models')
  const invalid = draft !== undefined && modelFailure(draft.models)

  const patchDraft = (next: Partial<Draft>): void => {
    setDraft(current => current === undefined ? current : { ...current, ...next })
    setFailure(undefined)
    setNotice(undefined)
  }
  const patchModel = (index: number, patch: ModelPatch): void => {
    if (draft === undefined) return
    patchDraft({
      models: draft.models.map((model, at) => {
        if (at !== index) return model
        const next: ModelDraft = { ...model }
        if (patch.id !== undefined) next.id = patch.id
        if ('name' in patch) {
          if (patch.name === undefined) delete next.name
          else next.name = patch.name
        }
        if ('thinking' in patch) {
          if (patch.thinking === undefined) delete next.thinking
          else next.thinking = patch.thinking
          if (patch.thinking === false) delete next.defaultEffort
        }
        if ('vision' in patch) {
          if (patch.vision === undefined) delete next.vision
          else next.vision = patch.vision
        }
        if ('maxMode' in patch) {
          if (patch.maxMode === undefined) delete next.maxMode
          else next.maxMode = patch.maxMode
        }
        if ('defaultEffort' in patch) {
          if (patch.defaultEffort === undefined) delete next.defaultEffort
          else next.defaultEffort = patch.defaultEffort
        }
        return next
      }),
    })
  }
  const removeModel = (index: number): void => {
    if (draft === undefined) return
    patchDraft({ models: draft.models.filter((_, at) => at !== index) })
  }
  const toggleModel = (key: string): void => {
    setExpandedModels((current) => {
      const next = new Set(current)
      if (!next.delete(key)) next.add(key)
      return next
    })
  }

  const onSignIn = async (): Promise<void> => {
    setAuth({ kind: 'signing-in' })
    noteAccountChange()
    try {
      const started = await startAuth()
      if (!started.ok) {
        setAuth({ kind: 'signed-out', message: started.message || t('signInFailed'), ...started.fallbackUrl === undefined ? {} : { fallbackUrl: started.fallbackUrl } })
        return
      }
      if ('attemptId' in started) {
        setAuthAttemptId(started.attemptId)
        setAuth({ kind: 'signing-in', ...started.popupBlocked && started.fallbackUrl !== undefined ? { fallbackUrl: started.fallbackUrl } : {} })
        return
      }
      const status = await readAuthStatus()
      if (status.loggedIn) noteAccountChange()
      setAuth(status.loggedIn
        ? { kind: 'signed-in', ...status.email === undefined ? {} : { email: status.email } }
        : { kind: 'signed-out', message: t('signInFailed') })
    } catch {
      setAuth({ kind: 'signed-out', message: t('signInFailed') })
    }
  }

  const onCancelSignIn = async (): Promise<void> => {
    if (authAttemptId === undefined) return
    try { await cancelAuth(authAttemptId) } catch { /* best-effort cancellation */ }
    setAuthAttemptId(undefined)
    setAuth({ kind: 'signed-out' })
  }

  const onSignOut = async (): Promise<void> => {
    try {
      await logout()
      setAuth({ kind: 'signed-out' })
      noteAccountChange()
    } catch {
      setAuth(current => current.kind === 'signed-in'
        ? current
        : { kind: 'signed-out', message: t('signOutFailed') })
    }
  }

  const fetchModels = async (): Promise<void> => {
    if (draft === undefined) return
    if (auth.kind !== 'signed-in') {
      setFailure(t('fetchNeedsSignIn'))
      return
    }
    const currentModels = draft.models.map(modelSettingsOf)
    const initiallyPicked = new Set<string>()
    for (const model of currentModels) {
      initiallyPicked.add(model.id)
      for (const variant of model.variants ?? []) initiallyPicked.add(variant.wireId)
    }
    setFetching(true)
    setFailure(undefined)
    setNotice(undefined)
    props.beginModelPicker(initiallyPicked, selected => {
      setDraft(current => {
        if (current === undefined) return current
        const currentById = new Map(current.models.map(model => [model.id.trim(), model]))
        const next = new Map<string, ModelDraft>()
        for (const candidate of selected) {
          const existing = currentById.get(candidate.id)
          const discovered = modelDraftOf(candidate)
          const efforts = effortsForCursorModel(candidate)
          const kept = existing?.defaultEffort !== undefined && efforts.includes(existing.defaultEffort)
            ? existing.defaultEffort
            : discovered.defaultEffort
          next.set(candidate.id, existing === undefined
            ? discovered
            : {
              ...existing,
              ...discovered,
              rowId: existing.rowId,
              ...kept === undefined ? {} : { defaultEffort: kept },
            })
        }
        return { ...current, models: [...next.values()] }
      })
      setCatalogOpen(true)
      setFailure(undefined)
      setNotice(undefined)
    })
    try {
      const found = await discoverModels()
      if (found.length === 0) {
        const message = t('fetchEmpty')
        props.failModelPicker(message)
        setFailure(message)
        return
      }
      const foundWires = new Set(found.flatMap(model => [
        model.id,
        ...(model.variants?.map(variant => variant.wireId) ?? []),
      ]))
      const currentOnly = currentModels.filter(model => (
        !foundWires.has(model.id)
        && !(model.variants?.some(variant => foundWires.has(variant.wireId)) ?? false)
      ))
      props.completeModelPicker(groupCursorModels([...found, ...currentOnly], 'brand'))
    } catch (error: unknown) {
      const message = messageOf(error, t('requestFailed'))
      props.failModelPicker(message)
      setFailure(message)
    } finally {
      setFetching(false)
    }
  }

  const discard = (): void => {
    if (source !== undefined) setDraft(structuredClone(source))
    setFailure(undefined)
    setNotice(undefined)
  }

  const save = async (): Promise<void> => {
    if (draft === undefined || snapshot.value === undefined || invalid) return
    setBusy(true)
    setFailure(undefined)
    setNotice(undefined)
    try {
      const accepted = await props.saveConfiguration(settingsOf(draft, snapshot.value))
      const next = draftOf(accepted.settings)
      setSource(next)
      setDraft(next)
      setSourceRevision(accepted.revision)
      setNotice(t('saved'))
    } catch (error: unknown) {
      setFailure(messageOf(error, t('requestFailed')))
    } finally {
      setBusy(false)
    }
  }

  const statusLabel = auth.kind === 'unknown'
    ? auth.message ?? t('loading')
    : auth.kind === 'signing-in'
      ? t('signingIn')
      : auth.kind === 'signed-in'
        ? formatSignedIn(t, auth.email)
        : auth.message ?? t('signedOut')
  const modelCount = draft?.models.length ?? snapshot.value?.models?.length ?? 0
  const headerCount = t('summaryModels').replace('{count}', String(modelCount))
  const usageView = usage.status === 'ready' ? usage.usage : lastUsage
  const liveQuota = auth.kind === 'signed-in'
    ? headlineQuotaOf(usageView, resetLabelOf(usageView?.resetsAt, { at: t('usageResetAt'), atDays: t('usageResetAtDays') }))
    : undefined
  // The account read settles into "unknown" while it is still pending, so a cached
  // meter paints on the first frame; a settled failure withholds the meter instead of
  // showing a stale percent, and only a known sign-out drops the stored entry.
  const withheld = auth.kind === 'signed-out' || auth.kind === 'signing-in'
    || usage.status === 'error' || usage.status === 'unsupported'
  const headerQuota = useProviderQuotaCache(CURSOR_SETTINGS_NAMESPACE, USAGE_PROVIDER_NAME, liveQuota ?? null, {
    answered: auth.kind !== 'unknown',
    signedOut: auth.kind === 'signed-out',
    withheld,
  })

  return (
    <li style={cardStyle} data-provider-card="" data-provider-role="llm">
      <style>{providerUiCss}</style>
      <button
        type="button"
        data-provider-card-header=""
        aria-expanded={open}
        aria-label={t(open ? 'collapse' : 'expand') + ': ' + title}
        onClick={() => { setOpen(!open) }}
      >
        <ProviderCardHeader
          title={title}
          mark={<BrandMark />}
          summary={headerCount}
          status={statusLabel}
          open={open}
          unsaved={dirty}
          unsavedLabel={t('unsaved')}
          role="llm"
          {...providerQuotaHeaderProps(headerQuota, {
            dashLabel: t('usage'),
            settled: auth.kind === 'signed-in' && (usage.status === 'error' || usage.status === 'unsupported'),
          })}
        />
      </button>
      {open
        ? (
          <div style={bodyStyle} data-provider-body="">
            <p style={hintStyle}>{t('description')}</p>
            {snapshot.status === 'loading' ? <p style={statusStyle}>{t('loading')}</p> : null}
            {snapshot.status === 'ready' && !snapshot.writable ? <p style={statusStyle}>{t('readOnly')}</p> : null}
            <section style={sectionStyle} aria-label={statusLabel}>
              <AuthToolbar
                status={<p style={{ ...statusStyle, margin: 0 }}>{statusLabel}</p>}
                action={auth.kind === 'signed-in'
                  ? <button type="button" style={buttonStyle} disabled={busy} onClick={() => { void onSignOut() }}>{t('signOut')}</button>
                  : auth.kind === 'signing-in'
                    ? <>{auth.fallbackUrl !== undefined ? <button type="button" style={buttonStyle} onClick={() => { window.open(auth.fallbackUrl, '_blank') }}>{t('signIn')}</button> : null}<button type="button" style={buttonStyle} onClick={() => { void onCancelSignIn() }}>{t('cancel')}</button></>
                    : <button type="button" style={buttonStyle} disabled={busy} onClick={() => { void onSignIn() }}>{t('signIn')}</button>}
              />
              {auth.kind === 'signed-out' && auth.fallbackUrl !== undefined
                ? <button type="button" style={buttonStyle} onClick={() => { window.open(auth.fallbackUrl, '_blank') }}>{t('signIn')}</button>
                : null}
            </section>
            {auth.kind === 'signed-in'
              ? (
                <section style={sectionStyle} aria-label={t('usage')}>
                  <UsageHeader
                    title={t('usage')}
                    spinning={usage.status === 'loading' || usage.status === 'idle'}
                    disabled={usage.status === 'loading'}
                    refreshLabel={t('usageRefresh')}
                    busyLabel={t('usageLoading')}
                    {...usage.status === 'error' ? { error: t('usageRefreshFailed') } : {}}
                    onRefresh={() => { void loadUsage(true) }}
                  />
                  {(() => {
                    if (usage.status === 'loading' || usage.status === 'idle') {
                      return <UsageSkeleton rows={lastUsage?.windows.length ?? 2} />
                    }
                    const bars = usage.status === 'ready' ? usage.usage : lastUsage
                    if (bars !== undefined) {
                      return (
                        <>
                          {bars.windows.map((window, index) => (
                            <UsageBar
                              key={window.id + ':' + String(index)}
                              usedText={t('usageUsed')}
                              unlimitedText={t('usageUnlimited')}
                              window={window}
                            />
                          ))}
                          <UsageResetAt
                            label={resetLabelOf(bars.resetsAt, {
                              at: t('usageResetAt'),
                              atDays: t('usageResetAtDays'),
                            })}
                          />
                        </>
                      )
                    }
                    if (usage.status === 'unsupported') return <p style={hintStyle}>{t('usageUnsupported')}</p>
                    if (usage.status === 'error') return <p style={errorStyle}>{usage.message}</p>
                    return <UsageSkeleton rows={2} />
                  })()}
                  <UsageUpdatedAt
                    at={usageUpdatedAt}
                    label={usageUpdatedAt === undefined ? '' : t('usageUpdatedAt').replace('{time}', formatUsageClock(usageUpdatedAt))}
                  />
                </section>
              )
              : null}
            {draft === undefined
              ? null
              : (
                <section style={sectionStyle} aria-label={t('models')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <button
                      type="button"
                      style={disclosureStyle}
                      aria-expanded={catalogOpen}
                      aria-label={t('models')}
                      onClick={() => { setCatalogOpen(!catalogOpen) }}
                    >
                      <IconChevron open={catalogOpen} />
                      <span style={sectionTitleStyle}>{t('models')}</span>
                      <span style={hintStyle}>{customModels ? t('customized') : t('inherited')}</span>
                    </button>
                    <span style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        type="button"
                        style={buttonStyle}
                        aria-pressed={modelSorting}
                        disabled={disabled || draft.models.length < 2}
                        onClick={() => { setModelSorting(current => !current) }}
                      >
                        {t(modelSorting ? 'doneSorting' : 'sortModels')}
                      </button>
                      <button
                        type="button"
                        style={buttonStyle}
                        disabled={fetching || snapshot.status !== 'ready' || auth.kind !== 'signed-in'}
                        onClick={() => { void fetchModels() }}
                      >
                        {t(fetching ? 'fetchingModels' : 'fetchModels')}
                      </button>
                    </span>
                  </div>
                  {catalogOpen
                    ? (
                      <>
                        <SortableList
                          items={draft.models}
                          getId={model => model.rowId}
                          disabled={disabled}
                          sorting={modelSorting}
                          dragLabel={(model, index) => {
                            const label = model.id.trim().length > 0 ? model.id.trim() : String(index + 1)
                            return t('dragModel') + ': ' + label
                          }}
                          moveButtons
                          moveUpLabel={(model, index) => {
                            const label = model.id.trim().length > 0 ? model.id.trim() : String(index + 1)
                            return t('moveUp') + ': ' + label
                          }}
                          moveDownLabel={(model, index) => {
                            const label = model.id.trim().length > 0 ? model.id.trim() : String(index + 1)
                            return t('moveDown') + ': ' + label
                          }}
                          onReorder={(models) => { patchDraft({ models }) }}
                          renderItem={(model, index) => {
                            const expanded = expandedModels.has(model.rowId)
                            const label = model.id.trim().length > 0 ? model.id.trim() : String(index + 1)
                            const efforts = effortsForCursorModel(modelSettingsOf(model))
                            return (
                              <div data-model-row={label} data-provider-model="" style={modelContentStyle}>
                                <input
                                  style={rowInputStyle}
                                  value={model.id}
                                  placeholder={t('modelId')}
                                  aria-label={t('modelId') + ' ' + String(index + 1)}
                                  disabled={disabled}
                                  onChange={(event) => { patchModel(index, { id: event.target.value }) }}
                                />
                                <input
                                  style={rowInputStyle}
                                  value={model.name ?? ''}
                                  placeholder={t('modelName')}
                                  aria-label={t('modelName') + ' ' + String(index + 1)}
                                  disabled={disabled}
                                  onChange={(event) => { patchModel(index, { name: event.target.value || undefined }) }}
                                />
                                <button
                                  type="button"
                                  style={iconButtonStyle}
                                  aria-label={t('modelDetails') + ': ' + label}
                                  aria-expanded={expanded}
                                  title={t('modelDetails')}
                                  onClick={() => { toggleModel(model.rowId) }}
                                >
                                  <IconChevron open={expanded} />
                                </button>
                                <button
                                  type="button"
                                  style={iconButtonStyle}
                                  aria-label={t('remove') + ' ' + label}
                                  title={t('remove')}
                                  disabled={disabled}
                                  onClick={() => { removeModel(index) }}
                                >
                                  <IconTrash />
                                </button>
                                {expanded
                                  ? (
                                    <ModelCatalogDetails>
                                      <ModelCatalogRow>
                                        <label style={fieldStyle}>
                                          <span style={labelStyle}>{t('contextWindow')}</span>
                                          <input
                                            style={inputStyle}
                                            inputMode="numeric"
                                            placeholder={t('contextWindowDefault')}
                                            value={model.contextWindow}
                                            disabled={disabled}
                                            aria-label={t('contextWindow')}
                                            onChange={(event) => { patchModel(index, { contextWindow: event.target.value }) }}
                                          />
                                        </label>
                                      </ModelCatalogRow>
                                      <ModelCatalogCapabilities>
                                        <Capability label={t('vision')} checked={model.vision === true} disabled={disabled} onChange={(vision) => { patchModel(index, { vision }) }} />
                                        <Capability label={t('thinking')} checked={model.thinking === true} disabled={disabled} onChange={(thinking) => { patchModel(index, { thinking }) }} />
                                        {efforts.length > 0
                                          ? (
                                            <label style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                              {t('defaultEffort')}
                                              <select
                                                style={selectStyle}
                                                value={model.defaultEffort ?? efforts[0] ?? ''}
                                                disabled={disabled || model.thinking === false}
                                                aria-label={t('defaultEffort') + ' ' + label}
                                                onChange={(event) => {
                                                  const value = event.target.value
                                                  const effort = efforts.find(entry => entry === value)
                                                  patchModel(index, { defaultEffort: effort })
                                                }}
                                              >
                                                {efforts.map(effort => (
                                                  <option key={effort} value={effort}>{CURSOR_EFFORT_LABELS[effort]}</option>
                                                ))}
                                              </select>
                                            </label>
                                          )
                                          : null}
                                      </ModelCatalogCapabilities>
                                    </ModelCatalogDetails>
                                  )
                                  : null}
                              </div>
                            )
                          }}
                        />
                        <button
                          type="button"
                          style={{ ...buttonStyle, alignSelf: 'flex-start' }}
                          disabled={disabled}
                          onClick={() => {
                            const model: ModelDraft = { rowId: newModelRowId(), id: '', contextWindow: '' }
                            patchDraft({ models: [...draft.models, model] })
                            setExpandedModels(current => new Set(current).add(model.rowId))
                          }}
                        >
                          {t('addModel')}
                        </button>
                      </>
                    )
                    : null}
                </section>
              )}

            {invalid ? <p style={errorStyle}>{t('invalidModel')}</p> : null}
            {failure === undefined ? null : <p style={errorStyle}>{failure}</p>}
            {notice === undefined ? null : <p style={statusStyle}>{notice}</p>}
            <div style={actionsStyle}>
              <button type="button" style={buttonStyle} disabled={!dirty || busy} onClick={discard}>{t('discard')}</button>
              <button
                type="button"
                style={primaryButtonStyle}
                disabled={!dirty || invalid || disabled}
                onClick={() => { void save() }}
              >
                {t(busy ? 'saving' : 'save')}
              </button>
            </div>
          </div>
        )
        : null}
    </li>
  )
}