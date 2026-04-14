---
phase: "02-auth-workspaces"
plan: "05"
subsystem: "auth-commands"
tags: [auth, workspace, credentials, oclif, clack-prompts]
dependency_graph:
  requires: ["02-04"]
  provides: [auth-credentials-command, auth-status-command, workspace-list-command, workspace-use-command]
  affects: [all-downstream-commands]
tech_stack:
  added: []
  patterns: [oclif-command-extends-base, clack-prompts-interactive-flow, domain-only-anonymous-mode]
key_files:
  created:
    - packages/twentythree-cli/src/commands/auth/credentials.ts
    - packages/twentythree-cli/src/commands/auth/status.ts
    - packages/twentythree-cli/src/commands/workspace/list.ts
    - packages/twentythree-cli/src/commands/workspace/use.ts
  modified:
    - packages/twentythree-cli/src/commands/auth/__tests__/credentials.test.ts
    - packages/twentythree-cli/src/commands/auth/__tests__/status.test.ts
    - packages/twentythree-cli/src/commands/workspace/__tests__/list.test.ts
    - packages/twentythree-cli/src/commands/workspace/__tests__/use.test.ts
decisions:
  - "auth credentials uses raw oclif Command (not BaseCommand) — it runs before any workspace is configured"
  - "auth status extends BaseCommand but not AuthenticatedCommand — status works in both auth modes"
  - "token is never included in auth status output (even --json) per T-02-14 threat mitigation"
  - "domain-only mode stores a conf entry without calling keychain or workspace discovery"
metrics:
  duration_seconds: 143
  completed_date: "2026-04-14"
  tasks_completed: 2
  tasks_total: 3
  files_created: 4
  files_modified: 4
---

# Phase 02 Plan 05: Auth Commands and Workspace Switching Summary

**One-liner:** Interactive auth credentials entry + workspace discovery using @clack/prompts, with workspace list and switching via display-name/domain matching.

## What Was Built

Four user-facing oclif commands completing the Phase 2 auth flow:

### `auth credentials`
- Interactive prompt flow via `@clack/prompts`: domain, then optional bearer token
- When token provided: stores in OS keychain via `setCredential` (AUTH-01), calls `fetchWorkspaceTokens` for workspace discovery (AUTH-02), multi-select prompt for workspace activation (AUTH-03), single-select for default
- When token omitted: stores domain-only entry in conf (no keychain call), sets anonymous mode, informs user of limitations
- Re-auth: overwrites existing entry for same domain without confirmation (per CONTEXT.md decision)
- Does NOT extend BaseCommand — runs before any workspace is configured

### `auth status`
- Extends `BaseCommand` (not `AuthenticatedCommand`) — works in both auth modes
- Prints `[domain]` workspace header via `this.printWorkspaceHeader()` (AUTH-04)
- Shows: domain, display_name, auth mode (authenticated/anonymous), token expiry (relative time), workspace count
- Token value is NEVER shown in output or `--json` response (T-02-14 threat mitigation)
- `--json` returns: `{ domain, display_name, authMode, expiration_time, workspaceCount }`

### `workspace list`
- Extends `BaseCommand`
- Prints all configured workspaces; active workspace marked with `chalk.green('*')` (AUTH-07)
- Shows per-workspace status: authenticated with relative expiry, or anonymous
- Empty state: "No workspaces configured. Run `twentythree auth credentials` to set up."
- `--json` returns array with `isDefault: boolean` field added per workspace

### `workspace use`
- Extends `BaseCommand`
- Accepts required `name` arg (domain or display name)
- Calls `findWorkspace(name, workspaces)`: exact domain takes precedence, then partial display_name/domain contains match (AUTH-08)
- Single match: calls `setActiveWorkspace`, prints confirmation
- Ambiguous match (array): uses `@clack/prompts` select to let user choose
- No match: errors with "No workspace matching '{name}' found. Run `twentythree workspace list` to see available workspaces."

## Verification

- `pnpm --filter twentythree-cli test` — 11 test files, 94 tests, all passing
- `pnpm --filter twentythree-cli build` — build succeeds, all 4 commands compiled to dist/
- `oclif manifest` updated — commands discoverable via `twentythree --help`

## Task Status

| Task | Description | Status | Commit |
|------|-------------|--------|--------|
| 1 | auth credentials + auth status | Complete | 999f529 |
| 2 | workspace list + workspace use | Complete | ad4c53e |
| 3 | End-to-end human verification | Awaiting checkpoint | — |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all four commands are fully wired. No hardcoded empty values or placeholder text in command logic.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced beyond those already in the plan's threat model.

## Self-Check: PASSED

- `packages/twentythree-cli/src/commands/auth/credentials.ts` — FOUND
- `packages/twentythree-cli/src/commands/auth/status.ts` — FOUND
- `packages/twentythree-cli/src/commands/workspace/list.ts` — FOUND
- `packages/twentythree-cli/src/commands/workspace/use.ts` — FOUND
- Commit 999f529 — FOUND
- Commit ad4c53e — FOUND
