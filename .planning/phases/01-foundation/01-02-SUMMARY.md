---
phase: 01-foundation
plan: "02"
subsystem: infra
tags: [oclif, tsdown, bin-entrypoint, node-version-guard, build-pipeline]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: monorepo scaffold with twentythree-cli package.json, tsconfig, and src/commands directory
provides:
  - bin/run.js production entrypoint with Node 22 guard before oclif loads
  - bin/dev.js development entrypoint with NODE_ENV=development
  - tsdown.config.ts in unbundle CJS mode for oclif command discovery
  - working pnpm build pipeline (tsdown + oclif manifest)
  - src/index.ts programmatic entry placeholder
  - CLI responds to --version and --help
affects: [01-03, all downstream phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - oclif execute({dir: __dirname}) CJS entry pattern — not run()+handle() directly
    - tsdown --config-loader unrun flag required when package type is commonjs and config uses ESM import syntax
    - Node version guard in bin/run.js before any require('@oclif/core') — fires on old Node before oclif loads

key-files:
  created:
    - packages/twentythree-cli/bin/run.js
    - packages/twentythree-cli/bin/run.cmd
    - packages/twentythree-cli/bin/dev.js
    - packages/twentythree-cli/bin/dev.cmd
    - packages/twentythree-cli/tsdown.config.ts
    - packages/twentythree-cli/src/index.ts
  modified:
    - packages/twentythree-cli/package.json

key-decisions:
  - "Use execute({dir: __dirname}) not run()+handle() for CJS entrypoints — execute() is the documented pattern and passes __dirname not package.json"
  - "tsdown build script requires --config-loader unrun when package type is commonjs — tsdown.config.ts uses ESM import syntax which Node cannot load as CJS"

patterns-established:
  - "Pattern: oclif CJS bin entrypoint uses execute({dir: __dirname}) via dynamic import('@oclif/core')"
  - "Pattern: tsdown build command must include --config-loader unrun in CJS packages"

requirements-completed: [FOUND-02, FOUND-03, FOUND-04]

# Metrics
duration: 2min
completed: 2026-04-14
---

# Phase 01 Plan 02: Bin Entrypoints and Build Pipeline Summary

**oclif v4 CLI skeleton with Node 22 guard in bin/run.js, tsdown unbundle CJS build, and working --version/--help responses**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-14T08:52:36Z
- **Completed:** 2026-04-14T08:54:42Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Created bin/run.js with Node 22 guard running before oclif loads, using the documented CJS execute({dir: __dirname}) pattern
- Created bin/dev.js development entrypoint with NODE_ENV=development and tsx fallback support
- Created tsdown.config.ts with unbundle:true, format:'cjs', target:'node22' for oclif command discovery compatibility
- Build pipeline works end-to-end: `pnpm --filter twentythree-cli build` runs tsdown then oclif manifest
- `node bin/run.js --version` outputs `twentythree-cli/0.1.0 darwin-arm64 node-v22.22.2`
- `node bin/run.js --help` outputs CLI description and usage

## Task Commits

Each task was committed atomically:

1. **Task 1: Create bin entrypoints with Node 22 guard and tsdown config** - `e3151e7` (feat)
2. **Task 2: Build and verify CLI responds to --version** - `9504ac6` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `packages/twentythree-cli/bin/run.js` - Production entrypoint: Node 22 guard + execute({dir: __dirname})
- `packages/twentythree-cli/bin/run.cmd` - Windows production shim
- `packages/twentythree-cli/bin/dev.js` - Dev entrypoint: NODE_ENV=development + execute({development:true})
- `packages/twentythree-cli/bin/dev.cmd` - Windows dev shim
- `packages/twentythree-cli/tsdown.config.ts` - unbundle CJS build config for oclif compatibility
- `packages/twentythree-cli/src/index.ts` - Programmatic entry placeholder (export {})
- `packages/twentythree-cli/package.json` - Added --config-loader unrun to build script

## Decisions Made

- Used `execute({dir: __dirname})` via dynamic `import('@oclif/core')` instead of `run()+handle()` directly — `execute()` is the documented CJS pattern in @oclif/core v4; `run()` expects a directory string not a package.json object
- Added `--config-loader unrun` to the tsdown build command — required because the package is `"type": "commonjs"` but `tsdown.config.ts` uses ESM `import` syntax; Node 22 cannot natively load it as CJS without this flag

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed tsdown config loader error in CJS package context**
- **Found during:** Task 2 (build pipeline)
- **Issue:** `pnpm build` failed with "Cannot use import statement outside a module" — tsdown.config.ts uses ESM `import { defineConfig }` but package.json has `"type": "commonjs"`
- **Fix:** Added `--config-loader unrun` flag to the build script in package.json; this is a documented tsdown flag for exactly this scenario
- **Files modified:** packages/twentythree-cli/package.json
- **Verification:** `pnpm --filter twentythree-cli build` exits 0
- **Committed in:** `9504ac6` (Task 2 commit)

**2. [Rule 1 - Bug] Fixed incorrect run() call signature in bin entrypoints**
- **Found during:** Task 2 (--version verification)
- **Issue:** Plan code passed `require('../package.json')` as the second argument to `run()`, but `run()` expects a directory path string — this caused `TypeError: The "path" argument must be of type string. Received undefined`
- **Fix:** Switched to `execute({dir: __dirname})` via dynamic import — the documented CJS pattern from @oclif/core v4 source and README; `execute()` internally calls `run(__dirname)` + `handle()`
- **Files modified:** packages/twentythree-cli/bin/run.js, packages/twentythree-cli/bin/dev.js
- **Verification:** `node bin/run.js --version` outputs `twentythree-cli/0.1.0 darwin-arm64 node-v22.22.2`
- **Committed in:** `9504ac6` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for basic operation. No scope creep.

## Issues Encountered

None beyond the two auto-fixed deviations documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CLI binary is runnable: `node bin/run.js --version` and `--help` work
- Build pipeline is end-to-end functional: tsdown + oclif manifest
- Ready for Plan 01-03: term-map.ts, OpenAPI type generation, and first commands

## Self-Check: PASSED
