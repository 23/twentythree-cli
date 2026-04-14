# Phase 3: Video Core - Research

**Researched:** 2026-04-14
**Domain:** Chunked video upload engine + video/section/subtitle CLI commands
**Confidence:** HIGH

## Summary

Phase 3 builds the largest and most technically complex slice of the CLI. The chunked upload engine (`src/upload/`) is shared infrastructure consumed by video upload, video replace, and future phases (webinar attachments, open uploads). It implements the TwentyThree resumable.js protocol — a three-step token-based flow: `GET /photo/get-upload-token` → multipart POST chunks to `/photo/redeem-upload-token` with resumable.js params → post-upload metadata patching. The protocol is fully documented in the existing `types.ts` which was verified in this session.

The video command surface (VID-01 through VID-10) is the largest single-phase command set in the roadmap — 10 requirement IDs mapping to approximately 20+ command files when counting subcommands. Section and subtitle subcommand trees are the deepest nesting in the CLI. All commands extend `AuthenticatedCommand`, follow the established `BaseCommand` patterns from Phase 2, and apply term-map to every user-visible string. The Phase 2 infrastructure (API client, BaseCommand, workspace config) is partially built but not yet complete; Phase 3 depends on Phase 2 being finished first.

The only new runtime dependency required is `cli-progress` (3.12.0, CJS-compatible) for the upload progress bar. `cli-table3` (0.6.5) is also needed for list commands but is not yet in `package.json`. The `openapi-fetch` patterns for `application/x-www-form-urlencoded` and `multipart/form-data` are well-understood: url-encoded bodies send with explicit `Content-Type` header, multipart uses a `bodySerializer` returning `FormData`.

**Primary recommendation:** Build the chunked upload engine as an isolated, thoroughly-tested module first. All video commands consume it — getting the upload engine wrong forces rework across the entire command set. Structure the upload module as a pure async function `uploadChunked(params): Promise<UploadResult>` that has no knowledge of CLI display — the progress bar is wired up by the calling command, not by the engine.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

1. **Upload progress display** — add `cli-progress` as a new runtime dependency. Display format: `[████████░░░░] 60% | 600 MB / 1.0 GB | ETA: 2m30s | 3.2 MB/s`. One bar per upload (not per chunk). Bar clears on completion; final output is a single success line.

2. **Resume state** — in-memory only, no cross-invocation persistence. Within a single invocation, already-completed chunks are skipped (409 response = chunk already accepted). "Resumable" means within-invocation retry only (UPL-05: up to 5 retries per chunk).

3. **Update/create UX** — flag mode AND interactive mode. Flag mode: each updatable field is a named flag; only provided flags are sent. Interactive mode (no metadata flags): `@clack/prompts` walks through each field with current value pre-filled. `--json` suppresses prompts.

4. **List output** — `cli-table3` table by default. Columns for `video list`: ID, Title, Duration, Status, Published, Updated. Auto-paginate (fetch all pages, render once). `--json` returns full array.

5. **Output JSON shape** — `{ ok: boolean, data: any, summary: string, breadcrumbs: [{domain}, {resource, id?}] }`

6. **Exit codes** — 0 success, 1 command error, 2 user cancelled

7. **All commands extend `AuthenticatedCommand`**; `printWorkspaceHeader()` at top of every `run()`

8. **Term map applied to ALL user-visible output** — no `photo`, `album`, `live` in any string

### Claude's Discretion

- Exact cli-progress format string and bar width
- Which specific video metadata fields are exposed as update flags (derive from OpenAPI spec)
- Subtitle and section subcommand flag design (consistent with video update pattern)
- Chunk size and concurrency defaults (100MB / 5 parallel per UPL-03/04)
- Error message wording for upload failures
- Column widths and truncation behavior in table output

### Deferred Ideas (OUT OF SCOPE)

