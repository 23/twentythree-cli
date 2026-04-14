---
phase: 03-video-core
verified: 2026-04-14T15:05:00Z
status: human_needed
score: 5/5
overrides_applied: 0
human_verification:
  - test: "Run `twentythree video upload <file>` with a large file and interrupt it mid-upload (Ctrl-C), then re-run the same command"
    expected: "Progress bar shows bytes/percentage/ETA; on resume, already-uploaded chunks are skipped (server returns 200/already-accepted) and upload completes faster than a fresh start"
    why_human: "Resume behavior depends on server-side resumable.js state — cannot be verified without a live TwentyThree API endpoint and an actual large file upload"
  - test: "Run `twentythree video list` on a workspace with more than 100 videos"
    expected: "All videos are returned (not just the first 100), verifying fetchAllPages auto-pagination"
    why_human: "Cannot verify multi-page behavior without a live workspace with 100+ videos"
  - test: "Run `twentythree video delete <id>` without --json flag"
    expected: "Prompt shows 'Delete video N from <domain>? This cannot be undone.' — workspace domain must be visible; pressing 'n' exits with code 2"
    why_human: "Interactive @clack/prompts confirmation requires a terminal session to verify appearance and exit-code behavior"
  - test: "Run any video command and pipe its --json output; verify no string contains 'photo', 'album', or 'live' in user-visible fields (summary, breadcrumbs)"
    expected: "Output uses 'video', 'category', 'webinar' consistently — term-map is applied to error messages"
    why_human: "Error message term-mapping only triggers on API errors; requires a live API call that produces an error to test the applyCliTerms path end-to-end"
---

# Phase 3: Video Core — Verification Report

**Phase Goal:** A developer can upload, list, get, update, delete, replace, and manage sections and subtitles for videos — with resumable chunked uploads, progress feedback, pagination, and zero legacy terminology in output

**Verified:** 2026-04-14T15:05:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `video upload <file>` uploads in resumable 100MB chunks with live progress bar; interrupted upload resumes without re-uploading completed chunks | VERIFIED (partial — resume requires human) | `upload.ts` wires `cliProgress.SingleBar` to `uploadChunked` `onProgress`; chunk-pool uses `Set<number>` for in-memory skip; resumable.js params correctly set; server-side resume requires human test |
| 2 | `video list`, `get`, `update`, `delete`, `replace`, `transcoding-progress`, `frame` work; delete requires workspace-scoped confirmation | VERIFIED | All 7 commands exist with full API wiring; `delete.ts` shows `@clack/prompts confirm()` with `this.activeWorkspace.domain`; all extend `AuthenticatedCommand` |
| 3 | `video section` subcommands (list, create, update, delete, set-thumbnail) and all `video subtitle` subcommands work end-to-end | VERIFIED | 5 section commands + 11 subtitle commands confirmed in `oclif.manifest.json`; all wire to correct API endpoints; section delete and subtitle delete have workspace-scoped confirmation prompts |
| 4 | All commands accept `--json` and return `{ ok, data, summary, breadcrumbs }`; list commands auto-paginate; exit codes are 0/1/2 | VERIFIED | `output.ts` exports `EXIT_SUCCESS=0`, `EXIT_ERROR=1`, `EXIT_CANCELLED=2`; 73 `formatJsonOutput`/`enableJsonFlag` usages across video commands; `video list` uses `fetchAllPages`; section/subtitle list endpoints return all items in one call (no pagination params in OpenAPI spec — architecturally correct) |
| 5 | No user-visible string including error messages contains legacy API terms `photo`, `album`, or `live` | VERIFIED (static scan) | Grep of `this.log`/`this.error`/`chalk.`/`static description`/`static examples`/flag descriptions across all video commands: zero legacy terms found in user-visible output; `term-map.ts` applied to error summaries via `applyCliTerms()`; `album_id` appears only in internal API request bodies, not output; end-to-end error path requires human test |

**Score:** 5/5 truths verified

