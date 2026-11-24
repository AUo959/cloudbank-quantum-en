#!/usr/bin/env node
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { checkLockfileDrift, writeGlyphcard, writeManifest } from './lib/lockfile-drift.mjs'

const usage = `Usage: node scripts/check-lockfile-drift.mjs [options]

  --fix                    Apply verified drift to package-lock.json
  --stdout-json            Print one JSON report on stdout
  --manifest-out PATH      Manifest path (default .artifacts/lockfile-drift-manifest.json)
  --glyphcard-out PATH     Markdown path on drift (default .artifacts/lockfile-drift-glyphcard.md)
  --glyph-out PATH         Alias for --glyphcard-out
  --seed VALUE             Report seed (default EOS_SEED_ORION)
  --capture-diff           Include a Git diff preview in the manifest
  --no-diff                Omit the diff preview (default)
  --preview-lines COUNT    Limit the preview to COUNT lines (default 80)
  -h, --help               Show this help
`

function reportPaths(options) {
  const manifest = options['manifest-out'] ?? '.artifacts/lockfile-drift-manifest.json'
  const glyphcard = options['glyphcard-out'] ?? options['glyph-out'] ?? '.artifacts/lockfile-drift-glyphcard.md'
  const protectedPaths = ['package.json', 'package-lock.json', '.npmrc'].map((file) => resolve(file))
  const destinations = [resolve(manifest), resolve(glyphcard)]
  if (new Set(destinations).size !== destinations.length
    || destinations.some((path) => protectedPaths.includes(path))) {
    throw new Error('Report paths must be distinct and separate from npm inputs.')
  }
  return { manifest, glyphcard }
}

function parseOptions() {
  const { values } = parseArgs({
    options: {
      fix: { type: 'boolean' },
      'stdout-json': { type: 'boolean' },
      'manifest-out': { type: 'string' },
      'glyphcard-out': { type: 'string' },
      'glyph-out': { type: 'string' },
      seed: { type: 'string' },
      'capture-diff': { type: 'boolean' },
      'no-diff': { type: 'boolean' },
      'preview-lines': { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  })
  const previewLines = Number(values['preview-lines'] ?? 80)
  if (!Number.isSafeInteger(previewLines) || previewLines < 1) {
    throw new Error('--preview-lines must be a positive integer.')
  }
  return { ...values, previewLines }
}

async function main() {
  const options = parseOptions()
  if (options.help) {
    process.stdout.write(usage)
    return
  }

  const paths = reportPaths(options)
  const manifest = await checkLockfileDrift({
    fix: options.fix,
    seed: options.seed,
    previewLines: options.previewLines,
    captureDiff: options['capture-diff'] && !options['no-diff'],
  })
  await writeManifest(manifest, paths.manifest)
  if (manifest.drifted) await writeGlyphcard(manifest, paths.glyphcard)

  if (options['stdout-json']) {
    console.log(JSON.stringify(manifest))
  } else if (manifest.status === 'drift') {
    console.error('Lockfile check: DRIFT DETECTED — package-lock.json is out of sync with package.json.')
    console.error(manifest.notes)
  } else {
    console.log(manifest.status === 'fixed'
      ? 'Lockfile check: DRIFT FOUND and FIXED — package-lock.json updated. Please commit the change.'
      : 'Lockfile check: OK — no drift detected.')
  }

  if (manifest.status === 'drift') process.exitCode = 2
}

try {
  await main()
} catch (error) {
  console.error(`Lockfile check failed: ${error.message}`)
  process.exitCode = 1
}
