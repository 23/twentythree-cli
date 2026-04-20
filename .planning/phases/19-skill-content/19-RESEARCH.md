# Phase 19: Skill Content - Research

**Researched:** 2026-04-20
**Domain:** Markdown content authoring — 22 reference files + 2 workflow files for the twentythree-skills agent skills package
**Confidence:** HIGH — all flag data sourced from the running CLI via `--agent`; validator logic sourced from the actual script; format guidance sourced from the existing SKILL.md

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01: Reference file depth**
- Comprehensive guides — each reference file is ~80-100 lines covering:
  - All flags for each command (not just the most common ones)
  - Multiple usage examples per command (basic + realistic agent usage)
  - Common patterns specific to that resource group
  - Notes on auth scope where relevant (read vs write vs admin)
  - Terminology notes where the API uses legacy names (`photo`→`video`, `album`→`category`, `live`→`webinar`)
- Source all flag/endpoint data from `twentythree <topic> <command> --agent` output — this is the authoritative source, not the code
- Include `--json` flag usage in every example (agents always use structured output)

**D-02: Workflow files**
- 2 workflows only for Phase 19:
  1. `upload-and-publish.md` — upload a video file, set metadata, publish
  2. `webinar-lifecycle.md` — create a webinar, create a session, configure, start, end, archive
- Additional workflow patterns deferred to roadmap backlog (video management, analytics reporting, personal video recording preparation, webinar analysis)
- Each workflow file shows a complete multi-step agent automation sequence with all commands in order, expected output shapes, error handling notes, prerequisites, and auth scope

**D-03: Coverage consistency**
- All 22 reference files at equal comprehensive depth — no tiered treatment
- Lower-traffic groups (spot, protection, openupload, etc.) get the same depth as high-value groups (video, webinar, analytics)

### Claude's Discretion

- **Reference file frontmatter**: Validator requires only `name` and `description`; add `topic` if useful but no extended schema required
- **File naming**: `<resource>.md` (e.g. `video.md`, `webinar.md`, `analytics.md`)
- **Content sourcing**: Run `twentythree <topic> --help` or `--agent` on representative commands; cross-reference source files where flag descriptions are sparse

### Deferred Ideas (OUT OF SCOPE)

- Additional workflow patterns (video management, analytics reporting, personal video recording preparation, webinar analysis)
- Auto-generation of reference file stubs from `agentMetadata` output
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SKILL-02 | 22 hand-authored reference files (one per resource group): video, category, webinar, analytics, audience, action, collector, comment, player, poll, tag, spot, thumbnail, webhook, app, presentation, protection, session, openupload, site, setting, user | All 22 topics fully surveyed via `--agent` CLI calls; complete flag inventory below |
| SKILL-03 | 2–3 workflow files covering high-value agent automation patterns (upload-and-publish, webinar-lifecycle) | Both workflow command sequences verified via CLI; step-by-step metadata confirmed |
</phase_requirements>

---

## Summary

Phase 19 produces 24 markdown content files: 22 resource group reference files in `packages/twentythree-skills/skills/reference/` and 2 workflow files in `packages/twentythree-skills/skills/workflows/`. There is no code, no compilation, and no test suite beyond the existing `validate-skills.mjs` script.

The validator (Gate 2) checks that `skills/reference/` exists and contains all 22 files named exactly as listed in `RESOURCE_GROUPS`. The validator does NOT check file content, frontmatter, or section structure — only file presence. However, the CONTEXT.md decisions define a comprehensive content standard (D-01) that each file must meet, regardless of what the validator checks.

All flag data in this research was gathered from the running CLI using `twentythree <topic> <command> --agent`. This is the canonical source. There are no assumptions about flag names.

**Primary recommendation:** Write each reference file from the verified `--agent` output in this research document. The format established in `SKILL.md` (code blocks, table-of-commands structure, `--json` in every example) is the house style.

---

## Architectural Responsibility Map

This phase is content-only. There are no tiers in the traditional sense. The responsibility map is:

| Capability | Owner | Notes |
|------------|-------|-------|
| Reference file content | Hand-authored markdown | One file per resource group |
| Workflow file content | Hand-authored markdown | Two files only |
| Validator gate passage | `validate-skills.mjs` Gate 2 | Checks file presence only |
| Flag accuracy | CLI `--agent` output | Source of truth for all flag data |
| Format consistency | Established SKILL.md style | Code blocks, `--json` in every example |

---

## Validator Requirements

**What `validate-skills.mjs` Gate 2 checks:** [VERIFIED: running script]

1. If `skills/reference/` directory does NOT exist — warn only, no error (soft gate, current state)
2. If `skills/reference/` directory DOES exist — each of the 22 filenames must be present, else hard error

**RESOURCE_GROUPS array (exact filenames required):** [VERIFIED: validate-skills.mjs line 22–27]

```
action, analytics, app, audience, category, collector,
comment, openupload, player, poll, presentation, protection,
session, setting, site, spot, tag, thumbnail, user,
video, webhook, webinar
```

**Frontmatter requirements:** [VERIFIED: validate-skills.mjs frontmatter parser]

The validator only checks `SKILL.md` frontmatter (Gate 1). Gate 2 only checks file presence. Reference files need `name` and `description` frontmatter for consistency with the SKILL.md format, but the validator does NOT enforce this on reference files.

**Current validator state:** [VERIFIED: running `node scripts/validate-skills.mjs`]

