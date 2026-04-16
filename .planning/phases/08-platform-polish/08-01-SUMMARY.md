---
phase: 08-platform-polish
plan: "01"
subsystem: spot-commands
tags: [cli, spot, commands, crud]
dependency_graph:
  requires: []
  provides: [spot/list, spot/create, spot/update, spot/delete, spot/set-videos, spot/check, spot/reset-version]
  affects: [src/commands/spot/]
tech_stack:
  added: []
  patterns: [AuthenticatedCommand, renderTable, formatJsonOutput, parseBoolParam, confirm-prompt, agentMetadata]
key_files:
  created:
    - packages/twentythree-cli/src/commands/spot/list.ts
    - packages/twentythree-cli/src/commands/spot/create.ts
    - packages/twentythree-cli/src/commands/spot/update.ts
    - packages/twentythree-cli/src/commands/spot/delete.ts
    - packages/twentythree-cli/src/commands/spot/set-videos.ts
    - packages/twentythree-cli/src/commands/spot/check.ts
    - packages/twentythree-cli/src/commands/spot/reset-version.ts
  modified: []
decisions:
  - "spot/list.ts query params cast to any for spot_type/orderby/order enum constraints — OpenAPI types restrict to specific union values but CLI accepts free strings for forward-compat"
  - "active_p passed as boolean (not 1/0) to list.ts query — API types define active_p as boolean for GET (unlike POST body which uses 1/0)"
metrics:
  duration: "3 minutes"
  completed: "2026-04-16"
  tasks: 2
  files: 7
---

# Phase 08 Plan 01: Spot Commands Summary

**One-liner:** 7 spot commands (list/create/update/delete/set-videos/check/reset-version) covering the complete embed-container CRUD surface via GET /spot/list and POST /spot/* endpoints.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Implement spot list, create, update, and delete commands | 99f87bc | spot/list.ts, spot/create.ts, spot/update.ts, spot/delete.ts |
| 2 | Implement spot set-videos, check, and reset-version commands | bcc0958 | spot/set-videos.ts, spot/check.ts, spot/reset-version.ts |

## Decisions Made

1. **Query param enum casts** — `spot/list.ts` uses `as any` for `spot_type`, `orderby`, and `order` query params. The OpenAPI types constrain these to specific unions (`"page" | "widget"`, `"spot_name" | "creation_time" | "title"`, `"desc" | "asc"`) but the CLI flag accepts free strings. Cast to `any` follows the established codebase pattern for this mismatch.

2. **active_p as boolean for GET** — The `/spot/list` query type defines `active_p` as `boolean` (not `0 | 1` integer), so the GET call passes the result of `parseBoolParam()` directly rather than converting to `0 | 1`. POST body params still use `1 | 0` in update.ts.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type errors in spot/list.ts query params**
- **Found during:** Task 2 verification (tsc --noEmit after Task 2 was complete)
- **Issue:** `spot_type`, `orderby`, `order` flags pass `string | undefined` but the OpenAPI-generated types constrain them to specific string unions. `active_p` was incorrectly passed as `1 | 0` when the query type expects `boolean`.
- **Fix:** Cast `spot_type`, `orderby`, `order` to `any`; pass `activeVal` directly for `active_p` (it's already `boolean | undefined` from `parseBoolParam`).
- **Files modified:** `packages/twentythree-cli/src/commands/spot/list.ts`
- **Commit:** bcc0958 (included in Task 2 commit)

## Known Stubs

None — all 7 commands are fully wired to live API endpoints.

## Threat Surface Scan

No new trust boundaries introduced beyond what the plan's threat model documents. All 7 commands extend `AuthenticatedCommand` (T-08-02 mitigated). `spot/delete.ts` has the `confirm()` prompt with workspace domain (T-08-01 mitigated). No new network endpoints, file access patterns, or schema changes outside the spot API paths.

## Self-Check: PASSED

Files verified:
- packages/twentythree-cli/src/commands/spot/list.ts: FOUND
- packages/twentythree-cli/src/commands/spot/create.ts: FOUND
- packages/twentythree-cli/src/commands/spot/update.ts: FOUND
- packages/twentythree-cli/src/commands/spot/delete.ts: FOUND
- packages/twentythree-cli/src/commands/spot/set-videos.ts: FOUND
- packages/twentythree-cli/src/commands/spot/check.ts: FOUND
- packages/twentythree-cli/src/commands/spot/reset-version.ts: FOUND

Commits verified:
- 99f87bc: feat(08-01): implement spot list, create, update, and delete commands
- bcc0958: feat(08-01): implement spot set-videos, check, and reset-version commands

Test suite: 146/146 passing
TypeScript: 0 errors in spot/ commands
