---
plan: "06-01"
phase: "06-engagement-actions"
subsystem: "action-commands"
tags: [action, cta, commands, engagement]
dependency_graph:
  requires: []
  provides: [action/add, action/delete, action/types, action/update, action/get, action/list, action/exclude, action/include, action/upload]
  affects: []
tech_stack:
  added: []
  patterns: [simple-multipart-formdata-upload, optional-flexible-flags, confirmation-prompt, table-rendering]
key_files:
  created:
    - packages/twentythree-cli/src/commands/action/add.ts
    - packages/twentythree-cli/src/commands/action/delete.ts
    - packages/twentythree-cli/src/commands/action/types.ts
    - packages/twentythree-cli/src/commands/action/update.ts
    - packages/twentythree-cli/src/commands/action/get.ts
    - packages/twentythree-cli/src/commands/action/list.ts
    - packages/twentythree-cli/src/commands/action/exclude.ts
    - packages/twentythree-cli/src/commands/action/include.ts
    - packages/twentythree-cli/src/commands/action/upload.ts
  modified: []
decisions:
  - "D-1 applied: action/upload uses native fetch + FormData (no chunked engine, no upload_token protocol)"
  - "D-5 applied: action/get has all params optional (action_id positional, other context as flags)"
  - "action/list and action/get both call /action/get endpoint — list is filter-oriented, get is detail-oriented"
metrics:
  duration: "4 minutes"
  completed: "2026-04-15T21:44:48Z"
  tasks_completed: 3
  files_created: 9
  files_modified: 0
---

# Phase 06 Plan 01: Action CTA commands Summary

All 9 action CTA commands implemented using native fetch multipart for upload (D-1) and flexible optional flags for action get (D-5).

## What Was Built

Nine command files in `packages/twentythree-cli/src/commands/action/` providing full CTA management: create, modify, delete, scope (exclude/include), list, get, type discovery, and file upload to action variables.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 06-01-01 | Action add, delete, types, update | a3c3c16 | add.ts, delete.ts, types.ts, update.ts |
| 06-01-02 | Action get, list, exclude, include | 144e0ae | get.ts, list.ts, exclude.ts, include.ts |
| 06-01-03 | Action upload (simple multipart) | 57184cb | upload.ts |

## Implementation Notes

**action/add.ts (ACT-04):** POST to `/action/add`. Required flags: `--type`, `--object-id`. Optional `--fields`. Logs `action_id` on success.

**action/delete.ts (ACT-06):** POST to `/action/delete`. Positional `id` arg. Confirmation prompt with domain before deletion (T-06-03 mitigation). EXIT_CANCELLED on user abort.

**action/types.ts (ACT-03):** GET to `/action/types`. Optional `--exclude-internal` flag (maps to `exclude_internal_p: boolean`). Table renders [Type, Name/Description].

**action/update.ts (ACT-05):** POST to `/action/update`. Required: `id` arg, `--name`, `--start-time`, `--end-time`. Optional: `--time-relative-to` (default: "duration"), `--return-url`.

**action/list.ts (ACT-01):** GET to `/action/get` with optional context filters (`--object-id`, `--video-id`, `--webinar-id`, `--player-id`). Warns if no filter provided. Table renders [ID, Name, Type, Start, End].

**action/get.ts (ACT-02, D-5):** GET to `/action/get` — all params optional. Positional `id` for action_id. Context flags: `--object-id`, `--video-id`, `--webinar-id`, `--token`, `--player-id`. Renders label-value pairs.

**action/exclude.ts (ACT-08):** POST to `/action/exclude`. `--undo` flag maps to `remove_exclusion_p: 1`.

**action/include.ts (ACT-07):** POST to `/action/include`. `--undo` flag maps to `remove_inclusion_p: 1`.

**action/upload.ts (ACT-09, D-1):** Native `fetch` + `FormData` POST to `/action/upload`. No chunked engine. Validates file with `stat()` before reading (T-06-01). Auth via `Authorization: Bearer` header only when token configured (T-06-02).

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all commands fully wired to API endpoints.

## Threat Flags

None — all threat model mitigations from the plan applied as specified.

## Self-Check: PASSED

Files verified:
- packages/twentythree-cli/src/commands/action/add.ts — FOUND
- packages/twentythree-cli/src/commands/action/delete.ts — FOUND
- packages/twentythree-cli/src/commands/action/types.ts — FOUND
- packages/twentythree-cli/src/commands/action/update.ts — FOUND
- packages/twentythree-cli/src/commands/action/get.ts — FOUND
- packages/twentythree-cli/src/commands/action/list.ts — FOUND
- packages/twentythree-cli/src/commands/action/exclude.ts — FOUND
- packages/twentythree-cli/src/commands/action/include.ts — FOUND
- packages/twentythree-cli/src/commands/action/upload.ts — FOUND

Commits verified:
- a3c3c16 — feat(06-01): action add, delete, types, update commands
- 144e0ae — feat(06-01): action get, list, exclude, include commands
- 57184cb — feat(06-01): action upload command (simple multipart FormData, D-1)

Tests: 146 passed, 0 failures
TypeScript: 0 new errors (15 pre-existing errors in unrelated files unchanged)
