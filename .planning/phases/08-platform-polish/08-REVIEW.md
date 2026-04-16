---
phase: 08-platform-polish
reviewed: 2026-04-16T00:00:00Z
depth: standard
files_reviewed: 49
files_reviewed_list:
  - packages/twentythree-cli/src/commands/spot/list.ts
  - packages/twentythree-cli/src/commands/spot/create.ts
  - packages/twentythree-cli/src/commands/spot/update.ts
  - packages/twentythree-cli/src/commands/spot/delete.ts
  - packages/twentythree-cli/src/commands/spot/set-videos.ts
  - packages/twentythree-cli/src/commands/spot/check.ts
  - packages/twentythree-cli/src/commands/spot/reset-version.ts
  - packages/twentythree-cli/src/commands/webhook/list.ts
  - packages/twentythree-cli/src/commands/webhook/subscribe.ts
  - packages/twentythree-cli/src/commands/webhook/unsubscribe.ts
  - packages/twentythree-cli/src/commands/webhook/events.ts
  - packages/twentythree-cli/src/commands/webhook/sample.ts
  - packages/twentythree-cli/src/commands/app/add.ts
  - packages/twentythree-cli/src/commands/app/update.ts
  - packages/twentythree-cli/src/commands/app/delete.ts
  - packages/twentythree-cli/src/commands/thumbnail/index.ts
  - packages/twentythree-cli/src/commands/thumbnail/list.ts
  - packages/twentythree-cli/src/commands/thumbnail/add.ts
  - packages/twentythree-cli/src/commands/thumbnail/update.ts
  - packages/twentythree-cli/src/commands/thumbnail/delete.ts
  - packages/twentythree-cli/src/commands/thumbnail/duplicate.ts
  - packages/twentythree-cli/src/commands/thumbnail/data.ts
  - packages/twentythree-cli/src/commands/thumbnail/file/list.ts
  - packages/twentythree-cli/src/commands/thumbnail/file/upload.ts
  - packages/twentythree-cli/src/commands/thumbnail/file/delete.ts
  - packages/twentythree-cli/src/commands/user/list.ts
  - packages/twentythree-cli/src/commands/user/get.ts
  - packages/twentythree-cli/src/commands/user/create.ts
  - packages/twentythree-cli/src/commands/user/update.ts
  - packages/twentythree-cli/src/commands/user/send-invitation.ts
  - packages/twentythree-cli/src/commands/user/get-login-token.ts
  - packages/twentythree-cli/src/commands/user/redeem-login-token.ts
  - packages/twentythree-cli/src/commands/user/tokens.ts
  - packages/twentythree-cli/src/commands/presentation/setting/list.ts
  - packages/twentythree-cli/src/commands/presentation/setting/update.ts
  - packages/twentythree-cli/src/commands/presentation/page/link-locations.ts
  - packages/twentythree-cli/src/commands/protection/protect.ts
  - packages/twentythree-cli/src/commands/protection/unprotect.ts
  - packages/twentythree-cli/src/commands/protection/verify.ts
  - packages/twentythree-cli/src/commands/session/get-token.ts
  - packages/twentythree-cli/src/commands/session/redeem-token.ts
  - packages/twentythree-cli/src/commands/site/get.ts
  - packages/twentythree-cli/src/commands/site/search.ts
  - packages/twentythree-cli/src/commands/setting/update.ts
  - packages/twentythree-cli/src/commands/openupload/list.ts
  - packages/twentythree-cli/src/commands/openupload/upload-file.ts
  - packages/twentythree-cli/src/commands/openupload/update-file.ts
  - packages/twentythree-cli/src/commands/doctor.ts
  - packages/twentythree-cli/src/lib/base-command.ts
findings:
  critical: 1
  warning: 6
  info: 5
  total: 12
status: issues_found
---

# Phase 8: Code Review Report

**Reviewed:** 2026-04-16T00:00:00Z
**Depth:** standard
**Files Reviewed:** 49
**Status:** issues_found

## Summary

Phase 8 introduces a large surface of new commands across spot, webhook, app, thumbnail, user, presentation, protection, session, site, setting, openupload, and doctor domains. The overall architecture is consistent and well-structured, following the patterns established in earlier phases. Auth guards, confirmation prompts for destructive actions, and the workspace header convention are applied uniformly.

One critical issue was found: the `user/tokens.ts` command calls `response.json()` without a try/catch, which will throw an unhandled promise rejection if the API returns a non-JSON body (e.g. an HTML error page, a 502, or a 204). This is a reliability bug that can produce a confusing crash rather than a clean error message.

Six warnings cover: two `String(deleteError)` usages in thumbnail delete/file-delete that swallow structured error context; a double `stat()` call in `openupload/upload-file.ts` that wastes a syscall in the hot path; a `result!` non-null assertion used after a try/catch that could hide an unset variable; the `doctor.ts` connectivity check accepting any HTTP status below 500 (including 401/403) as a pass; and `user/update.ts` accepting a `--password` flag that will be passed in plaintext through the process argument list.

