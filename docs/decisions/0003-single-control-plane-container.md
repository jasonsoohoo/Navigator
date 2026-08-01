# ADR 0003: Single control-plane container

## Status

Accepted

## Context

Navigator has independently developed React and ASP.NET Core applications, while production-like operation needs one stable HTTP origin and a portable local runtime. Development should retain Vite's fast feedback loop without adding Node tooling to ordinary .NET commands or the production runtime.

## Decision

Navigator.Api and the compiled Navigator.Web application are delivered as one production container. ASP.NET Core serves both server endpoints and static frontend assets, and browser requests use same-origin relative paths. React Router paths use an SPA fallback while `/api` and `/health` remain reserved server namespaces.

Local frontend development continues to use Vite. A multi-stage Docker build compiles the frontend and publishes the API independently, preventing Node, npm, source trees, and .NET SDK tooling from remaining in the ASP.NET Core runtime image. The final container runs as a non-root user. Docker Compose provides the first production-like local runtime.

Cloudflare Tunnel, persistent storage, and cloud deployment are deferred.

## Consequences

- Production browser and API traffic share one origin and need no reverse proxy or injected API hostname.
- Container builds, rather than `dotnet build` or `dotnet run`, assemble the frontend into the API web root.
- The runtime image is smaller and has a narrower tool and privilege surface than either build environment.
- Local Compose operation has no persistent volume until a persistence design exists.
- Future ingress can sit in front of the same origin without changing browser API paths.
