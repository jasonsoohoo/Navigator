$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$originalLocation = Get-Location
try {
    Set-Location $repositoryRoot

    & (Join-Path $PSScriptRoot 'verify.ps1')
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & (Join-Path $PSScriptRoot 'verify-container.ps1')
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Set-Location $originalLocation
}
