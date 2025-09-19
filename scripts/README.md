# Lockfile Drift Checker

Enhanced lockfile drift detection with symbolic AI simulation conventions, structured output, and automation support.

## Overview

The lockfile drift checker detects when `package-lock.json` is out of sync with `package.json` by regenerating the lockfile and comparing SHA256 hashes. The enhanced version provides:

- Modular architecture (library + CLI)
- Structured metadata output with symbolic AI conventions
- Automation-friendly JSON output
- Manifest and glyphcard generation
- DLP (Data Loss Prevention) tagging
- Memory/state verification through hash sealing

## Quick Start

```bash
# Basic drift check
npm run lockfile:check

# Fix drift by updating lockfile
npm run lockfile:fix

# Run tests
npm run test:lockfile
```

## API Reference

### Library (`scripts/lib/lockfile-drift.mjs`)

#### `checkLockfileDrift(options)`

Pure, testable API for drift detection.

**Parameters:**
- `options.root` (string): Project root directory (default: `process.cwd()`)
- `options.fix` (boolean): Whether to fix drift by updating lockfile (default: `false`)
- `options.seed` (string): Entropy seed for quantum tracking (default: `"EOS_SEED_ORION"`)
- `options.previewLines` (number): Number of diff lines to include in preview (default: `80`)
- `options.captureDiff` (boolean): Whether to capture diff preview (default: `false`)

**Returns:** Promise resolving to result object with:
- `status`: `'ok'` | `'drift'` | `'fixed'` | `'error'`
- `drifted`: boolean indicating if drift was detected
- `originalHash`: SHA256 hash of original lockfile
- `updatedHash`: SHA256 hash after npm install
- `lockPath`: Absolute path to lockfile
- `timestamp`: ISO timestamp of check
- `anchors`: Array of traceable anchors for symbolic AI
- `seed`: Entropy seed used
- `dlp`: DLP tagging object
- `notes`: Human-readable notes
- `diffPreview`: Optional diff preview object (if `captureDiff` is true)

#### `sha256(bufOrString)`

Compute SHA256 hash of buffer or string.

#### `writeManifest(manifest, targetPath)`

Write manifest to JSON file with stable key ordering.

#### `writeGlyphcard(manifest, targetPath)`

Write short Markdown summary of drift check results.

### CLI (`scripts/check-lockfile-drift.mjs`)

Enhanced CLI wrapper with multiple output formats and automation support.

**Flags:**
- `--fix`: Update package-lock.json in place
- `--stdout-json`: Print JSON report to stdout (no other output)
- `--manifest-out <path>`: Write JSON manifest to specified path
- `--glyphcard-out <path>`: Write Markdown summary to specified path
- `--preview-lines <n>`: Number of diff lines to show (default: 80)
- `--seed <string>`: Custom entropy seed for tracking

**Examples:**

```bash
# Basic check
node scripts/check-lockfile-drift.mjs

# Check and fix
node scripts/check-lockfile-drift.mjs --fix

# Automation-friendly JSON output
node scripts/check-lockfile-drift.mjs --stdout-json

# Generate reports
node scripts/check-lockfile-drift.mjs --manifest-out drift-report.json --glyphcard-out drift-summary.md

# Custom configuration
node scripts/check-lockfile-drift.mjs --preview-lines 50 --seed "CUSTOM_SEED"
```

**Exit Codes:**
- `0`: No drift detected or drift successfully fixed
- `1`: Error (file not found, npm failure, etc.)
- `2`: Drift detected but not fixed

## Symbolic AI Conventions

The checker follows symbolic AI simulation conventions:

### Traceable Anchors
Every result includes anchors for state tracking:
- `"ANCHOR: LOCKFILE_DRIFT_CHECK:T1"`: Primary temporal anchor
- `"SRB:LOCKFILE_DRIFT"`: State reference beacon

### Entropy/Memory Sealing
- Pre/post state hashes capture memory snapshots
- Default seed `"EOS_SEED_ORION"` provides entropy reference
- Custom seeds support distributed tracking

### DLP Tagging
Results include Data Loss Prevention metadata:
```json
{
  "dlp": {
    "confidentiality": "low",
    "critical": ["package-lock.json hash"],
    "tags": ["build", "ci", "lockfile"]
  }
}
```

## Testing

Tests use Node's built-in test runner:

```bash
npm run test:lockfile
```

Test coverage includes:
- SHA256 hash computation
- Manifest/glyphcard generation
- Error handling for missing files
- DLP tagging verification
- Custom seed handling
- Real project drift detection

## Integration

### CI/CD Pipelines

```yaml
# GitHub Actions example
- name: Check lockfile drift
  run: |
    node scripts/check-lockfile-drift.mjs --stdout-json > drift-report.json
    if [ $? -eq 2 ]; then
      echo "Lockfile drift detected!"
      exit 1
    fi
```

### Automation Scripts

```javascript
import { checkLockfileDrift } from './scripts/lib/lockfile-drift.mjs'

const result = await checkLockfileDrift({ captureDiff: true })
if (result.drifted) {
  console.log('Drift detected:', result.diffPreview)
}
```

## ESLint Configuration

The project includes ESLint overrides for Node scripts in `eslint.config.js`:

```javascript
{
  files: ['scripts/**/*.mjs', 'scripts/**/*.js'],
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: { ...globals.node }
  },
  rules: {
    'no-console': 'off',
    'no-process-exit': 'off'
  }
}
```

## Architecture

```
scripts/
├── check-lockfile-drift.mjs     # Thin CLI wrapper
├── lib/
│   └── lockfile-drift.mjs       # Pure library API
└── test-lockfile-drift.mjs      # Tests using Node test runner
```

The modular design separates concerns:
- **Library**: Pure functions, testable, no side effects
- **CLI**: Argument parsing, output formatting, process management
- **Tests**: Comprehensive coverage using Node's built-in runner

## Migration Guide

If upgrading from the original script:

1. Basic usage remains the same: `npm run lockfile:check` and `npm run lockfile:fix`
2. New JSON output: Add `--stdout-json` for automation
3. New reports: Use `--manifest-out` and `--glyphcard-out` for structured output
4. Testing: Run `npm run test:lockfile` to verify functionality

The CLI maintains backward compatibility while adding new features.