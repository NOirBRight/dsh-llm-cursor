/**
 * Collapse Cursor thinking-level wire ids into one family row.
 * Fast SKUs stay their own family (`gpt-5.2-fast`). Fetch sorts Auto, then
 * Cursor (Composer, Cursor Grok, and other first-party SKUs), then other
 * brands, with each standard model beside its Fast sibling.
 * Fetch may offer a `-1m` sibling for families with Max Context; saving and
 * reloading keep only the rows that were actually picked.
 * A saved catalog keeps input order so drag-reorder survives reload.
 * Browser-safe: the plugin card and Host adapter share this module.
 */

import type { CursorCatalogModel, CursorEffort, CursorModelVariant } from './client-contract.ts'

/** Picker suffix for a first-class Max / 1M row. Avoids colliding with effort `-max`. */
export const CURSOR_MAX_SUFFIX = '-1m'
/** Ordinary Cursor request budget. */
export const CURSOR_DEFAULT_CONTEXT_WINDOW = 200_000
/** Grok 4.5 / 4.6 default context. */
export const CURSOR_GROK_CONTEXT_WINDOW = 256_000
/** GPT-5.6 default context. */
export const CURSOR_GPT_56_CONTEXT_WINDOW = 272_000
/** Claude Fable 5 / Opus 5 default context. */
export const CURSOR_CLAUDE_5_CONTEXT_WINDOW = 300_000
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

const OTHER_EFFORTS: ReadonlySet<CursorEffort> = new Set(['none', 'low', 'medium', 'high', 'xhigh'])

/** Effort tokens at the end of a wire id. `-extra-high` must precede `-high`. */
const EFFORT_SUFFIXES: readonly { suffix: string, effort: CursorEffort }[] = [
  { suffix: '-extra-high', effort: 'xhigh' },
  { suffix: '-none', effort: 'none' },
  { suffix: '-low', effort: 'low' },
  { suffix: '-medium', effort: 'medium' },
  { suffix: '-high', effort: 'high' },
  { suffix: '-xhigh', effort: 'xhigh' },
  { suffix: '-max', effort: 'max' },
]

/** Strip `-thinking` (a Cursor parameter, not a family) and map `cursor-grok-*` to `grok-*`. */
export function canonicalizeFamilyId(family: string): string {
  const next = family.replace(/-thinking(?=-|$)/gu, '')
  const fast = next.endsWith('-fast') && next.length > 5
  const core = fast ? next.slice(0, -5) : next
  const renamed = core.startsWith('cursor-grok-') ? `grok-${core.slice('cursor-grok-'.length)}` : core
  return fast ? `${renamed}-fast` : renamed
}

/**
 * Peel Fast, then `-thinking` (before or after effort), then the effort token.
 * Live SKUs use both `family-thinking-high` and `family-high-thinking`.
 */
export function splitCursorWireId(id: string): { family: string, effort?: CursorEffort, fast: boolean } {
  let rest = id
  let fast = false
  if (rest.endsWith('-fast') && rest.length > 5) {
    fast = true
    rest = rest.slice(0, -5)
  }
  rest = rest.replace(/-thinking(?=-|$)/gu, '')
  if (rest.length === 0) return { family: canonicalizeFamilyId(id), fast }
  for (const entry of EFFORT_SUFFIXES) {
    if (!rest.endsWith(entry.suffix) || rest.length <= entry.suffix.length) continue
    const base = rest.slice(0, -entry.suffix.length)
    return {
      family: canonicalizeFamilyId(fast ? `${base}-fast` : base),
      effort: entry.effort,
      fast,
    }
  }
  return { family: canonicalizeFamilyId(fast ? `${rest}-fast` : rest), fast }
}

export function cleanFamilyName(name: string): string {
  return name
    .replace(/\s+1M\b/giu, '')
    .replace(/\s+Thinking\b/giu, '')
    .replace(/\s+(?:None|Low|Medium|High|Extra High)\b/giu, '')
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
  pinnedFamily: boolean
}

/**
 * Use `displayModelId` as the family key only when it is a clean family id.
 * GetUsableModels often copies the suffix-encoded SKU into displayModelId;
 * treating that as a family would keep every thinking level as its own row
 * and produce `-fast-fast` ids.
 */
function pinnedFamilyFromDisplay(displayModelId: string | undefined, wire: { family: string, effort?: CursorEffort, fast: boolean }): string | undefined {
  if (displayModelId === undefined || displayModelId.length === 0) return undefined
  const display = splitCursorWireId(displayModelId)
  if (display.effort !== undefined) return undefined
  if (display.family === wire.family) return undefined
  if (wire.fast) return canonicalizeFamilyId(`${clusterOf(display.family)}-fast`)
  return clusterOf(display.family)
}

