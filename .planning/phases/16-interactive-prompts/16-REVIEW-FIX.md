---
phase: 16-interactive-prompts
fixed_at: 2026-04-17T00:00:00Z
review_path: .planning/phases/16-interactive-prompts/16-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 16: Code Review Fix Report

**Fixed at:** 2026-04-17T00:00:00Z
**Source review:** .planning/phases/16-interactive-prompts/16-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 3
- Fixed: 3
- Skipped: 0

## Fixed Issues

### WR-01: `getWorkspaceForDomain` return value not checked after ambiguous workspace selection

**Files modified:** `packages/twentythree-cli/src/lib/base-command.ts`
**Commit:** cfbd1a0
**Applied fix:** Added an explicit null check after `getWorkspaceForDomain(chosen as string)`. If it returns null, a specific `this.error(...)` is thrown with the message "Workspace '{chosen}' could not be resolved — try running `twentythree workspace list`" rather than falling through to the generic "No workspace configured" error. The resolved workspace is then assigned from the `found` variable.

---

### WR-02: Empty string accepted as a valid value for a missing required flag

**Files modified:** `packages/twentythree-cli/src/lib/base-command.ts`, `packages/twentythree-cli/src/lib/__tests__/base-command.test.ts`
**Commit:** 2863ea9
**Applied fix:** Added a `validate` option to the `p.text()` call that returns `'Value is required'` if the trimmed input is empty or undefined. Updated test assertions from strict `toHaveBeenCalledWith({ message: '...' })` to `toHaveBeenCalledWith(expect.objectContaining({ message: '...' }))` so they continue to match the now-extended call signature (which includes the `validate` function).

---

### WR-03: `process.exit(0)` called inside `catch()` — swallows cancel silently in some oclif lifecycle contexts

**Files modified:** `packages/twentythree-cli/src/lib/base-command.ts`, `packages/twentythree-cli/src/lib/__tests__/base-command.test.ts`
**Commit:** 514c3e2
**Applied fix:** Added `Errors` to the `@oclif/core` import. Replaced `process.exit(0)` with `throw new Errors.CLIError('Cancelled', { exit: 0 })`, allowing oclif's lifecycle to handle teardown cleanly. Updated the cancel test to remove the `process.exit` spy pattern and instead assert that the promise rejects with `'Cancelled'`, and removed the now-unnecessary `exitSpy` assertions. Also guarded the `validate` callback against `v` being `undefined` (the `@clack/prompts` type allows this) by checking `!v` before calling `.trim()`.

---

_Fixed: 2026-04-17T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