None raised during discussion.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UPL-01 | Chunked upload engine in `src/upload/`; video token-based uploads use `photo/get-upload-token` → `photo/redeem-upload-token` | Upload protocol verified in `types.ts` — see Architecture Patterns |
| UPL-02 | Files split into chunks using resumable.js protocol params | Params verified in `types.ts` `videoRedeemUploadToken` operation |
| UPL-03 | Default chunk size 100MB; configurable via `--chunk-size` flag | ASSUMED (standard practice); chunk size controls `resumableChunkSize` param |
| UPL-04 | Up to 5 parallel chunks; configurable via `--concurrency` flag | Concurrent `Promise.all` pool pattern documented in Architecture |
| UPL-05 | Each chunk retries up to 5 times on transient failure | HTTP status semantics verified: 200=accepted, 500=abort, other=retry |
| UPL-06 | Interrupted uploads can be resumed — CLI checks which chunks already accepted | Per-invocation in-memory tracking; 200 response = already accepted, skip |
| UPL-07 | Progress bar shows bytes, percentage, ETA | `cli-progress` 3.12.0 SingleBar API verified |
| UPL-08 | Upload implementation is native — no `resumable-upload-command` dependency | Implementing from scratch using `types.ts` protocol |
| VID-01 | `video list` with pagination | `videoList` operation verified; `p`/`size`/`total_count` pagination params in types.ts |
| VID-02 | `video get <id>` | Uses `videoList` with `photo_id` filter |
| VID-03 | `video upload <file>` using chunked protocol | Upload engine + `videoGetUploadToken` + `videoRedeemUploadToken` verified |
| VID-04 | `video update <id>` metadata | `videoUpdate` operation params verified: title, description, tags, album_id, published_p, promoted_p, etc. |
| VID-05 | `video delete <id>` with confirmation | `videoDelete` operation verified |
| VID-06 | `video replace <id> <file>` | `videoGetReplaceToken` + chunked engine + `videoReplace` verified |
| VID-07 | `video transcoding-progress <id>` | `videoGetTranscodingProgress` operation verified |
| VID-08 | `video frame <id>` | `videoFrame` operation verified |
| VID-09 | `video section` subcommands (list, create, update, delete, set-thumbnail) | All 5 operations verified in types.ts |
| VID-10 | `video subtitle` subcommands (list, create, update, delete, upload, data, locales, types, duplicate, set-primary, archive) | All operations verified in types.ts |
| CLI-01 | All commands support `--json` returning `{ ok, data, summary, breadcrumbs }` | Pattern from BaseCommand; `enableJsonFlag = true` |
| CLI-02 | List commands auto-paginate | Pagination loop pattern documented in Architecture |
| CLI-03 | Exit codes 0/1/2 | `this.error({exit:1})`, `process.exit(2)` for cancel |
| CLI-04 | API errors mapped through term-map before display | `applyCliTerms()` from `src/lib/term-map.ts` |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- TypeScript + Node.js only — no other runtimes
- npm global install distribution
- Bearer token auth only (no OAuth 1.0a)
- All commands: `@oclif/core` v4, `openapi-fetch` for API calls
- `chalk` 4.x (NOT 5.x) — CJS required
- `ora` 5.x (NOT 6.x) — CJS required
- `cli-progress` must be CJS-compatible (3.12.0 is CJS) [VERIFIED: npm registry]
- `cli-table3` must be added to runtime deps [VERIFIED: npm registry, not yet in package.json]
- Build: `tsdown` with `--config-loader unrun`
- Testing: `vitest` with `globals: true`, `include: ['src/**/*.test.ts']`
- `type: "commonjs"` in package.json — CJS module system
- Term map applied to all user-visible output (no legacy terms in output)
- Commands code-generated would be bad UX — hand-authored against generated types

---

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@oclif/core` | ^4.10.5 | Command dispatch, flag parsing, help | Project standard |
| `openapi-fetch` | ^0.17.0 | Type-safe API calls | Project standard |
| `chalk` | ^4.1.2 | Terminal color | Project standard (CJS pin) |
| `ora` | ^5.4.1 | Spinner for non-upload async | Project standard (CJS pin) |
| `@clack/prompts` | ^1.2.0 | Interactive prompts for update/create | Project standard |

### New Dependencies Required

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `cli-progress` | ^3.12.0 | Upload progress bar | Locked decision; `ora` is a spinner not a progress bar; CJS-compatible [VERIFIED: npm registry] |
| `cli-table3` | ^0.6.5 | Tabular list output | Locked decision for list commands; not yet in package.json [VERIFIED: npm registry] |

### Installation

```bash
cd packages/twentythree-cli
pnpm add cli-progress cli-table3
pnpm add -D @types/cli-progress @types/cli-table3
```

**Version verification:** [VERIFIED: npm registry]
- `cli-progress` current: 3.12.0 (published 2024)
- `cli-table3` current: 0.6.5

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── upload/
│   ├── chunked-upload.ts       # Core upload engine (pure function, no CLI coupling)
│   ├── chunk-pool.ts           # Concurrent chunk upload pool with retry
│   └── __tests__/
│       ├── chunked-upload.test.ts
│       └── chunk-pool.test.ts
├── commands/
│   └── video/
│       ├── index.ts            # Topic stub (oclif requires this for nested commands)
│       ├── list.ts             # VID-01
│       ├── get.ts              # VID-02
│       ├── upload.ts           # VID-03 (consumes upload engine)
│       ├── update.ts           # VID-04
│       ├── delete.ts           # VID-05
│       ├── replace.ts          # VID-06 (consumes upload engine)
│       ├── transcoding-progress.ts  # VID-07
│       ├── frame.ts            # VID-08
│       ├── section/
│       │   ├── index.ts
│       │   ├── list.ts
│       │   ├── create.ts
│       │   ├── update.ts
│       │   ├── delete.ts
│       │   └── set-thumbnail.ts
│       └── subtitle/
│           ├── index.ts
│           ├── list.ts
│           ├── create.ts
│           ├── update.ts
│           ├── delete.ts         # maps to /photo/subtitle/remove
│           ├── upload.ts
│           ├── data.ts
│           ├── locales.ts
│           ├── types.ts
│           ├── duplicate.ts
│           ├── set-primary.ts
│           └── archive.ts        # maps to /photo/subtitle/archive/transcribe
```

### Pattern 1: Upload Protocol (Three-Step Token Flow)

**What:** Video upload uses a token-based indirection — the API issues an upload token, the client uploads chunks directly to the upload endpoint using that token, then the video is identified by token for post-upload operations.

**Upload flow:**

