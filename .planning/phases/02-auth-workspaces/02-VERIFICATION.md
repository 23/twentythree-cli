---
phase: 02-auth-workspaces
verified: 2026-04-16T13:15:00Z
status: human_needed
score: 4/5
overrides_applied: 0
gaps: []
human_verification:
  - test: "auth status — token expiry display"
    expected: "Running `twentythree auth status` should show the actual token expiry time (e.g. 'expires in 2 hours') per SC2 and AUTH-06. The formatExpiry() helper is defined in status.ts but never called; the command prints 'Token: active (auto-refreshes)' with no time value."
    why_human: "The UAT (02-UAT.md test 3) explicitly accepted 'No token value or expiry countdown shown' — which contradicts the ROADMAP SC2 and REQUIREMENTS AUTH-06. A human must decide: (a) ship as-is and override SC2, or (b) fix status.ts to call formatExpiry and display the value. This is a product decision, not a code error."
---

# Phase 2: Auth & Workspaces — Verification Report

**Phase Goal:** A developer can run `twentythree auth credentials`, enter a domain and bearer token, select workspaces, and have all subsequent commands operate against the correct workspace.
**Verified:** 2026-04-16T13:15:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `twentythree auth credentials` prompts for domain and bearer token, calls workspace discovery endpoint, stores credentials in OS keychain | VERIFIED | `credentials.ts` imports `setCredential` + `fetchWorkspaceTokens`; calls both when token provided; @napi-rs/keyring Entry used in `credential-store.ts` |
| 2 | `twentythree auth status` shows current credentials, active workspace name, and token expiry | PARTIAL | Command shows domain, display name, auth mode, and workspace count. `formatExpiry()` helper is defined in `status.ts` (line 8) but never called in `run()`. Output prints "Token: active (auto-refreshes)" with no actual expiry value. AUTH-06 in REQUIREMENTS explicitly requires expiry. UAT test 3 accepted this deviation. |
| 3 | `twentythree workspace list` lists all available workspaces with the default visually marked | VERIFIED | `list.ts` uses `chalk.green('*')` marker for active workspace; shows "No workspaces configured" empty-state; `--json` returns array with `isDefault` boolean |
| 4 | `twentythree workspace use <name>` switches active workspace; subsequent commands operate against new workspace | VERIFIED | `use.ts` calls `findWorkspace` then `setActiveWorkspace`; supports exact domain, partial name, ambiguous multi-match via `@clack/prompts select`; errors with descriptive message on no match |
| 5 | Every command output header shows active workspace name; destructive confirmation prompts include workspace name | VERIFIED | `BaseCommand.printWorkspaceHeader()` outputs `chalk.dim('[domain]')`; verified in 217 call sites across all command files; `video/delete.ts` confirmed including `this.activeWorkspace.domain` in confirmation prompt |