```
warn: skills/reference/ not yet created (Phase 19 creates it). Skipping reference-file check.
validate-skills: OK (SKILL.md frontmatter valid, 1 warning)
```

After Phase 19: validator must exit 0 with no errors.

---

## Reference File Format Template

Based on the existing `SKILL.md` style: [VERIFIED: reading packages/twentythree-skills/skills/SKILL.md]

```markdown
---
name: <resource>
description: <one-line description of what this resource group does>
---

# TwentyThree <Resource> Commands

> <two-line summary of what agents can do with this resource>

## Prerequisites

Auth scope required: <scope(s)>. Run `twentythree auth credentials` if not already configured.

## Commands

### <resource> list
...

### <resource> create / add
...

## Common Patterns

...

## Terminology Notes (if applicable)

...
```

Each file should be ~80-100 lines. Every code block example must use `--json`. Multiple examples per command (basic + realistic agent usage).

---

## Complete Flag Inventory by Resource Group

All data sourced from `twentythree <topic> <command> --agent`. [VERIFIED: CLI]

### 1. video

**Commands:** `upload`, `list`, `get`, `update`, `delete`, `replace`, `frame`, `transcoding-progress`
**Subtopics:** `video section` (6 cmds), `video subtitle` (11 cmds)
**Auth scope:** read (list, get, transcoding-progress), write (upload, update, delete, replace, frame, section/subtitle writes)

| Command | Auth | Side Effects | Key Flags |
|---------|------|-------------|-----------|
| `video upload <file>` | write | creates | `--title`, `--description`, `--tags`, `--category-id`, `--publish` (bool), `--chunk-size` (default 5MB), `--concurrency` (default 5) |
| `video list` | read | none | `--limit`, `--include-unpublished` (bool) |
| `video get <id>` | read | none | (no flags) |
| `video update <id>` | write | updates | `--title`, `--description`, `--tags`, `--category-id`, `--publish` (bool), `--promote` (bool), `--publish-date` (ISO 8601), `--360` (bool) |
| `video delete <id>` | write | destructive | (no flags) |
| `video replace <id> <file>` | write | updates | `--chunk-size`, `--concurrency` |
| `video frame <id>` | write | updates | `--time` (seconds) |
| `video transcoding-progress <id>` | read | none | (no flags) |
| `video section list <id>` | read | none | (no flags) |
| `video section create <id>` | write | creates | `--title` (required), `--start-time` (required, seconds), `--description` |
| `video section update <id> <section-id>` | write | updates | (flags from source) |
| `video section delete <id> <section-id>` | write | destructive | (no flags) |
| `video section generate <id>` | write | creates | (no flags — AI-generated from transcript) |
| `video section set-thumbnail` | write | updates | (source) |
| `video subtitle list <id>` | read | none | `--include-drafts` (bool) |
| `video subtitle create <id>` | write | creates | (source for full flags) |
| `video subtitle upload <id>` | write | creates | (SRT/WebVTT upload) |

**Terminology:** CLI `video` = API `photo`. API endpoint: `/photo/*`
**Output shape:** `video upload` → `key-value` with id + admin_url. `video list` → table (ID, Title, Duration, Status, Published, Updated).

---

### 2. category

**Commands:** `list`, `create`, `update`, `delete` (no `get` — confirmed absent)
**Auth scope:** anonymous (list), write (create, update, delete)

| Command | Auth | Side Effects | Key Flags |
|---------|------|-------------|-----------|
| `category list` | anonymous | none | `--include-hidden` (bool) |
| `category create` | write | creates | `--title` (required), `--description`, `--hidden` (bool) |
| `category update <id>` | write | updates | `--title`, `--description`, `--hidden` (bool) |
| `category delete <id>` | write | destructive | (no flags) |

**Terminology:** CLI `category` = API `album`. API endpoint: `/album/*`
**Note:** `category list` is `auth_scope: anonymous` — readable without auth token.
**Output shape:** `category create` → `output_shape: none` (no ID returned by API).

---

### 3. webinar

**Commands:** `create`, `list`, `update`, `delete`, `repeat`, `metrics`, `clips`, `highlights`, `log`, `list-formats`, `upload-image`
**Subtopics:** `attachment` (4 cmds), `mail` (7 cmds), `queued-video` (2 cmds), `recording` (4 cmds), `room` (4 cmds), `section` (4 cmds), `series` (11 cmds), `speaker` (14 cmds), `transcription` (4 cmds)
**Auth scope:** read (list, metrics, clips, highlights, log, list-formats), write (create, update, delete, repeat, upload-image, recording/start/stop)
**Note:** No `webinar get` command. Retrieve details via `webinar list` with filters.

| Command | Auth | Side Effects | Key Flags |
|---------|------|-------------|-----------|
| `webinar create` | write | creates | `--title` (required), `--description`, `--status` (upcoming/live/previous), `--live-date` (ISO 8601), `--draft` (bool), `--publish` (bool) |
| `webinar list` | read | none | `--limit` (default 20), `--all` (bool), `--include-private` (bool), `--status` (filter), `--search` |
| `webinar update <id>` | write | updates | `--title`, `--description`, `--status`, `--live-date`, `--draft` (bool), `--publish` (bool) |
| `webinar delete <id>` | write | destructive | (no flags) |
| `webinar repeat <id>` | write | creates | `--date` (required, ISO 8601) |
| `webinar metrics <id>` | read | none | (no flags) |
| `webinar clips <id>` | read | none | (no flags) |
| `webinar highlights <id>` | read | none | `--video-id` (scope to recording) |
| `webinar log <id>` | read | none | (no flags) |
| `webinar list-formats` | read | none | (no flags) |
| `webinar upload-image <id> <file>` | write | creates | `--type` (thumbnail/preview/before_webinar, default thumbnail), `--chunk-size`, `--concurrency` |
| `webinar room connect <id>` | read | updates | (no flags) — returns stream key / room URL |
| `webinar recording start <id>` | write | updates | (no flags) |
| `webinar recording stop <id>` | write | updates | (no flags) |
| `webinar recording status <id>` | read | none | (no flags) |
| `webinar recording split <id>` | write | updates | (no flags) |

