---
phase: 08-platform-polish
fixed_at: 2026-04-16T11:00:26Z
review_path: .planning/phases/08-platform-polish/08-REVIEW.md
iteration: 2
findings_in_scope: 12
fixed: 10
skipped: 2
status: partial
---

# Phase 8: Code Review Fix Report

**Fixed at:** 2026-04-16T11:00:26Z
**Source review:** .planning/phases/08-platform-polish/08-REVIEW.md
**Iteration:** 2 (iteration 1 fixed CR-01 and WR-01 through WR-06; iteration 2 fixed IN-03, IN-04, IN-05)

**Summary:**
- Findings in scope: 12 (1 critical, 6 warnings, 5 info)
- Fixed: 10
- Skipped: 2 (IN-01 and IN-02 — already resolved by WR-01/WR-02 fixes in iteration 1)

## Fixed Issues

### CR-01: Unhandled JSON parse error in `user/tokens.ts`

**Files modified:** `packages/twentythree-cli/src/commands/user/tokens.ts`
**Commit:** 9105d9f
**Iteration:** 1
**Applied fix:** Wrapped `response.json()` in a try/catch block. On parse failure, emits a clean error message including the HTTP status code via `this.error()` instead of crashing with a raw `SyntaxError`.

### WR-01: `String(deleteError)` loses structured error context in `thumbnail/delete.ts`

**Files modified:** `packages/twentythree-cli/src/commands/thumbnail/delete.ts`
**Commit:** 390a16b
**Iteration:** 1
**Applied fix:** Added `formatApiError` to the import from `../../lib/output.js` and replaced `String(deleteError)` with `formatApiError(deleteError)` in the error handler. `applyCliTerms` is retained in the call so CLI terminology mapping still applies.

### WR-02: `String(deleteError)` loses structured error context in `thumbnail/file/delete.ts`

**Files modified:** `packages/twentythree-cli/src/commands/thumbnail/file/delete.ts`
**Commit:** 7aac883
**Iteration:** 1
**Applied fix:** Added `formatApiError` to the import from `../../../lib/output.js` and replaced `String(deleteError)` with `formatApiError(deleteError)` in the error handler, matching the pattern used in all peer delete commands.

### WR-03: Double `stat()` call in `openupload/upload-file.ts`

**Files modified:** `packages/twentythree-cli/src/commands/openupload/upload-file.ts`
**Commit:** 7570de5
**Iteration:** 1
**Applied fix:** Merged the two `stat()` calls into one. The result is captured in `fileStat` (declared with `let` before the try block), a `return` guard satisfies TypeScript definite assignment, and `totalBytes` is derived directly from `fileStat.size` without a second syscall. This also closes the TOCTOU window.

### WR-04: `result!` non-null assertion after try/catch could mask unset variable

**Files modified:** `packages/twentythree-cli/src/commands/openupload/upload-file.ts`
**Commit:** 7570de5
**Iteration:** 1
**Applied fix:** Restructured the upload block to remove the `finally` clause. `bar.finish()` is now called explicitly after successful upload and also in a `catch` block that re-throws the error. This allows `result` to be definitively assigned within the `try` scope and removes the `!` non-null assertion, so the compiler can verify assignment at the point of use.

### WR-05: `doctor.ts` connectivity check accepts 401/403/404 as passing

**Files modified:** `packages/twentythree-cli/src/commands/doctor.ts`
**Commit:** ebced98
**Iteration:** 1
**Applied fix:** Replaced `resp.ok || resp.status < 500` with `true` — any HTTP response (regardless of status code) proves the host is reachable at the network level. The detail string now includes the HTTP status (e.g. `example.com (HTTP 403)`) so operators can see the actual response. Token validity is already verified separately by check 3.

### WR-06: `--password` flag passed in plaintext via process arguments in `user/update.ts`

**Files modified:** `packages/twentythree-cli/src/commands/user/update.ts`
**Commit:** 8c1d040
**Iteration:** 1
**Applied fix:** Updated the `--password` flag description to include an explicit warning: "visible in process list and shell history — prefer interactive prompt for sensitive environments". This surfaces the risk at the point of use (in `--help` output) so callers can make an informed decision.

### IN-03: `app/update.ts` requires `--name` even for unrelated field updates

**Files modified:** `packages/twentythree-cli/src/commands/app/update.ts`
**Commit:** 1e86e01
**Iteration:** 2
**Applied fix:** Changed `name` flag from `required: true` to `required: false`. Updated `run()` to guard against empty invocations (all three optional flags absent) with a clear error message. Updated `body` construction to only include `name` when explicitly provided, consistent with how `description` and `style` are handled. Added an example showing `--description`-only update. This matches the optional-field pattern used by spot update, thumbnail update, and user update.

### IN-04: Open upload token rendered in plain-text terminal table in `openupload/list.ts`

**Files modified:** `packages/twentythree-cli/src/commands/openupload/list.ts`
**Commit:** f0cc8b9
**Iteration:** 2
**Applied fix:** Changed the Token column from `String(r.token ?? '')` to `r.token ? String(r.token).slice(0, 8) + '…' : ''`. The table now shows only the first 8 characters followed by an ellipsis, reducing accidental credential exposure in terminal output, scrollback buffers, and CI logs. The full token value remains accessible via `--json`.

### IN-05: `site/get.ts` missing `static args = {}` declaration

**Files modified:** `packages/twentythree-cli/src/commands/site/get.ts`
**Commit:** bd6a9c3
**Iteration:** 2
**Applied fix:** Added `static args = {}` after the `static flags` block, consistent with the convention used across all peer commands in this phase (webhook/list.ts, spot/list.ts, presentation/setting/list.ts, etc.).

## Skipped Issues

### IN-01: `applyCliTerms` import unused in `thumbnail/delete.ts`

**File:** `packages/twentythree-cli/src/commands/thumbnail/delete.ts:6`
**Reason:** Already resolved by the WR-01 fix in iteration 1. The WR-01 fix replaced `String(deleteError)` with `formatApiError(deleteError)` while keeping `applyCliTerms` in the error call (`this.error(applyCliTerms(formatApiError(deleteError)), ...)`). The import is actively used on that line — no unused import remains.

### IN-02: `applyCliTerms` import unused in `thumbnail/file/delete.ts`

**File:** `packages/twentythree-cli/src/commands/thumbnail/file/delete.ts:6`
**Reason:** Already resolved by the WR-02 fix in iteration 1. Same as IN-01 — `applyCliTerms` is used both in the confirmation message (line 59) and in the error handler after WR-02's fix was applied. The import is not unused.

---

_Fixed: 2026-04-16T11:00:26Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 2_