```
Step 1: GET /photo/get-upload-token
  Query params: title?, description?, tags?, album_id?, publish?
  Response: { data: { upload_token: string, valid_until: string, ... } }

Step 2: POST /photo/redeem-upload-token  (repeated per chunk)
  Multipart form-data fields:
    upload_token: string         (from step 1)
    file: Blob                   (the chunk bytes)
    resumableChunkNumber: number (1-indexed)
    resumableChunkSize: number   (chunk size in bytes, e.g. 104857600 for 100MB)
    resumableTotalSize: number   (total file size in bytes)
    resumableIdentifier: string  (unique ID for this file, e.g. "${size}-${filename}")
    resumableFilename: string    (original filename)
    resumableTotalChunks: number (ceil(totalSize / chunkSize))

  HTTP semantics (verified from types.ts API docs):
    200 → chunk accepted (or already was accepted — skip)
    500 → file unsupported, abort entire upload
    other → transient failure, retry (up to 5 times)

  Final chunk response (status 200): { data: { photo_id, tree_id, token } }

Step 3: POST /photo/update-upload-token (optional metadata patch)
  or video is ready to query via GET /photo/list?upload_token=...
```

**Replace flow (VID-06):**

```
Step 1: GET /photo/get-replace-token?photo_id=<id>
  Response: { data: { replace_token: string, ... } }

Step 2: POST /photo/replace (multipart)
  Fields: replace_token, file (chunk), resumable* params
  Note: /photo/replace accepts chunked upload via same resumable.js params
```

[VERIFIED: `packages/twentythree-cli/src/api/types.ts` — `videoGetUploadToken`, `videoRedeemUploadToken`, `videoGetReplaceToken`, `videoReplace` operations]

### Pattern 2: Chunked Upload Engine Interface

```typescript
// src/upload/chunked-upload.ts

export interface ChunkedUploadParams {
  filePath: string
  uploadToken: string
  uploadUrl: string        // full URL to POST chunks to
  chunkSize: number        // default: 100 * 1024 * 1024 (100MB)
  concurrency: number      // default: 5
  onProgress?: (bytesUploaded: number, totalBytes: number) => void
}

export interface ChunkedUploadResult {
  photo_id?: number
  tree_id?: number
  token?: string
}

export async function uploadChunked(
  params: ChunkedUploadParams
): Promise<ChunkedUploadResult>
```

**Key design principle:** The upload engine is a pure async function — it has no knowledge of CLI display (no `ora`, no `cli-progress` inside the engine). The calling command wires up a progress bar to the `onProgress` callback. This keeps the engine unit-testable without any terminal dependency.

### Pattern 3: Concurrent Chunk Pool with Retry

```typescript
// Pseudocode for the concurrent upload pool
async function uploadChunkedPool(
  chunks: ChunkDescriptor[],
  uploadFn: (chunk: ChunkDescriptor) => Promise<void>,
  concurrency: number
): Promise<void> {
  // Track completed chunks in-memory (UPL-06)
  const completed = new Set<number>()

  // Process chunks in windows of `concurrency`
  for (let i = 0; i < chunks.length; i += concurrency) {
    const window = chunks.slice(i, i + concurrency)
    await Promise.all(
      window.map(async (chunk) => {
        if (completed.has(chunk.number)) return  // already uploaded this invocation
        let attempts = 0
        while (attempts < 5) {  // UPL-05: up to 5 retries
          const status = await uploadChunk(chunk)
          if (status === 200) { completed.add(chunk.number); return }
          if (status === 500) throw new Error(`Unsupported file format`)
          attempts++
          await delay(backoff(attempts))  // exponential backoff
        }
        throw new Error(`Chunk ${chunk.number} failed after 5 retries`)
      })
    )
  }
}
```

[ASSUMED: Exponential backoff timing values]

### Pattern 4: openapi-fetch Usage for This Phase

**Form-encoded POST (video update, delete, section ops):**

```typescript
// Source: https://openapi-ts.dev/openapi-fetch/api#fetch-options
const { data, error } = await this.apiClient.POST('/photo/update', {
  body: {
    photo_id: videoId,
    title: flags.title,         // only include if provided
    description: flags.description,
  },
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
```

**Multipart file upload (subtitle upload — small files use direct POST, not chunked):**

```typescript
// Source: https://openapi-ts.dev/openapi-fetch/api#fetch-options
const { data, error } = await this.apiClient.POST('/photo/subtitle/upload', {
  body: {
    photo_id: videoId,
    locale: flags.locale,
    file: fileBlob,
  },
  bodySerializer(body) {
    const fd = new FormData()
    for (const [key, val] of Object.entries(body)) {
      if (val !== undefined) fd.append(key, val as string | Blob)
    }
    return fd
  },
})
```

**Important:** For chunked uploads, the chunks are POSTed directly using `fetch()` with `FormData` — NOT routed through `openapi-fetch`. The openapi-fetch typed client is only used for the `get-upload-token`, `get-replace-token`, `update-upload-token`, and CRUD operations that do NOT involve binary file streaming. This avoids openapi-fetch type conflicts with raw `Blob`/`Buffer` chunk data.

[VERIFIED: openapi-ts.dev/openapi-fetch/api — bodySerializer pattern]

### Pattern 5: Pagination Loop

The TwentyThree API uses `p` (page number), `size` (page size), and `total_count` in responses. Auto-paginate means the CLI fetches all pages before rendering.

