# Phase 4: Category & Webinar Core — Research

**Researched:** 2026-04-14
**Domain:** TwentyThree API — `/album/*` (category) and `/live/*` (webinar) endpoints
**Confidence:** HIGH — all findings drawn directly from committed `types.ts` (source of truth) and existing Phase 3 command implementations

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

1. **File upload — always use chunked engine.** `webinar upload-image` uses `chunked-upload.ts`. No direct multipart POST even for small files. Progress bar, ID, and admin URL follow video upload pattern.
2. **`webinar create` / `webinar update` fields:** title (maps to API `name`), description, webinar_status (maps to `live_status`), live_date / live_date_ansi (maps to `start_time`), draft_p → `--draft`/`--no-draft`, published_p → `--publish`/`--no-publish`. Hidden raw `--draft-p` / `--published-p` alternatives.
3. **Read-only commands render as cli-table3 tables.** `webinar metrics`, `webinar clips`, `webinar highlights`, `webinar log`, `webinar list-formats` all produce tables. Metrics renders as two-column key/value table. `--json` returns raw data.
4. **`webinar repeat` requires `--date`.** Duplicates webinar, schedules copy at new date/time. Success output includes new ID and admin URL.
5. **Carry forward Phase 3 conventions.** `applyCliTerms`, `fetchVideoToken`-equivalent for webinar, `formatApiError`, exit codes 0/1/2, `--json` on every command, confirmation on delete commands, admin URL after create.

### Claude's Discretion

None from this discussion.

### Deferred Ideas (OUT OF SCOPE)

None from this discussion.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CAT-01 | `twentythree category list` — paginated list of categories | `albumList` GET, returns `album_id`, `title`, `hide_p`, `creation_date_ansi`, pagination fields |
| CAT-02 | `twentythree category create` — create new category | `albumCreate` POST, required: `title`; optional: `description`, `hide_p`; returns `album_id` |
| CAT-03 | `twentythree category update <id>` — update category metadata | `albumUpdate` POST, `album_id` required; optional fields; returns empty data (pattern: flag mode + interactive fallback) |
| CAT-04 | `twentythree category delete <id>` — delete with confirmation | `albumDelete` POST, `album_id` required; returns empty data |
| WEB-01 | `twentythree webinar list` — paginated list of webinars | `liveList` GET; schema has known mismatch (photo_id as primary — live_id present as secondary); apply `as any` cast |
| WEB-02 | `twentythree webinar create` — create new webinar | `liveCreate` POST, required: `name`; returns `live_id` and `token` |
| WEB-03 | `twentythree webinar update <id>` — update webinar details | `liveUpdate` POST, many optional fields including `live_status`, `draft_p`, `start_time`; returns empty data |
| WEB-04 | `twentythree webinar delete <id>` — delete with confirmation | `liveDelete` POST, `live_id` required |
| WEB-05 | `twentythree webinar upload-image <id> <file>` — upload thumbnail via chunked engine | `liveUploadImage` POST, `multipart/form-data`, `live_id`, `file`, `type` enum; decision: use chunked engine (not direct multipart) |
| WEB-06 | `twentythree webinar metrics <id>` — get aggregated metrics | `liveMetrics` GET, returns array of `{metric, value, formated}`; render as key-value table |
| WEB-07 | `twentythree webinar clips <id>` — list recording clips | `liveClips` GET, `live_id` required in query; returns clips array |
| WEB-08 | `twentythree webinar highlights <id>` — list highlights | `liveHighlights` GET, `live_id` required; optional `photo_id` |
| WEB-09 | `twentythree webinar list-formats` — list format options | `liveListFormats` GET, no required params; returns `{key, name}[]` |
| WEB-10 | `twentythree webinar log <id>` — get event log | `liveLog` GET, `live_id` required; returns `{event, start_time, end_time, ...}[]` |
| WEB-11 | `twentythree webinar repeat <id>` — duplicate and reschedule | `liveRepeat` POST, `live_id` required, `schedule_start_time` for new date; returns new `live_id` |
</phase_requirements>

---

## Summary

Phase 4 adds 15 commands spanning two API resource groups: `/album/*` (category CRUD) and `/live/*` (webinar lifecycle). Both follow the exact structural patterns established in Phase 3 — the planner can treat these as direct analogues with a few important differences.

**Category commands** are the simpler group: four endpoints, no token lookups, no uploads, no specialized output. The API field ID is `album_id`; the CLI term is `category`. The `albumUpdate` response returns an empty `data: {}` (no fields to echo back).

