---
name: upload-and-publish
description: Upload a video file, set metadata, and publish it on TwentyThree.
---

# Workflow: Upload and Publish a Video

> Complete sequence for uploading a video file, setting metadata, and making it publicly visible.
> All commands use `--json` — capture IDs from the `data.photo_id` field of upload responses and `data.id` for other responses.

> See [`reference/video.md`](../reference/video.md) for exhaustive flag details and [`reference/category.md`](../reference/category.md) for category selection.

## Prerequisites

- Auth scope required: **write**
- Run `twentythree auth credentials` if not already configured.
- Confirm auth: `twentythree auth status --json`
- Chunked upload is automatic — `twentythree video upload` handles chunking internally (see `reference/video.md` §video upload).

## Steps

### 1. (Optional) List categories to find a target category ID

```bash
twentythree category list --json
```

Expected output shape: `{ data: [ { id, title, description, hidden }, ... ] }`
Capture: `data[n].id` of the desired row as `category_id`
On failure:
- `401 Unauthorized` → run `twentythree auth status --json` to confirm credentials
- Empty list → confirm workspace has categories; create one with `twentythree category create --title "…" --json`

---

### 2. Upload the video

```bash
twentythree video upload ./video.mp4 --title "Product Demo" --category-id <category_id> --json
```

Expected output shape: `{ ok: true, data: { photo_id, tree_id, token, admin_url } }`
Capture:
- `data.photo_id` as `video_id`
- `data.admin_url` — the admin URL for the uploaded video (surface this to the user)

On failure:
- Network error or `401` → run `twentythree auth status` and `twentythree doctor`
- Upload stalls → retry; chunked upload resumes automatically (see `reference/video.md` for `--chunk-size` / `--concurrency` tuning)
- `413 Payload Too Large` → the file exceeds workspace quota; check `twentythree site get --include-quota --json`

---

### 3. (Optional) Set additional metadata

```bash
twentythree video update <video_id> --description "Launch video for Q2 release" --tags "product q2 launch" --json
```

Expected output shape: `{ ok: true, data: { photo_id, title, description, ... } }`
Capture: none (fire-and-forget update — verify with `twentythree video get <video_id> --json` if needed)
On failure:
- `403 Forbidden` → confirm auth scope is `write`, not `read`
- `404 Not Found` → confirm `video_id` is correct and video exists (`twentythree video get <video_id> --json`)

---

### 4. (Optional) Set a custom thumbnail frame

```bash
twentythree video frame <video_id> --time 10 --json
```

Expected output shape: `{ data: { id, thumbnail_url } }`
Capture: none
On failure:
- `400 Invalid Time` → ensure `--time` is less than video duration (check via `twentythree video get <video_id> --json`)

---

### 5. (Optional) Wait for transcoding to complete

```bash
twentythree video transcoding-progress <video_id> --json
```

Expected output shape: `{ data: { status, progress } }`
Capture: `data.status` — must be `complete` before publishing
On failure:
- Status stuck at `processing` for >10 minutes → contact support; do NOT publish
- Status `failed` → check the video file; re-upload if corrupt

Polling pattern:

```bash
while true; do
  STATUS=$(twentythree video transcoding-progress <video_id> --json | jq -r '.data.status')
  if [ "$STATUS" = "complete" ]; then break; fi
  sleep 30
done
```

---

### 6. Publish

```bash
twentythree video update <video_id> --publish --json
```

Expected output shape: `{ data: { id, published: true } }`
Capture: confirm `data.published` is `true`
On failure:
- `403 Forbidden` → confirm auth scope is `write`
- Publish fails silently → run `twentythree video get <video_id> --json` and check `published` field

---

## Error Handling

| Step | Failure | What to check |
|------|---------|---------------|
| 1 | Empty category list | `twentythree category create --title "…" --json` to create one |
| 1 | `401 Unauthorized` | `twentythree auth status --json` to confirm credentials |
| 2 | Upload auth/network error | `twentythree auth status --json`, `twentythree doctor` |
| 2 | Quota exceeded | `twentythree site get --include-quota --json` |
| 3 | 403 Forbidden | Confirm auth scope is `write` |
| 3 | 404 Not Found | `twentythree video get <video_id> --json` to confirm video exists |
| 4 | Invalid time | `--time` must be less than duration from `video get` |
| 5 | Transcoding stuck | Poll `transcoding-progress` after 30s; contact support after 10 min |
| 5 | Status `failed` | Check video file integrity; re-upload if corrupt |
| 6 | 403 Forbidden | Confirm auth scope is `write` |
| 6 | Publish fails silently | `twentythree video get <video_id> --json` to check `published` field |

## Notes

- All 6 steps can be scripted in sequence; only Steps 2 and 6 are strictly required (1, 3, 4, 5 are optional).
- For a minimal end-to-end sequence: pass `--publish` directly to the upload command:
  ```bash
  twentythree video upload ./video.mp4 --title "Demo" --publish --json
  ```
  This is valid but skips the optional metadata, frame, and transcoding-check steps.
- The admin URL from Step 2 opens the video's admin edit page — surface this to the user so they can review or make manual edits. It is available as `data.admin_url` in the JSON response and also printed on stdout.
- `--category-id` accepts a comma-separated list of IDs to assign to multiple categories simultaneously.
- After a successful publish, use `twentythree video get <video_id> --json` to confirm the `published` field is `true` before reporting success to the user.
