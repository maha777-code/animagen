$ErrorActionPreference = 'Continue'
Set-Location 'C:\Users\gs-en\Projects\animagen'
$log = Join-Path $PWD 'command-results.log'
Remove-Item $log -ErrorAction SilentlyContinue

function Run-Step($name, $cmd) {
    Add-Content $log "===== $name ====="
    Add-Content $log "COMMAND: $cmd"
    Invoke-Expression $cmd 2>&1 | ForEach-Object { Add-Content $log $_ }
    $code = $LASTEXITCODE
    Add-Content $log "EXIT_CODE: $code"
    Add-Content $log ""
    return $code
}

Run-Step '1 scene-schema build' 'pnpm --filter @animagen/scene-schema build'
Run-Step '2 engine test' 'pnpm --filter @animagen/engine test'
Run-Step '3 engine build' 'pnpm --filter @animagen/engine build'