```typescript
// Generic pagination helper (reusable across list commands)
async function fetchAllPages<T>(
  fetchPage: (page: number, size: number) => Promise<{ data?: T[], total_count?: number, p?: number, size?: number }>
): Promise<T[]> {
  const pageSize = 100  // max per request
  const firstPage = await fetchPage(1, pageSize)
  const items = [...(firstPage.data ?? [])]
  const total = firstPage.total_count ?? items.length

  let page = 2
  while (items.length < total) {
    const next = await fetchPage(page, pageSize)
    items.push(...(next.data ?? []))
    page++
  }
  return items
}
```

[VERIFIED: `types.ts` `videoList` operation — `p`, `size`, `total_count` response fields confirmed]

### Pattern 6: cli-progress Upload Progress Bar

```typescript
// Source: github.com/npkgz/cli-progress (CJS)
import * as cliProgress from 'cli-progress'

// In the upload command's run() — wired to engine onProgress callback
const bar = new cliProgress.SingleBar({
  format: '[{bar}] {percentage}% | {value_fmt} / {total_fmt} | ETA: {eta_formatted} | {speed}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
  clearOnComplete: true,   // bar disappears on stop() — no artifact
}, cliProgress.Presets.shades_classic)

bar.start(totalBytes, 0, { value_fmt: '0 B', total_fmt: formatBytes(totalBytes), speed: 'N/A' })

// In onProgress callback:
const speedBytesPerSec = computeSpeed(bytesUploaded, elapsedMs)
bar.update(bytesUploaded, {
  value_fmt: formatBytes(bytesUploaded),
  total_fmt: formatBytes(totalBytes),
  speed: `${formatBytes(speedBytesPerSec)}/s`,
})

bar.stop()
this.log(`Video uploaded successfully`)
```

**Key:** `clearOnComplete: true` ensures the bar is erased when `stop()` is called — the success line is the only terminal artifact.

[VERIFIED: github.com/npkgz/cli-progress — SingleBar API, format tokens, payload support confirmed]

### Pattern 7: Term-Map Application

The existing `applyCliTerms()` function handles full-string replacement (for error messages, API response text). For structured output, field name mapping is required at the display layer.

```typescript
// src/lib/term-map.ts — already implemented
import { applyCliTerms, toCliTerm } from '../../lib/term-map.js'

// Error messages from API:
if (error) {
  this.error(applyCliTerms(error.message ?? 'Unknown error'), { exit: 1 })
}

// Table headers (apply toCliTerm to field names):
const table = new Table({ head: ['ID', 'Title', 'Duration', 'Status', 'Published', 'Updated'] })
// Note: column values from API also need applyCliTerms if they contain
// legacy terms (e.g. album_title values, status strings)
```

[VERIFIED: `src/lib/term-map.ts` — `applyCliTerms()` and `toCliTerm()` confirmed]

### Pattern 8: JSON Output Shape (CLI-01)

```typescript
// All commands with --json return this shape
return {
  ok: true,
  data: rawApiResponse,
  summary: `3 videos`,        // human-readable one-liner
  breadcrumbs: [
    { domain: this.activeWorkspace.domain },
    { resource: 'video', id: videoId },
  ],
}
```

When `--json` is active, `this.jsonEnabled()` returns `true`. Return the object from `run()` and oclif serializes it as JSON to stdout. [VERIFIED: `base-command.ts` — `enableJsonFlag = true` pattern]

### Anti-Patterns to Avoid

- **CLI logic inside the upload engine:** The engine MUST NOT import `cli-progress`, `ora`, or `chalk`. Progress is reported via callback. This makes the engine unit-testable.
- **Sending all update fields regardless of what user provided:** `video update` in flag mode must only include flags the user explicitly passed. Sending `undefined` fields would clear video metadata.
- **Using `openapi-fetch` for binary chunk streaming:** Pass chunks via native `fetch()` + `FormData` — `openapi-fetch` is for typed JSON/form API calls, not for streaming large binary blobs.
- **`photo`, `album`, `live` in any string literal:** Every string that reaches the terminal must go through `applyCliTerms()` or be authored without legacy terms.
- **Using `ora` for upload progress:** `ora` is a spinner (indeterminate); `cli-progress` is required for the determinate byte/ETA bar.
- **Forgetting `printWorkspaceHeader()` in `run()`:** Every command must call this at the top.
- **Nested oclif subcommands missing index.ts topic stub:** `video/section/` and `video/subtitle/` need an `index.ts` file — oclif v4 requires it for topic grouping.

---

## API Shapes — Key Operations

### Upload Token Response (`GET /photo/get-upload-token`)

```typescript
// Verified from types.ts videoGetUploadToken operation
{
  status: 'ok',
  data: {
    upload_token: string,    // passed to every chunk POST
    valid_until: string,     // epoch seconds
    valid_minutes: string,
    max_uploads: string,
    title?: string,
    description?: string,
    tags?: string,
    publish?: string,
    album_id?: number,
    user_id?: number,
  }
}
```

### Chunk Upload (`POST /photo/redeem-upload-token`)

Multipart form-data fields:
| Field | Type | Notes |
|-------|------|-------|
| `upload_token` | string | Required — from get-upload-token |
| `file` | Blob/Buffer | The chunk bytes |
| `resumableChunkNumber` | number | 1-indexed |
| `resumableChunkSize` | number | Chunk size in bytes |
| `resumableTotalSize` | number | Total file size in bytes |
| `resumableIdentifier` | string | Unique ID: `${totalSize}-${filename}` |
| `resumableFilename` | string | Original filename |
| `resumableTotalChunks` | number | `Math.ceil(totalSize / chunkSize)` |