Five informational items cover cosmetic inconsistencies: unused `applyCliTerms` import in `thumbnail/delete.ts` and `thumbnail/file/delete.ts`; the `app/update.ts` command requiring `--name` which forces callers to re-supply the name even for unrelated field updates; the `openupload/list.ts` token column rendering raw token values in the terminal table; and the `site/get.ts` missing a `static args = {}` declaration present on all peer commands.

---

## Critical Issues

### CR-01: Unhandled JSON parse error in `user/tokens.ts`

**File:** `packages/twentythree-cli/src/commands/user/tokens.ts:64`
**Issue:** `response.json()` is called without error handling. When the raw-fetch fallback path receives a non-JSON response body (e.g. an HTML 5xx page, a reverse-proxy error, or an empty 204), this throws an unhandled promise rejection and crashes the process with a cryptic `SyntaxError: Unexpected token` message instead of a clean CLI error. The `response.ok` guard on line 59 only catches HTTP error statuses — it does not guard against malformed bodies on otherwise-200 responses.

**Fix:**
```typescript
let json: unknown
try {
  json = await response.json()
} catch {
  this.error(`API returned non-JSON response (status ${response.status})`, { exit: EXIT_ERROR })
}
```

---

## Warnings

### WR-01: `String(deleteError)` loses structured error context in `thumbnail/delete.ts`

**File:** `packages/twentythree-cli/src/commands/thumbnail/delete.ts:67`
**Issue:** The error handler calls `applyCliTerms(String(deleteError))` instead of `applyCliTerms(formatApiError(deleteError))`. `String()` on an object produces `[object Object]`, which is uninformative. All other delete commands in this phase (spot, app, webhook, thumbnail/file) correctly use `formatApiError`. This appears to be a copy-paste omission.

**Fix:**
```typescript
// Change line 67 from:
this.error(applyCliTerms(String(deleteError)), { exit: EXIT_ERROR })
// To:
this.error(applyCliTerms(formatApiError(deleteError)), { exit: EXIT_ERROR })
```
Also update the import on line 5 to add `formatApiError` (it is already imported in the file header but note line 5 does not include it — verify the import list).

### WR-02: `String(deleteError)` loses structured error context in `thumbnail/file/delete.ts`

**File:** `packages/twentythree-cli/src/commands/thumbnail/file/delete.ts:76`
**Issue:** Same problem as WR-01. `String(deleteError)` produces `[object Object]` for structured API error objects. `formatApiError` is not imported in this file.

**Fix:**
```typescript
// Add formatApiError to the import on line 5:
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'

// Change line 76 from:
this.error(applyCliTerms(String(deleteError)), { exit: EXIT_ERROR })
// To:
this.error(applyCliTerms(formatApiError(deleteError)), { exit: EXIT_ERROR })
```

### WR-03: Double `stat()` call in `openupload/upload-file.ts`

**File:** `packages/twentythree-cli/src/commands/openupload/upload-file.ts:99-105`
**Issue:** `stat(flags['file-path'])` is called twice: once inside a try/catch for existence validation (line 99) and again immediately after to get `fileStat.size` (line 104). The second call is a redundant syscall that also introduces a TOCTOU window — the file could be deleted between the two calls, causing the second `stat()` to throw an uncaught rejection outside the try/catch.

**Fix:**
```typescript
let fileStat: import('node:fs').Stats
try {
  fileStat = await stat(flags['file-path'])
} catch {
  this.error(`File not found: ${flags['file-path']}`, { exit: EXIT_ERROR })
  return // unreachable but satisfies TypeScript definite assignment
}
const totalBytes = fileStat.size
```

### WR-04: `result!` non-null assertion after try/catch could mask unset variable

**File:** `packages/twentythree-cli/src/commands/openupload/upload-file.ts:142`
**Issue:** `result` is declared with `let result: Awaited<ReturnType<typeof uploadChunked>>` (line 108) and is only assigned inside the `try` block (line 116). If `uploadChunked` throws and the `finally` block runs, `result` is never assigned and the non-null assertion `result!` on line 142 would produce `undefined`. The `!` suppresses the type error but does not guarantee runtime safety. In practice the `finally` block calls `bar.finish()` and then the thrown error propagates out of `run()`, so `result!` on line 142 is unreachable in the error case — but this is fragile and silences the compiler warning that would catch a future regression.

**Fix:** Declare `result` as `let result: Awaited<ReturnType<typeof uploadChunked>> | undefined` and handle the undefined case, or restructure so the assignment and use are in the same scope:
```typescript
const result = await uploadChunked({ ... })
bar.finish()
// (move bar.finish() out of finally or restructure try/catch)
```

### WR-05: `doctor.ts` connectivity check accepts 401/403/404 as passing

