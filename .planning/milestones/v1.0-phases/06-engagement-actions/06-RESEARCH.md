# Phase 6: Engagement & Actions - Research

**Researched:** 2026-04-15
**Domain:** TwentyThree CLI — action CTAs, collectors, comments, players, tags
**Confidence:** HIGH

---

## Summary

Phase 6 adds 28 commands across five top-level topics: `action`, `collector`, `comment`, `player`, and `tag`. All five resource groups are already declared in `src/api/types.ts` with exact parameter shapes verified directly from the generated OpenAPI types. Every command follows patterns established in Phases 3–5; no new infrastructure is needed.

The only structural novelty is the `comment reaction` 3-level topic (`comment reaction add/list/remove`). Oclif v4 with `topicSeparator: " "` resolves topics purely by directory structure — a file at `src/commands/comment/reaction/add.ts` produces the command `comment reaction add` with no additional configuration required. This is confirmed by examining Phase 5's `webinar recording start` and `webinar mail preview` (2-level nesting) and noting that oclif discovers commands by file path, not explicit topic registration.

The `action upload` endpoint sends `action_id + variable_name + file` as multipart form data (no chunked upload token protocol). The `player embed` endpoint returns an `embed_code` string inside a JSON response (`data.embed_code`) — NOT raw HTML/text. The mail preview analogy from the CONTEXT.md is partially correct (process.stdout.write pattern), but the mechanism differs: mail preview uses native fetch + response.text() because the endpoint returns raw HTML; player/embed uses openapi-fetch and extracts `data.embed_code` from the JSON body. Both end in `process.stdout.write(output)` for pipeable output.

**Primary recommendation:** Use existing patterns verbatim. The only new technique is the simple FormData multipart POST for `action upload` (not chunked, not openapi-fetch for the file part — use native fetch with FormData).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-1: `action upload` — simple multipart, no chunked engine**
`/action/upload` takes `action_id` + `variable_name` + a file. Unlike video/attachment/avatar uploads, there is no `upload_token` in the body — the file goes directly to an action variable.
Decision: Use a simple multipart `FormData` POST via native `fetch`, not the chunked engine. No progress bar (no token/chunked protocol). Just post the file in one request.
CLI: `twentythree action upload <action-id> <variable-name> <file>`

**D-2: `comment` — standalone generic topic**
Comments use `object_id` + `object_type` — they can belong to videos, webinars, or categories. Not nested under any resource.
Decision: Standalone `comment` topic with `--object-id` and `--object-type` flags. Follow API parameter naming exactly — `object_id` → `--object-id`, never aliased.
`object_type` values pass through as-is (API native: `photo`, `album`, `live`). No term-mapping on `--object-type` values.

**D-3: `comment reaction` — 3-level oclif topic, follow API namespace**
Decision: Use 3-level oclif topic: `comment reaction add`, `comment reaction list`, `comment reaction remove`.
Token auto-lookup pattern applies for `object_token` when `--object-type` indicates a resource that supports it.

**D-4: `player embed` — raw HTML/JS to stdout**
Decision: Print raw embed code via `process.stdout.write(output)`. No trailing newline. `--json` not applicable for raw mode (returns embed_code field as data).
CLI: `twentythree player embed --photo-id 123 > embed.html`
Term mapping: `live_id` → `--webinar-id`, `photo_id` → `--video-id`, `album_id` → `--category-id`.

**D-5: `action get` — single flexible command with optional context flags**
Decision: Single `action get` command. All context fields are optional flags. API parameter naming rules apply:
- `live_id` → `--webinar-id`
- `photo_id` → `--video-id`
- `object_id` → `--object-id`
- `action_id` positional arg (most common case)
- `token`, `player_id` → `--token`, `--player-id`

### Established Patterns (Locked)

- **Term mapping**: `live_*` → `webinar-*`, `photo_*` → `video-*`, `album_*` → `category-*`, `object` → stays as `object`
- **Boolean `_p` suffix**: drop `_p` in CLI flags (e.g., `open_p` → `--open`)
- **Action commands**: single green success line; `--json` returns `{ ok, data, summary, breadcrumbs }`
- **List commands**: `renderTable()` + dim count line; empty state: "No X found."
- **Chunked uploads**: NOT for action/upload (see D-1)
- **Raw HTML output**: native `fetch` + `response.text()` + `process.stdout.write()` — no openapi-fetch
- **Confirmation prompts**: destructive commands confirm with domain in message; exit code 2 on cancel
- **`applyCliTerms()`**: applied to all user-facing strings and error messages

