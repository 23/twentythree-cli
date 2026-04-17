---
phase: 14-bug-audit-fix
plan: "01"
subsystem: cli-typescript
tags: [bugfix, typescript, type-safety]
dependency_graph:
  requires: []
  provides: [tsc-clean, runtime-safe-imports, correct-api-params]
  affects: [all-video-commands, chunked-upload, auth-credentials, base-command]
tech_stack:
  added: []
  patterns: [paths-mapping-for-esm-deps]
key_files:
  created: []
  modified:
    - packages/twentythree-cli/src/commands/video/section/delete.ts
    - packages/twentythree-cli/src/commands/video/subtitle/delete.ts
    - packages/twentythree-cli/src/commands/video/update.ts
    - packages/twentythree-cli/src/commands/webinar/mail/preview.ts
    - packages/twentythree-cli/src/upload/chunked-upload.ts
    - packages/twentythree-cli/src/commands/video/section/list.ts
    - packages/twentythree-cli/src/commands/video/replace.ts
    - packages/twentythree-cli/src/commands/video/transcoding-progress.ts
    - packages/twentythree-cli/src/commands/video/get.ts
    - packages/twentythree-cli/src/commands/video/list.ts
    - packages/twentythree-cli/src/commands/video/frame.ts
    - packages/twentythree-cli/src/commands/video/subtitle/data.ts
    - packages/twentythree-cli/src/commands/auth/credentials.ts
    - packages/twentythree-cli/src/lib/base-command.ts
    - packages/twentythree-cli/tsconfig.json
decisions:
  - "Used paths mapping in package tsconfig.json to resolve conf ESM module TS2307 — bundler moduleResolution broke CJS/ESM interop with @clack/prompts and node16 moduleResolution broke even more; paths mapping resolves conf types without touching module system"
metrics:
  duration: "4 minutes"
  completed: "2026-04-17"
  tasks_completed: 2
  files_modified: 15
---

# Phase 14 Plan 01: TypeScript Error Fix Summary

**One-liner:** Fixed all 15 TypeScript errors across the CLI — missing formatApiError imports, HeadersInit DOM type, string/number mismatches, missing token param, and conf module resolution via tsconfig paths mapping.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix runtime-crash TS2304 errors | 2ef21e3 | section/delete.ts, subtitle/delete.ts, update.ts, preview.ts, chunked-upload.ts |
| 2 | Fix type mismatches, missing property, tsconfig | 5d4374d | section/list.ts, replace.ts, transcoding-progress.ts, get.ts, list.ts, frame.ts, subtitle/data.ts, credentials.ts, base-command.ts, tsconfig.json |

## What Was Fixed

### Task 1 — TS2304 Runtime-Crash Errors (5 fixes)

| File | Error | Fix |
|------|-------|-----|
| video/section/delete.ts | `formatApiError` not in scope (TS2304) | Added to named import from output.js |
| video/subtitle/delete.ts | `formatApiError` not in scope (TS2304) | Added to named import from output.js |
| video/update.ts | `formatApiError` not in scope (TS2304) | Added to named import from output.js |
| webinar/mail/preview.ts | `HeadersInit` DOM-only type (TS2304) | Replaced with `Record<string, string>` |
| upload/chunked-upload.ts | `HeadersInit` DOM-only type (TS2304) | Replaced with `Record<string, string>` |

### Task 2 — Type Mismatches and Configuration (10 fixes)

| File | Error | Fix |
|------|-------|-----|
| video/section/list.ts | `photo_id: args.id` string→number (TS2322) | `Number(args.id)` |
| video/replace.ts | `photo_id: args.id` string→number in get-replace-token (TS2322) | `Number(args.id)` |
| video/transcoding-progress.ts | `photo_id: args.id` string→number (TS2322) | `Number(args.id)` |
| video/get.ts | `include_unpublished_p: 1` number→string (TS2322) | `'1'` |
| video/list.ts | `include_unpublished_p: 1` number→string (TS2322) | `'1'` |
| lib/base-command.ts | `include_unpublished_p: 1` in fetchVideoToken (TS2322) | `'1'` |
| video/frame.ts | `/photo/frame` not in PathsWithMethod (TS2345) | `'/photo/frame' as any` (established codebase pattern) |
| video/subtitle/data.ts | `token` property missing from query (TS2741) | Added `fetchVideoToken(args.id)` + `token` in query |
| auth/credentials.ts | `v` possibly undefined in validate callback (TS18048) | `v?.includes('.')` optional chaining |
| tsconfig.json | `conf` module not found (TS2307) | Added `paths` mapping to conf types in package tsconfig |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] tsconfig.base.json moduleResolution: bundler incompatible with module: commonjs**
- **Found during:** Task 2
- **Issue:** Plan specified `"moduleResolution": "bundler"` in tsconfig.base.json, but `bundler` requires `module: preserve` or ESM. This project uses `module: commonjs` (required for oclif v4 + chalk 4.x/ora 5.x CJS-only pins). Setting `bundler` caused immediate TS5095 error. Trying `node16` caused 200+ TS1479 errors (strict CJS/ESM interop enforcement breaking all `@clack/prompts` and `conf` imports).
- **Fix:** Kept `moduleResolution: node` in tsconfig.base.json. Added `paths` mapping in `packages/twentythree-cli/tsconfig.json` to point `conf` directly at its types file (`./node_modules/conf/dist/source/index.d.ts`). This resolves the TS2307 for conf without touching the module system.
- **Files modified:** packages/twentythree-cli/tsconfig.json (added paths), tsconfig.base.json (reverted to node)
- **Commit:** 5d4374d

## Verification Results

- `pnpm --filter twentythree-cli exec tsc --noEmit` exits 0 — zero TypeScript errors
- `pnpm --filter twentythree-cli test --run` — 151 passed, 0 failures (16 test files, 24 skipped suites)
- `grep -r "HeadersInit" packages/twentythree-cli/src/` — 0 results
- `formatApiError` present in import lines of all 3 previously-broken command files

## Known Stubs

None.

## Threat Flags

None — no new trust boundaries, no new network endpoints, no new auth paths.

## Self-Check: PASSED

- [x] All 15 source files modified as planned (or deviation-adjusted)
- [x] Commit 2ef21e3 exists (Task 1)
- [x] Commit 5d4374d exists (Task 2)
- [x] tsc --noEmit exits 0
- [x] vitest passes 151 tests
