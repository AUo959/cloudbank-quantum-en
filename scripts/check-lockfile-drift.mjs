#!/usr/bin/env node
/* eslint-env node */

// Thin CLI wrapper for lockfile drift detection with enhanced features
// Supports structured output, manifest generation, and symbolic AI conventions
//
// Usage:
//   - node scripts/check-lockfile-drift.mjs              # basic drift check
//   - node scripts/check-lockfile-drift.mjs --fix        # fix drift by updating lockfile
//   - node scripts/check-lockfile-drift.mjs --stdout-json # output JSON to stdout
//   - node scripts/check-lockfile-drift.mjs --manifest-out path.json --glyphcard-out path.md

import { checkLockfileDrift, writeManifest, writeGlyphcard } from './lib/lockfile-drift.mjs'

// Parse command line arguments
const args = process.argv.slice(2)
const flags = {
  fix: args.includes('--fix'),
  stdoutJson: args.includes('--stdout-json'),
  manifestOut: getArgValue(args, '--manifest-out'),
  glyphcardOut: getArgValue(args, '--glyphcard-out'),
  previewLines: parseInt(getArgValue(args, '--preview-lines') || '80', 10),
  seed: getArgValue(args, '--seed')
}

function getArgValue(args, flag) {
  const index = args.indexOf(flag)
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null
}

function die(msg, code = 1) {
  if (!flags.stdoutJson) {
    console.error(msg)
  }
  process.exit(code)
}

async function main() {
  try {
    // Call pure library function
    const result = await checkLockfileDrift({
      fix: flags.fix,
      seed: flags.seed,
      previewLines: flags.previewLines,
      captureDiff: !flags.stdoutJson // Only capture diff for human-readable output
    })

    // Handle JSON output mode
    if (flags.stdoutJson) {
      console.log(JSON.stringify(result, null, 2))
      process.exit(result.status === 'ok' || result.status === 'fixed' ? 0 : 2)
    }

    // Write manifest if requested
    if (flags.manifestOut) {
      try {
        writeManifest(result, flags.manifestOut)
      } catch (error) {
        die(`Failed to write manifest to ${flags.manifestOut}: ${error.message}`)
      }
    }

    // Write glyphcard if requested
    if (flags.glyphcardOut) {
      try {
        writeGlyphcard(result, flags.glyphcardOut)
      } catch (error) {
        die(`Failed to write glyphcard to ${flags.glyphcardOut}: ${error.message}`)
      }
    }

    // Handle different result statuses
    switch (result.status) {
      case 'ok':
        console.log('Lockfile check: OK — no drift detected.')
        process.exit(0)
        break

      case 'fixed':
        console.log('Lockfile check: DRIFT FOUND and FIXED — package-lock.json updated. Please commit the change.')
        process.exit(0)
        break

      case 'drift':
        console.error('Lockfile check: DRIFT DETECTED — package-lock.json is out of sync with package.json.')
        console.error('Run: npm install  (or: npm run lockfile:fix) to update the lockfile, then commit it.')
        
        // Show diff preview if available
        if (result.diffPreview && result.diffPreview.preview) {
          console.error('\n— Diff preview —')
          console.error(result.diffPreview.preview)
          if (result.diffPreview.truncated) {
            console.error(`\n… (${result.diffPreview.totalLines - flags.previewLines} more lines)`)
          }
        }
        process.exit(2)
        break

      case 'error':
        die(result.error, 1)
        break

      default:
        die(`Unknown status: ${result.status}`, 1)
    }

  } catch (error) {
    die(`Unexpected error: ${error.message}`, 1)
  }
}

main()