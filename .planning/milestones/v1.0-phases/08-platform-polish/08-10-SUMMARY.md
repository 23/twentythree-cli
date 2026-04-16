---
phase: "08"
plan: "10"
subsystem: webinar-commands
tags: [agent-metadata, webinar, cli]
dependency_graph:
  requires: [08-09]
  provides: [agentMetadata-webinar-complete]
  affects: [agent-skill-package]
tech_stack:
  added: []
  patterns: [agentMetadata-static-property]
key_files:
  created: []
  modified:
    - packages/twentythree-cli/src/commands/webinar/list.ts
    - packages/twentythree-cli/src/commands/webinar/create.ts
    - packages/twentythree-cli/src/commands/webinar/update.ts
    - packages/twentythree-cli/src/commands/webinar/delete.ts
    - packages/twentythree-cli/src/commands/webinar/upload-image.ts
    - packages/twentythree-cli/src/commands/webinar/metrics.ts
    - packages/twentythree-cli/src/commands/webinar/clips.ts
    - packages/twentythree-cli/src/commands/webinar/highlights.ts
    - packages/twentythree-cli/src/commands/webinar/list-formats.ts
    - packages/twentythree-cli/src/commands/webinar/log.ts
    - packages/twentythree-cli/src/commands/webinar/repeat.ts
    - packages/twentythree-cli/src/commands/webinar/attachment/list.ts
    - packages/twentythree-cli/src/commands/webinar/attachment/upload.ts
    - packages/twentythree-cli/src/commands/webinar/attachment/delete.ts
    - packages/twentythree-cli/src/commands/webinar/attachment/set-hidden.ts
    - packages/twentythree-cli/src/commands/webinar/section/list.ts
    - packages/twentythree-cli/src/commands/webinar/section/add.ts
    - packages/twentythree-cli/src/commands/webinar/section/update.ts
    - packages/twentythree-cli/src/commands/webinar/section/remove.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/list.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/add.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/add-from-user.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/add-from-speaker.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/update.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/remove.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/set-avatar.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/remove-avatar.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/set-order.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/send-invitation.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/request-guest.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/cancel-guest-request.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/connection-types.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/library.ts
    - packages/twentythree-cli/src/commands/webinar/mail/list.ts
    - packages/twentythree-cli/src/commands/webinar/mail/add.ts
    - packages/twentythree-cli/src/commands/webinar/mail/update.ts
    - packages/twentythree-cli/src/commands/webinar/mail/remove.ts
    - packages/twentythree-cli/src/commands/webinar/mail/preview.ts
    - packages/twentythree-cli/src/commands/webinar/mail/send.ts
    - packages/twentythree-cli/src/commands/webinar/mail/test.ts
    - packages/twentythree-cli/src/commands/webinar/recording/start.ts
    - packages/twentythree-cli/src/commands/webinar/recording/stop.ts
    - packages/twentythree-cli/src/commands/webinar/recording/status.ts
    - packages/twentythree-cli/src/commands/webinar/recording/split.ts
    - packages/twentythree-cli/src/commands/webinar/room/info.ts
    - packages/twentythree-cli/src/commands/webinar/room/themes.ts
    - packages/twentythree-cli/src/commands/webinar/room/send-recording.ts
    - packages/twentythree-cli/src/commands/webinar/room/connect.ts
    - packages/twentythree-cli/src/commands/webinar/transcription/list.ts
    - packages/twentythree-cli/src/commands/webinar/transcription/connect.ts
    - packages/twentythree-cli/src/commands/webinar/transcription/locales.ts
    - packages/twentythree-cli/src/commands/webinar/transcription/transcriptionlist.ts
    - packages/twentythree-cli/src/commands/webinar/queued-video/add.ts
    - packages/twentythree-cli/src/commands/webinar/queued-video/remove.ts
    - packages/twentythree-cli/src/commands/webinar/series/list.ts
    - packages/twentythree-cli/src/commands/webinar/series/create.ts
    - packages/twentythree-cli/src/commands/webinar/series/update.ts
    - packages/twentythree-cli/src/commands/webinar/series/delete.ts
    - packages/twentythree-cli/src/commands/webinar/series/metrics.ts
    - packages/twentythree-cli/src/commands/webinar/series/recurrences.ts
    - packages/twentythree-cli/src/commands/webinar/series/apply-recurrence.ts
    - packages/twentythree-cli/src/commands/webinar/series/skip-recurrence.ts
    - packages/twentythree-cli/src/commands/webinar/series/cancel.ts
    - packages/twentythree-cli/src/commands/webinar/series/set-ondemand.ts
    - packages/twentythree-cli/src/commands/webinar/series/mapped-objects.ts
    - packages/twentythree-cli/src/commands/webinar/series/upload-thumbnail.ts
