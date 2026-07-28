# Navigator

Navigator is a cloud-hosted control plane for launching and managing disposable GPU workloads from prebuilt OCI-compatible container images.

Experiment, benchmark, model, training, inference, and other workload implementation code is explicitly outside this repository. Workload source lives in external repositories, and its images are selected from public or private OCI registries.

## Status

Stage 0A established repository governance and the ASP.NET Core backend foundation. Stage 0B adds the React browser-client foundation, navigation, and live API health status. Registry, deployment-profile, session, and settings pages are intentional placeholders for later stages.

## Repository layout

```text
src/
  Navigator.Domain/          Core domain (intentionally empty in Stage 0A)
  Navigator.Application/     Application boundary
  Navigator.Infrastructure/  External integration implementations
  Navigator.Api/             ASP.NET Core host
tests/
  Navigator.Api.IntegrationTests/
web/
  Navigator.Web/              React and TypeScript browser client
docs/
  architecture/              Architecture documentation
  decisions/                 Architecture decision records
scripts/                     Local verification scripts
.github/workflows/           Continuous integration
```

## Prerequisites

- .NET 10 SDK
- Node.js 22 LTS and npm
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

## Frontend

Install and validate the browser client:

```shell
cd web/Navigator.Web
npm ci
npm run lint
npm run typecheck
npm run test -- --run
npm run build
```

For local development, start the API from the repository root:

```shell
dotnet run --project src/Navigator.Api --urls http://localhost:5080
```

Then start Vite in a separate terminal:

```shell
cd web/Navigator.Web
npm run dev
```

The browser uses relative API URLs. For local development, Vite proxies `/health` and `/api` to `http://localhost:5080` by default; set `NAVIGATOR_API_PROXY_TARGET` in the Vite development server environment to override that target.

See the [staged roadmap](docs/roadmap.md) for planned platform work.