**Score:** 4/5 truths verified (SC2 is PARTIAL — expiry not displayed)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/twentythree-cli/src/auth/credential-store.ts` | Keyring CRUD for bearer tokens | VERIFIED | Exports `setCredential`, `getCredential`, `deleteCredential`, `hasCredential`; uses `new Entry(SERVICE_NAME, domain)` |
| `packages/twentythree-cli/src/auth/workspace-config.ts` | Conf-based workspace storage and matching | VERIFIED | Exports `WorkspaceEntry`, `getWorkspaces`, `setWorkspaces`, `getActiveWorkspace`, `setActiveWorkspace`, `findWorkspace`, `getWorkspaceForDomain`, `getConfigPath`, `clearConfig` |
| `packages/twentythree-cli/src/auth/token-refresh.ts` | Token refresh with file locking | VERIFIED | Exports `ensureFreshToken`, `fetchWorkspaceTokens`, `REFRESH_THRESHOLD_MS`; uses `proper-lockfile` with `realpath: false, retries: 3` |
| `packages/twentythree-cli/src/api/client.ts` | openapi-fetch factory with conditional auth middleware | VERIFIED | Exports `createApiClient`; auth middleware registered only when `config.token` is truthy |
| `packages/twentythree-cli/src/lib/base-command.ts` | BaseCommand with `--workspace` flag and AuthenticatedCommand with auth guard | VERIFIED | Exports `BaseCommand` and `AuthenticatedCommand`; `--workspace` flag (`-w`), `enableJsonFlag = true`, `printWorkspaceHeader()`, exact AUTH-10 error message |
| `packages/twentythree-cli/src/commands/auth/credentials.ts` | auth credentials command | VERIFIED | Extends raw `Command`; full interactive flow via `@clack/prompts`; domain-only mode supported |
| `packages/twentythree-cli/src/commands/auth/status.ts` | auth status command | PARTIAL | Extends `BaseCommand`; calls `printWorkspaceHeader()`; `formatExpiry` helper defined but never invoked in `run()` — expiry not displayed |
| `packages/twentythree-cli/src/commands/workspace/list.ts` | workspace list command | VERIFIED | Extends `BaseCommand`; green `*` marker for default; empty-state message; `--json` returns `isDefault` field |
| `packages/twentythree-cli/src/commands/workspace/use.ts` | workspace use command | VERIFIED | Extends `BaseCommand`; `Args.string` required arg; full matching logic wired |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `credential-store.ts` | `@napi-rs/keyring` | `import { Entry } from '@napi-rs/keyring'` | WIRED | `new Entry(SERVICE_NAME, domain)` at lines 6, 11, 16 |
| `workspace-config.ts` | `conf` | `import Conf from 'conf'` | WIRED | `new Conf<CliConfig>({ projectName: 'twentythree-cli' })` at line 20 |
| `token-refresh.ts` | `credential-store.ts` | `import { getCredential }` | WIRED | Called at line 90 inside ensureFreshToken |
| `token-refresh.ts` | `workspace-config.ts` | `import { getWorkspaces, setWorkspaces, getWorkspaceForDomain, getConfigPath }` | WIRED | All functions called in `ensureFreshToken` |
| `token-refresh.ts` | `proper-lockfile` | `import * as lockfile from 'proper-lockfile'` | WIRED | `lockfile.lock(configPath, { realpath: false, retries: 3 })` at line 74 |
| `client.ts` | `openapi-fetch` | `import createClient from 'openapi-fetch'` | WIRED | `createClient<paths>({ baseUrl })` called; auth middleware registered conditionally |
| `client.ts` | `api/types.ts` | `import type { paths } from './types.js'` | WIRED | Type parameter used in `createClient<paths>` |
| `base-command.ts` | `workspace-config.ts` | `import { findWorkspace, getActiveWorkspace, getWorkspaces, getWorkspaceForDomain }` | WIRED | All called in `init()` |
| `base-command.ts` | `token-refresh.ts` | `import { ensureFreshToken }` | WIRED | Called at line 134 in `init()` when workspace has token |
| `credentials.ts` | `credential-store.ts` | `import { setCredential }` | WIRED | Called at line 52 when token provided |
| `credentials.ts` | `token-refresh.ts` | `import { fetchWorkspaceTokens }` | WIRED | Called at line 61 for workspace discovery |
| `workspace/use.ts` | `workspace-config.ts` | `import { findWorkspace, setActiveWorkspace }` | WIRED | Both called in `run()` |

### Data-Flow Trace (Level 4)

These are auth commands operating on local config/keychain storage — no remote data rendering except `fetchWorkspaceTokens` which is triggered interactively.

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `status.ts` | `this.activeWorkspace` | `BaseCommand.init()` → `getWorkspaceForDomain` → `conf` storage | Yes — reads from real conf file | FLOWING |
| `list.ts` | `workspaces` | `getWorkspaces()` → `conf` storage | Yes — reads from real conf file | FLOWING |
| `use.ts` | `result` | `findWorkspace()` → `getWorkspaces()` → `conf` storage | Yes — reads from real conf file | FLOWING |
| `credentials.ts` | `workspaces` | `fetchWorkspaceTokens()` → `fetch()` → live API | Yes — real HTTP call to `/api/2/user/tokens` | FLOWING |

### Behavioral Spot-Checks

The Phase 2 commands require an OS keychain and a configured workspace to produce meaningful output. Spot-checks that avoid external services:

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All Phase 2 test files pass (75 tests) | `pnpm --filter twentythree-cli test --run` (Phase 2 files only) | 9 files, 75 tests passed | PASS |
| credential-store exports 4 functions | grep exports in credential-store.ts | setCredential, getCredential, deleteCredential, hasCredential all exported | PASS |
| workspace-config exports WorkspaceEntry and 8 functions | grep exports | WorkspaceEntry, getWorkspaces, setWorkspaces, getActiveWorkspace, setActiveWorkspace, findWorkspace, getWorkspaceForDomain, getConfigPath, clearConfig all exported | PASS |
| token-refresh exports REFRESH_THRESHOLD_MS = 300000 | grep REFRESH_THRESHOLD_MS | `5 * 60 * 1000` confirmed | PASS |
| auth status formatExpiry dead code (SC2 gap) | grep -n formatExpiry status.ts | Defined at line 8, zero other references | FAIL |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| AUTH-01 | 02-02, 02-05 | Bearer tokens stored in OS keychain only | SATISFIED | `setCredential` uses `@napi-rs/keyring Entry`; `credential-store.ts` verified |
| AUTH-02 | 02-01, 02-03, 02-05 | Workspace discovery on `auth credentials` | SATISFIED | `fetchWorkspaceTokens` called in `credentials.ts` when token provided |
| AUTH-03 | 02-05 | User prompted to select workspace and default | SATISFIED | `p.select` in `credentials.ts` lines 75-87 |
| AUTH-04 | 02-04 | `[domain]` header on every command output | SATISFIED | `printWorkspaceHeader()` in `BaseCommand`; 217 call sites in command files |
| AUTH-05 | 02-03 | Token refresh with concurrency guard | SATISFIED | `ensureFreshToken` uses `proper-lockfile` with post-lock re-check |
| AUTH-06 | 02-05 | `auth status` shows credentials, workspace, token expiry, auth mode | PARTIAL | Domain, display_name, auth mode, workspace count shown. Token expiry NOT shown — `formatExpiry` helper is dead code. |
| AUTH-07 | 02-05 | `workspace list` lists workspaces with default marked | SATISFIED | `chalk.green('*')` marker in `list.ts` |
| AUTH-08 | 02-05 | `workspace use <name>` switches workspace | SATISFIED | `findWorkspace` + `setActiveWorkspace` in `use.ts` |
| AUTH-09 | 02-04 | Every command accepts `--workspace` flag | SATISFIED | `BaseCommand.baseFlags.workspace` inherited by all commands |
| AUTH-10 | 02-04 | Auth-required commands fail with exact error in anonymous mode | SATISFIED | Exact message verified in `AuthenticatedCommand.init()` |
| AUTH-11 | 02-04 | Auth header sent only when token configured | SATISFIED | Conditional middleware in `createApiClient`; falsy token skips `client.use()` |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/commands/auth/status.ts` | 8 | `formatExpiry` function defined but never called in `run()` | Warning | SC2 and AUTH-06 require token expiry display — the helper exists but is dead code; output shows "active (auto-refreshes)" instead of actual expiry time |

