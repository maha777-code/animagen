#!/usr/bin/env bash
# Fix hash test for normalizePrompt punctuation stripping.
# Run from repo root: bash scripts/fix-hash-test.sh

set -euo pipefail
FILE="packages/scene-schema/src/index.test.ts"

if [[ ! -f "$FILE" ]]; then
  echo "Error: $FILE not found. Run from animagen repo root." >&2
  exit 1
fi

python3 << 'PY'
from pathlib import Path

path = Path("packages/scene-schema/src/index.test.ts")
text = path.read_text()

old = """  it('produces deterministic hash', () => {
    expect(hashPrompt('hello world')).toBe(hashPrompt('hello world'));
    expect(hashPrompt('hello world')).not.toBe(hashPrompt('hello world!'));
  });"""

new = """  it('produces deterministic hash', () => {
    expect(hashPrompt('hello world')).toBe(hashPrompt('hello world'));
    // Punctuation is stripped during normalization — equivalent cache keys
    expect(hashPrompt('hello world')).toBe(hashPrompt('hello world!'));
    expect(hashPrompt('hello world')).not.toBe(hashPrompt('hello dragon'));
  });"""

if new in text:
    print("Already patched.")
elif old in text:
    path.write_text(text.replace(old, new))
    print("Patched", path)
else:
    raise SystemExit("Expected test block not found — edit manually.")
PY

echo "Done. Run: pnpm test"
