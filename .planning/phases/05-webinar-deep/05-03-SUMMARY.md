---
phase: 05-webinar-deep
plan: "03"
subsystem: webinar-recording-transcription-room-queued-video
tags:
  - webinar
  - recording
  - transcription
  - room
  - queued-video
  - action-commands
dependency_graph:
  requires:
    - 05-01 (webinar attachment/section commands)
    - 05-02 (webinar speaker/mail commands)
  provides:
    - webinar recording start/stop/status
    - webinar transcription list/connect/locales/transcriptionlist
    - webinar room info/themes/send-recording/connect
    - webinar queued-video add/remove
  affects:
    - oclif command manifest (13 new commands registered)
tech_stack:
  added: []
  patterns:
    - Action command pattern (single green success line + --json passthrough)
    - Token auto-lookup via fetchWebinarToken (Decision D-4)
    - CLI flag --video-id mapped to API body field photo_id (terminology mapping)
    - as any casts for API paths not in generated OpenAPI types
key_files:
  created:
    - packages/twentythree-cli/src/commands/webinar/recording/start.ts
    - packages/twentythree-cli/src/commands/webinar/recording/stop.ts
    - packages/twentythree-cli/src/commands/webinar/recording/status.ts
    - packages/twentythree-cli/src/commands/webinar/transcription/list.ts
    - packages/twentythree-cli/src/commands/webinar/transcription/connect.ts
    - packages/twentythree-cli/src/commands/webinar/transcription/locales.ts
    - packages/twentythree-cli/src/commands/webinar/transcription/transcriptionlist.ts
    - packages/twentythree-cli/src/commands/webinar/room/info.ts
    - packages/twentythree-cli/src/commands/webinar/room/themes.ts
    - packages/twentythree-cli/src/commands/webinar/room/send-recording.ts
    - packages/twentythree-cli/src/commands/webinar/room/connect.ts
    - packages/twentythree-cli/src/commands/webinar/queued-video/add.ts
    - packages/twentythree-cli/src/commands/webinar/queued-video/remove.ts
  modified: []
decisions:
  - "All room commands use /live/webinar/* paths (not /live/room/*) per plan spec"
  - "transcription/transcriptionlist.ts uses /live/transcriptionlist (workspace-scoped) NOT /live/transcription/list (webinar-scoped)"
  - "queued-video commands: CLI --video-id flag maps to photo_id in API body (terminology mapping)"
  - "recording/start and stop: upload_token deliberately not displayed per T-05-10 (security)"
  - "recording/status: only displays status field, upload_token filtered out per T-05-11"
metrics:
  duration: ~15min
  completed_date: "2026-04-15"
  tasks_completed: 3
  files_created: 13
---

# Phase 5 Plan 03: Recording, Transcription, Room, and Queued-Video Commands Summary

13 webinar sub-resource commands covering recording lifecycle control, transcription management, room info, and video queue — all with upload_token security filtering and CLI-to-API terminology mapping.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Recording start/stop/status + queued-video add/remove | 6f64ac6 | 5 files |
| 2 | Transcription list, connect, locales, transcriptionlist | e2975d2 | 4 files |
| 3 | Room info, themes, send-recording, connect | 5fc6124 | 4 files |

## What Was Built

### Recording Commands (WEB-16)
- `webinar recording start <id>` — POSTs to `/live/recording/start`, action command pattern
- `webinar recording stop <id>` — POSTs to `/live/recording/stop`, action command pattern
- `webinar recording status <id>` — GETs `/live/recording/status`, displays status field only

### Transcription Commands (WEB-17)
- `webinar transcription list <id>` — GETs `/live/transcription/list` with token auto-lookup
- `webinar transcription connect <id>` — POSTs `/live/transcription/connect`, action command
- `webinar transcription locales <id>` — GETs `/live/transcription/locales` with token auto-lookup
- `webinar transcription transcriptionlist` — GETs `/live/transcriptionlist` (workspace-scoped, distinct path)

### Room Commands (WEB-18)
- `webinar room info <id>` — GETs `/live/webinar/info`, key-value table
- `webinar room themes` — GETs `/live/webinar/room-themes`, workspace-scoped
- `webinar room send-recording <id>` — POSTs `/live/webinar/send-recording`, action command
- `webinar room connect <id>` — GETs `/live/webinar/connect`, connection details table

### Queued-Video Commands (WEB-20)
- `webinar queued-video add <id> --video-id <vid>` — POSTs `/live/queuedvideos/add` with `photo_id`
- `webinar queued-video remove <id> --video-id <vid>` — POSTs `/live/queuedvideos/remove` with `photo_id`

## Security Mitigations Applied

| Threat ID | Mitigation |
|-----------|-----------|
| T-05-10 | recording/start.ts and recording/stop.ts: `upload_token` never displayed in any `this.log()` call |
| T-05-11 | recording/status.ts: only `status` field shown in table, `upload_token` not rendered |
| T-05-12 | All 13 commands apply `applyCliTerms()` to error messages before display |
| T-05-13 | queued-video/add.ts and remove.ts: `--video-id` validated as positive integer before use as `photo_id` |

## Deviations from Plan

None — plan executed exactly as written.

All API paths required `as any` casts (as noted in plan), consistent with the established pattern for paths not in generated OpenAPI types.

## Known Stubs

None. All commands are fully wired to the API with correct paths and field names.

## Self-Check: PASSED

Files exist:
- packages/twentythree-cli/src/commands/webinar/recording/start.ts: FOUND
- packages/twentythree-cli/src/commands/webinar/recording/stop.ts: FOUND
- packages/twentythree-cli/src/commands/webinar/recording/status.ts: FOUND
- packages/twentythree-cli/src/commands/webinar/transcription/list.ts: FOUND
- packages/twentythree-cli/src/commands/webinar/transcription/connect.ts: FOUND
- packages/twentythree-cli/src/commands/webinar/transcription/locales.ts: FOUND
- packages/twentythree-cli/src/commands/webinar/transcription/transcriptionlist.ts: FOUND
- packages/twentythree-cli/src/commands/webinar/room/info.ts: FOUND
- packages/twentythree-cli/src/commands/webinar/room/themes.ts: FOUND
- packages/twentythree-cli/src/commands/webinar/room/send-recording.ts: FOUND
- packages/twentythree-cli/src/commands/webinar/room/connect.ts: FOUND
- packages/twentythree-cli/src/commands/webinar/queued-video/add.ts: FOUND
- packages/twentythree-cli/src/commands/webinar/queued-video/remove.ts: FOUND

Commits exist:
- 6f64ac6: FOUND
- e2975d2: FOUND
- 5fc6124: FOUND

TypeScript compilation: 0 errors in new files
