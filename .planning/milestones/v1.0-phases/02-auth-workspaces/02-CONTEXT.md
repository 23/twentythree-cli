# Phase 2: Auth & Workspaces - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

A developer can run `twentythree auth credentials`, enter a domain and bearer token, select workspaces, and have all subsequent commands operate against the correct workspace. This phase wires up credential storage, workspace discovery, token refresh, workspace switching, and the shared API client — the foundation every downstream command depends on.

No video/category/webinar commands are implemented in this phase — those begin in Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Token types and expiry

Two distinct token types exist in this system:

1. **User login tokens** (entered by the user in `auth credentials`) — long-lived, do NOT expire. Stored in OS keychain via `@napi-rs/keyring`. Never need refreshing.

2. **Cross-site workspace tokens** (returned by `/api/2/user/tokens?cross_sites_p=1`) — DO expire. The API response includes the expiry time for each token. These are what commands use to call workspace-scoped endpoints.

**Refresh strategy:** Before each command invocation (or proactively before expiry), check whether the workspace token is expired or near expiry. If so, re-call `/api/2/user/tokens?cross_sites_p=1` using the stored user login token to obtain fresh workspace tokens. File lock on the token cache prevents race conditions when multiple CLI invocations run concurrently.

### Re-auth behavior

`auth credentials` operates **per domain**:
- If credentials already exist for the entered domain → overwrite that domain's entry (login token + workspace tokens)
- If it is a new domain → add a new entry
- Multiple domains can be stored simultaneously; each is independent

No confirmation prompt before overwrite — just replace the existing entry for that domain.

### Workspace identity

Workspaces are matched by **both display name and domain**:
- `workspace use company` — matches workspaces whose display name contains "company" (case-insensitive) OR whose domain matches
- `--workspace company` flag — same matching logic
- If the match is ambiguous (multiple workspaces match), present the user with a list to choose from
- Exact domain match takes precedence over partial display name match

Workspaces are stored in `conf` as: `{ domain, display_name, bearer_token, expiration_time, api_base_url, site_name, canonical_user_p, starred_p }` — field names match the live `/api/2/user/tokens` response exactly (confirmed from live API).

### Output workspace indicator

Every command output includes `[domain]` as a prefix/header — e.g. `[company.video23.com]`. This appears once at the top of output before any data rows, not on every individual line. Printed in a muted/dim style to avoid cluttering data output.

### API client wiring

`openapi-fetch` client is constructed per-invocation with:
- Base URL from the active workspace domain
- `Authorization: Bearer <token>` header when a token is configured
- No auth header in domain-only/anonymous mode (anonymous-scope endpoints only)
- `--workspace` flag overrides active workspace for a single invocation

Client lives in `src/api/client.ts` — constructed and exported as a factory function that takes a workspace config object.

### Domain-only / anonymous mode

Bearer token is optional (`auth credentials` prompts "Token (optional — press Enter to skip)"). Domain-only mode:
- Stores only the domain, no token
- Workspace discovery is skipped (workspace = provided domain itself)
- Only anonymous-scope endpoints are accessible (11 endpoints from swagger `security: anonymous`)
- Commands requiring auth fail with: `This command requires authentication — run \`twentythree auth credentials\` to add a bearer token`

### Claude's Discretion

- Exact `conf` schema / key names for stored workspace list
- Token refresh timing window (e.g., refresh if < N minutes remaining)
- File lock implementation for concurrent invocations
- Interactive prompt styling (clack/prompts component choices)
- Error message wording beyond the AUTH-10 specified message

</decisions>

<specifics>
## Specific References

- `/api/2/user/tokens?cross_sites_p=1` — workspace discovery endpoint; response includes per-workspace token and expiry
- AUTH-01 through AUTH-11 — full requirement set for this phase
- `@napi-rs/keyring` — OS keychain storage for login tokens
- `conf` — XDG config storage for workspace list and active workspace

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project requirements and stack
- `.planning/REQUIREMENTS.md` — AUTH-01 through AUTH-11 (Phase 2 scope)
- `.planning/PROJECT.md` — Auth model, anonymous scope breakdown, multi-workspace context
- `CLAUDE.md` — Recommended stack (openapi-fetch, @napi-rs/keyring, conf, @clack/prompts versions)

### Phase 1 context (patterns established)
- `.planning/phases/01-foundation/01-CONTEXT.md` — term-map usage, oclif patterns, build setup

### API spec
- `https://video.twentythree.com/apidocs/swagger.json` — Authoritative spec; `user/tokens` endpoint schema shows workspace token response shape including expiry field

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/twentythree-cli/src/api/types.ts` — Generated types from OpenAPI spec; includes `user/tokens` response types
- `packages/twentythree-cli/src/lib/term-map.ts` — Term mapping; apply to all user-visible output including error messages from this phase forward

### Established Patterns
- oclif v4 CJS command file layout (`src/commands/<topic>/<verb>.ts`)
- tsdown unbundle CJS build — new command files are auto-discovered

### Integration Points
- `src/api/client.ts` (to create) — API client factory; consumed by all commands in Phases 3–8
- `src/config/workspace.ts` (to create) — Workspace config read/write; consumed by all commands via `--workspace` flag resolution

</code_context>

<deferred>
## Deferred Ideas

- Browser OAuth login (`twentythree auth login`) — v2
- Interactive fuzzy workspace search — v2 (UX-02)
- Shell completions for `--workspace` values — v2

</deferred>

---

*Phase: 02-auth-workspaces*
*Context gathered: 2026-04-14*
