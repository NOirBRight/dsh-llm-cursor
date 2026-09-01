import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, isAbsolute, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FIXTURE_ROOT = resolve(ROOT, 'tests/fixtures/dsh-alpha1')
const FIXTURE_ARCHIVES = resolve(FIXTURE_ROOT, 'archives')
const FIXTURE_MANIFEST = join(FIXTURE_ROOT, 'manifest.json')
const ALPHA1_TAG = 'dsh-v0.1.2-alpha.1'
const ALPHA1_COMMIT = 'cd5ef8148158c3a752a658978873241fdf8e2bbc'
const OWNER = 'dsh-llm-providers-ui'
const DSH_ALPHA1 = '0.1.2-alpha.1'

function fail(message) {
  throw new Error(message)
}

function within(root, candidate) {
  return candidate === root || candidate.startsWith(root + sep)
}

function assertNoAlias(value, label) {
  if (typeof value !== 'string') return
  if (/^(?:npm:|file:|link:|workspace:|github:|git\+|https?:|\/|[A-Za-z]:[\\/]|\.\.(?:[\\/]|$))/u.test(value)) {
    fail(label + ' uses a path or VCS alias: ' + value)
  }
}

function parseVersion(value) {
  const match = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?$/u.exec(value.trim())
  if (match === null) return undefined
  return {
    major: Number(match[1]),
    minor: Number(match[2] ?? 0),
    patch: Number(match[3] ?? 0),
    partial: match[2] === undefined || match[3] === undefined,
    prerelease: match[4]?.split('.') ?? [],
  }
}

function compareParsedVersions(left, right) {
  for (const field of ['major', 'minor', 'patch']) {
    const delta = left[field] - right[field]
    if (delta !== 0) return delta
  }
  if (left.prerelease.length === 0 && right.prerelease.length !== 0) return 1
  if (left.prerelease.length !== 0 && right.prerelease.length === 0) return -1
  for (let index = 0; index < Math.max(left.prerelease.length, right.prerelease.length); index += 1) {
    const leftPart = left.prerelease[index]
    const rightPart = right.prerelease[index]
    if (leftPart === undefined) return -1
    if (rightPart === undefined) return 1
    if (leftPart === rightPart) continue
    const leftNumber = /^\d+$/u.test(leftPart) ? Number(leftPart) : undefined
    const rightNumber = /^\d+$/u.test(rightPart) ? Number(rightPart) : undefined
    if (leftNumber !== undefined && rightNumber !== undefined) return leftNumber - rightNumber
    if (leftNumber !== undefined) return -1
    if (rightNumber !== undefined) return 1
    return leftPart < rightPart ? -1 : 1
  }
  return 0
}

function satisfiesComparator(version, comparator) {
  const operator = /^(>=|<=|>|<|~|\^)?(.*)$/u.exec(comparator)
  if (operator === null) return false
  const prefix = operator[1] ?? ''
  const requested = parseVersion(operator[2])
  if (requested === undefined) return comparator === '*' || comparator === ''
  const comparison = compareParsedVersions(version, requested)
  if (prefix === '') {
    if (requested.partial) {
      if (operator[2].split('.')[0] !== String(version.major)) return false
      if (operator[2].split('.').length > 1 && operator[2].split('.')[1] !== String(version.minor)) return false
      return true
    }
    return comparison === 0
  }
  if (prefix === '>=') return comparison >= 0
  if (prefix === '<=') return comparison <= 0
  if (prefix === '>') return comparison > 0
  if (prefix === '<') return comparison < 0
  if (prefix === '^') {
    const upper = requested.major > 0
      ? { major: requested.major + 1, minor: 0, patch: 0, prerelease: [] }
      : requested.minor > 0
        ? { major: 0, minor: requested.minor + 1, patch: 0, prerelease: [] }
        : { major: 0, minor: 0, patch: requested.patch + 1, prerelease: [] }
    return comparison >= 0 && compareParsedVersions(version, upper) < 0
  }
  const upper = { major: requested.major, minor: requested.minor + 1, patch: 0, prerelease: [] }
  return comparison >= 0 && compareParsedVersions(version, upper) < 0
}

function satisfiesVersion(versionValue, rangeValue) {
  const version = parseVersion(versionValue)
  if (version === undefined) return false
  const alternatives = rangeValue.split('||').map(value => value.trim()).filter(Boolean)
  if (alternatives.length === 0) return true
  return alternatives.some(alternative => {
    const normalized = alternative.replace(/(>=|<=|>|<|~|\^)\s+(?=\d)/gu, '$1')
    const tokens = normalized.split(/\s+/u).filter(Boolean)
    return tokens.every(token => satisfiesComparator(version, token))
  })
}

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, child]) => [key, canonicalJson(child)]))
  }
  return value
}

const INSTALL_MANIFEST_FIELDS = [
  'name', 'version', 'type', 'main', 'module', 'browser', 'types', 'typings', 'exports', 'bin', 'files',
  'dependencies', 'optionalDependencies', 'peerDependencies', 'peerDependenciesMeta', 'os', 'cpu', 'engines',
]

