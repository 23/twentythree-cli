---
phase: 01-foundation
fixed_at: 2026-04-14T00:00:00Z
review_path: .planning/phases/01-foundation/01-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 3
skipped: 1
status: partial
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-04-14
**Source review:** .planning/phases/01-foundation/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4
- Fixed: 3
- Skipped: 1

## Fixed Issues

### WR-01 + WR-02: `bin/dev.js` missing Node 22 guard and overly broad catch

**Files modified:** `packages/twentythree-cli/bin/dev.js`
**Commit:** 931e3ed
**Applied fix:** Added the same Node version guard as `bin/run.js` at the top of `bin/dev.js` (checks `process.versions.node`, exits with a clear message if major < 22). Also narrowed the `catch {}` block to re-throw any error whose `.code` is not `'MODULE_NOT_FOUND'`, so only a missing `tsx` module is silently absorbed — corrupt installs, permissions errors, and runtime exceptions now propagate correctly.

### WR-03: `applyCliTerms` case-sensitive with no word-boundary guard

**Files modified:** `packages/twentythree-cli/src/lib/term-map.ts`
**Commit:** 64e2c10
**Applied fix:** Replaced `result.replaceAll(apiTerm, cliTerm)` with `result.replace(new RegExp(\`\\b${apiTerm}\\b\`, 'gi'), cliTerm)`. The `gi` flags make matching case-insensitive (aligning with `toCliTerm`/`toApiTerm`), and the `\b` word-boundary anchors prevent partial-word substitutions such as `"albumArt"` → `"categoryArt"`.

## Skipped Issues

### WR-04: `vitest` version `^4.1.4` likely does not exist

**File:** `packages/twentythree-cli/package.json:41`
**Reason:** skipped: code context differs from review — version exists on npm
**Original issue:** Reviewer believed vitest v4 had not been published (knowledge cutoff August 2025). Registry check at fix time (`npm view vitest version`) returned `4.1.4` as the current latest stable release. The specifier `"^4.1.4"` is valid and `pnpm install` will succeed. No change needed.

---

_Fixed: 2026-04-14_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
