---
quick_id: 260508-dhl
slug: add-auth-switch-command-to-re-select-act
status: complete
date: 2026-05-08
duration: ~5m
tasks_completed: 2
files_created: 2
key_files:
  created:
    - packages/twentythree-cli/src/commands/auth/switch.ts
    - packages/twentythree-cli/src/commands/auth/__tests__/switch.test.ts
decisions:
  - Extends Command directly (not BaseCommand) — auth switch modifies which workspace is active, not operating within one
---

# Quick Task 260508-dhl: Add auth switch command to re-select active workspace

**One-liner:** Interactive `auth switch` command lists all configured workspaces via `p.select`, marks the currently active one with `[active]`, and calls `setActiveWorkspace()` on selection.

## Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Implement auth switch command | ff62a26 | src/commands/auth/switch.ts |
| 2 | Add tests for auth switch | 0b5b2c4 | src/commands/auth/__tests__/switch.test.ts |

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `pnpm --filter twentythree-cli exec tsc --noEmit` — passed (no errors)
- `pnpm --filter twentythree-cli test --run` — 167 passed, 0 failed

## Self-Check: PASSED

- `packages/twentythree-cli/src/commands/auth/switch.ts` — FOUND
- `packages/twentythree-cli/src/commands/auth/__tests__/switch.test.ts` — FOUND
- Commit ff62a26 — FOUND
- Commit 0b5b2c4 — FOUND
