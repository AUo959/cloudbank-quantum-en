# ✨ Welcome to Your Spark Template

You've just launched your brand-new Spark Template Codespace — everything’s fired up and ready for you to explore, build, and create with Spark!

This template is your blank canvas. It comes with a minimal setup to help you get started quickly with Spark development.

🚀 What's Inside?

- A clean, minimal Spark environment
- Pre-configured for local development
- Ready to scale with your ideas
  
🧠 What Can You Do?

Right now, this is just a starting point — the perfect place to begin building and testing your Spark applications.

🧹 Just Exploring?
No problem! If you were just checking things out and don’t need to keep this code:

- Simply delete your Spark.
- Everything will be cleaned up — no traces left behind.

📄 License For Spark Template Resources

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

## Running in Spark/Codespaces

Use Node.js 20.19 or later in the 20.x series, or Node.js 22.12 or later.

- Dev server binds to `0.0.0.0` on port `5000` (config in `vite.config.ts`).

```bash
npm run dev
```

Use `PORT=xxxx npm run dev` to override.

- Preview build binds to `0.0.0.0:5001`:

```bash
npm run build
npm run preview
```

Use `PREVIEW_PORT=yyyy npm run preview` to override.

## Canon Operations review

Choose **Canon Operations** in the workspace navigation to inspect an offline snapshot. The included synthetic habitat exercise covers the forecast, L1 approval, CanonRec staging, native GUMAS replay, Chronicle projection, calibration attachment, and reconciliation recommendation. Its pins point to the isolated evidence repository used by the synthetic fixture.

Select a timeline row to view its repository, commit, source path, SHA-256, and receipt hash. **Open snapshot** loads a version `1.0` export from a local JSON file. Invalid snapshots display a validation error and the current snapshot remains available. The route displays the snapshot's evidence labels and runs in read-only mode until an authorized bridge is available.

[Snapshot format](src/lib/canonOperations.ts) · [Synthetic example](src/fixtures/canon-operations-synthetic.json)

## Git Workflow Helpers

- Enable local git hooks:

```bash
bash scripts/setup-githooks.sh
```

This installs a `pre-push` hook that prevents pushing when your branch is behind or diverged. It fetches the remote ref and suggests the correct rebase command.

- Auto-merge PRs targeting `main`:
  - Add the label `automerge` to the PR.
  - The workflow `.github/workflows/enable-automerge.yml` will enable GitHub’s auto-merge (squash) for that PR.

Note: PRs labeled `no-automerge` will be skipped by the auto-labeler.
