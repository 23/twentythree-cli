---
phase: 03-video-core
plan: "03"
subsystem: video-commands
tags: [video-crud, oclif-commands, chunked-upload, cli-progress, clack-prompts, pagination]
dependency_graph:
  requires:
    - packages/twentythree-cli/src/lib/output.ts
    - packages/twentythree-cli/src/lib/pagination.ts
    - packages/twentythree-cli/src/upload/chunked-upload.ts
    - packages/twentythree-cli/src/upload/types.ts
    - packages/twentythree-cli/src/lib/base-command.ts
  provides:
    - packages/twentythree-cli/src/commands/video/list.ts
    - packages/twentythree-cli/src/commands/video/get.ts
    - packages/twentythree-cli/src/commands/video/upload.ts
    - packages/twentythree-cli/src/commands/video/update.ts
    - packages/twentythree-cli/src/commands/video/delete.ts
  affects:
    - packages/twentythree-cli/oclif.manifest.json
tech_stack:
  added: []
  patterns:
    - "video list/get: fetchAllPages + cli-table3 table with 6 columns + formatJsonOutput"
    - "video upload: GET /photo/get-upload-token → uploadChunked engine → cliProgress.SingleBar onProgress callback (T-03-06)"
    - "video update: flag mode (conditional body build, T-03-07) + interactive mode (@clack/prompts pre-filled text/select)"
    - "video delete: @clack/prompts confirm with workspace domain (T-03-08) + process.exit(EXIT_CANCELLED) on cancel"
    - "T-03-07: args.id coerced to Number with Number.isFinite() validation before API call"
key_files:
  created:
    - packages/twentythree-cli/src/commands/video/list.ts
    - packages/twentythree-cli/src/commands/video/get.ts
    - packages/twentythree-cli/src/commands/video/upload.ts
    - packages/twentythree-cli/src/commands/video/update.ts
    - packages/twentythree-cli/src/commands/video/delete.ts
  modified:
    - packages/twentythree-cli/oclif.manifest.json
decisions:
  - "API returns data as single object per OpenAPI schema (not array); runtime cast to any handles real list shape from API — fetchAllPages wraps items via Array.isArray check"
  - "video update flag mode explicitly checks each flag !== undefined before adding to body — prevents clearing unset fields (Pitfall 3 / T-03-07)"
  - "upload_token extracted from tokenData.data.upload_token after runtime cast — never logged per T-03-06"
  - "video delete in --json mode skips confirmation prompt (scripting mode assumption per plan)"
metrics:
  duration: "~3 minutes"
  completed_date: "2026-04-14T12:49:23Z"
  tasks_completed: 2
  files_created: 5
  files_modified: 1
---

# Phase 03 Plan 03: Core Video Commands Summary

**One-liner:** Five core video CRUD commands (list, get, upload, update, delete) wiring fetchAllPages pagination, chunked upload engine with cli-progress bar, and @clack/prompts interactive mode to the TwentyThree API.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Implement video list and video get commands | 92ce8a3 | list.ts, get.ts |
| 2 | Implement video upload, update, and delete commands | 8582c63 | upload.ts, update.ts, delete.ts |

## What Was Built

### `src/commands/video/list.ts`

Exports `VideoList` extending `AuthenticatedCommand`:
- Calls `this.printWorkspaceHeader()` at top of `run()`
- Uses `fetchAllPages` to auto-paginate `GET /photo/list` (size=100 per page)
- Runtime-casts response `data` to handle actual API array shape (schema defines `data` as single object but API returns paginated list)
- Renders `cli-table3` table with columns: ID, Title, Duration, Status, Published, Updated
- Applies `applyCliTerms` to title and all string fields in rows
- `--json` returns `formatJsonOutput` with `{ ok, data, summary, breadcrumbs }` shape
- Trailing `chalk.dim(N videos)` count after table

### `src/commands/video/get.ts`

Exports `VideoGet` extending `AuthenticatedCommand`:
- Args: `id` (required Video ID)
- Fetches via `GET /photo/list?photo_id=<id>` — no separate `/photo/get` endpoint (Pitfall 8)
- Extracts single video from runtime response; errors with `Video N not found` if missing
- Displays label-value pairs: ID, Title, Description, Duration, Status, Published, Tags, Category, Created, Updated
- `applyCliTerms` applied to title, description, tags, category fields
- `--json` returns `formatJsonOutput`

### `src/commands/video/upload.ts`

