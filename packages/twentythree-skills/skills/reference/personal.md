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
| Duplicate / create from template | `POST /photo/mischung/duplicate?photo_id=<id>` |

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

**Task fields:** `task_title` (required), `task_description`, `task_notes` (script for the recording), `recipient_email`, `deadline_date`.

---

## § Flows (User Groups)

Flows group users and videos. No dedicated CLI topic — use raw API calls.

| Operation | Endpoint |
|-----------|----------|
| Create flow | `POST /usergroup/create?name=…&join_policy=open\|closed` |
| Update flow | `POST /usergroup/update?user_group_id=<id>&name=…` |
| Delete flow | `POST /usergroup/delete?user_group_id=<id>` |
| List flows | `GET /usergroup/list[?user_id=…&photo_id=…&search=…]` |
| Add user to flow | `POST /usergroup/join?user_group_id=<id>&user_id=<id>` |
| Remove user from flow | `POST /usergroup/leave?user_group_id=<id>&user_id=<id>` |
| Videos in flow | `twentythree video list --user-group-id <id> --mischung --json` (verify flag with `--agent`) |
| Templates in flow | raw `GET /photo/list?user_group_id=<id>&mischung_p=1&mischung_template_p=1` |
| Users in flow | `twentythree user list --user-group-id <id> --json` (verify flag with `--agent`) |

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
| Get embed/share links | `twentythree player embed-versions <id> --object-type photo --json` |

Direct share link: in `player embed-versions` response, find the entry where `type=="link" && key=="secret"`.

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

| Operation | Command |
|-----------|---------|
| Get current user | `twentythree user get --json` |
| Invite user | `twentythree user create --email … --json` |
| Resend invite | `twentythree user send-invitation --user-id <id> --json` |
| List users | `twentythree user list --json` |

Domain-gated signup: permitted domains are listed in `twentythree setting get --json` → `user_approval_auto_domains`.

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
