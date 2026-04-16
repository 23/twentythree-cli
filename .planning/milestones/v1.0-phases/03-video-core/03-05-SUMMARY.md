---
phase: 03-video-core
plan: 05
subsystem: video-subtitle
tags: [commands, subtitle, upload, multipart, archive]
dependency_graph:
  requires:
    - 03-01 (AuthenticatedCommand, base-command infrastructure)
    - packages/twentythree-cli/src/lib/output.ts
    - packages/twentythree-cli/src/lib/term-map.ts
    - packages/twentythree-cli/src/api/client.ts
  provides:
    - video subtitle CRUD commands (list, create, update, delete, upload)
    - video subtitle utility commands (data, locales, types, duplicate, set-primary, archive)
  affects:
    - packages/twentythree-cli/oclif.manifest.json (11 new commands registered)
tech_stack:
  added: []
  patterns:
    - direct multipart POST with bodySerializer for subtitle file upload (not chunked engine)
    - conditional body fields (update sends only provided flags)
    - dual-mode archive command (--progress flag switches between transcribe and get-progress)
    - confirmation prompt for delete includes workspace domain (T-03-14 mitigation)
key_files:
  created:
    - packages/twentythree-cli/src/commands/video/subtitle/list.ts
    - packages/twentythree-cli/src/commands/video/subtitle/create.ts
    - packages/twentythree-cli/src/commands/video/subtitle/update.ts
    - packages/twentythree-cli/src/commands/video/subtitle/delete.ts
    - packages/twentythree-cli/src/commands/video/subtitle/upload.ts
    - packages/twentythree-cli/src/commands/video/subtitle/data.ts
    - packages/twentythree-cli/src/commands/video/subtitle/locales.ts
    - packages/twentythree-cli/src/commands/video/subtitle/types.ts
    - packages/twentythree-cli/src/commands/video/subtitle/duplicate.ts
    - packages/twentythree-cli/src/commands/video/subtitle/set-primary.ts
    - packages/twentythree-cli/src/commands/video/subtitle/archive.ts
  modified: []
decisions:
  - "archive command uses POST for both operations — get-progress endpoint is POST per OpenAPI types, not GET as described in plan prose; followed the types.ts as the authoritative source"
  - "delete command uses locale as subtitle-id (consistent with API field `locale`) rather than a numeric ID"
  - "locales command renders auto-transcribe, auto-translate, and live capability flags in table"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-14"
  tasks_completed: 2
  files_created: 11
  files_modified: 0
---

# Phase 3 Plan 5: Video Subtitle Commands Summary

All 11 video subtitle subcommands implemented, completing the VID-10 requirement for subtitle/caption management from the terminal.

## One-Liner

All 11 subtitle subcommands covering CRUD, file upload via direct multipart FormData POST, metadata queries, locale/type duplication, primary-language setting, and workspace-level archive transcription with progress polling.

## What Was Built

### Task 1: Subtitle CRUD Commands (5 files)

**`subtitle list`** — `GET /photo/subtitle/list` with table output (Locale, Language, Type, Status, Primary). Supports `--include-drafts` flag.

**`subtitle create`** — `POST /photo/subtitle/create` with `--locale` (required), `--type` (default: general), `--draft` (boolean).

**`subtitle update`** — `POST /photo/subtitle/update` sending only provided fields (locale, type, draft, default).

**`subtitle delete`** — `POST /photo/subtitle/remove` (NOT /delete — this is the actual API endpoint). Includes confirmation prompt with workspace domain and subtitle locale (T-03-14 threat mitigation). `--json` skips confirmation.

**`subtitle upload`** — Direct multipart `POST /photo/subtitle/upload` with `bodySerializer` creating FormData. Reads file into Buffer, creates a Blob. NOT the chunked upload engine — subtitle files are small text files.

### Task 2: Subtitle Utility Commands (6 files)

**`subtitle data`** — `GET /photo/subtitle/data` with `--subtitle-id` (locale) and `--format` flags. Displays raw SRT/WebVTT content.

**`subtitle locales`** — `GET /photo/subtitle/locales` with table of Code, Name, Auto Transcribe, Auto Translate, Live capability flags.

**`subtitle types`** — `GET /photo/subtitle/types` with table of Type, Label.

**`subtitle duplicate`** — `POST /photo/subtitle/duplicate` with `--subtitle-id` (source locale), `--target-locale`, optional `--source-type`, `--target-type`, `--draft`.

**`subtitle set-primary`** — `POST /photo/subtitle/set-primary` with `--subtitle-id` (locale).

**`subtitle archive`** — Single command, two operations via `--progress` flag:
- Default (no flag): `POST /photo/subtitle/archive/transcribe` — queues all workspace videos for automatic transcription
- With `--progress`: `POST /photo/subtitle/archive/get-progress` — returns queue status breakdown

## Verification Results

- Build: `pnpm --filter twentythree-cli build` — succeeded, 45 output files, manifest updated
- Tests: `pnpm --filter twentythree-cli test --run` — 145/145 tests passed
- File count: 12 files in `src/commands/video/subtitle/` (11 commands + index.ts)
- All commands have `printWorkspaceHeader()`
- `subtitle delete` uses `/photo/subtitle/remove` endpoint
- `subtitle upload` uses `bodySerializer` with FormData

## Deviations from Plan

**1. [Rule 1 - Deviation] archive endpoint uses POST not GET**
- **Found during:** Task 2, implementing `archive.ts`
- **Issue:** Plan prose described `/photo/subtitle/archive/get-progress` as a GET request. The `types.ts` OpenAPI types define it as a POST operation (`post: operations["videoSubtitleArchiveGetProgress"]`).
- **Fix:** Implemented both archive operations as POST, following the authoritative OpenAPI types.
- **Files modified:** `packages/twentythree-cli/src/commands/video/subtitle/archive.ts`

## Known Stubs

None — all commands are fully wired to the API client. No placeholder data or hardcoded empty values.

## Threat Flags

None — all new surface is within the existing CLI → API trust boundary already modeled in the threat register.

## Self-Check: PASSED

All 11 files exist. Build succeeded. 145 tests pass.
