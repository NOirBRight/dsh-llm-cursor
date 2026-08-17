/**
 * Collapse Cursor thinking-level wire ids into one family row.
 * Fast SKUs stay their own family (`gpt-5.2-fast`). Fetch sorts Auto, then
 * Cursor (Composer, Cursor Grok, and other first-party SKUs), then other
 * brands, with each standard model beside its Fast sibling.
 * A saved catalog keeps input order so drag-reorder survives reload.
 * Browser-safe: the plugin card and Host adapter share this module.
 */

import type { CursorCatalogModel, CursorEffort, CursorModelVariant } from './client-contract.ts'

/** Picker suffix for a first-class Max / 1M row. Avoids colliding with effort `-max`. */
export const CURSOR_MAX_SUFFIX = '-1m'
/** Ordinary Cursor request budget. */
export const CURSOR_DEFAULT_CONTEXT_WINDOW = 200_000
/** DSH budget for Max rows. Cursor does not disclose the real ceiling. */
export const CURSOR_MAX_CONTEXT_WINDOW = 1_000_000

export function isCursorMaxRow(id: string): boolean {
  return id.endsWith(CURSOR_MAX_SUFFIX) && id.length > CURSOR_MAX_SUFFIX.length
}

export function cursorBaseFamilyId(id: string): string {
  return isCursorMaxRow(id) ? id.slice(0, -CURSOR_MAX_SUFFIX.length) : id
}

export const CURSOR_EFFORT_ORDER: readonly CursorEffort[] = [
  'none', 'low', 'medium', 'high', 'xhigh', 'max',
]

export const CURSOR_EFFORT_LABELS: Record<CursorEffort, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  xhigh: 'Extra High',
  max: 'Max',
}

const WIRE_SUFFIXES: readonly { suffix: string, effort?: CursorEffort, fast: boolean }[] = [
  { suffix: '-none-fast', effort: 'none', fast: true },
  { suffix: '-low-fast', effort: 'low', fast: true },
  { suffix: '-medium-fast', effort: 'medium', fast: true },
  { suffix: '-high-fast', effort: 'high', fast: true },
  { suffix: '-xhigh-fast', effort: 'xhigh', fast: true },
  { suffix: '-max-fast', effort: 'max', fast: true },
  { suffix: '-none', effort: 'none', fast: false },
  { suffix: '-low', effort: 'low', fast: false },
  { suffix: '-medium', effort: 'medium', fast: false },
  { suffix: '-high', effort: 'high', fast: false },
  { suffix: '-xhigh', effort: 'xhigh', fast: false },
  { suffix: '-max', effort: 'max', fast: false },
  { suffix: '-fast', fast: true },
]

export function splitCursorWireId(id: string): { family: string, effort?: CursorEffort, fast: boolean } {
  for (const entry of WIRE_SUFFIXES) {
    if (!id.endsWith(entry.suffix) || id.length <= entry.suffix.length) continue
    const base = id.slice(0, -entry.suffix.length)
    return {
      family: entry.fast ? `${base}-fast` : base,
      ...entry.effort === undefined ? {} : { effort: entry.effort },
      fast: entry.fast,
    }
  }
  return { family: id, fast: false }
}

export function cleanFamilyName(name: string): string {
  return name
    .replace(/\s+1M\b/giu, '')
    .replace(/\s+(?:None|Low|Medium|High|Extra High|Max)\b/giu, '')
    .replace(/\s+/gu, ' ')
    .trim()
}

interface RawRow {
  wireId: string
  name: string
  thinking: boolean
  maxMode: boolean
  family: string
  effort?: CursorEffort
  fast: boolean
}

