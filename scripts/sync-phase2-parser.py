#!/usr/bin/env python3
"""Deploy Phase 2 parser sources from scripts/parser-bundle to packages/parser."""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUNDLE = Path(__file__).resolve().parent / 'parser-bundle' / 'packages' / 'parser'
TARGET = ROOT / 'packages' / 'parser'

FILES = [
    'package.json',
    'tsconfig.json',
    'vitest.config.ts',
    'src/index.ts',
    'src/index.test.ts',
    'src/dictionaries.ts',
    'src/tokenize.ts',
    'src/extract.ts',
    'src/parse-prompt.ts',
    'src/parse-prompt.test.ts',
    'src/fixtures.ts',
]


def main() -> int:
    if not BUNDLE.exists():
        print(f'Error: bundle not found at {BUNDLE}', file=sys.stderr)
        print('Copy scripts/parser-bundle from the dev machine, or sync the full repo.', file=sys.stderr)
        return 1

    TARGET.mkdir(parents=True, exist_ok=True)
    (TARGET / 'src').mkdir(parents=True, exist_ok=True)

    for rel in FILES:
        src = BUNDLE / rel
        dst = TARGET / rel
        if not src.exists():
            print(f'Missing bundle file: {src}', file=sys.stderr)
            return 1
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        print(f'  synced {rel}')

    print('\nPhase 2 parser synced. Run:')
    print('  pnpm --filter @animagen/scene-schema build')
    print('  pnpm --filter @animagen/parser test')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
