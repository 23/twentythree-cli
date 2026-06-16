---
name: personal
description: Personal video recording — browser-based screen/webcam recording, mischung videos, templates, flows, tasks, folders, activities, email sharing, and use case catalog. Always operates on a dedicated Personal workspace.
---

# TwentyThree Personal Video

> Personal is a browser-based screen/webcam recording tool in the TwentyThree suite.
> All Personal operations use standard TwentyThree API calls, but against a **dedicated Personal workspace** — not the user's main video or webinar workspace.
> **Before any Personal operation, confirm the active workspace is the Personal workspace.**

## Terminology

| Personal product term | API / CLI term |
|-----------------------|----------------|
| Personal video | mischung video (`mischung_p=1`) |
| Template | mischung template (`mischung_template_p=1`) |
| Flow | user group (`usergroup`) |
| Folder | album (CLI: `category`) |
| Recording part / track | mischung part/track |
| Task | mischung task (`/photo/mischung/task/*`) |

---

## § Workspace Context

> **CRITICAL: Personal always lives in its own workspace. Never operate on Personal data from the wrong workspace.**

### Check current workspace

```bash
twentythree auth status --json
# Inspect data.domain — Personal workspaces typically use *.personalvideo.co
# or a custom domain configured for Personal.
```

### If not on the Personal workspace

1. List all configured workspaces:

```bash
twentythree workspace list --json
```

2. Identify the Personal workspace domain in the output.
3. **Show the user both the current domain and the target domain. Confirm intent before switching.**
4. Switch:

```bash
twentythree workspace use company.personalvideo.co
```

**Never silently switch workspaces.** Always show the user what workspace they are on and what they are switching to before running `workspace use`.

---

## § Video Listing (Personal)

Always filter with `--mischung` (maps to `mischung_p=1`) when listing Personal recordings. Check flag availability with `twentythree video list --agent` before use — flags may not yet be implemented; if unavailable, use raw API calls.

| View | CLI flags | Description |
|------|-----------|-------------|
| My videos | `video list --mischung --user-id me --include-unpublished --json` | User's own recordings |
| Team videos | `video list --mischung --include-unpublished --require-posts --orderby posted --json` | All team recordings |
| Templates | `video list --mischung-template --include-unpublished --json` | Recording templates |
| Folder contents | `video list --category-id <album_id> --mischung --json` | Videos in a specific folder |

---

## § Mischung Video Operations

### CLI commands (standard video topic)

| Operation | Command |
|-----------|---------|
| Get specific recording | `twentythree video list --photo-id <id> --mischung --include-unpublished --json` |
| Update metadata | `twentythree video update <id> --title "…" --json` |
| Delete | `twentythree video delete <id> --json` |
| Transcoding progress | `twentythree video transcoding-progress <id> --json` |

For transcoding-progress, check `.data.progress.all` in the response — `1.0` means ready.

### Operations without CLI commands (raw API)

| Operation | Notes |
|-----------|-------|
| Upload (new mischung) | Multi-step asset flow — see Raw API Operations section |
| Replace (edit existing) | Raw API — see Raw API Operations section |
| Duplicate / create from template | `POST /photo/mischung/duplicate?photo_id=<id>` → returns a new `photo_id`. Works on a **normal (non-mischung) video** too — it wraps the source video in a fresh mischung composition. |
| Read the misch JSON | `GET /photo/list?photo_id=<id>&mischung_p=1&include_unpublished_p=1`, then download the URL in the `video_medium_download` property and parse it as JSON (contains `misch.info.originalParts`). |
| Replace thumbnail | Token + Resumable flow: `POST /photo/get-replace-token?photo_id=<id>&valid_minutes=360&max_uploads=5` → returns `replace_token` → upload a PNG to `/photo/redeem-replace-token` with that token. |

---

## § Templates

Templates are mischung videos with `mischung_template_p=1`.

| Operation | Method |
|-----------|--------|
| List templates | `twentythree video list --mischung-template --include-unpublished --json` (verify flag with `--agent`) |
| Save video as template | `twentythree video update <id> --mischung-template-p 1 --json` (verify flag) or raw `POST /photo/update?photo_id=<id>&mischung_template_p=1` |
| Create from template | raw `POST /photo/mischung/duplicate?photo_id=<template_id>` |
| Set template icon | raw `POST /photo/update?photo_id=<id>&mischung_template_icon=<icon>` |
| List available icons | raw `GET /internal/design/icons` |

---

## § Tasks

Tasks assign recording work to users. All task operations use raw API calls. Get `api_base_url` from `twentythree auth status --json` → `data.api_base_url`.

