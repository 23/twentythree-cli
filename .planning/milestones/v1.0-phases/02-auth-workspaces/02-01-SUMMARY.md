---
phase: 02-auth-workspaces
plan: "01"
subsystem: auth
tags: [napi-rs/keyring, conf, chalk, ora, clack-prompts, proper-lockfile, vitest, test-stubs]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: vitest test infrastructure, oclif CJS build setup, package.json baseline
provides:
  - Phase 2 runtime dependencies installed with correct version pins
  - 9 test stub files covering all auth/workspace modules (42 todo items)
  - /api/2/user/tokens response shape confirmed from live API (pre-resolved checkpoint)
affects:
  - 02-02 (token refresh implementation)
  - 02-03 (API client factory)
  - 02-04 (auth commands)
  - 02-05 (workspace commands)

# Tech tracking
tech-stack:
  added:
    - "@napi-rs/keyring@^1.2.0 — OS keychain storage for bearer tokens"
    - "conf@^15.1.0 — XDG config storage for workspace list and active domain"
    - "chalk@^4.1.2 — terminal colour (CJS-safe; NOT 5.x)"
    - "ora@^5.4.1 — spinners for async ops (CJS-safe; NOT 6.x)"
    - "@clack/prompts@^1.2.0 — interactive auth flow prompts"
    - "proper-lockfile@^4.1.2 — file lock for concurrent token refresh"
    - "@types/proper-lockfile@^4.1.4 (dev)"
  patterns:
    - "it.todo() for test stubs — shows as pending not skipped, maintains test count visibility"
    - "CJS version pins: chalk@^4 and ora@^5 are hard constraints per CLAUDE.md"

key-files:
  created:
    - packages/twentythree-cli/src/auth/__tests__/credential-store.test.ts
    - packages/twentythree-cli/src/auth/__tests__/workspace.test.ts
    - packages/twentythree-cli/src/auth/__tests__/token-refresh.test.ts
    - packages/twentythree-cli/src/api/__tests__/client.test.ts
    - packages/twentythree-cli/src/commands/auth/__tests__/credentials.test.ts
    - packages/twentythree-cli/src/commands/auth/__tests__/status.test.ts
    - packages/twentythree-cli/src/commands/workspace/__tests__/list.test.ts
    - packages/twentythree-cli/src/commands/workspace/__tests__/use.test.ts
    - packages/twentythree-cli/src/lib/__tests__/base-command.test.ts
  modified:
    - packages/twentythree-cli/package.json
    - pnpm-lock.yaml

key-decisions:
  - "chalk pinned to ^4.1.2 (not 5.x) and ora pinned to ^5.4.1 (not 6.x) — ESM-only constraint on CJS project"
  - "Task 2 checkpoint (live API inspection) was pre-resolved — RESEARCH.md Pattern 6 already CONFIRMED with bearer_token, expiration_time (ISO string), display_name, api_base_url, domain, site_name, canonical_user_p, starred_p"

patterns-established:
  - "Test stubs use it.todo() not it.skip() — shows as todo in vitest output, not skipped"

requirements-completed: [AUTH-02]

# Metrics
duration: 2min
completed: 2026-04-14
---

# Phase 02 Plan 01: Dependencies and Test Stubs Summary

**Phase 2 runtime dependencies installed with CJS-safe version pins; 9 test stub files created covering all auth/workspace modules; live /api/2/user/tokens response shape confirmed with field names bearer_token, expiration_time (ISO), api_base_url**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-14T10:09:00Z
- **Completed:** 2026-04-14T10:10:15Z
- **Tasks:** 2 (Task 1 executed; Task 2 pre-resolved)
- **Files modified:** 11

## Accomplishments

- Installed all 6 Phase 2 runtime dependencies with correct version pins (chalk@4, ora@5 are CJS-safe as mandated by CLAUDE.md)
- Created 9 test stub files with `it.todo()` placeholders across all auth/workspace modules
- Confirmed `/api/2/user/tokens` response field names already documented in 02-RESEARCH.md Pattern 6 (CONFIRMED, A1-A4 RESOLVED)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Phase 2 dependencies and create test stubs** - `191e6e1` (feat)
2. **Task 2: Inspect live /api/2/user/tokens response shape** - pre-resolved (no commit needed — 02-RESEARCH.md already updated in commit `9ee4af7` from prior session)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `packages/twentythree-cli/package.json` — Added 6 runtime deps + 1 dev dep for Phase 2
- `pnpm-lock.yaml` — Updated lock file
- `packages/twentythree-cli/src/auth/__tests__/credential-store.test.ts` — Stubs for CredentialStore (5 todos)
- `packages/twentythree-cli/src/auth/__tests__/workspace.test.ts` — Stubs for WorkspaceConfig (8 todos)
- `packages/twentythree-cli/src/auth/__tests__/token-refresh.test.ts` — Stubs for TokenRefresh (5 todos)
- `packages/twentythree-cli/src/api/__tests__/client.test.ts` — Stubs for createApiClient (4 todos)
- `packages/twentythree-cli/src/commands/auth/__tests__/credentials.test.ts` — Stubs for auth credentials command (5 todos)
- `packages/twentythree-cli/src/commands/auth/__tests__/status.test.ts` — Stubs for auth status command (3 todos)
- `packages/twentythree-cli/src/commands/workspace/__tests__/list.test.ts` — Stubs for workspace list command (2 todos)
- `packages/twentythree-cli/src/commands/workspace/__tests__/use.test.ts` — Stubs for workspace use command (4 todos)
- `packages/twentythree-cli/src/lib/__tests__/base-command.test.ts` — Stubs for BaseCommand and AuthenticatedCommand (6 todos)

## Decisions Made

- chalk@^4.1.2 and ora@^5.4.1 version pins enforced per CLAUDE.md — these are CJS-only projects and chalk 5 / ora 6 are ESM-only
- Task 2 checkpoint was pre-resolved: the checkpoint message from the previous session already contained the live API response, and 02-RESEARCH.md was updated in commit `9ee4af7` — no re-work needed

## Deviations from Plan

None - plan executed exactly as written. Task 2 was a pre-resolved checkpoint (documented in execution prompt).

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required beyond what was already handled in the pre-resolved checkpoint.

## Next Phase Readiness

- All Phase 2 dependencies installed and importable
- Test stub infrastructure ready for TDD implementation in Plans 02-02 through 02-05
- WorkspaceEntry interface field names confirmed (bearer_token, expiration_time, display_name, api_base_url, site_name, canonical_user_p, starred_p, domain)
- Wave 1 can proceed immediately — no blockers

## Self-Check: PASSED

- All 9 test stub files: FOUND
- Task 1 commit 191e6e1: FOUND
- Task 2 pre-resolved in prior commit 9ee4af7: FOUND (Pattern 6 CONFIRMED, A1-A4 RESOLVED)

---
*Phase: 02-auth-workspaces*
*Completed: 2026-04-14*
