#!/usr/bin/env node
/* eslint-env node */

// Detects drift between package.json and package-lock.json by asking npm to
// regenerate the lockfile in-memory, comparing hashes, and restoring the file
// if differences are found (unless --fix is passed).
//
// Usage:
//   - node scripts/check-lockfile-drift.mjs          # exits non-zero if drift
//   - node scripts/check-lockfile-drift.mjs --fix    # updates lockfile in place

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.cwd())
const pkgPath = resolve(root, 'package.json')
const lockPath = resolve(root, 'package-lock.json')

const hasFixFlag = process.argv.includes('--fix')

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex')
}

function die(msg) {
  console.error(msg)
  process.exit(1)
}

if (!existsSync(pkgPath)) die('package.json not found. Run from project root.')
if (!existsSync(lockPath)) die('package-lock.json not found. Run npm install first.')

const original = readFileSync(lockPath)
const originalHash = sha256(original)

// Ask npm to (re)compute the lockfile only, without installing modules.
// Keep it quiet and fast; avoid scripts/audit/fund noise.
const npmArgs = ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund', '--loglevel=error']
const res = spawnSync('npm', npmArgs, { stdio: hasFixFlag ? 'inherit' : 'pipe' })
if (res.error) die(`Failed to run npm: ${res.error.message}`)
if (res.status !== 0) die(`npm ${npmArgs.join(' ')} exited with code ${res.status}`)

const updated = readFileSync(lockPath)
const updatedHash = sha256(updated)

const drifted = originalHash !== updatedHash

if (!drifted) {
  if (!hasFixFlag) {
    // Restore exactly to avoid churn if npm changed formatting
    writeFileSync(lockPath, original)
  }
  console.log('Lockfile check: OK — no drift detected.')
  process.exit(0)
}

// Drift detected
if (!hasFixFlag) {
  // Restore original content so the working tree remains clean after the check
  writeFileSync(lockPath, original)
  console.error('Lockfile check: DRIFT DETECTED — package-lock.json is out of sync with package.json.')
  console.error('Run: npm install  (or: npm run lockfile:fix) to update the lockfile, then commit it.')
  // Optionally emit a short diff using git if available and the file is tracked
  try {
    const diff = spawnSync('git', ['diff', '--no-ext-diff', '--', 'package-lock.json'], { encoding: 'utf8' })
    if (diff && diff.stdout) {
      const lines = diff.stdout.trim().split('\n')
      const preview = lines.slice(0, 80).join('\n') // cap output
      if (preview) {
        console.error('\n— Diff preview (first 80 lines) —')
        console.error(preview)
        if (lines.length > 80) console.error(`\n… (${lines.length - 80} more lines)`) 
      }
    }
  } catch (e) { void e }
  process.exit(2)
}

// --fix path: keep the updated lockfile on disk
console.log('Lockfile check: DRIFT FOUND and FIXED — package-lock.json updated. Please commit the change.')
process.exit(0)