**Webinar commands** are more nuanced: the API ID field is `live_id`, the `liveCreate` request field for title is `name` (not `title` — critical divergence from video/album), and the `liveList` OpenAPI response schema is a known mismatch (it reuses photo/list field names in the spec, but runtime returns webinar-specific fields). The `liveUploadImage` endpoint is `multipart/form-data` in the spec, but the locked decision overrides this: use the chunked engine always.

**Primary recommendation:** Scaffold command files following Phase 3 patterns exactly; the only structural novelty is: (1) `fetchWebinarToken` helper for any GET endpoint requiring a token, and (2) the `liveList` response `as any` cast pattern (same as Phase 3's `photo/list` mismatch). Neither requires new infrastructure.

---

## Standard Stack

No new dependencies are needed for this phase. All required libraries are already installed.

| Library | Already Present | Role in Phase 4 |
|---------|----------------|-----------------|
| `@oclif/core` | Yes | Command dispatch, flag parsing |
| `cli-table3` | Yes | Table output for all read-only commands |
| `@clack/prompts` | Yes | Delete confirmation, interactive update fallback |
| `chalk` | Yes | Workspace header, success messages |
| `openapi-fetch` | Yes | All API calls via `this.apiClient` |

**Installation:** None required.

---

## Architecture Patterns

### Recommended Project Structure for Phase 4

```
src/commands/
├── category/
│   ├── index.ts           # oclif topic file (re-export or empty)
│   ├── list.ts            # CAT-01
│   ├── create.ts          # CAT-02
│   ├── update.ts          # CAT-03
│   └── delete.ts          # CAT-04
└── webinar/
    ├── index.ts           # oclif topic file
    ├── list.ts            # WEB-01
    ├── create.ts          # WEB-02
    ├── update.ts          # WEB-03
    ├── delete.ts          # WEB-04
    ├── upload-image.ts    # WEB-05
    ├── metrics.ts         # WEB-06
    ├── clips.ts           # WEB-07
    ├── highlights.ts      # WEB-08
    ├── list-formats.ts    # WEB-09
    ├── log.ts             # WEB-10
    └── repeat.ts          # WEB-11
```

Topic index files (`src/commands/category/index.ts`, `src/commands/webinar/index.ts`) must exist for oclif to register the topic. Pattern is same as `src/commands/video/index.ts` if it exists, otherwise an empty default export suffices.

### Pattern 1: Category CRUD (plain CRUD, no token lookup)

Category commands follow the Phase 3 video delete/update/list patterns 1:1. No token lookup is needed for any album endpoint.

```typescript
// Source: packages/twentythree-cli/src/commands/video/delete.ts (exact pattern)
// category/delete.ts — confirmation prompt includes domain
const confirmed = await confirm({
  message: `Delete category ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
})
```

```typescript
// category/list.ts — fetchAllPages with as any cast
const categories = await fetchAllPages<any>(async (page, size) => {
  const { data, error } = await this.apiClient.GET('/album/list', {
    params: { query: { p: page, size } },
  })
  if (error) this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
  const resp = data as any
  const items: unknown[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []
  return { data: items, total_count: resp?.total_count }
})
```

**Table columns for `category list`:**

| Header | Field | Notes |
|--------|-------|-------|
| ID | `album_id` | |
| Title | `title` | `applyCliTerms()` applied |
| Hidden | `hide_p` | yes/no |
| Created | `creation_date_ansi` | |

### Pattern 2: `fetchWebinarToken` helper

Mirrors `fetchVideoToken` in `base-command.ts`. Required if any `/live/*` GET endpoint needs `token` as a query param. From the types, **none of the Phase 4 GET endpoints require a token param** — they all take only `live_id` and optional filters. However, the helper should be added to `AuthenticatedCommand` (or a `WebinarCommand` base class) for completeness and Phase 5 use.

```typescript
// Source: packages/twentythree-cli/src/lib/base-command.ts (fetchVideoToken pattern)
protected async fetchWebinarToken(webinarId: string | number): Promise<string> {
  const { data, error } = await this.apiClient.GET('/live/list', {
    params: { query: { live_id: Number(webinarId) } },
  })
  if (error) this.error(`Could not look up webinar ${webinarId}: ${error}`, { exit: 1 })
  const resp = data as any
  const webinar = Array.isArray(resp?.data) ? resp.data[0] : resp?.data
  if (!webinar?.token) this.error(`Webinar ${webinarId} not found or has no token`, { exit: 1 })
  return webinar.token as string
}
```

### Pattern 3: `webinar create` and `webinar update` — field name mapping

**Critical:** The `liveCreate` and `liveUpdate` API field for webinar title is `name`, not `title`. The CLI flag is `--title` (user-visible term), but the body field sent to the API must be `name`.

```typescript
// webinar/create.ts — required flag maps to 'name' field
static flags = {
  title: Flags.string({ description: 'Title for the new webinar', required: true }),
  description: Flags.string({ required: false }),
  status: Flags.string({ description: 'live_status: upcoming|live|previous', required: false }),
  'live-date': Flags.string({ description: 'Schedule date/time (ISO 8601)', required: false }),
  draft: Flags.boolean({ allowNo: true, required: false }),
  publish: Flags.boolean({ allowNo: true, required: false }),
  // Hidden raw alternatives
  'draft-p': Flags.string({ hidden: true, required: false }),
  'published-p': Flags.string({ hidden: true, required: false }),
}

// In body construction:
const body: Record<string, unknown> = {}
if (flags.title !== undefined) body.name = flags.title  // 'name' is the API field
if (flags.description !== undefined) body.description = flags.description
if (flags.status !== undefined) body.live_status = flags.status
if (flags['live-date'] !== undefined) body.start_time = flags['live-date']
const draftVal = parseBoolParam(flags.draft, flags['draft-p'])
const publishVal = parseBoolParam(flags.publish, flags['published-p'])
if (draftVal !== undefined) body.draft_p = draftVal ? 1 : 0
if (publishVal !== undefined) body.published_p = publishVal ? 1 : 0
```

### Pattern 4: Read-only webinar commands — table layout

All read-only commands follow the same skeleton as `video list` but without pagination (they return a fixed result set for a given `live_id`).

**`webinar metrics`** — API returns `{metric, value, formated}[]`. Two-column key/value table:

```typescript
// webinar/metrics.ts
const headers = ['Metric', 'Value']
const rows = metrics.map((m: any) => [
  applyCliTerms(String(m.metric ?? '')),
  String(m.formated ?? m.value ?? ''),
])
```

**`webinar clips`** — API returns clips and highlight markers. Key columns:

| Header | Field |
|--------|-------|
| ID | `photo_id` (displayed as "Video ID") |
| Title | `title` |
| Duration | `duration_fmt` |
| Type | `live_highlight_type` |
| Published | `published_p` (yes/no) |
| Views | `view_count_fmt` |

**`webinar highlights`** — returns highlight markers. Key columns:

| Header | Field |
|--------|-------|
| Type | `type` |
| Start | `relative_start_time` |
| End | `relative_end_time` |
| Absolute Start | `absolute_start_time` |

**`webinar list-formats`** — returns `{key, name}[]`. Two-column table:

| Header | Field |
|--------|-------|
| Key | `key` |
| Name | `name` |

**`webinar log`** — returns stream events. Key columns:

| Header | Field |
|--------|-------|
| Event | `event` |
| Start | `start_time__date` + `start_time__time` |
| End | `end_time__date` + `end_time__time` |

### Pattern 5: `webinar upload-image` — chunked engine adaptation

The `liveUploadImage` spec uses `multipart/form-data` directly (not the token-then-redeem flow of video upload). However, the locked decision mandates the chunked engine always. The chunked engine sends resumable.js params to the target URL directly. The URL is `${this.apiBaseUrl}live/upload-image`.

The endpoint accepts `live_id`, `file`, and `type` (`thumbnail|preview|before_webinar`). The chunked engine sends `live_id` and `type` as additional form fields alongside the resumable.js params.

**Important:** The chunked engine's `uploadFn` appends `upload_token` (or a named token field) to FormData. For `live/upload-image` there is no upload token — `live_id` is the identifier. The `tokenFieldName` param defaults to `upload_token` in `ChunkedUploadParams`. For this endpoint, `live_id` must be sent as a regular field, not via `tokenFieldName`.

```typescript
// webinar/upload-image.ts — chunked engine with live_id as extra field
// The chunked engine's FormData builder appends tokenFieldName.
// We need to send live_id separately. Two options:
// Option A: Pass live_id as the uploadToken value with tokenFieldName='live_id'
//           → uploadChunked({ uploadToken: String(webinarId), tokenFieldName: 'live_id', ... })
// Option B: Add a custom onBeforeChunk hook (not yet in engine) — NOT AVAILABLE

// RECOMMENDED: Option A — reuse tokenFieldName with 'live_id'
result = await uploadChunked({
  filePath: args.file,
  uploadToken: String(webinarId),
  tokenFieldName: 'live_id',
  uploadUrl: `${this.apiBaseUrl}live/upload-image`,
  bearerToken: this.activeWorkspace.bearer_token || undefined,
  chunkSize: flags['chunk-size'],
  concurrency: flags.concurrency,
  onProgress(...) { ... },
})
```

The `type` flag (`thumbnail|preview|before_webinar`) cannot be sent via the current chunked engine's FormData builder. The engine does not support arbitrary extra fields beyond `tokenFieldName`. **The planner must add an `extraFields?: Record<string, string>` param to `ChunkedUploadParams`** so `type` can be appended to each chunk's FormData.

### Pattern 6: `webinar repeat`

```typescript
// webinar/repeat.ts
// POST /live/repeat with live_id + schedule_start_time
// Returns { live_id, token } — this is the NEW webinar's ID
body.live_id = Number(args.id)
body.schedule_start_time = flags.date  // --date flag (ISO 8601 or human-readable)

// Success output:
this.log('Webinar duplicated and scheduled')
this.log(`ID:    ${newLiveId}`)
this.log(`Admin: https://${this.activeWorkspace.domain}/manage/webinar/${newLiveId}`)
```

### Anti-Patterns to Avoid

- **Using `title` as the API field for webinar create/update:** The API field is `name`, not `title`. Sending `title` silently fails (field is ignored) leaving the webinar with no title.
- **Assuming `liveList` response has `live_id` as the top-level item key:** The OpenAPI schema shows `photo_id` as primary (it reuses the photo/list schema). At runtime the response likely includes `live_id` on each item. Use `as any` cast and access `item.live_id ?? item.photo_id` defensively for the list display, using `live_id` as the canonical ID for CLI output.
- **Direct multipart POST for `live/upload-image`:** Locked decision forbids it. Use chunked engine.
- **Sending all flags to update body regardless of whether provided:** Only include flags !== undefined (Phase 3 T-03-07 pattern).
- **Using `String(error)` instead of `formatApiError(error)`:** Phase 3 decision — `String(error)` renders plain objects as `[object Object]`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Pagination for category list and webinar list | Custom page loop | `fetchAllPages` from `src/lib/pagination.ts` |
| Boolean flag with `--no-X` variant | Custom boolean parsing | `parseBoolParam(primary, alt)` from `src/lib/output.ts` |
| Chunked file upload | Direct multipart form POST | `uploadChunked` from `src/upload/chunked-upload.ts` |
| Table rendering | Custom string formatting | `renderTable(headers, rows)` from `src/lib/output.ts` |
| API term translation in output | String.replace | `applyCliTerms(str)` from `src/lib/term-map.ts` |
| JSON output shape | Custom object | `formatJsonOutput({ok, data, summary, breadcrumbs})` |
| Error string serialization | `String(error)` | `formatApiError(error)` from `src/lib/output.ts` |
| Relative URL resolution | Manual string concat | `resolveUrl(url, baseUrl)` from `src/lib/output.ts` |

---

## Endpoint Reference (Verified from types.ts)

### Album (Category) Endpoints

#### `/album/list` — GET `albumList`
- **Method:** GET (anonymous-accessible)
- **Query params:** `album_id?`, `user_id?`, `photo_id?`, `include_hidden_p?`, `search?`, `p?`, `size?`, `orderby?`, `order?`
- **Response `data[]` fields:** `album_id`, `title`, `pretty_date`, `one`, `creation_date_ansi`, `user_id`, `display_name`, `token`, `hide_p`
- **Pagination shape:** `p`, `size`, `total_count` at top level
- **Token param required:** No

#### `/album/create` — POST `albumCreate`
- **Method:** POST `application/x-www-form-urlencoded`
- **Required body fields:** `title: string`
- **Optional body fields:** `description?`, `user_id?`, `hide_p?: boolean`, `fields?`
- **Response `data`:** `{ album_id, token }`
- **Admin URL:** No admin path for categories (only webinars get `/manage/webinar/<id>`)

#### `/album/delete` — POST `albumDelete`
- **Method:** POST `application/x-www-form-urlencoded`
- **Required body fields:** `album_id: number`
- **Response `data`:** `Record<string, never>` (empty)

#### `/album/update` — POST `albumUpdate`
- **Method:** POST `application/x-www-form-urlencoded`
- **Required body fields:** `album_id: number`
- **Optional fields:** `title?`, `description?`, `hide_p?: boolean`
- **Response `data`:** `Record<string, never>` (empty)

### Live (Webinar) Endpoints

#### `/live/list` — GET `liveList`
- **Method:** GET
- **Query params (Phase 4 relevant):** `live_id?`, `include_private_p?`, `live_status?`, `search?`, `draft_p?`, `p?`, `size?`, `ordering?`, `order?`
- **Token param:** Has `token?` query param for private webinar access — NOT a mandatory token for authenticated list. No `fetchWebinarToken` needed for `webinar list`.
- **Response `data[]`:** Schema shows photo_id fields (known mismatch — same as Phase 3 photo/list). Runtime will have `live_id` as primary ID field. Use `as any` cast.
- **Pagination:** `p`, `size`, `total_count`

**Key columns for `webinar list` table:**

| Header | Field (runtime) |
|--------|----------------|
| ID | `live_id` (cast from `as any`) |
| Title | `name` or `title` (webinar uses `name`) |
| Status | `live_status` |
| Date | `live_date` |
| Private | `private_p` (yes/no) |

#### `/live/create` — POST `liveCreate`
- **Required:** `name: string` (NOT `title`)
- **Optional (Phase 4 scope):** `description?`, `private_p?`, `start_time?`, `duration_minutes?`, `live_format?`, `draft_p?`
- **Response `data`:** `{ live_id, token }`
- **Admin URL:** `https://${domain}/manage/webinar/${live_id}`

#### `/live/delete` — POST `liveDelete`
- **Required:** `live_id: number`
- **Response `data`:** `Record<string, never>` (empty)

#### `/live/update` — POST `liveUpdate`
- **Required:** `live_id: number`
- **Phase 4 relevant optional fields:** `name?`, `description?`, `live_status?`, `draft_p?`, `start_time?`, `end_time?`, `duration_minutes?`, `timezone?`
- **Response `data`:** `Record<string, never>` (empty)

#### `/live/metrics` — GET `liveMetrics`
- **No token param required**
- **Query:** `live_id?` (optional — omit to aggregate across workspace)
- **Response `data[]`:** `{ metric: string, value: string, formated: string }[]`
- **Note:** `formated` is the pre-formatted display string (typo in API — `formated` not `formatted`)

#### `/live/clips` — GET `liveClips`
- **Required query:** `live_id: number` (non-optional)
- **Optional query:** `created_p?` (filter by clip creation status)
- **No token param required**
- **Response `data[]`:** `photo_id`, `title`, `token`, `published_p`, `duration`, `duration_fmt`, `view_count`, `view_count_fmt`, `live_highlight_type`, `live_highlight_created_p`, `live_highlight_action_link`

#### `/live/highlights` — GET `liveHighlights`
- **Required query:** `live_id: number`
- **Optional query:** `photo_id?` (scope to specific recording)
- **No token param required**
- **Response `data[]`:** `type`, `live_id`, `photo_id`, `label`, `relative_start_time`, `relative_end_time`, `absolute_start_time`, `absolute_end_time`

#### `/live/list-formats` — GET `liveListFormats`
- **No required params** (only optional `fields?`)
- **No token param required**
- **Response `data[]`:** `{ key: string, name: string }[]`

#### `/live/log` — GET `liveLog`
- **Required query:** `live_id: number`
- **Optional query:** `start_time?`, `end_time?`, `event_types?`, `concatenate_seconds?`
- **No token param required**
- **Response `data[]`:** `{ live_id, event, start_time, end_time, start_time__date, start_time__time, end_time__date, end_time__time }`
- **Extra top-level fields:** `realtime_url`, `realtime_channel`, `timezone_offset` (include in JSON output, ignore in table)

#### `/live/repeat` — POST `liveRepeat`
- **Required body:** `live_id: number`
- **Optional body:** `name?`, `schedule_start_time?`, `private_p?`, `template_p?`, `send_speaker_invitations_p?`, `duration_minutes?`, `description?`, `timezone?`
- **Response `data`:** `{ live_id: number, token: string }` — **this is the NEW webinar's ID**

#### `/live/upload-image` — POST `liveUploadImage`
- **Content-Type in spec:** `multipart/form-data`
- **Required body:** `live_id: number`, `file` (binary)
- **Optional body:** `type?: "thumbnail" | "preview" | "before_webinar"` (defaults to `thumbnail`)
- **Response `data`:** `Record<string, never>` (empty)
- **Implementation note:** Chunked engine required (locked decision). Engine needs `extraFields` param added for `type` and `live_id` fields.

---

## Common Pitfalls

### Pitfall 1: `liveCreate` / `liveUpdate` title field is `name`, not `title`
**What goes wrong:** Sending `body.title = flags.title` silently fails — the API ignores unknown fields and the webinar is created/updated without a title.
**Why it happens:** Category uses `title`; video uses `title`; webinar uses `name`. Inconsistency in the API.
**How to avoid:** Always use `body.name = flags.title` for webinar create/update.
**Warning signs:** Webinar created successfully (status 200) but title is empty or default.

### Pitfall 2: `liveList` response schema mismatch
**What goes wrong:** Accessing `item.live_id` or `item.name` on items typed from the OpenAPI schema fails TypeScript compilation — the schema defines photo-centric fields.
**Why it happens:** The OpenAPI spec reuses the photo/list response schema for live/list (same pattern discovered in Phase 3 with `/photo/list`).
**How to avoid:** Cast response `data as any`, access `item.live_id` for the webinar ID. This matches the Phase 3 pattern for photo/list.
**Warning signs:** TypeScript errors on live_id, live_status, name fields when accessing typed response.

### Pitfall 3: `formated` not `formatted` in metrics response
**What goes wrong:** Accessing `m.formatted` returns undefined; the pre-formatted display value is missing from the table.
**Why it happens:** Typo in the API schema — the field is `formated` (one 't').
**How to avoid:** Use `m.formated ?? m.value` when rendering metrics.

### Pitfall 4: Chunked engine cannot send arbitrary extra fields
**What goes wrong:** `webinar upload-image` needs to send `type` (thumbnail/preview/before_webinar) with each chunk. The current `ChunkedUploadParams` only supports `tokenFieldName` — no `extraFields` map.
**Why it happens:** The video upload use case only needs the upload_token; no extra fields were needed in Phase 3.
**How to avoid:** Add `extraFields?: Record<string, string>` to `ChunkedUploadParams` and append them in `uploadFn`'s FormData builder.
**Impact if missed:** Webinar upload-image works (the API may default to `thumbnail` type) but `--type preview` and `--type before_webinar` flags would silently have no effect.

### Pitfall 5: `live_date` vs `start_time` naming
**What goes wrong:** CLI context uses `live_date`/`live_date_ansi` (from CONTEXT.md), but the actual API input fields in `liveCreate`/`liveUpdate` are `start_time` (for create) and `start_time` (for update).
**Why it happens:** The API uses `live_date` in `liveList` output fields but `start_time` in `liveCreate`/`liveUpdate` input fields.
**How to avoid:** `--live-date` is the CLI flag name; it maps to `body.start_time` in the request body.

### Pitfall 6: `liveDelete` irreversible — Phase 3 delete pattern must match exactly
**What goes wrong:** If the confirmation prompt does not include the workspace domain, the user cannot distinguish which workspace they are deleting from.
**How to avoid:** Confirmation message: `Delete webinar ${args.id} from ${this.activeWorkspace.domain}? This permanently deletes all recordings. This cannot be undone.`

### Pitfall 7: oclif topic `index.ts` files required
**What goes wrong:** Commands under `src/commands/category/` and `src/commands/webinar/` are not discovered by oclif unless topic index files exist. The CLI silently shows no commands for the topic.
**How to avoid:** Create `src/commands/category/index.ts` and `src/commands/webinar/index.ts` with empty default exports (or re-exporting the topic class if needed).

---

## Chunked Upload Engine Modification Required

The `ChunkedUploadParams` type in `src/upload/types.ts` needs one addition for `webinar upload-image`:

```typescript
// src/upload/types.ts — add to ChunkedUploadParams interface
extraFields?: Record<string, string>
// Additional form fields appended to every chunk's FormData.
// Used by webinar upload-image to pass 'type' (thumbnail|preview|before_webinar).
```

In `src/upload/chunked-upload.ts` — in `uploadFn`, after the existing `formData.append` calls:

```typescript
if (params.extraFields) {
  for (const [key, value] of Object.entries(params.extraFields)) {
    formData.append(key, value)
  }
}
```

This is a non-breaking additive change. All existing callers pass no `extraFields` and continue working unchanged.

---

## Phase 3 Pitfalls That Recur

From `STATE.md` accumulated context:

| Phase 3 Pitfall | Recurs in Phase 4? | Action |
|-----------------|-------------------|--------|
| `@types/cli-table3` does not exist — cli-table3 bundles own types | No — already resolved; `cli-table3` installed | No action needed |
| `formatBytes` — use `toFixed(1)+Number()` not `toPrecision()` | Neutral — not used in Phase 4 | N/A |
| `archive/get-progress` is POST not GET per OpenAPI types | **YES pattern** — types.ts is authoritative over any prose description | Always verify HTTP method from `operations["x"].parameters` not path description |
| API `/photo/list` response data cast to `any` — OpenAPI schema mismatch | **YES — same for `/live/list`** | Use `as any` cast, `Array.isArray` check |
| Video update flag mode: only flags !== undefined added to body | **YES for `webinar update`** | Implement same pattern |
| `formatApiError` not `String(error)` | **YES** | Use `formatApiError` everywhere |
| `tokenFieldName` optional param for chunked upload | **YES — `live_id` as token field** | Use `tokenFieldName: 'live_id'` for upload-image |

---

## Environment Availability

Step 2.6: SKIPPED — Phase 4 is purely code additions. All external dependencies (Node.js, npm packages) confirmed present in Phase 3. No new external tools required.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest (config: `packages/twentythree-cli/vitest.config.ts`) |
| Config file | `packages/twentythree-cli/vitest.config.ts` |
| Quick run command | `pnpm --filter twentythree-cli exec vitest run --reporter=dot` |
| Full suite command | `pnpm --filter twentythree-cli exec vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAT-01 | `category list` paginates and renders table | unit (mock apiClient) | `vitest run src/commands/category/__tests__/list.test.ts` | Wave 0 |
| CAT-02 | `category create` sends `title` to `/album/create`, prints ID | unit | `vitest run src/commands/category/__tests__/create.test.ts` | Wave 0 |
| CAT-03 | `category update` flag mode sends only provided fields | unit | `vitest run src/commands/category/__tests__/update.test.ts` | Wave 0 |
| CAT-04 | `category delete` prompts with domain, calls `/album/delete` | unit | `vitest run src/commands/category/__tests__/delete.test.ts` | Wave 0 |
| WEB-01 | `webinar list` paginates and renders table with `live_id` | unit (mock apiClient) | `vitest run src/commands/webinar/__tests__/list.test.ts` | Wave 0 |
| WEB-02 | `webinar create` sends `name` field (not `title`) | unit | `vitest run src/commands/webinar/__tests__/create.test.ts` | Wave 0 |
| WEB-03 | `webinar update` flag mode maps `--title` → `body.name`, `--live-date` → `body.start_time` | unit | `vitest run src/commands/webinar/__tests__/update.test.ts` | Wave 0 |
| WEB-04 | `webinar delete` prompts and calls `/live/delete` | unit | `vitest run src/commands/webinar/__tests__/delete.test.ts` | Wave 0 |
| WEB-05 | `webinar upload-image` uses chunked engine with `tokenFieldName: 'live_id'` | unit | `vitest run src/commands/webinar/__tests__/upload-image.test.ts` | Wave 0 |
| WEB-06 | `webinar metrics` renders two-column table from `{metric, value, formated}[]` | unit | `vitest run src/commands/webinar/__tests__/metrics.test.ts` | Wave 0 |
| WEB-07 | `webinar clips` renders table, required `live_id` query param present | unit | `vitest run src/commands/webinar/__tests__/clips.test.ts` | Wave 0 |
| WEB-08 | `webinar highlights` renders table, required `live_id` query param present | unit | `vitest run src/commands/webinar/__tests__/highlights.test.ts` | Wave 0 |
| WEB-09 | `webinar list-formats` renders key/name table with no required params | unit | `vitest run src/commands/webinar/__tests__/list-formats.test.ts` | Wave 0 |
| WEB-10 | `webinar log` renders event/time table with required `live_id` | unit | `vitest run src/commands/webinar/__tests__/log.test.ts` | Wave 0 |
| WEB-11 | `webinar repeat` sends `live_id` + `schedule_start_time`, outputs new live_id | unit | `vitest run src/commands/webinar/__tests__/repeat.test.ts` | Wave 0 |
| (engine) | `ChunkedUploadParams.extraFields` appended to FormData per chunk | unit | `vitest run src/upload/__tests__/chunked-upload.test.ts` | Extend existing |

All command tests follow the established mock pattern used in Phase 3: mock `this.apiClient` via `vi.fn()`, pass through `AuthenticatedCommand` test helpers.

### Sampling Rate

- **Per task commit:** `pnpm --filter twentythree-cli exec vitest run --reporter=dot`
- **Per wave merge:** `pnpm --filter twentythree-cli exec vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/commands/category/__tests__/list.test.ts` — covers CAT-01
- [ ] `src/commands/category/__tests__/create.test.ts` — covers CAT-02
- [ ] `src/commands/category/__tests__/update.test.ts` — covers CAT-03
- [ ] `src/commands/category/__tests__/delete.test.ts` — covers CAT-04
- [ ] `src/commands/webinar/__tests__/list.test.ts` — covers WEB-01
- [ ] `src/commands/webinar/__tests__/create.test.ts` — covers WEB-02
- [ ] `src/commands/webinar/__tests__/update.test.ts` — covers WEB-03
- [ ] `src/commands/webinar/__tests__/delete.test.ts` — covers WEB-04
- [ ] `src/commands/webinar/__tests__/upload-image.test.ts` — covers WEB-05
- [ ] `src/commands/webinar/__tests__/metrics.test.ts` — covers WEB-06
- [ ] `src/commands/webinar/__tests__/clips.test.ts` — covers WEB-07
- [ ] `src/commands/webinar/__tests__/highlights.test.ts` — covers WEB-08
- [ ] `src/commands/webinar/__tests__/list-formats.test.ts` — covers WEB-09
- [ ] `src/commands/webinar/__tests__/log.test.ts` — covers WEB-10
- [ ] `src/commands/webinar/__tests__/repeat.test.ts` — covers WEB-11

Framework install: None — vitest already configured.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `liveList` runtime response has `live_id` as the primary item identifier (not `photo_id` as shown in OpenAPI schema) | Endpoint Reference — liveList | List command shows wrong ID column; `fetchWebinarToken` lookup by live_id fails |
| A2 | `webinar list` runtime response includes `name` field for webinar title (OpenAPI schema shows `title`) | Table columns for webinar list | List table shows blank title column |
| A3 | Chunked engine for `upload-image` is accepted by the API (server handles resumable.js params on a multipart-declared endpoint) | Pattern 5 | Upload-image fails with 400; would need direct multipart POST instead |

---

## Open Questions

1. **Does `live/upload-image` actually accept chunked/resumable.js protocol?**
   - What we know: The spec declares `multipart/form-data`. The locked decision mandates the chunked engine.
   - What's unclear: Whether the server-side handler for `live/upload-image` supports resumable.js headers alongside the `live_id` field, or expects a plain single-part POST.
   - Recommendation: Proceed with chunked engine per locked decision. If upload fails with 400, the fallback is to use direct multipart POST (would be a Rule 2 deviation requiring user sign-off).

2. **`webinar list` response field names at runtime**
   - What we know: The OpenAPI schema for `liveList` 200 response shows video-centric field names (`photo_id`, `title`). The API description text mentions `live_id` and `name`.
   - What's unclear: Whether the runtime response actually uses `photo_id`/`title` (schema) or `live_id`/`name` (description text).
   - Recommendation: The `as any` cast handles both; use `item.live_id ?? item.photo_id` for the ID column and `item.name ?? item.title` for the title column in table output.

---

## Sources

### Primary (HIGH confidence)
- `[VERIFIED: packages/twentythree-cli/src/api/types.ts]` — all endpoint request/response shapes (openapi-typescript generated from live spec)
- `[VERIFIED: packages/twentythree-cli/src/lib/base-command.ts]` — fetchVideoToken pattern for fetchWebinarToken
- `[VERIFIED: packages/twentythree-cli/src/upload/chunked-upload.ts]` — tokenFieldName param, extraFields gap
- `[VERIFIED: packages/twentythree-cli/src/commands/video/]` — all Phase 3 command patterns
- `[VERIFIED: packages/twentythree-cli/src/lib/output.ts]` — renderTable, formatApiError, parseBoolParam, formatJsonOutput
- `[VERIFIED: packages/twentythree-cli/src/lib/term-map.ts]` — applyCliTerms
- `[VERIFIED: .planning/STATE.md]` — Phase 3 accumulated decisions (tokenFieldName, as any cast, formatApiError)

### Secondary (MEDIUM confidence)
- `[CITED: 04-CONTEXT.md]` — locked decisions for Phase 4

---

## Metadata

**Confidence breakdown:**
- Endpoint shapes: HIGH — read directly from committed types.ts
- Architecture patterns: HIGH — mirroring verified Phase 3 implementations
- Pitfalls: HIGH — derived from types.ts analysis and STATE.md Phase 3 learnings
- `extraFields` engine gap: HIGH — verified by reading chunked-upload.ts and types.ts
- Runtime response field names for liveList: LOW — schema mismatch is documented but runtime behavior not verified in this session (flagged as A1/A2 assumptions)

**Research date:** 2026-04-14
**Valid until:** 2026-06-14 (OpenAPI spec is stable; valid until next major API revision)