Final chunk 200 response: `{ data: { photo_id, tree_id, token } }`

[VERIFIED: `types.ts` `videoRedeemUploadToken` operation]

### Video Update Fields (`POST /photo/update`)

Updateable fields available as CLI flags:
| API Field | CLI Flag | Type |
|-----------|----------|------|
| `title` | `--title` | string |
| `description` | `--description` | string |
| `tags` | `--tags` | string (space-separated) |
| `album_id` | `--category-id` | string (comma-separated IDs) |
| `published_p` | `--publish` / `--no-publish` | boolean |
| `promoted_p` | `--promote` / `--no-promote` | boolean |
| `publish_date` | `--publish-date` | string |
| `video_360_p` | `--360` / `--no-360` | boolean |

[VERIFIED: `types.ts` `videoUpdate.requestBody` fields]

### Video List Response Key Fields

```typescript
// Key fields for table display (verified from types.ts videoList 200 response)
{
  photo_id: number,          // → display as "ID"
  title: string,
  video_length_fmt: string,  // → "Duration" (e.g. "3:04")
  video_encoded_p: boolean,  // → "Status" (encoded / processing)
  published_p: boolean,      // → "Published"
  publish_date_ansi: string, // → "Updated" (or creation_date_ansi)
  token: string,             // needed for get/frame/section/subtitle calls
}
```

Pagination fields: `p`, `size`, `total_count`
[VERIFIED: `types.ts` `videoList` 200 response]

### Section Create/Update Fields

| Field | Required | Notes |
|-------|----------|-------|
| `photo_id` | Yes | Video ID |
| `section_id` | Update only | Section to modify |
| `start_time` | Yes | Seconds (integer) |
| `title` | Yes | Section title |
| `description` | Yes | Description text |

[VERIFIED: `types.ts` `videoSectionCreate`, `videoSectionUpdate` operations]

### Subtitle Create Fields

| Field | Required | Notes |
|-------|----------|-------|
| `photo_id` | Yes | Video ID |
| `locale` | Yes | e.g. `en_US`, `auto` for auto-detect |
| `type` | No | default: `general` |
| `draft_p` | No | default: false |

### Subtitle Upload Fields (multipart)

| Field | Required | Notes |
|-------|----------|-------|
| `photo_id` | Yes | Video ID |
| `file` | Yes | SRT or WebVTT file |
| `locale` | Yes | e.g. `en_US` |
| `type` | No | default: `general` |
| `draft_p` | No | default: false |

[VERIFIED: `types.ts` `videoSubtitleCreate`, `videoSubtitleUpload` operations]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Upload progress bar | Custom ANSI escape sequences | `cli-progress` SingleBar | Edge cases with terminal width, cursor positioning, clear-on-complete |
| Table rendering | String padding with spaces | `cli-table3` | Column width calculation, Unicode width, header styling |
| Interactive prompts | Raw readline | `@clack/prompts` | Pre-fill support, cancel handling, consistent UX |
| Concurrent queue | Hand-rolled semaphore | `Promise.all` in windowed chunks | Existing pattern is sufficient for fixed concurrency |
| Byte formatting | Custom formatBytes | Small utility function | Trivial to implement; no library needed |

**Key insight:** The upload engine itself is custom (no library wraps the resumable.js protocol for Node CLI use), but every display/UX concern is handled by existing stack libraries.

---

## Common Pitfalls

### Pitfall 1: Mixing Token Types in Replace Flow

**What goes wrong:** `video replace` uses `get-replace-token`, not `get-upload-token`. The replace token is passed as `replace_token` (not `upload_token`) to the `/photo/replace` endpoint.

**Why it happens:** Both flows look similar; `photo/replace` accepts either token type, and the fields are easy to confuse.

**How to avoid:** `getUploadToken()` and `getReplaceToken()` should be distinct functions in the upload engine.

**Warning signs:** API returns 401/403 on chunk POST for replace operations.

### Pitfall 2: 1-Indexed Chunk Numbers

**What goes wrong:** Chunks are numbered starting at 1, not 0. If you pass `resumableChunkNumber: 0` for the first chunk, the API rejects or misroutes it.

**Why it happens:** The resumable.js protocol is 1-indexed by design (documented in types.ts API description: "First chunk is 1 (no base-0 counting here)").

**How to avoid:** Calculate chunk number as `index + 1` in the chunk array.

**Warning signs:** Upload completes without error but video never appears, or API returns 412.

### Pitfall 3: Sending Empty Fields in Update Commands

**What goes wrong:** Passing `title: undefined` or `description: ''` to the form-encoded body causes the API to clear those fields.

**Why it happens:** openapi-fetch serializes all body properties including undefined/empty ones to the URL-encoded body.

**How to avoid:** Build the body object with only the fields the user explicitly provided:
```typescript
const body: Record<string, unknown> = { photo_id: videoId }
if (flags.title !== undefined) body.title = flags.title
if (flags.description !== undefined) body.description = flags.description
```

**Warning signs:** `video update <id> --title "New"` also clears the video description.

### Pitfall 4: oclif Topic Stub Missing for Subcommand Trees

**What goes wrong:** oclif v4 requires an `index.ts` (or `index.js` in dist) in any directory that is a topic (contains subcommands). Without it, `twentythree video section --help` fails.

**Why it happens:** oclif uses the presence of the topic file to register the parent namespace.

