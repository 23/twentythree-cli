---
status: complete
phase: 03-video-core
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md, 03-05-SUMMARY.md
started: 2026-04-14T13:30:00Z
updated: 2026-04-14T15:00:00Z
---

## Tests

### 1. video list — table output
expected: Run `node bin/dev.js video list`. Output renders a table with columns: ID, Title, Duration, Status, Published, Updated. All rows show video data with no API terms (no "photo", "album", "live") visible.
result: pass

### 2. video get — single video details
expected: Run `node bin/dev.js video get <id>` with a valid video ID. Output shows a detail view of the video (ID, title, duration, status, etc.). No legacy terms in output.
result: pass

### 3. video update — flag mode
expected: Run `node bin/dev.js video update <id> --title "Updated Title"`. The API is called with only the provided flag; the video title updates. Other fields are not cleared.
result: pass

### 4. video delete — workspace-scoped confirmation
expected: Run `node bin/dev.js video delete <id>`. A confirmation prompt appears that includes the workspace domain (e.g. "Delete video <id> on company.video23.com?"). Pressing Enter to confirm proceeds; the video is deleted. Choosing "no" exits with no deletion.
result: pass

### 5. video upload — progress bar
expected: Run `node bin/dev.js video upload <path-to-file>`. A progress bar appears showing bytes uploaded, percentage, ETA, and speed (e.g. `[████░░░░] 45% | 450 MB / 1.0 GB | ETA: 1m30s | 3.2 MB/s`). On completion the bar clears and a success line is shown.
result: pass

### 6. video replace — replace token flow
expected: Run `node bin/dev.js video replace <id> <path-to-file>`. The command fetches a replace token (not upload token), uploads the replacement file in chunks, and reports success. The progress bar shows as with video upload.
result: pass

### 7. video transcoding-progress — shows status
expected: Run `node bin/dev.js video transcoding-progress <id>`. Output shows the current transcoding percentage and status for the video. `--json` returns `{ ok, data, summary, breadcrumbs }`.
result: pass

### 8. video section list — table output
expected: Run `node bin/dev.js video section list <id>`. Output renders a table with section details (ID, Title, Start Time, Description). If no sections exist, a friendly empty state is shown.
result: pass

### 9. video section create — creates section
expected: Run `node bin/dev.js video section create <id> --title "Intro" --start-time 0`. Section is created. Success message shown. `--json` returns correct shape.
result: pass

### 10. video subtitle list — table output
expected: Run `node bin/dev.js video subtitle list <id>`. Output renders a table of subtitle tracks with columns: ID, Locale, Type, Status, Primary. No legacy terms visible.
result: pass

### 11. video subtitle upload — direct multipart
expected: Run `node bin/dev.js video subtitle upload <id> <path-to-srt-file> --locale en_US`. File is uploaded directly (not chunked). Success message shown with subtitle ID.
result: pass

### 12. --json flag output shape
expected: Run `node bin/dev.js video list --json`. Output is valid JSON with shape `{ ok: true, data: [...], summary: "...", breadcrumbs: [...] }`. No table or decoration rendered — clean JSON only.
result: pass

## Summary

total: 12
passed: 12
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
