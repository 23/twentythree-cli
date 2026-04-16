---
phase: 05-webinar-deep
plan: "02"
subsystem: webinar-speaker-mail
tags: [speaker, mail, chunked-upload, action-commands, interactive-fallback]
dependency_graph:
  requires:
    - 04-01: AuthenticatedCommand base, apiClient, chunked upload engine
    - 05-01: webinar attachment/section patterns established
  provides:
    - webinar speaker subcommands (14 total)
    - webinar mail subcommands (7 total)
  affects:
    - oclif command manifest (21 new commands registered)
tech_stack:
  added: []
  patterns:
    - action command pattern (green success line only, Decision D-1)
    - interactive fallback for required fields (Decision D-2)
    - process.stdout.write for raw HTML (Decision D-3)
    - fetchWebinarToken auto-lookup (Decision D-4)
    - chunked upload with tokenFieldName: 'live_speaker_id'
key_files:
  created:
    - packages/twentythree-cli/src/commands/webinar/speaker/list.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/add.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/add-from-user.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/add-from-speaker.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/library.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/connection-types.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/update.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/remove.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/set-avatar.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/remove-avatar.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/set-order.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/send-invitation.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/request-guest.ts
    - packages/twentythree-cli/src/commands/webinar/speaker/cancel-guest-request.ts
    - packages/twentythree-cli/src/commands/webinar/mail/list.ts
    - packages/twentythree-cli/src/commands/webinar/mail/add.ts
    - packages/twentythree-cli/src/commands/webinar/mail/update.ts
    - packages/twentythree-cli/src/commands/webinar/mail/remove.ts
    - packages/twentythree-cli/src/commands/webinar/mail/preview.ts
    - packages/twentythree-cli/src/commands/webinar/mail/send.ts
    - packages/twentythree-cli/src/commands/webinar/mail/test.ts
  modified: []
decisions:
  - "speaker/list auto-looks up webinar token via fetchWebinarToken — OpenAPI schema requires token param"
  - "speaker/connection-types requires live_id per API schema — description says workspace-scoped but schema requires webinar ID"
  - "speaker/set-avatar uses tokenFieldName 'live_speaker_id' (NOT 'live_id') — critical correctness requirement"
  - "mail/preview uses process.stdout.write() to avoid trailing newline from this.log() corrupting HTML pipe"
metrics:
  duration_minutes: 20
  completed_date: "2026-04-15"
  tasks_completed: 5
  tasks_total: 5
  files_created: 21
  files_modified: 0
---

# Phase 05 Plan 02: Webinar Speaker and Mail Commands Summary

21 commands for full speaker management and mail CRUD — speaker avatar chunked upload with `live_speaker_id` token field, interactive fallbacks for required fields, raw HTML preview via `process.stdout.write`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Speaker list, add, add-from-user, add-from-speaker, library, connection-types | a37fc7f | 6 files created |
| 2 | Speaker update, remove, set-avatar, remove-avatar, set-order | 98ec896 | 5 files created |
| 3 | Speaker action commands (send-invitation, request-guest, cancel-guest-request) | 6467ae8 | 3 files created |
| 4 | Mail list, add, update, remove | 2b8f71d | 4 files created |
| 5 | Mail preview, send, test | b10e77a | 3 files created |

## What Was Built

### Speaker Commands (14 total)

- **speaker/list** — lists speakers for a webinar; auto-looks up webinar token via `fetchWebinarToken` (OpenAPI schema requires `token` param)
- **speaker/add** — adds speaker with interactive fallback for `name` and `email`; prints speaker ID + admin URL on success
- **speaker/add-from-user** — adds a workspace user as speaker with interactive fallback for `--user-id`
- **speaker/add-from-speaker** — adds from library with interactive fallback for `--speaker-id`
- **speaker/library** — lists workspace speaker library; no args required beyond workspace context
- **speaker/connection-types** — lists available connection types; requires `live_id` (Webinar ID) per API schema
- **speaker/update** — updates speaker fields; uses `live_speaker_id` in body (NOT `live_id`)
- **speaker/remove** — removes speaker with domain confirmation prompt (T-05-08)
- **speaker/set-avatar** — chunked upload with `tokenFieldName: 'live_speaker_id'` (critical: NOT `live_id`); inline progress bar to stderr
- **speaker/remove-avatar** — action command, removes avatar
- **speaker/set-order** — sets speaker display order with interactive fallback for both `--speaker-id` and `--order`
- **speaker/send-invitation** — action command, sends invitation email
- **speaker/request-guest** — action command, sends guest request
- **speaker/cancel-guest-request** — action command, cancels pending guest request

### Mail Commands (7 total)

- **mail/list** — lists emails for a webinar; table shows ID, Subject, Status, Send Date
- **mail/add** — creates new email with interactive fallback for `subject` and `message`; prints mail ID on success
- **mail/update** — updates mail fields; uses `live_mail_id` (NOT `live_id`)
- **mail/remove** — removes mail with domain confirmation prompt (T-05-08)
- **mail/preview** — outputs raw HTML to stdout via `process.stdout.write()` (NOT `this.log()`) to avoid newline corruption when piping
- **mail/send** — action command, sends mail to recipients
- **mail/test** — action command, sends test email; interactive fallback for `--email`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] speaker/list requires token per OpenAPI schema**
- **Found during:** Task 1 verification (TypeScript compile error)
- **Issue:** Plan stated speaker/list does NOT require a token param — only `live_id`. OpenAPI schema (`liveSpeakerList` operation) requires `token: string` as a required query parameter.
- **Fix:** Added `--token` optional flag with auto-lookup via `fetchWebinarToken()` (Decision D-4 already establishes this pattern)
- **Files modified:** `packages/twentythree-cli/src/commands/webinar/speaker/list.ts`

**2. [Rule 1 - Bug] speaker/connection-types requires live_id per OpenAPI schema**
- **Found during:** Task 1 verification (TypeScript compile error)
- **Issue:** Plan described connection-types as workspace-scoped with no args. OpenAPI schema (`liveSpeakerConnectionTypes` operation) requires `live_id: number` as a required query parameter.
- **Fix:** Added `id` arg for Webinar ID, passed `live_id: Number(args.id)` in query
- **Files modified:** `packages/twentythree-cli/src/commands/webinar/speaker/connection-types.ts`

## Known Stubs

None — all commands wire to real API endpoints. No placeholder data.

## Threat Mitigations Applied

| Threat ID | Mitigation |
|-----------|------------|
| T-05-05 | speaker/set-avatar progress bar writes only byte counts to stderr, never the token value |
| T-05-06 | `tokenFieldName: 'live_speaker_id'` explicitly set in uploadChunked call |
| T-05-07 | `applyCliTerms(formatApiError(error))` applied on all error paths in all 21 commands |
| T-05-08 | Confirmation prompt with domain before speaker/remove and mail/remove |
| T-05-09 | Raw HTML output in mail/preview is intentional (Decision D-3); user controls piping destination |

## Self-Check: PASSED

- All 21 command files verified present on disk
- All 5 task commits verified in git log (a37fc7f, 98ec896, 6467ae8, 2b8f71d, b10e77a)
- TypeScript compile: 0 errors in speaker/ and mail/ directories
