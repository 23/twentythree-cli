---
phase: 21-skills-npm-publish
fixed_at: 2026-04-21T00:00:00Z
review_path: .planning/phases/21-skills-npm-publish/21-REVIEW.md
iteration: 1
findings_in_scope: 2
fixed: 2
skipped: 0
status: all_fixed
---

# Phase 21: Code Review Fix Report

**Fixed at:** 2026-04-21T00:00:00Z
**Source review:** .planning/phases/21-skills-npm-publish/21-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 2
- Fixed: 2
- Skipped: 0

## Fixed Issues

### WR-01: Installer always exits 0 even when file copies fail

**Files modified:** `packages/twentythree-skills/bin/add.js`
**Commit:** 693e3ca
**Applied fix:** Changed the unconditional `process.exit(0)` at line 103 to `process.exit(process.exitCode ?? 0)`. This preserves best-effort install behaviour (continuing after individual file errors) while correctly propagating the failure exit code set by `process.exitCode = 1` inside the `cpSync` catch block.

### WR-02: Dry-run uses npm, real publish uses pnpm — auth token may behave differently

**Files modified:** `.github/workflows/release.yml`
**Commit:** 8b712c4
**Applied fix:** Changed the dry-run publish step from `npm publish --dry-run` to `pnpm publish --no-git-checks --dry-run`. Both the dry-run and the real publish step now use the same `pnpm` invocation, ensuring the token validation test exercises the same code path as the actual publish.

---

_Fixed: 2026-04-21T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
