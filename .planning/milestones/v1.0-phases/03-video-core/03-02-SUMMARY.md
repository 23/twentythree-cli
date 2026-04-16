---
phase: 03-video-core
plan: "02"
subsystem: upload-engine
tags: [chunked-upload, resumable-js, concurrency, retry, tdd]
dependency_graph:
  requires:
    - packages/twentythree-cli/src/upload/types.ts
  provides:
    - packages/twentythree-cli/src/upload/chunk-pool.ts
    - packages/twentythree-cli/src/upload/chunked-upload.ts
  affects:
    - packages/twentythree-cli/src/commands/video/ (future video upload commands consume uploadChunked)
tech_stack:
  added: []
  patterns:
    - "Windowed concurrency: chunks processed in Promise.all windows of size=concurrency"
    - "Exponential backoff: min(1000 * 2^attempt, 30000)ms with injectable delayFn for tests"
    - "In-memory resume: Set<number> tracks completed chunk numbers within invocation"
    - "Native fetch() for chunk POSTs — not openapi-fetch (multipart/FormData upload pattern)"
    - "T-03-02 mitigation: uploadUrl validated as https:// before first request"
    - "T-03-03 mitigation: upload_token never logged; onProgress reports byte counts only"
key_files:
  created:
    - packages/twentythree-cli/src/upload/chunk-pool.ts
    - packages/twentythree-cli/src/upload/chunked-upload.ts
    - packages/twentythree-cli/src/upload/__tests__/chunk-pool.test.ts
    - packages/twentythree-cli/src/upload/__tests__/chunked-upload.test.ts
  modified: []
decisions:
  - "delayFn injectable in uploadChunkPool for deterministic test timing — avoids real setTimeout delays in test suite"
  - "uploadUrl https:// validation added (T-03-02) — not in plan tasks but required by threat model mitigation disposition"
  - "Network errors in uploadFn return status 0 to trigger retry path — consistent with non-2xx handling"
metrics:
  duration: "~3 minutes"
  completed_date: "2026-04-14T12:44:00Z"
  tasks_completed: 2
  files_created: 4
  files_modified: 0
---

# Phase 03 Plan 02: Chunked Upload Engine Summary

**One-liner:** Concurrent chunked upload engine implementing the TwentyThree resumable.js protocol with windowed concurrency, exponential backoff retry, in-memory skip tracking, HTTPS enforcement, and progress callbacks.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Build chunk-pool module with concurrent upload and retry | 0970729 | chunk-pool.ts, __tests__/chunk-pool.test.ts |
| 2 | Build chunked-upload module (file splitting + pool orchestration) | e406255 | chunked-upload.ts, __tests__/chunked-upload.test.ts |

## What Was Built

### `src/upload/chunk-pool.ts`

Exports:
- `uploadChunkPool(params: ChunkPoolParams): Promise<ChunkPoolResult>` — processes chunks in concurrency windows using `Promise.all`. Each failed chunk (non-200, non-500) retries up to `maxRetries` times with exponential backoff (`min(1000 * 2^attempt, 30000)ms`). A 500 response immediately throws `"Unsupported file format — upload aborted"`. A `Set<number>` tracks completed chunk numbers for in-memory skip (UPL-06). `onChunkComplete` callback fires after each successful 200 response. `delayFn` is injectable for deterministic test execution without real timer delays.

Interfaces exported:
- `ChunkUploadResponse` — `{ status: number, data?: { photo_id?, tree_id?, token? } }`
- `ChunkPoolParams` — chunks, uploadFn, concurrency, maxRetries, optional callbacks and injectors
- `ChunkPoolResult` — `{ completedChunks: number, finalResponse?: data }`

### `src/upload/chunked-upload.ts`

