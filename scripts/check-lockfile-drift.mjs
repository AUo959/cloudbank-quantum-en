#!/usr/bin/env node
/* eslint-env node */
// ANCHOR: LOCKFILE_DRIFT_CHECK:T1 – input parsing

// Detects drift between package.json and package-lock.json by asking npm to
// regenerate the lockfile in-memory, comparing hashes, and restoring the file
// if differences are found (unless --fix is passed).
//
// Enhanced with symbolic AI simulation conventions: traceable anchors,
// entropy/memory sealing, manifests, and DLP tagging.
//
// Usage:
//   - node scripts/check-lockfile-drift.mjs              # exits non-zero if drift
//   - node scripts/check-lockfile-drift.mjs --fix        # updates lockfile in place
//   - node scripts/check-lockfile-drift.mjs --stdout-json # JSON output only
//   - node scripts/check-lockfile-drift.mjs --manifest-out path.json --glyph-out path.md

import { checkLockfileDrift, writeManifest, writeGlyphcard } from './lib/lockfile-drift.mjs'

// ANCHOR: LOCKFILE_DRIFT_CHECK:T2 – CLI argument parsing
function parseArgs(argv) {
  const args = {
    fix: false,
    stdoutJson: false,
    manifestOut: null,
    glyphOut: null,
    seed: 'EOS_SEED_ORION',
    previewLines: 80,
    captureDiff: false,
    help: false
  }

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case '--fix':
        args.fix = true
        break
      case '--stdout-json':
        args.stdoutJson = true
        break
      case '--manifest-out':
        args.manifestOut = argv[++i]
        break
      case '--glyph-out':
        args.glyphOut = argv[++i]
        break
      case '--seed':
        args.seed = argv[++i]
        break
      case '--preview-lines':
        args.previewLines = parseInt(argv[++i], 10)
        break
      case '--capture-diff':
        args.captureDiff = true
        break
      case '--help':
      case '-h':
        args.help = true
        break
      default:
        console.error(`Unknown argument: ${arg}`)
        process.exit(1)
    }
  }

  return args
}

function showHelp() {
  console.log(`
Cloudbank Quantum Lockfile Drift Checker

Usage: node scripts/check-lockfile-drift.mjs [options]

Options:
  --fix                    Update package-lock.json in place
  --stdout-json           Print JSON report to stdout (no other output)
  --manifest-out <path>   Write JSON manifest to specified path
  --glyph-out <path>      Write Markdown glyphcard to specified path
  --seed <value>          Override entropy seed (default: EOS_SEED_ORION)
  --preview-lines <n>     Lines to include in diff preview (default: 80)
  --capture-diff          Include git diff preview in output
  --help, -h              Show this help

Anchors: LOCKFILE_DRIFT_CHECK:T1–T4, SRB:LOCKFILE_DRIFT
Seed: EOS_SEED_ORION (override with --seed)
Ethics/Notes: This tool emits low-sensitivity metadata with DLP tags.

Examples:
  node scripts/check-lockfile-drift.mjs
  node scripts/check-lockfile-drift.mjs --fix
  node scripts/check-lockfile-drift.mjs --stdout-json
  node scripts/check-lockfile-drift.mjs --manifest-out .artifacts/drift.json --glyph-out .artifacts/drift.md
`)
}

// ANCHOR: LOCKFILE_DRIFT_CHECK:T3 – main execution
async function main() {
  try {
    const args = parseArgs(process.argv)

    if (args.help) {
      showHelp()
      process.exit(0)
    }

    // ANCHOR: LOCKFILE_DRIFT_CHECK:T4 – drift detection and output
    const manifest = await checkLockfileDrift({
      fix: args.fix,
      seed: args.seed,
      previewLines: args.previewLines,
      captureDiff: args.captureDiff || args.manifestOut || args.glyphOut
    })

    // Write artifacts if requested
    if (args.manifestOut) {
      writeManifest(manifest, args.manifestOut)
    }
    if (args.glyphOut) {
      writeGlyphcard(manifest, args.glyphOut)
    }

    // Handle output modes
    if (args.stdoutJson) {
      console.log(JSON.stringify(manifest, null, 2))
      process.exit(0)
    }

    // Traditional console output for compatibility
    if (manifest.status === 'ok') {
      console.log('Lockfile check: OK — no drift detected.')
      process.exit(0)
    } else if (manifest.status === 'fixed') {
      console.log('Lockfile check: DRIFT FOUND and FIXED — package-lock.json updated. Please commit the change.')
      process.exit(0)
    } else {
      // Drift detected, not fixed
      console.error('Lockfile check: DRIFT DETECTED — package-lock.json is out of sync with package.json.')
      console.error('Run: npm install  (or: npm run lockfile:fix) to update the lockfile, then commit it.')
      
      if (manifest.diffPreview) {
        console.error('\n— Diff preview —')
        console.error(manifest.diffPreview)
      }
      
      process.exit(2)
    }

  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

main()