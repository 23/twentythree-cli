---
phase: 01-foundation
plan: "01"
subsystem: infra
tags: [pnpm, monorepo, turborepo, oclif, tsdown, typescript, changesets]

# Dependency graph
requires: []
provides:
  - pnpm workspace monorepo with two packages: twentythree-cli and twentythree-skills
  - root turbo.json pipeline (build, test, lint, generate-types)
  - shared tsconfig.base.json with strict mode and CJS module config
  - changesets versioning config with linked packages
  - twentythree-cli package.json wired for oclif v4 with tsdown build
  - twentythree-skills SKILL.md stub with valid frontmatter
  - pnpm-lock.yaml with all dependencies resolved
affects: [01-02, 01-03, all downstream phases]

# Tech tracking
tech-stack:
  added:
    - turbo 2.9.6
    - "@changesets/cli 2.30.0"
    - typescript 5.x (root devDep)
    - "@oclif/core ^4.10.5"
    - "openapi-fetch ^0.17.0"
    - "oclif ^4.23.0"
    - "tsdown ^0.21.8"
    - "openapi-typescript ^7.13.0"
    - "vitest ^4.1.4"
    - "@oclif/test ^4.0.0"
  patterns:
    - pnpm workspace monorepo with packages/* glob
    - turborepo v2 tasks (not pipeline) for build/test/lint orchestration
    - oclif v4 command discovery via dist/commands directory
    - CJS build target for oclif compatibility (chalk/ora v4/v5 CJS pins downstream)
    - tsdown unbundle mode planned for file-per-file compilation

key-files:
  created:
    - package.json
    - pnpm-workspace.yaml
    - turbo.json
    - tsconfig.base.json
    - .changeset/config.json
    - .gitignore
    - packages/twentythree-cli/package.json
    - packages/twentythree-cli/tsconfig.json
    - packages/twentythree-cli/src/commands/.gitkeep
    - packages/twentythree-skills/package.json
    - packages/twentythree-skills/SKILL.md
    - pnpm-lock.yaml
  modified: []

key-decisions:
  - "tsdown (not tsup) for build — tsup is officially abandoned; tsdown is the maintained Rolldown-powered successor"
  - "CJS module type on twentythree-cli package — required for oclif v4 and chalk 4.x / ora 5.x CJS-only pins"
  - "@oclif/test pinned to ^4.0.0 (not latest) — matches @oclif/core 4.x major version"
  - "turbo.json uses tasks key (not pipeline) — turborepo v2 renamed the field"
  - "twentythree-skills is a stub only — SKILL.md frontmatter established, real content deferred to v2"

patterns-established:
  - "Pattern: pnpm workspace monorepo with packages/* glob — all packages live under packages/"
  - "Pattern: tsconfig extends chain — packages/*/tsconfig.json extends ../../tsconfig.base.json"
  - "Pattern: oclif commands at dist/commands — tsdown unbundle mode preserves file-per-file structure"

requirements-completed: [FOUND-01]

# Metrics
duration: 2min
completed: 2026-04-14
---

# Phase 01 Plan 01: Monorepo Scaffold Summary

**pnpm workspace monorepo with oclif v4 CLI package and skills stub, turborepo v2 pipeline, and 452 resolved dependencies**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-14T08:47:09Z
- **Completed:** 2026-04-14T08:49:07Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Created root workspace: package.json (private, pnpm@10.33.0, Node >=22), pnpm-workspace.yaml, turbo.json (v2 tasks syntax), tsconfig.base.json (strict, CJS), .changeset/config.json, .gitignore
- Created twentythree-cli package stub with oclif v4 config, bin wiring, tsdown build script, and src/commands directory
- Created twentythree-skills stub with SKILL.md containing valid frontmatter (name, description, triggers, invocable)
- pnpm install succeeded with 452 packages resolved and pnpm-lock.yaml generated

## Task Commits

Each task was committed atomically:

1. **Task 1: Create root workspace configuration files** - `d90b88a` (chore)
2. **Task 2: Create both package stubs and install dependencies** - `5dd782d` (chore)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `package.json` - Workspace root: private, pnpm@10.33.0, turbo scripts, Node >=22 engine
- `pnpm-workspace.yaml` - Declares packages/* workspace
- `turbo.json` - Turborepo v2 task pipeline (build, test, lint, generate-types)
- `tsconfig.base.json` - Shared TS config: strict, CJS, ES2022 target
- `.changeset/config.json` - Changesets versioning with linked packages, baseBranch main
- `.gitignore` - Covers node_modules, dist, .turbo, oclif.manifest.json, .DS_Store
- `packages/twentythree-cli/package.json` - CLI package: oclif config, bin wiring, CJS type, tsdown/vitest devDeps
- `packages/twentythree-cli/tsconfig.json` - Extends ../../tsconfig.base.json
- `packages/twentythree-cli/src/commands/.gitkeep` - Creates commands directory for oclif discovery
- `packages/twentythree-skills/package.json` - Stub with no runtime dependencies
- `packages/twentythree-skills/SKILL.md` - AI agent skills stub with valid YAML frontmatter
- `pnpm-lock.yaml` - Lockfile with 452 resolved packages

## Decisions Made

- Used `tsdown ^0.21.8` (not tsup) — tsup is officially abandoned, tsdown is the Rolldown-powered successor
- Set `"type": "commonjs"` on twentythree-cli — required for oclif v4 and downstream chalk 4.x / ora 5.x CJS pins
- Pinned `@oclif/test` to `^4.0.0` (not `latest`) — ensures compatibility with @oclif/core 4.x major version
- turbo.json uses `tasks` key (turborepo v2) not `pipeline` (turborepo v1)
- twentythree-skills is a pure stub — SKILL.md frontmatter only, real content deferred to v2

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Monorepo structure established; both packages are discoverable by pnpm workspaces
- pnpm install succeeds and dependency tree is resolved
- Ready for Plan 01-02: bin entrypoints, tsdown config, term-map.ts, and Node version guard

## Self-Check: PASSED

All created files verified to exist on disk. All task commits verified in git log.

---
*Phase: 01-foundation*
*Completed: 2026-04-14*
