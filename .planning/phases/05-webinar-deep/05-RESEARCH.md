# Phase 5: Webinar Deep — Research

**Researched:** 2026-04-15
**Domain:** TwentyThree CLI — webinar sub-resource commands (speakers, mail, recording, transcription, series, room, polls, attachments, sections, queued videos)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

1. **Action command output** — Commands with no data row (`webinar recording start|stop`, `webinar mail send|test`, `webinar speaker send-invitation|request-guest|cancel-guest-request`, `webinar attachment set-hidden`, `webinar queued-video add|remove`) output a single green success line. `--json` returns `{ ok: true, data: <api response>, summary: '<action>' }`.

2. **Poll set-options UX + interactive fallback** — `poll set-options` uses repeated `--option` flags (`Flags.string({ multiple: true })`). All Phase 5 commands with required inputs fall back to `@clack/prompts` interactive prompts when required flags are not provided. Flag mode vs interactive fallback is the standard pattern throughout.

3. **Mail preview output** — `webinar mail preview` prints raw HTML to stdout. No special rendering, no temp file.

4. **Token lookup** — Accept optional `--token` flag; if omitted, auto-lookup via `fetchWebinarToken(id)` (already exists on `AuthenticatedCommand`). Applies to all Phase 5 sub-resource commands that need a token param: speaker, mail, section, attachment, recording, transcription, room, series.

5. **Carrying forward from Phase 4** — Chunked engine for all file uploads; `tokenFieldName: 'live_id'` for webinar-scoped uploads; `extraFields` for upload-type discrimination; cli-table3 tables for list/read-only commands; `--json` everywhere with `{ ok, data, summary, breadcrumbs }`; `formatApiError`, `applyCliTerms`, exit codes 0/1/2; `fetchWebinarToken` auto-lookup; Admin URL after create: `/manage/webinar/<id>` for webinar resources; confirmation prompt (mentioning domain) before destructive deletes.

### Claude's Discretion

None stated — all key decisions were locked in discussion.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WEB-12 | `webinar attachment list|upload|delete|set-hidden <id>` — attachment upload uses chunked engine | Attachment list needs `token` param (auto-lookup); upload goes to `/live/attachment/upload` with `live_id` as token field; delete/set-hidden use standard form POST |
| WEB-13 | `webinar section list|add|update|remove <id>` — agenda sections | Section list needs `live_id` + `token`; add/update/remove are standard form POSTs; section identified by `live_section_id` |
| WEB-14 | `webinar speaker list|add|add-from-user|add-from-speaker|update|remove|set-avatar|remove-avatar|set-order|send-invitation|request-guest|cancel-guest-request|connection-types|library` | Speaker add requires `name` + `email` + `live_id`; set-avatar uses chunked upload with `live_speaker_id` token field; action commands (send-invitation, request-guest, cancel-guest-request) emit green success line only |
| WEB-15 | `webinar mail list|add|update|remove|preview|send|test` — webinar email communications | Mail add requires `subject` + `message`; preview is a GET returning raw HTML piped to stdout; send/test emit green success lines |
| WEB-16 | `webinar recording start|stop|status` — recording control | start/stop take only `live_id`; status is a GET with `live_id`; start/stop emit green success lines |
| WEB-17 | `webinar transcription list|connect|locales|transcriptionlist` — transcription management | list/locales need `token` auto-lookup; connect is a POST; `transcriptionlist` maps to `/live/transcriptionlist` (different path from `/live/transcription/list`) |
| WEB-18 | `webinar room info|themes|send-recording|connect` — room management | All are GETs except `send-recording` which is a POST; endpoints are `/live/webinar/info`, `/live/webinar/room-themes`, `/live/webinar/send-recording`, `/live/webinar/connect` |
| WEB-19 | `webinar series list|create|update|delete|metrics|recurrences|apply-recurrence|skip-recurrence|cancel|set-ondemand|mapped-objects|upload-thumbnail` | Series create requires `name`; upload-thumbnail uses chunked engine with `live_series_id` as token field; cancel/delete accept `cancel_associations_p`/`delete_associations_p` flags |
| WEB-20 | `webinar queued-video add|remove` — queued videos | add takes `live_id` + `photo_id` (CLI flag: `--video-id`); both emit green success lines |
| POL-01 | `poll list <id>` — list polls for a webinar | GET `/poll/list` with `object_id` (webinar id) + optional `object_token` |
| POL-02 | `poll add <id>` — create a new poll | POST `/poll/add` with `object_id` + `question` (required); interactive fallback when `--question` omitted |
| POL-03 | `poll update <id>` — update a poll | POST `/poll/update` with `poll_id` + optional `question`/`open_p`/`display_results_p` |
| POL-04 | `poll remove <id>` — remove a poll with confirmation | POST `/poll/remove` with `poll_id`; confirm prompt mentioning domain |
| POL-05 | `poll set-options <id>` — set poll options via repeated `--option` flags | POST `/poll/set-options` with `poll_id` + `options` (JSON-encoded array string); votes must not have been cast yet |
| POL-06 | `poll answer <id>` — submit a poll answer | POST `/poll/answer` with `poll_id` + `object_id` + `object_token` + `poll_option_id`; token auto-lookup applies |
</phase_requirements>