### Claude's Discretion

Not specified in CONTEXT.md — follow established patterns throughout.

### Deferred Ideas (OUT OF SCOPE)

Not specified in CONTEXT.md.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ACT-01 | `twentythree action list` lists CTAs for a given video/webinar | `GET /action/get` with `object_id` or `photo_id`/`live_id`; returns array under `data` |
| ACT-02 | `twentythree action get` fetches actions by object or action ID | `GET /action/get` — all params optional, positional `action_id` |
| ACT-03 | `twentythree action types` lists available action type definitions | `GET /action/types` with optional `exclude_internal_p` |
| ACT-04 | `twentythree action add` creates a new CTA | `POST /action/add` — `type` + `object_id` required |
| ACT-05 | `twentythree action update <id>` modifies action | `POST /action/update` — `action_id` + `name` + `start_time` + `end_time` required |
| ACT-06 | `twentythree action delete <id>` removes a CTA with confirmation | `POST /action/delete` — `action_id` required |
| ACT-07 | `twentythree action include <id>` adds object to CTA scope | `POST /action/include` — `action_id` + `object_id`; optional `remove_inclusion_p` |
| ACT-08 | `twentythree action exclude <id>` blocks CTA from object | `POST /action/exclude` — `action_id` + `object_id`; optional `remove_exclusion_p` |
| ACT-09 | `twentythree action upload <id>` uploads file to action variable | `POST /action/upload` multipart — `action_id` + `variable_name` + file (D-1) |
| COL-01 | `twentythree collector list` lists workspace collectors | `GET /collector/list` — optional `object_id`, `include_analytics_p` |
| COL-02 | `twentythree collector include <id>` attaches collector | `GET /collector/include` — `action_id` + `object_id` (note: parameter name is `action_id` not `collector_id`) |
| COL-03 | `twentythree collector exclude <id>` blocks collector | `GET /collector/exclude` — `action_id` + `object_id` |
| CMT-01 | `twentythree comment list` lists comments | `GET /comment/list` — optional `object_id`, `object_type`, pagination |
| CMT-02 | `twentythree comment add` adds a comment | `POST /comment/add` — `object_id` + `object_type` required |
| CMT-03 | `twentythree comment update <id>` updates a comment | `POST /comment/update` — `object_id` + `comment_id`; optional `comment_status` |
| CMT-04 | `twentythree comment delete <id>` deletes with confirmation | `POST /comment/delete` — `comment_id` required |
| CMT-05 | `twentythree comment promote <id>` promotes a comment | `POST /comment/promote` — `comment_id`; optional `promoted_p` |
| CMT-06 | `twentythree comment clone <id>` clones a comment | `GET /comment/clone` — optional `comment_id`, `clone_comment_type` |
| CMT-07 | `twentythree comment set-order <id>` sets display order | `POST /comment/set-order` — `object_id` + `order` (CSV comment IDs) |
| CMT-08 | `comment reaction add/list/remove` — 3-level topic | GET endpoints; `comment_id`/`reaction_emoji`/`object_id`/`object_token` params |
| PLY-01 | `twentythree player list` lists players | `POST /player/list` — pagination params; returns `player_id`, `player_name`, `default_p` |
| PLY-02 | `twentythree player update <id>` updates player | `POST /player/update` — `player_id` required |
| PLY-03 | `twentythree player delete <id>` deletes with confirmation | `POST /player/delete` — `player_id` required |
| PLY-04 | `twentythree player embed <id>` generates embed code | `GET /player/embed` — response is JSON with `data.embed_code` string |
| PLY-05 | `twentythree player embed-versions` lists embed versions | `GET /player/embed-versions` — `object_type` + `object_id` required |
| PLY-06 | `twentythree player styles` lists player styles | `GET /player/styles` — no required params |
| TAG-01 | `twentythree tag list` lists tags | `GET /tag/list` — optional search, filters, pagination |
| TAG-02 | `twentythree tag related` lists related tags | `GET /tag/related` — `tag` required |
</phase_requirements>

---

## Standard Stack

No new dependencies required for this phase. All needed libraries are already installed.

### Core (Already Installed)

| Library | Version | Purpose |
|---------|---------|---------|
| `@oclif/core` | `^4.10.5` | Command framework, flag parsing, topic routing |
| `openapi-fetch` | `^0.17.0` | Typed API calls for all non-file-upload endpoints |
| `chalk` | `^4.1.2` | Green success lines, dim count lines |
| `cli-table3` | `^0.6.5` | Table rendering in list commands |
| `@clack/prompts` | `^1.2.0` | Confirmation prompts for destructive commands |