function rawRowsOf(models: readonly CursorCatalogModel[]): RawRow[] {
  const rows: RawRow[] = []
  for (const model of models) {
    if (model.variants !== undefined && model.variants.length > 0) {
      for (const variant of model.variants) {
        const split = splitCursorWireId(variant.wireId)
        const effort = variant.effort ?? split.effort
        rows.push({
          wireId: variant.wireId,
          name: model.name ?? model.id,
          thinking: model.thinking === true,
          maxMode: variant.maxMode === true,
          family: isCursorMaxRow(model.id) ? model.id : split.family,
          ...effort === undefined ? {} : { effort },
          fast: variant.fast === true || split.fast,
        })
      }
      continue
    }
    const split = splitCursorWireId(model.id)
    rows.push({
      wireId: model.id,
      name: model.name ?? model.id,
      thinking: model.thinking === true,
      maxMode: model.maxMode === true,
      family: split.family,
      ...split.effort === undefined ? {} : { effort: split.effort },
      fast: split.fast,
    })
  }
  return rows
}

function clusterOf(family: string): string {
  const base = cursorBaseFamilyId(family)
  return base.endsWith('-fast') ? base.slice(0, -5) : base
}

const BRAND_RANK = {
  cursor: 1,
  openai: 2,
  anthropic: 3,
  google: 4,
  xai: 5,
  deepseek: 6,
  moonshot: 7,
  zhipu: 8,
  minimax: 9,
  mistral: 10,
  meta: 11,
  alibaba: 12,
  other: 99,
} as const

export type CursorModelBrand = keyof typeof BRAND_RANK

/** Infer the lab / first-party brand from a family id and display name. */
export function brandOfCursorFamily(familyId: string, name = ''): CursorModelBrand {
  const id = clusterOf(familyId).toLowerCase()
  const label = name.toLowerCase()
  if (id === 'default' || id.startsWith('composer') || id.startsWith('cursor-')) return 'cursor'
  if (id.startsWith('grok') || /\bgrok\b/u.test(label)) return 'xai'
  if (id.startsWith('gpt') || id.startsWith('chatgpt') || /^o[1-9]/u.test(id) || /\bgpt-/u.test(label)) return 'openai'
  if (id.startsWith('claude') || label.includes('claude')) return 'anthropic'
  if (id.startsWith('gemini') || label.includes('gemini')) return 'google'
  if (id.startsWith('deepseek') || label.includes('deepseek')) return 'deepseek'
  if (id.startsWith('kimi') || label.includes('kimi')) return 'moonshot'
  if (id.startsWith('glm') || label.includes('glm')) return 'zhipu'
  if (id.startsWith('minimax') || label.includes('minimax')) return 'minimax'
  if (
    id.startsWith('mistral')
    || id.startsWith('codestral')
    || id.startsWith('devstral')
    || id.startsWith('magistral')
    || id.startsWith('pixtral')
  ) return 'mistral'
  if (id.startsWith('llama') || label.includes('llama')) return 'meta'
  if (id.startsWith('qwen') || label.includes('qwen')) return 'alibaba'
  return 'other'
}

export const CURSOR_BRAND_LABELS: Record<CursorModelBrand, string> = {
  cursor: 'Cursor',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  xai: 'xAI',
  deepseek: 'DeepSeek',
  moonshot: 'Moonshot',
  zhipu: 'Zhipu',
  minimax: 'MiniMax',
  mistral: 'Mistral',
  meta: 'Meta',
  alibaba: 'Alibaba',
  other: 'Other',
}

export interface CursorBrandSection {
  brand: CursorModelBrand
  label: string
  models: CursorCatalogModel[]
}

/** Partition an already-sorted catalog into brand sections for the picker. */
export function cursorBrandSections(models: readonly CursorCatalogModel[]): CursorBrandSection[] {
  const sections: CursorBrandSection[] = []
  const index = new Map<CursorModelBrand, CursorBrandSection>()
  for (const model of models) {
    const brand = brandOfCursorFamily(model.id, model.name ?? '')
    let section = index.get(brand)
    if (section === undefined) {
      section = { brand, label: CURSOR_BRAND_LABELS[brand], models: [] }
      index.set(brand, section)
      sections.push(section)
    }
    section.models.push(model)
  }
  return sections
}

export type CursorCatalogSort = 'stable' | 'brand'

function compareFamilyName(left: string, right: string): number {
  return left.localeCompare(right, 'en', { numeric: true, sensitivity: 'base' })
}