function installManifestOf(manifest) {
  const result = {}
  for (const field of INSTALL_MANIFEST_FIELDS) {
    if (manifest[field] !== undefined) result[field] = manifest[field]
  }
  return result
}

function collectExportTargets(value, subpath, result) {
  if (typeof value === 'string') {
    result.push({ subpath, target: value })
    return
  }
  if (value === undefined) return
  if (value === null || typeof value !== 'object') fail('exports contains a non-target value at ' + subpath)
  for (const [key, child] of Object.entries(value)) {
    if (key === '.' || key.startsWith('./')) collectExportTargets(child, key, result)
    else collectExportTargets(child, subpath, result)
  }
}

function packageNameOf(specifier) {
  return specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : specifier.split('/')[0]
}

function importSpecifiers(source) {
  const withoutComments = source
    .replace(/\/\*[\s\S]*?\*\//gu, '')
    .replace(/(^|[^:])\/\/[^\r\n]*/gmu, '$1')
  const result = []
  const staticPattern = /\b(?:from|import)\s*['"]([^'"]+)['"]|\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/gu
  for (const match of withoutComments.matchAll(staticPattern)) {
    const specifier = match[1] ?? match[2] ?? match[3]
    if (specifier !== undefined) result.push(specifier)
  }
  const createRequirePattern = /\bcreateRequire\s*\([^;\n]*?\)\s*\(\s*(['"])([^'"]+)\1\s*\)/gu
  for (const match of withoutComments.matchAll(createRequirePattern)) result.push(match[2])
  const dynamicImportPattern = /\bimport\s*\(\s*([^)]*?)\s*\)/gu
  for (const match of withoutComments.matchAll(dynamicImportPattern)) {
    const argument = match[1]
    if (!/^(['"])[^'"\n]+\1$/u.test(argument)) fail('non-literal dynamic import: ' + argument)
  }
  return result
}

function resolvePackedImport(rel, specifier, packedFiles) {
  const base = normalize(join(dirname(rel), specifier.split(/[?#]/u, 1)[0]))
  const candidates = [
    base,
    base + '.js',
    base + '.mjs',
    base + '.cjs',
    base + '.json',
    join(base, 'index.js'),
    join(base, 'index.mjs'),
    join(base, 'index.cjs'),
  ]
  return candidates.find(candidate => packedFiles.has(candidate))
}

const CHILD_ENV_KEYS = [
  'PATH', 'HOME', 'USER', 'LANG', 'TMP', 'CI',
  'SystemRoot', 'WINDIR', 'TEMP', 'HOMEDRIVE', 'HOMEPATH', 'USERPROFILE',
]
const INVALID_REGISTRY = 'https://invalid.invalid/'
let childIsolation

function environmentValue(name) {
  const direct = process.env[name]
  if (direct !== undefined) return direct
  if (process.platform !== 'win32') return undefined
  const actual = Object.keys(process.env).find(key => key.toLowerCase() === name.toLowerCase())
  return actual === undefined ? undefined : process.env[actual]
}

function cleanEnvironment() {
  const env = {}
  for (const name of CHILD_ENV_KEYS) {
    const value = environmentValue(name)
    if (value !== undefined) env[name] = value
  }
  env.NODE_PATH = ''
  env.NODE_OPTIONS = ''
  if (childIsolation !== undefined) {
    env.npm_config_userconfig = childIsolation.userConfig
    env.npm_config_globalconfig = childIsolation.globalConfig
    env.npm_config_registry = INVALID_REGISTRY
    env.npm_config_cache = childIsolation.storeDir
    env.pnpm_config_store_dir = childIsolation.storeDir
  }
  return env
}

const COMMAND_TIMEOUT_MS = 180_000

function runCommand(command, args, cwd = ROOT) {
  try {
    return execFileSync(command, args, { cwd, env: cleanEnvironment(), encoding: 'utf8', stdio: 'pipe', timeout: COMMAND_TIMEOUT_MS, killSignal: 'SIGTERM' })
  } catch (error) {
    const stdout = error.stdout?.toString() ?? ''
    const stderr = error.stderr?.toString() ?? ''
    fail(command + ' ' + args.join(' ') + ' failed\n' + stdout + stderr)
  }
}

function runNpm(args, cwd = ROOT) {
  return runCommand('npm', args, cwd)
}

function runPnpm(args, cwd) {
  return runCommand('pnpm', args, cwd)
}

async function removeTreeSafely(path, tempRoot, lexicalRoot) {
  const absolutePath = resolve(path)
  if (!within(lexicalRoot, absolutePath)) fail('refusing to clean outside the temporary pack directory: ' + absolutePath)
  let info
  try {
    info = await lstat(absolutePath)
  } catch (error) {
    if (error?.code === 'ENOENT') return
    throw error
  }
  if (info.isSymbolicLink()) {
    await rm(absolutePath, { force: true })
    return
  }
  const resolvedPath = await realpath(absolutePath)
  if (!within(tempRoot, resolvedPath)) fail('refusing to clean a path outside the temporary root: ' + resolvedPath)
  if (!info.isDirectory()) {
    await rm(absolutePath, { force: true })
    return
  }
  for (const entry of await readdir(absolutePath, { withFileTypes: true })) {
    await removeTreeSafely(join(absolutePath, entry.name), tempRoot, lexicalRoot)
  }
  await rm(absolutePath, { recursive: true, force: true })
}

async function cleanupPackDir(packDir, primaryError) {
  try {
    const lexicalRoot = resolve(tmpdir())
    const tempRoot = await realpath(lexicalRoot)
    await removeTreeSafely(packDir, tempRoot, lexicalRoot)
  } catch (cleanupError) {
    if (primaryError !== undefined) {
      console.error('pack check cleanup failed after primary error:', cleanupError)
      return
    }
    throw cleanupError
  }
}

function parsePackReport(output) {
  const reportStart = output.lastIndexOf('\n[') + 1
  const report = JSON.parse(output.slice(reportStart))[0]
  if (report === undefined || !Array.isArray(report.files)) fail('npm pack returned no file report')
  const files = new Set(report.files.map(file => file.path))
  if (files.size !== report.files.length) fail('npm pack report contains duplicate paths')
  return { report, files }
}

async function validateOwnerArtifact() {
  const artifactValue = process.env.DSH_LLM_PROVIDERS_UI_ARTIFACT
  const expectedSha256 = process.env.DSH_LLM_PROVIDERS_UI_SHA256
  if ((artifactValue === undefined) !== (expectedSha256 === undefined)) fail('owner artifact path and SHA-256 must be supplied together')
  if (artifactValue === undefined || expectedSha256 === undefined) fail('owner artifact path and SHA-256 are required')
  if (!/^[0-9a-f]{64}$/u.test(expectedSha256)) fail('owner artifact SHA-256 must be lowercase hexadecimal')
  const artifactPath = resolve(artifactValue)
  if (within(ROOT, artifactPath)) fail('owner artifact must remain temporary and outside the repository')
  const info = await lstat(artifactPath)
  if (!info.isFile() || info.isSymbolicLink()) fail('owner artifact must be a regular file')
  const expectedName = OWNER + '-0.1.1-' + expectedSha256 + '.tgz'
  if (basename(artifactPath) !== expectedName) fail('owner artifact filename must contain its content address')
  const bytes = await readFile(artifactPath)
  const digest = createHash('sha256').update(bytes).digest('hex')
  if (digest !== expectedSha256) fail('owner artifact SHA-256 mismatch')
  let ownerManifest
  try {
    ownerManifest = JSON.parse(runCommand('tar', ['-xOf', artifactPath, 'package/package.json']))
  } catch (error) {
    fail('owner artifact does not contain package/package.json: ' + String(error))
  }
  if (ownerManifest.name !== OWNER || ownerManifest.version !== '0.1.1') fail('owner artifact package identity is not dsh-llm-providers-ui@0.1.1')
  const ownerTarEntries = runCommand('tar', ['-tzf', artifactPath]).trim().split('\n').filter(Boolean)
  if (new Set(ownerTarEntries).size !== ownerTarEntries.length) fail('owner artifact contains duplicate tar members')
  for (const member of ownerTarEntries) {
    if (member !== 'package/' && (!member.startsWith('package/') || normalize(member) !== member)) fail('owner artifact has an unsafe member: ' + member)
  }
  const ownerFiles = new Set(ownerTarEntries)
  const ownerExportTargets = []
  collectExportTargets(ownerManifest.exports, '.', ownerExportTargets)
  for (const { subpath, target } of ownerExportTargets) {
    if (!target.startsWith('./')) fail('owner export ' + subpath + ' is not a package-relative target: ' + target)
    const rel = target.slice(2)
    if (rel.split('/').includes('..')) fail('owner export ' + subpath + ' escapes the package: ' + target)
    if (!ownerFiles.has('package/' + rel)) fail('owner export ' + subpath + ' points to missing ' + target)
  }
  for (const file of ['package/package.json', 'package/lib/index.js', 'package/lib/client.js', 'package/lib/sortable.js', 'package/cordis.patch.yml']) {
    if (!ownerFiles.has(file)) fail('owner artifact is missing ' + file)
  }
  return { artifactPath, size: info.size, manifest: ownerManifest }
}

async function validateFixtures() {
  const manifest = JSON.parse(await readFile(FIXTURE_MANIFEST, 'utf8'))
  if (manifest.format !== 2) fail('alpha1 fixture manifest format is not 2')
  if (manifest.source?.repository !== 'https://github.com/deepseek-ai/deepseek-harness.git'
    || manifest.source?.tag !== ALPHA1_TAG
    || manifest.source?.commit !== ALPHA1_COMMIT) {
    fail('alpha1 fixture provenance does not identify the official tag and commit')
  }
  if (!Array.isArray(manifest.packages) || manifest.packages.length === 0) fail('alpha1 fixture manifest has no packages')
  const archiveRoot = await realpath(FIXTURE_ARCHIVES)
  const archiveDirectoryEntries = await readdir(FIXTURE_ARCHIVES)
  const nonArchives = archiveDirectoryEntries.filter(name => !name.endsWith('.tgz'))
  if (nonArchives.length > 0) fail('fixture archive directory contains non-tarball residue: ' + nonArchives.join(', '))
  const archiveNames = new Set(archiveDirectoryEntries)
  const archiveRealpaths = new Map()
  const packageVersions = new Map()
  const packagesByName = new Map()
  for (const entry of manifest.packages) {
    if (typeof entry.archive !== 'string' || isAbsolute(entry.archive) || normalize(entry.archive) !== entry.archive || entry.archive.startsWith('../')) {
      fail('fixture archive paths must be relative to the repository fixture directory')
    }
    if (!entry.archive.endsWith('.tgz')) fail('fixture entries must reference tarballs: ' + entry.archive)
    if (!archiveNames.delete(entry.archive)) fail('fixture archive is missing, duplicated, or unlisted: ' + entry.archive)
    const path = resolve(FIXTURE_ARCHIVES, entry.archive)
    if (!within(archiveRoot, path)) fail('fixture archive escapes its repository directory: ' + entry.archive)
    const info = await lstat(path)
    if (!info.isFile() || info.isSymbolicLink()) fail('fixture archive is not a regular file: ' + entry.archive)
    const archiveRealpath = await realpath(path)
    if (!within(archiveRoot, archiveRealpath)) fail('fixture archive resolves outside its repository directory: ' + entry.archive)
    const packageKey = entry.name + '@' + entry.version
    const existingArchive = archiveRealpaths.get(archiveRealpath)
    if (existingArchive !== undefined && existingArchive !== packageKey) fail('fixture archive realpath has conflicting package versions: ' + entry.archive)
    archiveRealpaths.set(archiveRealpath, packageKey)
    const existingVersion = packageVersions.get(packageKey)
    if (existingVersion !== undefined && existingVersion !== archiveRealpath) fail('fixture package version has conflicting archive realpaths: ' + packageKey)
    packageVersions.set(packageKey, archiveRealpath)
    const versions = packagesByName.get(entry.name) ?? []
    versions.push(entry)
    packagesByName.set(entry.name, versions)
    if (entry.manifest?.name !== entry.name || entry.manifest?.version !== entry.version) fail('fixture manifest disagrees with package metadata: ' + packageKey)
    const bytes = await readFile(path)
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    if (entry.size !== bytes.byteLength || entry.sha256 !== sha256) fail('fixture archive checksum or size mismatch: ' + entry.archive)
    const archiveMembers = runCommand('tar', ['-tzf', path]).trim().split('\n').filter(Boolean)
    if (new Set(archiveMembers).size !== archiveMembers.length) fail('fixture tarball contains duplicate members: ' + entry.archive)
    for (const member of archiveMembers) {
      if (member !== 'package/' && (!member.startsWith('package/') || normalize(member) !== member)) fail('fixture tarball has an unsafe member: ' + entry.archive + ' -> ' + member)
    }
    let archiveManifest
    try {
      archiveManifest = JSON.parse(runCommand('tar', ['-xOf', path, 'package/package.json']))
    } catch (error) {
      fail('fixture tarball has no package/package.json: ' + entry.archive + ' (' + String(error) + ')')
    }
    if (JSON.stringify(canonicalJson(installManifestOf(archiveManifest))) !== JSON.stringify(canonicalJson(entry.manifest))) fail('fixture install metadata differs from its tarball package.json: ' + packageKey)
    for (const section of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
      for (const [name, value] of Object.entries(entry.manifest[section] ?? {})) assertNoAlias(value, entry.name + ' ' + section + ' ' + name)
    }
    if (!entry.provenance || entry.provenance.registry !== 'https://registry.npmjs.org' || entry.provenance.tag !== 'v' + entry.version || entry.provenance.commit !== null) {
      if (!entry.name.startsWith('@deepseek-ai/dsh-')) fail('third-party fixture provenance is incomplete: ' + packageKey)
    }
    if (entry.name.startsWith('@deepseek-ai/dsh-')) {
      if (entry.version !== DSH_ALPHA1
        || entry.provenance?.repository !== 'https://github.com/deepseek-ai/deepseek-harness.git'
        || entry.provenance?.tag !== ALPHA1_TAG
        || entry.provenance?.commit !== ALPHA1_COMMIT) fail('non-alpha1 DSH fixture: ' + packageKey)
    }
  }
  if (archiveNames.size !== 0) fail('fixture directory contains unlisted archives: ' + [...archiveNames].join(', '))
  const incomingEdges = new Map()
  for (const entry of manifest.packages) {
    const packageKey = entry.name + '@' + entry.version
    for (const section of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
      for (const [name, range] of Object.entries(entry.manifest[section] ?? {})) {
        const optional = section === 'optionalDependencies' || (section === 'peerDependencies' && entry.manifest.peerDependenciesMeta?.[name]?.optional === true)
        const candidates = packagesByName.get(name) ?? []
        if (candidates.length === 0) {
          if (!optional) fail('fixture dependency closure is missing ' + name + ' required by ' + packageKey)
          continue
        }
        const matching = candidates.filter(candidate => satisfiesVersion(candidate.version, range))
        if (matching.length === 0) fail('fixture dependency closure has no version for ' + name + ' satisfying ' + range + ' required by ' + packageKey)
        for (const candidate of matching) {
          const key = candidate.name + '@' + candidate.version
          incomingEdges.set(key, (incomingEdges.get(key) ?? 0) + 1)
        }
      }
    }
  }
  let multiVersionEdgeCount = 0
  for (const [name, entries] of packagesByName) {
    if (entries.length < 2) continue
    for (const entry of entries) {
      if (incomingEdges.has(name + '@' + entry.version)) multiVersionEdgeCount += 1
    }
  }
  if (multiVersionEdgeCount < 2) fail('fixture has no multi-version dependency edges')
  return { manifest, archiveRoot }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

async function validateLockfile(packageJson, ownerArtifact) {
  const lockfile = await readFile(join(ROOT, 'pnpm-lock.yaml'), 'utf8')
  if (/0\.1\.0-rc|0\.1\.1-rc|0\.1\.2-alpha\.2/u.test(lockfile)) fail('lockfile contains a stale RC or alpha2 DSH version')
  for (const line of lockfile.split('\n')) {
    const record = /^  ['"]?(@deepseek-ai\/dsh-[^@'":]+)@([^'":(]+)(?:\([^)]*\))?['"]?:/u.exec(line)
    if (record !== null && record[2] !== DSH_ALPHA1) fail('lockfile contains a non-alpha1 DSH record: ' + record[1] + '@' + record[2])
  }
  const dshNames = new Set()
  for (const section of ['dependencies', 'optionalDependencies', 'peerDependencies', 'devDependencies']) {
    for (const [name, value] of Object.entries(packageJson[section] ?? {})) {
      assertNoAlias(value, section + ' ' + name)
      if (!name.startsWith('@deepseek-ai/dsh-')) continue
      if (value !== DSH_ALPHA1) fail('manifest DSH dependency is not exact alpha1: ' + name)
      dshNames.add(name)
    }
  }
  for (const name of dshNames) {
    const key = escapeRegex(name)
    const version = DSH_ALPHA1.replaceAll('.', '\\.')
    const pattern = new RegExp("['\"]?" + key + "['\"]?:\\n\\s+specifier: " + version + "\\n\\s+version: " + version + "(?:\\(|$)", 'u')
    if (!pattern.test(lockfile)) fail('lockfile importer does not pin ' + name + ' to alpha1')
  }
  const ownerIntegrity = 'sha512-' + createHash('sha512').update(await readFile(ownerArtifact.artifactPath)).digest('base64')
  const ownerIndex = lockfile.indexOf('dsh-llm-providers-ui@0.1.1:')
  if (ownerIndex < 0 || !lockfile.slice(ownerIndex, ownerIndex + 500).includes(ownerIntegrity)) fail('lockfile does not pin the supplied Providers owner artifact')
}


const ownerArtifact = await validateOwnerArtifact()
const { manifest, archiveRoot } = await validateFixtures()
const packageJson = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'))
if (packageJson.devDependencies?.[OWNER] !== '^0.1.1') fail('owner must be the semantic ^0.1.1 build dependency')
await validateLockfile(packageJson, ownerArtifact)
for (const section of ['dependencies', 'optionalDependencies', 'peerDependencies', 'devDependencies']) {
  if (Object.hasOwn(packageJson[section] ?? {}, OWNER) && section !== 'devDependencies') fail('owner appears in runtime ' + section)
  for (const [name, value] of Object.entries(packageJson[section] ?? {})) assertNoAlias(value, section + ' ' + name)
}
const packDir = await mkdtemp(join(tmpdir(), 'dsh-llm-cursor-pack-'))
const cache = join(packDir, 'store')
const isolatedUserConfig = join(packDir, 'userconfig.npmrc')
const isolatedGlobalConfig = join(packDir, 'globalconfig.npmrc')
childIsolation = { userConfig: isolatedUserConfig, globalConfig: isolatedGlobalConfig, storeDir: cache }
let primaryError
try {
  await mkdir(cache, { recursive: true })
  await writeFile(isolatedUserConfig, 'registry=' + INVALID_REGISTRY + '\n@deepseek-ai:registry=' + INVALID_REGISTRY + '\nfetch-retries=0\nfetch-timeout=1000\naudit=false\nfund=false\n')
  await writeFile(isolatedGlobalConfig, '')
  const sentinelName = 'DSH_PACK_GATE_SECRET'
  const previousSentinel = process.env[sentinelName]
  process.env[sentinelName] = 'must-not-cross'
  try {
    const negative = [
      "const allowedPackageConfig = new Set(['npm_config_userconfig', 'npm_config_globalconfig', 'npm_config_registry', 'npm_config_cache', 'pnpm_config_store_dir'])",
      "const forbidden = Object.keys(process.env).filter(name => /(?:KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL|AUTH|CLOUD)/iu.test(name) || /^(?:npm|pnpm|yarn|corepack)_config_/iu.test(name)).filter(name => !allowedPackageConfig.has(name))",
      "if (process.env.DSH_PACK_GATE_SECRET !== undefined) throw new Error('pack child inherited sentinel secret')",
      "if (forbidden.length > 0) throw new Error('pack child inherited forbidden environment: ' + forbidden.join(','))",
      "if (process.env.NODE_PATH !== '' || process.env.NODE_OPTIONS !== '') throw new Error('pack child Node environment is not empty')",
      `if (process.env.npm_config_userconfig !== ${JSON.stringify(isolatedUserConfig)} || process.env.npm_config_globalconfig !== ${JSON.stringify(isolatedGlobalConfig)}) throw new Error('pack child userconfig is not isolated')`,
      `if (process.env.npm_config_registry !== ${JSON.stringify(INVALID_REGISTRY)}) throw new Error('pack child registry is not invalid')`,
      `if (process.env.pnpm_config_store_dir !== ${JSON.stringify(cache)}) throw new Error('pack child store is not isolated')`,
    ].join('\n')
    runCommand(process.execPath, ['--input-type=module', '-e', negative])
  } finally {
    if (previousSentinel === undefined) delete process.env[sentinelName]
    else process.env[sentinelName] = previousSentinel
  }
  const { report: packReport, files: reportFiles } = parsePackReport(runNpm(['pack', '--dry-run', '--json', '--ignore-scripts']))
  if (packReport.name !== packageJson.name || packReport.version !== packageJson.version) fail('npm pack report has the wrong package identity')
  const packOutput = runNpm(['pack', '--ignore-scripts', '--pack-destination', packDir])
  const packedNames = (await readdir(packDir)).filter(name => name.endsWith('.tgz'))
  if (packedNames.length !== 1) fail('npm pack did not produce exactly one real tarball')
  const packPath = join(packDir, packedNames[0])
  if (packReport.filename !== packedNames[0] || !packOutput.includes(packedNames[0])) fail('npm pack report and output disagree about its tarball')
  const tarList = runCommand('tar', ['-tzf', packPath]).trim().split('\n').filter(Boolean)
  if (new Set(tarList).size !== tarList.length) fail('npm pack tarball contains duplicate members')
  for (const member of tarList) {
    if (!member.startsWith('package/') || normalize(member) !== member) fail('npm pack tarball has an unsafe member: ' + member)
  }
  const packedFiles = new Set(tarList.filter(name => name !== 'package/' && !name.endsWith('/')).map(name => name.slice('package/'.length)))
  if (packedFiles.size !== reportFiles.size || [...packedFiles].some(file => !reportFiles.has(file))) fail('npm pack report and tarball contents disagree')
  const requiredFiles = [
    'LICENSE', 'NOTICE', 'README.md', 'README.zh.md',
    'docs/adr/0002-adapter-owned-run-lifecycle.md',
    'docs/adr/0002-adapter-owned-run-lifecycle.zh.md',
    'package.json', 'cordis.patch.yml', 'lib/index.js', 'lib/invariant.js', 'lib/client.js',
    'lib/types/index.d.ts', 'lib/types/invariant.d.ts', 'lib/types/client/index.d.ts',
  ]
  for (const file of requiredFiles) if (!packedFiles.has(file)) fail('packed plugin is missing ' + file)
  for (const file of packedFiles) {
    if (/^(?:src|tests|scripts|node_modules|prototypes)\//u.test(file)
      || /(?:^|\/)\.env(?:\.|$)/u.test(file)
      || /(?:^|[\/_.-])(?:credential|credentials|token|tokens|auth|authentication)(?:[\/_.-]|$)/iu.test(file)) fail('packed plugin contains forbidden path ' + file)
  }
  const packageManifest = packageJson
  if (packageManifest.exports?.['./src/*']) fail('package.json must not export ./src/*')
  const exportTargets = []
  collectExportTargets(packageManifest.exports, '.', exportTargets)
  for (const { subpath, target } of exportTargets) {
    if (!target.startsWith('./')) fail('export ' + subpath + ' is not a package-relative target: ' + target)
    const rel = target.slice(2)
    if (rel.split('/').includes('..')) fail('export ' + subpath + ' escapes the package: ' + target)
    if (!packedFiles.has(rel)) fail('export ' + subpath + ' points to missing ' + target)
  }

  const consumer = join(packDir, 'consumer')
  await mkdir(consumer, { recursive: true })
  const consumerDependencies = { [packageJson.name]: 'file:' + packPath }
  const fixtureOverrides = {}
  const fixturePackagesByName = new Map()
  for (const entry of manifest.packages) {
    const entries = fixturePackagesByName.get(entry.name) ?? []
    entries.push(entry)
    fixturePackagesByName.set(entry.name, entries)
  }
  const supportsCurrentPlatform = (entry) => (entry.manifest.os === undefined || entry.manifest.os.includes(process.platform))
    && (entry.manifest.cpu === undefined || entry.manifest.cpu.includes(process.arch))
  const fixtureArchiveFor = (name, range, requester, platformOnly = false) => {
    const candidate = (fixturePackagesByName.get(name) ?? []).find(entry => (!platformOnly || supportsCurrentPlatform(entry)) && satisfiesVersion(entry.version, range))
    if (candidate === undefined) fail('fixture override has no candidate for ' + requester + ' -> ' + name + '@' + range)
    return 'file:' + resolve(archiveRoot, candidate.archive)
  }
  const addFixtureEdges = (parent, metadata) => {
    for (const section of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
      for (const [name, range] of Object.entries(metadata[section] ?? {})) {
        const optional = section === 'optionalDependencies' || (section === 'peerDependencies' && metadata.peerDependenciesMeta?.[name]?.optional === true)
        const candidates = fixturePackagesByName.get(name) ?? []
        const platformCandidates = candidates.filter(supportsCurrentPlatform)
        if (optional && (candidates.length === 0 || (section === 'optionalDependencies' && platformCandidates.length === 0))) continue
        const archive = fixtureArchiveFor(name, range, parent, section === 'optionalDependencies')
        fixtureOverrides[parent + '>' + name] = archive
        if (section === 'peerDependencies' && consumerDependencies[name] === undefined) consumerDependencies[name] = archive
      }
    }
  }
  addFixtureEdges(packageJson.name + '@' + packageJson.version, packageJson)
  for (const entry of manifest.packages) addFixtureEdges(entry.name + '@' + entry.version, entry.manifest)
  await writeFile(join(consumer, 'package.json'), JSON.stringify({
    name: 'dsh-llm-cursor-pack-consumer',
    private: true,
    type: 'module',
    dependencies: consumerDependencies,
    pnpm: { overrides: fixtureOverrides },
  }, null, 2) + '\n')
  await writeFile(join(consumer, '.npmrc'), 'registry=' + INVALID_REGISTRY + '\n@deepseek-ai:registry=' + INVALID_REGISTRY + '\nfetch-retries=0\nfetch-timeout=1000\naudit=false\nfund=false\n')
  runPnpm(['install', '--store-dir', cache, '--offline', '--ignore-scripts', '--registry', INVALID_REGISTRY], consumer)
  if ((await readdir(cache)).length === 0) fail('fresh pnpm store was not populated')
  if (!(await readdir(consumer)).includes('pnpm-lock.yaml')) fail('normal pnpm install did not create a lockfile')
  await rm(join(consumer, 'node_modules'), { recursive: true, force: true })
  runPnpm(['install', '--store-dir', cache, '--offline', '--frozen-lockfile', '--ignore-scripts', '--registry', INVALID_REGISTRY], consumer)

  const installedNodeModules = join(consumer, 'node_modules')
  const nodeModulesInfo = await lstat(installedNodeModules)
  if (!nodeModulesInfo.isDirectory() || nodeModulesInfo.isSymbolicLink()) fail('pnpm did not create a real consumer node_modules directory')
  const pnpmVirtualStore = join(installedNodeModules, '.pnpm')
  const virtualStoreInfo = await lstat(pnpmVirtualStore)
  if (!virtualStoreInfo.isDirectory() || virtualStoreInfo.isSymbolicLink()) fail('consumer node_modules is missing pnpm virtual store')
  const modulesManifest = await lstat(join(installedNodeModules, '.modules.yaml'))
  if (!modulesManifest.isFile() || modulesManifest.isSymbolicLink()) fail('consumer node_modules is missing pnpm metadata')
  const installedRoot = join(installedNodeModules, 'dsh-llm-cursor')
  const installedLink = await lstat(installedRoot)
  if (!installedLink.isSymbolicLink()) fail('consumer package was not linked by pnpm')
  const installedManifest = JSON.parse(await readFile(join(installedRoot, 'package.json'), 'utf8'))
  const packedManifest = JSON.parse(runCommand('tar', ['-xOf', packPath, 'package/package.json']))
  if (JSON.stringify(canonicalJson(installedManifest)) !== JSON.stringify(canonicalJson(packedManifest))) fail('installed tarball metadata differs from the packed manifest')
  if (installedManifest.name !== packageManifest.name || installedManifest.version !== packageManifest.version) fail('installed tarball manifest does not match the package')
  if (installedManifest.exports?.['./src/*']) fail('packed package.json still exports ./src/*')
  const installedFiles = new Set()
  async function collectFiles(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const rel = prefix + entry.name
      if (entry.isDirectory()) await collectFiles(join(directory, entry.name), rel + '/')
      else installedFiles.add(rel)
    }
  }
  await collectFiles(installedRoot)
  if ([...installedFiles].some(file => file === 'src' || file.startsWith('src/'))) fail('installed package contains source files')
  for (const { subpath, target } of exportTargets) {
    if (!target.startsWith('./') || target.slice(2).split('/').includes('..')) fail('installed export ' + subpath + ' is unsafe: ' + target)
    if (!installedFiles.has(target.slice(2))) fail('installed export ' + subpath + ' is missing ' + target)
  }
  for (const field of ['main', 'types']) {
    if (typeof installedManifest[field] !== 'string' || !installedFiles.has(installedManifest[field])) fail('installed ' + field + ' target is missing')
  }

  const declaredRuntime = new Set([
    ...Object.keys(packageManifest.dependencies ?? {}),
    ...Object.keys(packageManifest.optionalDependencies ?? {}),
    ...Object.keys(packageManifest.peerDependencies ?? {}),
  ])
  const visited = new Set()
  async function inspect(rel) {
    if (visited.has(rel)) return
    visited.add(rel)
    const source = await readFile(join(installedRoot, rel), 'utf8')
    for (const specifier of importSpecifiers(source)) {
      if (specifier.startsWith('node:')) continue
      if (specifier.startsWith('.')) {
        const child = resolvePackedImport(rel, specifier, packedFiles)
        if (child === undefined) fail('relative runtime import is outside the packed static closure: ' + rel + ' -> ' + specifier)
        await inspect(child)
        continue
      }
      const name = packageNameOf(specifier)
      if (name === OWNER) fail('packed runtime still imports the Providers UI owner')
      if (!declaredRuntime.has(name)) fail('undeclared packed runtime import ' + specifier + ' in ' + rel)
    }
  }
  const staticEntries = new Set([packageManifest.main, 'lib/invariant.js', 'lib/client.js'])
  for (const { target } of exportTargets) {
    if (target.startsWith('./') && !target.includes('..') && /\.(?:js|mjs|cjs)$/u.test(target)) staticEntries.add(target.slice(2))
  }
  const smoke = [
    "import { createRequire } from 'node:module'",
    "import { join } from 'node:path'",
    "import { pathToFileURL } from 'node:url'",
    "if (process.env.NODE_PATH !== '' || process.env.NODE_OPTIONS !== '') throw new Error('Node environment must be empty for public entry smokes')",
    "const clientFile = join(process.cwd(), 'node_modules/dsh-llm-cursor/lib/client.js')",
    "const require = createRequire(pathToFileURL(clientFile))",
    "const externalRequire = name => { if (name === 'dsh-llm-providers-ui') throw new Error('client factory requested the owner'); return require(name) }",
    "const loader = {",
    "  mode: 'queue',",
    "  pendingQueue: [],",
    "  load(registration) {",
    "    if (loader.mode === 'queue') { loader.pendingQueue.push(registration); return }",
    "    loader.registrations.set(registration.id, registration)",
    "  },",
    "  create() {",
    "    if (loader.mode !== 'queue') throw new Error('ModuleLoader was created twice')",
    "    loader.registrations = new Map(loader.pendingQueue.splice(0).map(registration => [registration.id, registration]))",
    "    loader.mode = 'live'",
    "    return { import: async id => { const registration = loader.registrations.get(id); if (registration === undefined) throw new Error('missing ModuleLoader registration ' + id); return registration.factory(externalRequire) } }",
    "  },",
    "  registrations: new Map(),",
    "}",
    "globalThis.window = { __ModuleLoader__: loader }",
    "await import('dsh-llm-cursor/client')",
    "if (loader.mode !== 'queue' || loader.pendingQueue.length !== 1) throw new Error('client ModuleLoader did not queue exactly one row')",
    "const [row] = loader.pendingQueue",
    "if (row?.id !== 'dsh-llm-cursor' || typeof row.factory !== 'function') throw new Error('client ModuleLoader row is wrong')",
    "const client = await loader.create().import('dsh-llm-cursor')",
    "const expectedInject = ['slots', 'locale', 'connection', 'settingsScope']",
    "if (client.name !== 'dsh-llm-cursor-client' || JSON.stringify(client.inject) !== JSON.stringify(expectedInject)) throw new Error('client ModuleLoader exports have the wrong name or inject')",
    "if (typeof client.apply !== 'function') throw new Error('client ModuleLoader factory smoke failed')",
  ].join('\n')
  runCommand(process.execPath, ['--input-type=module', '-e', smoke], consumer)
  console.log('pack check passed: real tarball, exports, static closure, offline fixtures, and public entry smokes verified')
} catch (error) {
  primaryError = error
  throw error
} finally {
  await cleanupPackDir(packDir, primaryError)
}
