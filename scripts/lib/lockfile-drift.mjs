/* eslint-env node */

// Pure library API for lockfile drift detection with symbolic AI simulation conventions

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Compute SHA256 hash of a buffer or string
 * @param {Buffer|string} bufOrString - Data to hash
 * @returns {string} - Hex-encoded SHA256 hash
 */
export function sha256(bufOrString) {
  return createHash('sha256').update(bufOrString).digest('hex')
}

/**
 * Check for lockfile drift between package.json and package-lock.json
 * @param {Object} options - Configuration options
 * @param {string} [options.root] - Project root directory (defaults to process.cwd())
 * @param {boolean} [options.fix=false] - Whether to fix drift by updating lockfile
 * @param {string} [options.seed="EOS_SEED_ORION"] - Entropy seed for quantum tracking
 * @param {number} [options.previewLines=80] - Number of diff lines to include in preview
 * @param {boolean} [options.captureDiff=false] - Whether to capture diff preview
 * @returns {Promise<Object>} - Drift check result with metadata
 */
export async function checkLockfileDrift(options = {}) {
  const {
    root = process.cwd(),
    fix = false,
    seed = "EOS_SEED_ORION",
    previewLines = 80,
    captureDiff = false
  } = options

  const timestamp = new Date().toISOString()
  const pkgPath = resolve(root, 'package.json')
  const lockPath = resolve(root, 'package-lock.json')

  // Traceable anchors for symbolic AI tracking
  const anchors = [
    "ANCHOR: LOCKFILE_DRIFT_CHECK:T1",
    "SRB:LOCKFILE_DRIFT"
  ]

  // DLP (Data Loss Prevention) tagging
  const dlp = {
    confidentiality: "low",
    critical: ["package-lock.json hash"],
    tags: ["build", "ci", "lockfile"]
  }

  // Validation
  if (!existsSync(pkgPath)) {
    return {
      status: 'error',
      error: 'package.json not found. Run from project root.',
      timestamp,
      anchors,
      seed,
      dlp
    }
  }

  if (!existsSync(lockPath)) {
    return {
      status: 'error',
      error: 'package-lock.json not found. Run npm install first.',
      timestamp,
      anchors,
      seed,
      dlp
    }
  }

  // Memory sealing: capture pre-state
  const original = readFileSync(lockPath)
  const originalHash = sha256(original)

  try {
    // Ask npm to (re)compute the lockfile only, without installing modules
    const npmArgs = ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund', '--loglevel=error']
    const res = spawnSync('npm', npmArgs, { stdio: 'pipe' })
    
    if (res.error) {
      return {
        status: 'error',
        error: `Failed to run npm: ${res.error.message}`,
        originalHash,
        lockPath,
        timestamp,
        anchors,
        seed,
        dlp
      }
    }

    if (res.status !== 0) {
      return {
        status: 'error',
        error: `npm ${npmArgs.join(' ')} exited with code ${res.status}`,
        originalHash,
        lockPath,
        timestamp,
        anchors,
        seed,
        dlp
      }
    }

    // Memory sealing: capture post-state
    const updated = readFileSync(lockPath)
    const updatedHash = sha256(updated)
    const drifted = originalHash !== updatedHash

    let diffPreview = null
    if (drifted && captureDiff) {
      try {
        // Restore original for diff capture
        writeFileSync(lockPath, original)
        // Recompute to get diff
        spawnSync('npm', npmArgs, { stdio: 'pipe' })
        
        const diffResult = spawnSync('git', ['diff', '--no-ext-diff', '--', 'package-lock.json'], { encoding: 'utf8' })
        if (diffResult && diffResult.stdout) {
          const lines = diffResult.stdout.trim().split('\n')
          const preview = lines.slice(0, previewLines).join('\n')
          if (preview) {
            diffPreview = {
              preview,
              totalLines: lines.length,
              truncated: lines.length > previewLines
            }
          }
        }
      } catch (e) {
        // Ignore diff capture errors
      }
    }

    // Handle drift resolution
    if (!drifted) {
      if (!fix) {
        // Restore exactly to avoid churn if npm changed formatting
        writeFileSync(lockPath, original)
      }
      return {
        status: 'ok',
        drifted: false,
        originalHash,
        updatedHash,
        lockPath,
        timestamp,
        anchors,
        seed,
        dlp,
        notes: "No drift detected"
      }
    }

    // Drift detected
    if (!fix) {
      // Restore original content so working tree remains clean
      writeFileSync(lockPath, original)
      return {
        status: 'drift',
        drifted: true,
        originalHash,
        updatedHash,
        lockPath,
        timestamp,
        anchors,
        seed,
        dlp,
        diffPreview,
        notes: "Drift detected but not fixed. Run with fix option to update lockfile."
      }
    }

    // Fix path: keep the updated lockfile
    return {
      status: 'fixed',
      drifted: true,
      originalHash,
      updatedHash,
      lockPath,
      timestamp,
      anchors,
      seed,
      dlp,
      diffPreview,
      notes: "Drift detected and fixed. Lockfile updated."
    }

  } catch (error) {
    // Ensure we restore original on any error
    try {
      writeFileSync(lockPath, original)
    } catch (restoreError) {
      // Ignore restore errors
    }
    
    return {
      status: 'error',
      error: error.message,
      originalHash,
      lockPath,
      timestamp,
      anchors,
      seed,
      dlp
    }
  }
}

/**
 * Write manifest to JSON file with stable ordering
 * @param {Object} manifest - Manifest data to write
 * @param {string} targetPath - Path to write manifest file
 */
export function writeManifest(manifest, targetPath) {
  const sortedManifest = JSON.stringify(manifest, Object.keys(manifest).sort(), 2)
  writeFileSync(targetPath, sortedManifest, 'utf8')
}

/**
 * Write glyphcard (short Markdown summary) 
 * @param {Object} manifest - Manifest data
 * @param {string} targetPath - Path to write glyphcard file
 */
export function writeGlyphcard(manifest, targetPath) {
  const { status, drifted, originalHash, updatedHash, timestamp, anchors } = manifest
  
  const statusEmoji = {
    'ok': '✅',
    'drift': '⚠️',
    'fixed': '🔧',
    'error': '❌'
  }

  const content = `# Lockfile Drift Check

**Status:** ${statusEmoji[status] || '❓'} ${status.toUpperCase()}
**Timestamp:** ${timestamp}
**Drift Detected:** ${drifted ? 'Yes' : 'No'}

## Hash Analysis
- **Original:** \`${originalHash || 'N/A'}\`
- **Updated:** \`${updatedHash || 'N/A'}\`

## Quantum Anchors
${anchors.map(anchor => `- ${anchor}`).join('\n')}

## Notes
${manifest.notes || 'No additional notes'}

---
*Generated by Cloudbank Quantum Lockfile Drift Checker*
`

  writeFileSync(targetPath, content, 'utf8')
}