**How to avoid:** Create `src/commands/video/index.ts`, `src/commands/video/section/index.ts`, `src/commands/video/subtitle/index.ts`. Each can be a minimal class with static `description`.

**Warning signs:** `Error: command not found` for topic-level help.

### Pitfall 5: cli-progress Conflicts with ora Spinner

**What goes wrong:** If `ora` is started before `cli-progress.start()`, both write to the terminal simultaneously and corrupt the display.

**Why it happens:** Both manipulate cursor position independently.

**How to avoid:** Never run `ora` concurrently with `cli-progress`. Stop the spinner before starting the bar, or don't use a spinner during upload (the progress bar replaces it).

### Pitfall 6: `resumableIdentifier` Must Be Unique Per File

**What goes wrong:** If two concurrent uploads use the same `resumableIdentifier`, the server conflates their chunks.

**Why it happens:** The identifier is user-generated; if you use just the filename it collides on repeated uploads of the same file.

**How to avoid:** Generate identifier as `${totalSize}-${path.basename(filePath)}-${Date.now()}` or include a random component.

### Pitfall 7: Subtitle Archive is Two Different Operations

**What goes wrong:** VID-10 says `archive` as a subtitle subcommand — but in the API there are two archive endpoints: `POST /photo/subtitle/archive/transcribe` (trigger transcription for all videos) and `GET /photo/subtitle/archive/get-progress` (check progress). These are workspace-level operations, not per-video.

**Why it happens:** The requirement groups them together; the API separates them.

**How to avoid:** `video subtitle archive transcribe` and `video subtitle archive progress` as two separate subcommands under an `archive` topic, OR a single `archive` command with a `--progress` flag.

### Pitfall 8: `video get` is NOT a Separate Endpoint

**What goes wrong:** There is no `GET /photo/get` endpoint. Attempting to create a client call to a non-existent typed endpoint fails at compile time.

**Why it happens:** The TwentyThree API uses `GET /photo/list?photo_id=<id>` to retrieve a single video.

**How to avoid:** `video get <id>` uses `this.apiClient.GET('/photo/list', { params: { query: { photo_id: id } } })` and returns `data[0]`.

[VERIFIED: `types.ts` — no `videoGet` operation; `videoList` has `photo_id` filter]

---

## Code Examples

### Example 1: openapi-fetch typed call with form-encoded body

```typescript
// Source: openapi-ts.dev/openapi-fetch/api + verified from types.ts response shapes
const { data, error } = await this.apiClient.POST('/photo/update', {
  body: {
    photo_id: Number(args.id),
    ...(flags.title !== undefined && { title: flags.title }),
    ...(flags.description !== undefined && { description: flags.description }),
    ...(flags.tags !== undefined && { tags: flags.tags }),
  },
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
if (error) {
  this.error(applyCliTerms(String(error)), { exit: 1 })
}
```

### Example 2: Pagination loop for video list

```typescript
// VID-01 pagination — verified field names from types.ts videoList response
const allVideos: typeof firstPage.data = []
const pageSize = 100
let page = 1
let total = Infinity
while (allVideos.length < total) {
  const { data, error } = await this.apiClient.GET('/photo/list', {
    params: { query: { p: page, size: pageSize } },
  })
  if (error || !data) this.error(applyCliTerms(String(error)), { exit: 1 })
  if (page === 1) total = data.total_count ?? 0
  allVideos.push(...(data.data ?? []))
  if ((data.data?.length ?? 0) < pageSize) break
  page++
}
```

### Example 3: Upload token acquisition

```typescript
// Source: types.ts videoGetUploadToken
const { data: tokenData, error: tokenError } = await this.apiClient.GET('/photo/get-upload-token', {
  params: {
    query: {
      title: flags.title,
      description: flags.description,
      tags: flags.tags,
      publish: flags.publish ? '1' : '0',
    },
  },
})
if (tokenError || !tokenData?.data?.upload_token) {
  this.error('Failed to get upload token', { exit: 1 })
}
const uploadToken = tokenData.data.upload_token
```

### Example 4: cli-table3 list rendering

```typescript
// Source: ASSUMED — cli-table3 is standard Node.js table library
import Table from 'cli-table3'
const table = new Table({
  head: ['ID', 'Title', 'Duration', 'Status', 'Published', 'Updated'],
  colWidths: [12, 40, 10, 12, 12, 22],
})
for (const v of videos) {
  const status = v.video_encoded_p ? 'ready' : 'processing'
  table.push([
    String(v.photo_id),
    truncate(v.title ?? '', 38),
    v.video_length_fmt ?? '—',
    status,
    v.published_p ? 'yes' : 'no',
    v.publish_date_ansi?.slice(0, 10) ?? '—',
  ])
}
this.log(table.toString())
```

### Example 5: Interactive update flow

