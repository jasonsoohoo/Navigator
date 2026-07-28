# Architecture overview

## System boundary

Navigator is a control plane. It coordinates the future lifecycle of disposable GPU workloads but does not contain their experiment, benchmark, model, training, or inference implementations. Workload source remains in external repositories and is delivered as prebuilt OCI-compatible images selected from public or private registries.

## Backend responsibilities

- **Domain** owns provider-neutral business concepts and rules. It has no dependency on other Navigator projects.
- **Application** owns use-case orchestration and interfaces for external capabilities. It depends only on Domain.
- **Infrastructure** implements Application interfaces for persistence, providers, registries, and other external systems. It may depend on Application and Domain.
- **API** hosts ASP.NET Core endpoints and composition. It depends on Application and Infrastructure, never directly on Domain.

Dependencies point inward: API to Infrastructure and Application, Infrastructure to Application and Domain, and Application to Domain. Circular references are prohibited. External provider and registry SDK types must be translated at the Infrastructure boundary; provider-specific types may not leak into Domain or Application models.

## Future repository areas

Future stages may add `Web` for the React client, `contracts` for workload-facing contracts, `infra` for cloud infrastructure definitions, and `deploy` for deployment assets. These directories are not part of the Stage 0A implementation.
