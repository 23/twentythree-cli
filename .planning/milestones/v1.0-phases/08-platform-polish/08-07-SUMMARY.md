---
phase: 08-platform-polish
plan: "07"
subsystem: cli-ux
tags: [doctor, health-check, agent-flag, base-command]
dependency_graph:
  requires: [08-01, 08-02, 08-03, 08-04, 08-05, 08-06]
  provides: [doctor-command, agent-metadata-protocol]
  affects: [base-command.ts, every-command-via-baseflags]
tech_stack:
  added: []
  patterns: [oclif-base-command-extension, early-exit-argv-check, process-exit-pattern]
key_files:
  created:
    - packages/twentythree-cli/src/commands/doctor.ts
  modified:
    - packages/twentythree-cli/src/lib/base-command.ts
decisions:
  - "doctor extends oclif Command directly (not BaseCommand) to avoid hard error when no workspace configured"
  - "--agent handler uses process.argv.includes before flag parsing — oclif hasn't parsed flags yet at init() time"
  - "AgentMetadata interface exported from base-command.ts for command authors to declare static agentMetadata"
metrics:
  duration: "69s"
  completed: "2026-04-16"
  tasks_completed: 2
  files_changed: 2
---

# Phase 08 Plan 07: Doctor Command and --agent Global Flag Summary

**One-liner:** `doctor` health check with 3 sequential checks (credentials/connectivity/token) plus `--agent` early-exit metadata flag on BaseCommand using process.argv inspection before workspace resolution.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Implement doctor command per D-1 | 97901b5 | packages/twentythree-cli/src/commands/doctor.ts (created) |
| 2 | Add --agent global flag to BaseCommand per D-2 | 6e85ca4 | packages/twentythree-cli/src/lib/base-command.ts (modified) |

## What Was Built

### Task 1: `twentythree doctor`

A health check command at `src/commands/doctor.ts` that:

- Extends oclif's base `Command` directly (NOT `BaseCommand`) — critical so it doesn't crash when no workspace is configured
- Runs 3 sequential checks:
  1. **Credentials stored** — calls `getActiveWorkspace()` + `getWorkspaceForDomain()`, catches all errors; PASS only when both exist and bearer_token is non-empty
  2. **Connectivity** — HEAD request to workspace `api_base_url` with `AbortSignal.timeout(10000)` (T-08-23 mitigation); skipped if check 1 failed
  3. **Token valid** — GET `/photo/list?size=1` via typed API client; skipped if check 2 failed
- Renders a 3-column `cli-table3` table (Check / Status / Detail) with chalk green checkmark for PASS and chalk red X for FAIL
- `--json` flag returns `{ ok: boolean, checks: Array<{name, passed, detail}> }`
- Exits 1 if any check fails, exits 0 if all pass

### Task 2: `--agent` global flag on BaseCommand

Added to `src/lib/base-command.ts`:

- `export interface AgentMetadata` — type for commands to declare `static agentMetadata`; fields: `api_endpoint`, `auth_scope`, `output_shape`, `side_effects`
- `agent: Flags.boolean({ hidden: true })` registered in `static baseFlags` — available on every command that extends BaseCommand
- Early-exit handler at the **top** of `init()` after `super.init()` — uses `process.argv.includes('--agent')` because oclif hasn't parsed flags yet at this lifecycle stage
- Reads `this.ctor.flags` to build a flags descriptor array (excludes workspace/agent/json)
- Reads `this.ctor.agentMetadata` for the command-declared metadata
- Writes `JSON.stringify(output, null, 2)` to stdout and calls `process.exit(0)` before workspace resolution or any API calls

## Verification

```
# doctor command
test -f packages/twentythree-cli/src/commands/doctor.ts  ✓
grep "extends Command" packages/twentythree-cli/src/commands/doctor.ts  ✓

# --agent flag
grep "agent" packages/twentythree-cli/src/lib/base-command.ts  ✓

# Tests
pnpm --filter twentythree-cli test --run  ✓ 146 passed | 69 todo
```

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Compliance

| Threat ID | Mitigation | Applied |
|-----------|-----------|---------|
| T-08-23 | AbortSignal.timeout(10000) on connectivity HEAD request | Yes — line 48 of doctor.ts |
| T-08-22 | Doctor does not display token values | Yes — only domain name shown in PASS detail |
| T-08-24 | --agent output mirrors --help content (not sensitive) | Accepted — no mitigation needed |

## Known Stubs

None — all checks are fully wired.

## Self-Check

- [x] `packages/twentythree-cli/src/commands/doctor.ts` exists
- [x] Commit `97901b5` exists
- [x] Commit `6e85ca4` exists
- [x] All 146 tests pass