```typescript
// Source: patterns from src/commands/auth/credentials.ts + @clack/prompts docs
import * as p from '@clack/prompts'

// Get current video first
const { data: current } = await this.apiClient.GET('/photo/list', {
  params: { query: { photo_id: Number(args.id) } },
})
const video = current?.data?.[0]

// Interactive mode: no metadata flags provided and not --json
const updateBody: Record<string, unknown> = { photo_id: Number(args.id) }

if (!flags['title'] && !flags['description'] && !flags['tags'] && !this.jsonEnabled()) {
  const title = await p.text({
    message: 'Title',
    initialValue: video?.title ?? '',
    placeholder: 'Press Enter to keep current value',
  })
  if (p.isCancel(title)) { this.exit(2); return }
  if (title !== video?.title) updateBody.title = title
  // ... repeat for other fields
} else {
  if (flags.title !== undefined) updateBody.title = flags.title
  // ... other flags
}
```

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `resumableIdentifier` format: `${totalSize}-${filename}` | Upload Protocol | Server may reject or conflate uploads; needs empirical testing |
| A2 | Chunk upload endpoint accepts raw Node.js `Buffer`/`ReadableStream` as `file` field in FormData | Architecture Patterns | May need to convert to `Blob` — Node 18+ supports `new Blob([buffer])` |
| A3 | Exponential backoff timing (e.g. 1s, 2s, 4s, 8s) for chunk retries | Chunk Pool Pattern | UPL-05 specifies retry count only; backoff strategy is undocumented |
| A4 | `GET /photo/list?upload_token=...` returns the newly uploaded video after final chunk 200 | Upload Protocol | Used to return `photo_id` if not in final chunk response |
| A5 | `video subtitle archive` should split into `archive transcribe` and `archive progress` subcommands | API Shapes | VID-10 says just "archive" — exact subcommand split needs decision |
| A6 | `@types/cli-progress` and `@types/cli-table3` type packages exist and match the library versions | Standard Stack | If types are wrong/missing, TypeScript compilation fails |

---

## Open Questions

1. **Subtitle archive subcommand naming**
   - What we know: Two API endpoints exist — `POST /photo/subtitle/archive/transcribe` and `GET /photo/subtitle/archive/get-progress`
   - What's unclear: VID-10 says just "archive" — is this one command (`video subtitle archive`) that accepts a `--progress` flag, or two commands (`video subtitle archive transcribe` and `video subtitle archive progress`)?
   - Recommendation: Two distinct commands for clarity; the user intent differs (trigger vs. check).

2. **Chunk upload via native fetch vs. openapi-fetch**
   - What we know: `openapi-fetch` types the `file` field as `Record<string, never>` in `videoRedeemUploadToken` which is not correct for binary uploads
   - What's unclear: Whether openapi-fetch's bodySerializer can correctly stream a `Buffer` chunk
   - Recommendation: Use native `fetch()` with `FormData` for all chunk POSTs; openapi-fetch for token acquisition and CRUD only.

3. **Phase 2 completion dependency**
   - What we know: Phase 3 `extends AuthenticatedCommand` which is being built in Phase 2
   - What's unclear: Phase 2 plans are not yet complete (`02-04` and `02-05` pending)
   - Recommendation: Phase 3 planning can proceed; execution must wait for Phase 2 completion.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | Yes (darwin) | >=22.0.0 enforced | — |
| pnpm | Package install | Yes | Monorepo standard | — |
| `cli-progress` | UPL-07 | Not installed | — | None (locked decision) |
| `cli-table3` | VID-01 list output | Not installed | — | None (locked decision) |
| `@types/cli-progress` | TypeScript types | Not installed | — | None |
| `@types/cli-table3` | TypeScript types | Not installed | — | None |

**Missing dependencies with no fallback:**
- `cli-progress` and `cli-table3` must be installed in Wave 0.

