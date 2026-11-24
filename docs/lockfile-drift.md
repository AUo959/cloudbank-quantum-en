# Lockfile drift

Run from the repository root with Node.js and npm. The checker regenerates a
candidate in a temporary directory. It compares JSON data, ignoring indentation
and object key order. Fix mode preserves the original indentation and line
endings and checks that the inputs still match before replacing the lockfile.

```sh
npm run lockfile:check
npm run lockfile:fix
npm run test:lockfile-drift
node scripts/check-lockfile-drift.mjs --stdout-json --capture-diff
```

Check mode exits with 2 when drift is found. A clean check or successful fix
exits with 0. Input, npm, and report failures exit with 1. JSON mode prints one
manifest on stdout for a completed check or fix. Errors go to stderr.

The manifest defaults to `.artifacts/lockfile-drift-manifest.json`. On drift,
the checker also writes `.artifacts/lockfile-drift-glyphcard.md`. Use
`--manifest-out` and `--glyphcard-out` to choose other paths. `--glyph-out`
is an alias. Use `--help` to see all options.

The manifest records the `LOCKFILE_DRIFT_CHECK:T1` and `SRB:LOCKFILE_DRIFT`
anchors, the report seed, and the SHA-256 hashes of the original and
proposed lockfile bytes. A clean check records the original hash twice.
The seed labels the report and has no effect on npm resolution. The default
report contains low-sensitivity metadata. Opting into `--capture-diff`
can include package and registry metadata and marks the report internal.

In CI, use `npm ci` to install from the lockfile and `npm run test:lockfile-drift`
to exercise the checker with temporary package fixtures.
