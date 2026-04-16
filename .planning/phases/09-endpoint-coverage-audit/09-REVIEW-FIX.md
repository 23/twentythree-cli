---
phase: 09-endpoint-coverage-audit
fixed_at: 2026-04-16T00:00:00Z
review_path: .planning/phases/09-endpoint-coverage-audit/09-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 9: Code Review Fix Report

**Fixed at:** 2026-04-16
**Source review:** .planning/phases/09-endpoint-coverage-audit/09-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 3
- Fixed: 3
- Skipped: 0

## Fixed Issues

### WR-01: Wrong HTTP method in `video frame` agentMetadata causes false audit phantom

**Files modified:** `packages/twentythree-cli/src/commands/video/frame.ts`
**Commit:** 85d7aad
**Applied fix:** Changed `api_endpoint` from `'GET /photo/frame'` to `'POST /photo/frame'` in the `agentMetadata` static property to match the actual `this.apiClient.POST('/photo/frame', ...)` call at line 48.

---

### WR-02: Two EXCLUDED_OPERATIONS entries are phantom commands, not excluded spec endpoints

**Files modified:** `packages/twentythree-cli/src/lib/audit.ts`, `packages/twentythree-cli/scripts/audit-endpoints.mjs`
**Commit:** a5dd8d2
**Applied fix:** Removed `POST /live/recording/split` and `GET /user/tokens` entries from `EXCLUDED_OPERATIONS` in `audit.ts` (where they were semantically incorrect — EXCLUDED_OPERATIONS is for spec endpoints intentionally not implemented, not for commands referencing undocumented endpoints). Added both strings to `KNOWN_NON_API` in `scripts/audit-endpoints.mjs` so the audit script correctly categorizes them as intentional non-spec commands rather than silently suppressing phantom reporting.

---

### WR-03: Audit script regex for exclusions only matches single-quoted strings

**Files modified:** `packages/twentythree-cli/scripts/audit-endpoints.mjs`
**Commit:** 4a69028
**Applied fix:** Updated the regex at line 62 from `/endpoint:\s*'([^']+)'/g` to `/endpoint:\s*['"]([^'"]+)['"]/g` so that both single-quoted and double-quoted `endpoint:` values in `audit.ts` are matched when extracting `EXCLUDED_OPERATIONS`.

---

_Fixed: 2026-04-16_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