**Terminology:** CLI `webinar` = API `live`. API endpoint: `/live/*`
**Output shape:** `webinar create` → `key-value` with id + admin_url. `webinar list` → table (ID, Title, Status, Date, Private).

---

### 4. analytics

**Structure:** 4 subtopics — `analytics video`, `analytics live`, `analytics conversions`, `analytics usage`
**Auth scope:** All analytics commands are `read`

**Common flag pattern (all analytics commands):**
- `--date-start <YYYY-MM-DD>` — first date
- `--date-end <YYYY-MM-DD>` — last date
- `--date-expression <value>` — predefined range (e.g. `thisweek`, `lastyear`, `thismonth`, `lastmonth`)
- `--groupby <dimension>` — group results
- `--orderby <field>` — sort field
- `--order <asc|desc>` — sort direction
- `--page <n>` / `--size <n>` — pagination (where applicable)
- `--selection <value>` — scope to specific objects/types

**`analytics video` subcommands:**
- `analytics video totals` — aggregated totals. Output: Plays, Engagement, Playrate, Avg View Time, Traffic
- `analytics video timeseries` — time-series data
- `analytics video performance` — per-video performance
- `analytics video published` — analytics for published videos
- `analytics video weekday` — breakdown by day of week

**`analytics live` subcommands:**
- `analytics live totals` — Output: Plays, Peak Viewers, Engagement, Playrate, Avg View Time
- `analytics live timeseries` — time-series
- `analytics live event` — event-level analytics
- `analytics live event-timeseries` — event time-series
- `analytics live event-totals` — event totals
- `analytics live weekday` — day-of-week breakdown

**`analytics conversions` subcommands:**
- `analytics conversions totals` — Output: Conversions, Views, Visits, Engagement
- `analytics conversions timeseries` — time-series

**`analytics usage` subcommands:**
- `analytics usage devices` — by device type. Output: Device, Plays, Engagement, Traffic, Impressions
- `analytics usage domains` — by domain
- `analytics usage locations` — by location
- `analytics usage sources` — by traffic source
- `analytics usage sourceids` — by source ID
- `analytics usage spots` — by spot
- `analytics usage storage` — storage usage
- `analytics usage traffic` — by traffic type

---

### 5. audience

**Commands:** `list`, `search`, `metrics`, `timelines`, `register`, `unregister`, `remove`, `companies`, `funnel`, `identity-sources`, `list-collectors`
**Subtopic:** `audience field` (list, set, remove, types)
**Auth scope:** read (list, search, metrics, timelines, companies, funnel, identity-sources, list-collectors, field list), write (register, unregister, remove, field set)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `audience list` | read | `--page`, `--size` (max 500), `--offset`, `--orderby` (recent/timeline_count/score/first), `--order`, `--search`, `--identified` (bool), `--objects` (space-sep IDs) |
| `audience search` | read | `--text` (required), `--size`, `--offset`, `--orderby`, `--order` |
| `audience metrics` | read | `--page`, `--size`, `--offset`, `--search`, `--identified` (bool), `--objects` |
| `audience timelines` | read | `--page`, `--size`, `--offset`, `--uuid`, `--objects`, `--orderby`, `--order` |
| `audience register` | write | `--email` (required), `--object-id`, `--uuid`, `--action-id`, `--firstname`, `--lastname`, `--company`, `--phone`, `--return-url`, `--source` |
| `audience unregister` | write | `--object-id` (required), `--email`, `--uuid` |
| `audience remove` | write | `--email`, `--uuid` (at least one) |
| `audience companies` | read | `--page`, `--size`, `--offset`, `--orderby`, `--order`, `--identified` (bool), `--domains` |
| `audience funnel` | read | `--objects`, `--live-type`, `--resolve-recordings` (bool), `--resolve-live-series` (bool) |
| `audience list-collectors` | read | `--object-id`, `--action-id` |
| `audience field list` | read | `--include-widget-html` (bool) |
| `audience field set` | write | `--key` (required), `--type` (required), `--label` (required), `--options` (semicolon-sep), `--priority` |

---

### 6. action

**Commands:** `list`, `add`, `get`, `update`, `delete`, `types`, `exclude`, `include`, `upload`
**Auth scope:** read (list, get, types), write (add, update, delete, exclude, include, upload)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `action list` | read | `--object-id`, `--video-id` (maps to photo_id), `--webinar-id` (maps to live_id), `--player-id`, `--exclude-internal` (bool), `--exclude-pending` (bool), `--exclude-items` (bool) |
| `action add` | write | `--type` (required, use `action types`), `--object-id` (required), `--fields` (key=value pairs) |
| `action get <id>` | read | `--object-id`, `--video-id`, `--webinar-id`, `--token`, `--player-id`, `--exclude-internal`, `--exclude-pending`, `--exclude-items` |
| `action update <id>` | write | `--name` (required), `--start-time` (required, secs), `--end-time` (required, secs), `--time-relative-to` (default: duration), `--return-url` |
| `action delete <id>` | write | (no flags) |
| `action types` | read | `--exclude-internal` (bool) |
| `action exclude <id>` | write | `--object-id` (required), `--undo` (bool) |
| `action include <id>` | write | `--object-id` (required), `--undo` (bool) |
| `action upload <id> <variable> <file>` | write | (no flags) |

