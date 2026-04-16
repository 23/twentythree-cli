---
phase: 08-platform-polish
plan: "06"
subsystem: site-setting-openupload
tags: [site, setting, openupload, chunked-upload, commands]
dependency_graph:
  requires:
    - 08-01 (spot commands — Pattern A/D established)
    - 08-02 (thumbnail commands — Pattern E established)
    - 08-03 (webhook/app/presentation/protection commands)
    - 08-04 (session/user commands)
    - 08-05 (doctor/agent commands)
    - upload/chunked-upload.ts (chunked upload engine with tokenFieldName support)
  provides:
    - site/get.ts (GET /site/get, key-value output)
    - site/search.ts (GET /site/search, table output)
    - setting/update.ts (POST /setting/update, freeform key=value)
    - openupload/list.ts (GET /openupload/list, table output)
    - openupload/upload-file.ts (POST /openupload/upload-file, chunked engine)
    - openupload/update-file.ts (POST /openupload/update-file, form-urlencoded)
  affects: []
tech_stack:
  added: []
  patterns:
    - Pattern E (GET single object, key-value) for site/get
    - Pattern A (GET list, table) for site/search and openupload/list
    - Pattern D variant (POST freeform key-value) for setting/update
    - Pattern G (chunked upload) for openupload/upload-file with tokenFieldName: 'token'
    - Pattern D (POST update) for openupload/update-file
key_files:
  created:
    - packages/twentythree-cli/src/commands/site/get.ts
    - packages/twentythree-cli/src/commands/site/search.ts
    - packages/twentythree-cli/src/commands/setting/update.ts
    - packages/twentythree-cli/src/commands/openupload/list.ts
    - packages/twentythree-cli/src/commands/openupload/upload-file.ts
    - packages/twentythree-cli/src/commands/openupload/update-file.ts
  modified: []
decisions:
  - "site/get passes include_presentation_p and include_quota_p as boolean (not 1/0) — API types define them as boolean for GET query params"
  - "openupload/list passes token_upload_id as Number() cast — API types define it as number not string"
  - "openupload/list passes app_p as boolean directly — API types define it as boolean"
  - "openupload/upload-file uses tokenFieldName: 'token' (Pitfall 3) — open upload endpoint uses 'token' field not 'upload_token'"
metrics:
  duration: "3min"
  completed: "2026-04-16"
  tasks_completed: 2
  files_created: 6
  files_modified: 0
---

# Phase 08 Plan 06: Site, Setting, and Open Upload Commands Summary

Site and setting commands expose workspace-level configuration; open upload commands enable external upload tokens with chunked engine reuse (tokenFieldName: 'token' per Pitfall 3).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | site get, site search, setting update | 96c5495 | site/get.ts, site/search.ts, setting/update.ts |
| 2 | openupload list, upload-file, update-file | 5d4ced1 | openupload/list.ts, openupload/upload-file.ts, openupload/update-file.ts |

## Decisions Made

1. **site/get boolean params**: `include_presentation_p` and `include_quota_p` passed as `boolean` directly (not `1/0`) — the OpenAPI types define them as `boolean` for GET query params, unlike POST body params that use `1/0`.

2. **openupload/list type coercions**: `token_upload_id` coerced with `Number()` since the API types define it as `number`; `app_p` passed as `boolean` directly since API types define it as `boolean`.

3. **openupload/upload-file tokenFieldName**: `tokenFieldName: 'token'` is explicit and critical. The open upload endpoint uses `token` as the multipart field name, not the default `upload_token` used by the video upload endpoint. This is Pitfall 3 per the PATTERNS.md.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed type mismatch for site/get boolean params**
- **Found during:** Task 1 TypeScript check
- **Issue:** Plan specified `include_presentation_p: presVal ? 1 : 0` but API types define it as `boolean | undefined`, not `number | undefined`
- **Fix:** Pass `parseBoolParam` result directly as boolean — no `? 1 : 0` conversion
- **Files modified:** `packages/twentythree-cli/src/commands/site/get.ts`
- **Commit:** 96c5495 (included in task commit)

**2. [Rule 1 - Bug] Fixed type mismatches for openupload/list params**
- **Found during:** Task 2 TypeScript check
- **Issue:** `token_upload_id` is `number` in API types (not string); `app_p` is `boolean` (not `number`)
- **Fix:** Cast `token_upload_id` via `Number()` when defined; pass `app_p` as boolean directly
- **Files modified:** `packages/twentythree-cli/src/commands/openupload/list.ts`
- **Commit:** 5d4ced1 (included in task commit)

## Known Stubs

None — all commands wire to real API endpoints.

## Threat Flags

None — no new surface beyond what the plan's threat model covers.

## Self-Check: PASSED

Files verified:
- FOUND: packages/twentythree-cli/src/commands/site/get.ts
- FOUND: packages/twentythree-cli/src/commands/site/search.ts
- FOUND: packages/twentythree-cli/src/commands/setting/update.ts
- FOUND: packages/twentythree-cli/src/commands/openupload/list.ts
- FOUND: packages/twentythree-cli/src/commands/openupload/upload-file.ts
- FOUND: packages/twentythree-cli/src/commands/openupload/update-file.ts

Commits verified:
- FOUND: 96c5495 (Task 1)
- FOUND: 5d4ced1 (Task 2)

Test suite: 146 passed, 0 failed
TypeScript: Clean (no errors in new files)