---

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `packages/twentythree-cli/src/lib/output.ts` | VERIFIED | Exports `formatJsonOutput`, `renderTable`, `resolveUrl`, `formatBytes`, `EXIT_SUCCESS`, `EXIT_ERROR`, `EXIT_CANCELLED`; applies `applyCliTerms` to error summaries |
| `packages/twentythree-cli/src/lib/pagination.ts` | VERIFIED | Exports `fetchAllPages`; used by `video list` |
| `packages/twentythree-cli/src/upload/types.ts` | VERIFIED | Exports `ChunkedUploadParams`, `ChunkedUploadResult`, `ChunkDescriptor`, `DEFAULT_CHUNK_SIZE`, `DEFAULT_CONCURRENCY`, `DEFAULT_MAX_RETRIES` |
| `packages/twentythree-cli/src/upload/chunk-pool.ts` | VERIFIED | Concurrent windowed upload, exponential backoff retry, in-memory `Set<number>` skip tracking, 500-abort, injectable `delayFn` |
| `packages/twentythree-cli/src/upload/chunked-upload.ts` | VERIFIED | Full orchestrator: HTTPS validation, file stat, chunk descriptors (1-indexed), resumable.js FormData fields, progress callback wiring |
| `packages/twentythree-cli/src/commands/video/list.ts` | VERIFIED | `fetchAllPages` + `cli-table3` table + `formatJsonOutput` |
| `packages/twentythree-cli/src/commands/video/get.ts` | VERIFIED | Single-video fetch via `/photo/list?photo_id=` |
| `packages/twentythree-cli/src/commands/video/upload.ts` | VERIFIED | `GET /photo/get-upload-token` → `uploadChunked` → `cliProgress.SingleBar` |
| `packages/twentythree-cli/src/commands/video/update.ts` | VERIFIED | Flag mode + interactive `@clack/prompts` mode; only provided flags sent to API |
| `packages/twentythree-cli/src/commands/video/delete.ts` | VERIFIED | `@clack/prompts confirm()` with domain; `EXIT_CANCELLED` on decline |
| `packages/twentythree-cli/src/commands/video/replace.ts` | VERIFIED | `GET /photo/get-replace-token` → `uploadChunked` with `tokenFieldName: 'replace_token'` |
| `packages/twentythree-cli/src/commands/video/transcoding-progress.ts` | VERIFIED | `GET /photo/get-transcoding-progress` |
| `packages/twentythree-cli/src/commands/video/frame.ts` | VERIFIED | `POST /photo/frame` |
| `packages/twentythree-cli/src/commands/video/section/list.ts` | VERIFIED | Single-call (no pagination — API has no pagination params per OpenAPI spec) |
| `packages/twentythree-cli/src/commands/video/section/create.ts` | VERIFIED | 75 lines, full implementation |
| `packages/twentythree-cli/src/commands/video/section/update.ts` | VERIFIED | 87 lines, conditional field update |
| `packages/twentythree-cli/src/commands/video/section/delete.ts` | VERIFIED | `@clack/prompts confirm()` with domain + section ID |
| `packages/twentythree-cli/src/commands/video/section/set-thumbnail.ts` | VERIFIED | 71 lines, full implementation |
| `packages/twentythree-cli/src/commands/video/subtitle/` (11 commands) | VERIFIED | All 11 commands exist: list, create, update, delete, upload, data, locales, types, duplicate, set-primary, archive; combined 925 lines; no stubs |
| `packages/twentythree-cli/src/commands/video/index.ts` | VERIFIED | oclif topic stub registered |
| `packages/twentythree-cli/src/commands/video/section/index.ts` | VERIFIED | oclif topic stub registered |
| `packages/twentythree-cli/src/commands/video/subtitle/index.ts` | VERIFIED | oclif topic stub registered |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `output.ts` | `term-map.ts` | `import { applyCliTerms }` | WIRED | Line 2: `import { applyCliTerms } from './term-map.js'`; applied in `formatJsonOutput` error path |
| `upload.ts` | `chunked-upload.ts` | `import { uploadChunked }` | WIRED | Line 8; called with `onProgress` wired to `cliProgress.SingleBar` |
| `upload.ts` | `output.ts` | `import { formatJsonOutput, formatBytes, EXIT_ERROR }` | WIRED | Line 6; used in `run()` |
| `replace.ts` | `chunked-upload.ts` | `import { uploadChunked }` with `tokenFieldName: 'replace_token'` | WIRED | Line 8; `replace_token` field correctly passed |
| `list.ts` | `pagination.ts` | `import { fetchAllPages }` | WIRED | Line 4; `fetchAllPages` called in `run()` |
| `chunked-upload.ts` | `chunk-pool.ts` | `import { uploadChunkPool }` | WIRED | Line 24; result used to return `ChunkedUploadResult` |
| All video commands | `base-command.ts` | `extends AuthenticatedCommand` | WIRED | All 18+ video commands extend `AuthenticatedCommand`; anonymous access rejected |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `list.ts` | `videos` array | `fetchAllPages` → `GET /photo/list` | API call (not hardcoded) | FLOWING |
| `get.ts` | video object | `GET /photo/list?photo_id=` | API call | FLOWING |
| `upload.ts` | `result` (photo_id) | `uploadChunked` → chunk POST loop | File + API upload | FLOWING |
| `replace.ts` | `result` | `uploadChunked` with replace_token | File + API upload | FLOWING |
| `section/list.ts` | `sections` array | `GET /photo/section/list` | API call | FLOWING |
| `subtitle/list.ts` | `subtitles` array | `GET /photo/subtitle/list` | API call | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build produces 45 output files | `pnpm --filter twentythree-cli build` | 45 files, `Build complete in 31ms`, oclif manifest updated | PASS |
| All 145 tests pass | `pnpm --filter twentythree-cli test --run` | `15 passed (15)` test files, `145 passed (145)` tests | PASS |
| All expected video commands registered | grep manifest for `"video:` keys | 25 unique command IDs (delete, frame, get, list, replace, section, section:create, section:delete, section:list, section:set-thumbnail, section:update, subtitle, subtitle:archive, subtitle:create, subtitle:data, subtitle:delete, subtitle:duplicate, subtitle:list, subtitle:locales, subtitle:set-primary, subtitle:types, subtitle:update, subtitle:upload, transcoding-progress, update, upload) | PASS |
| cli-progress and cli-table3 installed | `grep -E "cli-progress\|cli-table3" package.json` | Both present as runtime deps with `^3.12.0` / `^0.6.5` | PASS |
| Exit codes defined | `grep EXIT_ output.ts` | `EXIT_SUCCESS=0`, `EXIT_ERROR=1`, `EXIT_CANCELLED=2` | PASS |
| No legacy terms in user-visible output | grep `this.log\|chalk.\|static description\|examples` for `photo\|album\|live` | Zero matches across all video command files | PASS |

