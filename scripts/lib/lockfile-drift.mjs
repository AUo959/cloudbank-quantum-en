import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFile, cp, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)
const npmArgs = [
  'install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund', '--loglevel=error',
]

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function canonicalJSON(value, indent = '') {
  return JSON.stringify(value, (_, entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return entry
    return Object.fromEntries(Object.entries(entry).sort(([left], [right]) => {
      if (left === right) return 0
      return left < right ? -1 : 1
    }))
  }, indent)
}

function formatLockfile(value, original) {
  const indent = original.match(/\n([ \t]+)"/)?.[1] ?? ''
  const newline = original.includes('\r\n') ? '\r\n' : '\n'
  const json = JSON.stringify(value, null, indent).replaceAll('\n', newline)
  return original.endsWith('\n') ? json + newline : json
}

async function copyNpmConfig(root, scratch) {
  try {
    await copyFile(join(root, '.npmrc'), join(scratch, '.npmrc'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

const generatedDirectories = new Set(['.git', '.artifacts', 'node_modules'])

async function copyWorkspaceInputs(root, scratch, workspaces) {
  const patterns = Array.isArray(workspaces) ? workspaces : workspaces?.packages ?? []
  const prefixes = patterns.map((pattern) => pattern.replace(/^!?(\.\/)?/, '').split('/')[0])
  const rootNames = prefixes.some((prefix) => ['*', '?', '[', '{', '('].some((token) => prefix.includes(token)))
    ? (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    : prefixes
  const directories = new Set(rootNames.filter((name) => name && name !== '..' && !generatedDirectories.has(name)))
  await Promise.all([...directories].map(async (name) => {
    try {
      await cp(join(root, name), join(scratch, name), {
        recursive: true,
        filter: (source) => !generatedDirectories.has(basename(source)),
      })
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }))
}

async function regenerate(root, scratch, manifest, original) {
  const { workspaces } = JSON.parse(manifest)
  await Promise.all([
    writeFile(join(scratch, 'package.json'), manifest),
    writeFile(join(scratch, 'package-lock.json'), original),
    copyNpmConfig(root, scratch),
    copyWorkspaceInputs(root, scratch, workspaces),
  ])
  const [command, args] = process.platform === 'win32'
    ? ['cmd.exe', ['/d', '/s', '/c', ['npm', ...npmArgs].join(' ')]]
    : ['npm', npmArgs]
  try {
    await run(command, args, { cwd: scratch })
  } catch (error) {
    throw new Error(`npm could not regenerate the lockfile (${error.code ?? error.signal ?? 'unknown error'}).`)
  }
  return JSON.parse(await readFile(join(scratch, 'package-lock.json'), 'utf8'))
}

async function previewDiff(scratch, original, updated, previewLines = 80) {
  await Promise.all([
    writeFile(join(scratch, 'original.json'), canonicalJSON(original, 2) + '\n'),
    writeFile(join(scratch, 'updated.json'), canonicalJSON(updated, 2) + '\n'),
  ])
  try {
    await run('git', [
      'diff', '--no-index', '--no-ext-diff', '--no-textconv', '--no-color', '--',
      'original.json', 'updated.json',
    ], { cwd: scratch })
  } catch (error) {
    if (error.code === 1) return error.stdout.trimEnd().split('\n').slice(0, previewLines).join('\n')
    return 'Git diff preview unavailable.'
  }
  return ''
}

async function replaceLockfile(root, packagePath, lockPath, manifest, original, updated) {
  const staging = await mkdtemp(join(root, '.lockfile-drift-'))
  try {
    const candidate = join(staging, 'package-lock.json')
    const { mode } = await stat(lockPath)
    await writeFile(candidate, updated, { mode: mode & 0o777 })
    const [currentManifest, currentLock] = await Promise.all([
      readFile(packagePath, 'utf8'),
      readFile(lockPath, 'utf8'),
    ])
    if (currentManifest !== manifest || currentLock !== original) {
      throw new Error('Package files changed during the check. Run it again.')
    }
    await rename(candidate, lockPath)
  } finally {
    await rm(staging, { recursive: true, force: true })
  }
}

function makeReport({ drifted, fix, seed, original, updated, diffPreview }) {
  const status = drifted ? (fix ? 'fixed' : 'drift') : 'ok'
  return {
    version: '1.0.0',
    anchors: ['ANCHOR: LOCKFILE_DRIFT_CHECK:T1', 'SRB:LOCKFILE_DRIFT'],
    seed: seed ?? 'EOS_SEED_ORION',
    timestamp: new Date().toISOString(),
    status,
    drifted,
    lockPath: 'package-lock.json',
    originalHash: sha256(original),
    updatedHash: sha256(updated),
    dlp: {
      confidentiality: diffPreview ? 'internal' : 'low',
      critical: ['package-lock.json hash'],
      tags: ['build', 'ci', 'lockfile'],
    },
    notes: {
      ok: 'The lockfile is in sync.',
      drift: 'Run npm run lockfile:fix and review the updated lockfile.',
      fixed: 'Review the updated lockfile before committing it.',
    }[status],
    ...(diffPreview === undefined ? {} : { diffPreview }),
  }
}

export async function checkLockfileDrift(options = {}) {
  const root = resolve(options.root ?? process.cwd())
  const packagePath = resolve(root, 'package.json')
  const lockPath = resolve(root, 'package-lock.json')
  const [manifest, original] = await Promise.all([
    readFile(packagePath, 'utf8'),
    readFile(lockPath, 'utf8'),
  ])
  const before = JSON.parse(original)
  const scratch = await mkdtemp(join(tmpdir(), 'lockfile-drift-'))
  try {
    const after = await regenerate(root, scratch, manifest, original)
    const drifted = canonicalJSON(before) !== canonicalJSON(after)
    const updated = drifted ? formatLockfile(after, original) : original
    const diffPreview = drifted && options.captureDiff
      ? await previewDiff(scratch, before, after, options.previewLines)
      : undefined
    if (drifted && options.fix) await replaceLockfile(root, packagePath, lockPath, manifest, original, updated)
    return makeReport({
      drifted, fix: options.fix, seed: options.seed, original, updated, diffPreview,
    })
  } finally {
    await rm(scratch, { recursive: true, force: true })
  }
}

async function writeReport(targetPath, content) {
  await mkdir(dirname(targetPath), { recursive: true })
  await writeFile(targetPath, content)
}

export function writeManifest(manifest, targetPath) {
  return writeReport(targetPath, canonicalJSON(manifest, 2) + '\n')
}

export function writeGlyphcard(manifest, targetPath) {
  return writeReport(targetPath, [
    '# Lockfile drift',
    '',
    `- Status: ${manifest.status}`,
    `- Checked: ${manifest.timestamp}`,
    `- Anchors: ${manifest.anchors.join(', ')}`,
    `- Seed: ${JSON.stringify(manifest.seed)}`,
    `- Original SHA-256: \`${manifest.originalHash}\``,
    `- Updated SHA-256: \`${manifest.updatedHash}\``,
    '',
    manifest.notes,
    '',
  ].join('\n'))
}
