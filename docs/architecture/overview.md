# Architecture overview

## System boundary

Navigator is a control plane. It coordinates the future lifecycle of disposable GPU workloads but does not contain their experiment, benchmark, model, training, or inference implementations. Workload source remains in external repositories and is delivered as prebuilt OCI-compatible images selected from public or private registries.

## Backend responsibilities

- **Domain** owns provider-neutral business concepts and rules. It has no dependency on other Navigator projects.
- **Application** owns use-case orchestration and interfaces for external capabilities. It depends only on Domain.
- **Infrastructure** implements Application interfaces for persistence, providers, registries, and other external systems. It may depend on Application and Domain.
- **API** hosts ASP.NET Core endpoints and composition. It depends on Application and Infrastructure, never directly on Domain.

Dependencies point inward: API to Infrastructure and Application, Infrastructure to Application and Domain, and Application to Domain. Circular references are prohibited. External provider and registry SDK types must be translated at the Infrastructure boundary; provider-specific types may not leak into Domain or Application models.

## Browser client

`Navigator.Web` remains a separate React and TypeScript source project and browser client of `Navigator.Api`. Browser HTTP access is isolated under `src/api` and uses same-origin relative URLs. Browser code never calls GPU providers or container registries directly, and authentication, when introduced, will be enforced through the control-plane API boundary.

Frontend types are view and API models, not Navigator domain entities. Provider and registry credentials never enter browser application state. Vite proxying supports local frontend development only.

## Production HTTP origin

The frontend and backend compile independently. The production multi-stage image copies the Vite output into the published API web root, and ASP.NET Core serves both static frontend assets and server endpoints as the single production HTTP origin. Browser and API traffic therefore remain same-origin without a production API hostname.

React Router paths use ASP.NET Core SPA fallback routing so browser refreshes return the entry document. `/api` and `/health` are reserved server namespaces and never receive that fallback. The production container runs as a non-root user.

Cloudflare ingress will be added later without changing the browser's same-origin API model. Persistent storage and database packaging remain deferred.

## Future repository areas

Future stages may add `contracts` for workload-facing contracts and `infra` for cloud infrastructure definitions. The current `deploy` area contains only the local production-like Compose foundation.
