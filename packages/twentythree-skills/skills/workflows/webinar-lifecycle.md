---
name: webinar-lifecycle
description: Create, configure, run, record, and archive a live webinar end-to-end.
---

# Workflow: Webinar Lifecycle

> Complete sequence from creating a webinar through archiving it after the session ends.
> All commands use `--json` — capture IDs from the `data.id` field of each response.
> CLI `webinar` maps to API `live` — see `reference/webinar.md` §Terminology Notes.

> See [`reference/webinar.md`](../reference/webinar.md) for exhaustive flag details on every command referenced below.

## Prerequisites

- Auth scope required: **write** (create, update, upload-image, recording, publishing)
  - Some read-only steps (room connect, clips) accept `read` scope
- Run `twentythree auth credentials` if not already configured.
- Confirm auth: `twentythree auth status --json`
- NOTE: There is no `webinar get` command — to retrieve webinar details, use `webinar list --search "<title>" --json` (see `reference/webinar.md`).

## Steps

### 1. Create the webinar

```bash
twentythree webinar create --title "Q2 Town Hall" --live-date "2026-05-15T16:00:00Z" --description "Quarterly update" --json
```

Expected output shape: `{ data: { id, admin_url } }`
Capture:
- `data.id` as `webinar_id`
- `data.admin_url` as `admin_url` (surface to the user — always print ID + admin URL after create)

On failure:
- `400 Invalid date` → `--live-date` must be ISO 8601 (e.g. `2026-05-15T16:00:00Z`)
- `401 Unauthorized` → run `twentythree auth status --json`

---

### 2. (Optional) Add agenda sections

```bash
twentythree webinar section add <webinar_id> --title "Intro" --start-time 0 --json
twentythree webinar section add <webinar_id> --title "Q&A" --start-time 1800 --json
```

Expected output shape: `{ data: { id, title, start_time } }`
Capture: `data.id` as `section_id` if you intend to update or remove this section later; otherwise none
On failure:
- `404 Not Found` → confirm `webinar_id` exists (`twentythree webinar list --search "<title>" --json`)
- Validation error → confirm `--start-time` is in seconds, not mm:ss format

---

### 3. (Optional) Add speakers

```bash
twentythree webinar speaker add <webinar_id> --name "Jane Doe" --email jane@example.com --title "CTO" --json
```

Expected output shape: `{ data: { id, name, role } }`
Capture: `data.id` as `speaker_id` if you need to update or remove this speaker later
On failure:
- Missing required flag → run `twentythree webinar speaker add --agent` to see the complete flag list
- `404 Not Found` → confirm `webinar_id` exists

---

### 4. (Optional) Upload a thumbnail image

```bash
twentythree webinar upload-image <webinar_id> ./thumb.jpg --type thumbnail --json
```

Expected output shape: `{ data: { id, image_url } }`
Capture: none (image is attached to the webinar automatically)
On failure:
- `413 Payload Too Large` → resize image; chunked upload is automatic but workspace size limits still apply
- `401 Unauthorized` → run `twentythree auth status --json`

---

### 5. Publish the webinar (make visible to registrants)

```bash
twentythree webinar update <webinar_id> --publish --json
```

Expected output shape: `{ data: { id, published: true } }`
Capture: confirm `data.published` is `true`
On failure:
- `403 Forbidden` → auth scope `write` required
- Publish fails silently → run `twentythree webinar list --search "<title>" --json` and check the `published` field

---

### 6. Get room connection info (when going live)

```bash
twentythree webinar room connect <webinar_id> --json
```

Expected output shape: `{ data: { stream_key, room_url } }`
Capture:
- `data.stream_key` as `stream_key` — pass to your broadcasting software (OBS, Zoom, etc.)
- `data.room_url` as `room_url` — pass to moderators who join the room

On failure:
- Webinar status is `previous` → room connection unavailable for archived webinars; run `twentythree webinar update <webinar_id> --status upcoming --json` to re-open
- `404 Not Found` → confirm `webinar_id` is correct

---

