---
phase: 05-webinar-deep
verified: 2026-04-16T00:00:00Z
status: human_needed
score: 5/5
overrides_applied: 0
human_verification:
  - test: "Run `twentythree webinar attachment list <id>` against a real workspace"
    expected: "Table of attachments with Filename, Size, Hidden columns; or 'No attachments found.'"
    why_human: "Cannot verify live API response shape or auth token flow without a live TwentyThree workspace"
  - test: "Run `twentythree webinar speaker add <id>` interactively (no flags)"
    expected: "@clack/prompts interactive prompts appear for name and email; speaker is added on submit"
    why_human: "Interactive prompt behavior cannot be verified programmatically"
  - test: "Run `twentythree webinar mail preview <mail-id> --webinar-id <id> > preview.html`"
    expected: "preview.html contains valid HTML; no trailing newline corrupts output"
    why_human: "Raw HTML stdout output requires a live API call to confirm no newline corruption"
  - test: "Run `twentythree webinar recording start <id>` then `status <id>` then `stop <id>`"
    expected: "Each command returns green success line; status shows recording active between start/stop"
    why_human: "Requires live webinar in active state; cannot simulate recording session programmatically"
  - test: "Run `twentythree poll set-options <id> --option \"Yes\" --option \"No\" --option \"Maybe\"`"
    expected: "Options set; API call sends options as JSON string (not array) per Pitfall 7 workaround"
    why_human: "Cannot confirm API serialization behavior without live API response"
---

# Phase 5: Webinar Deep Verification Report