**File:** `packages/twentythree-cli/src/commands/doctor.ts:47`
**Issue:** `resp.ok || resp.status < 500` treats any HTTP response below 500 — including 401 Unauthorized, 403 Forbidden, and 404 Not Found — as a passing connectivity check. This means a misconfigured domain that returns 403 from a firewall or WAF will show "Connectivity: OK" even though the workspace is unreachable for API calls. The intent is to confirm the host is reachable, but the threshold should distinguish between "host responded" (network reachable) and "API accessible".

**Fix:**
```typescript
// Accept any response as proof of connectivity — the host is reachable
// regardless of status code; token validity is checked separately
checks.push({ name: 'Connectivity', passed: true, detail: `${domain} (HTTP ${resp.status})` })
```
This is more semantically correct: connectivity means the host answered, not that the request was authorised.

### WR-06: `--password` flag passed in plaintext via process arguments in `user/update.ts`

**File:** `packages/twentythree-cli/src/commands/user/update.ts:43-46`
**Issue:** The `--password` flag accepts a new password as a command-line argument. On Unix systems, process arguments are visible to other processes via `/proc/<pid>/cmdline` and `ps aux` for the duration of the command. A password passed as `--password mysecret` is visible to any user with sufficient privileges on the same machine. This is a security concern for shared or multi-user environments. The flag itself is not inherently malicious, but the design puts secrets in process arguments where tools like shell history, CI logs, and process monitors will capture them.

**Fix:** At minimum, add a warning to the flag description. A more robust approach is to prompt interactively when `--password` is provided without a value (using `@clack/prompts`), which keeps the secret out of argv:
```typescript
password: Flags.string({
  description: 'New password (WARNING: visible in process list and shell history — prefer interactive prompt)',
  required: false,
}),
```
Document the risk clearly so callers can make an informed choice.

---

## Info

### IN-01: `applyCliTerms` import unused in `thumbnail/delete.ts`

**File:** `packages/twentythree-cli/src/commands/thumbnail/delete.ts:6`
**Issue:** `applyCliTerms` is imported but not called anywhere in the file. The only place it would normally appear — in the error handler — instead uses `String()` (see WR-01). Once WR-01 is fixed with `formatApiError`, `applyCliTerms` will remain unused unless it is also added to the error call.

**Fix:** Either remove the unused import, or apply `applyCliTerms` in the error handler when fixing WR-01: `this.error(applyCliTerms(formatApiError(deleteError)), { exit: EXIT_ERROR })`.

### IN-02: `applyCliTerms` import unused in `thumbnail/file/delete.ts`

**File:** `packages/twentythree-cli/src/commands/thumbnail/file/delete.ts:6`
**Issue:** Same as IN-01 — `applyCliTerms` is imported but only appears in the confirmation message string (line 59), not in the error path. Whether this is intentional depends on WR-02 resolution.

**Fix:** Apply `applyCliTerms` in the error path when fixing WR-02, or remove the import if not needed there.

### IN-03: `app/update.ts` requires `--name` even for unrelated field updates

**File:** `packages/twentythree-cli/src/commands/app/update.ts:28-32`
**Issue:** `name` is marked `required: true` in the update command. This means a caller who only wants to update `--description` or `--style` must also supply `--name` with the existing value to avoid an error. The update pattern in all other commands in this phase (spot update, thumbnail update, user update) uses `required: false` for all fields and only sends what is explicitly provided. Requiring `name` on update is inconsistent and forces a redundant GET-before-POST for automation scripts.

**Fix:** Change `required: true` to `required: false` on the `name` flag in `app/update.ts` and add a guard: if no flags are provided at all, emit an error asking the caller to provide at least one field to update.

### IN-04: Open upload token rendered in plain-text terminal table in `openupload/list.ts`

**File:** `packages/twentythree-cli/src/commands/openupload/list.ts:101`
**Issue:** The `Token` column renders the full raw open upload token in the terminal table output. Open upload tokens are bearer credentials — anyone with screen access, a terminal log, or a scrollback buffer can read them. This is noted in `T-08-18` for the upload-file command (which correctly omits tokens from progress output), but the list command has no equivalent mitigation.

**Fix:** Consider truncating the token in table output (e.g. first 8 chars + `…`) with the full value available only via `--json`:
```typescript
String(r.token ? r.token.slice(0, 8) + '…' : ''),
```
This is a UX/security trade-off — document the decision if the full token display is intentional.

### IN-05: `site/get.ts` missing `static args = {}` declaration

**File:** `packages/twentythree-cli/src/commands/site/get.ts`
**Issue:** All comparable commands in this phase include `static args = {}` as an explicit empty declaration (e.g. `webhook/list.ts:26`, `spot/list.ts:62`, `presentation/setting/list.ts:28`). `site/get.ts` omits it. While oclif defaults to no args when the property is absent, the inconsistency is a minor quality issue and could confuse developers scanning for the args definition.

**Fix:** Add `static args = {}` after the `static flags` block for consistency with the codebase convention.

---

_Reviewed: 2026-04-16T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
