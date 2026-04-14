# Phase 4: Category & Webinar Core — Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

A developer can perform full CRUD on categories and run the core webinar lifecycle: list, create, update, delete, upload-image, metrics, clips, highlights, list-formats, log, and repeat.

API mapping: categories → `album/*`, webinars → `live/*`.

No webinar deep surface (speakers, mail, recording, series, polls) — that is Phase 5.
</domain>

<decisions>
## Implementation Decisions

### 1. File upload — always use chunked engine

When an endpoint supports file upload, always use the chunked upload engine (`src/upload/chunked-upload.ts`). This applies to `webinar upload-image` and any future file upload commands in later phases.

Do not use direct multipart POST for file uploads even if the file is expected to be small. Chunked is the standard path for this CLI.

Progress bar, ID output, and admin URL follow the same pattern as `video upload`:
- Show `[████░░] pct% | bytes / total | speed/s` on stderr
- On completion print `Admin: https://<domain>/manage/webinar/<id>`

### 2. `webinar create` / `webinar update` — fields and UX

**Fields** for create and update:
- `title` (required for create)
- `description`
- `webinar_status` (the API field — maps from `--status` flag)
- `live_date` / `live_date_ansi` — the scheduled live date/time
- `draft_p` — boolean, maps from `--draft` / `--no-draft` with hidden `--draft-p` alternative
- `published_p` — boolean, maps from `--publish` / `--no-publish` with hidden `--published-p` alternative

Follow the same `_p`-suffix convention established in Phase 3:
- CLI flags drop `_p` (e.g. `--draft`, `--publish`)
- Hidden raw alternative: `--draft-p <bool>`, `--published-p <bool>`
- `allowNo: true` on all boolean flags so `--no-draft`, `--no-publish` work

**UX pattern** (same as `video update`):
- Flag mode: `webinar update <id> --title "New Title"` — only provided flags sent to API
- Interactive fallback: `webinar update <id>` with no metadata flags → `@clack/prompts` walk-through with current values pre-filled
- `--json` suppresses interactive mode

### 3. Read-only webinar commands — table output

`webinar metrics`, `webinar clips`, `webinar highlights`, `webinar log`, `webinar list-formats` all render as `cli-table3` tables. Choose columns from the actual API response fields. `--json` returns raw data.

For commands that return a single object (e.g. metrics), render a two-column key-value table (label | value).

### 4. `webinar repeat` — duplicate + reschedule

`webinar repeat <id> --date <datetime>` duplicates the webinar and schedules the newly created copy to run at the given date/time. Required flag: `--date` (ISO 8601 or human-readable date string, passed through to the API).

Success output:
```
Webinar duplicated and scheduled
ID:    <new-webinar-id>
Admin: https://<domain>/manage/webinar/<new-id>
```

### 5. Carrying forward from Phase 3

All Phase 3 conventions apply:
- `applyCliTerms` on all user-visible output (album → category, live → webinar)
- `fetchVideoToken`-equivalent for webinar: if any GET endpoint requires a token param, fetch the webinar's token via a preliminary `/live/list?live_id=<id>` lookup (same pattern as `fetchVideoToken`)
- `formatApiError` for error serialization (not `String(error)`)
- Exit codes: 0 success, 1 error, 2 cancelled
- `--json` on every command returning `{ ok, data, summary, breadcrumbs }`
- `category delete` and `webinar delete` require `@clack/prompts` confirmation including domain (same as `video delete`)
- Admin URL printed after create: `/manage/webinar/<id>` for webinars (no equivalent admin path for categories)
</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` — Phase 4 goal and success criteria
- `.planning/REQUIREMENTS.md` — CAT-01 through CAT-04, WEB-01 through WEB-11
- `packages/twentythree-cli/src/lib/base-command.ts` — `fetchVideoToken` pattern to replicate for webinar token lookup
- `packages/twentythree-cli/src/commands/video/upload.ts` — chunked upload + progress bar pattern
- `packages/twentythree-cli/src/commands/video/update.ts` — flag mode + interactive fallback pattern
- `packages/twentythree-cli/src/commands/video/delete.ts` — confirmation prompt pattern
- `packages/twentythree-cli/src/upload/chunked-upload.ts` — upload engine
- `packages/twentythree-cli/src/lib/term-map.ts` — term mappings (album→category, live→webinar)
</canonical_refs>

<deferred>
## Deferred Ideas

None from this discussion.
</deferred>
