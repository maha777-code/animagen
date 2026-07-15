#!/usr/bin/env pwsh
# Phase 1 verification script — run from repo root: pwsh scripts/verify-phase1.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot/..

Write-Host "=== Animagen Phase 1 Verification ===" -ForegroundColor Cyan

Write-Host "`n[1/5] Checking monorepo structure..."
$required = @(
  "apps/web/package.json",
  "apps/api/package.json",
  "apps/inference/worker.py",
  "packages/scene-schema/src/index.ts",
  "packages/parser/src/index.ts",
  "packages/engine/src/index.ts",
  "pnpm-workspace.yaml",
  "turbo.json"
)
foreach ($path in $required) {
  if (-not (Test-Path $path)) { throw "Missing: $path" }
  Write-Host "  OK $path"
}

Write-Host "`n[2/5] pnpm install..."
pnpm install

Write-Host "`n[3/5] pnpm build..."
pnpm build

Write-Host "`n[4/5] pnpm test..."
pnpm test

Write-Host "`n[5/5] pnpm lint..."
pnpm lint

Write-Host "`n=== Phase 1 PASSED ===" -ForegroundColor Green