**Missing dependencies with fallback:**
- None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.x |
| Config file | `packages/twentythree-cli/vitest.config.ts` |
| Quick run command | `pnpm --filter twentythree-cli test` |
| Full suite command | `pnpm --filter twentythree-cli test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UPL-01 | Upload engine returns correct photo_id after all chunks accepted | unit | `vitest run src/upload/__tests__/chunked-upload.test.ts` | No — Wave 0 |
| UPL-02 | Chunks contain correct resumable.js params (chunk number, size, identifier, etc.) | unit | `vitest run src/upload/__tests__/chunked-upload.test.ts` | No — Wave 0 |
| UPL-03 | Default chunk size is 100MB; `--chunk-size` override respected | unit | `vitest run src/upload/__tests__/chunked-upload.test.ts` | No — Wave 0 |
| UPL-04 | 5 chunks sent concurrently (not sequentially) | unit | `vitest run src/upload/__tests__/chunk-pool.test.ts` | No — Wave 0 |
| UPL-05 | Chunk retries up to 5 times on non-200/500; aborts on 500 | unit | `vitest run src/upload/__tests__/chunk-pool.test.ts` | No — Wave 0 |
| UPL-06 | 200-already-accepted chunk is skipped within one invocation | unit | `vitest run src/upload/__tests__/chunk-pool.test.ts` | No — Wave 0 |
| UPL-07 | `onProgress` callback called with correct bytes values | unit | `vitest run src/upload/__tests__/chunked-upload.test.ts` | No — Wave 0 |
| VID-01 | `video list` auto-paginates, renders table, returns JSON shape | unit | `vitest run src/commands/video/__tests__/list.test.ts` | No — Wave 0 |
| VID-02 | `video get` calls videoList with photo_id filter | unit | `vitest run src/commands/video/__tests__/get.test.ts` | No — Wave 0 |
| VID-04 | `video update` only sends provided flags; interactive mode skipped with --json | unit | `vitest run src/commands/video/__tests__/update.test.ts` | No — Wave 0 |
| VID-05 | `video delete` confirmation includes workspace domain; exit 2 on cancel | unit | `vitest run src/commands/video/__tests__/delete.test.ts` | No — Wave 0 |
| CLI-01 | `--json` returns `{ ok, data, summary, breadcrumbs }` shape | unit (per command) | per-command test | No — Wave 0 |
| CLI-02 | List command auto-fetches multiple pages | unit | list command tests | No — Wave 0 |
| CLI-03 | Exit codes 0/1/2 for success/error/cancel | unit | mixed | No — Wave 0 |
| CLI-04 | No `photo`/`album`/`live` in any output | unit | term-map application tests | Partial (term-map tested) |

### Testability Notes

- **Upload engine:** Fully unit-testable by mocking `fetch()` (or using `vi.spyOn(global, 'fetch')`). Mock returns 200 for accepted chunks, non-200 for retry, 500 for abort. No network required.
- **Command unit tests:** Follow the established pattern from `base-command.test.ts` — mock `openapi-fetch`, `workspace-config`, `token-refresh`. Patch `this.log` and `this.error`.
- **Progress bar (cli-progress):** Unit tests mock `cliProgress.SingleBar`. Assert `start()`, `update()`, `stop()` called with correct args. Do NOT test terminal rendering.
- **Interactive mode:** Mock `@clack/prompts` with `vi.mock`. Return preset values or simulate cancel (`Symbol`).

### Sampling Rate

- **Per task commit:** `pnpm --filter twentythree-cli test`
- **Per wave merge:** `pnpm --filter twentythree-cli test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/upload/__tests__/chunked-upload.test.ts` — covers UPL-01, UPL-02, UPL-03, UPL-07
- [ ] `src/upload/__tests__/chunk-pool.test.ts` — covers UPL-04, UPL-05, UPL-06
- [ ] `src/commands/video/__tests__/list.test.ts` — covers VID-01, CLI-01, CLI-02
- [ ] `src/commands/video/__tests__/get.test.ts` — covers VID-02
- [ ] `src/commands/video/__tests__/update.test.ts` — covers VID-04, CLI-03
- [ ] `src/commands/video/__tests__/delete.test.ts` — covers VID-05, CLI-03
- [ ] Install: `pnpm add cli-progress cli-table3 && pnpm add -D @types/cli-progress @types/cli-table3`

---

## Security Domain

> security_enforcement not set to false in config — included.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Bearer token already handled by BaseCommand |
| V3 Session Management | No | Stateless CLI; no sessions |
| V4 Access Control | No | Server-side enforcement; CLI passes token as-is |
| V5 Input Validation | Yes | Validate file paths exist before upload; validate `--chunk-size` is positive integer |
| V6 Cryptography | No | No crypto operations in this phase |

### Known Threat Patterns for CLI + File Upload

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal in upload file path | Tampering | Validate with `fs.existsSync` + `path.resolve` before opening file |
| Negative/zero chunk size | Tampering | Validate `--chunk-size` > 0 before computing chunk array |
| Token leakage in error messages | Info Disclosure | Never include upload_token or bearer_token in user-visible error text |
| Partial upload leaving orphaned token | Denial of Service | On abort, log that video may be partially uploaded; token is time-limited (valid_minutes) |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `keytar` for credential storage | `@napi-rs/keyring` | Dec 2022 (keytar archived) | Already handled in project setup |
| `tsup` for bundling | `tsdown` | 2024 (tsup officially abandoned) | Already handled in Phase 1 |
| `inquirer` for prompts | `@clack/prompts` | 2023+ | Already handled in project setup |
| `resumable-upload-command` for chunked uploads | Native implementation | Phase 3 requirement (UPL-08) | Implementing from scratch |

---

## Sources

### Primary (HIGH confidence)

- `packages/twentythree-cli/src/api/types.ts` — All video/section/subtitle operation shapes, pagination fields, upload token protocol, HTTP status semantics
- `packages/twentythree-cli/src/lib/base-command.ts` — AuthenticatedCommand pattern, apiClient, printWorkspaceHeader
- `packages/twentythree-cli/src/api/client.ts` — openapi-fetch client factory
- `packages/twentythree-cli/src/lib/term-map.ts` — applyCliTerms, toCliTerm
- `packages/twentythree-cli/src/commands/auth/credentials.ts` — clack/prompts usage pattern
- `packages/twentythree-cli/src/commands/workspace/list.ts` — list command pattern
- `packages/twentythree-cli/src/lib/__tests__/base-command.test.ts` — vitest mock patterns for commands

### Secondary (MEDIUM confidence)

- [openapi-ts.dev/openapi-fetch/api](https://openapi-ts.dev/openapi-fetch/api) — bodySerializer for FormData, Content-Type for url-encoded
- [github.com/npkgz/cli-progress](https://github.com/npkgz/cli-progress) — SingleBar API, format tokens, payload support, CJS module

### Tertiary (LOW confidence)

- npm registry: `cli-progress@3.12.0`, `cli-table3@0.6.5` — versions confirmed via `npm view`

---

## Metadata

**Confidence breakdown:**
- Upload protocol: HIGH — fully documented in types.ts with HTTP status semantics
- API operation shapes: HIGH — verified directly from generated types.ts
- cli-progress API: MEDIUM — confirmed from GitHub README
- openapi-fetch FormData pattern: MEDIUM — confirmed from official docs
- Chunk retry/backoff timing: LOW — retry count specified (5), timing assumed

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (stable ecosystem; OpenAPI types are locked to the generated file)