### 7. (Optional) Start recording once the live session is active

```bash
twentythree webinar recording start <webinar_id> --json
```

Expected output shape: `{ data: {} }` (recording start returns minimal output; confirm via `recording status`)
Capture: none (recording is attached to the webinar; monitor via `webinar recording status`)
On failure:
- `409 Conflict` → recording already in progress; run `twentythree webinar recording status <webinar_id> --json` to check
- `403 Forbidden` → auth scope `write` required

---

### 8. Stop recording (after session ends)

```bash
twentythree webinar recording stop <webinar_id> --json
```

Expected output shape: `{ data: {} }` (recording stop returns minimal output; clip processing begins asynchronously)
Capture: none
On failure:
- `409 Conflict` → no recording in progress; confirm with `twentythree webinar recording status <webinar_id> --json`

---

### 9. Check recording status and wait for clips

```bash
twentythree webinar recording status <webinar_id> --json
twentythree webinar clips <webinar_id> --json
```

Expected output shape:
- `recording status`: `{ data: { status, ... } }` — check `data.status` for `processing` or `complete`
- `webinar clips`: `{ data: [ { id, title, duration, ... } ] }` — array of clip objects; empty while still processing

Capture:
- `recording status` `data.status` — must be `complete` before clips are fully available
- `webinar clips` array — each element is a clip with an `id` you can use with `twentythree video` commands

On failure:
- Clips array empty immediately after `stop` → normal; recording processing takes several minutes
- Clips still empty after 10+ minutes → contact support

Polling pattern (wait for at least one clip to be available):

```bash
while true; do
  CLIPS=$(twentythree webinar clips <webinar_id> --json | jq '.data | length')
  if [ "$CLIPS" -gt 0 ]; then break; fi
  sleep 60
done
```

---

### 10. (Optional) Archive — mark as previous

```bash
twentythree webinar update <webinar_id> --status previous --json
```

Expected output shape: `{ data: { id, status: "previous" } }`
Capture: none
On failure:
- `400 Bad Request` → check current status; `recording stop` must be called before archiving a live session
- Some status transitions may be blocked: confirm `recording status` is not `recording` before archiving

---

## Error Handling

| Step | Failure | What to check |
|------|---------|---------------|
| 1 | Invalid date | `--live-date` must be ISO 8601 (e.g. `2026-05-15T16:00:00Z`) |
| 1 | `401 Unauthorized` | `twentythree auth status --json` to confirm credentials |
| 2-3 | Missing required flags | Run `twentythree webinar <subtopic> <cmd> --agent` to enumerate all flags |
| 2-3 | `404 Not Found` | `webinar_id` invalid; `twentythree webinar list --search "<title>" --json` to find it |
| 5 | Publish 403 | Confirm auth scope is `write` |
| 6 | Room connection blocked | Webinar status must be `upcoming` or `live`, not `previous` |
| 7 | Recording 409 Conflict | Already recording; `twentythree webinar recording status <webinar_id> --json` first |
| 8 | Stop 409 Conflict | No recording in progress; verify with `recording status` |
| 9 | Clips empty | Processing can take 10+ minutes after `recording stop`; poll every 60s |
| 10 | Status transition blocked | Confirm `recording stop` was called; check `recording status` is not `recording` |

## Notes

- Steps 2-4 (sections, speakers, thumbnail) are optional but improve viewer experience.
- Step 6 (`room connect`) returns credentials for a third-party broadcaster. Agents should NOT attempt to stream content themselves — pass the `stream_key` and `room_url` to the user.
- Steps 7-8 (recording start/stop) are optional. If you skip them, no clips will be generated after the session.
- Step 9's polling loop can be replaced by subscribing to the `recording.completed` webhook event (see `reference/webhook.md`).
- Use `twentythree webinar list --search "<title>" --json` as the canonical way to retrieve webinar details — there is no `webinar get` command.
- Clips generated from recording are standard video assets. After they appear in `webinar clips`, you can manage them with the full `video` command set (e.g. `twentythree video update <clip_id> --publish --json`).
