$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Add-Type -AssemblyName System.Net.Http

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$composeFile = Join-Path $repositoryRoot 'deploy/compose.yaml'
$projectName = if ($env:NAVIGATOR_COMPOSE_PROJECT) { $env:NAVIGATOR_COMPOSE_PROJECT } else { "navigator-smoke-$PID-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())" }
$smokePort = if ($env:NAVIGATOR_SMOKE_PORT) { $env:NAVIGATOR_SMOKE_PORT } else { '18080' }
$smokeImage = if ($env:NAVIGATOR_SMOKE_IMAGE) { $env:NAVIGATOR_SMOKE_IMAGE } else { "navigator:smoke-$PID" }
$started = $false
$cleanupRequired = $false
$httpClient = [System.Net.Http.HttpClient]::new()

function Invoke-Docker {
    param([Parameter(Mandatory)][string[]] $Arguments)

    & docker @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "docker $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
    }
}

function Get-DockerOutput {
    param([Parameter(Mandatory)][string[]] $Arguments)

    $output = & docker @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "docker $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
    }
    return ($output | Out-String).Trim()
}

function Test-HttpResponse {
    param(
        [Parameter(Mandatory)][string] $Path,
        [Parameter(Mandatory)][int] $ExpectedStatus,
        [bool] $ExpectHtml = $false
    )

    $response = $httpClient.GetAsync("http://127.0.0.1:$smokePort$Path").GetAwaiter().GetResult()
    try {
        $status = [int]$response.StatusCode
        if ($status -ne $ExpectedStatus) {
            throw "GET $Path returned HTTP $status; expected $ExpectedStatus."
        }
        if ($ExpectHtml) {
            $mediaType = $response.Content.Headers.ContentType.MediaType
            if ($mediaType -ne 'text/html') {
                throw "GET $Path returned '$mediaType'; expected HTML."
            }
            $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            if (-not $body.Contains('<div id="root"></div>')) {
                throw "GET $Path did not return the Navigator SPA entry document."
            }
        }
        Write-Host "GET $Path -> HTTP $status"
    }
    finally {
        $response.Dispose()
    }
}

$originalLocation = Get-Location
try {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        throw 'Docker is required but was not found on PATH.'
    }
    $savedErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    & docker info 2> $null | Out-Null
    $dockerInfoExitCode = $LASTEXITCODE
    $ErrorActionPreference = $savedErrorActionPreference
    if ($dockerInfoExitCode -ne 0) {
        throw 'Docker is installed, but the Docker daemon is unavailable.'
    }
    $ErrorActionPreference = 'Continue'
    & docker compose version 2> $null | Out-Null
    $composeVersionExitCode = $LASTEXITCODE
    $ErrorActionPreference = $savedErrorActionPreference
    if ($composeVersionExitCode -ne 0) {
        throw 'The Docker Compose plugin is required but unavailable.'
    }

    Set-Location $repositoryRoot
    $env:NAVIGATOR_IMAGE = $smokeImage
    $env:NAVIGATOR_BIND_ADDRESS = '127.0.0.1'
    $env:NAVIGATOR_HTTP_PORT = $smokePort
    $composeArguments = @('compose', '--project-name', $projectName, '--file', $composeFile)

    Invoke-Docker ($composeArguments + @('config', '--quiet'))
    Invoke-Docker ($composeArguments + @('build', 'navigator'))
    $cleanupRequired = $true
    Invoke-Docker ($composeArguments + @('up', '--detach', '--no-build', 'navigator'))
    $started = $true

    $containerId = Get-DockerOutput ($composeArguments + @('ps', '--quiet', 'navigator'))
    if (-not $containerId) {
        throw 'Compose did not create the Navigator container.'
    }

    $health = 'starting'
    for ($attempt = 1; $attempt -le 60; $attempt++) {
        $health = Get-DockerOutput @('inspect', '--format', '{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}', $containerId)
        if ($health -eq 'healthy') { break }
        if ($health -in @('unhealthy', 'missing')) {
            throw "Navigator container health status is '$health'."
        }
        Start-Sleep -Seconds 2
    }
    if ($health -ne 'healthy') {
        throw "Navigator did not become healthy within 120 seconds (last status: '$health')."
    }

    Test-HttpResponse -Path '/health/live' -ExpectedStatus 200
    Test-HttpResponse -Path '/health/ready' -ExpectedStatus 200
    Test-HttpResponse -Path '/' -ExpectedStatus 200 -ExpectHtml $true
    Test-HttpResponse -Path '/registries' -ExpectedStatus 200 -ExpectHtml $true
    Test-HttpResponse -Path '/sessions' -ExpectedStatus 200 -ExpectHtml $true
    Test-HttpResponse -Path '/api/does-not-exist' -ExpectedStatus 404
    Test-HttpResponse -Path '/health/does-not-exist' -ExpectedStatus 404

    $runtimeUid = Get-DockerOutput ($composeArguments + @('exec', '--no-TTY', 'navigator', 'id', '-u'))
    if ($runtimeUid -eq '0') {
        throw 'Navigator is running as root (UID 0).'
    }
    $runningId = Get-DockerOutput ($composeArguments + @('ps', '--quiet', '--status', 'running', 'navigator'))
    if ($runningId -ne $containerId) {
        throw 'Navigator did not remain running after smoke requests.'
    }

    Write-Host "Navigator container is healthy, serves the SPA and health endpoints, reserves server namespaces, and runs as UID $runtimeUid."
}
catch {
    if ($started) {
        & docker compose --project-name $projectName --file $composeFile logs --no-color navigator
    }
    throw
}
finally {
    $httpClient.Dispose()
    if ($cleanupRequired) {
        $ErrorActionPreference = 'Continue'
        & docker compose --project-name $projectName --file $composeFile down --remove-orphans *> $null
        $ErrorActionPreference = 'Stop'
    }
    Set-Location $originalLocation
}