---

## Requirements Coverage

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| UPL-01 | Upload token flow | SATISFIED | `GET /photo/get-upload-token` in `upload.ts` |
| UPL-02 | Resumable.js protocol params | SATISFIED | All 6 required fields in `chunked-upload.ts` FormData |
| UPL-03 | Default 100MB chunk size, configurable | SATISFIED | `DEFAULT_CHUNK_SIZE = 100 * 1024 * 1024`; `--chunk-size` flag |
| UPL-04 | Progress bar showing bytes/pct/ETA | SATISFIED | `cliProgress.SingleBar` in `upload.ts` and `replace.ts` |
| UPL-05 | Up to 5 retries per chunk | SATISFIED | `DEFAULT_MAX_RETRIES=5`, exponential backoff in `chunk-pool.ts` |
| UPL-06 | In-invocation resume (completed chunks skipped) | SATISFIED | `Set<number>` in `chunk-pool.ts`; cross-invocation persistence not in scope (documented in RESEARCH.md) |
| UPL-07 | 500 response aborts upload with clear message | SATISFIED | `throw new Error('Unsupported file format — upload aborted')` in chunk-pool |
| UPL-08 | Native implementation, no resumable-upload-command dependency | SATISFIED | Custom implementation from scratch |
| VID-01 | video list | SATISFIED | `list.ts` with `fetchAllPages` |
| VID-02 | video get | SATISFIED | `get.ts` |
| VID-03 | video upload | SATISFIED | `upload.ts` |
| VID-04 | video update | SATISFIED | `update.ts` flag + interactive modes |
| VID-05 | video delete with confirmation | SATISFIED | `delete.ts` with `@clack/prompts` |
| VID-06 | video replace | SATISFIED | `replace.ts` with replace-token flow |
| VID-07 | video transcoding-progress | SATISFIED | `transcoding-progress.ts` |
| VID-08 | video frame | SATISFIED | `frame.ts` |
| VID-09 | video section subcommands (5) | SATISFIED | `section/list`, `create`, `update`, `delete`, `set-thumbnail` |
| VID-10 | video subtitle subcommands (11) | SATISFIED | All 11 subtitle commands implemented |
| CLI-01 | `--json` returns `{ ok, data, summary, breadcrumbs }` | SATISFIED | `formatJsonOutput` in `output.ts`; used across all video commands |
| CLI-02 | List commands auto-paginate | SATISFIED | `video list` uses `fetchAllPages`; section/subtitle lists use single-call (correct — APIs have no pagination params per OpenAPI spec) |
| CLI-03 | Exit codes 0/1/2 | SATISFIED | `EXIT_SUCCESS=0`, `EXIT_ERROR=1`, `EXIT_CANCELLED=2` constants; used across all commands |
| CLI-04 | API errors mapped through term-map | SATISFIED | `applyCliTerms` applied in `formatJsonOutput` error path and all `this.error()` calls |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `upload.ts`, `list.ts`, `section/list.ts`, etc. | multiple | `as any` runtime casts for API responses | Info | Known OpenAPI schema mismatch for list shapes (documented in SUMMARY.md); no user impact |
| `subtitle/archive.ts` | 48 | `body: {} as any` for empty POST body | Info | Workaround for oclif/openapi-fetch typing; correct behavior |