decisions:
  - "agentMetadata placed after static args block and before public async run() in every command class"
  - "apply-recurrence and skip-recurrence use GET method with auth_scope write — they mutate state despite GET"
  - "room sub-commands use /live/webinar/ API prefix, not /live/room/"
  - "transcription/transcriptionlist.ts maps to /live/transcriptionlist (workspace-scoped, not webinar-scoped)"
  - "queued-video endpoints map to /live/queuedvideos/ (plural, no hyphen in API path)"
metrics:
  duration: "~4 minutes"
  completed: "2026-04-16T09:51:53Z"
  tasks_completed: 2
  files_modified: 66
---

# Phase 08 Plan 10: Add agentMetadata to All Webinar Commands Summary

Backfilled `static agentMetadata` to all 66 webinar command files, completing AI agent discoverability across the entire webinar surface — covering core, attachment, section, speaker, mail, recording, room, transcription, queued-video, and series sub-commands.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Webinar core, attachment, section, speaker (33 files) | d161352 | 33 modified |
| 2 | Webinar mail, recording, room, transcription, queued-video, series (33 files) | 9388b1e | 33 modified |

## What Was Built

Every webinar command class now exposes a `static agentMetadata` block with four fields:

- `api_endpoint` — HTTP method + path (e.g. `GET /live/series/list`)
- `auth_scope` — `'read'` for GETs, `'write'` for mutating POSTs
- `output_shape` — `table` with column names, `key-value`, or `none`
- `side_effects` — `'none'`, `'creates'`, `'updates'`, or `'destructive'`

This metadata is consumed by the `--agent` flag and the installable AI agent skills package, enabling LLM agents to discover endpoint contracts without reading source code.

## Decisions Made

1. **Placement convention** — `static agentMetadata` inserted after `static args` and before `public async run()`, consistent with Pattern J in `08-PATTERNS.md`.

2. **apply-recurrence / skip-recurrence are GET but mutate state** — `auth_scope: 'write'` used despite GET method, because these endpoints trigger side effects. `side_effects: 'updates'` is accurate.

3. **Room sub-commands use `/live/webinar/` prefix** — `room/info.ts` → `GET /live/webinar/info`, `room/themes.ts` → `GET /live/webinar/room-themes`, etc. The CLI topic name `room` does not match the API path segment `webinar`.

4. **Workspace-scoped transcription list** — `transcription/transcriptionlist.ts` maps to `GET /live/transcriptionlist` (no slash between `transcription` and `list`), distinct from the webinar-scoped `GET /live/transcription/list`.

5. **Queued-video API path** — endpoints are `/live/queuedvideos/add` and `/live/queuedvideos/remove` (plural `queuedvideos`, no hyphen), not `/live/queued-video/`.

## Deviations from Plan

None — plan executed exactly as written. All 66 files received agentMetadata with correct endpoint paths, auth scopes, output shapes, and side effect classifications.

## Verification

```
Test Files  15 passed | 24 skipped (39)
      Tests  146 passed | 69 todo (215)
```

All tests pass. No regressions introduced.

## Known Stubs

None.

## Threat Flags

None — this plan adds read-only metadata to command class statics. No new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check: PASSED

- Task 1 commit d161352: present
- Task 2 commit 9388b1e: present
- 66 command files modified: verified via git log
- Tests: 146 passed, 0 failures