**Installation:** No new packages needed.

**Note on `action upload`:** Uses native `fetch` (built into Node.js 18+) with `FormData`. No new dependency required. [VERIFIED: codebase — mail/preview.ts already uses native fetch; Node.js built-in]

---

## Architecture Patterns

### Recommended Project Structure

```
src/commands/
├── action/
│   ├── add.ts
│   ├── delete.ts
│   ├── exclude.ts
│   ├── get.ts
│   ├── include.ts
│   ├── types.ts
│   ├── update.ts
│   └── upload.ts
├── collector/
│   ├── exclude.ts
│   ├── include.ts
│   └── list.ts
├── comment/
│   ├── add.ts
│   ├── clone.ts
│   ├── delete.ts
│   ├── list.ts
│   ├── promote.ts
│   ├── set-order.ts
│   ├── update.ts
│   └── reaction/
│       ├── add.ts
│       ├── list.ts
│       └── remove.ts
├── player/
│   ├── delete.ts
│   ├── embed-versions.ts
│   ├── embed.ts
│   ├── list.ts
│   ├── styles.ts
│   └── update.ts
└── tag/
    ├── list.ts
    └── related.ts
```

### Pattern 1: Standard List Command (GET query params)

Used by: `collector list`, `comment list`, `tag list`, `action get`, `action types`

```typescript
// Source: packages/twentythree-cli/src/commands/webinar/clips.ts
const { data, error } = await this.apiClient.GET('/collector/list', {
  params: { query: { object_id: flags['object-id'] ? Number(flags['object-id']) : undefined } },
})
if (error) {
  this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
}
const resp = data as any
const items: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []
```

### Pattern 2: Standard Action Command (POST form)

Used by: `action add/delete/update/exclude/include`, `comment add/delete/update/promote/set-order`, `player delete/update`

```typescript
// Source: packages/twentythree-cli/src/commands/video/delete.ts
const { data: respData, error } = await this.apiClient.POST('/action/delete', {
  body: { action_id: Number(args.id) } as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
if (error) {
  this.error(applyCliTerms(String(error)), { exit: EXIT_ERROR })
}
this.log(chalk.green(`Action ${args.id} deleted`))
```

### Pattern 3: Paginated List (POST form body pagination)

Used by: `player list` (NOTE: `player/list` is POST not GET — pagination params go in form body)

```typescript
// Source: packages/twentythree-cli/src/lib/pagination.ts pattern
// player/list uses POST with form body — cannot use fetchAllPages directly
// Use fetchAllPages with POST body pagination pattern
const { data, error } = await this.apiClient.POST('/player/list', {
  body: { p: page, size } as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
```

### Pattern 4: Simple Multipart File Upload (action upload)

Used by: `action upload` only — no chunked protocol.

```typescript
// Source: packages/twentythree-cli/src/commands/webinar/mail/preview.ts (native fetch pattern)
// D-1: FormData POST — no upload_token, no chunked engine
const formData = new FormData()
formData.append('action_id', String(actionId))
formData.append('variable_name', variableName)
formData.append('file', new Blob([await readFile(filePath)]), basename(filePath))

const headers: HeadersInit = {}
if (this.activeWorkspace.bearer_token) {
  headers['Authorization'] = `Bearer ${this.activeWorkspace.bearer_token}`
}
const response = await fetch(`${this.apiBaseUrl}action/upload`, {
  method: 'POST',
  headers,
  body: formData,
})
const json = await response.json()
if (!response.ok) {
  this.error(applyCliTerms(`API error ${response.status}: ${JSON.stringify(json)}`), { exit: EXIT_ERROR })
}
```

### Pattern 5: Raw Output to stdout (player embed)

CRITICAL CORRECTION vs CONTEXT.md D-4: `/player/embed` returns JSON with `data.embed_code` field — it is NOT a raw HTML endpoint like `mail/preview`. The embed code is a string value inside the standard JSON envelope.

**Implementation:** Use openapi-fetch to get the typed JSON response, extract `data.embed_code`, then write to stdout.

```typescript
// Source: packages/twentythree-cli/src/commands/webinar/mail/preview.ts (stdout write pattern)
// But use openapi-fetch (not native fetch) since embed returns JSON
const { data, error } = await this.apiClient.GET('/player/embed', {
  params: { query: { photo_id: flags['video-id'] ? Number(flags['video-id']) : undefined, ... } },
})
if (error) {
  this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
}
const embedCode = (data as any)?.data?.embed_code ?? ''

if (this.jsonEnabled()) {
  return formatJsonOutput({ ok: true, data: embedCode, summary: 'Embed code', breadcrumbs: [...] })
}

// D-4: write raw to stdout without trailing newline (pipeable)
process.stdout.write(embedCode)
```

