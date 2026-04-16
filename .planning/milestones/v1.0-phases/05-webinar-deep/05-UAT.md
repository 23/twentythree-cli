---
status: complete
phase: 05-webinar-deep
source:
  - 05-01-SUMMARY.md
  - 05-02-SUMMARY.md
  - 05-03-SUMMARY.md
  - 05-04-SUMMARY.md
  - 05-05-SUMMARY.md
started: 2026-04-15T09:15:00.000Z
updated: 2026-04-15T09:15:00.000Z
---

## Current Test

number: complete
name: All 15 tests completed
awaiting: none

## Tests

### 1. Webinar attachment list
expected: |
  Run `twentythree webinar attachment list <webinar-id>`.
  Token is auto-looked up silently via fetchWebinarToken — no manual token required.
  Output is a cli-table3 table with columns: Filename, Size, Hidden, Created.
  A dim count line appears below the table (e.g. `3 attachments`).
  No legacy terms (`live`, `photo`) appear in the output.
result: pass

### 2. Webinar attachment upload (chunked)
expected: |
  Run `twentythree webinar attachment upload <webinar-id> ./some-file.pdf`.
  A progress bar renders to stderr showing `[████░░░░░░] 40% | 2.1 MB / 5.3 MB | 1.2 MB/s`.
  On completion, a green `Attachment uploaded` message appears with the filename.
  Admin URL is printed: `https://<domain>/manage/webinar/<id>`.
  The token value (live_id) is never printed to stdout.
result: issue
reported: "Chunk 1 failed after 5 retries — bearerToken was not being sent in Authorization header"
severity: blocker
fix: "Fixed in chunked-upload.ts — bearerToken was destructured but never included in fetch headers"

### 3. Webinar section list
expected: |
  Run `twentythree webinar section list <webinar-id>`.
  Token auto-looked up silently. Table shows: ID, Title, Description, Start Time.
  Section IDs displayed are live_section_id values (not live_id).
result: pass

### 4. Webinar section add — interactive fallback
expected: |
  Run `twentythree webinar section add <webinar-id>` (omitting --title).
  A @clack/prompts interactive prompt appears: `Section title`.
  After entering a title and pressing Enter, the section is created.
  Green `Section added` message with section ID and admin URL.
result: pass

### 5. Webinar section remove — confirmation prompt
expected: |
  Run `twentythree webinar section remove <webinar-id> <section-id>`.
  A confirmation prompt appears mentioning the domain:
  e.g. `Remove section <section-id> from <domain>? This cannot be undone.`
  Answering `n` cancels with exit code 2. Answering `y` removes and shows green success.
result: issue
reported: "Endpoint requires both live_id and live_section_id — command only sent live_section_id"
severity: major
fix: "Added webinarId as first arg; body now sends live_id + live_section_id. Same fix applied to section update."

### 6. Webinar speaker list (token auto-lookup)
expected: |
  Run `twentythree webinar speaker list <webinar-id>`.
  Token is fetched automatically — no --token flag required.
  Table shows: ID, Name, Email, Title, Connection Type.
result: pass

### 7. Webinar speaker set-avatar (chunked upload with live_speaker_id token)
expected: |
  Run `twentythree webinar speaker set-avatar <webinar-id> <speaker-id> ./avatar.jpg`.
  Progress bar renders to stderr. The upload uses `live_speaker_id` as the token field
  (not `live_id` — this is a critical correctness requirement).
  On success: green `Speaker avatar uploaded` message.
result: issue
reported: "Command only accepted 2 args (speaker-id, file) — webinar-id missing"
severity: major
fix: "Added webinarId as first arg to set-avatar and 6 other speaker commands (remove, remove-avatar, send-invitation, request-guest, cancel-guest-request, update). All now send live_id + live_speaker_id."

### 8. Webinar speaker send-invitation (action command)
expected: |
  Run `twentythree webinar speaker send-invitation <webinar-id> <speaker-id>`.
  No table output — just a single green success line: `Invitation sent`.
  `--json` returns `{ ok: true, data: <api response>, summary: "Invitation sent" }`.
result: pass

### 9. Webinar mail preview — raw HTML to stdout
expected: |
  Run `twentythree webinar mail preview <mail-id> > /tmp/preview.html`.
  The file `/tmp/preview.html` contains valid HTML with no trailing extra newlines that
  corrupt the HTML structure. The HTML should open correctly in a browser.
  (This tests that `process.stdout.write()` is used instead of `this.log()`.)
result: issue
reported: "Command printed [object Object] — openapi-fetch parsed HTML response as JSON"
severity: major
fix: "Switched to native fetch + response.text() to get raw HTML. Also added --webinar-id/--series-id context flags to all mail commands (preview, remove, send, test, update, list, add)."

### 10. Webinar recording start (action command)
expected: |
  Run `twentythree webinar recording start <webinar-id>`.
  Single green success line: `Recording started`.
  The `upload_token` from the API response is NOT printed to stdout (security requirement).
  `--json` returns `{ ok: true, data: <api response>, summary: "Recording started" }`.
result: issue
reported: "recording split command missing"
severity: minor
fix: "Added webinar recording split command. start/stop/status all pass."

### 11. Webinar series create — interactive fallback
expected: |
  Run `twentythree webinar series create` (omitting --name).
  @clack/prompts prompt appears: `Series name`.
  After entering a name, series is created.
  Green `Series created` message with ID and admin URL:
  `https://<domain>/manage/webinar/series/<id>`.
result: pass

### 12. Webinar series upload-thumbnail (live_series_id token field)
expected: |
  Run `twentythree webinar series upload-thumbnail <series-id> ./thumb.jpg`.
  Progress bar renders to stderr. Upload uses `live_series_id` as the token field
  (NOT `live_id` — distinct from webinar image upload).
  On success: green `Series thumbnail uploaded` + admin URL with `/manage/webinar/series/`.
result: pass

### 13. Poll list (object_id, not live_id)
expected: |
  Run `twentythree poll list <webinar-id>`.
  Token auto-looked up via fetchWebinarToken.
  Table shows: ID, Question, Open, Results Visible.
  (Internally the API call uses `object_id` not `live_id` — behavior is transparent to user
  but the command must work correctly against the API.)
result: pass

### 14. Poll set-options — JSON serialization
expected: |
  Run `twentythree poll set-options <poll-id> --option "Yes" --option "No" --option "Maybe"`.
  Green success: `Poll options set (3 options)`.
  (Internally: options serialized as `JSON.stringify(["Yes","No","Maybe"])` — NOT multi-value
  form params. This is the critical difference that makes the API accept the options.)
result: issue
reported: "Commands incorrectly used --webinar-id for object_id fields; object should not be aliased. remove/set-options/update had spurious --webinar-id that API doesn't accept. add/list/answer needed --object-id not --webinar-id."
severity: major
fix: "Renamed --webinar-id to --object-id in add/list/answer. Removed --webinar-id entirely from remove/set-options/update (API only takes poll_id)."

### 15. Poll answer (object_token auto-lookup)
expected: |
  Run `twentythree poll answer <poll-id> --object-id <webinar-id> --option-id <option-id>`.
  Token for the webinar is auto-looked up via fetchWebinarToken.
  Green success: `Poll answer submitted`.
  (Internally: API body uses `object_id` and `object_token`, not `live_id`.)
result: pass

## Summary

total: 15
passed: 9
issues: 6
pending: 0
skipped: 0

## Gaps

[none yet]
