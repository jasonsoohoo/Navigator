# ADR 0001: Monorepo boundaries

## Status

Accepted

## Context

Navigator manages disposable GPU workloads, while the workloads themselves evolve independently and may use different languages, frameworks, models, and build pipelines. Combining control-plane and workload implementation code would blur ownership, couple release cycles, and expand the security and operational scope of the control plane.

## Decision

The Navigator monorepo contains the control plane, infrastructure definitions, shared contracts, and deployment automation. It never contains experiment, benchmark, model, training, inference, or other workload implementation code.

Workload source remains in external repositories. Navigator selects and launches prebuilt OCI-compatible images from public or private registries.

## Consequences

- Control-plane changes and workload changes have independent build and release lifecycles.
- Workload artifacts cross the system boundary as versioned container images and defined contracts.
- Contributions adding workload implementation code to this repository must be rejected.
- Registry and provider integrations must preserve the control-plane boundaries documented in the architecture overview.