function rawRowsOf(models: readonly CursorCatalogModel[]): RawRow[] {
  const rows: RawRow[] = []
  for (const model of models) {
    if (model.variants !== undefined && model.variants.length > 0) {
      for (const variant of model.variants) {
        const split = splitCursorWireId(variant.wireId)
        const effort = variant.effort ?? split.effort
        const fast = variant.fast === true || split.fast
        const pinned = pinnedFamilyFromDisplay(model.displayModelId, { ...split, fast })
        const family = isCursorMaxRow(model.id)
          ? model.id
          : pinned ?? split.family
        rows.push({
          wireId: variant.wireId,
          name: model.name ?? model.id,
          thinking: model.thinking === true,
          maxMode: variant.maxMode === true,
          family,
          ...effort === undefined ? {} : { effort },
          fast,
          pinnedFamily: pinned !== undefined,
        })
      }
      continue
    }
    const split = splitCursorWireId(model.id)
    const pinned = pinnedFamilyFromDisplay(model.displayModelId, split)
    const family = pinned ?? split.family
    rows.push({
      wireId: model.id,
      name: model.name ?? model.id,
      thinking: model.thinking === true,
      maxMode: model.maxMode === true,
      family,
      ...split.effort === undefined ? {} : { effort: split.effort },
      fast: split.fast,
      pinnedFamily: pinned !== undefined,
    })
  }
  return refineMaxProductNames(rows)
}

function reattachMaxProduct(family: string): string {
  return family.endsWith('-fast') ? `${family.slice(0, -5)}-max-fast` : `${family}-max`
}

/** Keep `-max` as a product name unless the family also advertises other thinking levels. */
function refineMaxProductNames(rows: RawRow[]): RawRow[] {
  const byFamily = new Map<string, RawRow[]>()
  for (const row of rows) {
    const list = byFamily.get(row.family) ?? []
    list.push(row)
    byFamily.set(row.family, list)
  }
  const out: RawRow[] = []
  for (const [family, members] of byFamily) {
    if (members.some(member => member.pinnedFamily)) {
      out.push(...members)
      continue
    }
    const efforts = new Set(
      members.map(member => member.effort).filter((effort): effort is CursorEffort => effort !== undefined),
    )
    const hasOther = [...OTHER_EFFORTS].some(effort => efforts.has(effort))
    if (!hasOther && efforts.has('max')) {
      for (const member of members) {
        if (member.effort !== 'max') {
          out.push(member)
          continue
        }
        out.push({
          wireId: member.wireId,
          name: member.name,
          thinking: member.thinking,
          maxMode: member.maxMode,
          family: reattachMaxProduct(family),
          fast: member.fast,
          pinnedFamily: false,
        })
      }
      continue
    }
    out.push(...members)
  }
  return out
}

function clusterOf(family: string): string {
  const base = cursorBaseFamilyId(canonicalizeFamilyId(family))
  return base.endsWith('-fast') ? base.slice(0, -5) : base
}