**Phase Goal:** The full webinar surface is operable — speakers, mail, recording, transcription, series, room, polls, attachments, sections, and queued videos can all be managed from the terminal.
**Verified:** 2026-04-16T00:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `webinar attachment` and `webinar section` subcommands manage attachments and agenda sections | VERIFIED | `attachment/`: list.ts, upload.ts, delete.ts, set-hidden.ts — all wired to `/live/attachment/*`. `section/`: add.ts, list.ts, remove.ts, update.ts — all wired to `/live/section/*`. Each issues real API calls, handles errors, and renders output. |
| 2 | `webinar speaker` subcommands fully manage speakers; `webinar mail` subcommands manage email including preview, send, and test | VERIFIED | `speaker/`: 14 command files (list, add, update, remove, send-invitation, request-guest, cancel-guest-request, library, set-order, set-avatar, remove-avatar, add-from-speaker, add-from-user, connection-types) — all wired to `/live/speaker/*`. `mail/`: 7 commands (add, list, preview, remove, send, test, update) — all wired to `/live/mail/*`. mail/preview uses native fetch for raw HTML output by design. |
| 3 | `webinar recording` start/stop/status controls recording; `webinar transcription` list/connect/locales/transcriptionlist manages transcriptions; `webinar room` info/themes/send-recording/connect manages the room | VERIFIED | `recording/`: start.ts, stop.ts, status.ts, split.ts — wired to `/live/recording/*`. `transcription/`: list.ts, connect.ts, locales.ts, transcriptionlist.ts — transcriptionlist correctly calls `/live/transcriptionlist` (not `/live/transcription/list`). `room/`: info.ts, themes.ts, send-recording.ts, connect.ts — correctly use `/live/webinar/info`, `/live/webinar/room-themes`, `/live/webinar/send-recording`, `/live/webinar/connect` rather than `/live/room/*`. |
| 4 | `webinar series` subcommands manage full series lifecycle including recurrences, on-demand, and thumbnail upload | VERIFIED | `series/`: 12 commands (apply-recurrence, cancel, create, delete, list, mapped-objects, metrics, recurrences, set-ondemand, skip-recurrence, update, upload-thumbnail) — all substantive. upload-thumbnail uses chunked upload engine with `tokenFieldName: 'live_series_id'`. set-ondemand uses `live_series_id` (not `live_id`) per API contract. |
| 5 | `poll` CRUD commands and `webinar queued-video add\|remove` work correctly | VERIFIED | `poll/`: add.ts, list.ts, answer.ts, remove.ts, update.ts, set-options.ts — all use `object_id` (not `live_id`) per API contract (Pitfall 5). set-options serializes options as JSON string per Pitfall 7. `queued-video/`: add.ts, remove.ts — both correctly map CLI `--video-id` to API `photo_id` (Pitfall 6/T-05-13), with numeric validation. |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/commands/webinar/attachment/list.ts` | List attachments | VERIFIED | Calls `GET /live/attachment/list`, renders table |
| `src/commands/webinar/attachment/upload.ts` | Upload attachment | VERIFIED | Uses chunked upload engine with `tokenFieldName: 'live_id'` |
| `src/commands/webinar/attachment/delete.ts` | Delete attachment | VERIFIED | File exists and is substantive |
| `src/commands/webinar/attachment/set-hidden.ts` | Toggle hidden | VERIFIED | File exists and is substantive |
| `src/commands/webinar/section/add.ts` | Add section | VERIFIED | Calls `POST /live/section/add`, interactive fallback for title |
| `src/commands/webinar/section/list.ts` | List sections | VERIFIED | File exists and is substantive |
| `src/commands/webinar/section/remove.ts` | Remove section | VERIFIED | File exists and is substantive |
| `src/commands/webinar/section/update.ts` | Update section | VERIFIED | Calls `POST /live/section/update`, uses `live_section_id` |
| `src/commands/webinar/speaker/list.ts` | List speakers | VERIFIED | Calls `GET /live/speaker/list`, auto-token-lookup |
| `src/commands/webinar/speaker/add.ts` | Add speaker | VERIFIED | Calls `POST /live/speaker/add`, interactive fallback |
| `src/commands/webinar/speaker/update.ts` | Update speaker | VERIFIED | File exists and is substantive |
| `src/commands/webinar/speaker/remove.ts` | Remove speaker | VERIFIED | File exists and is substantive |
| `src/commands/webinar/speaker/send-invitation.ts` | Send invitation | VERIFIED | Calls `POST /live/speaker/send-invitation` |
| `src/commands/webinar/speaker/request-guest.ts` | Request guest | VERIFIED | Calls `POST /live/speaker/request-guest` |
| `src/commands/webinar/speaker/cancel-guest-request.ts` | Cancel guest request | VERIFIED | File exists and is substantive |
| `src/commands/webinar/speaker/library.ts` | Speaker library | VERIFIED | Calls `GET /live/speaker/library/list` |
| `src/commands/webinar/speaker/set-order.ts` | Set order | VERIFIED | File exists and is substantive |
| `src/commands/webinar/speaker/set-avatar.ts` | Set avatar | VERIFIED | File exists and is substantive |
| `src/commands/webinar/speaker/remove-avatar.ts` | Remove avatar | VERIFIED | File exists and is substantive |
| `src/commands/webinar/speaker/add-from-speaker.ts` | Add from speaker | VERIFIED | File exists and is substantive |
| `src/commands/webinar/speaker/add-from-user.ts` | Add from user | VERIFIED | File exists and is substantive |
| `src/commands/webinar/speaker/connection-types.ts` | Connection types | VERIFIED | Calls `GET /live/speaker/connection-types` |
| `src/commands/webinar/mail/add.ts` | Add mail | VERIFIED | File exists and is substantive |
| `src/commands/webinar/mail/list.ts` | List mail | VERIFIED | File exists and is substantive |
| `src/commands/webinar/mail/preview.ts` | Preview mail | VERIFIED | Uses native fetch + `process.stdout.write` for raw HTML |
| `src/commands/webinar/mail/send.ts` | Send mail | VERIFIED | Calls `POST /live/mail/send`, webinar-id or series-id |
| `src/commands/webinar/mail/test.ts` | Test mail | VERIFIED | Calls `POST /live/mail/test`, interactive email fallback |
| `src/commands/webinar/mail/remove.ts` | Remove mail | VERIFIED | File exists and is substantive |
| `src/commands/webinar/mail/update.ts` | Update mail | VERIFIED | File exists and is substantive |
| `src/commands/webinar/recording/start.ts` | Start recording | VERIFIED | Calls `POST /live/recording/start` |
| `src/commands/webinar/recording/stop.ts` | Stop recording | VERIFIED | File exists and is substantive |
| `src/commands/webinar/recording/status.ts` | Recording status | VERIFIED | Calls `GET /live/recording/status` |
| `src/commands/webinar/recording/split.ts` | Split recording | VERIFIED | Calls `POST /live/recording/split` |
| `src/commands/webinar/transcription/list.ts` | List transcriptions | VERIFIED | File exists and is substantive |
| `src/commands/webinar/transcription/connect.ts` | Connect transcription | VERIFIED | Calls `POST /live/transcription/connect` |
| `src/commands/webinar/transcription/locales.ts` | Transcription locales | VERIFIED | Calls `GET /live/transcription/locales`, token auto-lookup |
| `src/commands/webinar/transcription/transcriptionlist.ts` | Workspace transcription list | VERIFIED | Calls `GET /live/transcriptionlist` (workspace-scoped, not webinar-scoped) |
| `src/commands/webinar/room/info.ts` | Room info | VERIFIED | Calls `GET /live/webinar/info` |
| `src/commands/webinar/room/themes.ts` | Room themes | VERIFIED | Calls `GET /live/webinar/room-themes` |
| `src/commands/webinar/room/send-recording.ts` | Send recording | VERIFIED | Calls `POST /live/webinar/send-recording` |
| `src/commands/webinar/room/connect.ts` | Room connect | VERIFIED | Calls `GET /live/webinar/connect` |
| `src/commands/webinar/series/create.ts` | Create series | VERIFIED | Calls `POST /live/series/create`, interactive name fallback |
| `src/commands/webinar/series/list.ts` | List series | VERIFIED | File exists and is substantive |
| `src/commands/webinar/series/update.ts` | Update series | VERIFIED | File exists and is substantive |
| `src/commands/webinar/series/delete.ts` | Delete series | VERIFIED | File exists and is substantive |
| `src/commands/webinar/series/cancel.ts` | Cancel series | VERIFIED | File exists and is substantive |
| `src/commands/webinar/series/recurrences.ts` | Recurrences | VERIFIED | Calls `GET /live/series/recurrences` |
| `src/commands/webinar/series/apply-recurrence.ts` | Apply recurrence | VERIFIED | Calls `GET /live/series/apply-recurrence` |
| `src/commands/webinar/series/skip-recurrence.ts` | Skip recurrence | VERIFIED | File exists and is substantive |
| `src/commands/webinar/series/set-ondemand.ts` | Set on-demand | VERIFIED | Calls `POST /live/series/set-ondemand` with `live_series_id` |
| `src/commands/webinar/series/upload-thumbnail.ts` | Upload thumbnail | VERIFIED | Chunked upload with `tokenFieldName: 'live_series_id'` |
| `src/commands/webinar/series/mapped-objects.ts` | Mapped objects | VERIFIED | Calls `GET /live/series/mapped-objects` |
| `src/commands/webinar/series/metrics.ts` | Series metrics | VERIFIED | File exists and is substantive |
| `src/commands/webinar/queued-video/add.ts` | Queue video | VERIFIED | Calls `POST /live/queuedvideos/add`, maps `--video-id` → `photo_id` |
| `src/commands/webinar/queued-video/remove.ts` | Dequeue video | VERIFIED | Calls `POST /live/queuedvideos/remove`, maps `--video-id` → `photo_id` |
| `src/commands/poll/add.ts` | Create poll | VERIFIED | Calls `POST /poll/add` with `object_id` |
| `src/commands/poll/list.ts` | List polls | VERIFIED | Calls `GET /poll/list` with `object_id` and `object_token` |
| `src/commands/poll/answer.ts` | Submit poll answer | VERIFIED | Calls `POST /poll/answer` with `object_id`, `object_token`, `poll_option_id` |
| `src/commands/poll/update.ts` | Update poll | VERIFIED | File exists and is substantive |
| `src/commands/poll/remove.ts` | Remove poll | VERIFIED | File exists and is substantive |
| `src/commands/poll/set-options.ts` | Set poll options | VERIFIED | Calls `POST /poll/set-options`; serializes options as JSON string (Pitfall 7) |
| `src/lib/term-map.ts` | API↔CLI term translation | VERIFIED | Bidirectional map: photo↔video, album↔category, live↔webinar; `applyCliTerms()` used on all error messages across phase commands |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `webinar attachment list` | `GET /live/attachment/list` | `this.apiClient.GET(...)` | WIRED | Direct call in run(), response handled, table rendered |
| `webinar attachment upload` | `POST /live/attachment/upload` | `uploadChunked()` with `tokenFieldName: 'live_id'` | WIRED | Chunked engine with correct field name, progress bar, error handling |
| `webinar section add` | `POST /live/section/add` | `this.apiClient.POST(...)` | WIRED | Body includes `live_id`, interactive title prompt, success output |
| `webinar speaker list` | `GET /live/speaker/list` | `this.apiClient.GET(...)` + `fetchWebinarToken()` | WIRED | Auto-token-lookup, table render |
| `webinar speaker send-invitation` | `POST /live/speaker/send-invitation` | `this.apiClient.POST(...)` | WIRED | live_id + live_speaker_id in body |
| `webinar speaker library` | `GET /live/speaker/library/list` | `this.apiClient.GET(...)` | WIRED | Workspace-scoped, no ID required |
| `webinar mail preview` | `GET /live/mail/preview` | native `fetch()` + `process.stdout.write()` | WIRED | Uses native fetch (not openapi-fetch) to get raw HTML; Decision D-3 intentional |
| `webinar mail send` | `POST /live/mail/send` | `this.apiClient.POST(...)` | WIRED | Accepts `--webinar-id` or `--series-id` exclusively |
| `webinar mail test` | `POST /live/mail/test` | `this.apiClient.POST(...)` | WIRED | Accepts context flag + optional email with interactive fallback |
| `webinar recording start` | `POST /live/recording/start` | `this.apiClient.POST(...)` (cast any) | WIRED | live_id in body, action pattern |
| `webinar recording status` | `GET /live/recording/status` | `this.apiClient.GET(...)` (cast any) | WIRED | live_id query param, key-value table |
| `webinar transcription connect` | `POST /live/transcription/connect` | `this.apiClient.POST(...)` (cast any) | WIRED | live_id + optional presenter_token |
| `webinar transcription locales` | `GET /live/transcription/locales` | `this.apiClient.GET(...)` (cast any) | WIRED | Token auto-lookup, locale table |
| `webinar transcription transcriptionlist` | `GET /live/transcriptionlist` | `this.apiClient.GET(...)` (cast any) | WIRED | Workspace-scoped endpoint (distinct from `/live/transcription/list`) |
| `webinar room info` | `GET /live/webinar/info` | `this.apiClient.GET(...)` (cast any) | WIRED | Correctly uses `/live/webinar/info` not `/live/room/info` |
| `webinar room connect` | `GET /live/webinar/connect` | `this.apiClient.GET(...)` (cast any) | WIRED | Correctly uses `/live/webinar/connect` not `/live/room/connect` |
| `webinar series upload-thumbnail` | `POST /live/series/upload-thumbnail` | `uploadChunked()` with `tokenFieldName: 'live_series_id'` | WIRED | Correct field name prevents default 'upload_token' field |
| `webinar series set-ondemand` | `POST /live/series/set-ondemand` | `this.apiClient.POST(...)` | WIRED | Uses `live_series_id` (not `live_id`) |
| `webinar queued-video add` | `POST /live/queuedvideos/add` | `this.apiClient.POST(...)` (cast any) | WIRED | CLI `--video-id` mapped to API `photo_id`; numeric validation |
| `poll add` | `POST /poll/add` | `this.apiClient.POST(...)` | WIRED | Uses `object_id` (not `live_id`); correct per Pitfall 5 |
| `poll list` | `GET /poll/list` | `this.apiClient.GET(...)` | WIRED | Uses `object_id` + `object_token` with auto-lookup |
| `poll set-options` | `POST /poll/set-options` | `this.apiClient.POST(...)` | WIRED | Options serialized as JSON string per Pitfall 7 |
| `term-map.ts` | All error outputs | `applyCliTerms()` in every command | WIRED | Every `this.error(...)` call wraps with `applyCliTerms()` |

### Data-Flow Trace (Level 4)

These commands render dynamic data from API responses. Data-flow verified for representative samples.

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `attachment/list.ts` | `attachments` | `this.apiClient.GET('/live/attachment/list', ...)` | Yes — API call with live_id + token | FLOWING |
| `speaker/list.ts` | `speakers` | `this.apiClient.GET('/live/speaker/list', ...)` | Yes — API call with live_id + auto-token | FLOWING |
| `transcription/transcriptionlist.ts` | `items` | `this.apiClient.GET('/live/transcriptionlist', ...)` | Yes — workspace-scoped API call | FLOWING |
| `room/themes.ts` | `items` | `this.apiClient.GET('/live/webinar/room-themes', ...)` | Yes — API call | FLOWING |
| `series/recurrences.ts` | `recurrences` | `this.apiClient.GET('/live/series/recurrences', ...)` | Yes — API call with live_series_id | FLOWING |
| `poll/list.ts` | `polls` | `this.apiClient.GET('/poll/list', ...)` | Yes — API call with object_id + token | FLOWING |
| `mail/preview.ts` | `html` | native `fetch(this.apiBaseUrl + 'live/mail/preview', ...)` | Yes — live HTTP fetch | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED — commands require live TwentyThree API (no local runnable entry point for these endpoints). All commands are verifiable in structure and wiring; live behavior routed to human verification.

### Requirements Coverage

Phase 5 plans did not declare explicit requirement IDs in their frontmatter. Coverage assessed against success criteria.

| Success Criterion | Status | Evidence |
|-------------------|--------|----------|
| SC-1: attachment and section subcommands | SATISFIED | 4 attachment + 4 section commands, all substantive and wired |
| SC-2: speaker (list/add/update/remove/invitation/guest/library) + mail (preview/send/test) | SATISFIED | 14 speaker commands + 7 mail commands, all wired |
| SC-3: recording start/stop/status + transcription list/connect/locales/transcriptionlist + room info/themes/send-recording/connect | SATISFIED | 4 recording + 4 transcription + 4 room commands, all wired |
| SC-4: series full lifecycle including recurrences, on-demand, thumbnail | SATISFIED | 12 series commands covering all lifecycle operations |
| SC-5: poll CRUD + queued-video add/remove | SATISFIED | 6 poll commands + 2 queued-video commands, correct API field mapping |

### Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `webinar/__tests__/*.ts` | `it.todo(...)` | Info | Test stubs in __tests__ directory only. Production command files contain no stubs. Not a blocker. |
| `webinar/update.ts`, `poll/add.ts`, `poll/set-options.ts` | `placeholder: '...'` | Info | UI prompt placeholder text in @clack/prompts calls — not code stubs. Expected UX pattern. |
| Multiple commands | `as any` casts | Info | Used for endpoints not fully typed in generated OpenAPI types. Noted in-code as intentional workarounds. Not a blocker. |

No blockers found. No FIXME/TODO/stub implementations in production command files.

### Human Verification Required

#### 1. Attachment list against live workspace

**Test:** Authenticate to a TwentyThree workspace, run `twentythree webinar attachment list <webinar-id>`
**Expected:** Table with Filename, Size, Hidden columns; or "No attachments found." if none exist
**Why human:** Cannot verify live API response shape or token auto-lookup without a real workspace

#### 2. Interactive speaker add

**Test:** Run `twentythree webinar speaker add <webinar-id>` with no flags
**Expected:** @clack/prompts prompts appear for name and email; speaker added on submit
**Why human:** Interactive prompt behavior cannot be tested programmatically

#### 3. Mail preview HTML output integrity

**Test:** Run `twentythree webinar mail preview <mail-id> --webinar-id <id> > preview.html`
**Expected:** preview.html contains valid, complete HTML with no trailing newline corruption
**Why human:** Requires live API to produce HTML; the `process.stdout.write` vs `this.log` distinction matters only against real output

#### 4. Recording lifecycle

**Test:** Start, check status, then stop recording on a live webinar session: `recording start <id>` → `recording status <id>` → `recording stop <id>`
**Expected:** Start/stop return green success; status shows recording active between calls
**Why human:** Requires an active webinar room — cannot simulate without live infrastructure

#### 5. Poll set-options API serialization

**Test:** Run `twentythree poll set-options <poll-id> --option "Yes" --option "No" --option "Maybe"` against a real webinar
**Expected:** Poll options set successfully; API receives options as JSON string `["Yes","No","Maybe"]` not as repeated form fields
**Why human:** Cannot confirm the API actually accepts the JSON string format without a live call; this is the Pitfall 7 workaround

### Gaps Summary

No gaps. All 5 success criteria are satisfied by substantive, fully-wired command implementations. The phase delivered 60+ command files across webinar/attachment, webinar/section, webinar/speaker, webinar/mail, webinar/recording, webinar/transcription, webinar/room, webinar/series, webinar/queued-video, and poll namespaces. Key implementation decisions are correctly executed: term-map applied to all error messages, chunked upload used for file operations with correct field names, poll endpoints use `object_id` not `live_id`, and room endpoints use `/live/webinar/*` paths rather than the non-existent `/live/room/*` paths.

Status is `human_needed` because live API behavior (token auto-lookup, interactive prompts, recording lifecycle, and poll serialization) requires a real TwentyThree workspace to fully confirm.

---

_Verified: 2026-04-16T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
