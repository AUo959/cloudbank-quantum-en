import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { checkLockfileDrift, sha256 } from '../scripts/lib/lockfile-drift.mjs'

const cli = fileURLToPath(new URL('../scripts/check-lockfile-drift.mjs', import.meta.url))

async function fixture(t, { version = '1.0.0' } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'lockfile-drift-test-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const lock = {
    name: 'fixture',
    version: '1.0.0',
    lockfileVersion: 3,
    requires: true,
    packages: { '': { name: 'fixture', version: '1.0.0' } },
  }
  const lockPath = join(root, 'package-lock.json')
  const packagePath = join(root, 'package.json')
  const original = JSON.stringify(lock, null, '\t').replaceAll('\n', '\r\n') + '\r\n'
  await writeFile(packagePath, JSON.stringify({ name: 'fixture', version }, null, 2) + '\n')
  await writeFile(lockPath, original)
  return { root, lockPath, packagePath, original }
}

function runCli(root, ...args) {
  const result = spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' })
  if (result.error) throw result.error
  return result
}

test('ignores npm formatting changes and preserves the original bytes', async (t) => {
  const { root, lockPath, original } = await fixture(t)
  const report = await checkLockfileDrift({ root, fix: true })
  assert.equal(report.status, 'ok')
  assert.equal(report.updatedHash, sha256(original))
  assert.equal(await readFile(lockPath, 'utf8'), original)
})

test('check mode reports real drift and the candidate hash without writing the lockfile', async (t) => {
  const { root, lockPath, original } = await fixture(t, { version: '1.1.0' })
  const report = await checkLockfileDrift({ root, captureDiff: true, previewLines: 8 })
  assert.equal(report.status, 'drift')
  assert.equal(report.originalHash, sha256(original))
  assert.notEqual(report.updatedHash, report.originalHash)
  assert.ok(report.diffPreview.includes('diff --git'))
  assert.ok(report.diffPreview.split('\n').length <= 8)
  assert.equal(await readFile(lockPath, 'utf8'), original)
})

test('fix writes the candidate with the original formatting, and a second fix is a no-op', async (t) => {
  const { root, lockPath } = await fixture(t, { version: '1.1.0' })
  const report = await checkLockfileDrift({ root, fix: true })
  const updated = await readFile(lockPath, 'utf8')
  assert.equal(report.status, 'fixed')
  assert.equal(report.updatedHash, sha256(updated))
  assert.equal(JSON.parse(updated).packages[''].version, '1.1.0')
  assert.ok(updated.includes('\r\n\t"name"'))
  assert.equal((await checkLockfileDrift({ root, fix: true })).status, 'ok')
  assert.equal(await readFile(lockPath, 'utf8'), updated)
})

test('CLI emits one JSON report with the legacy alias and exits 2 on drift', async (t) => {
  const { root, lockPath, original } = await fixture(t, { version: '1.1.0' })
  const result = runCli(root, '--stdout-json', '--glyph-out', 'reports/card.md', '--seed', 'fixture-run')
  assert.equal(result.status, 2, result.stderr)
  assert.equal(result.stderr, '')
  assert.equal(result.stdout.trimEnd().split('\n').length, 1)
  const report = JSON.parse(result.stdout)
  assert.equal(report.seed, 'fixture-run')
  assert.equal(report.status, 'drift')
  assert.deepEqual(JSON.parse(await readFile(join(root, '.artifacts/lockfile-drift-manifest.json'), 'utf8')), report)
  assert.ok((await readFile(join(root, 'reports/card.md'), 'utf8')).includes(report.updatedHash))
  assert.equal(await readFile(lockPath, 'utf8'), original)
})

test('CLI reports regeneration failures without changing the working lockfile', async (t) => {
  const { root, lockPath, packagePath, original } = await fixture(t)
  await writeFile(packagePath, '{{invalid JSON')
  const result = runCli(root, '--stdout-json', '--fix')
  assert.equal(result.status, 1)
  assert.equal(result.stdout, '')
  assert.ok(result.stderr.includes('npm could not regenerate the lockfile'))
  assert.equal(await readFile(lockPath, 'utf8'), original)
})

test('CLI protects the npm inputs from report output', async (t) => {
  const { root, lockPath, original } = await fixture(t)
  const result = runCli(root, '--manifest-out', './package-lock.json')
  assert.equal(result.status, 1)
  assert.equal(await readFile(lockPath, 'utf8'), original)
})