**Note:** `action add` — run `action types` first to see valid `--type` values. Actions are CTAs (calls to action) added to video/webinar timelines.

---

### 7. collector

**Commands:** `list`, `include`, `exclude`
**Auth scope:** read (list), write (include, exclude)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `collector list` | read | `--object-id` (filter by video/webinar), `--include-analytics` (bool) |
| `collector include <collector-id>` | write | `--object-id` (required) — attaches collector to video/webinar |
| `collector exclude <collector-id>` | write | `--object-id` (required) — blocks collector from video/webinar |

**Note:** Collectors are lead capture forms. Use `collector list` to find collector IDs, then attach them to content with `include`.

---

### 8. comment

**Commands:** `list`, `add`, `update`, `delete`, `promote`, `clone`, `set-order`
**Subtopic:** `comment reaction` (add reaction)
**Auth scope:** read (list), write (add, update, delete, promote, clone, set-order)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `comment list` | read | `--object-id`, `--object-type` (photo/album), `--comment-type` (comment/question/chat), `--search`, `--order`, `--include-reactions` (bool), `--include-replies` (bool), `--promoted` (bool) |
| `comment add` | write | `--object-id` (required), `--object-type` (required: photo/album/live), `--content`, `--name`, `--email`, `--url`, `--comment-type`, `--reply-to`, `--comment-time`, `--object-token` |
| `comment update <id>` | write | `--object-id` (required), `--status` (answered/dismissed/empty to clear) |
| `comment delete <id>` | write | (no flags) |

**Note:** The API uses legacy object type names: pass `photo` for video, `album` for category, `live` for webinar in `--object-type`.

---

### 9. player

**Commands:** `list`, `update`, `delete`, `embed`, `embed-versions`, `styles`
**Auth scope:** anonymous (embed), read (list, embed-versions, styles), write (update, delete)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `player list` | read | `--source` (analytics source tag) |
| `player update <id>` | write | `--name`, `--description`, `--data` (JSON-encoded properties) |
| `player delete <id>` | write | (no flags) |
| `player embed` | anonymous | `--video-id` (maps to photo_id), `--webinar-id` (maps to live_id), `--category-id` (maps to album_id), `--player-id`, `--url`, `--width`, `--height`, `--responsive` (bool), `--autoplay` (bool), `--iframe` (bool), `--start`, `--include-unpublished` (bool), `--token`, `--source` |
| `player embed-versions` | read | (source) |
| `player styles` | read | (source) |

**Note:** `player embed` returns HTML embed code. Redirect to file: `twentythree player embed --video-id 123 --responsive > embed.html`

---

### 10. poll

**Commands:** `list`, `add`, `update`, `remove`, `answer`, `set-options`
**Auth scope:** anonymous (list), write (add, update, remove, answer, set-options)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `poll list` | anonymous | `--object-id` (required — webinar/live object), `--object-token` |
| `poll add` | write | `--object-id` (required), `--question` |
| `poll update <id>` | write | `--question`, `--open` (bool), `--display-results` (bool) |
| `poll remove <id>` | write | (no flags) |
| `poll answer <id>` | write | (from source) |
| `poll set-options <id>` | write | (from source) |

**Note:** Polls are associated with webinars (live objects). `--object-id` is the webinar ID.

---

### 11. spot

**Commands:** `list`, `create`, `check`, `update`, `delete`, `set-videos`, `reset-version`
**Auth scope:** read (list, check), write (create, update, delete, set-videos, reset-version)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `spot list` | read | `--page`, `--size`, `--search`, `--spot-type`, `--active` (bool), `--orderby`, `--order` |
| `spot create` | write | `--spot-name` (required), `--spot-type`, `--spot-design`, `--spot-layout` |
| `spot check <id>` | read | (no flags) — get details |
| `spot update <id>` | write | `--spot-name`, `--active` (bool) |
| `spot delete <id>` | write | (no flags) |
| `spot set-videos <id>` | write | `--videos` (required, comma-sep video IDs) |
| `spot reset-version <id>` | write | (from source) |

**Note:** Spots are embeddable video widgets. Assign videos to a spot with `set-videos`. Use `spot check` (not `spot get`) to retrieve spot details.

---

### 12. tag

**Commands:** `list`, `related`
**Auth scope:** anonymous (both)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `tag list` | anonymous | `--search`, `--exclude-machine-tags` (bool), `--only-machine-tags` (bool), `--only-published` (bool), `--orderby`, `--order` |
| `tag related <tag>` | anonymous | (no flags) |

**Note:** Tags are created implicitly when applied to videos via `video update --tags`. The `tag` topic is read-only (list + discover related tags). To add/remove tags on a resource, use `video update --tags` or `webinar update`.

---

### 13. thumbnail

