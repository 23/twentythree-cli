---
phase: 20-runtime-installer
fixed_at: 2026-04-20T00:00:00Z
review_path: .planning/phases/20-runtime-installer/20-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 20: Code Review Fix Report

**Fixed at:** 2026-04-20
**Source review:** `.planning/phases/20-runtime-installer/20-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope (Critical + Warning): 3
- Fixed: 3
- Skipped: 0

## Fixed Issues

| ID | Severity | Fix applied | Commit |
|----|----------|-------------|--------|
| WR-01 | Warning | Wrapped `cpSync` in try/catch; prints `✗ Error installing <rel>: <err.message>` and sets `process.exitCode = 1` on failure. Also passed `{ dereference: false }` explicitly. | `66eb919` |
| WR-02 | Warning | Added `existsSync(skillsSource)` guard before the `detected` filter; prints a helpful message and exits 1 if the `skills/` directory is absent. | `66eb919` |
| WR-03 | Warning | Added `if (entry.isSymbolicLink()) continue` as the first check in `walkDir`, skipping all symlinks before any directory or file processing. | `66eb919` |

## Skipped Issues (outside fix_scope)

### IN-01: `shortPath` has an edge case when path separator differs

**File:** `packages/twentythree-skills/bin/add.js:58`
**Reason:** Info severity — outside `fix_scope: critical_warning`
**Original issue:** `abs.startsWith(cwd + '/')` hard-codes `/` as the path separator; Windows users would see raw absolute paths.

### IN-02: No feedback when `--project` flag is used without documentation

**File:** `packages/twentythree-skills/bin/add.js:14`
**Reason:** Info severity — outside `fix_scope: critical_warning`
**Original issue:** `--project` flag is undocumented; no usage output is printed for unknown flags.

---

_Fixed: 2026-04-20_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