---

## Summary

Phase 5 extends the existing webinar command surface with nine sub-resource groups: attachments, sections, speakers, mail, recording, transcription, room, series, queued videos — plus a new top-level `poll` topic. All patterns are extensions of the Phase 4 foundation and no new libraries are introduced.

The phase follows a single architecture template: `AuthenticatedCommand` subclass, `fetchWebinarToken` auto-lookup for token-gated endpoints, `uploadChunked` for file uploads, cli-table3 tables for list/read commands, green success lines for imperative action commands, and `@clack/prompts` interactive fallback for commands with required inputs. The main implementation work is writing ~60+ command files that apply this pattern consistently across a large and varied API surface.

The most complex command groups are **speakers** (14 sub-commands, 3 file uploads, 3 action-only imperatives, 1 library browser) and **series** (12 sub-commands including recurrence management). Polls are a new top-level topic: the `poll` commands address `object_id` (webinar id) not `live_id`, which is a terminology boundary to watch.

**Primary recommendation:** Work group-by-group through the sub-resource topics. Each group is self-contained. Start with the simpler groups (attachment, section, recording, queued-video) to establish rhythm, then move to speaker and series which have the most commands.

---

## Standard Stack

All Phase 5 code uses the stack established in Phases 3 and 4. No new dependencies required.

### Core (all carried forward — no additions needed)

| Library | Purpose | Source |
|---------|---------|--------|
| `@oclif/core` (4.x) | Command dispatch, flag parsing, `--json` | Phase 3 |
| `openapi-fetch` | Type-safe API calls against generated types | Phase 3 |
| `chalk` (4.x) | Green success messages | Phase 3 |
| `cli-table3` | Table rendering for list/read commands | Phase 3 |
| `@clack/prompts` | Interactive prompts for required fields and destructive confirmations | Phase 3 |

[VERIFIED: codebase inspection — all libraries present in package.json and used in Phase 4 commands]

---

## Architecture Patterns

### Command File Location

```
src/commands/webinar/
├── attachment/
│   ├── list.ts
│   ├── upload.ts
│   ├── delete.ts
│   └── set-hidden.ts
├── section/
│   ├── list.ts
│   ├── add.ts
│   ├── update.ts
│   └── remove.ts
├── speaker/
│   ├── list.ts
│   ├── add.ts
│   ├── add-from-user.ts
│   ├── add-from-speaker.ts
│   ├── update.ts
│   ├── remove.ts
│   ├── set-avatar.ts
│   ├── remove-avatar.ts
│   ├── set-order.ts
│   ├── send-invitation.ts
│   ├── request-guest.ts
│   ├── cancel-guest-request.ts
│   ├── connection-types.ts
│   └── library.ts
├── mail/
│   ├── list.ts
│   ├── add.ts
│   ├── update.ts
│   ├── remove.ts
│   ├── preview.ts
│   ├── send.ts
│   └── test.ts
├── recording/
│   ├── start.ts
│   ├── stop.ts
│   └── status.ts
├── transcription/
│   ├── list.ts
│   ├── connect.ts
│   ├── locales.ts
│   └── transcriptionlist.ts
├── room/
│   ├── info.ts
│   ├── themes.ts
│   ├── send-recording.ts
│   └── connect.ts
├── series/
│   ├── list.ts
│   ├── create.ts
│   ├── update.ts
│   ├── delete.ts
│   ├── metrics.ts
│   ├── recurrences.ts
│   ├── apply-recurrence.ts
│   ├── skip-recurrence.ts
│   ├── cancel.ts
│   ├── set-ondemand.ts
│   ├── mapped-objects.ts
│   └── upload-thumbnail.ts
└── queued-video/
    ├── add.ts
    └── remove.ts

src/commands/poll/
├── list.ts
├── add.ts
├── update.ts
├── remove.ts
├── set-options.ts
└── answer.ts
```

[VERIFIED: oclif topic namespacing — subdirectory = topic prefix; `webinar attachment list` maps to `src/commands/webinar/attachment/list.ts`]