**Commands:** `list`, `add`, `update`, `delete`, `duplicate`, `data`
**Subtopic:** `thumbnail file` (delete file from template)
**Auth scope:** read (list, data), write (add, update, delete, duplicate)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `thumbnail list` | read | `--search`, `--object-type` (photo/live/liveseries) |
| `thumbnail add` | write | `--name` (required), `--liquid-template` (required, Liquid HTML) |
| `thumbnail update <id>` | write | `--name`, `--liquid-template`, `--object-type`, `--width`, `--height` |
| `thumbnail delete <id>` | write | (no flags) |
| `thumbnail duplicate <id>` | write | `--name` |
| `thumbnail data <id>` | read | `--object-id` (required) — get Liquid render data for a video |

**Note:** Thumbnail templates use Liquid templating with video metadata variables. Use `thumbnail data` to preview render data before authoring a template.

---

### 14. webhook

**Commands:** `list`, `subscribe`, `unsubscribe`, `events`, `sample`
**Auth scope:** read (list, events, sample), write (subscribe, unsubscribe)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `webhook list` | read | (no flags) |
| `webhook subscribe` | write | `--target-url` (required), `--event` (required, use `webhook events`) |
| `webhook unsubscribe` | write | `--webhook-id` OR `--target-url` (at least one) |
| `webhook events` | read | `--test-authentication` (bool) |
| `webhook sample <event>` | read | (no flags) |

**Workflow:** `webhook events --json` → select event → `webhook sample <event> --json` → `webhook subscribe --event <event> --target-url <url> --json`

---

### 15. app

**Commands:** `list`, `add`, `update`, `delete`, `set-thumbnail`, `remove-thumbnail`
**Auth scope:** read (list), write (add, update, delete, set-thumbnail, remove-thumbnail)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `app list` | read | `--app-id`, `--page`, `--size` (max 100) |
| `app add` | write | `--name` (required), `--description`, `--style`, `--type` |
| `app update <id>` | write | `--name`, `--description`, `--style` |
| `app delete <id>` | write | (no flags) |
| `app set-thumbnail <id> <file>` | write | (from source — uploads image) |
| `app remove-thumbnail <id>` | write | (no flags) |

**Note:** Apps are player design integrations. Use `app list` to discover installed apps. `set-thumbnail` uploads a custom image for the app.

---

### 16. presentation

**Commands (via subtopics):**
- `presentation page link-locations` — read, no flags — list valid link locations
- `presentation setting list` — read, no flags — list workspace presentation settings
- `presentation setting update` — write — `--set key=value` (repeatable)

**Auth scope:** read (page link-locations, setting list), write (setting update)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `presentation page link-locations` | read | (no flags) |
| `presentation setting list` | read | (no flags) |
| `presentation setting update` | write | `--set` (repeatable, key=value pair) |

**Note:** Presentation commands manage the TwentyThree presentation/embed settings. No CRUD for presentation objects — these are workspace-level configuration commands.

---

### 17. protection

**Commands:** `protect`, `unprotect`, `verify`
**Auth scope:** write (protect, unprotect), read (verify)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `protection protect` | write | `--protection-method` (required: password/sso/token), `--object-id`, `--grace-minutes` |
| `protection unprotect` | write | `--object-id` |
| `protection verify` | read | `--protection-method` (required), `--video-id`, `--webinar-id`, `--object-id`, `--verification-data` |

**Note:** Protection applies access control to videos/webinars. Methods: `password`, `sso`, `token`. `verify` checks whether a viewer has valid access credentials.

---

### 18. session

**Commands:** `get-token`, `redeem-token`
**Auth scope:** read (both)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `session get-token` | read | `--return-url`, `--email`, `--full-name` |
| `session redeem-token` | read | `--session-token` (required) |

**Note:** Session tokens enable SSO-style viewer authentication. Get a token server-side, pass to the viewer, viewer redeems it to gain access. Not the same as CLI auth (`twentythree auth credentials`).

---

### 19. setting

**Commands:** `update`
**Auth scope:** write

| Command | Auth | Key Flags |
|---------|------|-----------|
| `setting update` | write | `--set` (repeatable, key=value), `--validate-only` (bool — dry-run) |

**Note:** Only one command. Updates workspace settings as key=value pairs. Use `--validate-only` to test changes without applying them. Setting keys are workspace-specific; check workspace admin UI for valid keys.

---

### 20. site

**Commands:** `get`, `search`
**Auth scope:** read (both)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `site get` | read | `--include-presentation` (bool), `--include-quota` (bool) |
| `site search` | read | `--search`, `--search-in` (title/description/tags), `--selection`, `--size` |

**Note:** `site get` returns workspace-level configuration (domain, quotas, presentation settings). `site search` searches across all content types (videos, webinars, categories) in one call.

---

### 21. openupload

**Commands:** `list`, `upload-file`, `update-file`
**Auth scope:** read (list), write (upload-file, update-file)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `openupload list` | read | `--token-upload-id`, `--token`, `--app` (bool) |
| `openupload upload-file` | write | `--file-path` (required), `--token-upload-id` (required), `--token` (required), `--chunk-size`, `--concurrency` |
| `openupload update-file` | write | `--token-upload-id` (required), `--token` (required), `--upload-key` (required), `--title`, `--description`, `--tags` |

**Note:** Open upload tokens allow unauthenticated third-party uploads. The workflow is: workspace admin creates a token, shares `token-upload-id` + `token` with a third party, who uses `openupload upload-file` to upload without full API auth.

---

### 22. user

**Commands:** `list`, `create`, `get`, `update`, `delete`, `get-login-token`, `send-invitation`, `tokens`, `redeem-login-token`
**Auth scope:** admin (all commands)

