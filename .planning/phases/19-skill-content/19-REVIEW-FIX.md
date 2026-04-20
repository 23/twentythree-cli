---
phase: 19-skill-content
fixed_at: 2026-04-20T12:30:00Z
review_path: .planning/phases/19-skill-content/19-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 6
skipped: 1
status: partial
---

# Phase 19: Code Review Fix Report

**Fixed at:** 2026-04-20T12:30:00Z
**Source review:** .planning/phases/19-skill-content/19-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (2 Critical + 5 Warning)
- Fixed: 6
- Skipped: 1

## Fixed Issues

### CR-01: upload-and-publish.md captures wrong JSON fields after video upload

**Files modified:** `packages/twentythree-skills/skills/workflows/upload-and-publish.md`
**Commit:** 3df3197
**Applied fix:** Updated the intro callout to reference `data.photo_id` for upload responses. Updated Step 2 expected output shape from `{ data: { id, admin_url } }` to `{ ok: true, data: { photo_id, tree_id, token } }`, changed capture instructions to use `data.photo_id` and construct admin URL manually (noting it is stdout-only, not in the JSON object). Updated the Notes section to remove the misleading `data.admin_url` reference.

---

### CR-02: video.md `video subtitle update` example uses invalid oclif boolean flag syntax

**Files modified:** `packages/twentythree-skills/skills/reference/video.md`
**Commit:** 705ab56
**Applied fix:** Replaced `--draft false` with `--no-draft` in both occurrences — the `video subtitle update` command example (line 388) and the "Upload and publish subtitle tracks" common pattern (line 605). Updated the comment on the first example to "Publish a draft subtitle track (remove draft status)" for clarity.

---

### WR-01: video subtitle archive auth scope is misleading for the --progress path

**Files modified:** `packages/twentythree-skills/skills/reference/video.md`
**Commit:** 0f9043c
**Applied fix:** Replaced the single-line `**Auth scope:** write  **Side effects:** creates` with a split form showing both modes: `write (both paths)  **Side effects:** creates (without --progress) | none (with --progress)`. Added a note below the description explaining that `--progress` has read-only semantics but both paths require write scope because the command maps to POST endpoints.

---

### WR-02: comment list flag table omits `live` from --object-type valid values

**Files modified:** `packages/twentythree-skills/skills/reference/comment.md`
**Commit:** 4b64a08
**Applied fix:** Updated the `--object-type` flag description in the `comment list` flag table from `Filter by object type (photo, album)` to `Filter by object type (photo, album, live)`, matching the existing bash example on the line below.

---

### WR-03: upload-and-publish.md Step 3 output shape documents `data.id`

**Files modified:** `packages/twentythree-skills/skills/workflows/upload-and-publish.md`
**Commit:** 2b5c4d1
**Applied fix:** Updated Step 3 expected output shape from `{ data: { id, updated_at, ... } }` to `{ ok: true, data: { photo_id, title, description, ... } }`. Extended the Capture note to suggest using `twentythree video get <video_id> --json` for verification if needed.

---

### WR-05: webinar-lifecycle.md Step 4 documents a field that does not exist

**Files modified:** `packages/twentythree-skills/skills/workflows/webinar-lifecycle.md`
**Commit:** 1fad9ec
**Applied fix:** Updated Step 4 expected output shape from `{ data: { id, image_url } }` to `none (upload-image returns no JSON body — success is confirmed by exit code 0)`, matching the command's `output_shape: none` in agentMetadata.

---

## Skipped Issues

### WR-04: video.md `video upload` documents incorrect default chunk size comment

**File:** `packages/twentythree-cli/src/commands/video/upload.ts`
**Reason:** Not fixable in skill files — the bug is in CLI source code, not in the skill docs. The skill doc correctly documents `5242880` (5 MB). The misleading `= 100MB` comment is in `src/commands/video/upload.ts` source and requires a separate fix to the CLI package. Per the REVIEW.md: "No change required in the skill doc — it is correct. File a bug to fix the description string."
**Original issue:** The `upload.ts` source contains an inline comment `= 100MB` on the `--chunk-size` flag description, but the actual default constant is 5 MB. The skill doc value is correct; the source comment is wrong.

---

_Fixed: 2026-04-20T12:30:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