### Pattern 6: 3-Level oclif Topic

Used by: `comment reaction add/list/remove`

Directory structure alone creates the 3-level topic. No package.json changes needed. [VERIFIED: oclif v4 docs — commands are discovered by file path from `./dist/commands`; `topicSeparator: " "` in package.json is already set]

```
src/commands/comment/reaction/add.ts
→ exports default class CommentReactionAdd extends AuthenticatedCommand
→ CLI invocation: twentythree comment reaction add
```

The class name should follow the compound naming: `CommentReactionAdd`, `CommentReactionList`, `CommentReactionRemove`.

### Pattern 7: GET Query Endpoint for Action/Mutation Endpoints

Several "action" endpoints (collector exclude/include, comment reaction commands) are GET requests despite mutating state. Use `this.apiClient.GET()` for these:

```typescript
// Source: types.ts — collectorExclude, collectorInclude, commentReactionAdd are all GET
const { data, error } = await this.apiClient.GET('/collector/exclude', {
  params: { query: { action_id: Number(args.id), object_id: Number(flags['object-id']) } },
})
```

### Anti-Patterns to Avoid

- **Using `apiClient.POST` for GET endpoints:** `collector/exclude`, `collector/include`, `comment/reaction/add`, `comment/reaction/list`, `comment/reaction/remove`, `comment/clone`, `action/types`, `action/get` are all GET — verify in types.ts before choosing method
- **Using chunked upload for `action upload`:** D-1 is explicit — simple FormData POST only
- **Adding `--json` skip for non-destructive confirmation prompts:** Only destructive commands (delete) skip confirmation in `--json` mode
- **Treating `player/embed` as a raw HTML endpoint:** It returns JSON; extract `data.embed_code`
- **Registering topics in package.json:** oclif v4 auto-discovers by directory; no explicit topic list needed

---

## Critical Discovery: `player/embed` Returns JSON, Not Raw HTML

The CONTEXT.md D-4 says "use native `fetch` + `response.text()`" citing the `mail preview` pattern. This is WRONG for `player/embed`.

**Evidence from types.ts (line 17571–17586):**
```
content: {
  "application/json": {
    data?: {
      embed_code?: string;
    };
  };
};
```

The endpoint returns a standard JSON envelope. The embed code is in `data.embed_code`. The correct implementation:
1. Use `this.apiClient.GET('/player/embed', ...)` — type-safe JSON
2. Extract `(data as any)?.data?.embed_code`
3. In normal mode: `process.stdout.write(embedCode)` — pipeable, no trailing newline
4. In `--json` mode: return `formatJsonOutput({ data: embedCode, ... })`

This means `--json` IS applicable (wraps the code in the standard envelope), unlike CONTEXT.md's "not applicable" note.

[VERIFIED: src/api/types.ts line 17571]

---

## Critical Discovery: `collector/exclude` and `collector/include` Use `action_id` Not `collector_id`

The OpenAPI types use `action_id` (not `collector_id`) for the collector ID parameter in both `collectorExclude` and `collectorInclude`. Collectors are a subtype of action — they share the same ID space.

**CLI mapping:** The positional arg is `<id>` (the collector ID), and internally it maps to `action_id` in the request body.

```typescript
// collectorExclude query: { action_id: number, object_id: number }
// collectorInclude query: { action_id: number, object_id: number }
// collectorList response: data[].action_id (not collector_id)
```

[VERIFIED: src/api/types.ts lines 5897–6107]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Pagination for GET list commands | Custom page loop | `fetchAllPages()` from `src/lib/pagination.ts` |
| Pagination for POST list commands | N/A — player/list may not need full auto-pagination | Use same `fetchAllPages` pattern adapted for POST body |
| Multipart file upload | Raw XHR/fetch body construction | Native `FormData` + `Blob` — built into Node.js |
| Error term mapping | Manual string replace | `applyCliTerms()` from `src/lib/term-map.ts` |
| Success/error JSON shape | Custom format | `formatJsonOutput()` from `src/lib/output.ts` |
| Table rendering | Custom column formatting | `renderTable()` from `src/lib/output.ts` |
| API error serialization | `String(error)` or JSON.stringify | `formatApiError()` from `src/lib/output.ts` |

