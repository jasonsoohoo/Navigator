# ADR 0002: Frontend boundary

## Status

Accepted

## Context

Navigator needs a browser interface for control-plane workflows without exposing provider integrations, registry credentials, or deployment details directly to client code. Local development also needs a way to reach the separately hosted ASP.NET Core API while preserving the production request model.

## Decision

React, TypeScript, and Vite form the Navigator browser client. `Navigator.Web` communicates only with `Navigator.Api`, and all browser HTTP access is isolated under `src/api`.

Provider and registry credentials never enter browser application state. Same-origin relative URLs are the intended production model; Vite proxying exists only for local development. A component framework and global state library are intentionally deferred.

## Consequences

- UI components consume frontend-specific view and API models rather than provider wire types or domain entities.
- Provider and registry operations must cross the control-plane API boundary.
- Local development can run the browser client and API on separate ports without production hostnames in browser code.
- Styling and state remain deliberately lightweight until concrete requirements justify additional dependencies.