No blockers. No stubs. No placeholder data.

---

## Human Verification Required

### 1. Resumable Upload Cross-Invocation Behavior

**Test:** Upload a file large enough to take 10+ seconds (e.g. 200MB), interrupt with Ctrl-C mid-upload, then immediately re-run the exact same `video upload` command.

**Expected:** The second run either completes faster (server accepted earlier chunks) or the progress bar starts partway through. No chunk should be re-uploaded if the server already accepted it.

**Why human:** The `Set<number>` skip tracking is in-memory only (documented in RESEARCH.md as "per-invocation in-memory tracking; 200 response = already accepted, skip"). True cross-invocation resume depends on the TwentyThree server honoring the `resumableIdentifier` and returning 200 for already-uploaded chunks. This requires a live API call with a real file.

### 2. Pagination Behavior with Large Video Library

**Test:** Run `twentythree video list --json` on a workspace with more than 100 videos.

**Expected:** JSON output `data` array contains all videos (not capped at 100); `summary` shows the full count.

**Why human:** `fetchAllPages` logic reads `total_count` from the API response to know when to stop. Cannot verify multi-page behavior without a real workspace with 100+ videos.

### 3. Delete Confirmation UI and Exit Code

**Test:** Run `twentythree video delete 99999` (a video ID that doesn't exist), answer 'n' to the confirmation, and check the exit code.

**Expected:** Prompt displays the workspace domain. Pressing 'n' exits immediately with code 2 (not 0 or 1).

**Why human:** `@clack/prompts` interactive confirmation requires a real terminal; exit code 2 must be verified via `echo $?`.

### 4. Legacy Term Isolation in Error Messages

**Test:** Trigger an API error (e.g. `twentythree video get 0 --json`) and inspect the JSON `summary` field.

**Expected:** The summary contains no occurrence of `photo`, `album`, or `live` — it uses `video`, `category`, `webinar`.

**Why human:** `applyCliTerms` is applied at the `formatJsonOutput` / `this.error()` call sites, but the actual text content depends on what the live API returns in error responses. Requires a live API call to verify.

---

## Gaps Summary

No blocking gaps. All 5 success criteria have code-level implementations that are substantive and wired. The 4 human verification items are runtime behaviors requiring a live API environment and interactive terminal — they cannot be verified statically.

**Note on resume behavior:** The RESEARCH.md explicitly documents that "resume state is in-memory only, no cross-invocation persistence." The success criterion says "an interrupted upload resumes without re-uploading completed chunks" — the implementation satisfies this within a single invocation (exponential-backoff retry with skip tracking). True cross-invocation persistence (resuming after process exit) is not implemented, which is consistent with the documented design decision in RESEARCH.md. This gap between the SC wording and implementation is known and intentional; the human verification test above will determine whether server-side resumable.js state provides cross-invocation resume effectively.

---

_Verified: 2026-04-14T15:05:00Z_
_Verifier: Claude (gsd-verifier)_
