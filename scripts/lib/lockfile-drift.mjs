/**
 * ANCHOR: LOCKFILE_DRIFT_CHECK:LIB – core logic (T1–T4 in CLI)
 * SRB:LOCKFILE_DRIFT
 * 
 * Lockfile drift detection library with symbolic AI simulation conventions.
 * Provides pure, testable functions for detecting package-lock.json drift
 * and generating structured metadata manifests.
 */

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

/**
 * Compute SHA256 hash of buffer or string
 * @param {Buffer|string} bufOrString - Input to hash
 * @returns {string} Hex-encoded hash
 */
export function sha256(bufOrString) {
  return createHash('sha256').update(bufOrString).digest('hex')
}

/**
 * Check for lockfile drift by comparing hashes before/after npm install
 * @param {object} options - Configuration options
 * @param {string} [options.root] - Project root directory (default: process.cwd())
 * @param {boolean} [options.fix] - Whether to keep updated lockfile (default: false)
 * @param {string} [options.seed] - Entropy seed for simulation (default: "EOS_SEED_ORION")
 * @param {number} [options.previewLines] - Lines to include in diff preview (default: 80)
 * @param {boolean} [options.captureDiff] - Whether to capture git diff preview (default: false)
 * @returns {Promise<object>} Manifest object with drift detection results
 */
export async function checkLockfileDrift(options = {}) {
  const {
    root = resolve(process.cwd()),
    fix = false,
    seed = "EOS_SEED_ORION",
    previewLines = 80,
    captureDiff = false
  } = options

  const pkgPath = resolve(root, 'package.json')
  const lockPath = resolve(root, 'package-lock.json')
  const timestamp = new Date().toISOString()

  // Validation checks
  if (!existsSync(pkgPath)) {
    throw new Error('package.json not found. Run from project root.')
  }
  if (!existsSync(lockPath)) {
    throw new Error('package-lock.json not found. Run npm install first.')
  }

  // Read original lockfile and compute hash
  const original = readFileSync(lockPath)
  const originalHash = sha256(original)

  // Ask npm to (re)compute the lockfile only, without installing modules
  const npmArgs = [
    'install', 
    '--package-lock-only', 
    '--ignore-scripts', 
    '--no-audit', 
    '--no-fund', 
    '--loglevel=error'
  ]
  
  const res = spawnSync('npm', npmArgs, { stdio: 'pipe' })
  if (res.error) {
    throw new Error(`Failed to run npm: ${res.error.message}`)
  }
  if (res.status !== 0) {
    throw new Error(`npm ${npmArgs.join(' ')} exited with code ${res.status}`)
  }

  // Read updated lockfile and compute hash
  const updated = readFileSync(lockPath)
  const updatedHash = sha256(updated)
  const drifted = originalHash !== updatedHash

  let diffPreview = null
  if (drifted && captureDiff) {
    try {
      // Temporarily restore original to get meaningful diff
      if (!fix) {
        writeFileSync(lockPath, original)
      }
      const diffResult = spawnSync('git', ['diff', '--no-ext-diff', '--', 'package-lock.json'], { 
        encoding: 'utf8' 
      })
      if (diffResult && diffResult.stdout) {
        const lines = diffResult.stdout.trim().split('\n')
        diffPreview = lines.slice(0, previewLines).join('\n')
        if (lines.length > previewLines) {
          diffPreview += `\n… (${lines.length - previewLines} more lines)`
        }
      }
      // Restore updated version if we temporarily reverted
      if (!fix && drifted) {
        writeFileSync(lockPath, updated)
      }
    } catch {
      // Ignore git diff errors
    }
  }

  // Restore original content if not fixing and drift detected
  if (drifted && !fix) {
    writeFileSync(lockPath, original)
  }

  // Build manifest with symbolic AI simulation conventions
  const manifest = {
    status: drifted ? (fix ? 'fixed' : 'drift') : 'ok',
    drifted,
    originalHash,
    updatedHash,
    lockPath: resolve(lockPath),
    timestamp,
    anchors: [
      "ANCHOR: LOCKFILE_DRIFT_CHECK:T1",
      "SRB:LOCKFILE_DRIFT"
    ],
    seed,
    dlp: {
      confidentiality: "low",
      critical: ["package-lock.json hash"],
      tags: ["build", "ci", "lockfile"]
    },
    notes: drifted 
      ? (fix 
          ? "Drift detected and lockfile updated. Please commit the change."
          : "Drift detected. Run npm install to update lockfile, then commit.")
      : "No drift detected between package.json and package-lock.json.",
    ...(diffPreview && { diffPreview })
  }

  return manifest
}

/**
 * Write manifest to JSON file with stable ordering
 * @param {object} manifest - Manifest data to write
 * @param {string} targetPath - Output file path
 */
export function writeManifest(manifest, targetPath) {
  const dir = dirname(targetPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  
  // Ensure stable JSON ordering for reproducible outputs
  const orderedManifest = {
    status: manifest.status,
    drifted: manifest.drifted,
    timestamp: manifest.timestamp,
    originalHash: manifest.originalHash,
    updatedHash: manifest.updatedHash,
    lockPath: manifest.lockPath,
    anchors: manifest.anchors,
    seed: manifest.seed,
    dlp: manifest.dlp,
    notes: manifest.notes,
    ...(manifest.diffPreview && { diffPreview: manifest.diffPreview })
  }
  
  writeFileSync(targetPath, JSON.stringify(orderedManifest, null, 2) + '\n')
}

/**
 * Write glyphcard (Markdown summary) for manifest
 * @param {object} manifest - Manifest data to summarize
 * @param {string} targetPath - Output file path
 */
export function writeGlyphcard(manifest, targetPath) {
  const dir = dirname(targetPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  
  const content = `# Lockfile Drift Check

**Status:** ${manifest.status}  
**Timestamp:** ${manifest.timestamp}  
**Seed:** ${manifest.seed}  

## Hashes
- **Original:** \`${manifest.originalHash}\`
- **Updated:** \`${manifest.updatedHash}\`
- **Drift Detected:** ${manifest.drifted ? '✅ Yes' : '❌ No'}

## Anchors
${manifest.anchors.map(anchor => `- ${anchor}`).join('\n')}

## DLP Classification
- **Confidentiality:** ${manifest.dlp.confidentiality}
- **Critical Data:** ${manifest.dlp.critical.join(', ')}
- **Tags:** ${manifest.dlp.tags.join(', ')}

## Notes
${manifest.notes}

${manifest.diffPreview ? `\n## Diff Preview\n\`\`\`diff\n${manifest.diffPreview}\n\`\`\`` : ''}

---
*Generated by Cloudbank Quantum Lockfile Drift Checker*
`

  writeFileSync(targetPath, content)
}