---

## Complete API Parameter Reference

### Action Commands

**`/action/add` POST form:**
- `type: string` (required) — action type from `/action/types`
- `object_id: string` (required) — video, category, workspace, or player ID
- `fields?: string`

**`/action/delete` POST form:**
- `action_id: number` (required)

**`/action/exclude` POST form:**
- `action_id: number` (required)
- `object_id: number` (required)
- `remove_exclusion_p?: boolean` — set true to undo exclusion

**`/action/include` POST form:**
- `action_id: number` (required)
- `object_id: number` (required)
- `remove_inclusion_p?: boolean` — set true to undo inclusion

**`/action/types` GET query:**
- `exclude_internal_p?: boolean`

**`/action/get` GET query (all optional):**
- `object_id?`, `action_id?`, `live_id?`, `photo_id?`, `token?`, `player_id?`
- `exclude_items_p?`, `exclude_pending_p?`, `exclude_internal_p?`

**`/action/update` POST form:**
- `action_id: number` (required)
- `name: string` (required)
- `start_time: string` (required)
- `end_time: string` (required)
- `time_relative_to?: string` (default: "duration")
- `return_url?: string`

**`/action/upload` POST multipart (D-1 — native fetch + FormData):**
- `action_id: number` (required)
- `variable_name: string` (required)
- `file: binary` (required — the actual file, not a token)

### Collector Commands

**`/collector/exclude` GET query:**
- `action_id: number` (required) — NOTE: this is the collector's ID (collectors share action ID space)
- `object_id: number` (required)

**`/collector/include` GET query:**
- `action_id: number` (required)
- `object_id: number` (required)

**`/collector/list` GET query:**
- `object_id?: number`
- `include_analytics_p?: boolean`

### Comment Commands

**`/comment/list` GET query:**
- `object_id?: number`
- `object_type?: "" | "photo" | "album"` — NOTE: no "live" in enum; use "photo" for video, "album" for category
- `comment_id?`, `comment_user_id?`, `comment_type?`, `search?`, `order?`
- `prioritize_promoted_p?`, `include_reply_to_comments_p?`, `include_reactions_p?`, `promoted_p?`
- `p?`, `size?` (pagination)

**`/comment/add` POST form:**
- `object_id: number` (required)
- `object_type: string` (required) — "photo" or "live"
- `object_token?: string`, `name?`, `email?`, `content?`, `url?`
- `comment_type?: "comment" | "question" | "chat"` (default: "comment")
- `reply_to_comment_id?`, `comment_time?`, `uuid?`
- `file?: string`, `file.tmpfile?: string` — file attachment; DO NOT SUPPORT in CLI (no path to provide binary)

**`/comment/delete` POST form:**
- `comment_id: number` (required)

**`/comment/promote` POST form:**
- `comment_id: number` (required)
- `promoted_p?: boolean` — omit to toggle

**`/comment/clone` GET query:**
- `comment_id?: number`
- `clone_comment_type?: "" | "chat" | "question" | "comment"`

**`/comment/set-order` POST form:**
- `object_id: number` (required) — the webinar ID
- `order: string` (required) — comma-separated comment IDs
- `comment_type?: string` (default: "question")

**`/comment/update` POST form:**
- `object_id: number` (required)
- `comment_id: number` (required)
- `comment_status?: "" | "answered" | "dismissed"`

**`/comment/reaction/add` GET query:**
- `comment_id: number` (required)
- `reaction_emoji: string` (required)
- `object_id: number` (required)
- `object_token: string` (required)
- `object_type?: "live" | "photo" | "album"`
- `uuid?: string`

**`/comment/reaction/list` GET query:**
- `object_id: number` (required)
- `object_token: string` (required)
- `object_type?: "live" | "photo" | "album"`
- `uuid?: string`

**`/comment/reaction/remove` GET query:**
- `comment_id: number` (required)
- `reaction_emoji: string` (required)
- `object_id: number` (required)
- `object_token: string` (required)
- `object_type?: "live" | "photo" | "album"`
- `uuid?: string`

### Player Commands

**`/player/list` POST form:**
- `p?: number`, `size?: number`, `source?: string`

**`/player/update` POST form:**
- `player_id: number` (required)

**`/player/delete` POST form:**
- `player_id: number` (required)

**`/player/embed` GET query (returns JSON `{ data: { embed_code } }`):**
- `url?`, `photo_id?`, `live_id?`, `album_id?`, `player_id?`
- `width?`, `height?`, `responsive_p?`, `token?`
- `include_unpublished_p?`, `autoplay_p?`, `start?`
- `iframe_p?`, `source?`, `stripped_p?`
- `include_seo_metadata_p?`, `include_object_info_p?`
- `user_id?`, `search?`, `tag?`, `end_on?`

