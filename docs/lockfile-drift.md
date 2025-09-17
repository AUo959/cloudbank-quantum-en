# Lockfile Drift Checker

A symbolic AI simulation-enhanced tool for detecting drift between `package.json` and `package-lock.json`.

- **Anchors:** LOCKFILE_DRIFT_CHECK:T1–T4, SRB:LOCKFILE_DRIFT
- **Seed:** EOS_SEED_ORION (override with `--seed`)
- **Ethics/Notes:** This tool emits low-sensitivity metadata with DLP tags.

## Overview

The lockfile drift checker ensures that `package-lock.json` stays in sync with `package.json` by:

1. Computing SHA256 hash of the current lockfile
2. Running `npm install --package-lock-only` to regenerate the lockfile
3. Computing SHA256 hash of the updated lockfile
4. Comparing hashes to detect drift
5. Optionally capturing git diff previews for analysis
6. Generating structured metadata manifests with symbolic AI conventions

## Architecture

The tool is split into two components:

- **Library** (`scripts/lib/lockfile-drift.mjs`): Pure, testable functions
- **CLI** (`scripts/check-lockfile-drift.mjs`): Thin wrapper handling I/O and flags

## Usage

### Basic Commands

```bash
# Check for drift (exits non-zero if found)
node scripts/check-lockfile-drift.mjs

# Fix drift automatically
node scripts/check-lockfile-drift.mjs --fix

# Get JSON output for automation
node scripts/check-lockfile-drift.mjs --stdout-json
```

### Advanced Options

```bash
# Generate manifest and glyphcard artifacts
node scripts/check-lockfile-drift.mjs \
  --manifest-out .artifacts/drift.json \
  --glyph-out .artifacts/drift.md \
  --capture-diff

# Custom entropy seed for simulation tracking
node scripts/check-lockfile-drift.mjs --seed "CUSTOM_SEED_VALUE"

# Limit diff preview lines
node scripts/check-lockfile-drift.mjs --preview-lines 50 --capture-diff
```

### NPM Scripts

The tool integrates with npm scripts defined in `package.json`:

```bash
npm run lockfile:check  # Check for drift
npm run lockfile:fix    # Fix drift
```

## Library API

### `checkLockfileDrift(options)`

Core drift detection function.

**Parameters:**
- `options.root` (string): Project root directory (default: `process.cwd()`)
- `options.fix` (boolean): Keep updated lockfile (default: `false`)
- `options.seed` (string): Entropy seed (default: `"EOS_SEED_ORION"`)
- `options.previewLines` (number): Diff preview line limit (default: `80`)
- `options.captureDiff` (boolean): Include git diff in results (default: `false`)

**Returns:** Promise resolving to manifest object:

```javascript
{
  status: 'ok' | 'drift' | 'fixed',
  drifted: boolean,
  originalHash: string,
  updatedHash: string,
  lockPath: string,
  timestamp: string,
  anchors: string[],
  seed: string,
  dlp: {
    confidentiality: 'low',
    critical: string[],
    tags: string[]
  },
  notes: string,
  diffPreview?: string
}
```

### `writeManifest(manifest, targetPath)`

Write structured JSON manifest with stable ordering.

### `writeGlyphcard(manifest, targetPath)`

Write Markdown summary of drift check results.

### `sha256(bufOrString)`

Compute SHA256 hash of buffer or string.

## Symbolic AI Conventions

The tool follows symbolic AI simulation conventions:

### Anchors
- `ANCHOR: LOCKFILE_DRIFT_CHECK:T1` – input parsing  
- `ANCHOR: LOCKFILE_DRIFT_CHECK:T2` – CLI argument parsing
- `ANCHOR: LOCKFILE_DRIFT_CHECK:T3` – main execution
- `ANCHOR: LOCKFILE_DRIFT_CHECK:T4` – drift detection and output
- `SRB:LOCKFILE_DRIFT` – stable reference beacon

### Entropy Sealing
- Default seed: `EOS_SEED_ORION`
- Hashes recorded pre/post for memory verification
- Timestamp anchoring for temporal tracking

### DLP Tagging
- **Confidentiality:** low
- **Critical data:** package-lock.json hash
- **Tags:** build, ci, lockfile

## Artifacts

When using `--manifest-out` or `--glyph-out`, artifacts are written to the specified paths. Add `.artifacts/` to your `.gitignore` to avoid committing these files.

Example manifest structure:
```json
{
  "status": "drift",
  "drifted": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "originalHash": "abc123...",
  "updatedHash": "def456...",
  "lockPath": "/path/to/package-lock.json",
  "anchors": [
    "ANCHOR: LOCKFILE_DRIFT_CHECK:T1",
    "SRB:LOCKFILE_DRIFT"
  ],
  "seed": "EOS_SEED_ORION",
  "dlp": {
    "confidentiality": "low",
    "critical": ["package-lock.json hash"],
    "tags": ["build", "ci", "lockfile"]
  },
  "notes": "Drift detected. Run npm install to update lockfile, then commit.",
  "diffPreview": "@@ -1,4 +1,4 @@..."
}
```

## Integration

### CI/CD Pipelines

```yaml
# GitHub Actions example
- name: Check lockfile drift
  run: node scripts/check-lockfile-drift.mjs --stdout-json > drift-check.json

- name: Upload drift artifacts
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: lockfile-drift-report
    path: |
      drift-check.json
      .artifacts/
```

### Git Hooks

The checker can be integrated into git hooks to prevent commits with drift:

```bash
#!/bin/sh
# .git/hooks/pre-commit
node scripts/check-lockfile-drift.mjs || {
  echo "Lockfile drift detected. Please run 'npm install' and commit the updated lockfile."
  exit 1
}
```

## Testing

Basic tests verify library functionality:

```bash
# Run tests (if test infrastructure exists)
npm test
```

The library is designed to be pure and testable, with no side effects from the core functions.