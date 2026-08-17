import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import LlmRuntime from '@deepseek-ai/dsh-llm'
import * as LlmCursor from '../src/index.ts'
import { Config } from '../src/index.ts'

let root: string | undefined
let context: Context | undefined

afterEach(async () => {
  await context?.fiber.dispose()
  context = undefined
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  root = undefined
})

describe('llm-cursor loader composition', () => {
  it('registers the cursor route without apiKeyEnv', async () => {
    root = await mkdtemp(join(tmpdir(), 'dsh-llm-cursor-comp-'))
    const configPath = join(root, 'cordis.yml')
    await writeFile(configPath, [
      '- id: llm',
      "  name: 'test-llm-service'",
      '- id: llm-cursor',
      "  name: 'dsh-llm-cursor'",
      '',
    ].join('\n'))

    const ctx = new Context()
    context = ctx
    ctx.baseUrl = pathToFileURL(root).href + '/'
    await ctx.plugin(Loader)
    ctx.loader.builtins.include = Include
    const modules = new Map<string, unknown>([
      ['test-llm-service', LlmRuntime],
      ['dsh-llm-cursor', LlmCursor],
    ])
    ctx.loader.internal = {
      version: 'v2',
      async import(specifier: string) {
        if (!modules.has(specifier)) throw new Error(`unexpected Loader import: ${specifier}`)
        return modules.get(specifier)
      },
    } as unknown as NonNullable<typeof ctx.loader.internal>
    await ctx.loader.create({
      name: 'cordis:include',
      config: { path: pathToFileURL(configPath).href },
    })
    await ctx.loader.await()

    expect(ctx.llm.listConfigurableProviders()).toEqual([
      { provider: 'cursor', displayName: 'Cursor', settingsNs: 'llm-cursor', settingsPath: [] },
    ])
    const schema = Config.toJSON() as { uid: number, refs: Record<string, { dict?: Record<string, unknown> }> }
    const dict = schema.refs[String(schema.uid)]?.dict
    expect(dict).not.toHaveProperty('apiKeyEnv')
  })
})