**`/player/embed-versions` GET query:**
- `object_type: string` (required) — "photo", "live", "album", "site"
- `object_id: number` (required)
- `include_object_token_p?`, `include_seo_metadata_p?`, `source?`
- `email_image_size?`, `email_image_play_p?`, `email_image_time?`, `include_video_p?`

**`/player/styles` GET query:**
- `fields?: string` (no required params)

### Tag Commands

**`/tag/list` GET query:**
- `search?`, `reformat_tags_p?`, `exclude_machine_tags_p?`, `only_machine_tags_p?`
- `only_visible_albums_p?`, `only_published_p?`
- `p?`, `size?`, `orderby?: "tag" | "count"`, `order?: "desc" | "asc"`
- Response includes `total_count` for pagination

**`/tag/related` GET query:**
- `tag: string` (required)

---

## Flag Naming Reference (Term Mapping Applied)

| API Parameter | CLI Flag | Notes |
|---------------|----------|-------|
| `action_id` | positional `<id>` or `--action-id` | positional when primary |
| `object_id` | `--object-id` | stays as "object" per D-2 |
| `object_type` | `--object-type` | values pass through as-is (photo/album/live) |
| `object_token` | `--object-token` | stays as "object-token" |
| `photo_id` | `--video-id` | term map |
| `live_id` | `--webinar-id` | term map |
| `album_id` | `--category-id` | term map |
| `player_id` | `--player-id` or positional `<id>` | positional when primary |
| `comment_id` | positional `<id>` or `--comment-id` | positional when primary |
| `variable_name` | positional `<variable-name>` | action upload |
| `reaction_emoji` | `--reaction` | simplified name |
| `remove_exclusion_p` | `--undo` | simplify; or `--remove-exclusion` |
| `remove_inclusion_p` | `--undo` | simplify; or `--remove-inclusion` |
| `promoted_p` | `--promoted` | drop `_p` suffix |
| `include_analytics_p` | `--include-analytics` | drop `_p` suffix |
| `exclude_internal_p` | `--exclude-internal` | drop `_p` suffix |
| `responsive_p` | `--responsive` | drop `_p` suffix |
| `autoplay_p` | `--autoplay` | drop `_p` suffix |
| `iframe_p` | `--iframe` | drop `_p` suffix |
| `include_unpublished_p` | `--include-unpublished` | drop `_p` suffix |

---

## Comment/add File Attachment Decision

The `/comment/add` endpoint has `file?` and `file.tmpfile?` parameters. These are multipart binary fields used by web forms.

**Decision:** Do NOT support `--file` on `comment add` in Phase 6. The use case is narrow (attaching files to comments), there is no precedent in prior commands, and supporting binary file uploads requires switching the content-type to multipart/form-data, adding a file path arg, and using native fetch — all for a rarely-used feature. Treat as out of scope. Accept `content`, `name`, `email`, `url`, `comment_type`, `reply_to_comment_id`, `comment_time`, `uuid` flags only.

[ASSUMED — decision not locked in CONTEXT.md; planner should confirm or accept]

---

## Common Pitfalls

### Pitfall 1: Collector ID Parameter Named `action_id`
**What goes wrong:** Using `collector_id` in request body for `/collector/exclude` and `/collector/include`.
**Why it happens:** Collectors are a subtype of actions; they share the `action_id` ID space.
**How to avoid:** Always pass the collector's ID as `action_id` in the query params.
**Warning signs:** 400 error from API saying field unknown.

### Pitfall 2: `player/list` is POST, Not GET
**What goes wrong:** Using `apiClient.GET('/player/list', ...)` — types say POST with form body.
**Why it happens:** Pagination params go in the request body, not query string.
**How to avoid:** Use `apiClient.POST('/player/list', { body: {...}, headers: {'Content-Type': 'application/x-www-form-urlencoded'} })`.

### Pitfall 3: `player/embed` Returns JSON, Not Raw HTML
**What goes wrong:** Using native fetch + response.text() expecting HTML — actually gets JSON.
**Why it happens:** CONTEXT.md analogy to `mail/preview` is wrong for this endpoint.
**How to avoid:** Use `apiClient.GET('/player/embed', ...)` and extract `(data as any)?.data?.embed_code`.

