---
phase: "02-auth-workspaces"
plan: "02"
subsystem: "auth"
tags: ["credential-store", "workspace-config", "keychain", "conf", "storage"]

dependency_graph:
  requires: ["02-01"]
  provides: ["credential-store", "workspace-config"]
  affects: ["02-03", "02-04", "02-05", "02-06"]

tech_stack:
  added: ["@napi-rs/keyring (Entry class for OS keychain CRUD)", "conf (XDG config for workspace list and active domain)"]
  patterns: ["TDD red-green", "SERVICE_NAME constant for keyring namespace", "clearConfig() for test isolation with conf"]

key_files:
  created:
    - packages/twentythree-cli/src/auth/credential-store.ts
    - packages/twentythree-cli/src/auth/__tests__/credential-store.test.ts
    - packages/twentythree-cli/src/auth/workspace-config.ts
    - packages/twentythree-cli/src/auth/__tests__/workspace.test.ts
  modified: []

decisions:
  - "SERVICE_NAME = 'twentythree-cli' as keyring namespace; domain used as username key"
  - "WorkspaceEntry uses snake_case field names matching live /api/2/user/tokens response exactly"
  - "findWorkspace returns single WorkspaceEntry on unambiguous match, WorkspaceEntry[] on multiple matches, null on no match"
  - "getConfigPath() exported to expose conf file path for future token refresh file-locking (02-05)"
  - "Keychain-unavailable guard in tests: beforeAll probe catches errors and skips all tests gracefully in headless CI"
  - "conf projectName 'twentythree-cli' (conf appends -nodejs → ~/.config/twentythree-cli-nodejs/config.json)"

metrics:
  duration: "9 minutes"
  completed: "2026-04-14T10:13:21Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 4
  files_modified: 0
---

# Phase 02 Plan 02: Credential Store and Workspace Config Summary

**One-liner:** OS keychain bearer token CRUD via @napi-rs/keyring and typed conf-based workspace storage with exact-domain-precedence findWorkspace matching.

## What Was Built

### Task 1: credential-store.ts

Four exported functions wrapping `@napi-rs/keyring Entry`:

- `setCredential(domain, token)` — stores token in OS keychain under service `'twentythree-cli'`, username = domain
- `getCredential(domain)` — returns token string or `null` if not found
- `deleteCredential(domain)` — removes entry, returns boolean
- `hasCredential(domain)` — convenience wrapper returning boolean

Tests use unique `test-${Date.now()}-${label}.example.com` domains per run to avoid cross-test collisions, clean up in `afterEach`, and include a `beforeAll` probe that sets `keychainAvailable = false` to skip gracefully in headless CI environments.

### Task 2: workspace-config.ts

Eight exported functions + `WorkspaceEntry` type backed by `conf`:

- `WorkspaceEntry` — typed interface with exact snake_case field names from the live API: `domain`, `display_name`, `bearer_token`, `expiration_time`, `api_base_url`, `site_name`, `canonical_user_p`, `starred_p`
- `getWorkspaces() / setWorkspaces(entries)` — workspace list persistence
- `getActiveWorkspace() / setActiveWorkspace(domain)` — active domain selection
- `getWorkspaceForDomain(domain)` — exact domain lookup returning `WorkspaceEntry | null`
- `findWorkspace(query, workspaces)` — pure function; exact domain match first, then case-insensitive partial match against `display_name` and `domain`; returns single entry, array, or null
- `getConfigPath()` — exposes conf file path for token refresh file locking (used in 02-05)
- `clearConfig()` — resets all stored data (for test isolation)

Tests use `beforeEach(() => clearConfig())` for isolation and cover all conf roundtrip scenarios plus all `findWorkspace` matching edge cases including ambiguous multi-match and precedence.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| SERVICE_NAME constant `'twentythree-cli'` | Namespaces all keyring entries; prevents accidental collision with other apps |
| Domain as keyring username key | Natural 1:1 mapping; each domain has exactly one login token |
| `findWorkspace` takes workspaces as parameter (pure) | Enables unit testing without conf state; callers can pass filtered lists |
| `getConfigPath()` exported | Token refresh (02-05) needs the conf file path for `proper-lockfile` |
| `clearConfig()` exported | conf writes to real XDG file; tests need reliable reset between runs |

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes at trust boundaries beyond what the plan's threat model covers.

- T-02-01 mitigated: bearer tokens stored only in OS keychain via `@napi-rs/keyring`, not in conf
- T-02-02 accepted: workspace metadata including short-lived cross-site tokens stored in conf plaintext (per plan disposition)
- T-02-03 accepted: conf atomic writes prevent corruption; filesystem tampering is out-of-scope threat

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| credential-store.ts exists | FOUND |
| workspace-config.ts exists | FOUND |
| credential-store.test.ts exists | FOUND |
| workspace.test.ts exists | FOUND |
| commit 67396a8 (credential-store) | FOUND |
| commit 561a181 (workspace-config) | FOUND |