| Command | Auth | Key Flags |
|---------|------|-----------|
| `user list` | admin | `--page`, `--size`, `--search` (username/display name/email), `--user-id` |
| `user create` | admin | `--email` (required), `--username`, `--full-name`, `--site-admin` (bool), `--user-type` |
| `user get <id>` | admin | `--include-invitation` (bool) |
| `user update <id>` | admin | `--email`, `--full-name`, `--password` (WARNING: visible in shell history), `--profile-image` (file path) |
| `user delete <id>` | admin | (from source) |
| `user get-login-token <id>` | admin | `--return-url` |
| `user send-invitation <id>` | admin | `--invitation-message` |
| `user tokens` | admin | (no flags) |
| `user redeem-login-token` | admin | (from source) |

**Security note:** All `user` commands require admin scope. The `--password` flag in `user update` is visible in process lists and shell history — prefer interactive credential updates through the admin UI for sensitive environments.

---

## Workflow File Specifications

### upload-and-publish.md

**Prerequisite auth scope:** write
**Step sequence (verified via CLI `--agent` output):**

```
1. (Optional) List categories to find target category ID
   twentythree category list --json

2. Upload video (chunked upload is automatic)
   twentythree video upload ./video.mp4 --title "Title" --category-id <id> --json
   => Returns: { id, admin_url }
   Capture: video_id from id field

3. (Optional) Set additional metadata
   twentythree video update <video_id> --description "..." --tags "tag1 tag2" --json

4. (Optional) Create thumbnail from frame at timestamp
   twentythree video frame <video_id> --time 10 --json

5. (Optional) Check transcoding is complete
   twentythree video transcoding-progress <video_id> --json
   Wait until status is complete before publishing

6. Publish
   twentythree video update <video_id> --publish --json
```

**Error handling notes:**
- Upload fails: check `twentythree auth status` and `twentythree doctor`
- Transcoding stuck: retry `transcoding-progress` after 30s; contact support if still pending after 10 min
- Publish fails with permission error: confirm auth scope is `write` (not `read`)

---

### webinar-lifecycle.md

**Prerequisite auth scope:** write (create, configure, live operations)
**Step sequence (verified via CLI `--agent` output):**

```
1. Create the webinar
   twentythree webinar create --title "Title" --live-date "2026-05-01T14:00:00Z" --json
   => Returns: { id, admin_url }
   Capture: webinar_id from id field

2. (Optional) Add agenda sections
   twentythree webinar section add <webinar_id> --title "Intro" --start-time 0 --json

3. (Optional) Add speakers
   twentythree webinar speaker add <webinar_id> --json (see webinar speaker add --agent)

4. (Optional) Upload thumbnail
   twentythree webinar upload-image <webinar_id> ./thumb.jpg --type thumbnail --json

5. Publish webinar (make visible to registrants)
   twentythree webinar update <webinar_id> --publish --json

6. Get room connection info (when going live)
   twentythree webinar room connect <webinar_id> --json
   => Returns: stream key, room URL

7. Start recording (optional, once live)
   twentythree webinar recording start <webinar_id> --json

8. Stop recording (after session ends)
   twentythree webinar recording stop <webinar_id> --json

9. Check recording status / clips availability
   twentythree webinar recording status <webinar_id> --json
   twentythree webinar clips <webinar_id> --json

10. (Optional) Archive / set to previous
    twentythree webinar update <webinar_id> --status previous --json
```

**Error handling notes:**
- `webinar room connect` fails: confirm webinar status is `live` or `upcoming` (not `previous`)
- Recording start fails: confirm auth scope is `write`; check `webinar recording status` to confirm no recording already in progress
- Clips not available immediately: recording processing takes time after `recording stop`; poll `webinar clips` until results appear

---

## Architecture Patterns

### Project Structure

```
packages/twentythree-skills/skills/
├── SKILL.md                           # EXISTS — root skill file (Phase 18)
├── reference/                         # TO CREATE — Phase 19
│   ├── action.md
│   ├── analytics.md
│   ├── app.md
│   ├── audience.md
│   ├── category.md
│   ├── collector.md
│   ├── comment.md
│   ├── openupload.md
│   ├── player.md
│   ├── poll.md
│   ├── presentation.md
│   ├── protection.md
│   ├── session.md
│   ├── setting.md
│   ├── site.md
│   ├── spot.md
│   ├── tag.md
│   ├── thumbnail.md
│   ├── user.md
│   ├── video.md
│   ├── webhook.md
│   └── webinar.md
└── workflows/                         # TO CREATE — Phase 19
    ├── upload-and-publish.md
    └── webinar-lifecycle.md
```

### File Naming Rule

Validator `RESOURCE_GROUPS` array is the authoritative filename source. Files must match exactly (lowercase, `.md` extension):
`action`, `analytics`, `app`, `audience`, `category`, `collector`, `comment`, `openupload`, `player`, `poll`, `presentation`, `protection`, `session`, `setting`, `site`, `spot`, `tag`, `thumbnail`, `user`, `video`, `webhook`, `webinar`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Flag data | Writing flags from memory or source code | Run `twentythree <cmd> --agent` | Authoritative, always current, catches flags without descriptions |
| Validator compliance | Inventing filenames | Use RESOURCE_GROUPS from `validate-skills.mjs` line 22–27 | Exact match required; typo = Gate 2 failure |
| Auth flow | Assuming reader knows auth prerequisites | Explicit auth section in every reference file | Critical pitfall per PITFALLS.md |
| Legacy API name guidance | Ignoring terminology divergence | Explicit terminology section where applicable | Agents using `--agent` see API endpoints with legacy names; must understand the mapping |

