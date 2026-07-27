$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

dotnet restore Navigator.sln
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

dotnet build Navigator.sln --configuration Release --no-restore
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

dotnet test Navigator.sln --configuration Release --no-build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