function wireHasThinking(wireId: string): boolean {
  return /-thinking(?:-|$)/u.test(wireId)
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

function isCursorGrokId(id: string): boolean {
  return id.startsWith('grok-4.5') || id.startsWith('grok-4.6') || id.startsWith('cursor-grok-')
}

/** Infer the lab / first-party brand from a family id and display name. */
export function brandOfCursorFamily(familyId: string, name = ''): CursorModelBrand {
  const id = clusterOf(familyId).toLowerCase()
  const label = name.toLowerCase()
  if (id === 'default' || id === 'auto' || id.startsWith('composer') || id.startsWith('cursor-')) return 'cursor'
  if (isCursorGrokId(id) || /\bcursor grok\b/u.test(label)) return 'cursor'
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
    if (left.id === 'default' || left.id === 'auto') return -1
    if (right.id === 'default' || right.id === 'auto') return 1
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

/** Families Cursor actually offers a 1M / Max Context option for. */
export function familyHasExtendedContext(familyId: string, name = ''): boolean {
  if (/\b1M\b/iu.test(name)) return true
  const id = clusterOf(familyId).toLowerCase()
  if (/^claude-fable-5/u.test(id)) return true
  if (/^claude-(?:opus|sonnet)-5(?:-|$)/u.test(id)) return true
  if (/^claude-4\.[5-9]/u.test(id)) return true
  if (/^claude-(?:opus|sonnet|haiku)-4\.[5-9]/u.test(id)) return true
  if (/^gemini-3\.1-pro/u.test(id) || /^gemini-3\.7-flash/u.test(id)) return true
  if (/^gpt-5\.6-sol/u.test(id)) return true
  if (/^gpt-5\.[45](?:-|$)/u.test(id) && !/-(?:mini|nano)(?:-|$)/u.test(id)) return true
  if (/^kimi-k3$/u.test(id)) return true
  return false
}

/** Default DSH context budget for a non-Max family, matching Cursor's published defaults. */
export function defaultContextWindowForFamily(familyId: string): number {
  if (isCursorMaxRow(familyId)) return CURSOR_MAX_CONTEXT_WINDOW
  const id = clusterOf(familyId).toLowerCase()
  if (id.includes('grok')) return CURSOR_GROK_CONTEXT_WINDOW
  if (id.startsWith('gpt-5.6')) return CURSOR_GPT_56_CONTEXT_WINDOW
  if (id.startsWith('claude-fable-5') || id.startsWith('claude-opus-5')) return CURSOR_CLAUDE_5_CONTEXT_WINDOW
  return CURSOR_DEFAULT_CONTEXT_WINDOW
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
    const hasThinkingWire = members.some(member => wireHasThinking(member.wireId))
    const hasExplicitEffort = members.some(member => member.effort !== undefined)
    const variants: CursorModelVariant[] = members.map((member) => {
      const effort = member.effort ?? (!hasThinkingWire && hasExplicitEffort ? 'medium' : undefined)
      return {
        wireId: member.wireId,
        ...effort === undefined ? {} : { effort },
        ...member.fast ? { fast: true } : {},
        ...member.maxMode ? { maxMode: true } : {},
      }
    })
    const preferred = members.find(member => member.effort === undefined || member.effort === 'medium')
      ?? members.find(member => member.effort === 'high')
      ?? members[0]
    const name = cleanFamilyName(preferred?.name ?? family) || family
    const efforts = new Set(variants.map(variant => variant.effort).filter((effort): effort is CursorEffort => effort !== undefined))
    const thinking = members.some(member => member.thinking)
      || hasThinkingWire
      || efforts.size > 1
    const needsVariants = members.length > 1 || variants.some(variant => variant.effort !== undefined)
    let incomingDefault: CursorEffort | undefined
    for (const model of models) {
      if (model.defaultEffort === undefined) continue
      if (splitCursorWireId(model.id).family === family || model.id === family) {
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
    const displayName = alreadyMax
      ? (name.endsWith(' Max') ? name : name + ' Max')
      : name
    const labeled = (family === 'default' || family === 'auto') && (preferred?.name === 'Auto' || family === 'auto')
      ? 'Auto'
      : displayName
    const row = (id: string, rowName: string, max: boolean): CursorCatalogModel => ({
      id,
      name: rowName,
      thinking,
      vision: true,
      contextWindow: max ? CURSOR_MAX_CONTEXT_WINDOW : defaultContextWindowForFamily(id),
      ...max ? { maxMode: true } : {},
      ...defaultEffort === undefined ? {} : { defaultEffort },
      ...needsVariants ? { variants } : {},
    })
    grouped.push(row(family, labeled, alreadyMax))
    // Fetch (`brand`) can offer a Max row. Saved catalogs (`stable`) must not
    // re-insert one the user left unchecked.
    if (
      !alreadyMax
      && !hasSavedMaxRow
      && sort === 'brand'
      && familyHasExtendedContext(family, name)
    ) {
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
    ?? catalog.find(model => model.id === splitCursorWireId(id).family)
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
  const preferred = matching.find(variant => wireHasThinking(variant.wireId)) ?? matching[0]
  const wireId = preferred?.wireId ?? variants[0]?.wireId ?? fallback
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
  if (id.startsWith('gpt-5.6-sol') || id.startsWith('gpt-5.6-terra') || id.startsWith('gpt-5.6-luna')) {
    return choose('medium', 'high', 'low')
  }
  if (id.startsWith('claude-fable-5')) return choose('high', 'xhigh', 'max')
  if (id.startsWith('claude-opus-5')) return choose('high', 'xhigh', 'max')
  if (id.includes('grok')) return choose('high', 'medium', 'low')
  if (id.startsWith('glm-5.2')) return choose('high', 'max')
  return choose('high', 'medium', 'xhigh')
    ?? [...CURSOR_EFFORT_ORDER].filter(effort => effort !== 'none').reverse().find(effort => efforts.includes(effort))
    ?? efforts[0]
}

export function resolveCursorDefaultEffort(model: CursorCatalogModel): CursorEffort | undefined {
  const efforts = effortsForCursorModel(model)
  if (efforts.length === 0) return undefined
  if (model.defaultEffort !== undefined && efforts.includes(model.defaultEffort)) return model.defaultEffort
  return suggestedDefaultEffort(model.id, efforts)
}
