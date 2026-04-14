---
phase: "02-auth-workspaces"
plan: "04"
subsystem: "api-client-base-command"
tags: ["openapi-fetch", "oclif", "auth", "base-command"]
dependency_graph:
  requires: ["02-02", "02-03"]
  provides: ["api-client-factory", "base-command", "authenticated-command"]
  affects: ["all Phase 3-8 commands"]
tech_stack:
  added: []
  patterns:
    - "openapi-fetch middleware for conditional Authorization header injection"
    - "oclif BaseCommand with baseFlags for inherited --workspace flag"
    - "AuthenticatedCommand extends BaseCommand with auth guard in init()"
    - "vi.hoisted() for vitest mock variables used in vi.mock() factories"
    - "Minimal oclif config stub ({ runHook: vi.fn(), userAgent, scopedEnvVar }) for unit tests without full oclif runtime"
key_files:
  created:
    - "packages/twentythree-cli/src/api/client.ts"
    - "packages/twentythree-cli/src/lib/base-command.ts"
  modified:
    - "packages/twentythree-cli/src/api/__tests__/client.test.ts"
    - "packages/twentythree-cli/src/lib/__tests__/base-command.test.ts"
decisions:
  - "Used vi.hoisted() to declare mock variables before vi.mock() factories — required by vitest's hoisting semantics"
  - "Provided minimal oclif config stub in tests instead of mocking this.parse() — avoids fragile spy chain, lets real oclif parser run with real argv"
  - "Mock paths in test files use paths relative to test file location (../../auth/) not relative to the module being tested"
  - "Empty string bearer_token treated as falsy — no auth middleware registered in anonymous mode (AUTH-11)"
metrics:
  duration: "~30 minutes"
  completed: "2026-04-14"
  tasks_completed: 2
  files_changed: 4
---

# Phase 02 Plan 04: API Client Factory and Base Command Summary

**One-liner:** openapi-fetch factory with conditional Bearer auth middleware + oclif BaseCommand/AuthenticatedCommand wiring workspace resolution and AUTH-10/11 guards.

## What Was Built

### Task 1: API Client Factory (`src/api/client.ts`)

`createApiClient(config: ClientConfig)` wraps `openapi-fetch`'s `createClient<paths>()` with conditional auth middleware:

- `ClientConfig.baseUrl` — uses `workspace.api_base_url` directly (already has trailing slash)
- `ClientConfig.token` — optional; if truthy, registers an `onRequest` middleware that sets `Authorization: Bearer {token}`
- If `token` is falsy (undefined or empty string), no middleware is registered — anonymous mode sends no auth header (AUTH-11)

### Task 2: BaseCommand and AuthenticatedCommand (`src/lib/base-command.ts`)

**BaseCommand** (all commands extend this):
- `static enableJsonFlag = true` — adds `--json` to every command
- `static baseFlags` with `workspace` flag (`-w`) — resolves per-invocation workspace (AUTH-09)
- `init()`: parses flags, resolves workspace from `--workspace` flag (via `findWorkspace`) or active domain (via `getActiveWorkspace` + `getWorkspaceForDomain`), calls `ensureFreshToken` if token present, creates `this.apiClient` via `createApiClient`
- Ambiguous `--workspace` match → `@clack/prompts` select to disambiguate
- No workspace at all → error with setup message, exit 1
- `printWorkspaceHeader()` — logs `chalk.dim('[domain]')` (AUTH-04)

**AuthenticatedCommand** (commands requiring a token extend this):
- Overrides `init()`: calls `super.init()`, then checks `this.activeWorkspace.bearer_token`
- If falsy: `this.error('This command requires authentication — run \`twentythree auth credentials\` to add a bearer token', { exit: 1 })` — exact AUTH-10 message

## Test Coverage

- `client.test.ts`: 5 tests — baseUrl passthrough, auth middleware registered with token, `client.use()` called once, middleware sets correct header, no middleware without token, no middleware with empty string token
- `base-command.test.ts`: 9 tests — `--workspace` flag resolves via `findWorkspace`, active workspace fallback, no-workspace error, `ensureFreshToken` called with token, not called without token, `createApiClient` called with correct args, `printWorkspaceHeader` dim output, AUTH-10 rejection, AUTH-10 pass with token

All 74 package tests pass.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed vi.mock path resolution in test file**
- **Found during:** Task 2
- **Issue:** Test file at `src/lib/__tests__/base-command.test.ts` used `vi.mock('../auth/workspace-config.js', ...)` which resolves relative to the test file as `src/lib/auth/workspace-config.js` — a non-existent path. The actual module is `src/auth/workspace-config.ts` (one more level up).
- **Fix:** Changed all three vi.mock paths from `../auth/...`, `../api/...` to `../../auth/...`, `../../api/...`
- **Files modified:** `src/lib/__tests__/base-command.test.ts`
- **Commit:** ae9ef81

**2. [Rule 1 - Bug] Used vi.hoisted() for mock variables in vi.mock() factories**
- **Found during:** Task 1
- **Issue:** Variables declared with `const mockFn = vi.fn()` before `vi.mock()` cause "Cannot access before initialization" because vitest hoists `vi.mock()` calls to the top of the file.
- **Fix:** Wrapped all shared mock variables in `vi.hoisted(() => { ... })` so they are initialized before the hoisted `vi.mock()` factories run.
- **Files modified:** `src/api/__tests__/client.test.ts`, `src/lib/__tests__/base-command.test.ts`
- **Commit:** 7911c42, ae9ef81

**3. [Rule 1 - Bug] Used minimal oclif config stub instead of vi.spyOn on parse**
- **Found during:** Task 2
- **Issue:** Constructing an oclif Command with empty config `{}` caused `this.config.runHook is not a function` when `parse()` fired the `preparse` hook. Attempting to `vi.spyOn(cmd, 'parse')` after construction but before `init()` did not intercept the call correctly.
- **Fix:** Provided a minimal config stub `{ userAgent, scopedEnvVar, runHook: vi.fn().mockResolvedValue({ successes: [], failures: [] }), theme: {} }` as the second constructor argument. This lets oclif's real `parse()` run against the actual argv, giving tests realistic flag parsing behavior.
- **Files modified:** `src/lib/__tests__/base-command.test.ts`
- **Commit:** ae9ef81

## Commits

| Hash | Message |
|------|---------|
| `7911c42` | feat(02-04): API client factory with conditional auth middleware |
| `ae9ef81` | feat(02-04): BaseCommand and AuthenticatedCommand with workspace resolution |

## Known Stubs

None — all functionality is wired end-to-end.

## Threat Flags

No new threat surface beyond what was planned. Authorization header is injected only via `if (config.token)` branch — empty string and undefined both excluded (AUTH-11 mitigated). `AuthenticatedCommand.init()` runs before `run()` — elevation-of-privilege threat T-02-10 mitigated.

## Self-Check: PASSED

- `packages/twentythree-cli/src/api/client.ts` — exists
- `packages/twentythree-cli/src/lib/base-command.ts` — exists
- Commit `7911c42` — exists
- Commit `ae9ef81` — exists
- All 74 tests passing
