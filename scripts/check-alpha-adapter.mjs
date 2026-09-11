#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

function fail(message) {
  throw new Error('alpha adapter check: ' + message)
}

const INVALID_REGISTRY = 'http://127.0.0.1:9/'
const CHILD_ENV_KEYS = new Set([
  'PATH', 'HOME', 'USERPROFILE', 'TMPDIR', 'TMP', 'TEMP', 'XDG_CONFIG_HOME', 'XDG_CACHE_HOME',
  'NODE_PATH', 'NODE_OPTIONS', 'npm_config_userconfig', 'npm_config_globalconfig', 'npm_config_registry',
  'npm_config_cache', 'npm_config_audit', 'npm_config_fund', 'CI', 'FORCE_COLOR', 'LANG', 'LC_ALL',
])

function childEnvironment(work) {
  const home = join(work, 'home')
  const temporary = join(work, 'tmp')
  const config = join(work, 'config')
  const cache = join(work, 'cache')
  const userconfig = join(config, 'npmrc')
  const globalconfig = join(config, 'globalrc')
  for (const directory of [home, temporary, config, cache]) mkdirSync(directory, { recursive: true })
  writeFileSync(userconfig, [
    'registry=' + INVALID_REGISTRY,
    'cache=' + cache,
    'audit=false',
    'fund=false',
  ].join('\n') + '\n')
  writeFileSync(globalconfig, '')
  const env = {
    PATH: process.env.PATH ?? '/usr/bin:/bin',
    HOME: home,
    USERPROFILE: home,
    TMPDIR: temporary,
    TMP: temporary,
    TEMP: temporary,
    XDG_CONFIG_HOME: config,
    XDG_CACHE_HOME: cache,
    NODE_PATH: '',
    NODE_OPTIONS: '',
    npm_config_userconfig: userconfig,
    npm_config_globalconfig: globalconfig,
    npm_config_registry: INVALID_REGISTRY,
    npm_config_cache: cache,
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    CI: '1',
    FORCE_COLOR: '0',
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
  }
  for (const key of Object.keys(env)) if (!CHILD_ENV_KEYS.has(key)) fail('adapter child environment key is not allowlisted: ' + key)
  return env
}

function run(command, args, cwd, env) {
  const result = spawnSync(command, args, { cwd, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  if (result.error || result.status !== 0) fail(command + ' ' + args.join(' ') + ' failed: ' + String(result.stderr ?? result.stdout ?? result.error ?? ''))
  return String(result.stdout ?? '')
}

async function checkAdapter(adapterModule, label) {
  const Adapter = adapterModule.CursorAdapter
  if (typeof Adapter !== 'function') fail(label + ': CursorAdapter is not exported')
  if (!Object.hasOwn(Adapter.prototype, 'imageRequestPricing')) fail(label + ': CursorAdapter must own imageRequestPricing')
  if (!Object.hasOwn(Adapter.prototype, 'prepareCall')) fail(label + ': CursorAdapter must own prepareCall')

  const resolvedOptions = typeof adapterModule.resolveAdapterOptions === 'function'
    ? adapterModule.resolveAdapterOptions({})
    : { models: [], runLifecycle: {}, retryPolicy: { mode: 'normal', maxRetries: 2 } }
  const adapter = new Adapter({ options: () => resolvedOptions, resolveApiKey: async () => '' })
  const model = resolvedOptions.models[0]?.id ?? 'auto'
  const pricing = adapter.imageRequestPricing('cursor', model)
  if (pricing !== undefined) fail(label + ': neutral imageRequestPricing must return undefined')

  adapter.dispose?.()
}

const rootPath = fileURLToPath(new URL('..', import.meta.url))
const sourceModule = await import(new URL('../lib/index.js', import.meta.url).href)
await checkAdapter(sourceModule, 'built Host')

const work = mkdtempSync(join(tmpdir(), 'dsh-llm-cursor-alpha-adapter-'))
let primaryError
try {
  const env = childEnvironment(work)
  const report = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', work], rootPath, env))
  if (!Array.isArray(report) || report.length !== 1 || typeof report[0]?.filename !== 'string') fail('npm pack returned no single archive report')
  const archive = join(work, report[0].filename)
  const extracted = join(work, 'extracted')
  mkdirSync(extracted, { recursive: true })
  run('tar', ['-xzf', archive, '-C', extracted], rootPath, env)
  const packageRoot = join(extracted, 'package')
  const host = join(packageRoot, 'lib', 'index.js')
  if (!existsSync(host)) fail('extracted package has no Host entry')
  const packageJson = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
  if (packageJson.main !== 'lib/index.js' || packageJson.types !== 'lib/types/index.d.ts') fail('extracted package has unexpected Host entry metadata')
  const hostSource = readFileSync(host, 'utf8')
  if (!hostSource.includes('prepareCall(') || !hostSource.includes('imageRequestPricing(')) fail('extracted Host entry omits alpha adapter methods')
  run('node', ['--check', host], rootPath, env)
  console.log('CursorAdapter Alpha.4 contract passed for built and packed Host artifacts')
} catch (error) {
  primaryError = error
  throw error
} finally {
  const cleanupErrors = []
  try {
    rmSync(work, { recursive: true, force: true })
  } catch (error) {
    cleanupErrors.push(new Error('alpha adapter check cleanup failed: ' + (error instanceof Error ? error.message : String(error)), { cause: error }))
  }
  if (cleanupErrors.length !== 0) {
    const failures = primaryError === undefined ? [] : [primaryError]
    for (const error of cleanupErrors) failures.push(error)
    throw new AggregateError(failures, 'alpha adapter check execution and cleanup failed')
  }
}