No TODO/FIXME/placeholder comments found in Phase 2 implementation files. No hardcoded empty returns that flow to user-visible output. No stub handlers.

### Human Verification Required

#### 1. Auth Status — Token Expiry Display Decision

**Test:** Run `twentythree auth status` after configuring credentials with a real bearer token. Observe whether the token expiry time (e.g. "expires in 2 hours") is shown.

**Expected per ROADMAP SC2 and AUTH-06:** The command should show the actual token expiry (e.g. "Token expires in 2h 15m"). The `formatExpiry()` helper in `status.ts` is already written and correct — it just needs to be called in `run()`.

**Current behavior (verified in UAT test 3):** Command shows "Token: active (auto-refreshes)" with no expiry time. UAT accepted this.

**Why human:** This is a product decision. Two paths:

- **Path A — Fix:** Add `this.log(`Token: ${formatExpiry(workspace.expiration_time)}`)` to `status.ts` run() method. The helper is already written and tested implicitly. This closes AUTH-06 and SC2.

- **Path B — Override:** If "auto-refreshes" is sufficient for your users, accept the deviation by adding to this file's frontmatter:

```yaml
overrides:
  - must_have: "twentythree auth status shows current credentials, active workspace name, and token expiry"
    reason: "Token expiry display descoped — 'auto-refreshes' message is sufficient for v1; formatExpiry helper available for future use"
    accepted_by: "your-name"
    accepted_at: "2026-04-16T00:00:00Z"
```

Then re-run verification to mark as passed with override.

### Gaps Summary

No blocking gaps. The only unresolved item is the token expiry display in `auth status` — a minor output omission where a pre-written helper function (`formatExpiry`) is not called. The ROADMAP and REQUIREMENTS (AUTH-06) require it; the UAT accepted its absence. A human must decide whether to fix (1-line change) or override.

All core Phase 2 infrastructure is fully implemented and wired:
- Keychain-backed credential storage via `@napi-rs/keyring`
- Conf-backed workspace config with exact-domain-precedence matching
- File-lock-protected token refresh with post-lock re-check
- Typed openapi-fetch client factory with conditional auth middleware
- BaseCommand/AuthenticatedCommand wired to all downstream commands
- All four user-facing commands functional with interactive prompts

Test suite: 75 Phase 2 tests, all passing. UAT: 5/5 tests passed.

---

_Verified: 2026-04-16T13:15:00Z_
_Verifier: Claude (gsd-verifier)_