### Pattern 1: Token-gated list command

Applies to: `webinar attachment list`, `webinar section list`, `webinar transcription list`, `webinar transcription locales`

```typescript
// Source: codebase — fetchWebinarToken pattern in base-command.ts
const { args, flags } = await this.parse(WebinarAttachmentList)
this.printWorkspaceHeader()

const webinarId = Number(args.id)
// Auto-lookup token if --token not provided (Decision D-4)
const token = flags.token ?? await this.fetchWebinarToken(webinarId)

const { data, error } = await this.apiClient.GET('/live/attachment/list', {
  params: { query: { live_id: webinarId, token } },
})
// ... render cli-table3 table
```

### Pattern 2: Action command (imperative, no data row)

Applies to: `webinar recording start|stop`, `webinar mail send|test`, `webinar speaker send-invitation|request-guest|cancel-guest-request`, `webinar attachment set-hidden`, `webinar queued-video add|remove`

```typescript
// Source: codebase — webinar delete / Decision D-1
const { data, error } = await this.apiClient.POST('/live/recording/start', {
  body: { live_id: webinarId } as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
if (error) {
  this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
}
this.log(chalk.green('Recording started'))
if (this.jsonEnabled()) {
  return formatJsonOutput({ ok: true, data, summary: 'Recording started', breadcrumbs: [...] })
}
```

### Pattern 3: Create command with required fields + interactive fallback

Applies to: `webinar speaker add`, `webinar mail add`, `webinar section add`, `poll add`, `poll set-options`

```typescript
// Source: codebase — webinar update.ts interactive fallback pattern
const requiredFlagsProvided = [flags.name, flags.email].every(v => v !== undefined)

if (!requiredFlagsProvided && !this.jsonEnabled()) {
  // Interactive: prompt for each required field
  const nameResult = await text({ message: 'Speaker name', placeholder: 'Full name' })
  if (isCancel(nameResult)) process.exit(EXIT_CANCELLED)
  // ...
  body.name = nameResult as string
} else {
  // Flag mode: validate required fields are present
  if (!flags.name) this.error('--name is required', { exit: EXIT_ERROR })
  body.name = flags.name
}
```

### Pattern 4: File upload (chunked engine)

Applies to: `webinar attachment upload`, `webinar speaker set-avatar`, `webinar series upload-thumbnail`

```typescript
// Source: codebase — upload-image.ts pattern
result = await uploadChunked({
  filePath: args.file,
  uploadToken: String(args.id),        // live_id value
  tokenFieldName: 'live_id',           // For attachment and series thumbnail
  // tokenFieldName: 'live_speaker_id' // For speaker set-avatar
  uploadUrl: `${this.apiBaseUrl}live/attachment/upload`,
  bearerToken: this.activeWorkspace.bearer_token || undefined,
  chunkSize: flags['chunk-size'],
  concurrency: flags.concurrency,
  onProgress(bytesUploaded, total) { ... },
})
```

**Key detail for speaker avatar:** `tokenFieldName` is `'live_speaker_id'` and `uploadToken` is the speaker ID, not the webinar ID. [VERIFIED: API types — `liveAttachmentUpload` uses `live_id`; `liveSpeakerSetAvatar` description confirms speaker file upload]

**Key detail for series thumbnail:** `tokenFieldName` is `'live_series_id'` and `uploadToken` is the series ID. [VERIFIED: API types line 4281-4299]

### Pattern 5: Poll set-options — options serialization

```typescript
// Source: API types — pollSetOptions.requestBody.options is `string` (JSON-encoded array)
// Decision D-2: CLI uses repeated --option flags
const options = flags.option  // string[] from Flags.string({ multiple: true })
const optionsJson = JSON.stringify(options)  // ["Yes", "No", "Maybe"]

await this.apiClient.POST('/poll/set-options', {
  body: { poll_id: pollId, options: optionsJson } as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
```

[VERIFIED: API types line 30037 — `options` field is `string` type with comment "JSON-encoded array of options"]

### Pattern 6: Poll answer — object_token auto-lookup

`poll answer` requires `object_token` which is the webinar token. Apply `fetchWebinarToken`:

```typescript
// poll answer <poll_id> --webinar-id <id> --option-id <option_id>
const objectToken = flags.token ?? await this.fetchWebinarToken(flags['webinar-id'])

await this.apiClient.POST('/poll/answer', {
  body: {
    poll_id: pollId,
    object_id: Number(flags['webinar-id']),
    object_token: objectToken,
    poll_option_id: Number(flags['option-id']),
  } as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
```

### Pattern 7: Destructive delete with confirmation

Applies to: `webinar series delete`, `webinar series cancel`, `poll remove`

