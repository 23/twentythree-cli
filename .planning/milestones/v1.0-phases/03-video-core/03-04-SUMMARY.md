---
phase: 03-video-core
plan: "04"
subsystem: video-commands
tags: [video, replace, transcoding, frame, sections, chunked-upload]
dependency_graph:
  requires: [03-01, 03-02, 03-03]
  provides: [video-replace, video-transcoding-progress, video-frame, video-section-commands]
  affects: [upload/types.ts, upload/chunked-upload.ts]
tech_stack:
  added: []
  patterns: [replace-token-flow, tokenFieldName-param, section-subcommands, confirmation-prompt]
key_files:
  created:
    - packages/twentythree-cli/src/commands/video/replace.ts
    - packages/twentythree-cli/src/commands/video/transcoding-progress.ts
    - packages/twentythree-cli/src/commands/video/frame.ts
    - packages/twentythree-cli/src/commands/video/section/list.ts
    - packages/twentythree-cli/src/commands/video/section/create.ts
    - packages/twentythree-cli/src/commands/video/section/update.ts
    - packages/twentythree-cli/src/commands/video/section/delete.ts
    - packages/twentythree-cli/src/commands/video/section/set-thumbnail.ts
  modified:
    - packages/twentythree-cli/src/upload/types.ts
    - packages/twentythree-cli/src/upload/chunked-upload.ts
decisions:
  - "Added tokenFieldName parameter to ChunkedUploadParams so replace flow can use replace_token field name instead of upload_token — avoids duplicating the entire upload engine"
  - "section/delete skips confirmation when --json is passed, consistent with video delete pattern"
metrics:
  duration: ~25min
  completed: "2026-04-14T12:55:35Z"
  tasks_completed: 2
  files_created: 8
  files_modified: 2
---

# Phase 03 Plan 04: Video Replace, Transcoding, Frame, and Sections Summary

**One-liner:** Replace-token chunked upload to `/photo/replace`, transcoding progress, frame extraction, and all 5 section CRUD subcommands with confirmation-guarded delete.

## What Was Built

### Task 1: video replace, transcoding-progress, frame

**video replace** (`src/commands/video/replace.ts`):
- Two-step flow: `GET /photo/get-replace-token` → chunked upload to `/photo/replace`
- Uses the chunked upload engine with `tokenFieldName: 'replace_token'` so the FormData field matches what the replace endpoint expects (distinct from `upload_token` used by upload)
- Identical progress bar UI to `video upload`
- T-03-10: replace_token never logged — only byte counts in progress bar

**video transcoding-progress** (`src/commands/video/transcoding-progress.ts`):
- `GET /photo/get-transcoding-progress?photo_id=<id>`
- Displays percentage and status in terminal; full data in `--json` mode

**video frame** (`src/commands/video/frame.ts`):
- `POST /photo/frame` with `photo_id` and optional `time` offset
- Displays frame URL if returned; falls back to success confirmation

### Task 2: video section subcommands (5 commands)

All extend `AuthenticatedCommand`, call `printWorkspaceHeader()`, support `--json`, apply `applyCliTerms`.

| Command | Endpoint | Notes |
|---------|----------|-------|
| `video section list <id>` | `GET /photo/section/list` | Table: ID, Title, Start Time, Description |
| `video section create <id>` | `POST /photo/section/create` | Required: `--title`, `--start-time`; optional: `--description` |
| `video section update <id>` | `POST /photo/section/update` | T-03-12: only sends explicitly provided fields |
| `video section delete <id>` | `POST /photo/section/delete` | T-03-11: confirmation includes workspace domain + section ID; skipped with `--json` |
| `video section set-thumbnail <id>` | `POST /photo/section/set-thumbnail` | Required: `--section-id`; optional: `--time` |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added `tokenFieldName` to chunked upload engine**
- **Found during:** Task 1 — replace endpoint uses `replace_token` field name but chunked engine hardcoded `upload_token`
- **Issue:** The plan noted this risk explicitly: "if the endpoint expects `replace_token` as the field name, a small adaptation is needed"
- **Fix:** Added optional `tokenFieldName?: string` to `ChunkedUploadParams` in `types.ts`; updated `chunked-upload.ts` to use `tokenFieldName` (defaults to `'upload_token'` for backward compatibility); `replace.ts` passes `tokenFieldName: 'replace_token'`
- **Files modified:** `src/upload/types.ts`, `src/upload/chunked-upload.ts`
- **Impact:** Zero breaking change — existing upload.ts unaffected (default value preserved)

## Verification Results

- Build: PASSED (34 files, 0 errors)
- Tests: 145/145 PASSED
- All acceptance criteria: PASSED
- All 8 command files created, all 2 engine files updated

## Known Stubs

None — all commands wire to real API endpoints.

## Threat Flags

None — no new network surfaces beyond the endpoints specified in the plan.

## Self-Check: PASSED

All files verified present:
- `packages/twentythree-cli/src/commands/video/replace.ts` — FOUND
- `packages/twentythree-cli/src/commands/video/transcoding-progress.ts` — FOUND
- `packages/twentythree-cli/src/commands/video/frame.ts` — FOUND
- `packages/twentythree-cli/src/commands/video/section/list.ts` — FOUND
- `packages/twentythree-cli/src/commands/video/section/create.ts` — FOUND
- `packages/twentythree-cli/src/commands/video/section/update.ts` — FOUND
- `packages/twentythree-cli/src/commands/video/section/delete.ts` — FOUND
- `packages/twentythree-cli/src/commands/video/section/set-thumbnail.ts` — FOUND
- `packages/twentythree-cli/src/upload/types.ts` (modified) — FOUND
- `packages/twentythree-cli/src/upload/chunked-upload.ts` (modified) — FOUND
