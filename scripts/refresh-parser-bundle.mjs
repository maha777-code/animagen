#!/usr/bin/env node
/** Refresh scripts/parser-bundle from packages/parser (run on dev machine). */
import { cpSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'packages', 'parser');
const dst = join(root, 'scripts', 'parser-bundle', 'packages', 'parser');

function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    const f = join(from, name);
    const t = join(to, name);
    if (statSync(f).isDirectory()) copyDir(f, t);
    else cpSync(f, t);
  }
}

copyDir(src, dst);
console.log('Updated scripts/parser-bundle from packages/parser');
