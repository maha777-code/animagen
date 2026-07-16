#!/usr/bin/env bash
# One-shot fix for Linux test setup. Run from repo root:
#   bash scripts/linux-test-fix.sh
#
# Fixes:
# 1. package.json test scripts (no missing vitest.config.ts)
# 2. optional smoke test files for parser/engine/api

set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Patching package.json test scripts..."
for pkg in packages/parser packages/engine apps/api; do
  node -e "
    const fs = require('fs');
    const p = '$pkg/package.json';
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    j.scripts.test = 'vitest run --passWithNoTests';
    fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
    console.log('  updated', p);
  "
done

echo "==> Writing smoke tests (optional)..."
bash scripts/apply-test-fix.sh

echo "==> Done. Run: pnpm test"