### Pitfall 4: comment/list `object_type` Enum Missing "live"
**What goes wrong:** Passing `object_type: "live"` to `/comment/list` — the enum is `"" | "photo" | "album"`.
**Why it happens:** comment/add accepts "live" for object_type, but comment/list has a different enum.
**How to avoid:** In `comment list`, accept the user's term-mapped value but pass the API native value — if user passes `--object-type webinar` (which they won't because D-2 says no term mapping), note that "live" is not in the list enum. The CONTEXT.md says values pass through as-is, so users use API native terms (photo/album).

### Pitfall 5: 3-Level Topic Class Naming
**What goes wrong:** Class named `CommentReaction` instead of `CommentReactionAdd` — oclif uses the class description, not file name, for help text.
**Why it happens:** Forgetting the verb suffix in the class name.
**How to avoid:** Follow `WebinarMailPreview` / `WebinarRecordingStart` naming: Topic1+Topic2+Verb.

### Pitfall 6: `remove_exclusion_p` / `remove_inclusion_p` in `action exclude/include`
**What goes wrong:** Omitting support for the `--undo` flag, making it impossible to reverse an include or exclude.
**Why it happens:** The requirement text only mentions adding the include/exclude.
**How to avoid:** Add `--undo` or `--remove` boolean flag to both `action exclude` and `action include` commands, mapping to `remove_exclusion_p` and `remove_inclusion_p` respectively.

---

## Code Examples

### List Command with Pagination (GET)

```typescript
// Source: packages/twentythree-cli/src/commands/video/list.ts
import { fetchAllPages } from '../../lib/pagination.js'

const items = await fetchAllPages<any>(async (page, size) => {
  const { data, error } = await this.apiClient.GET('/tag/list', {
    params: { query: { p: page, size } },
  })
  if (error) this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
  const resp = data as any
  const arr: unknown[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []
  return { data: arr, total_count: resp?.total_count }
})
```

### Simple GET Query Command

```typescript
// Source: packages/twentythree-cli/src/commands/webinar/clips.ts
const { data, error } = await this.apiClient.GET('/tag/related', {
  params: { query: { tag: args.tag } },
})
if (error) this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
const resp = data as any
const items: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []
```

### Destructive Command with Confirmation

```typescript
// Source: packages/twentythree-cli/src/commands/video/delete.ts
import { confirm, isCancel } from '@clack/prompts'
import { EXIT_CANCELLED } from '../../lib/output.js'

if (!this.jsonEnabled()) {
  const confirmed = await confirm({
    message: `Delete action ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
  })
  if (isCancel(confirmed) || !confirmed) {
    process.exit(EXIT_CANCELLED)
  }
}
```

### Native Fetch for Multipart (action upload)

```typescript
// Pattern from: packages/twentythree-cli/src/commands/webinar/mail/preview.ts (native fetch)
import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'

const fileBuffer = await readFile(args.file)
const formData = new FormData()
formData.append('action_id', String(Number(args.id)))
formData.append('variable_name', args['variable-name'])
formData.append('file', new Blob([fileBuffer]), basename(args.file))