| Operation | Endpoint |
|-----------|----------|
| List my tasks | `POST /photo/mischung/task/list?assignee_user_id=me` |
| List tasks I created | `POST /photo/mischung/task/list?user_id=me` |
| Completed tasks | `POST /photo/mischung/task/list?associated_user_id=me&completed_p=1` |
| Uncompleted count | `POST /photo/mischung/task/list?assignee_user_id=me&size=1&completed_p=0` → read `total_count` |
| Create new video task | `POST /photo/mischung/task/add?assignee_users=<uid>&task_title=…[&template_photo_id=…]` |
| Assign part recording | `POST /photo/mischung/task/add?assignee_user_id=<uid>&task_photo_id=<id>&task_part_uuid=<uuid>&task_title=…` |
| Task redirect URL | `GET /photo/mischung/task/redirect?task_id=<id>` |
| Complete task | `POST /photo/mischung/task/complete?task_id=<id>` |
| Delete task | `POST /photo/mischung/task/delete?task_id=<id>` |

**Task fields:** `task_title` (required), `task_description`, `task_notes` (script for the recording), `recipient_email`, `deadline_date`. Use `assignee_users=<id>,<id>` (comma-separated) for new-video tasks, or `assignee_user_id=<id>` for a single part-recording task.

**Shorthand listing:** `POST /photo/mischung/task/list?task_for=me` (assigned to me) or `?task_for=others` (created by me for others).

**Auto-completion:** a task is normally completed automatically when the assignee uploads/replaces the finished video — `POST /photo/mischung/upload` and `/photo/mischung/replace` return a `tasks` array of tasks completed by that action (refresh task lists when it is non-empty). Explicit completion via `task/complete` or `?complete_task_id=<id>` on upload/replace is rarely needed.

---

## § Flows (User Groups)

Flows group users **and** videos/templates. A flow has a `join_policy` of `open` (public) or `closed` (private). No dedicated CLI topic — use raw API calls.

| Operation | Endpoint |
|-----------|----------|
| Create flow | `POST /usergroup/create?name=…&join_policy=open\|closed[&description=…]` → returns `user_group_id` |
| Update flow | `POST /usergroup/update?user_group_id=<id>&name=…[&join_policy=…&description=…]` |
| Delete flow | `POST /usergroup/delete?user_group_id=<id>` |
| List flows | `GET /usergroup/list[?user_group_id=…&user_id=…&not_user_id=…&photo_id=…&search=…&join_policy=…&include_member_list=0\|1]` |
| List flows + my membership | `GET /usergroup/list?include_member_status_p=1` (adds whether the authenticated user is a member of each) |
| Add user to flow | `POST /usergroup/join?user_group_id=<id>&user_id=<id>` (also used by a user to join an `open` flow) |
| Remove user from flow | `POST /usergroup/leave?user_group_id=<id>&user_id=<id>` |
| Videos in flow | raw `GET /photo/list?user_group_id=<id>&mischung_p=1&mischung_template_p=0` |
| Templates in flow | raw `GET /photo/list?user_group_id=<id>&mischung_p=1&mischung_template_p=1` |
| Attach video/template to flow | raw `POST /photo/update?photo_id=<id>&user_group_id=<id>` |
| Users in flow | raw `GET /user/list?user_group_id=<id>&use_full_urls_p=1` |
| Users NOT in flow | raw `GET /user/list?not_user_group_id=<id>&exclude_requesting_user_p=1&use_full_urls_p=1[&search=…]` |

**Save a video as a new template + flow in one step:** `POST /photo/mischung/replace?photo_id=<id>&asset_uri=…&mischung_template_p=1&attach_mischung_template_to_new_user_group_p=1&title=<name>` — the response includes the new `user_group_id`.

---

## § Folders (Albums = Categories in CLI)

Folders use the album/category API. CLI topic: `twentythree category *`.

| Operation | Command |
|-----------|---------|
| Create folder | `twentythree category create --title "My folder" --json` |
| List folders | `twentythree category list --json` |
| Delete folder | `twentythree category delete <album_id> --json` |
| Place video in folder | `twentythree video update <video_id> --category-id <album_id> --json` |
| Remove video from folder | raw `POST /photo/update?photo_id=<id>&album_id=` (empty string clears) |

---

## § Activities

Raw `GET /user/activity?context=personal` — returns up to 100 recent items sorted by recency.

Activity types: `video-watched`, `user-added`, `video-created`.

Each item has: `message` (HTML), `timestamp` (UTC epoch), optional `user_avatar_url`, `user_name`, `video_thumbnail_url`.

---

## § Email Sharing

| Operation | Endpoint |
|-----------|----------|
| Preview email HTML | `GET /mail/get-attachments-html?selection=photo:<id>&gif_p=0` |
| Send video email | `POST /mail/send?selection=photo:<id>&to=…&subject=…&body=…&gif_p=0` |
| Get embed/share links | `twentythree player embed-versions <id> --object-type photo --json` (raw API accepts `&email_image_time=0-2`) |