function sortGroupedFamilies(
  grouped: CursorCatalogModel[],
  firstIndex: ReadonlyMap<string, number>,
  sort: CursorCatalogSort,
): CursorCatalogModel[] {
  const clusterRank = (id: string): number => {
    const cluster = clusterOf(id)
    const standard = firstIndex.get(cluster) ?? Number.POSITIVE_INFINITY
    const fast = firstIndex.get(`${cluster}-fast`) ?? Number.POSITIVE_INFINITY
    return Math.min(standard, fast)
  }
  return [...grouped].sort((left, right) => {
    if (left.id === 'default') return -1
    if (right.id === 'default') return 1
    if (sort === 'brand') {
      const brand = BRAND_RANK[brandOfCursorFamily(left.id, left.name ?? '')]
        - BRAND_RANK[brandOfCursorFamily(right.id, right.name ?? '')]
      if (brand !== 0) return brand
      const family = compareFamilyName(clusterOf(left.id), clusterOf(right.id))
      if (family !== 0) return family
    } else {
      const rank = clusterRank(left.id) - clusterRank(right.id)
      if (rank !== 0) return rank
    }
    const leftFast = cursorBaseFamilyId(left.id).endsWith('-fast') ? 1 : 0
    const rightFast = cursorBaseFamilyId(right.id).endsWith('-fast') ? 1 : 0
    if (leftFast !== rightFast) return leftFast - rightFast
    const leftMax = isCursorMaxRow(left.id) ? 1 : 0
    const rightMax = isCursorMaxRow(right.id) ? 1 : 0
    if (leftMax !== rightMax) return leftMax - rightMax
    return compareFamilyName(left.name ?? left.id, right.name ?? right.id)
  })
}

export function groupCursorModels(
  models: readonly CursorCatalogModel[],
  sort: CursorCatalogSort = 'stable',
): CursorCatalogModel[] {
  const rows = rawRowsOf(models)
  const families = new Map<string, RawRow[]>()
  const firstIndex = new Map<string, number>()
  rows.forEach((row, index) => {
    const list = families.get(row.family) ?? []
    list.push(row)
    families.set(row.family, list)
    if (!firstIndex.has(row.family)) firstIndex.set(row.family, index)
  })
  const grouped: CursorCatalogModel[] = []
  for (const [family, members] of families) {
    const hasExplicitEffort = members.some(member => member.effort !== undefined)
    const variants: CursorModelVariant[] = members.map((member) => {
      const effort = member.effort ?? (hasExplicitEffort ? 'medium' : undefined)
      return {
        wireId: member.wireId,
        ...effort === undefined ? {} : { effort },
        ...member.fast ? { fast: true } : {},
        ...member.maxMode ? { maxMode: true } : {},
      }
    })
    const preferred = members.find(member => member.effort === undefined || member.effort === 'medium')
      ?? members[0]
    const name = cleanFamilyName(preferred?.name ?? family) || family
    const efforts = new Set(variants.map(variant => variant.effort).filter((effort): effort is CursorEffort => effort !== undefined))
    const thinking = members.some(member => member.thinking)
      || family.includes('thinking')
      || efforts.size > 1
    const maxMode = members.some(member => member.maxMode)
    const needsVariants = members.length > 1 || variants.some(variant => variant.effort !== undefined)
    let incomingDefault: CursorEffort | undefined
    for (const model of models) {
      if (model.defaultEffort === undefined) continue
      if (splitCursorWireId(model.id).family === family) {
        incomingDefault = model.defaultEffort
        break
      }
    }
    const defaultEffort = resolveCursorDefaultEffort({
      id: family,
      ...incomingDefault === undefined ? {} : { defaultEffort: incomingDefault },
      ...needsVariants ? { variants } : {},
    })
    const alreadyMax = isCursorMaxRow(family)
    const hasSavedMaxRow = models.some(model => model.id === family + CURSOR_MAX_SUFFIX)
    const supportsMax = alreadyMax || maxMode || hasSavedMaxRow
    const displayName = alreadyMax
      ? (name.endsWith(' Max') ? name : name + ' Max')
      : name
    const labeled = family === 'default' && preferred?.name === 'Auto' ? 'Auto' : displayName
    const row = (id: string, rowName: string, max: boolean): CursorCatalogModel => ({
      id,
      name: rowName,
      thinking,
      vision: true,
      contextWindow: max ? CURSOR_MAX_CONTEXT_WINDOW : CURSOR_DEFAULT_CONTEXT_WINDOW,
      ...max ? { maxMode: true } : {},
      ...defaultEffort === undefined ? {} : { defaultEffort },
      ...needsVariants ? { variants } : {},
    })
    grouped.push(row(family, labeled, alreadyMax))
    if (supportsMax && !alreadyMax && !hasSavedMaxRow) {
      grouped.push(row(family + CURSOR_MAX_SUFFIX, name + ' Max', true))
    }
  }
  return sortGroupedFamilies(grouped, firstIndex, sort)
}

