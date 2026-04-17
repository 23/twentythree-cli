---
phase: 16-interactive-prompts
plan: "01"
subsystem: cli-ux
tags: [interactive-prompts, base-command, clack, tdd]
dependency_graph:
  requires: []
  provides: [interactive-flag-prompting]
  affects: [all-commands-extending-BaseCommand]
tech_stack:
  added: []
  patterns: [catch-override, constructor-name-guard, argv-re-dispatch]
key_files:
  created: []
  modified:
    - packages/twentythree-cli/src/lib/base-command.ts
    - packages/twentythree-cli/src/lib/__tests__/base-command.test.ts
decisions:
  - "Use constructor.name check for FailedFlagValidationError (class not exported from oclif/core public API)"
  - "Namespace import (import * as p) for @clack/prompts to enable both select() and new prompt functions"
  - "Re-dispatch via this.config.runCommand to preserve existing argv (workspace, json flags)"
metrics:
  duration: "2 minutes"
  completed: "2026-04-17"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
requirements_completed:
  - PROMPT-01
  - PROMPT-02
---

# Phase 16 Plan 01: Interactive Flag Prompts Summary

**One-liner:** BaseCommand.catch() intercepts FailedFlagValidationError in TTY mode and prompts for each missing required flag via @clack/prompts before re-executing the command — covering all 142+ commands with zero per-command changes.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Write failing tests for BaseCommand.catch() | cdb3e2d | base-command.test.ts |
| 2 (GREEN) | Implement catch() override in BaseCommand | b6f5af0 | base-command.ts |

## What Was Built

`BaseCommand.catch()` now intercepts `FailedFlagValidationError` thrown by oclif's parser when a user omits a required flag. In TTY mode:

1. Calls `p.intro('Missing required input')`
2. Loops through each missing flag name (extracted via regex from the error message)
3. Looks up the flag's `description` or `summary` from `err.parse.input.flags` for the prompt label
4. Calls `p.text({ message: label })` for each flag sequentially
5. On cancel (`p.isCancel`), calls `p.cancel('Cancelled')` and exits cleanly
6. Calls `p.outro('Running command...')` then re-dispatches via `this.config.runCommand(this.id!, newArgv)`

In non-TTY mode (CI, pipes, `--agent`): the original oclif error is re-thrown unchanged via `super.catch(err)`.

## TDD Gate Compliance

- RED gate: commit `cdb3e2d` — `test(16-01): add failing tests for BaseCommand.catch() interactive prompt`
- GREEN gate: commit `b6f5af0` — `feat(16-01): implement BaseCommand.catch() with @clack/prompts interactive prompt`

Both gates satisfied. 3 of 5 new tests failed in RED phase (2 correctly passed because super.catch re-throws for non-TTY and non-matching error cases — both valid RED states since catch() was absent).

## Test Results

- Before implementation: 11 pass, 3 fail (RED — catch() missing)
- After implementation: 14 pass, 0 fail (GREEN)
- Full suite: 163 tests pass across 17 test files — no regressions

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None. The `catch()` method adds no new network endpoints, auth paths, file access patterns, or schema changes. The threat model in the plan (T-16-01, T-16-02, T-16-03) covers the surface fully with accepted risk dispositions.

## Self-Check: PASSED

- `packages/twentythree-cli/src/lib/base-command.ts` — exists, contains `async catch`, `import * as p`
- `packages/twentythree-cli/src/lib/__tests__/base-command.test.ts` — exists, contains 5 new tests
- Commit `cdb3e2d` — verified in git log
- Commit `b6f5af0` — verified in git log
