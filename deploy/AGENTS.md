# Navigator deployment guidance

Follow the root `AGENTS.md` whenever instructions overlap.

- Keep Compose portable across fresh Linux Docker hosts; do not use `container_name` or host-specific absolute paths without an ADR.
- Never commit secrets, expose Docker sockets, or use privileged containers.
- Navigator containers must run as non-root and include maintained health checks.
- Public ingress belongs to a later Cloudflare stage.
- Do not add persistent storage before its design exists.
- Production image versions will eventually use immutable tags or digests.
- Update container smoke tests whenever container or Compose behavior changes.