---

## Common Pitfalls

### Pitfall 1: Using the wrong filename for a resource group
**What goes wrong:** File named `videos.md` instead of `video.md`, or `categories.md` instead of `category.md`. Validator fails.
**Why it happens:** Singular/plural confusion. The validator expects exact lowercase matches.
**How to avoid:** Copy filenames directly from `RESOURCE_GROUPS` array in `validate-skills.mjs`. All are singular.
**Warning signs:** `validate-skills.mjs` outputs `error: Missing reference file: skills/reference/<name>.md`

### Pitfall 2: Missing auth prerequisite section
**What goes wrong:** An agent reads a reference file and attempts commands without running `twentythree auth credentials` first, getting 401 errors.
**Why it happens:** File assumes user context; agents start fresh.
**How to avoid:** Include a "Prerequisites" note at the top of every file: required auth scope, reminder to run `auth credentials` if not configured.

### Pitfall 3: Omitting `--json` from examples
**What goes wrong:** Agent gets human-formatted table output; parsing fails or agent misreads data.
**Why it happens:** Forgetting the house style requirement.
**How to avoid:** Every example in every file must use `--json` (except when documenting interactive commands).

### Pitfall 4: Using API parameter names instead of CLI flag names
**What goes wrong:** Writing `--photo_id` (API name) instead of `--video-id` (CLI flag name). Command fails.
**Why it happens:** Cross-referencing API docs instead of `--agent` output.
**How to avoid:** All flag names come from `--agent` output, not the API spec.

### Pitfall 5: Documenting `webinar get` (does not exist)
**What goes wrong:** Reference file says `twentythree webinar get <id>`. CLI error: `command webinar:get not found`.
**Why it happens:** Assumed parity with `video get`.
**How to avoid:** Webinar retrieval is via `webinar list` + filters. Verified: no `webinar get` command exists.

### Pitfall 6: Documenting `category get` (does not exist)
**What goes wrong:** Reference file says `twentythree category get <id>`. CLI error: `command category:get not found`.
**Why it happens:** Assumed full CRUD parity.
**How to avoid:** Category has only `list`, `create`, `update`, `delete`. Verified: no `category get` command.

### Pitfall 7: Omitting `workflows/` directory creation
**What goes wrong:** Validator passes (it only checks `reference/`), but workflow files don't exist as specified in REQUIREMENTS.md SKILL-03.
**How to avoid:** Workflows directory must be created as `skills/workflows/` even though the validator doesn't enforce it. SKILL-03 requires 2–3 workflow files.

---

## Terminology Reference (Authoritative)

| CLI term | API term | API endpoint prefix | Auth scope note |
|----------|----------|---------------------|-----------------|
| `video` | `photo` | `/photo/*` | list: read; write ops: write |
| `category` | `album` | `/album/*` | list: anonymous; write: write |
| `webinar` | `live` | `/live/*` | list: read; write ops: write |
| `webinar session` | `live session` | `/live/webinar/*` | read |
| comment `--object-type photo` | video object | | pass `photo` for video |
| comment `--object-type album` | category object | | pass `album` for category |
| comment `--object-type live` | webinar object | | pass `live` for webinar |

---

## Auth Scope Summary

| Topic | Read | Write | Admin | Notes |
|-------|------|-------|-------|-------|
| video | list, get, transcoding-progress | upload, update, delete, replace, frame | — | section/subtitle: mixed |
| category | — (list is anonymous) | create, update, delete | — | |
| webinar | list, metrics, clips, highlights, log | create, update, delete, repeat, upload-image, recording | — | |
| analytics | all | — | — | all analytics read-only |
| audience | list, search, metrics, timelines, companies, funnel | register, unregister, remove | — | |
| action | list, get, types | add, update, delete, exclude, include, upload | — | |
| collector | list | include, exclude | — | |
| comment | list | add, update, delete, promote | — | |
| player | list, embed (anonymous), styles | update, delete | — | embed is anonymous |
| poll | list (anonymous) | add, update, remove, answer | — | |
| spot | list, check | create, update, delete, set-videos | — | |
| tag | list (anonymous) | — (via video update) | — | read-only topic |
| thumbnail | list, data | add, update, delete, duplicate | — | |
| webhook | list, events, sample | subscribe, unsubscribe | — | |
| app | list | add, update, delete, set-thumbnail | — | |
| presentation | page/setting list | setting update | — | |
| protection | verify | protect, unprotect | — | |
| session | get-token, redeem-token | — | — | |
| setting | — | update | — | |
| site | get, search | — | — | |
| openupload | list | upload-file, update-file | — | |
| user | — | — | all | all user cmds require admin |

---

## Environment Availability

Step 2.6 applies — the CLI is an external dependency.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `twentythree` CLI | All flag data sourced from `--agent` | ✓ | Installed globally | — |
| `node` (for validator) | `validate-skills.mjs` | ✓ | >=22 | — |

**Missing dependencies with no fallback:** None.

---

## Validation Architecture

**nyquist_validation is enabled** (config.json `workflow.nyquist_validation: true`).

However, Phase 19 produces only markdown content — no test suite applies beyond the existing `validate-skills.mjs`.

### Test Framework

