---
phase: 05-webinar-deep
plan: "01"
subsystem: webinar-subresources
tags: [webinar, attachment, section, chunked-upload, cli]
dependency_graph:
  requires:
    - packages/twentythree-cli/src/lib/base-command.ts
    - packages/twentythree-cli/src/lib/output.ts
    - packages/twentythree-cli/src/upload/chunked-upload.ts
    - packages/twentythree-cli/src/upload/types.ts
  provides:
    - webinar attachment list
    - webinar attachment upload
    - webinar attachment delete
    - webinar attachment set-hidden
    - webinar section list
    - webinar section add
    - webinar section update
    - webinar section remove
  affects:
    - packages/twentythree-cli/src/commands/webinar/
tech_stack:
  added: []
  patterns:
    - fetchWebinarToken auto-lookup on list endpoints
    - chunked upload with tokenFieldName live_id
    - action command pattern (single green success line)
    - interactive fallback for required inputs via @clack/prompts
    - sparse body construction (only defined flags sent)
key_files:
  created:
    - packages/twentythree-cli/src/commands/webinar/attachment/list.ts
    - packages/twentythree-cli/src/commands/webinar/attachment/upload.ts
    - packages/twentythree-cli/src/commands/webinar/attachment/delete.ts
    - packages/twentythree-cli/src/commands/webinar/attachment/set-hidden.ts
    - packages/twentythree-cli/src/commands/webinar/section/list.ts
    - packages/twentythree-cli/src/commands/webinar/section/add.ts
    - packages/twentythree-cli/src/commands/webinar/section/update.ts
    - packages/twentythree-cli/src/commands/webinar/section/remove.ts
  modified: []
decisions:
  - "attachment/upload uses tokenFieldName: 'live_id' (T-05-02 mitigation)"
  - "section/update and section/remove use live_section_id not live_id (section-scoped operations)"
  - "attachment/delete identifies attachment by filename not an attachment ID"
  - "set-hidden and section/update follow sparse body pattern — only send defined flags"
metrics:
  duration: ~15min
  completed: "2026-04-15"
  tasks_completed: 3
  files_created: 8
---

# Phase 05 Plan 01: Webinar Attachment and Section Commands Summary

**One-liner:** 8 webinar subresource commands (4 attachment + 4 section) with chunked upload, token auto-lookup, and interactive fallbacks.

## What Was Built

### Attachment Commands (WEB-12)

| Command | File | Key Pattern |
|---------|------|-------------|
| `webinar attachment list` | attachment/list.ts | fetchWebinarToken auto-lookup, table output |
| `webinar attachment upload` | attachment/upload.ts | chunked engine, tokenFieldName: 'live_id', progress bar |
| `webinar attachment delete` | attachment/delete.ts | filename-based (not ID), confirmation prompt |
| `webinar attachment set-hidden` | attachment/set-hidden.ts | action command, hidden_p toggle |

### Section Commands (WEB-13)

| Command | File | Key Pattern |
|---------|------|-------------|
| `webinar section list` | section/list.ts | fetchWebinarToken auto-lookup, live_section_id in rows |
| `webinar section add` | section/add.ts | POST with live_id, interactive title fallback |
| `webinar section update` | section/update.ts | live_section_id (NOT live_id), sparse body |
| `webinar section remove` | section/remove.ts | live_section_id, confirmation prompt |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1    | 56a708b | feat(05-01): add webinar attachment list and upload commands |
| 2    | 1dfc5de | feat(05-01): add webinar attachment delete and set-hidden commands |
| 3    | 0bbf225 | feat(05-01): add webinar section list, add, update, remove commands |

## Threat Model Mitigations Applied

| Threat ID | Mitigation | File |
|-----------|-----------|------|
| T-05-01 | Progress bar shows only byte counts, never live_id token value | attachment/upload.ts |
| T-05-02 | tokenFieldName explicitly 'live_id' — never default 'upload_token' | attachment/upload.ts |
| T-05-03 | applyCliTerms() on all error messages in all 8 commands | all files |
| T-05-04 | Confirmation prompt includes domain and filename before delete | attachment/delete.ts |

## Decisions Made

1. **tokenFieldName: 'live_id'** — attachment upload explicitly sets tokenFieldName to 'live_id' (not the default 'upload_token') to match the webinar-scoped API convention established in Phase 4
2. **live_section_id vs live_id** — section update and remove use `live_section_id` (the section's own primary key); only section add uses `live_id` (the parent webinar's ID)
3. **Filename-based delete** — attachment delete identifies attachments by filename, not a numeric ID; this matches the API contract (`/live/attachment/delete` expects `filename` parameter)
4. **Sparse body on update** — section/update only sends flags that are explicitly provided, preventing unintentional field clearing (same pattern as webinar update from Phase 4)

## Deviations from Plan

None — plan executed exactly as written. All 8 commands implemented following the specified patterns and acceptance criteria.

## Known Stubs

None — all commands wire directly to API endpoints with no placeholder data.

## Self-Check: PASSED

Files created:
- FOUND: packages/twentythree-cli/src/commands/webinar/attachment/list.ts
- FOUND: packages/twentythree-cli/src/commands/webinar/attachment/upload.ts
- FOUND: packages/twentythree-cli/src/commands/webinar/attachment/delete.ts
- FOUND: packages/twentythree-cli/src/commands/webinar/attachment/set-hidden.ts
- FOUND: packages/twentythree-cli/src/commands/webinar/section/list.ts
- FOUND: packages/twentythree-cli/src/commands/webinar/section/add.ts
- FOUND: packages/twentythree-cli/src/commands/webinar/section/update.ts
- FOUND: packages/twentythree-cli/src/commands/webinar/section/remove.ts

Commits verified:
- 56a708b: feat(05-01): add webinar attachment list and upload commands
- 1dfc5de: feat(05-01): add webinar attachment delete and set-hidden commands
- 0bbf225: feat(05-01): add webinar section list, add, update, remove commands

TypeScript: All 8 new files compile without errors (no output from tsc --noEmit on webinar/attachment/* and webinar/section/*)
