---
phase: 02-auth-workspaces
plan: "03"
subsystem: auth
tags: [token-refresh, file-locking, workspace-discovery, tdd]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [ensureFreshToken, fetchWorkspaceTokens, REFRESH_THRESHOLD_MS]
  affects: [02-04, 02-05]
tech_stack:
  added: []
  patterns:
    - proper-lockfile with realpath:false for locking pre-existing conf file path
    - post-lock re-check pattern to prevent redundant concurrent refreshes
    - finally-block lock release to prevent stale lock files
key_files:
  created:
    - packages/twentythree-cli/src/auth/token-refresh.ts
  modified:
    - packages/twentythree-cli/src/auth/__tests__/token-refresh.test.ts
decisions:
  - REFRESH_THRESHOLD_MS set to 5 minutes (300000ms) — within Claude's discretion per CONTEXT.md
  - Post-lock re-check uses a second getWorkspaceForDomain call to read the (potentially updated) conf state after another process may have written fresh tokens
  - getCredential null check after lock acquisition (not before) — avoids leaking "no credential" timing signal before lock is held
metrics:
  duration_minutes: 12
  completed: "2026-04-14T10:16:45Z"
  tasks_completed: 1
  files_created: 1
  files_modified: 1
---

# Phase 02 Plan 03: Token Refresh Summary

Token refresh module with file-lock-protected concurrent refresh prevention and workspace token discovery.

## What Was Built

`token-refresh.ts` implements two public functions and one exported constant:

- `REFRESH_THRESHOLD_MS` — 5 minutes (300000ms); tokens expiring within this window trigger a refresh
- `fetchWorkspaceTokens(domain, loginToken)` — makes an authenticated GET to `/api/2/user/tokens?cross_sites_p=1`, parses the `{ status, sites }` response into `WorkspaceEntry[]` directly (no field mapping — names match the live API exactly per 02-RESEARCH.md)
- `ensureFreshToken(domain)` — returns the cached `bearer_token` if fresh; acquires a `proper-lockfile` lock on the conf config path, re-checks token freshness after lock acquisition (guards against concurrent refresh), fetches fresh tokens using the keychain login token, merges into the stored workspace list, and returns the new token

Security mitigations applied (per threat model):
- T-02-04: HTTPS-only URL construction (hardcoded `https://` prefix)
- T-02-05: Error messages include only HTTP status code, never token values
- T-02-06: Lock acquired with `retries: 3`; released in `finally` block; `proper-lockfile` handles stale lock cleanup
- T-02-07: Post-lock re-check prevents redundant API calls from concurrent processes

## Tests

14 tests covering:
- `REFRESH_THRESHOLD_MS` constant value
- `fetchWorkspaceTokens`: correct URL, auth header, response parsing, empty sites fallback, HTTP error throwing
- `ensureFreshToken`: fresh token returned without lock; domain-only null; no workspace null; lock acquired on near-expiry; post-lock re-check short-circuits when another process refreshed; null on missing keychain credential; lock released in finally on fetch error; setWorkspaces called with merged list

All external dependencies mocked: `fetch` (via `vi.stubGlobal`), `credential-store`, `workspace-config`, `proper-lockfile`.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| `e69eea9` | test | add failing tests for token-refresh module (RED) |
| `cfd4e3e` | feat | implement token-refresh with file-lock-protected refresh (GREEN) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect test assertion for post-lock re-check**
- **Found during:** GREEN phase — test failed with "expected [Function fetch] to be undefined"
- **Issue:** Test used `expect(fetch).not.toBeDefined()` to assert fetch was not called after post-lock re-check short-circuit. `fetch` is a Node.js 18+ built-in global — it is always defined. The assertion was semantically wrong.
- **Fix:** Changed to `expect(getCredential).not.toHaveBeenCalled()` — verifies the refresh path was not entered (getCredential is only called when fetch would be called) without relying on global existence
- **Files modified:** `packages/twentythree-cli/src/auth/__tests__/token-refresh.test.ts`
- **Commit:** included in `cfd4e3e`

## Known Stubs

None — all exported functions are fully implemented.

## Threat Flags

No new security surface beyond what was modelled in the plan's threat register.

## Self-Check

Files created:
- packages/twentythree-cli/src/auth/token-refresh.ts — FOUND
- packages/twentythree-cli/src/auth/__tests__/token-refresh.test.ts — FOUND (modified)

Commits:
- e69eea9 — FOUND
- cfd4e3e — FOUND

## Self-Check: PASSED
