# Navigator Repository Guidance

Navigator is the control plane for launching and managing disposable GPU workloads. Experiment, benchmark, model, training, inference, and other workload implementation code belongs in external repositories and must not be added to this monorepo. Navigator consumes prebuilt OCI-compatible workload images.

## Project boundaries

- `Navigator.Domain` references no other Navigator project.
- `Navigator.Application` may reference only `Navigator.Domain`.
- `Navigator.Infrastructure` may reference `Navigator.Application` and `Navigator.Domain`.
- `Navigator.Api` may reference `Navigator.Application` and `Navigator.Infrastructure`, but not `Navigator.Domain` directly.
- Circular project references are prohibited.
- External providers and registries are accessed through application interfaces implemented in Infrastructure. Provider-specific types must not cross those interfaces.
- Architecture changes require an ADR under `docs/decisions/`.

## Development rules

- Restore with `dotnet restore Navigator.sln`.
- Build with `dotnet build Navigator.sln --configuration Release --no-restore`.
- Test with `dotnet test Navigator.sln --configuration Release --no-build`.
- Add or update tests for every behavior change.
- Never commit secrets or log credentials, tokens, or callback secrets.

## Definition of done

A Codex task is done when the requested scope is implemented, project boundaries remain valid, relevant documentation is current, formatting is clean, and restore, Release build, and tests pass or an environmental blocker is reported precisely.

Code review must reject project-boundary violations, missing behavior tests, secret exposure, and expansion beyond the requested scope.