const headers: HeadersInit = {}
if (this.activeWorkspace.bearer_token) {
  headers['Authorization'] = `Bearer ${this.activeWorkspace.bearer_token}`
}
const response = await fetch(`${this.apiBaseUrl}action/upload`, { method: 'POST', headers, body: formData })
if (!response.ok) {
  const body = await response.text()
  this.error(applyCliTerms(`Upload failed (${response.status}): ${body}`), { exit: EXIT_ERROR })
}
const json = await response.json() as any
```

---

## oclif 3-Level Topic Registration

**Verified behavior:** oclif v4 with `"commands": "./dist/commands"` and `"topicSeparator": " "` discovers commands purely from the filesystem. A file at `dist/commands/comment/reaction/add.js` with a default export extending `Command` is automatically registered as `comment reaction add`. No explicit topic configuration in `package.json` is needed.

**Evidence:** The existing pattern for `webinar speaker list` (file: `src/commands/webinar/speaker/list.ts`) works identically. Adding a third nesting level follows the same principle.

**Class naming convention (from existing codebase):**
- `webinar/speaker/list.ts` → `WebinarSpeakerList`
- `webinar/mail/preview.ts` → `WebinarMailPreview`
- `comment/reaction/add.ts` → `CommentReactionAdd`

[VERIFIED: packages/twentythree-cli/src/commands/webinar/speaker/list.ts, webinar/mail/preview.ts]

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest `^4.1.4` |
| Config file | vitest.config.ts (or root vitest) |
| Quick run command | `pnpm --filter twentythree-cli test` |
| Full suite command | `pnpm --filter twentythree-cli test` |

### Phase Requirements → Test Map

Phase 6 commands follow the same pattern as Phase 3–5: behavior is tested via unit tests on shared lib functions, not per-command integration tests (no live API in CI). The shared helpers already have good coverage.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ACT-09 | FormData multipart upload constructs correct body | unit | `pnpm --filter twentythree-cli test -- action` | ❌ Wave 0 |
| PLY-04 | player embed extracts embed_code from JSON response | unit | `pnpm --filter twentythree-cli test -- player` | ❌ Wave 0 |
| CMT-08 | comment reaction 3-level topic resolves correctly | smoke (manual) | `twentythree comment reaction --help` | N/A |

### Wave 0 Gaps

- [ ] No new test files needed for shared utilities — all helpers already tested
- [ ] Per-command smoke tests are manual (oclif command dispatch verified by TypeScript compilation + `oclif manifest`)
- [ ] `action/upload` FormData construction may benefit from a unit test

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `comment/add` file attachment should not be supported in Phase 6 | Comment/add File Attachment Decision | If the user wants file-attached comments, they cannot do it via CLI |
| A2 | `player/list` auto-pagination should use same fetchAllPages pattern adapted for POST body | Pattern 3 | If API returns all players in one page (typical for small workspaces), pagination is irrelevant anyway |
| A3 | `--undo` is the right flag name for reversing include/exclude operations | Flag Naming Reference | Name disagreement with user preference — easy to rename |

---

## Open Questions

1. **`action get` vs `action list`**
   - What we know: CONTEXT.md lists both `action get` (D-5) and `action list` in the API inventory; both use `/action/get` endpoint
   - What's unclear: Should `action list` and `action get` be separate commands, or is `action list` just `action get` with `--object-id`?
   - Recommendation: Implement as two commands — `action list` (requires `--object-id` or `--video-id`/`--webinar-id`, renders a table) and `action get` (flexible, renders detail); both call `/action/get` with different defaults

2. **`comment reaction` `object_token` requirement**
   - What we know: All three reaction endpoints require `object_token` (required field, not optional)
   - What's unclear: CONTEXT.md D-3 says "Token auto-lookup pattern applies when `--object-type` indicates a resource that supports it" — but comment/list does not return object tokens
   - Recommendation: Require `--object-token` explicitly for reaction commands (no auto-lookup available without a separate `/photo/list` or `/live/list` call); document clearly

3. **`player update` — what fields are updatable?**
   - What we know: The OpenAPI type for `playerUpdate` only shows `player_id` and `fields` — no other settable properties in the generated types
   - What's unclear: The actual player settings (name, style, etc.) may be in an untyped `data` field
   - Recommendation: Implement `player update` with `player_id` positional arg and a `--data` JSON string escape hatch (same as prior update commands that have sparse type coverage)

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — pure code additions using already-installed packages)

---

## Sources

### Primary (HIGH confidence)
- `packages/twentythree-cli/src/api/types.ts` — all API parameter shapes verified directly from generated OpenAPI types
- `packages/twentythree-cli/src/commands/video/list.ts` — list command pattern
- `packages/twentythree-cli/src/commands/video/delete.ts` — action command + confirmation pattern
- `packages/twentythree-cli/src/commands/webinar/mail/preview.ts` — native fetch + stdout.write pattern
- `packages/twentythree-cli/src/commands/webinar/speaker/list.ts` — 2-level topic pattern (baseline for 3-level)
- `packages/twentythree-cli/src/commands/webinar/recording/start.ts` — 2-level topic action pattern
- `packages/twentythree-cli/src/lib/base-command.ts` — AuthenticatedCommand, fetchVideoToken, fetchWebinarToken
- `packages/twentythree-cli/src/lib/output.ts` — all helper functions
- `packages/twentythree-cli/package.json` — oclif config (topicSeparator, commands path)

### Secondary (MEDIUM confidence)
- oclif v4 directory-based command discovery — inferred from package.json config + working Phase 5 patterns

---

## Metadata

**Confidence breakdown:**
- API parameter shapes: HIGH — verified from types.ts directly
- Architecture patterns: HIGH — verified from multiple existing command files
- oclif 3-level topic: HIGH — inferred from working 2-level pattern + oclif filesystem discovery mechanism
- player/embed JSON correction: HIGH — verified from types.ts response shape

**Research date:** 2026-04-15
**Valid until:** 2026-06-01 (stable — no moving dependencies)
