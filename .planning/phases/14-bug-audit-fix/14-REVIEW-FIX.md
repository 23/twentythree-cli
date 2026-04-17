---
phase: 14-bug-audit-fix
fixed_at: 2026-04-17T09:35:38Z
review_path: .planning/phases/14-bug-audit-fix/14-REVIEW.md
iteration: 1
findings_in_scope: 11
fixed: 11
skipped: 0
status: all_fixed
---

# Phase 14: Code Review Fix Report

**Fixed at:** 2026-04-17T09:35:38Z
**Source review:** .planning/phases/14-bug-audit-fix/14-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 11 (1 critical, 6 warnings, 4 info)
- Fixed: 11
- Skipped: 0

## Fixed Issues

### CR-01: Unvalidated server error body echoed to user in webinar mail preview

**Files modified:** `packages/twentythree-cli/src/commands/webinar/mail/preview.ts`
**Commit:** 0c6fe19
**Applied fix:** Renamed `html` variable to `body` at read time, added try/catch JSON parse to extract a short `message` or `error` field, truncates raw body to 200 chars as fallback, then re-assigns `const html = body` for the success path. Raw server payloads are no longer passed directly to `this.error()`.

---

### WR-01: chunked-upload chunk count formula comment was inaccurate

**Files modified:** `packages/twentythree-cli/src/upload/chunked-upload.ts`
**Commit:** ecd9b7e
**Applied fix:** Replaced the misleading comment ("last chunk absorbs the remainder and is always >= chunkSize") with an accurate description: `Math.floor` produces `floor(fileSize / chunkSize)` chunks, the last chunk covers `[start, totalSize)` which equals `chunkSize` when the file divides evenly or is smaller when there is a remainder, and `Math.max(1, ...)` handles single-chunk files.

---

### WR-02: video/update uses String(updateError) instead of formatApiError

**Files modified:** `packages/twentythree-cli/src/commands/video/update.ts`
**Commit:** 8be4481
**Applied fix:** Changed `String(updateError)` to `formatApiError(updateError)` on the POST `/photo/update` error path. The `formatApiError` import was already present — no import change needed.

---

### WR-03: video/replace tokenError uses String() instead of formatApiError

**Files modified:** `packages/twentythree-cli/src/commands/video/replace.ts`
**Commit:** cd7e3c6
**Applied fix:** Added `formatApiError` to the import from `../../lib/output.js`, then changed `String(tokenError)` to `formatApiError(tokenError)` on the token fetch error path.

---

### WR-04: auth/credentials — workspaces variable used after potentially-failed try/catch

**Files modified:** `packages/twentythree-cli/src/commands/auth/credentials.ts`
**Commit:** 37306e1
**Applied fix:** Changed `let workspaces: WorkspaceEntry[]` to `let workspaces: WorkspaceEntry[] = []` so it is always initialized. Added `return` after `this.error()` in the catch block to make control flow explicit for static analysis.

---

### WR-05: video/list --limit flag declared but never enforced

**Files modified:** `packages/twentythree-cli/src/commands/video/list.ts`
**Commit:** d7c060e
**Applied fix:** Renamed the `fetchAllPages` result to `allVideos`, then derived `const videos = flags.limit !== undefined ? allVideos.slice(0, flags.limit) : allVideos` immediately after. All downstream references now correctly reflect the limit when provided.

---

### WR-06: base-command.ts double-parse of flags in init() and run() undocumented

**Files modified:** `packages/twentythree-cli/src/lib/base-command.ts`
**Commit:** 0ad5188
**Applied fix:** Added a detailed explanatory comment above the `this.parse()` call in `init()` documenting that the double-parse is intentional, why it is currently safe (no flags have parse-time side effects), and what to do if a flag ever gains a dynamic default or parse hook.

---

### IN-01: video/update — interactive mode sends description even when user leaves it blank

**Files modified:** `packages/twentythree-cli/src/commands/video/update.ts`
**Commit:** 179f68d
**Applied fix:** Interactive mode no longer unconditionally assigns all body fields. Title, description, and tags are only included if the user entered a non-empty string (or if the existing value was already empty, in which case an explicit blank is valid). This aligns interactive mode behaviour with flag mode, which only sends fields that were explicitly provided.

---

### IN-02: webinar/mail/preview — contextField non-null assertion redundant after explicit null check

**Files modified:** `packages/twentythree-cli/src/commands/webinar/mail/preview.ts`
**Commit:** 9c79cbf
**Applied fix:** Added `return` after `this.error()` in the `if (!contextField)` guard so TypeScript narrows the type to non-null for subsequent code. Removed the `!` non-null assertion from `contextField!` on the `Object.entries()` call — `contextField` is now correctly typed as non-null at that point without the assertion operator.

---

### IN-03: video/replace — result variable uses non-null assertion without documented reason

**Files modified:** `packages/twentythree-cli/src/commands/video/replace.ts`
**Commit:** 0982a10
**Applied fix:** Changed `result` declaration to include `| undefined`. Added an explicit `if (!result) return` guard after the `try/finally` block with a comment explaining it should never fire (since `uploadChunked` throws on failure, propagating through `finally`). Replaced `result!` in `formatJsonOutput` with plain `result`.

---

### IN-04: Unused dependency cli-progress in package.json

**Files modified:** `packages/twentythree-cli/package.json`
**Commit:** 084ae66
**Applied fix:** Removed `cli-progress` from `dependencies` and `@types/cli-progress` from `devDependencies`. Confirmed via grep that `cli-progress` is only referenced in comments and one test assertion string — it is never imported in any source file.

---

_Fixed: 2026-04-17T09:35:38Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
