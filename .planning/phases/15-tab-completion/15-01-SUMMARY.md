---
phase: 15-tab-completion
plan: "01"
subsystem: cli-commands
tags: [autocomplete, oclif-plugin, tab-completion, clack-prompts, shell-detection]
dependency_graph:
  requires: []
  provides: [autocomplete-command, plugin-registration]
  affects: [packages/twentythree-cli/package.json, packages/twentythree-cli/src/commands/autocomplete/]
tech_stack:
  added: ["@oclif/plugin-autocomplete@^3.2.45"]
  patterns: [oclif-plugin-registration, clack-prompts-guided-flow, shell-detection-env-var]
key_files:
  created:
    - packages/twentythree-cli/src/commands/autocomplete/index.ts
    - packages/twentythree-cli/src/commands/autocomplete/__tests__/autocomplete.test.ts
  modified:
    - packages/twentythree-cli/package.json
decisions:
  - "Used this.config.runCommand('autocomplete:create') instead of direct ESM subpath import — plugin exports are restricted to ./lib/index.js and the plugin is ESM-only"
  - "Plan's manifest verification check (grep oclif.manifest.json for autocomplete) was a false test — oclif plugins inject commands at runtime, not into the CLI's own manifest. Used runtime smoke test instead."
metrics:
  duration_seconds: 117
  completed_date: "2026-04-17"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 2
---

# Phase 15 Plan 01: Plugin Registration & Guided Autocomplete Command Summary

Registered `@oclif/plugin-autocomplete` and implemented a guided tab completion setup command using `@clack/prompts` with shell detection, cache building via `this.config.runCommand`, and eval-line display.

## What Was Built

### Task 1: Plugin registration
- Added `@oclif/plugin-autocomplete@^3.2.45` to dependencies
- Added `plugins: ["@oclif/plugin-autocomplete"]` to the `oclif` block in `package.json`
- Plugin loads at runtime via oclif's dynamic ESM import bridge (CJS root + ESM plugin is supported in @oclif/core v4)

### Task 2: Guided autocomplete command
- Created `src/commands/autocomplete/index.ts` — new `Autocomplete` command with `@clack/prompts` guided flow
- Shell detection from `process.env.SHELL` (zsh/bash); falls back to `p.select` for unknown shells
- Confirm prompt when shell is detected; select prompt when not
- Cache built via `this.config.runCommand('autocomplete:create', [])` before showing eval line
- Eval line shown in `p.note()` — user pastes manually, no auto-write to rc files (per D-02)
- `agentMetadata` with `api_endpoint: 'interactive'`, `auth_scope: 'none'`
- Created `__tests__/autocomplete.test.ts` with 7 passing tests covering import, description, metadata, and shell detection logic

## Verification Results

- `pnpm --filter twentythree-cli test --run`: 158 tests passed, 0 failures
- `node bin/run.js autocomplete --help`: Shows guided setup command correctly
- Autocomplete commands available at runtime including plugin's `autocomplete:create` and `autocomplete script <shell>`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan's manifest verification was a false test**
- **Found during:** Task 1 verification
- **Issue:** Plan instructed to verify `oclif.manifest.json` contains autocomplete commands. However, oclif plugins inject commands at runtime via dynamic import — they do NOT appear in the CLI's own `oclif.manifest.json`. The plugin has its own `oclif.manifest.json` inside its package directory. The CLI's manifest correctly only contains commands from `src/commands/`.
- **Fix:** Used runtime smoke test (`node bin/run.js autocomplete --help`) as the correct verification. The CLI's manifest does include `autocomplete` (from the new `src/commands/autocomplete/index.ts`), but not the plugin's internal `autocomplete:create` command.
- **Files modified:** None — verification approach adjusted, no code change needed
- **Commit:** N/A (no code deviation)

## Known Stubs

None. The command is fully functional — shell detection, cache build, and eval line display are all wired.

## Threat Flags

None. No new network endpoints, auth paths, or trust boundary surface added. The `$SHELL` env var is used only for enum-constrained shell detection (zsh/bash); unrecognized values fall through to `p.select`. Eval line is constructed from hardcoded template with `shell` constrained to `'zsh'` or `'bash'` string literals — no user-supplied input interpolated (T-15-03 mitigation verified).

## Self-Check: PASSED

- `packages/twentythree-cli/src/commands/autocomplete/index.ts`: FOUND
- `packages/twentythree-cli/src/commands/autocomplete/__tests__/autocomplete.test.ts`: FOUND
- Task 1 commit `18baddf`: FOUND
- Task 2 commit `4019a99`: FOUND
