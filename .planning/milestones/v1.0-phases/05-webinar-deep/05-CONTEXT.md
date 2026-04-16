# Phase 5: Webinar Deep — Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Full webinar sub-resource management: speakers, mail, recording, transcription, series, room, polls, attachments, sections, and queued videos. Covers WEB-12 through WEB-20 plus POL-01 through POL-06.

No new categories or base webinar CRUD — those are Phase 4. No engagement, analytics, or platform commands — those are Phases 6–8.
</domain>

<decisions>
## Implementation Decisions

### 1. Action command output

Commands that are imperatives with no data row to display (`webinar recording start|stop`, `webinar mail send|test`, `webinar speaker send-invitation|request-guest|cancel-guest-request`, `webinar attachment set-hidden`, `webinar queued-video add|remove`) should output a single green success message, e.g.:

```
chalk.green('Recording started')
```

No table, no ID output — just the success line. `--json` returns `{ ok: true, data: <api response>, summary: '<action>' }`.

### 2. Poll options UX + interactive prompts for required fields

`poll set-options` uses repeated `--option` flags, e.g.:
```
twentythree poll set-options <id> --option "Yes" --option "No" --option "Maybe"
```

**General rule for all Phase 5 commands**: if required fields are not provided as flags, fall back to interactive `@clack/prompts` prompts (same pattern as `video update` / `webinar update`). This applies to `poll add`, `webinar attachment upload`, `webinar speaker add`, `webinar mail add`, etc. — any command with required inputs that the user might omit.

Flag mode (explicit flags) vs interactive fallback (no required flags given) is the standard pattern throughout this phase.

### 3. Mail preview output

`webinar mail preview` prints raw HTML to stdout. No special rendering, no temp file. User can pipe it to a browser or file themselves:
```
twentythree webinar mail preview <id> > preview.html
```

### 4. Token lookup — accept optional flag, auto-lookup if omitted

For endpoints that require a webinar token param (not just `live_id`), follow the same pattern as video sections/subtitles:
- Accept an optional `--token` flag as an escape hatch for power users
- If `--token` is not provided and the command extends `AuthenticatedCommand`, auto-lookup via `fetchWebinarToken(id)` (already exists in `AuthenticatedCommand`)
- The user never needs to supply the token manually in the normal flow

This applies consistently across all Phase 5 sub-resource commands that need a token param: speaker, mail, section, attachment, recording, transcription, room, series.

### 5. Carrying forward from Phase 4

All Phase 4 conventions apply:
- Chunked engine for all file uploads (attachment upload, series thumbnail upload, speaker set-avatar)
- `tokenFieldName` set per-upload: e.g. `'live_id'` for webinar-scoped uploads (same as `webinar upload-image`)
- `extraFields` for upload-type discrimination where needed
- cli-table3 tables for list/read-only commands
- `--json` everywhere with `{ ok, data, summary, breadcrumbs }`
- `formatApiError`, `applyCliTerms`, exit codes 0/1/2
- `fetchWebinarToken` auto-lookup (D-4 above)
- Admin URL printed after create operations: `/manage/webinar/<id>` for webinar resources
- Confirmation prompt (mentioning domain) before destructive deletes
</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above and REQUIREMENTS.md.

### Phase context
- `.planning/REQUIREMENTS.md` — WEB-12–20, POL-01–06 requirement definitions
- `.planning/phases/04-category-webinar-core/04-CONTEXT.md` — Phase 4 conventions (all carry forward)
- `packages/twentythree-cli/src/lib/base-command.ts` — `fetchWebinarToken` helper location
- `packages/twentythree-cli/src/upload/chunked-upload.ts` — chunked engine with `extraFields` support
- `packages/twentythree-cli/src/commands/webinar/upload-image.ts` — reference for webinar chunked upload pattern
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AuthenticatedCommand.fetchWebinarToken(id)` — auto-lookup webinar token, available on all Phase 5 commands
- `uploadChunked` with `extraFields` + `tokenFieldName: 'live_id'` — established in Phase 4 for webinar file uploads
- `renderTable`, `formatApiError`, `parseBoolParam`, `formatJsonOutput` — output utilities
- `applyCliTerms` — maps `live` → `webinar` in all user-visible output

### Established Patterns
- Flag mode + interactive fallback (video/webinar update pattern) applies to all commands with required inputs
- Action commands (no data row): green success + `--json` passthrough
- Chunked upload: show progress bar, print ID + admin URL on success

### Integration Points
- `src/commands/webinar/` — all Phase 5 commands live here as subcommands
- `src/commands/poll/` — new top-level topic for poll commands (POL-01–06)
</code_context>

<specifics>
## Specific Ideas

- `poll set-options` flag design: repeated `--option` flags (`Flags.string({ multiple: true })`)
- `webinar mail preview` pipes raw HTML to stdout — no wrapping or escaping
- Token flag pattern: `--token` optional, auto-looked-up if absent via `fetchWebinarToken`
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 05-webinar-deep*
*Context gathered: 2026-04-15*
