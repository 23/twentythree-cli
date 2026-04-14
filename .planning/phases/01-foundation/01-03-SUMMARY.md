---
phase: 01-foundation
plan: "03"
subsystem: infra
tags: [openapi-typescript, vitest, term-map, types, testing]

# Dependency graph
requires:
  - phase: 01-foundation/01-02
    provides: bin entrypoints, tsdown build, working CLI skeleton
provides:
  - packages/twentythree-cli/src/api/types.ts — 35,862-line generated TypeScript types from live OpenAPI spec (235 endpoints)
  - packages/twentythree-cli/src/lib/term-map.ts — bidirectional API/CLI terminology translator with 4 exports
  - packages/twentythree-cli/vitest.config.ts — vitest configured for src/**/*.test.ts
  - 19 passing tests covering term-map and Node version guard logic
affects: [all downstream phases — api/types.ts and term-map are consumed by every command]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - openapi-typescript v7 generates types-only file from HTTPS spec URL — zero runtime cost
    - TDD flow — RED (tests fail on missing module) then GREEN (implementation added)
    - Term map uses Object.fromEntries to auto-derive CLI_TO_API from API_TO_CLI — single source of truth
    - vitest --globals:true enables describe/it/expect without explicit imports in test files

key-files:
  created:
    - packages/twentythree-cli/src/api/types.ts
    - packages/twentythree-cli/src/lib/term-map.ts
    - packages/twentythree-cli/src/lib/__tests__/term-map.test.ts
    - packages/twentythree-cli/src/lib/__tests__/node-check.test.ts
    - packages/twentythree-cli/vitest.config.ts
  modified:
    - packages/twentythree-cli/src/index.ts
    - package.json (root)

key-decisions:
  - "generate-types root script fixed to use pnpm --filter twentythree-cli exec — openapi-typescript is a devDep in CLI package, not root"
  - "Term map CLI_TO_API derived from API_TO_CLI via Object.fromEntries — single source of truth, no duplication"
  - "node-check tests are self-contained (no process.exit) — extracts guard logic into pure function isNodeVersionSupported for safe unit testing"

patterns-established:
  - "Pattern: openapi-typescript run via pnpm --filter exec — keeps binary in package that owns the dep"
  - "Pattern: term-map exports both directions (API_TO_CLI, CLI_TO_API) plus high-level functions — consumers choose the right abstraction"

requirements-completed: [FOUND-05, FOUND-06]

# Metrics
duration: 3min
completed: 2026-04-14
---

# Phase 01 Plan 03: OpenAPI Types and Term-Map Summary

**Generated TypeScript types from live OpenAPI spec (35,862 lines) and bidirectional terminology translator with 19 passing tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-14T08:57:42Z
- **Completed:** 2026-04-14T09:00:17Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Generated `packages/twentythree-cli/src/api/types.ts` from `https://video.twentythree.com/apidocs/swagger.json` — 35,862 lines covering all 235 endpoints
- Fixed root `generate-types` script to invoke openapi-typescript via `pnpm --filter twentythree-cli exec` (was calling the binary directly, which is not in root devDependencies)
- Created `packages/twentythree-cli/vitest.config.ts` — vitest with globals:true, includes src/**/*.test.ts
- Created `packages/twentythree-cli/src/lib/term-map.ts` — 4 exports: toCliTerm, toApiTerm, applyCliTerms, TERM_MAP
- Created `src/lib/__tests__/term-map.test.ts` — 14 tests covering all mapping directions, case-insensitivity, passthrough, and string replacement
- Created `src/lib/__tests__/node-check.test.ts` — 5 tests verifying Node <22 is rejected and >=22 is accepted
- Updated `src/index.ts` to re-export all term-map symbols
- All 19 tests pass; tsc --noEmit exits 0; build exits 0; CLI --version still works

## Task Commits

Each task was committed atomically:

1. **Task 1: Generate OpenAPI types and configure vitest** - `26eb2d3` (feat)
2. **Task 2: Term-map module, tests, and Node guard tests** - `2f42a07` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `packages/twentythree-cli/src/api/types.ts` — Generated types: 35,862 lines, paths + components interfaces, 235 endpoints
- `packages/twentythree-cli/vitest.config.ts` — vitest config: globals:true, src/**/*.test.ts pattern
- `packages/twentythree-cli/src/lib/term-map.ts` — 3 exported functions + TERM_MAP constant
- `packages/twentythree-cli/src/lib/__tests__/term-map.test.ts` — 14 unit tests
- `packages/twentythree-cli/src/lib/__tests__/node-check.test.ts` — 5 unit tests
- `packages/twentythree-cli/src/index.ts` — Re-exports toCliTerm, toApiTerm, applyCliTerms, TERM_MAP
- `package.json` (root) — Fixed generate-types script to use pnpm --filter exec

## Decisions Made

- Fixed `generate-types` root script to use `pnpm --filter twentythree-cli exec openapi-typescript` — the binary lives in the CLI package's devDependencies, not the root; calling it directly at root fails with "command not found"
- CLI_TO_API map derived from API_TO_CLI via `Object.fromEntries(Object.entries(API_TO_CLI).map(([k, v]) => [v, k]))` — single source of truth; adding a new mapping in one place updates both directions automatically
- node-check test file is self-contained: extracts the guard logic into a local pure function `isNodeVersionSupported` so the test runner isn't killed by `process.exit(1)` during testing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed root generate-types script invoking non-existent root binary**
- **Found during:** Task 1 (running pnpm generate-types)
- **Issue:** Root package.json called `openapi-typescript` directly but the binary is only installed in `packages/twentythree-cli/node_modules/.bin/` — running from root fails with "command not found"
- **Fix:** Changed root script to `pnpm --filter twentythree-cli exec openapi-typescript ...` which resolves the binary from the CLI package's local node_modules
- **Files modified:** package.json (root)
- **Commit:** `26eb2d3`

## Known Stubs

None — all functionality is fully implemented and tested.

## Threat Flags

No new security-relevant surface introduced. OpenAPI spec fetch is compile-time only (HTTPS, public endpoint, generates types-only file). Term-map contains no secrets or sensitive data.

## Self-Check: PASSED
