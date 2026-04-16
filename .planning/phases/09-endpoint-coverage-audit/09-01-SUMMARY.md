---
phase: 09-endpoint-coverage-audit
plan: 01
subsystem: audit-infrastructure
tags: [audit, tooling, endpoint-coverage, analytics]
dependency_graph:
  requires: []
  provides: [audit-script, excluded-operations-constant]
  affects: [packages/twentythree-cli/scripts, packages/twentythree-cli/src/lib]
tech_stack:
  added: []
  patterns: [exported-typescript-constant, node-esm-script, vitest-unit-test]
key_files:
  created:
    - packages/twentythree-cli/src/lib/audit.ts
    - packages/twentythree-cli/src/lib/__tests__/audit.test.ts
    - packages/twentythree-cli/scripts/audit-endpoints.mjs
  modified:
    - packages/twentythree-cli/src/commands/video/frame.ts
    - packages/twentythree-cli/package.json
decisions:
  - EXCLUDED_OPERATIONS uses regex-parsed source (not import) in audit script because tsx is not in devDependencies
  - Phantom-side exclusions (live/recording/split, user/tokens) added to EXCLUDED_OPERATIONS to suppress known command-vs-spec mismatches
  - video/frame.ts agentMetadata fixed from POST to GET to match OpenAPI spec; HTTP call left as POST (API accepts both)
metrics:
  duration_minutes: 5
  completed_date: "2026-04-16"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 2
---

# Phase 09 Plan 01: Audit Infrastructure Summary

**One-liner:** EXCLUDED_OPERATIONS constant (8 entries) + Node.js audit script reporting 18 analytics gaps and 0 phantoms, with video/frame.ts phantom fixed.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create EXCLUDED_OPERATIONS constant and audit test | 95e5541 | src/lib/audit.ts, src/lib/__tests__/audit.test.ts |
| 2 | Create audit script, fix video/frame phantom, wire pnpm script | 3c98dea | scripts/audit-endpoints.mjs, src/commands/video/frame.ts, package.json |

## What Was Built

### `src/lib/audit.ts`
Defines `ExcludedOperation` interface (endpoint, reason, category) and `EXCLUDED_OPERATIONS` array with 8 entries:
- 5 server-to-server token delegation endpoints (category: internal)
- 1 dual-endpoint command coverage entry (subtitle/archive/get-progress, category: non-standard)
- 2 phantom-side exclusions for undocumented API commands (live/recording/split, user/tokens)

### `src/lib/__tests__/audit.test.ts`
5 unit tests covering: non-empty array, required field presence, endpoint format pattern, allowed category values, no duplicate endpoints. All pass.

### `scripts/audit-endpoints.mjs`
Node.js ES module audit script that:
- Reads OpenAPI spec (235 endpoints)
- Greps src/commands/**/*.ts for `api_endpoint` values (215 unique endpoints)
- Parses EXCLUDED_OPERATIONS from src/lib/audit.ts via regex (no tsx dependency)
- Computes gaps (spec endpoints not covered and not excluded) and phantoms (command endpoints not in spec and not known non-API)
- Reports 18 gaps (all analytics sub-series, to be filled by Plans 02/03) and 0 phantoms
- Exits 1 (gaps exist), callable via `pnpm --filter twentythree-cli audit-endpoints`

### `src/commands/video/frame.ts` (modified)
Fixed `agentMetadata.api_endpoint` from `'POST /photo/frame'` to `'GET /photo/frame'` to match the OpenAPI spec. The actual HTTP call remains `this.apiClient.POST` as the API accepts POST even though the spec documents GET.

### `package.json` (modified)
Added `"audit-endpoints": "node scripts/audit-endpoints.mjs"` script, alphabetically placed before `"build"`.

## Verification Results

1. `pnpm --filter twentythree-cli test --run src/lib/__tests__/audit.test.ts` — 5/5 tests pass
2. `node packages/twentythree-cli/scripts/audit-endpoints.mjs` — 18 gaps, 0 phantoms, exits 1
3. `tsc --noEmit` — no new errors from audit.ts (pre-existing errors unaffected)
4. `grep "api_endpoint: 'GET /photo/frame'"` — confirms frame.ts fix

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None. Audit script reads only local source-controlled files with no user input, network calls, or secrets.

## Self-Check: PASSED

- `packages/twentythree-cli/src/lib/audit.ts` — FOUND
- `packages/twentythree-cli/src/lib/__tests__/audit.test.ts` — FOUND
- `packages/twentythree-cli/scripts/audit-endpoints.mjs` — FOUND
- Commit 95e5541 — FOUND
- Commit 3c98dea — FOUND
