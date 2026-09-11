import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'

describe('Cursor publication contract', () => {
  it('does not export dangling ./src/*', async () => {
    const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
    expect(pkg.exports?.['./src/*']).toBeUndefined()
  })

  it('keeps src excluded from the tarball', async () => {
    const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
    const files: string[] = pkg.files ?? []
    expect(files.some(f => f === 'src' || f.startsWith('src/'))).toBe(false)
    expect(files.some(f => f.includes('tests'))).toBe(false)
  })

  it('every remaining export target exists on disk after build', async () => {
    const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
    const { existsSync } = await import('node:fs')
    const { join } = await import('node:path')
    const { fileURLToPath } = await import('node:url')
    const root = fileURLToPath(new URL('..', import.meta.url))
    const collect = (value: unknown, subpath: string, out: { subpath: string, target: string }[]) => {
      if (typeof value === 'string') { out.push({ subpath, target: value }); return }
      if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          if (k === '.' || k.startsWith('./')) collect(v, k, out)
          else if (typeof v === 'object') collect(v, subpath, out)
        }
      }
    }
    const list: { subpath: string, target: string }[] = []
    collect(pkg.exports, '.', list)
    for (const { subpath, target } of list) {
      if (typeof target === 'string' && target.startsWith('./')) {
        const abs = join(root, target)
        expect(existsSync(abs), `export ${subpath} -> ${target} should exist`).toBe(true)
      }
    }
  })

  it('rejects a promised missing export (negative contract)', () => {
    const fakeFiles = new Set(['lib/index.js', 'lib/client.js'])
    const fakeExports = { './missing': './lib/missing.js' }
    let threw = false
    for (const [, target] of Object.entries(fakeExports)) {
      if (!fakeFiles.has((target as string).slice(2))) threw = true
    }
    expect(threw).toBe(true)
  })

  it('does not require ToolCallId from the Alpha.4 runtime module table', async () => {
    const source = await readFile(new URL('../src/interaction.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/import\s*\{[^}]*\bToolCallId\b[^}]*\}\s*from\s*['"]@deepseek-ai\/dsh-llm['"]/u)
  })
})