export function modelMatchesQuery(model: CursorCatalogModel, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) return true
  const fields = [model.id, model.name ?? '', ...(model.variants?.map(variant => variant.wireId) ?? [])]
  return fields.some(field => field.toLowerCase().includes(needle))
}

export function findCatalogModel(
  catalog: readonly CursorCatalogModel[],
  id: string,
): CursorCatalogModel | undefined {
  return catalog.find(model => model.id === id)
    ?? catalog.find(model => model.variants?.some(variant => variant.wireId === id))
}

export function effortsForCursorModel(model: CursorCatalogModel): CursorEffort[] {
  const efforts = new Set<CursorEffort>()
  for (const variant of model.variants ?? []) {
    if (variant.effort !== undefined) efforts.add(variant.effort)
  }
  return CURSOR_EFFORT_ORDER.filter(effort => efforts.has(effort))
}

export function resolveCursorWireId(model: CursorCatalogModel, effort?: string): string {
  const variants = model.variants
  const fallback = cursorBaseFamilyId(model.id)
  if (variants === undefined || variants.length === 0) return fallback
  const wanted = asEffort(effort) ?? resolveCursorDefaultEffort(model) ?? 'medium'
  const matching = variants.filter(variant => (variant.effort ?? 'medium') === wanted)
  const wireId = matching[0]?.wireId ?? variants[0]?.wireId ?? fallback
  return cursorBaseFamilyId(wireId)
}

export function variantMaxMode(model: CursorCatalogModel, _effort?: string): boolean {
  return isCursorMaxRow(model.id) || model.maxMode === true
}

function asEffort(value: string | undefined): CursorEffort | undefined {
  if (value === undefined) return undefined
  return CURSOR_EFFORT_ORDER.find(effort => effort === value)
}

/** Plugin default when the chat has not picked a thinking level. */
export function suggestedDefaultEffort(familyId: string, efforts: readonly CursorEffort[]): CursorEffort | undefined {
  if (efforts.length === 0) return undefined
  const id = clusterOf(familyId).toLowerCase()
  const choose = (...wanted: CursorEffort[]): CursorEffort | undefined => {
    for (const effort of wanted) {
      if (efforts.includes(effort)) return effort
    }
  }
  if (id.startsWith('gpt-5.6-sol')) return choose('high', 'xhigh', 'max')
  if (id.startsWith('gpt-5.6-terra')) return choose('xhigh', 'high', 'max')
  if (id.startsWith('gpt-5.6-luna')) return choose('max', 'xhigh', 'high')
  if (id.startsWith('claude-fable-5')) return choose('high', 'xhigh', 'max')
  if (id.includes('grok')) return choose('high', 'medium', 'low')
  if (id.startsWith('glm-5.2')) return choose('max', 'high')
  return choose('xhigh', 'high')
    ?? [...CURSOR_EFFORT_ORDER].filter(effort => effort !== 'none').reverse().find(effort => efforts.includes(effort))
    ?? efforts[0]
}

export function resolveCursorDefaultEffort(model: CursorCatalogModel): CursorEffort | undefined {
  const efforts = effortsForCursorModel(model)
  if (efforts.length === 0) return undefined
  if (model.defaultEffort !== undefined && efforts.includes(model.defaultEffort)) return model.defaultEffort
  return suggestedDefaultEffort(model.id, efforts)
}