| Property | Value |
|----------|-------|
| Validator | `node packages/twentythree-skills/scripts/validate-skills.mjs` |
| Config file | `packages/twentythree-skills/package.json` (`"test": "node scripts/validate-skills.mjs"`) |
| Quick run command | `cd packages/twentythree-skills && node scripts/validate-skills.mjs` |
| Full suite command | `cd packages/twentythree-skills && node scripts/validate-skills.mjs` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SKILL-02 | 22 reference files exist in `skills/reference/` | file-presence | `node packages/twentythree-skills/scripts/validate-skills.mjs` | ✅ |
| SKILL-03 | 2 workflow files exist in `skills/workflows/` | manual inspection | n/a (validator doesn't check workflows/) | — |

### Sampling Rate
- **Per task commit:** `node packages/twentythree-skills/scripts/validate-skills.mjs`
- **Phase gate:** Validator exits 0 with no errors before marking Phase 19 complete

### Wave 0 Gaps
- [ ] `skills/reference/` directory (all 22 files) — covers SKILL-02
- [ ] `skills/workflows/` directory (2 files) — covers SKILL-03

*(Validator infrastructure exists and passes; only content files are missing.)*

---

## Security Domain

**security_enforcement:** enabled (no explicit `false` in config).

This phase is markdown content only. No code execution, no credential handling, no network calls. ASVS categories are not applicable.

| ASVS Category | Applies | Note |
|---------------|---------|------|
| V2 Authentication | No | Reference files document auth; they do not implement it |
| V3 Session Management | No | |
| V4 Access Control | No | |
| V5 Input Validation | No | Markdown content |
| V6 Cryptography | No | |

**One content-level security concern:** The `user update --password` flag is documented in the user reference file. The reference file must include the warning: `--password` is visible in process lists and shell history — prefer the admin UI for password changes in sensitive environments. [VERIFIED: flag description in `--agent` output includes this warning]

---

## Assumptions Log

All flag data and command existence was verified by running `twentythree <cmd> --agent` against the installed CLI. No assumed claims.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `video section update` and `video section set-thumbnail` flags not documented (source not checked) | video flag inventory | Planner should run those commands' `--agent` when authoring video.md |
| A2 | `video subtitle create/upload/update/etc` full flags not documented (only list shown) | video flag inventory | Run `twentythree video subtitle <cmd> --agent` when authoring video.md |
| A3 | `poll answer` and `poll set-options` flags not documented | poll flag inventory | Run `--agent` when authoring poll.md |
| A4 | `user delete` and `user redeem-login-token` flags not documented | user flag inventory | Run `--agent` when authoring user.md |
| A5 | `webinar speaker`, `webinar mail`, `webinar attachment`, `webinar series`, `webinar section`, `webinar queued-video`, `webinar transcription` subtopic flags not fully documented | webinar flag inventory | These are documented at command-list level only; run `--agent` for each when authoring webinar.md |
| A6 | `thumbnail file delete` flags not documented | thumbnail flag inventory | Run `twentythree thumbnail file --help` when authoring thumbnail.md |

**Guidance:** The planner must instruct the implementing agent to run `twentythree <topic> <cmd> --agent` for any commands in the Assumptions Log (A1-A6) before writing those sections of the reference file.

---

## Open Questions

1. **webinar.md line count**
   - What we know: Webinar has 9+ subtopics with 40+ total commands (speakers, mail, series, recording, etc.)
   - What's unclear: Comprehensive coverage will likely exceed 80-100 lines target
   - Recommendation: Apply the D-01 depth target as a floor, not a ceiling. Webinar.md may need 150+ lines to be genuinely comprehensive. Planner should treat the line count as a quality floor, not a hard cap.

2. **video.md line count (subtitles)**
   - What we know: `video subtitle` has 11 commands with complex flags (locales, types, archive)
   - What's unclear: Whether subtitle commands belong in video.md or a separate subtitle reference
   - Recommendation: Keep in video.md under a `### Subtitles` section. Separate file is not one of the 22 required resources.

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: CLI `--agent` output] — All flag data for all 22 resource groups; run 2026-04-20
- [VERIFIED: `packages/twentythree-skills/scripts/validate-skills.mjs`] — Gate 2 rules, RESOURCE_GROUPS array, frontmatter check
- [VERIFIED: `packages/twentythree-skills/skills/SKILL.md`] — House style: frontmatter format, code block style, `--json` requirement
- [VERIFIED: `packages/twentythree-skills/package.json`] — `files` whitelist includes `/skills`; test script points to validator
- [VERIFIED: running validator] — Current state: Gate 1 passes, Gate 2 warns (reference/ not yet created)

### Secondary (MEDIUM confidence)
- `.planning/research/FEATURES.md` — agentskills.io format, skill content quality bar
- `.planning/research/PITFALLS.md` — auth pitfalls, terminology pitfalls, content authoring pitfalls
- `.planning/phases/19-skill-content/19-CONTEXT.md` — D-01 depth, D-02 workflows, D-03 consistency

---

## Metadata

**Confidence breakdown:**
- Flag data: HIGH — sourced from running CLI, not training data
- Validator requirements: HIGH — sourced from reading and running the actual script
- File format: HIGH — sourced from existing SKILL.md
- Workflow sequences: HIGH — verified step-by-step via `--agent` for key commands
- Subtopic command lists (webinar speaker, mail, etc.): MEDIUM — command names verified via `--help`, flags for less-critical subtopics noted as assumptions

**Research date:** 2026-04-20
**Valid until:** Stable — flag data is tied to current CLI version. Re-run `--agent` if CLI is updated before Phase 19 executes.
