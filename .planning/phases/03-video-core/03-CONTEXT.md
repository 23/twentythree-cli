# Phase 3: Video Core - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

A developer can upload, list, get, update, delete, replace, and manage sections and subtitles for videos — with resumable chunked uploads, live progress feedback, pagination, and zero legacy terminology in output.

The chunked upload engine is **shared infrastructure** for the whole codebase. It lives in `src/upload/` and is the foundation for `video upload`, `video replace`, and all future large-file uploads in later phases (webinar attachments, action video files, open uploads).

No category, webinar, or any other resource commands in this phase.

</domain>

<decisions>
## Implementation Decisions

### 1. Upload progress display — add cli-progress

Add `cli-progress` as a new runtime dependency for the chunked upload engine.

- `ora` (already installed) is a spinner, not a progress bar — it cannot render bytes/percentage/ETA as a live updating bar
- `cli-progress` renders a proper horizontal progress bar with configurable format
- Display format: `[████████░░░░] 60% | 600 MB / 1.0 GB | ETA: 2m30s | 3.2 MB/s`
- One bar per upload (not per chunk — aggregate progress across all concurrent chunks)
- The bar clears on completion; final output is a single success line (no bar artifact left)

### 2. Resume state — in-memory only (no cross-invocation persistence)

Chunk state is NOT persisted across command invocations.

- No chunk manifest written to XDG cache, `conf`, temp files, or anywhere else
- If the process exits mid-upload, the next `video upload` starts from scratch
- Within a single invocation, already-completed chunks are tracked in-memory: when a chunk 409s or the server signals it was already received, skip it
- This keeps the implementation simple and avoids cross-invocation state cleanup problems
- "Resumable" in the context of this CLI means: **within a single invocation**, if a chunk upload fails transiently, retry it (UPL-05: up to 5 retries per chunk). Not cross-session resume.

Note: UPL-06 says "checks which chunks were already accepted before re-uploading" — interpret this as the per-retry check within one invocation, not as a cross-session resume feature.

### 3. Update/create UX — flags AND interactive input

All `video update` (and similar metadata-mutating commands) support two modes:

**Flag mode** (explicit): `video update <id> --title "New Title" --description "..." --tags "a,b"`
- Each updatable field is a named flag
- Only provided flags are sent to the API (no overwriting fields with empty values)
- Suitable for scripting

**Interactive mode** (when no metadata flags provided): Run `video update <id>` with no metadata flags → clack/prompts walks the user through each field with the current value pre-filled
- Uses `@clack/prompts` text/select prompts
- User can press Enter to keep the current value for any field
- Suitable for ad-hoc edits

Both modes produce the same API call. `--json` suppresses interactive prompts (treats missing flags as "don't update that field").

### 4. List output — table format for interactive use

`video list` (and all list commands) renders a `cli-table3` table by default with key columns.

For `video list`, default table columns:
- ID, Title, Duration, Status, Published, Updated

Table is the default for interactive terminal use. `--json` returns the full API response array and is the machine-readable path. No compact one-liner mode.

Pagination: **auto-paginate** — fetch all pages and aggregate before rendering (per roadmap success criteria). The table renders once with all results.

### Output JSON shape

Per success criteria: all commands accept `--json` and return `{ ok, data, summary, breadcrumbs }`:
- `ok`: boolean
- `data`: the raw API response (or array for lists)
- `summary`: human-readable one-liner (e.g. "3 videos")
- `breadcrumbs`: `[{ domain }, { resource, id? }]`

### Exit codes

- `0`: success
- `1`: command error (API error, validation failure)
- `2`: user cancelled (confirmation prompt declined)

### Carried forward from Phase 2

- All commands extend `AuthenticatedCommand` (video commands require auth)
- `printWorkspaceHeader()` called at start of every `run()` method
- `--workspace` and `--json` flags inherited from `BaseCommand`
- `openapi-fetch` client from `this.apiClient` — already constructed with token by `BaseCommand.init()`
- Term map applied to ALL user-visible output — no `photo`, `album`, or `live` in any string
- `@clack/prompts` for interactive input, `chalk` for color, `cli-table3` for tables
- Confirmation prompts for destructive operations include the workspace domain

### Claude's Discretion

- Exact cli-progress format string and bar width
- Which specific video metadata fields are exposed as update flags (derive from OpenAPI spec)
- Subtitle and section subcommand flag design (consistent with video update pattern above)
- Chunk size and concurrency defaults (100MB / 5 parallel per UPL-03/04)
- Error message wording for upload failures
- Column widths and truncation behavior in table output

</decisions>

<canonical_refs>
## Canonical References

- `.planning/REQUIREMENTS.md` — UPL-01 through UPL-08, VID-01 through VID-10, CLI-01 through CLI-04
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria
- `.planning/phases/02-auth-workspaces/02-CONTEXT.md` — Prior decisions (BaseCommand, API client, output patterns)
- `packages/twentythree-cli/src/lib/base-command.ts` — BaseCommand/AuthenticatedCommand to extend
- `packages/twentythree-cli/src/api/client.ts` — API client factory pattern to follow
- `packages/twentythree-cli/src/auth/term-map.ts` — Term mapping module (apply to all output)

</canonical_refs>

<deferred>
## Deferred Ideas

None raised during discussion.

</deferred>
