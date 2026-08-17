import { createServer } from 'node:http2'
import { afterEach, describe, expect, it } from 'vitest'
import { create, toBinary } from '@bufbuild/protobuf'
import {
  brandOfCursorFamily,
  catalogFromSettings,
  cleanFamilyName,
  cursorBrandSections,
  findCatalogModel,
  groupCursorModels,
  modelMatchesQuery,
  suggestedDefaultEffort,
  parseUsableModels,
  readCursorModels,
  resolveCursorWireId,
  variantMaxMode,
} from '../src/catalog.ts'
import { decodeCursorCatalogModel } from '../src/client-contract.ts'
import { GetUsableModelsResponseSchema, ModelDetailsSchema } from '../src/wire/vendor/agent_pb.ts'

const servers: ReturnType<typeof createServer>[] = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => {
    server.close(error => { error ? reject(error) : resolve() })
  })))
})

describe('Cursor model catalog', () => {
  it('parses usable models from GetUsableModels details', () => {
    expect(parseUsableModels([
      { modelId: 'composer-2.5', displayName: 'Composer 2.5', maxMode: true, thinkingDetails: {} },
      { modelId: 'gpt-5.3-codex', displayName: 'GPT-5.3 Codex' },
      { modelId: '', displayName: 'skip' },
    ])).toEqual([
      { id: 'composer-2.5', name: 'Composer 2.5', thinking: true, vision: true, maxMode: true },
      { id: 'gpt-5.3-codex', name: 'GPT-5.3 Codex', thinking: false, vision: true },
    ])
  })

  it('labels the default wire id as Auto', () => {
    expect(parseUsableModels([
      { modelId: 'default', displayName: 'Auto' },
    ])).toEqual([
      { id: 'default', name: 'Auto', thinking: false, vision: true },
    ])
  })

  it('reads a raw application/proto GetUsableModels response', async () => {
    const server = createServer()
    servers.push(server)
    server.on('stream', (stream, headers) => {
      expect(headers['content-type']).toBe('application/proto')
      expect(headers[':path']).toBe('/agent.v1.AgentService/GetUsableModels')
      const payload = toBinary(GetUsableModelsResponseSchema, create(GetUsableModelsResponseSchema, {
        models: [
          create(ModelDetailsSchema, { modelId: 'cursor-grok-4.6', displayName: 'Cursor Grok 4.6' }),
          create(ModelDetailsSchema, { modelId: 'gpt-5.2', displayName: 'GPT-5.2' }),
          create(ModelDetailsSchema, {
            modelId: 'composer-2.5',
            displayName: 'Composer 2.5',
            maxMode: true,
          }),
          create(ModelDetailsSchema, { modelId: 'default', displayName: 'Auto' }),
          create(ModelDetailsSchema, { modelId: 'claude-4.6-sonnet', displayName: 'Claude 4.6 Sonnet' }),
        ],
      }))
      stream.respond({ ':status': 200, 'content-type': 'application/proto' })
      stream.end(payload)
    })
    await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve) })
    const address = server.address()
    if (address === null || typeof address === 'string') throw new Error('no port')
    const models = await readCursorModels({
      accessToken: 'tok',
      apiURL: `http://127.0.0.1:${String(address.port)}`,
    })
    expect(models.map(model => model.id)).toEqual([
      'default',
      'composer-2.5',
      'cursor-grok-4.6',
      'gpt-5.2',
      'claude-4.6-sonnet',
    ])
    expect(models[1]).toMatchObject({
      id: 'composer-2.5',
      name: 'Composer 2.5',
      maxMode: true,
    })
  })

  it('surfaces HTTP 415 instead of swallowing it', async () => {
    const server = createServer()
    servers.push(server)
    server.on('stream', (stream) => {
      stream.respond({ ':status': 415 })
      stream.end()
    })
    await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve) })
    const address = server.address()
    if (address === null || typeof address === 'string') throw new Error('no port')
    await expect(readCursorModels({
      accessToken: 'tok',
      apiURL: `http://127.0.0.1:${String(address.port)}`,
    })).rejects.toThrow(/415|HTTP\/2/u)
  })

  it('collapses thinking levels, keeps Fast as its own model, and sorts siblings together', () => {
    const grouped = groupCursorModels([
      { id: 'cursor-grok-4.6-high-fast', name: 'Cursor Grok 4.6 Fast', thinking: true, vision: true },
      { id: 'gpt-5.2-high', name: 'GPT-5.2 High', thinking: true, vision: true, maxMode: true },
      { id: 'gpt-5.2', name: 'GPT-5.2', thinking: false, vision: true },
      { id: 'gpt-5.2-low', name: 'GPT-5.2 Low', thinking: true, vision: true },
      { id: 'gpt-5.2-high-fast', name: 'GPT-5.2 High Fast', thinking: true, vision: true },
      { id: 'gpt-5.2-low-fast', name: 'GPT-5.2 Low Fast', thinking: true, vision: true },
      { id: 'composer-2.5-fast', name: 'Composer 2.5 Fast', thinking: true, vision: true },
      { id: 'cursor-grok-4.6-low', name: 'Cursor Grok 4.6 Low', thinking: true, vision: true },
      { id: 'cursor-grok-4.6-high', name: 'Cursor Grok 4.6', thinking: true, vision: true },
      { id: 'composer-2.5', name: 'Composer 2.5', thinking: true, vision: true, maxMode: true },
      { id: 'default', name: 'Auto', thinking: false, vision: true },
    ])
    expect(grouped.map(model => model.id)).toEqual([
      'default',
      'cursor-grok-4.6',
      'cursor-grok-4.6-fast',
      'gpt-5.2',
      'gpt-5.2-fast',
      'composer-2.5',
      'composer-2.5-fast',
    ])
    expect(grouped[1]).toMatchObject({ id: 'cursor-grok-4.6', name: 'Cursor Grok 4.6' })
    expect(grouped[2]).toMatchObject({ id: 'cursor-grok-4.6-fast', name: 'Cursor Grok 4.6 Fast' })
    expect(resolveCursorWireId(grouped[3]!, 'high')).toBe('gpt-5.2-high')
    expect(resolveCursorWireId(grouped[4]!, 'high')).toBe('gpt-5.2-high-fast')
    expect(resolveCursorWireId(grouped[4]!, 'low')).toBe('gpt-5.2-low-fast')
    expect(resolveCursorWireId(grouped[5]!, 'high')).toBe('composer-2.5')
    expect(variantMaxMode(grouped[3]!, 'high')).toBe(true)
    expect(findCatalogModel(grouped, 'gpt-5.2-high')?.id).toBe('gpt-5.2')
    expect(findCatalogModel(grouped, 'gpt-5.2-high-fast')?.id).toBe('gpt-5.2-fast')
    expect(groupCursorModels(grouped)).toEqual(grouped)
  })

  it('sorts fetch results with Cursor first, Composer inside that brand, Fast beside its sibling', () => {
    expect(brandOfCursorFamily('default')).toBe('cursor')
    expect(brandOfCursorFamily('composer-2.5')).toBe('cursor')
    expect(brandOfCursorFamily('cursor-grok-4.6', 'Cursor Grok 4.6')).toBe('cursor')
    expect(brandOfCursorFamily('grok-4.6', 'Grok 4.6')).toBe('xai')
    expect(brandOfCursorFamily('gpt-5.2-fast')).toBe('openai')
    expect(brandOfCursorFamily('claude-4.6-sonnet')).toBe('anthropic')
    expect(brandOfCursorFamily('gemini-3-flash')).toBe('google')
    const grouped = groupCursorModels([
      { id: 'cursor-grok-4.6-high-fast', name: 'Cursor Grok 4.6 Fast', thinking: true, vision: true },
      { id: 'gpt-5.2-high', name: 'GPT-5.2 High', thinking: true, vision: true },
      { id: 'claude-4.6-sonnet', name: 'Claude 4.6 Sonnet', thinking: true, vision: true },
      { id: 'gemini-3-flash', name: 'Gemini 3 Flash', thinking: false, vision: true },
      { id: 'composer-2.5-fast', name: 'Composer 2.5 Fast', thinking: true, vision: true },
      { id: 'gpt-5.2-high-fast', name: 'GPT-5.2 High Fast', thinking: true, vision: true },
      { id: 'composer-2.5', name: 'Composer 2.5', thinking: true, vision: true, maxMode: true },
      { id: 'cursor-grok-4.6-high', name: 'Cursor Grok 4.6', thinking: true, vision: true },
      { id: 'default', name: 'Auto', thinking: false, vision: true },
    ], 'brand')
    expect(grouped.map(model => model.id)).toEqual([
      'default',
      'composer-2.5',
      'composer-2.5-fast',
      'cursor-grok-4.6',
      'cursor-grok-4.6-fast',
      'gpt-5.2',
      'gpt-5.2-fast',
      'claude-4.6-sonnet',
      'gemini-3-flash',
    ])
    expect(cursorBrandSections(grouped).map(section => [section.brand, ...section.models.map(model => model.id)])).toEqual([
      ['cursor', 'default', 'composer-2.5', 'composer-2.5-fast', 'cursor-grok-4.6', 'cursor-grok-4.6-fast'],
      ['openai', 'gpt-5.2', 'gpt-5.2-fast'],
      ['anthropic', 'claude-4.6-sonnet'],
      ['google', 'gemini-3-flash'],
    ])
  })

  it('keeps an explicitly empty catalog empty instead of reseeding Composer', () => {
    expect(catalogFromSettings([])).toEqual([])
  })

  it('keeps a saved catalog in user order instead of re-sorting by brand', () => {
    const models = catalogFromSettings([
      { id: 'gpt-5.2', name: 'GPT-5.2', thinking: true, vision: true },
      { id: 'composer-2.5', name: 'Composer 2.5', thinking: true, vision: true, maxMode: true },
    ])
    expect(models.map(model => model.id)).toEqual(['gpt-5.2', 'composer-2.5'])
  })

  it('groups a previously saved flat catalog', () => {
    const models = catalogFromSettings([
      { id: 'gpt-5.2-high', name: 'GPT-5.2 High', thinking: true, vision: true },
      { id: 'gpt-5.2-low', name: 'GPT-5.2 Low', thinking: true, vision: true },
    ])
    expect(models).toHaveLength(1)
    expect(models[0]?.id).toBe('gpt-5.2')
    expect(resolveCursorWireId(models[0]!, 'low')).toBe('gpt-5.2-low')
  })

  it('filters picker rows by name, family id, or wire id', () => {
    const model = {
      id: 'cursor-grok-4.6',
      name: 'Cursor Grok 4.6',
      variants: [{ wireId: 'cursor-grok-4.6-high-fast', effort: 'high' as const, fast: true }],
    }
    expect(modelMatchesQuery(model, '')).toBe(true)
    expect(modelMatchesQuery(model, 'grok 4.6')).toBe(true)
    expect(modelMatchesQuery(model, 'HIGH-FAST')).toBe(true)
    expect(modelMatchesQuery(model, 'luna')).toBe(false)
  })

  it('strips effort and speed words from family names', () => {
    expect(cleanFamilyName('GPT-5.6 Luna 1M Extra High Fast')).toBe('GPT-5.6 Luna Fast')
    expect(cleanFamilyName('GPT-5.2 High Fast')).toBe('GPT-5.2 Fast')
  })

  it('decodes family rows that carry wire variants', () => {
    expect(decodeCursorCatalogModel({
      id: 'gpt-5.2',
      name: 'GPT-5.2',
      thinking: true,
      defaultEffort: 'xhigh',
      variants: [
        { wireId: 'gpt-5.2', effort: 'medium' },
        { wireId: 'gpt-5.2-high', effort: 'high', maxMode: true },
      ],
    })).toEqual({
      id: 'gpt-5.2',
      name: 'GPT-5.2',
      thinking: true,
      defaultEffort: 'xhigh',
      variants: [
        { wireId: 'gpt-5.2', effort: 'medium' },
        { wireId: 'gpt-5.2-high', effort: 'high', maxMode: true },
      ],
    })
  })

  it('suggests per-family default thinking levels from advertised efforts', () => {
    const all = ['none', 'low', 'medium', 'high', 'xhigh', 'max'] as const
    expect(suggestedDefaultEffort('composer-2.5', [])).toBeUndefined()
    expect(suggestedDefaultEffort('cursor-grok-4.6-fast', ['low', 'medium', 'high', 'xhigh'])).toBe('high')
    expect(suggestedDefaultEffort('gpt-5.2', ['low', 'medium', 'high', 'xhigh'])).toBe('xhigh')
    expect(suggestedDefaultEffort('gpt-5.5', ['none', 'low', 'medium', 'high'])).toBe('high')
    expect(suggestedDefaultEffort('gpt-5.6-sol-fast', all)).toBe('high')
    expect(suggestedDefaultEffort('gpt-5.6-terra', all)).toBe('xhigh')
    expect(suggestedDefaultEffort('gpt-5.6-luna', all)).toBe('max')
    expect(suggestedDefaultEffort('claude-fable-5-thinking', all)).toBe('high')
    expect(suggestedDefaultEffort('claude-opus-5', ['low', 'medium', 'high'])).toBe('high')
    expect(suggestedDefaultEffort('claude-opus-5-thinking', all)).toBe('xhigh')
    expect(suggestedDefaultEffort('claude-4.6-sonnet', ['medium'])).toBe('medium')
    expect(suggestedDefaultEffort('glm-5.2', ['high', 'max'])).toBe('max')
  })

  it('stamps suggested defaults onto grouped families and keeps a saved override', () => {
    const grouped = groupCursorModels([
      { id: 'gpt-5.2-low', name: 'GPT-5.2 Low', thinking: true, vision: true },
      { id: 'gpt-5.2-xhigh', name: 'GPT-5.2 Extra High', thinking: true, vision: true },
      { id: 'glm-5.2-high', name: 'GLM 5.2 High', thinking: true, vision: true },
      { id: 'glm-5.2-max', name: 'GLM 5.2 Max', thinking: true, vision: true },
    ], 'brand')
    expect(grouped.find(model => model.id === 'gpt-5.2')?.defaultEffort).toBe('xhigh')
    expect(grouped.find(model => model.id === 'glm-5.2')?.defaultEffort).toBe('max')
    const saved = groupCursorModels([{
      id: 'gpt-5.2',
      name: 'GPT-5.2',
      defaultEffort: 'low',
      variants: [
        { wireId: 'gpt-5.2-low', effort: 'low' },
        { wireId: 'gpt-5.2-xhigh', effort: 'xhigh' },
      ],
    }])
    expect(saved[0]?.defaultEffort).toBe('low')
  })
})