Exports `VideoUpload` extending `AuthenticatedCommand`:
- Args: `file` (required path). Flags: `--title`, `--description`, `--tags`, `--category-id`, `--publish` (boolean), `--chunk-size` (default 100MB), `--concurrency` (default 5)
- Validates file exists via `fs.stat` before making any API calls
- Step 1: `GET /photo/get-upload-token` with optional metadata flags
- Step 2: `cliProgress.SingleBar` wired to `uploadChunked` `onProgress` callback — shows `[bar] N% | bytes / total | ETA | speed`; `clearOnComplete: true` erases bar on finish
- `upload_token` never logged — T-03-06 mitigation
- `--json` returns `formatJsonOutput` with `photo_id` in breadcrumbs

### `src/commands/video/update.ts`

Exports `VideoUpdate` extending `AuthenticatedCommand`:
- Args: `id` (required). Flags: `--title`, `--description`, `--tags`, `--category-id`, `--publish`/`--no-publish`, `--promote`/`--no-promote`, `--publish-date`, `--360`/`--no-360`
- T-03-07: `args.id` validated as `Number.isFinite(videoId) && videoId > 0` before sending to API
- **Flag mode**: body built with `if (flags.X !== undefined) body.key = flags.X` — only provided flags sent (Pitfall 3 mitigation)
- **Interactive mode**: triggered when no metadata flags and not `--json`; fetches current video, pre-fills `@clack/prompts` `text()` fields for title/description/tags and `select()` for published; `isCancel()` checked after each prompt → `process.exit(EXIT_CANCELLED)`
- POSTs to `/photo/update` with `application/x-www-form-urlencoded` content type

### `src/commands/video/delete.ts`

Exports `VideoDelete` extending `AuthenticatedCommand`:
- Args: `id` (required)
- T-03-08: `@clack/prompts` `confirm()` shows `Delete video N from <domain>? This cannot be undone.`
- `--json` skips confirmation (scripting mode)
- `isCancel(confirmed) || !confirmed` → `process.exit(EXIT_CANCELLED)` (exit code 2)
- POSTs to `/photo/delete` with `{ photo_id: Number(args.id) }` form-encoded

## Verification

- 145 tests pass across 15 test files (no regressions)
- Build succeeds: 26 output files including all 5 new command CJS bundles
- All 5 command files have `printWorkspaceHeader()` (verified via `grep -c`)
- All acceptance criteria met for both tasks

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Added numeric ID validation for video update (T-03-07)**
- **Found during:** Task 2 implementation — threat model assigns T-03-07 as `mitigate` disposition requiring numeric ID validation on `update.ts`
- **Fix:** Added `Number.isFinite(videoId) && videoId > 0` check with `this.error(...)` before any API calls
- **Files modified:** `packages/twentythree-cli/src/commands/video/update.ts`
- **Commit:** 8582c63

### Notes

The OpenAPI schema defines the `/photo/list` response `data` field as a single object, but the actual TwentyThree API returns paginated items under `data`. Both `list.ts` and `get.ts` use a runtime cast to `any` and an `Array.isArray` check to handle the real response shape. This is a known schema inconsistency in the OpenAPI spec — not a code defect.

## Known Stubs

None — all five commands are fully implemented. No placeholder data or hardcoded empty values.

## Threat Surface Scan

All four threat model items for this plan are addressed:

| Threat | Mitigation | Status |
|--------|-----------|--------|
| T-03-06 (Info Disclosure — upload_token logging) | Token extracted from response but never logged; progress bar shows only byte counts | Implemented |
| T-03-07 (Tampering — update body fields) | Only flags explicitly provided are added to body; args.id validated as positive integer | Implemented |
| T-03-08 (Repudiation — delete without domain context) | Confirmation prompt includes `this.activeWorkspace.domain` | Implemented |
| T-03-09 (EoP — anonymous access) | All five commands extend AuthenticatedCommand | Implemented |

No new network endpoints, auth paths, file access patterns, or schema changes outside the plan's defined boundaries were introduced.

## Self-Check: PASSED

Files verified:
- FOUND: packages/twentythree-cli/src/commands/video/list.ts
- FOUND: packages/twentythree-cli/src/commands/video/get.ts
- FOUND: packages/twentythree-cli/src/commands/video/upload.ts
- FOUND: packages/twentythree-cli/src/commands/video/update.ts
- FOUND: packages/twentythree-cli/src/commands/video/delete.ts

Commits verified:
- FOUND: 92ce8a3
- FOUND: 8582c63
