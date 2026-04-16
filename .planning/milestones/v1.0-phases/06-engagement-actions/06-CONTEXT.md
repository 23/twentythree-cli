---
phase: 06-engagement-actions
created: 2026-04-15
status: ready
---

# Phase 6 Context: Engagement & Actions

## Scope

Commands for: action CTAs (add, delete, exclude, include, types, get, update, upload), collector (exclude, include, list), comment (add, delete, promote, set-order, update, clone, list) + comment reaction (add, list, remove), player (delete, embed, embed-versions, styles, list, update), tag (list, related).

---

## Decisions

### D-1: `action upload` — simple multipart, no chunked engine (all file types)

`/action/upload` takes `action_id` + `variable_name` + a file. Unlike video/attachment/avatar uploads, there is no `upload_token` in the body — the file goes directly to an action variable.

**Decision:** Use a simple multipart `FormData` POST via native `fetch`, not the chunked engine. No progress bar. This applies to **all file types including video** — D-1 supersedes ACT-09's "use chunked engine for video" clause entirely.

**CLI:**
```
twentythree action upload <action-id> <variable-name> <file>
```

### D-2: `comment` — standalone generic topic

Comments use `object_id` + `object_type` — they can belong to videos, webinars, or categories. Not nested under any resource.

**Decision:** Standalone `comment` topic with `--object-id` and `--object-type` flags. Follow API parameter naming exactly — `object_id` → `--object-id`, never aliased.

**CLI:**
```
twentythree comment list --object-id 123 --object-type photo
twentythree comment add --object-id 123 --object-type photo --content "..."
```

`object_type` values pass through as-is (API native: `photo`, `album`, `live`). No term-mapping on `--object-type` values.

### D-3: `comment reaction` — 3-level oclif topic, follow API namespace

Comment reactions are `/comment/reaction/add`, `/comment/reaction/list`, `/comment/reaction/remove`.

**Decision:** Use 3-level oclif topic: `comment reaction add`, `comment reaction list`, `comment reaction remove`. Always follow API namespace structure when possible.

**CLI:**
```
twentythree comment reaction add <comment-id> --object-id 123 --object-token abc --reaction "👍"
twentythree comment reaction list --object-id 123 --object-token abc
twentythree comment reaction remove <comment-id> --object-id 123 --object-token abc --reaction "👍"
```

Token auto-lookup pattern applies for `object_token` when `--object-type` indicates a resource that supports it (webinar → `fetchWebinarToken`).

### D-4: `player embed` — extract embed_code from JSON, write to stdout

`/player/embed` returns **JSON** (`{ data: { embed_code: "..." } }`), not raw HTML. The `mail preview` analogy was incorrect on the transport layer.

**Decision:** Use `apiClient.GET('/player/embed', ...)`, extract `(data as any)?.data?.embed_code`, then write via `process.stdout.write(embedCode)`. Pipe-able, no trailing newline. `--json` wraps the embed_code in `formatJsonOutput`.

**CLI:**
```
twentythree player embed --video-id 123 > embed.html
twentythree player embed --webinar-id 456 --responsive
```

Term mapping applies: `live_id` → `--webinar-id`, `photo_id` → `--video-id`, `album_id` → `--category-id`.

### D-5: `action get` — single flexible command with optional context flags

`/action/get` accepts many optional context params: `object_id`, `action_id`, `live_id`, `photo_id`, `token`, `player_id`.

**Decision:** Single `action get` command. All context fields are optional flags. API parameter naming rules apply:
- `live_id` → `--webinar-id`
- `photo_id` → `--video-id`  
- `object_id` → `--object-id`
- `action_id` positional arg (most common case)
- `token`, `player_id` → `--token`, `--player-id`

---

## Established Patterns (from prior phases)

The following are already decided — do not re-litigate:

- **Term mapping**: `live_*` → `webinar-*`, `photo_*` → `video-*`, `album_*` → `category-*`, `object` → stays as `object`
- **Boolean `_p` suffix**: drop `_p` in CLI flags (e.g., `open_p` → `--open`)
- **Two-arg sub-resources**: commands needing parent + resource ID use positional `parentId id` args; body sends both API fields
- **Action commands**: single green success line; `--json` returns `{ ok, data, summary, breadcrumbs }`
- **List commands**: `renderTable()` + dim count line; empty state: "No X found."
- **Chunked uploads**: used for video/attachment/avatar; NOT for action/upload (see D-1)
- **Raw HTML output**: native `fetch` + `response.text()` + `process.stdout.write()` — no openapi-fetch
- **Confirmation prompts**: destructive commands confirm with domain in message; exit code 2 on cancel
- **`applyCliTerms()`**: applied to all user-facing strings and error messages

---

## API Endpoint Inventory

| CLI command | API endpoint | Method |
|---|---|---|
| `action add` | `/action/add` | POST form |
| `action delete` | `/action/delete` | POST form |
| `action exclude` | `/action/exclude` | POST form |
| `action include` | `/action/include` | POST form |
| `action types` | `/action/types` | GET query |
| `action get` | `/action/get` | GET query |
| `action update` | `/action/update` | POST form |
| `action upload` | `/action/upload` | POST multipart (D-1) |
| `collector exclude` | `/collector/exclude` | GET query |
| `collector include` | `/collector/include` | GET query |
| `collector list` | `/collector/list` | GET query |
| `comment add` | `/comment/add` | POST form |
| `comment delete` | `/comment/delete` | POST form |
| `comment promote` | `/comment/promote` | POST form |
| `comment set-order` | `/comment/set-order` | POST form |
| `comment update` | `/comment/update` | POST form |
| `comment clone` | `/comment/clone` | GET query |
| `comment list` | `/comment/list` | GET query |
| `comment reaction add` | `/comment/reaction/add` | GET query |
| `comment reaction list` | `/comment/reaction/list` | GET query |
| `comment reaction remove` | `/comment/reaction/remove` | GET query |
| `player delete` | `/player/delete` | POST form |
| `player embed` | `/player/embed` | GET query (D-4) |
| `player embed-versions` | `/player/embed-versions` | GET query |
| `player styles` | `/player/styles` | GET query |
| `player list` | `/player/list` | POST form |
| `player update` | `/player/update` | POST form |
| `tag list` | `/tag/list` | GET query |
| `tag related` | `/tag/related` | GET query |
