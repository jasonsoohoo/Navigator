# Stage 0C container verification handoff

Stage 0C implementation and source-level validation are complete in the current working tree. Production-container verification must be continued on another computer.

## Current blocker

This development computer requires a corporate certificate authority that is not trusted inside the Docker build container. In `node:22-bookworm-slim`, both the Dockerfile's required `npm ci` and a diagnostic `npm ping --loglevel verbose` fail while contacting `https://registry.npmjs.org/` with:

```text
SELF_SIGNED_CERT_IN_CHAIN
request to https://registry.npmjs.org/-/ping failed
```

Do not work around this by disabling TLS verification, weakening npm security, or committing a corporate CA certificate. Continue on a computer whose Docker environment can establish the registry TLS connection normally.

No final Navigator image was produced here. Consequently, container route responses, Docker health, runtime UID, final image contents, and final image configuration have not been verified and must not be reported as passed yet.

## Before continuing

Preserve all current user work. Start by reading the repository instructions and inspecting:

```shell
git status --short --branch
git diff
```

Do not commit, push, create a pull request, rebase, merge, or otherwise modify Git history unless separately authorized.

## Continuation checklist

1. Validate the Compose definition:

   ```shell
   docker compose -f deploy/compose.yaml config
   ```

2. Run the platform-appropriate container smoke test:

   ```shell
   ./scripts/verify-container.sh
   ```

   ```powershell
   ./scripts/verify-container.ps1
   ```

3. Run the platform-appropriate aggregate gate:

   ```shell
   ./scripts/verify-all.sh
   ```

   ```powershell
   ./scripts/verify-all.ps1
   ```

4. Confirm the smoke test reports these results:
   - `GET /health/live` returns HTTP 200.
   - `GET /health/ready` returns HTTP 200.
   - `GET /` returns HTTP 200 and HTML.
   - `GET /registries` and `GET /sessions` return HTTP 200 and the SPA entry document.
   - `GET /api/does-not-exist` and `GET /health/does-not-exist` return HTTP 404 without the SPA entry document.
   - The Docker health status becomes healthy.
   - The application process runs with a nonzero UID and remains running after the requests.

5. Inspect the resulting `navigator:local` image and verify:
   - The configured runtime user and running process are non-root.
   - Port 8080 is exposed.
   - The health check targets `http://127.0.0.1:8080/health/ready`.
   - The final image uses the ASP.NET Core runtime rather than the .NET SDK image.
   - Node, npm, the .NET SDK, source trees, Git metadata, build caches, secrets, and local `.env` files are absent.
   - OCI title, description, version, and source-revision labels are present.

6. Complete the final repository review:
   - Confirm smoke-test Compose resources were removed and no unrelated Docker resources were touched.
   - Inspect `git status`, `git diff`, and `git diff --check`.
   - Confirm `package-lock.json` remains tracked.
   - Confirm generated `node_modules`, `bin`, `obj`, `dist`, test results, coverage, and Docker runtime data are not tracked.
   - Confirm no `.env`, credentials, tokens, production hostnames, or later-stage functionality were added.

Only report Stage 0C container verification as passed after all checks above succeed on the other computer.
