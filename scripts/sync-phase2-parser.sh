#!/usr/bin/env bash
# Sync Phase 2 parser to packages/parser. Run from repo root:
#   bash scripts/sync-phase2-parser.sh
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/sync-phase2-parser.py
pnpm --filter @animagen/scene-schema build
pnpm --filter @animagen/parser test