- **Body placeholder:** if `body` contains the string `***VIDEOATTACHMENT***`, the video thumbnails replace it there; otherwise they are appended after the body.
- **Direct share link:** in `player embed-versions` response, find the entry where `type=="link" && key=="secret"`.
- **Trackable email embed codes:** use the entries where `type=="email"`. Each version also carries a `copy_mime_type` (`text/plain` or `text/html`) indicating how it should be copied.

---

## § Use Case Catalog

Pre-built video templates managed by TwentyThree admins.

| Operation | Endpoint |
|-----------|----------|
| List use cases | `GET /photo/mischung/usecase/list[?category=…&search=…&orderby=…]` |
| List categories | `GET /photo/mischung/usecase/categories` |
| Use a use case | `POST /photo/mischung/usecase/use?use_case_id=<id>` → returns `photo_id` |

---

## § User Management (Personal)

Standard user commands apply. Key Personal-specific patterns:

| Operation | Command / Endpoint |
|-----------|--------------------|
| Get current user | `twentythree user get --json` (returns `user_id`, `full_name`, `email`, `title`, `has_profile_image_p`, `profile_image_url`, `site_admin_p`, `accepted_invitation_p`) |
| Invite user | `twentythree user create --email … --json` (raw API also accepts `&full_name=…&invitation_message=…`; bulk-invite by calling once per address for per-user error handling) |
| Resend invite | `twentythree user send-invitation --user-id <id> --json` (raw API also accepts `&invitation_message=…`) |
| List users | `twentythree user list --json` (raw filters: `search`, `orderby=full_name`, `use_full_urls_p=1`, pagination `p`/`size`) |
| Team leaderboard | raw `GET /user/list?orderby=number_of_photos&order=desc&include_metrics_p=1&metric_interval=year\|month&size=10&use_full_urls_p=1` |
| Grant/revoke admin | raw `POST /user/update?user_id=<id>&site_admin=0\|1` (admin only) |
| Disable/enable login | raw `POST /user/update?user_id=<id>&allow_login_p=0\|1` (admin only) |
| Update own profile/password | raw `POST /user/update?full_name=…&email=…&password=…` |
| Update avatar | raw `POST /user/update` as `multipart/form-data` with a `profile_image` file field |

Domain-gated signup: permitted domains are listed in `twentythree setting get --json` → `user_approval_auto_domains` (may be empty on some sites — handle that). Onboarding state is tracked by the user's `accepted_invitation_p`.

---

## § Notifications

In-product user notifications (e.g. the welcome message).

| Operation | Endpoint |
|-----------|----------|
| List notifications | `GET /user/notification/list?context=videos` |
| Dismiss a notification | `POST /user/notification/dismiss?user_notification_id=<id>` (e.g. `personal-welcome`) |

---

## § Cross-Site Invitations (same email domain)

Users can request access to other Personal sites that share the main domain of their email address. All raw API.

| Operation | Endpoint |
|-----------|----------|
| List sites I can request | `GET /user/domainsite/sites` |
| Request an invite to a site | `POST /user/domainsite/request-invite?site_id=<id>` |
| List my outgoing requests | `GET /user/domainsite/user-invites` |
| List requests to this site (admin) | `GET /user/domainsite/site-invites` |
| Approve a request (admin) | `POST /user/domainsite/send-invitation?user_id=<id>` |
| Dismiss a request (admin by `user_id`, or originator by `site_id`) | `POST /user/domainsite/dismiss-invitation?user_id=<id>` / `?site_id=<id>` |

---

## § Raw API Operations — Mischung Upload Flow

When no CLI command exists, use this pattern. Get `api_base_url` from `twentythree auth status --json` → `data.api_base_url`. All paths below are relative to that base URL.

**New mischung upload:**

1. Get asset upload token: `POST /asset/get-upload-token?valid_minutes=360&max_uploads=50`
2. Upload component video files, poster PNG, and `.misch` file to `/asset/redeem-upload-token` using the token
3. Save new video: `POST /photo/mischung/upload?asset_uri=twentythree://asset/<token>/<uuid>.misch&title=…`

**Save edit to existing mischung:**

`POST /photo/mischung/replace?asset_uri=twentythree://asset/<token>/<uuid>.misch&photo_id=<id>`

---

## Terminology Notes

- CLI `video` = API `photo`
- CLI `category` = API `album`
- Mischung = the internal term for a Personal video recording session and its component parts
- Personal workspace = a distinct TwentyThree workspace dedicated to the Personal product; domain typically `*.personalvideo.co`
