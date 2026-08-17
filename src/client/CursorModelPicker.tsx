/** Frame-level model selection overlay opened by the Cursor settings card. */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { cursorBrandSections, effortsForCursorModel, modelMatchesQuery } from '../catalog-group.ts'
import type { CursorCatalogModel } from '../client-contract.ts'
import type { CursorSettingsKey } from './locales.ts'

export interface CursorModelPickerSnapshot {
  open: boolean
  loading: boolean
  candidates: readonly CursorCatalogModel[]
  picked: ReadonlySet<string>
  error?: string
}

type Listener = () => void
type Adopt = (models: readonly CursorCatalogModel[]) => void

export class CursorModelPickerController {
  private snapshot: CursorModelPickerSnapshot = {
    open: false,
    loading: false,
    candidates: [],
    picked: new Set(),
  }
  private readonly listeners = new Set<Listener>()
  private onAdopt: Adopt | undefined

  getSnapshot = (): CursorModelPickerSnapshot => this.snapshot

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  begin(onAdopt: Adopt, initiallyPicked: ReadonlySet<string> = new Set()): void {
    this.onAdopt = onAdopt
    this.publish({ open: true, loading: true, candidates: [], picked: new Set(initiallyPicked) })
  }

  complete(candidates: readonly CursorCatalogModel[]): void {
    if (!this.snapshot.open || !this.snapshot.loading) return
    const picked = new Set<string>()
    for (const candidate of candidates) {
      if (this.snapshot.picked.has(candidate.id)) {
        picked.add(candidate.id)
        continue
      }
      if (candidate.variants?.some(variant => this.snapshot.picked.has(variant.wireId))) {
        picked.add(candidate.id)
      }
    }
    this.publish({
      open: true,
      loading: false,
      candidates: [...candidates],
      picked,
    })
  }

  fail(message: string): void {
    if (!this.snapshot.open || !this.snapshot.loading) return
    this.publish({ open: true, loading: false, candidates: [], picked: new Set(), error: message })
  }

  close = (): void => {
    this.onAdopt = undefined
    this.publish({ open: false, loading: false, candidates: [], picked: new Set() })
  }

  toggle = (id: string): void => {
    const picked = new Set(this.snapshot.picked)
    if (picked.has(id)) picked.delete(id)
    else picked.add(id)
    this.publish({ ...this.snapshot, picked })
  }

  adopt = (): void => {
    if (this.snapshot.loading || this.snapshot.error !== undefined) return
    const callback = this.onAdopt
    const selected = this.snapshot.candidates.filter(model => this.snapshot.picked.has(model.id))
    this.close()
    callback?.(selected)
  }

  private publish(snapshot: CursorModelPickerSnapshot): void {
    this.snapshot = snapshot
    for (const listener of this.listeners) listener()
  }
}

export interface CursorModelPickerFace {
  t: (key: CursorSettingsKey) => string
  hooks: {
    cursorModelPicker: CursorModelPickerController
  }
  closePicker: () => void
  togglePickerModel: (id: string) => void
  adoptPickerModels: () => void
}

export type CursorModelPickerProps = PropsRuntime<'shell.overlay'> & InjectFace<CursorModelPickerFace>

const rootStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  padding: 24,
}
const maskStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'var(--dsw-alias-bg-mask-1)',
  backdropFilter: 'var(--dsw-mask-blur)',
}
const dialogStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  width: 'min(520px, 100%)',
  maxHeight: 'min(680px, calc(100vh - 48px))',
  overflow: 'hidden',
  border: '1px solid var(--dsw-alias-border-inverted)',
  borderRadius: 24,
  background: 'var(--dsw-alias-bg-layer-2)',
  boxShadow: 'var(--dsw-shadow-lv3)',
  color: 'var(--dsw-alias-label-primary)',
}
const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '22px 14px 12px 24px',
}
const titleStyle: CSSProperties = { margin: 0, fontSize: 16, lineHeight: '24px', fontWeight: 500 }
const closeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  border: 0,
  borderRadius: 8,
  background: 'transparent',
  color: 'var(--dsw-alias-label-secondary)',
  cursor: 'pointer',
  fontSize: 22,
}
const descriptionStyle: CSSProperties = {
  margin: 0,
  padding: '0 24px',
  fontSize: 14,
  lineHeight: '22px',
  color: 'var(--dsw-alias-label-primary)',
}
const searchStyle: CSSProperties = {
  boxSizing: 'border-box',
  width: 'calc(100% - 48px)',
  minHeight: 36,
  margin: '16px 24px 0',
  border: '1px solid var(--dsw-alias-border-l2)',
  borderRadius: 8,
  padding: '7px 10px',
  background: 'var(--dsw-alias-bg-layer-1)',
  color: 'var(--dsw-alias-label-primary)',
  font: 'inherit',
}
const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  minHeight: 0,
  margin: '12px 24px 20px',
  padding: 0,
  overflowY: 'auto',
  listStyle: 'none',
}
const brandHeaderStyle: CSSProperties = {
  padding: '2px 0 0',
  fontSize: 12,
  lineHeight: '18px',
  fontWeight: 600,
  color: 'var(--dsw-alias-label-tertiary)',
}
const brandListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  margin: 0,
  padding: 0,
  listStyle: 'none',
}
const candidateStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 14,
  lineHeight: '22px',
  cursor: 'pointer',
}
const statusStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  minHeight: 96,
  margin: '20px 24px',
  fontSize: 14,
  lineHeight: '22px',
  color: 'var(--dsw-alias-label-secondary)',
}
const errorStyle: CSSProperties = {
  ...statusStyle,
  color: 'var(--dsw-alias-state-error-primary)',
}
const footerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 8,
  padding: '0 24px 24px',
}
const outlineButtonStyle: CSSProperties = {
  height: 36,
  padding: '0 14px',
  border: '1px solid var(--dsw-alias-border-l2)',
  borderRadius: 18,
  background: 'transparent',
  color: 'var(--dsw-alias-label-primary)',
  cursor: 'pointer',
  fontSize: 14,
}

