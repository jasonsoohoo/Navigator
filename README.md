# Navigator

Navigator is a cloud-hosted control plane for launching and managing disposable GPU workloads from prebuilt OCI-compatible container images.

Experiment, benchmark, model, training, inference, and other workload implementation code is explicitly outside this repository. Workload source lives in external repositories, and its images are selected from public or private OCI registries.

## Status

Stage 0A establishes repository governance and the ASP.NET Core backend foundation. It includes an intentionally empty domain/application/infrastructure structure, a minimal API, and liveness and readiness integration tests. Later platform capabilities are not implemented yet.

## Repository layout

```text
src/
  Navigator.Domain/          Core domain (intentionally empty in Stage 0A)
  Navigator.Application/     Application boundary
  Navigator.Infrastructure/  External integration implementations
  Navigator.Api/             ASP.NET Core host
tests/
  Navigator.Api.IntegrationTests/
docs/
  architecture/              Architecture documentation
  decisions/                 Architecture decision records
scripts/                     Local verification scripts
.github/workflows/           Continuous integration
```

## Prerequisites

- .NET 10 SDK
- PowerShell or a POSIX-compatible shell for the verification scripts

## Build and run

```shell
dotnet restore Navigator.sln
dotnet build Navigator.sln --configuration Release --no-restore
dotnet test Navigator.sln --configuration Release --no-build
dotnet run --project src/Navigator.Api/Navigator.Api.csproj
```

Or run the full verification sequence:

```shell
./scripts/verify.sh
```

```powershell
./scripts/verify.ps1
```

## Health endpoints

With the API running on the address printed by `dotnet run`:

```shell
curl http://localhost:5091/health/live
curl http://localhost:5091/health/ready
```

Both endpoints return HTTP 200 in Stage 0A.

See the [staged roadmap](docs/roadmap.md) for planned platform work.
