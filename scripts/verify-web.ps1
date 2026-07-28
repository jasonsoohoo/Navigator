$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repositoryRoot = Split-Path -Parent $PSScriptRoot

Push-Location (Join-Path $repositoryRoot 'web/Navigator.Web')
try {
    npm ci
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    npm run lint
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    npm run typecheck
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    npm run test -- --run
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    npm run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Pop-Location
}
