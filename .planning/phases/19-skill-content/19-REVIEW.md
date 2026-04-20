---
phase: 19-skill-content
reviewed: 2026-04-20T12:00:00Z
depth: standard
files_reviewed: 24
files_reviewed_list:
  - packages/twentythree-skills/skills/reference/action.md
  - packages/twentythree-skills/skills/reference/analytics.md
  - packages/twentythree-skills/skills/reference/app.md
  - packages/twentythree-skills/skills/reference/audience.md
  - packages/twentythree-skills/skills/reference/category.md
  - packages/twentythree-skills/skills/reference/collector.md
  - packages/twentythree-skills/skills/reference/comment.md
  - packages/twentythree-skills/skills/reference/openupload.md
  - packages/twentythree-skills/skills/reference/player.md
  - packages/twentythree-skills/skills/reference/poll.md
  - packages/twentythree-skills/skills/reference/presentation.md
  - packages/twentythree-skills/skills/reference/protection.md
  - packages/twentythree-skills/skills/reference/session.md
  - packages/twentythree-skills/skills/reference/setting.md
  - packages/twentythree-skills/skills/reference/site.md
  - packages/twentythree-skills/skills/reference/spot.md
  - packages/twentythree-skills/skills/reference/tag.md
  - packages/twentythree-skills/skills/reference/thumbnail.md
  - packages/twentythree-skills/skills/reference/user.md
  - packages/twentythree-skills/skills/reference/video.md
  - packages/twentythree-skills/skills/reference/webhook.md
  - packages/twentythree-skills/skills/reference/webinar.md
  - packages/twentythree-skills/skills/workflows/upload-and-publish.md
  - packages/twentythree-skills/skills/workflows/webinar-lifecycle.md
findings:
  critical: 2
  warning: 5
  info: 4
  total: 11
status: issues_found
---

# Phase 19: Code Review Report

**Reviewed:** 2026-04-20T12:00:00Z
**Depth:** standard
**Files Reviewed:** 24
**Status:** issues_found

## Summary

All 24 skill/reference files were reviewed against the actual CLI source code for flag accuracy, command existence, JSON output field names, terminology, and workflow correctness. Frontmatter is present with correct `name:` keys in all files. All bash examples include `--json`. Auth scopes are noted throughout. Terminology (video not photo, category not album, webinar not live) is handled correctly with terminology notes where the legacy API names must be used.

Two critical issues were found: the upload-and-publish workflow documents wrong JSON field names for capturing the video ID after upload (`data.id` and `data.admin_url` are both incorrect), which would cause agents to fail silently. Five warnings address incorrect flag syntax, minor auth scope omissions, and a missing required flag callout. Four info items cover minor inaccuracies and a duplicated example.

---

## Critical Issues

### CR-01: upload-and-publish.md captures wrong JSON fields after video upload

**File:** `packages/twentythree-skills/skills/workflows/upload-and-publish.md:44-45`

**Issue:** The workflow instructs agents to capture `data.id` and `data.admin_url` from the `video upload --json` response. Both fields are wrong. Inspecting `src/commands/video/upload.ts` and `src/upload/types.ts`: the JSON response wraps the raw `ChunkedUploadResult` object, which contains `photo_id` (not `id`). The `admin_url` is constructed locally and logged to the terminal but is **not included in the JSON data object**. An agent following these capture instructions would get `undefined` for both fields.

**Fix:**
```markdown
Expected output shape: `{ ok: true, data: { photo_id, tree_id, token } }`
Capture:
- `data.photo_id` as `video_id`
- Construct admin URL as: `https://<domain>/manage/video/<data.photo_id>`
  (surface this to the user — the CLI prints it on stdout but it is not in the JSON data object)
```

---

### CR-02: video.md `video subtitle update` example uses invalid oclif boolean flag syntax

**File:** `packages/twentythree-skills/skills/reference/video.md:388`

**Issue:** The example shows `--draft false` to unpublish a subtitle track. The actual CLI flag is defined as `Flags.boolean({ allowNo: true })`, which means the oclif-standard negation form `--no-draft` must be used. `--draft false` is not valid oclif flag syntax and will cause a parse error ("Unexpected argument: false").

**Fix:**
```bash
# Publish a draft subtitle track (remove draft status)
twentythree video subtitle update <id> --subtitle-id en_US --no-draft --json

