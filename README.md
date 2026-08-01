# Navigator

Navigator is a cloud-hosted control plane for launching and managing disposable GPU workloads from prebuilt OCI-compatible container images.

Experiment, benchmark, model, training, inference, and other workload implementation code is explicitly outside this repository. Workload source lives in external repositories, and its images are selected from public or private OCI registries.

## Status

Stages 0A and 0B established repository governance, the ASP.NET Core backend, and the React browser-client foundation. Stage 0C adds a production container that combines the independently compiled API and frontend, plus a local Docker Compose runtime. Registry, deployment-profile, session, and settings pages remain intentional placeholders for later stages.

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
deploy/                      Portable local Docker Compose runtime
.github/workflows/           Continuous integration
```

## Prerequisites

- .NET 10 SDK
- Node.js 22 LTS and npm
- PowerShell or a POSIX-compatible shell for the verification scripts
- Docker Engine with the Docker Compose plugin for container verification

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

## Production-like container

Development remains split: run `dotnet run` for the API and Vite for the browser client as described above. Neither ordinary .NET builds nor `dotnet run` builds or serves the frontend in Development.

For production-like execution, the multi-stage image runs the frontend and backend builds independently, copies the Vite output into the published ASP.NET Core web root, and uses ASP.NET Core as the single HTTP origin. The image runs as a non-root user on port 8080 and includes a readiness health check.

Build the local image directly through Compose:

```shell
docker compose -f deploy/compose.yaml build navigator
```

Start or rebuild the service, then stop it when finished:

```shell
docker compose -f deploy/compose.yaml up --build -d
docker compose -f deploy/compose.yaml down
```

The service binds to `127.0.0.1:8080` by default. Copy the non-secret settings from `deploy/.env.example` into your shell environment, or set `NAVIGATOR_BIND_ADDRESS` and `NAVIGATOR_HTTP_PORT`, to change the host binding. `NAVIGATOR_IMAGE` selects a prebuilt image when starting without `--build`; build metadata can be supplied through `NAVIGATOR_BUILD_VERSION` and `NAVIGATOR_SOURCE_REVISION`.

Run only the container smoke tests:

```shell
./scripts/verify-container.sh
```

```powershell
./scripts/verify-container.ps1
```

Run the complete source and container gate:

```shell
./scripts/verify-all.sh
```

```powershell
./scripts/verify-all.ps1
```

Set `NAVIGATOR_SMOKE_PORT` to override the smoke-test host port (default `18080`). Stage 0C does not include Cloudflare ingress or cloud deployment. The Compose service has no persistent volume because Navigator has no persistent application state yet.