export function CursorModelPicker(props: CursorModelPickerProps): ReactNode {
  const { t } = props
  const snapshot = props.useCursorModelPicker(value => value)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const visible = useMemo(
    () => snapshot.candidates.filter(model => modelMatchesQuery(model, query)),
    [snapshot.candidates, query],
  )
  const sections = useMemo(() => cursorBrandSections(visible), [visible])
  useEffect(() => {
    if (!snapshot.open) setQuery('')
  }, [snapshot.open])
  useEffect(() => {
    if (!snapshot.open) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') props.closePicker()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [snapshot.open, props.closePicker])
  useEffect(() => {
    if (!snapshot.open || snapshot.loading || snapshot.error !== undefined) return
    searchRef.current?.focus()
  }, [snapshot.open, snapshot.loading, snapshot.error])

  if (!snapshot.open) return null
  return createPortal((
    <div style={rootStyle} role="presentation">
      <div style={maskStyle} aria-hidden="true" onClick={props.closePicker} />
      <section
        style={dialogStyle}
        role="dialog"
        aria-modal="true"
        aria-label={t('pickerTitle')}
        aria-busy={snapshot.loading}
      >
        <div style={headerStyle}>
          <h2 style={titleStyle}>{t('pickerTitle')}</h2>
          <button type="button" style={closeStyle} aria-label={t('close')} onClick={props.closePicker}>×</button>
        </div>
        <p style={descriptionStyle}>{t('pickerDescription')}</p>
        {snapshot.loading
          ? <p style={statusStyle} role="status">{t('pickerLoading')}</p>
          : snapshot.error !== undefined
            ? <p style={errorStyle} role="alert">{snapshot.error}</p>
            : (
              <>
                <input
                  ref={searchRef}
                  style={searchStyle}
                  type="search"
                  value={query}
                  placeholder={t('pickerSearch')}
                  aria-label={t('pickerSearch')}
                  onChange={(event) => { setQuery(event.target.value) }}
                />
                {visible.length === 0
                  ? <p style={statusStyle} role="status">{t('pickerEmpty')}</p>
                  : (
                    <ul style={listStyle}>
                      {sections.map((section) => (
                        <li key={section.brand}>
                          <div style={brandHeaderStyle}>
                            {section.brand === 'other' ? t('pickerBrandOther') : section.label}
                          </div>
                          <ul style={brandListStyle}>
                            {section.models.map((model) => {
                              const efforts = effortsForCursorModel(model)
                              return (
                                <li key={model.id}>
                                  <label style={candidateStyle}>
                                    <input
                                      type="checkbox"
                                      checked={snapshot.picked.has(model.id)}
                                      onChange={() => { props.togglePickerModel(model.id) }}
                                    />
                                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                      <span>{model.name ?? model.id}{model.name !== undefined && model.name !== model.id ? ` (${model.id})` : ''}</span>
                                      {model.id === 'default'
                                        ? <span style={{ fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' }}>{t('autoModelHint')}</span>
                                        : efforts.length > 0
                                          ? (
                                            <span style={{ fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' }}>
                                              {t('thinkingLevels').replace('{count}', String(efforts.length))}
                                            </span>
                                          )
                                          : null}
                                    </span>
                                  </label>
                                </li>
                              )
                            })}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
              </>
            )}
        <div style={footerStyle}>
          <button type="button" style={outlineButtonStyle} onClick={props.closePicker}>{t('cancel')}</button>
          <button
            type="button"
            style={{
              ...outlineButtonStyle,
              ...(snapshot.loading || snapshot.error !== undefined
                ? { cursor: 'not-allowed', opacity: 0.4 }
                : {}),
            }}
            disabled={snapshot.loading || snapshot.error !== undefined}
            onClick={props.adoptPickerModels}
          >
            {t('applySelected')}
          </button>
        </div>
      </section>
    </div>
  ), document.body)
}