# Change subtitle type and set as default
twentythree video subtitle update <id> --subtitle-id en_US --type closedcaptions --default --json
```

---

## Warnings

### WR-01: video.md `video subtitle archive` auth scope is misleading for the --progress path

**File:** `packages/twentythree-skills/skills/reference/video.md:521`

**Issue:** `video subtitle archive` is documented with `**Auth scope:** write  **Side effects:** creates`. This is correct for the default (trigger transcription) path. However, `--progress` routes to a different endpoint (`POST /photo/subtitle/archive/get-progress`) that has read-only semantics. An agent with only a `read` token will not know it can call `--progress`, and an agent with only a `write` token will not understand both modes share the same command.

**Fix:** Split the description to note both modes:
```markdown
**Auth scope:** write (trigger transcription) / write (check progress — same scope, read-only semantics)
**Side effects:** creates (without --progress) | none (with --progress)
```
Alternatively add a note: `--progress only reads status; both paths require write scope because the command maps to POST endpoints.`

---

### WR-02: comment.md `comment list` missing `live` from --object-type description

**File:** `packages/twentythree-skills/skills/reference/comment.md:31`

**Issue:** The flag table for `comment list` documents `--object-type` as `Filter by object type (photo, album)`, omitting `live`. An agent listing questions on a webinar using `--object-type live` would not know this is a valid value from reading the flag table alone (though the bash example on line 43 does show `--object-type live`). The inconsistency between the flag table and the example is confusing.

**Fix:**
```markdown
| `--object-type` | no | Filter by object type (photo, album, live) |
```

---

### WR-03: upload-and-publish.md workflow output shape for video update is overly broad

**File:** `packages/twentythree-skills/skills/workflows/upload-and-publish.md:61`

**Issue:** Step 3 documents `Expected output shape: { data: { id, updated_at, ... } }`. The video update response uses `photo_id`, not `id`, as the identifier field. An agent checking `data.id` after a video update would receive `undefined`. This is consistent with the CR-01 pattern: the API uses `photo_id` throughout.

**Fix:**
```markdown
Expected output shape: `{ ok: true, data: { photo_id, title, description, ... } }`
Capture: none (fire-and-forget update — verify with `twentythree video get <video_id> --json` if needed)
```

---

### WR-04: video.md `video upload` documents incorrect default chunk size comment

**File:** `packages/twentythree-skills/skills/reference/video.md:38`

**Issue:** The flag table lists the `--chunk-size` default as `5242880`. This is numerically correct (5 MB = 5 * 1024 * 1024). However, the upload.ts source contains a misleading inline comment on the flag description: `Chunk size in bytes (default: ${DEFAULT_CHUNK_SIZE} = 100MB)`. The `= 100MB` text is wrong in the source code — the constant is actually 5 MB. The skill doc has the correct number, but this source discrepancy may confuse future maintainers. The skill doc is correct as written; this is a source-code bug to note.

**Fix:** No change required in the skill doc — it is correct. File a bug to fix the description string in `src/commands/video/upload.ts`:
```typescript
description: `Chunk size in bytes (default: ${DEFAULT_CHUNK_SIZE} = 5MB)`,
```

---

### WR-05: webinar-lifecycle.md Step 4 output shape documents a field that may not exist

**File:** `packages/twentythree-skills/skills/workflows/webinar-lifecycle.md:77`

**Issue:** Step 4 (`webinar upload-image`) documents `Expected output shape: { data: { id, image_url } }`. Inspecting `webinar upload-image` in the source: the command has `output_shape: { type: 'none' }` (its agentMetadata). It returns no data object. An agent checking `data.image_url` would always get `undefined`.

**Fix:**
```markdown
Expected output shape: none (upload-image returns no JSON body — success is confirmed by exit code 0)
Capture: none (image is attached to the webinar automatically)
```

---

## Info

### IN-01: action.md `action delete` has a duplicated and uninformative bash example

**File:** `packages/twentythree-skills/skills/reference/action.md:126-128`

**Issue:** The two bash examples for `action delete` are identical:
```bash
twentythree action delete <action-id> --json
twentythree action delete <action-id> --json
```
The second comment says "Delete with confirmation" but the command is the same. This is dead content — it doesn't demonstrate a different usage.

**Fix:** Remove the duplicate. If a second example is desired, show a list-then-delete pattern:
```bash
# List actions to confirm the ID before deletion
twentythree action list --video-id <video-id> --json

# Delete the action
twentythree action delete <action-id> --json
```

---

### IN-02: comment.md `comment reaction add` -- `--object-type` documented with API values without a note

**File:** `packages/twentythree-skills/skills/reference/comment.md:182`

**Issue:** The `comment reaction add` flag table lists `--object-type` values as `(live, photo, album)` inline in the description. The file has a Terminology Notes section at the bottom correctly explaining this pattern for `comment` topic commands. However, there is no cross-reference from the reaction add command itself to the terminology note. An agent scanning the reaction add section in isolation may use CLI names instead of API names.

**Fix:** Add a note directly under the `comment reaction add` command header:
```markdown
> `--object-type` uses legacy API names: `photo` (video), `album` (category), `live` (webinar). See Terminology Notes below.
```

---

### IN-03: thumbnail.md `thumbnail data` Step 1 in Common Patterns references a non-existent template

**File:** `packages/twentythree-skills/skills/reference/thumbnail.md:203`

**Issue:** The "Author a new thumbnail template" pattern starts with:
```bash
# Step 1: Preview render variables for a specific video
twentythree thumbnail data <template-id> --object-id <video-id> --json
```
This implies you already have a `<template-id>` before creating the template, which is a chicken-and-egg problem. An agent following this literally would have no template ID to call `thumbnail data` with. The intended workflow is: create a template first (or use an existing one) to preview variables, then edit it.

**Fix:** Reorder or clarify the pattern:
```bash
# Step 1: List existing templates to find one to use as a reference or edit
twentythree thumbnail list --json

# Step 2: Preview render variables against a video to understand available Liquid vars
twentythree thumbnail data <existing-template-id> --object-id <video-id> --json

# Step 3: Create a new template using the discovered variable names
twentythree thumbnail add --name "Brand Template" --liquid-template "<html><body><h1>{{ photo.title }}</h1></body></html>" --json
```

---

### IN-04: analytics.md references `analytics video performance` and `analytics video published` as flat commands but they have sub-commands in the actual file tree

**File:** `packages/twentythree-skills/skills/reference/analytics.md:67-89`

**Issue:** The CLI has `analytics/video/performance/timeseries.ts`, `analytics/video/performance/totals.ts`, `analytics/video/published/timeseries.ts`, and `analytics/video/published/totals.ts` as separate sub-commands. The skill docs document `analytics video performance` and `analytics video published` as single commands. This may be accurate if the index files handle dispatch, but an agent may not discover the sub-variants (`analytics video performance totals`, `analytics video performance timeseries`, etc.) from the skill doc alone.

**Fix:** Add a note under each command:
```markdown
> Sub-commands `analytics video performance totals` and `analytics video performance timeseries` are also available. Run `twentythree analytics video performance --agent` for the full list.
```

---

_Reviewed: 2026-04-20T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