Exports:
- `uploadChunked(params: ChunkedUploadParams): Promise<ChunkedUploadResult>` — full chunked upload orchestrator:
  1. Validates `uploadUrl` starts with `https://` (T-03-02 mitigation)
  2. Calls `fs.stat()` to get file size; throws `"File not found: {path}"` on ENOENT
  3. Computes `Math.ceil(totalSize / chunkSize)` chunk descriptors with 1-indexed `number`, correct `start`/`end`/`size`
  4. Generates `resumableIdentifier = "${totalSize}-${filename}-${Date.now()}"`
  5. Each chunk: reads file slice via `createReadStream`, builds `FormData` with all resumable.js fields (`upload_token`, `file` as Blob, `resumableChunkNumber`, `resumableChunkSize`, `resumableTotalSize`, `resumableIdentifier`, `resumableFilename`, `resumableTotalChunks`), POSTs via native `fetch()`
  6. `onChunkComplete` accumulates `bytesUploaded` and fires `params.onProgress?.(bytesUploaded, totalSize)`
  7. Delegates concurrency/retry to `uploadChunkPool`; returns `finalResponse` as `ChunkedUploadResult`

## Verification

- 145 tests pass across 15 test files (10 new chunk-pool tests + 9 new chunked-upload tests)
- Build succeeds: 21 output files including `dist/upload/chunk-pool.cjs` and `dist/upload/chunked-upload.cjs`
- No imports of chalk, ora, cli-progress in either upload module (display-agnostic)
- `grep -c "resumable" packages/twentythree-cli/src/upload/chunked-upload.ts` returns 8 matches

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Added https:// URL validation (T-03-02)**
- **Found during:** Task 2 implementation — plan task text did not include URL validation but threat model assigns T-03-02 as `mitigate` disposition on `chunked-upload.ts`
- **Fix:** Added `if (!uploadUrl.startsWith('https://'))` guard at top of `uploadChunked` before any file I/O or network calls
- **Files modified:** `packages/twentythree-cli/src/upload/chunked-upload.ts`
- **Test added:** `validates uploadUrl must be https (T-03-02 threat mitigation)` in chunked-upload.test.ts
- **Commit:** e406255

**2. [Rule 1 - Bug] Test timeouts on retry tests without delayFn injection**
- **Found during:** Task 1 GREEN phase — test using real `setTimeout` backoff delays exceeded 5s vitest timeout
- **Fix:** Added `delayFn` injectable parameter to `uploadChunkPool`; updated retry tests to inject `vi.fn().mockResolvedValue(undefined)` instead of relying on real timers. `delayFn` defaults to real `setTimeout` in production.
- **Files modified:** `packages/twentythree-cli/src/upload/chunk-pool.ts`, `__tests__/chunk-pool.test.ts`
- **Commit:** 0970729

## Known Stubs

None — both modules are fully implemented with no placeholder data or hardcoded empty values.

## Threat Surface Scan

The threat model for this plan is fully addressed:

| Threat | Mitigation | Status |
|--------|-----------|--------|
| T-03-02 (Tampering — insecure upload URL) | `uploadUrl` validated as `https://` before first request | Implemented + tested |
| T-03-03 (Info Disclosure — token logging) | `upload_token` only appears in FormData, never in log/progress | Implemented + tested |
| T-03-04 (DoS — retry storms) | Exponential backoff with 30s cap; 500 abort stops infinite retry | Implemented + tested |
| T-03-05 (Spoofing — token validity) | Accepted (server-enforced) | No action needed |

No new network endpoints, auth paths, file access patterns, or schema changes outside the plan's defined boundaries were introduced.

## Self-Check: PASSED

Files verified:
- FOUND: packages/twentythree-cli/src/upload/chunk-pool.ts
- FOUND: packages/twentythree-cli/src/upload/chunked-upload.ts
- FOUND: packages/twentythree-cli/src/upload/__tests__/chunk-pool.test.ts
- FOUND: packages/twentythree-cli/src/upload/__tests__/chunked-upload.test.ts

Commits verified:
- FOUND: 0970729
- FOUND: e406255
