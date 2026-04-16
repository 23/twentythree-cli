---
phase: 08-platform-polish
plan: "04"
subsystem: user-commands
tags: [user, admin, multipart, best-effort, tokens]
dependency_graph:
  requires: []
  provides: [user/list, user/get, user/create, user/update, user/send-invitation, user/get-login-token, user/redeem-login-token, user/tokens]
  affects: []
tech_stack:
  added: []
  patterns: [multipart-formdata, best-effort-fetch, secure-token-summary]
key_files:
  created:
    - packages/twentythree-cli/src/commands/user/list.ts
    - packages/twentythree-cli/src/commands/user/get.ts
    - packages/twentythree-cli/src/commands/user/create.ts
    - packages/twentythree-cli/src/commands/user/update.ts
    - packages/twentythree-cli/src/commands/user/send-invitation.ts
    - packages/twentythree-cli/src/commands/user/get-login-token.ts
    - packages/twentythree-cli/src/commands/user/redeem-login-token.ts
    - packages/twentythree-cli/src/commands/user/tokens.ts
  modified: []
decisions:
  - "user/update uses multipart/form-data with bodySerializer for profile_image; falls back to form-urlencoded when no image provided (Pitfall 7)"
  - "user/get include_invitation_p passes boolean (not 1/0) to match OpenAPI types — types.ts is authoritative"
  - "user/tokens uses raw fetch (not apiClient) since /user/tokens is absent from OpenAPI spec"
  - "user/get-login-token summary string never contains actual token value (T-08-10 information disclosure mitigation)"
metrics:
  duration: "3min"
  completed_date: "2026-04-16"
  tasks_completed: 2
  files_created: 8
---

# Phase 08 Plan 04: User Commands Summary

**One-liner:** All 8 user admin commands implemented with multipart profile upload, secure token handling, and best-effort /user/tokens fallback.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | User list, get, create, update | d08abe4 | list.ts, get.ts, create.ts, update.ts |
| 2 | User send-invitation, get-login-token, redeem-login-token, tokens | 39e4658 | send-invitation.ts, get-login-token.ts, redeem-login-token.ts, tokens.ts |

## What Was Built

8 user management commands covering the full user administration surface:

- **user/list** (USR-01): Table output with ID, Username, Display Name, URL columns; `resolveUrl` for relative URLs
- **user/get** (USR-02): Key-value output; `parseBoolParam` for `include-invitation` flag
- **user/create** (USR-03): POST form-urlencoded; `parseBoolParam` for `site-admin` flag
- **user/update** (USR-04): Multipart FormData when `--profile-image` provided; form-urlencoded otherwise (Pitfall 7)
- **user/send-invitation** (USR-05): POST form-urlencoded with optional custom message
- **user/get-login-token** (USR-06): Token in data field only; summary is safe for logs (T-08-10)
- **user/redeem-login-token** (USR-07): GET with required `--login-token` flag
- **user/tokens** (USR-08): Raw fetch to /user/tokens (absent from OpenAPI spec); table or key-value output based on response shape

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed include_invitation_p type mismatch in user/get.ts**
- **Found during:** Post-task TypeScript verification
- **Issue:** Plan spec said pass `inclVal ? 1 : 0` (number) but OpenAPI types define `include_invitation_p` as `boolean | undefined`
- **Fix:** Passed `inclVal` directly (already `boolean | undefined` from `parseBoolParam`)
- **Files modified:** packages/twentythree-cli/src/commands/user/get.ts
- **Commit:** 39e4658

## Threat Model Coverage

| Threat ID | Mitigation Applied |
|-----------|--------------------|
| T-08-10 | get-login-token summary string never contains token value; token accessible only in data field |
| T-08-11 | All commands extend AuthenticatedCommand — bearer token enforced |
| T-08-12 | user/update validates profile_image path with `fs.existsSync` before reading |
| T-08-13 | user/tokens prints tokens intentionally — accepted risk; user controls terminal |

## Self-Check

All 8 files created and verified to exist.
TypeScript compilation: clean (no user/ errors).
Test suite: 146 passed, 0 failed.
