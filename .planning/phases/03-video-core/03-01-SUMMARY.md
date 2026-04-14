---
phase: 03-video-core
plan: "01"
subsystem: cli-lib
tags: [output-helpers, pagination, upload-types, oclif-stubs, dependencies]
dependency_graph:
  requires: []
  provides:
    - packages/twentythree-cli/src/lib/output.ts
    - packages/twentythree-cli/src/lib/pagination.ts
    - packages/twentythree-cli/src/upload/types.ts
    - packages/twentythree-cli/src/commands/video/index.ts
    - packages/twentythree-cli/src/commands/video/section/index.ts
    - packages/twentythree-cli/src/commands/video/subtitle/index.ts
  affects: []
tech_stack:
  added:
    - cli-progress: "^3.12.0 (runtime)"
    - cli-table3: "^0.6.5 (runtime, bundles own types)"
    - "@types/cli-progress": "^3.11.6 (dev)"
  patterns:
    - formatJsonOutput with applyCliTerms() on error path (T-03-01 mitigation)
    - fetchAllPages generic auto-pagination loop with total_count guard
    - resolveUrl for relative-to-absolute URL normalization (CLI-07)
key_files:
  created:
    - packages/twentythree-cli/src/lib/output.ts
    - packages/twentythree-cli/src/lib/pagination.ts
    - packages/twentythree-cli/src/upload/types.ts
    - packages/twentythree-cli/src/commands/video/index.ts
    - packages/twentythree-cli/src/commands/video/section/index.ts
    - packages/twentythree-cli/src/commands/video/subtitle/index.ts
    - packages/twentythree-cli/src/lib/__tests__/output.test.ts
    - packages/twentythree-cli/src/lib/__tests__/pagination.test.ts
  modified:
    - packages/twentythree-cli/package.json
    - pnpm-lock.yaml
decisions:
  - "@types/cli-table3 does not exist on npm — cli-table3 bundles its own index.d.ts; only @types/cli-progress needed as dev dep"
  - "formatBytes uses toFixed(1) + Number() conversion to handle integer MB/GB values (300 MB not 3 MB) — toPrecision() strips significant digits incorrectly"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-04-14T12:38:55Z"
  tasks_completed: 2
  files_created: 8
  files_modified: 2
---

# Phase 03 Plan 01: Foundation Helpers and Type Contracts Summary

**One-liner:** CLI output/pagination helpers, formatBytes/resolveUrl utilities, chunked upload type contracts, and oclif video namespace stubs with 125 passing tests.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Install dependencies and create output + pagination helpers | b498f12 | output.ts, pagination.ts, output.test.ts, pagination.test.ts, package.json, pnpm-lock.yaml |
| 2 | Create upload engine type contracts and oclif topic stubs | 659bd42 | upload/types.ts, commands/video/index.ts, section/index.ts, subtitle/index.ts |

## What Was Built

### `src/lib/output.ts`

Exports:
- `EXIT_SUCCESS = 0`, `EXIT_ERROR = 1`, `EXIT_CANCELLED = 2` — exit code constants (CLI-03)
- `formatJsonOutput({ ok?, data, summary, breadcrumbs })` — returns `{ ok, data, summary, breadcrumbs }` CLI-01 shape. Applies `applyCliTerms()` to error summaries only (T-03-01 mitigation — prevents "photo"/"album" leaking to users)
- `renderTable(headers, rows)` — creates a `cli-table3` Table with cyan headers
- `formatBytes(bytes)` — human-readable byte strings (e.g. "1.5 GB", "300 MB", "45 KB")
- `resolveUrl(url, baseUrl)` — resolves relative URLs to absolute using workspace domain (CLI-07); undefined/empty/already-absolute pass through unchanged

### `src/lib/pagination.ts`

Exports:
- `fetchAllPages<T>(fetchPage)` — generic auto-pagination loop. Fetches page 1 with size=100, accumulates results, stops when `items.length >= total_count` or an empty page is returned (CLI-02)

### `src/upload/types.ts`

Exports:
- `ChunkedUploadParams` — file path, upload token, URL, optional chunk size/concurrency/retries/progress callback
- `ChunkedUploadResult` — photo_id, tree_id, token from API response
- `ChunkDescriptor` — chunk number (1-indexed), start/end byte offsets, size
- `DEFAULT_CHUNK_SIZE = 100 * 1024 * 1024`, `DEFAULT_CONCURRENCY = 5`, `DEFAULT_MAX_RETRIES = 5`

### Oclif Topic Stubs

Three oclif v4 topic files registering the video command namespace:
- `src/commands/video/index.ts` — "Manage videos — upload, list, update, delete, and more"
- `src/commands/video/section/index.ts` — "Manage video sections (chapters)"
- `src/commands/video/subtitle/index.ts` — "Manage video subtitles and captions"

## Verification

- 125 tests pass across 13 test files
- Build succeeds with 19 output files and updated oclif manifest
- All acceptance criteria met

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed formatBytes precision stripping 300 MB to 3 MB**
- **Found during:** Task 1 (GREEN phase — test failure)
- **Issue:** `toPrecision(3)` followed by `.replace(/\.?0+$/, '')` incorrectly stripped trailing zeros from integers (e.g., `"300"` → `"3"`)
- **Fix:** Replaced with `toFixed(1)` + `Number()` conversion, which correctly preserves integer values and removes only the `.0` decimal suffix
- **Files modified:** `packages/twentythree-cli/src/lib/output.ts`
- **Commit:** b498f12

**2. [Rule 3 - Blocking issue] @types/cli-table3 does not exist on npm**
- **Found during:** Task 1 — `pnpm add -D @types/cli-table3` returned 404
- **Fix:** cli-table3 bundles its own `index.d.ts`; skipped this dev dep. Only `@types/cli-progress` was installed as dev dep.
- **Impact:** No functional change — types are fully covered

## Known Stubs

None — no placeholder data or hardcoded empty values introduced. All helper functions are fully implemented.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. The `T-03-01` threat (information disclosure via error messages) is mitigated in `formatJsonOutput` by applying `applyCliTerms()` to error summaries.

## Self-Check: PASSED

Files verified:
- FOUND: packages/twentythree-cli/src/lib/output.ts
- FOUND: packages/twentythree-cli/src/lib/pagination.ts
- FOUND: packages/twentythree-cli/src/upload/types.ts
- FOUND: packages/twentythree-cli/src/commands/video/index.ts
- FOUND: packages/twentythree-cli/src/commands/video/section/index.ts
- FOUND: packages/twentythree-cli/src/commands/video/subtitle/index.ts

Commits verified:
- FOUND: b498f12
- FOUND: 659bd42
