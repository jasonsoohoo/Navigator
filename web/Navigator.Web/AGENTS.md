# Navigator Web Guidance

Follow the root `AGENTS.md` whenever rules overlap.

- Use strict TypeScript. Do not use `any` without a documented and unavoidable reason.
- Keep all browser HTTP access inside `src/api` and use relative URLs for Navigator API calls.
- Browser code must not call GPU providers or container registries directly.
- Never place credentials, provider tokens, registry passwords, callback tokens, or Cloudflare credentials in frontend code.
- Never store credentials in `localStorage` or `sessionStorage`.
- Keep provider-specific wire types out of general UI components.
- Add or update tests for behavior changes and prefer semantic, accessible HTML.
- Avoid dependencies without a concrete requirement.
- Preserve the boundary between implemented functionality and future placeholder pages.
- Do not add experiment or workload implementation code.
- Run lint, type-check, tests, and the production build before completing a task.
