#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"

git config core.hooksPath .githooks
chmod +x "$repo_root/.githooks"/* || true

echo "Git hooks enabled (core.hooksPath=.githooks)."