```typescript
// Source: codebase — webinar delete.ts
if (!this.jsonEnabled()) {
  const confirmed = await confirm({
    message: `Remove poll ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
  })
  if (isCancel(confirmed) || !confirmed) process.exit(EXIT_CANCELLED)
}
```

### Anti-Patterns to Avoid

- **Using `upload_token` field name for webinar uploads:** Always use `tokenFieldName: 'live_id'` for webinar-scoped file uploads (`attachment upload`, `upload-image`). Speaker avatar uses `'live_speaker_id'`. Series thumbnail uses `'live_series_id'`.
- **Assuming all list endpoints take `token`:** `webinar recording status`, `webinar room info/themes/connect`, `webinar series list` do NOT require a token. Only attachment/list, section/list, transcription/list, and transcription/locales require the token param. [VERIFIED: API types inspection]
- **Hardcoding `object_type` for polls:** The poll endpoints use `object_id` (not `live_id`) and the API uses `object_type: 'live'` internally. CLI flags for poll commands take the webinar ID as `--webinar-id` / positional arg.
- **Missing `applyCliTerms` on error messages:** Every `this.error(...)` call must wrap the message with `applyCliTerms(formatApiError(...))` to suppress `live`, `photo`, `album` in user-visible output.
- **Interactive mode when `--json` is set:** Always check `!this.jsonEnabled()` before entering interactive `@clack/prompts` flows.

---

## API Surface Map (Phase 5 Endpoints)

### Attachments (`/live/attachment/*`)
| CLI subcommand | API endpoint | HTTP | Body/Query fields |
|----------------|-------------|------|-------------------|
| `attachment list` | `/live/attachment/list` | GET | `live_id`, `token` (auto-lookup), `include_hidden_p?` |
| `attachment upload` | `/live/attachment/upload` | POST multipart | `live_id` (via chunked engine), `hidden_p?`, `file` |
| `attachment delete` | `/live/attachment/delete` | POST form | `live_id`, `filename` |
| `attachment set-hidden` | `/live/attachment/set-hidden` | POST form | `live_id`, `filename`, `hidden_p` |

[VERIFIED: API types lines 28193–28659]

**Important:** `attachment delete` and `attachment set-hidden` take `filename` (not an attachment ID). The filename comes from `attachment list` output.

### Sections (`/live/section/*`)
| CLI subcommand | API endpoint | HTTP | Body/Query fields |
|----------------|-------------|------|-------------------|
| `section list` | `/live/section/list` | GET | `live_id`, `token` (auto-lookup) |
| `section add` | `/live/section/add` | POST form | `live_id`, `title?`, `description?`, `start_time?` (Unix epoch) |
| `section update` | `/live/section/update` | POST form | `live_section_id`, `title?`, `description?`, `start_time?` |
| `section remove` | `/live/section/remove` | POST form | `live_section_id` |

[VERIFIED: API types lines 31091–31539]

**Note:** `section add` returns `live_section_id`. `section remove` takes `live_section_id` directly — the user must look it up from `section list`.

### Speakers (`/live/speaker/*`)
| CLI subcommand | API endpoint | HTTP | Required fields |
|----------------|-------------|------|-----------------|
| `speaker list` | `/live/speaker/list` | GET | `live_id` |
| `speaker library` | `/live/speaker/library/list` | GET | (workspace-scoped) |
| `speaker add` | `/live/speaker/add` | POST form | `live_id`, `name`, `email` |
| `speaker add-from-speaker` | `/live/speaker/add-from-speaker` | POST form | `live_id`, `live_speaker_id` |
| `speaker add-from-user` | `/live/speaker/add-from-user` | POST form | `live_id`, `user_id` |
| `speaker update` | `/live/speaker/update` | POST form | `live_speaker_id` |
| `speaker remove` | `/live/speaker/remove` | POST form | `live_speaker_id` |
| `speaker set-avatar` | `/live/speaker/set-avatar` | POST multipart | `live_speaker_id` (chunked) |
| `speaker remove-avatar` | `/live/speaker/remove-avatar` | POST form | `live_speaker_id` |
| `speaker set-order` | `/live/speaker/set-order` | POST form | `live_id`, `live_speaker_id`, `order` |
| `speaker send-invitation` | `/live/speaker/send-invitation` | POST form | `live_speaker_id` |
| `speaker request-guest` | `/live/speaker/request-guest` | POST form | `live_speaker_id` |
| `speaker cancel-guest-request` | `/live/speaker/cancel-guest-request` | POST form | `live_speaker_id` |
| `speaker connection-types` | `/live/speaker/connection-types` | GET | (workspace-scoped) |

[VERIFIED: API types lines 4301–4580, 33113–34139]

### Mail (`/live/mail/*`)
| CLI subcommand | API endpoint | HTTP | Required fields |
|----------------|-------------|------|-----------------|
| `mail list` | `/live/mail/list` | GET | `live_id` (or `live_series_id`) |
| `mail add` | `/live/mail/add` | POST form | `subject`, `message`, `live_id` or `live_series_id` |
| `mail update` | `/live/mail/update` | POST form | (mail id + optional fields) |
| `mail remove` | `/live/mail/remove` | POST form | (mail id) |
| `mail preview` | `/live/mail/preview` | GET | (mail id) — returns raw HTML |
| `mail send` | `/live/mail/send` | POST form | (mail id) |
| `mail test` | `/live/mail/test` | POST form | (mail id), `email` |

[VERIFIED: API types lines 3600–3740, 28660+]

**Important:** `mail preview` returns HTML content directly; must `process.stdout.write(data)` without wrapping (Decision D-3).

### Recording (`/live/recording/*`)
| CLI subcommand | API endpoint | HTTP | Required fields |
|----------------|-------------|------|-----------------|
| `recording start` | `/live/recording/start` | POST form | `live_id` |
| `recording stop` | `/live/recording/stop` | POST form | `live_id` |
| `recording status` | `/live/recording/status` | GET | `live_id` |

[VERIFIED: API types lines 30356–30683]

**Note:** `recording start` and `recording stop` return `upload_token` in response data. The success message should NOT display this token (security — same principle as chunked upload tokens). `recording status` returns `{ status, upload_token }` — display `status` field in table, not the token.

### Transcription (`/live/transcription/*` and `/live/transcriptionlist`)
| CLI subcommand | API endpoint | HTTP | Required fields |
|----------------|-------------|------|-----------------|
| `transcription list` | `/live/transcription/list` | GET | `live_id`, `token` (auto-lookup) |
| `transcription connect` | `/live/transcription/connect` | POST form | `live_id`, optional `presenter_token` |
| `transcription locales` | `/live/transcription/locales` | GET | `live_id`, `token` (auto-lookup) |
| `transcription transcriptionlist` | `/live/transcriptionlist` | GET | (workspace-scoped) |

[VERIFIED: API types lines 4581–4660]

**Important:** `transcriptionlist` maps to a different path `/live/transcriptionlist` (no slash after `live`, no `/transcription/` prefix). This is a distinct endpoint from `/live/transcription/list`.

### Room (`/live/webinar/*`)
| CLI subcommand | API endpoint | HTTP | Required fields |
|----------------|-------------|------|-----------------|
| `room info` | `/live/webinar/info` | GET | `live_id` |
| `room themes` | `/live/webinar/room-themes` | GET | (no params) |
| `room send-recording` | `/live/webinar/send-recording` | POST form | (recording-specific) |
| `room connect` | `/live/webinar/connect` | GET | `live_id` |

[VERIFIED: API types lines 3941–4000]

### Series (`/live/series/*`)
| CLI subcommand | API endpoint | HTTP | Notes |
|----------------|-------------|------|-------|
| `series list` | `/live/series/list` | GET | Paginated |
| `series create` | `/live/series/create` | POST form | `name` required; many optional fields |
| `series update` | `/live/series/update` | POST form | `live_series_id` |
| `series delete` | `/live/series/delete` | POST form | `live_series_id`; optional `delete_associations_p` |
| `series metrics` | `/live/series/metrics` | GET | `live_series_id` |
| `series recurrences` | `/live/series/recurrences` | GET | `live_series_id` |
| `series apply-recurrence` | `/live/series/apply-recurrence` | GET | `live_series_id`, `recurrence_id` |
| `series skip-recurrence` | `/live/series/skip-recurrence` | GET | `live_series_id`, `recurrence_id`, `skipped_p` |
| `series cancel` | `/live/series/cancel` | POST form | `live_series_id`; optional `cancel_associations_p` |
| `series set-ondemand` | `/live/series/set-ondemand` | POST form | `live_series_id`, `update_associations_p?` |
| `series mapped-objects` | `/live/series/mapped-objects` | GET | `live_series_id` |
| `series upload-thumbnail` | `/live/series/upload-thumbnail` | POST multipart | chunked; `live_series_id` as token field |

[VERIFIED: API types lines 4081–4300, 31776+]

**Admin URL for series create:** `/manage/webinar/series/<live_series_id>` — [ASSUMED: no explicit confirmation in codebase; follow `/manage/webinar/<id>` pattern with `/series/` suffix]

### Queued Videos (`/live/queuedvideos/*`)
| CLI subcommand | API endpoint | HTTP | Required fields |
|----------------|-------------|------|-----------------|
| `queued-video add` | `/live/queuedvideos/add` | POST form | `live_id`, `photo_id` (CLI flag: `--video-id`) |
| `queued-video remove` | `/live/queuedvideos/remove` | POST form | `live_id`, `photo_id` (CLI flag: `--video-id`) |

[VERIFIED: API types lines 35216–35395]

**Terminology note:** API uses `photo_id` for the video ID. CLI flag must be `--video-id` with `applyCliTerms`-aligned language. Body sends `photo_id: Number(flags['video-id'])`.

### Polls (`/poll/*`)
| CLI subcommand | API endpoint | HTTP | Required fields |
|----------------|-------------|------|-----------------|
| `poll list` | `/poll/list` | GET | `object_id` (webinar id) |
| `poll add` | `/poll/add` | POST form | `object_id`, `question` |
| `poll update` | `/poll/update` | POST form | `poll_id`; optional `question`, `open_p`, `display_results_p` |
| `poll remove` | `/poll/remove` | POST form | `poll_id` |
| `poll set-options` | `/poll/set-options` | POST form | `poll_id`, `options` (JSON array string) |
| `poll answer` | `/poll/answer` | POST form | `poll_id`, `object_id`, `object_token`, `poll_option_id` |

[VERIFIED: API types lines 3740–3853, 29558–30355]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File upload with progress | Custom multipart POST | `uploadChunked` from `src/upload/chunked-upload.ts` | Retry logic, progress callback, resumability already implemented |
| Token auto-lookup | Direct API call per command | `this.fetchWebinarToken(id)` on `AuthenticatedCommand` | Already implemented, throws user-friendly errors |
| JSON output shape | Custom object literals | `formatJsonOutput({ok, data, summary, breadcrumbs})` | Enforces CLI-01 shape, applies `applyCliTerms` on error summaries |
| Table rendering | Manual string concatenation | `renderTable(headers, rows)` from `src/lib/output.ts` | Consistent cyan header styling, cli-table3 formatting |
| API error messages | `String(error)` | `formatApiError(error)` | Handles `[object Object]` case, extracts message/error/detail fields |
| Term mapping | Regex per command | `applyCliTerms(text)` | Handles `photo`→`video`, `album`→`category`, `live`→`webinar` globally |

---

## Common Pitfalls

### Pitfall 1: Wrong token field name for uploads
**What goes wrong:** Using default `upload_token` field name instead of `live_id` or `live_speaker_id`
**Why it happens:** `uploadChunked` defaults to `tokenFieldName: 'upload_token'` if not specified
**How to avoid:** Always explicitly set `tokenFieldName: 'live_id'` for webinar attachments and series thumbnails; `tokenFieldName: 'live_speaker_id'` for speaker avatars
**Warning signs:** Upload completes but API rejects with 400/401 (wrong token field sent)

### Pitfall 2: Forgetting `applyCliTerms` on error messages
**What goes wrong:** User sees `"live"` or `"photo"` in error output
**Why it happens:** `this.error(formatApiError(error))` without wrapping in `applyCliTerms`
**How to avoid:** Always: `this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })`
**Warning signs:** Test assertions for error messages fail or "live" appears in output

### Pitfall 3: Token-required endpoints called without token
**What goes wrong:** API returns 400 or empty results when token is missing
**Why it happens:** Not all list endpoints require a token — only attachment/list, section/list, transcription/list, transcription/locales do
**How to avoid:** Check API types for each endpoint's query params; if `token: string` is in the query params (not optional), use `fetchWebinarToken`
**Warning signs:** API returns error about missing token param

### Pitfall 4: `transcriptionlist` path confusion
**What goes wrong:** Calling `/live/transcription/list` when `webinar transcription transcriptionlist` needs `/live/transcriptionlist`
**Why it happens:** The endpoint name looks like it belongs under `/transcription/` but it has its own path
**How to avoid:** Use path `/live/transcriptionlist` for the `transcriptionlist` sub-command
**Warning signs:** 404 from API

### Pitfall 5: Poll `object_id` vs `live_id`
**What goes wrong:** Sending `live_id` to poll endpoints that expect `object_id`
**Why it happens:** All other webinar sub-resources use `live_id`; polls use generic `object_id`
**How to avoid:** Poll endpoints use `object_id` (the webinar ID) not `live_id`; the CLI flag can still be named `--webinar-id` or positional `id` for user clarity
**Warning signs:** API 400 "missing object_id"

### Pitfall 6: Displaying `upload_token` from recording start/stop
**What goes wrong:** Logging the `upload_token` from recording start/stop response
**Why it happens:** The response data includes `upload_token` and it's tempting to display it
**How to avoid:** Show only the green success line; the token is internal (analogous to T-03-03 in upload engine)
**Warning signs:** Token value appears in stdout output

### Pitfall 7: `poll set-options` options encoding
**What goes wrong:** Sending options as array directly instead of JSON-encoded string
**Why it happens:** `options` in the API body is typed as `string` but semantically is an array
**How to avoid:** `JSON.stringify(flags.option)` before sending to API; `flags.option` is `string[]` from `Flags.string({ multiple: true })`
**Warning signs:** API returns 400 or options not set correctly

### Pitfall 8: Interactive mode triggered with `--json` flag
**What goes wrong:** `@clack/prompts` prompts appear even in scripted/piped invocations
**Why it happens:** Omitting `&& !this.jsonEnabled()` check before entering interactive branch
**How to avoid:** Guard interactive code with `if (!requiredFlagsProvided && !this.jsonEnabled())`
**Warning signs:** Hanging process when piped, or test failures

---

## Code Examples

### Verified: Token-gated GET with auto-lookup

```typescript
// Source: codebase pattern from fetchWebinarToken in base-command.ts
static flags = {
  ...AuthenticatedCommand.baseFlags,
  token: Flags.string({
    description: 'Webinar token (auto-looked up if omitted)',
    required: false,
  }),
}

public async run(): Promise<void | object> {
  const { args, flags } = await this.parse(WebinarAttachmentList)
  this.printWorkspaceHeader()

  const webinarId = Number(args.id)
  if (!Number.isFinite(webinarId) || webinarId <= 0) {
    this.error(`Invalid webinar ID: ${args.id}`, { exit: EXIT_ERROR })
  }

  const token = flags.token ?? await this.fetchWebinarToken(webinarId)

  const { data, error } = await this.apiClient.GET('/live/attachment/list', {
    params: { query: { live_id: webinarId, token } },
  })
  if (error) {
    this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
  }
  // ...
}
```

### Verified: Action command pattern

```typescript
// Source: codebase — webinar delete.ts structure, Decision D-1
this.log(chalk.green('Recording started'))

if (this.jsonEnabled()) {
  return formatJsonOutput({
    ok: true,
    data: responseData,
    summary: 'Recording started',
    breadcrumbs: [
      { domain: this.activeWorkspace.domain },
      { resource: 'webinar', id: args.id },
    ],
  })
}
```

### Verified: poll set-options flag definition

```typescript
// Source: Decision D-2 + API types
static flags = {
  ...AuthenticatedCommand.baseFlags,
  option: Flags.string({
    description: 'Poll option (repeat for multiple)',
    multiple: true,
    required: false,
  }),
}

// In run():
const options = flags.option ?? []
if (options.length === 0 && !this.jsonEnabled()) {
  // Interactive: collect options via repeated prompts
}
const optionsJson = JSON.stringify(options)
await this.apiClient.POST('/poll/set-options', {
  body: { poll_id: pollId, options: optionsJson } as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
```

### Verified: Speaker add with interactive fallback

```typescript
// Source: codebase — webinar update.ts pattern applied to speaker add
const nameFlagProvided = flags.name !== undefined
const emailFlagProvided = flags.email !== undefined
const flagMode = nameFlagProvided && emailFlagProvided

if (!flagMode && !this.jsonEnabled()) {
  const nameResult = await text({ message: 'Speaker name', placeholder: 'Full name' })
  if (isCancel(nameResult)) process.exit(EXIT_CANCELLED)
  const emailResult = await text({ message: 'Speaker email', placeholder: 'email@example.com' })
  if (isCancel(emailResult)) process.exit(EXIT_CANCELLED)
  body.name = nameResult as string
  body.email = emailResult as string
} else {
  if (!flags.name) this.error('--name is required in non-interactive mode', { exit: EXIT_ERROR })
  if (!flags.email) this.error('--email is required in non-interactive mode', { exit: EXIT_ERROR })
  body.name = flags.name
  body.email = flags.email
}
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest (version from package.json) |
| Config file | `packages/twentythree-cli/vitest.config.ts` |
| Quick run command | `pnpm --filter twentythree-cli test` |
| Full suite command | `pnpm --filter twentythree-cli test` |

[VERIFIED: `vitest.config.ts` exists at `packages/twentythree-cli/vitest.config.ts`]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WEB-12 | attachment list, upload, delete, set-hidden | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| WEB-13 | section list, add, update, remove | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| WEB-14 | speaker commands (14 sub-commands) | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| WEB-15 | mail commands; preview pipes HTML to stdout | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| WEB-16 | recording start/stop/status; token not logged | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| WEB-17 | transcription list/connect/locales/transcriptionlist | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| WEB-18 | room info/themes/send-recording/connect | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| WEB-19 | series commands; upload-thumbnail uses chunked | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| WEB-20 | queued-video add/remove; photo_id mapped to --video-id | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| POL-01 | poll list uses object_id not live_id | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| POL-02 | poll add requires question; interactive fallback | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| POL-03 | poll update accepts open_p/display_results_p | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| POL-04 | poll remove shows confirmation | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| POL-05 | poll set-options serializes options as JSON string | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |
| POL-06 | poll answer sends object_token from fetchWebinarToken | unit | `pnpm --filter twentythree-cli test` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm --filter twentythree-cli test`
- **Per wave merge:** `pnpm --filter twentythree-cli test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

Test files following the existing `*.test.ts` pattern in `src/commands/webinar/__tests__/` and a new `src/commands/poll/__tests__/` directory. Each should contain `it.todo` stubs for the critical behaviors listed above. The existing test infrastructure (vitest config, import patterns) is already established — no framework installation needed.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `AuthenticatedCommand` — all Phase 5 commands extend it |
| V3 Session Management | no | CLI is stateless per-invocation |
| V4 Access Control | no | Access control enforced by TwentyThree API, not CLI |
| V5 Input Validation | yes | Numeric ID validation before API calls (same as Phase 4) |
| V6 Cryptography | no | No crypto in CLI layer |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Token logged to stdout | Information Disclosure | Never display `upload_token` from recording start/stop; show only success message |
| `live_id` token field name wrong | Tampering | Explicit `tokenFieldName` on every `uploadChunked` call |
| Legacy terms in output | Information Disclosure | `applyCliTerms()` on all error messages |
| Non-numeric ID accepted | Tampering | `Number.isFinite(id) && id > 0` check before API calls |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Admin URL for series create is `/manage/webinar/series/<live_series_id>` | API Surface Map — Series | Series create would print wrong admin URL; low risk, only cosmetic |

---

## Open Questions

1. **Speaker `set-avatar` token field name**
   - What we know: API endpoint `/live/speaker/set-avatar` accepts `file` parameter; description says "valid `live_speaker_id`"
   - What's unclear: Whether the chunked upload engine should use `live_speaker_id` as `tokenFieldName` and speaker ID as `uploadToken`, or whether `live_id` is also needed
   - Recommendation: Use `tokenFieldName: 'live_speaker_id'` and `uploadToken: String(args.speakerId)` based on endpoint description pattern; if API rejects, fall back to including both

2. **`webinar mail preview` — raw HTML output mechanism**
   - What we know: Decision D-3 says print raw HTML to stdout
   - What's unclear: Whether `this.log()` adds a newline that breaks HTML piping
   - Recommendation: Use `process.stdout.write(htmlContent)` directly rather than `this.log()` to avoid trailing newline corruption

---

## Environment Availability

Step 2.6: SKIPPED — Phase 5 is purely code additions. No new external tools, services, CLIs, or runtimes beyond what is already installed.

---

## Sources

### Primary (HIGH confidence)
- `packages/twentythree-cli/src/api/types.ts` — All endpoint operation types verified directly (lines 28193–35395 for Phase 5 endpoints)
- `packages/twentythree-cli/src/lib/base-command.ts` — `AuthenticatedCommand`, `fetchWebinarToken` implementation verified
- `packages/twentythree-cli/src/upload/chunked-upload.ts` — Upload engine interface verified
- `packages/twentythree-cli/src/commands/webinar/upload-image.ts` — Chunked upload pattern for webinar scope verified
- `packages/twentythree-cli/src/commands/webinar/update.ts` — Interactive fallback pattern verified
- `packages/twentythree-cli/src/commands/webinar/delete.ts` — Confirmation prompt pattern verified
- `packages/twentythree-cli/src/lib/output.ts` — All output utility signatures verified
- `.planning/phases/05-webinar-deep/05-CONTEXT.md` — Phase decisions

### Secondary (MEDIUM confidence)
- `.planning/phases/04-category-webinar-core/04-CONTEXT.md` — Phase 4 conventions confirmed as carry-forward

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified in codebase
- Architecture: HIGH — patterns verified from existing Phase 4 commands
- API surface: HIGH — all endpoint types verified from `src/api/types.ts`
- Pitfalls: HIGH — derived from code inspection and API type reading

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (stable — no external dependencies; only changes if OpenAPI spec is regenerated)

---

## RESEARCH COMPLETE
