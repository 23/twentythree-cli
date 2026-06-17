---
name: webinar
description: Create and manage live webinars (linked to API /live/*) — configure sessions, speakers, agenda, attachments, recordings, transcriptions, mail, and series.
---

# TwentyThree Webinar Commands

> Webinars are live broadcast events. Every example uses `--json` for machine-readable output.
> CLI `webinar` maps to API `live` — see Terminology Notes at the bottom of this file.

> **There is no `webinar get` command.** To retrieve details for a specific webinar,
> use `twentythree webinar list --search "<title>" --json` or filter by status/ID client-side.
> The API does not expose a single-record GET; list + filter is the canonical pattern.

## Prerequisites

Auth scope varies: **read** (list, metrics, clips, highlights, log, list-formats, recording status, most subtopic list commands), **write** (create, update, delete, repeat, upload-image, recording start/stop/split, speaker/series/mail/section/attachment/queued-video/transcription writes).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree webinar <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### webinar create

**Auth scope:** write  **Side effects:** creates  **Output:** key-value (id + admin_url)

> **Note:** By default a webinar is created as a **draft** with **registration enabled** (`registration-mode=all`). Pass `--no-draft`/`--publish` to publish, and `--registration-mode none` to disable registration. The `--json` response includes `data.admin_url`; read it from the response rather than constructing URLs. See [guide.md](../guide.md) for Webinar Creation Defaults and Admin Link Construction rules.

After create, the CLI prints the new webinar ID and its admin URL. Capture `data.id` and `data.admin_url` from the `--json` response.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--title` | yes | — | Title for the new webinar |
| `--description` | no | — | Description for the webinar |
| `--status` | no | — | Webinar status: `upcoming`, `live`, or `previous` |
| `--live-date` | no | — | Schedule date/time (ISO 8601) |
| `--timezone` | no | — | Timezone for the schedule (e.g. `Europe/Copenhagen`) |
| `--format` | no | — | Webinar format: `webinar` (registration, hub) or `event` (freeform stream) |
| `--registration-mode` | no | `all` | Registration mode: `all` (enabled) or `none`. Defaults to `all`. |
| `--private` / `--no-private` | no | — | Make private, or `--no-private` to make public (appears on the hub) |
| `--category-id` | no | — | Assign to a category by ID (API `album_id`) |
| `--locale` | no | — | Language/locale (e.g. `en_US`, `da_DK`) |
| `--series-id` | no | — | Attach the webinar to a webinar series by ID |
| `--publish-recordings` / `--no-publish-recordings` | no | — | Publish the webinar recordings |
| `--draft` / `--no-draft` | no | `true` | Draft by default; `--no-draft` (or `--publish`) makes it live |
| `--publish` / `--no-publish` | no | — | Publish the webinar (implies not a draft) |
| `--webinar-design-id` | no | — | Assign a webinar design by ID |

```bash
# Create a basic webinar (draft, registration enabled by default)
twentythree webinar create --title "Q2 Town Hall" --json
#    => { "data": { "id": "<webinar-id>", "admin_url": "..." } }

# Create a fully configured public webinar in Danish, in a category and series
twentythree webinar create --title "Product Launch" --live-date "2026-05-15T16:00:00Z" --timezone Europe/Copenhagen \
  --format webinar --locale da_DK --category-id 127972488 --series-id 67890 --no-private --no-draft --json
```

---

### webinar list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Title, Status, Date, Private)

> **Note:** To retrieve a specific webinar, use `--search "<title>"` and filter client-side — there is no `webinar get` command. See [guide.md](../guide.md).

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--limit` | no | 20 | Maximum number of webinars to return |
| `--all` | no | false | Fetch all webinars across all pages (overrides --limit) |
| `--search` | no | — | Search webinars by keyword |
| `--status` | no | — | Filter by status: `upcoming`, `live`, or `previous` |
| `--include-private` | no | false | Include private webinars in results |
| `--live-id` | no | — | Limit to a single webinar by ID |
| `--album-id` | no | — | Filter to webinars in a specific category |
| `--user-id` | no | — | Filter by creator (`me` for authenticated user) |
| `--live-format` | no | — | Filter by format: `event` or `webinar` |
| `--live-series-id` | no | — | Filter to webinars in a specific series |
| `--ordering` | no | `creation_date` | Sort field — see **Sorting webinars** below |
| `--order` | no | per-field | Sort direction: `asc` or `desc`. If omitted, each field uses its own sensible default (see below) |
| `--promoted` / `--no-promoted` | no | — | Filter by promoted status |
| `--draft` / `--no-draft` | no | — | Filter by draft status |
| `--cancelled` / `--no-cancelled` | no | — | Filter by cancelled status |
| `--streaming` | no | — | Filter to currently streaming webinars only |
| `--template` | no | — | Filter to webinar templates only |
| `--include-stats` | no | — | Include performance statistics for each webinar |
| `--include-speakers` | no | — | Include speaker information for each webinar |
| `--include-albums` | no | — | Include category information for each webinar |
| `--fields` | no | — | Comma-separated list of fields to return |

```bash
# List upcoming webinars
twentythree webinar list --status upcoming --json

# List all webinars sorted by date ascending
twentythree webinar list --all --ordering live_date --order asc --json

# Search for a webinar by title and include private
twentythree webinar list --search "Q2 Town Hall" --include-private --json

# List webinars in a series with speakers included
twentythree webinar list --live-series-id 42 --include-speakers --json

# List webinars by the authenticated user
twentythree webinar list --user-id me --live-format webinar --json
```

#### Sorting webinars

Unlike `video list` (which always defaults to `desc`), each webinar `--ordering` field has its **own default direction** when `--order` is omitted. Pass `--order` only to override it.

| `--ordering` | Sorts by | Default `--order` | Use for |
|--------------|----------|-------------------|---------|
| `creation_date` (default) | when the webinar was created | `desc` | Most recently created first |
| `live_date` | scheduled date — `live_date`, falling back to `creation_date` | `desc` | Chronological by event date (the usual "by date") |
| `name` | title | `asc` | Alphabetical A→Z |
| `live_label` | label | `asc` | — |
| `live_status` | status (`upcoming`/`live`/`previous`) | `asc` | Grouping by lifecycle state |
| `private` | private flag | `desc` | Private webinars first |
| `promoted` | promoted flag | `desc` | Promoted/featured first |
| `streaming` | currently streaming first, then recency | `desc` | Live-now dashboards |
| `broadcasting` | currently broadcasting first, then recency | `desc` | Live-now dashboards |

> **Notes:**
> - For the common "list webinars by date" intent, use `--ordering live_date`. Because it coalesces to `creation_date`, webinars with no scheduled date still sort sensibly.
> - With `--ordering live_date` the default is newest/furthest-future first (`desc`); pass `--order asc` for chronological (earliest first).
> - When `--include-stats` is set, metric fields (e.g. a metric name) can also be used as `--ordering`, sorted `desc`.

```bash
# Webinars by scheduled date, earliest first
twentythree webinar list --all --ordering live_date --order asc --json

# Most recently created webinars (default ordering)
twentythree webinar list --json

# Alphabetical (name defaults to asc, so --order is optional)
twentythree webinar list --ordering name --json
```

---

### webinar update

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--title` | no | — | New title for the webinar |
| `--description` | no | — | New description for the webinar |
| `--status` | no | — | Webinar status: `upcoming`, `live`, or `previous` |
| `--live-date` | no | — | Schedule date/time (ISO 8601) |
| `--timezone` | no | — | Timezone for the schedule (e.g. `Europe/Copenhagen`) |
| `--format` | no | — | Webinar format: `webinar` or `event` |
| `--registration-mode` | no | — | Registration mode: `all` (enabled) or `none` |
| `--private` / `--no-private` | no | — | Make private, or `--no-private` to make public |
| `--category-id` | no | — | Assign to a category by ID (API `album_id`) |
| `--locale` | no | — | Language/locale (e.g. `en_US`, `da_DK`) |
| `--series-id` | no | — | Attach the webinar to a webinar series by ID |
| `--ondemand` / `--no-ondemand` | no | — | Make the recording available on demand |
| `--publish-recordings` / `--no-publish-recordings` | no | — | Publish the webinar recordings |
| `--seo-policy` | no | — | SEO policy: `index`, `noindex`, or empty to reset |
| `--draft` / `--no-draft` | no | — | Set as draft |
| `--publish` / `--no-publish` | no | — | Publish or unpublish the webinar |
| `--webinar-design-id` | no | — | Assign a webinar design by ID |

```bash
# Update title and description
twentythree webinar update <id> --title "New Title" --description "Updated description" --json

# Publish a draft webinar
twentythree webinar update <id> --publish --json

# Make public, set Danish locale, and enable on-demand recording
twentythree webinar update <id> --no-private --locale da_DK --ondemand --json
```

---

### webinar delete

**Auth scope:** write  **Side effects:** destructive  **Output:** none

> **Warning: This action is destructive and cannot be undone.** The webinar and all associated data (recordings, speakers, mail, analytics) are permanently deleted from the workspace.

No additional flags — pass the webinar ID as a positional argument.

```bash
# Delete a webinar (destructive — cannot be undone)
twentythree webinar delete <id> --json

# Example with a real ID
twentythree webinar delete 12345 --json
```

---

### webinar repeat

**Auth scope:** write  **Side effects:** creates  **Output:** key-value (id + admin_url)

Duplicates a webinar and schedules the copy at a new date/time. After repeat, the CLI prints the new webinar ID and its admin URL.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--date` | yes | — | Schedule date/time for the new webinar (ISO 8601) |
| `--webinar-design-id` | no | — | Assign a webinar design by ID to the new webinar |

```bash
# Schedule a repeat of a webinar
twentythree webinar repeat <id> --date "2026-06-01T16:00:00Z" --json
#    => { "data": { "id": "<new-webinar-id>", "admin_url": "..." } }

# Schedule a weekly repeat
twentythree webinar repeat <id> --date "2026-05-22T16:00:00Z" --json
```

---

### webinar metrics

**Auth scope:** read  **Side effects:** none  **Output:** table (Metric, Value)

No additional flags — pass the webinar ID as a positional argument.

```bash
# Get metrics for a webinar
twentythree webinar metrics <id> --json

# Example with a real ID
twentythree webinar metrics 12345 --json
```

---

### webinar clips

**Auth scope:** read  **Side effects:** none  **Output:** table (Video ID, Title, Duration, Type, Published, Views)

Clips become available after `webinar recording stop` — allow time for recording processing before calling this command.

No additional flags — pass the webinar ID as a positional argument.

```bash
# List clips from a recorded webinar
twentythree webinar clips <id> --json

# Example with a real ID
twentythree webinar clips 12345 --json
```

---

### webinar highlights

**Auth scope:** read  **Side effects:** none  **Output:** table (Type, Start, End, Absolute Start)

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--video-id` | no | — | Scope to a specific recording by video ID |

```bash
# List all highlights for a webinar
twentythree webinar highlights <id> --json

# Scope highlights to a specific recording clip
twentythree webinar highlights <id> --video-id <video-id> --json
```

---

### webinar log

**Auth scope:** read  **Side effects:** none  **Output:** table (Event, Start, End)

Returns the event log (chat/questions/registrations timeline) for a webinar.

No additional flags — pass the webinar ID as a positional argument.

```bash
# Retrieve the event log
twentythree webinar log <id> --json

# Example with a real ID
twentythree webinar log 12345 --json
```

---

### webinar list-formats

**Auth scope:** read  **Side effects:** none  **Output:** table (Key, Name)

No additional flags.

```bash
# List available webinar formats
twentythree webinar list-formats --json

# Use the Key value when creating or updating webinar format settings
twentythree webinar list-formats --json
```

---

### webinar upload-image

**Auth scope:** write  **Side effects:** creates  **Output:** none

> **Chunked upload is automatic.** `twentythree webinar upload-image <id> <file>` handles chunking internally.
> `--chunk-size` (default 5 MB) and `--concurrency` (default 5) are tunables.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--type` | no | thumbnail | Image type: `thumbnail`, `preview`, or `before_webinar` |
| `--chunk-size` | no | 5242880 | Chunk size in bytes (default: 5 MB) |
| `--concurrency` | no | 5 | Number of chunks to upload in parallel |

```bash
# Upload a thumbnail image
twentythree webinar upload-image <id> ./thumb.jpg --json

# Upload a before-webinar image with custom type
twentythree webinar upload-image <id> ./before.jpg --type before_webinar --json
```

---

## Subtopic: webinar speaker

Speakers are presenters attached to a webinar. Commands cover list, add, update, remove, invite, and speaker-specific settings.

### webinar speaker list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Name, Email, Role, Order)

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--token` | no | — | Webinar token (auto-looked up if omitted) |
| `--speaker-id` | no | — | Filter to a specific speaker by ID |
| `--request-status` | no | — | Filter by request status: `requested`, `approved`, `denied`, `expired` |
| `--creation-source` | no | — | Filter by creation source: `admin`, `guest` |
| `--exclude-hidden` | no | — | Exclude hidden speakers from the results |
| `--include-unapproved` | no | — | Include unapproved speakers |
| `--include-hidden-guests` | no | — | Include hidden guest speakers |
| `--fields` | no | — | Comma-separated list of fields to return in the API response |

```bash
# List speakers for a webinar
twentythree webinar speaker list <id> --json

# List only approved speakers
twentythree webinar speaker list <id> --request-status approved --json

# List admin-created speakers, excluding hidden ones
twentythree webinar speaker list <id> --creation-source admin --exclude-hidden --json
```

---

### webinar speaker add

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--name` | yes | — | Speaker name |
| `--email` | no | — | Speaker email (required for WebRTC speakers) |
| `--title` | no | — | Speaker title or job title |
| `--bio` | no | — | Speaker bio shown in the UI |
| `--description` | no | — | Alias for `--bio` |
| `--company` | no | — | Speaker company / organization |
| `--website` | no | — | Speaker website URL |
| `--linkedin` | no | — | Speaker LinkedIn URL or handle |
| `--facebook` | no | — | Speaker Facebook URL or handle |
| `--twitter` | no | — | Speaker Twitter/X handle |
| `--connection-type` | no | `webrtc` | Speaker connection type: `webrtc`, `gearmode`, `rtmp`, `whip`, `srt`, `url` |
| `--connection-type-pull-url` | no | — | Pull URL for connection types that support stream pull (`whip`, `url`) |

```bash
# Add a WebRTC speaker (email required for webrtc)
twentythree webinar speaker add <id> --name "Jane Doe" --email jane@example.com --json

# Add an RTMP speaker (no email required)
twentythree webinar speaker add <id> --name "John Smith" --connection-type rtmp --json

# Add a speaker with full profile details
twentythree webinar speaker add <id> --name "John Smith" --email john@example.com --title "CTO" \
  --company "Acme" --bio "Engineering lead" --linkedin "in/johnsmith" --website "https://acme.example" --json
```

---

### webinar speaker add-from-speaker

**Auth scope:** write  **Side effects:** creates  **Output:** none

Adds a speaker from the workspace speaker library.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--speaker-id` | no | — | Library speaker ID to add |

```bash
# Add a speaker from the workspace library by ID
twentythree webinar speaker add-from-speaker <id> --speaker-id 99 --json

# First list library speakers to find the ID
twentythree webinar speaker library --json
```

---

### webinar speaker add-from-user

**Auth scope:** write  **Side effects:** creates  **Output:** none

Adds a workspace user as a speaker on a webinar.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--user-id` | no | — | User ID to add as speaker |

```bash
# Add a workspace user as a speaker
twentythree webinar speaker add-from-user <id> --user-id 42 --json

# First list workspace users to find the user ID
twentythree webinar speaker add-from-user <id> --user-id <user-id> --json
```

---

### webinar speaker update

**Auth scope:** write  **Side effects:** updates  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--name` | no | — | Speaker name |
| `--email` | no | — | Speaker email |
| `--title` | no | — | Speaker title or job title |
| `--bio` | no | — | Speaker bio shown in the UI |
| `--description` | no | — | Alias for `--bio` |
| `--company` | no | — | Speaker company / organization |
| `--website` | no | — | Speaker website URL |
| `--linkedin` | no | — | Speaker LinkedIn URL or handle |
| `--facebook` | no | — | Speaker Facebook URL or handle |
| `--twitter` | no | — | Speaker Twitter/X handle |
| `--connection-type` | no | — | Speaker connection type: `webrtc`, `gearmode`, `rtmp`, `whip`, `srt`, `url` |
| `--connection-type-pull-url` | no | — | Pull URL for connection types that support stream pull (`whip`, `url`) |

```bash
# Update a speaker's title and email
twentythree webinar speaker update <id> <speaker-id> --title "CEO" --email ceo@example.com --json

# Change a speaker's connection type to RTMP
twentythree webinar speaker update <id> <speaker-id> --connection-type rtmp --json

# Update speaker bio, company and LinkedIn
twentythree webinar speaker update <id> <speaker-id> --bio "Updated bio" --company "Acme" --linkedin "in/janedoe" --json
```

---

### webinar speaker remove

**Auth scope:** write  **Side effects:** destructive  **Output:** none

No additional flags — pass webinar ID and speaker ID as positional arguments.

```bash
# Remove a speaker from a webinar
twentythree webinar speaker remove <id> <speaker-id> --json

# Example with real IDs
twentythree webinar speaker remove 12345 9900 --json
```

---

### webinar speaker set-avatar

**Auth scope:** write  **Side effects:** updates  **Output:** none

Uploads an avatar image for a speaker. Chunked upload is automatic.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--chunk-size` | no | 5242880 | Chunk size in bytes (default: 5 MB) |
| `--concurrency` | no | 5 | Number of chunks to upload in parallel |

```bash
# Upload an avatar image for a speaker
twentythree webinar speaker set-avatar <id> <speaker-id> ./avatar.jpg --json

# Upload with custom chunk size
twentythree webinar speaker set-avatar <id> <speaker-id> ./avatar.png --chunk-size 524288 --json
```

---

### webinar speaker remove-avatar

**Auth scope:** write  **Side effects:** destructive  **Output:** none

No additional flags — pass webinar ID and speaker ID as positional arguments.

```bash
# Remove the avatar image from a speaker
twentythree webinar speaker remove-avatar <id> <speaker-id> --json

# Example with real IDs
twentythree webinar speaker remove-avatar 12345 9900 --json
```

---

### webinar speaker set-order

**Auth scope:** write  **Side effects:** updates  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--speaker-id` | no | — | Speaker ID |
| `--order` | no | — | New display order (1-based) |

```bash
# Set a speaker to appear first
twentythree webinar speaker set-order <id> --speaker-id <speaker-id> --order 1 --json

# Set a speaker to appear third
twentythree webinar speaker set-order <id> --speaker-id <speaker-id> --order 3 --json
```

---

### webinar speaker send-invitation

**Auth scope:** write  **Side effects:** updates  **Output:** none

No additional flags — pass webinar ID and speaker ID as positional arguments.

```bash
# Send an invitation to a speaker
twentythree webinar speaker send-invitation <id> <speaker-id> --json

# Example with real IDs
twentythree webinar speaker send-invitation 12345 9900 --json
```

---

### webinar speaker library

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Name, Email)

No additional flags.

```bash
# List speakers in the workspace library
twentythree webinar speaker library --json

# Use to find speaker IDs for add-from-speaker
twentythree webinar speaker library --json
```

---

### webinar speaker connection-types

**Auth scope:** read  **Side effects:** none  **Output:** table (Type, Label, Description)

No additional flags — pass the webinar ID as a positional argument.

```bash
# List available speaker connection types
twentythree webinar speaker connection-types <id> --json

# Example with a real ID
twentythree webinar speaker connection-types 12345 --json
```

---

### webinar speaker request-guest

**Auth scope:** write  **Side effects:** creates  **Output:** none

No additional flags — pass webinar ID and speaker ID as positional arguments.

```bash
# Request a speaker as a guest
twentythree webinar speaker request-guest <id> <speaker-id> --json

# Example with real IDs
twentythree webinar speaker request-guest 12345 9900 --json
```

---

### webinar speaker cancel-guest-request

**Auth scope:** write  **Side effects:** destructive  **Output:** none

No additional flags — pass webinar ID and speaker ID as positional arguments.

```bash
# Cancel a guest request for a speaker
twentythree webinar speaker cancel-guest-request <id> <speaker-id> --json

# Example with real IDs
twentythree webinar speaker cancel-guest-request 12345 9900 --json
```

---

## Subtopic: webinar series

A series groups multiple webinars together (e.g. a recurring show). Commands cover list, create, update, delete, and attaching webinars to a series.

### webinar series list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Name, Status, Created)

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--page` | no | — | Page number |
| `--size` | no | — | Page size |
| `--all` | no | — | Fetch all pages automatically |
| `--search` | no | — | Search series by name |
| `--live-series-id` | no | — | Filter to a specific series by ID |
| `--live-id` | no | — | Filter to series containing a specific webinar ID |
| `--album-id` | no | — | Filter by album ID |
| `--user-id` | no | — | Filter by user ID |
| `--series-type` | no | — | Filter by type: `liveevent`, `series` |
| `--ordering` | no | — | Order by: `name`, `private`, `live_status`, `live_date`, `creation_date`, `updated_date` |
| `--order` | no | — | Sort direction: `asc`, `desc` |
| `--cancelled` | no | — | Include cancelled series (allowNo) |
| `--draft` | no | — | Include draft series (allowNo) |
| `--private` | no | — | Include private series (allowNo) |
| `--include-private` | no | — | Include private series in results |
| `--include-speakers` | no | — | Include speaker data in response |
| `--include-stats` | no | — | Include statistics in response |
| `--include-albums` | no | — | Include album data in response |
| `--fields` | no | — | Comma-separated list of fields to return in the API response |

```bash
# List all webinar series
twentythree webinar series list --json

# List series ordered by creation date descending
twentythree webinar series list --ordering creation_date --order desc --json

# List all live event series including speakers
twentythree webinar series list --series-type liveevent --include-speakers --json

# Fetch all pages of series
twentythree webinar series list --all --json
```

---

### webinar series create

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--name` | no | — | Series name |
| `--description` | no | — | Series description |

```bash
# Create a new webinar series
twentythree webinar series create --name "Weekly Product Updates" --json

# Create with description
twentythree webinar series create --name "Q2 Webinars" --description "All Q2 sessions" --json
```

---

### webinar series update

**Auth scope:** write  **Side effects:** updates  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--name` | no | — | Series name |
| `--description` | no | — | Series description |

```bash
# Update the series name
twentythree webinar series update <series-id> --name "Q2 All-Hands Series" --json

# Update the series description
twentythree webinar series update <series-id> --description "Quarterly alignment sessions" --json
```

---

### webinar series delete

**Auth scope:** write  **Side effects:** destructive  **Output:** none

> **Warning: This action is destructive and cannot be undone.**

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--delete-associations` | no | false | Also delete associated webinars |

```bash
# Delete a series (keep associated webinars)
twentythree webinar series delete <series-id> --json

# Delete a series and all associated webinars
twentythree webinar series delete <series-id> --delete-associations --json
```

---

### webinar series cancel

**Auth scope:** write  **Side effects:** destructive  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--cancel-associations` | no | false | Also cancel associated webinars |

```bash
# Cancel a series
twentythree webinar series cancel <series-id> --json

# Cancel a series and all associated webinars
twentythree webinar series cancel <series-id> --cancel-associations --json
```

---

### webinar series metrics

**Auth scope:** read  **Side effects:** none  **Output:** table (Metric, Value)

No additional flags — pass the series ID as a positional argument.

```bash
# Get metrics for a webinar series
twentythree webinar series metrics <series-id> --json

# Example with a real series ID
twentythree webinar series metrics 42 --json
```

---

### webinar series mapped-objects

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Type, Title)

Lists all webinars (and other objects) mapped to a series.

No additional flags — pass the series ID as a positional argument.

```bash
# List webinars in a series
twentythree webinar series mapped-objects <series-id> --json

# Example with a real series ID
twentythree webinar series mapped-objects 42 --json
```

---

### webinar series recurrences

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Start Time, Status, Skipped)

No additional flags — pass the series ID as a positional argument.

```bash
# List scheduled recurrences for a series
twentythree webinar series recurrences <series-id> --json

# Example with a real series ID
twentythree webinar series recurrences 42 --json
```

---

### webinar series apply-recurrence

**Auth scope:** write  **Side effects:** updates  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--recurrence-id` | no | — | Recurrence ID |

```bash
# Apply a recurrence to a series
twentythree webinar series apply-recurrence <series-id> --recurrence-id 7 --json

# Example with real IDs
twentythree webinar series apply-recurrence 42 --recurrence-id 7 --json
```

---

### webinar series skip-recurrence

**Auth scope:** write  **Side effects:** updates  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--recurrence-id` | no | — | Recurrence ID |
| `--skipped` | no | — | Set skipped (`--skipped`) or unskipped (`--no-skipped`) |

```bash
# Skip a recurrence
twentythree webinar series skip-recurrence <series-id> --recurrence-id 7 --skipped --json

# Unskip a recurrence
twentythree webinar series skip-recurrence <series-id> --recurrence-id 7 --no-skipped --json
```

---

### webinar series set-ondemand

**Auth scope:** write  **Side effects:** updates  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--update-associations` | no | false | Also update associated webinars |

```bash
# Set a series to on-demand
twentythree webinar series set-ondemand <series-id> --json

# Set a series and associated webinars to on-demand
twentythree webinar series set-ondemand <series-id> --update-associations --json
```

---

### webinar series upload-thumbnail

**Auth scope:** write  **Side effects:** creates  **Output:** none

Chunked upload is automatic.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--chunk-size` | no | 5242880 | Chunk size in bytes (default: 5 MB) |
| `--concurrency` | no | 5 | Number of chunks to upload in parallel |

```bash
# Upload a thumbnail for a series
twentythree webinar series upload-thumbnail <series-id> ./thumb.jpg --json

# Upload with custom chunk size
twentythree webinar series upload-thumbnail <series-id> ./thumbnail.png --chunk-size 10485760 --json
```

---

## Subtopic: webinar mail

Mail templates and scheduled emails associated with a webinar (invitations, reminders, post-event follow-ups).

### webinar mail list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Subject, Status, Send Date)

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--series-id` | no | — | Series ID — list mails for a series instead of a webinar |
| `--mail-id` | no | — | Return a specific mail by its ID |
| `--include-metrics` | no | — | Include metrics on mail performance in the response |
| `--fields` | no | — | Comma-separated list of fields to return in the API response |

```bash
# List emails for a webinar
twentythree webinar mail list <id> --json

# List emails for a series
twentythree webinar mail list --series-id <series-id> --json

# Get a specific mail with performance metrics
twentythree webinar mail list <id> --mail-id <mail-id> --include-metrics --json
```

---

### webinar mail add

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--series-id` | no | — | Series ID — add mail to a series instead of a webinar |
| `--subject` | no | — | Email subject |
| `--message` | no | — | Email message body |
| `--recipient-groups` | no | — | Comma-separated groups: `speakers`, `registered`, `attendees`, `noshows` |
| `--scheduled-at` | no | — | When to send (ISO 8601 timestamp) |
| `--cta-link` | no | — | Call-to-action link URL |
| `--cta-label` | no | — | Call-to-action button label |
| `--send-immediately` / `--no-send-immediately` | no | — | Send the email immediately |
| `--include-live-info` / `--no-include-live-info` | no | — | Include the webinar info block |
| `--include-series-archive` / `--no-include-series-archive` | no | — | Include the series archive block |

> **Note:** The API does not accept a mail `type` and has no endpoint to seed the standard typed emails (confirmation/reminder/etc.). Emails added here are custom emails. Always set `--cta-link` to the webinar's own public URL.

```bash
# Add a reminder email to a webinar
twentythree webinar mail add <id> --subject "Join us tomorrow!" --message "The webinar starts at 4 PM UTC." --json

# Add a scheduled reminder to registered attendees with a CTA
twentythree webinar mail add <id> --subject "Starting soon" --message "See you there" \
  --recipient-groups "registered,attendees" --scheduled-at "2026-05-15T15:00:00Z" \
  --cta-link "https://video.example.com/watch/abc" --cta-label "Join now" --json

# Add an email to a series
twentythree webinar mail add --series-id <series-id> --subject "Series reminder" --json
```

---

### webinar mail update

**Auth scope:** write  **Side effects:** updates  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--webinar-id` | no | — | Webinar ID (mutually exclusive with --series-id) |
| `--series-id` | no | — | Series ID (mutually exclusive with --webinar-id) |
| `--subject` | no | — | Email subject |
| `--message` | no | — | Email message body |
| `--enabled` / `--no-enabled` | no | — | Enable/disable the email (e.g. `--no-enabled` to disable the "missed" mail) |
| `--recipient-groups` | no | — | Comma-separated groups: `speakers`, `registered`, `attendees`, `noshows` |
| `--scheduled-at` | no | — | When to send (ISO 8601 timestamp) |
| `--cta-link` | no | — | Call-to-action link URL |
| `--cta-label` | no | — | Call-to-action button label |
| `--include-live-info` / `--no-include-live-info` | no | — | Include the webinar info block |
| `--include-series-archive` / `--no-include-series-archive` | no | — | Include the series archive block |
| `--require-recording` / `--no-require-recording` | no | — | Only send once a recording is available |

```bash
# Update the subject of a webinar email
twentythree webinar mail update <mail-id> --webinar-id <id> --subject "Updated Subject" --json

# Disable an email and fix its CTA link to the webinar's own URL
twentythree webinar mail update <mail-id> --webinar-id <id> --no-enabled --cta-link "https://video.example.com/watch/abc" --json

# Update an email on a series
twentythree webinar mail update <mail-id> --series-id <series-id> --message "New content" --json
```

---

### webinar mail remove

**Auth scope:** write  **Side effects:** destructive  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--webinar-id` | no | — | Webinar ID (mutually exclusive with --series-id) |
| `--series-id` | no | — | Series ID (mutually exclusive with --webinar-id) |

```bash
# Remove an email from a webinar
twentythree webinar mail remove <mail-id> --webinar-id <id> --json

# Remove an email from a series
twentythree webinar mail remove <mail-id> --series-id <series-id> --json
```

---

### webinar mail send

**Auth scope:** write  **Side effects:** updates  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--webinar-id` | no | — | Webinar ID (mutually exclusive with --series-id) |
| `--series-id` | no | — | Series ID (mutually exclusive with --webinar-id) |

```bash
# Send a webinar email immediately
twentythree webinar mail send <mail-id> --webinar-id <id> --json

# Send a series email
twentythree webinar mail send <mail-id> --series-id <series-id> --json
```

---

### webinar mail test

**Auth scope:** write  **Side effects:** updates  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--webinar-id` | no | — | Webinar ID (mutually exclusive with --series-id) |
| `--series-id` | no | — | Series ID (mutually exclusive with --webinar-id) |
| `--email` | no | — | Recipient email for the test |

```bash
# Send a test email to yourself
twentythree webinar mail test <mail-id> --webinar-id <id> --email me@example.com --json

# Test a series email
twentythree webinar mail test <mail-id> --series-id <series-id> --email me@example.com --json
```

---

### webinar mail preview

**Auth scope:** read  **Side effects:** none  **Output:** none (raw HTML)

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--webinar-id` | no | — | Webinar ID (mutually exclusive with --series-id) |
| `--series-id` | no | — | Series ID (mutually exclusive with --webinar-id) |

```bash
# Preview a webinar email as raw HTML
twentythree webinar mail preview <mail-id> --webinar-id <id> --json

# Redirect HTML preview to a file
twentythree webinar mail preview <mail-id> --webinar-id <id> > preview.html
```

---

## Subtopic: webinar recording

Control server-side recording for a live webinar. Recording must be started while the webinar is live, stopped before clips become available, and can be split mid-session to create a chaptered archive.

### webinar recording start

**Auth scope:** write  **Side effects:** updates  **Output:** none

No additional flags — pass the webinar ID as a positional argument.

```bash
# Start recording a live webinar
twentythree webinar recording start <id> --json

# Example with a real ID
twentythree webinar recording start 12345 --json
```

---

### webinar recording stop

**Auth scope:** write  **Side effects:** updates  **Output:** none

No additional flags — pass the webinar ID as a positional argument.

```bash
# Stop recording a webinar
twentythree webinar recording stop <id> --json

# Example with a real ID
twentythree webinar recording stop 12345 --json
```

---

### webinar recording status

**Auth scope:** read  **Side effects:** none  **Output:** key-value

No additional flags — pass the webinar ID as a positional argument.

```bash
# Check recording status
twentythree webinar recording status <id> --json

# Poll status after stopping to know when clips are ready
twentythree webinar recording status 12345 --json
```

---

### webinar recording split

**Auth scope:** write  **Side effects:** updates  **Output:** none

Splits the current recording into a new segment, creating a chapter boundary in the archive.

No additional flags — pass the webinar ID as a positional argument.

```bash
# Split the current recording into a new segment
twentythree webinar recording split <id> --json

# Example with a real ID
twentythree webinar recording split 12345 --json
```

---

## Subtopic: webinar room

Room commands control the live broadcast room (stream key, room URL, connection info). `webinar room connect` is the command agents use to retrieve the stream key and room URL before going live.

### webinar room connect

**Auth scope:** read  **Side effects:** updates  **Output:** key-value

Returns stream key and room URL. These credentials enable the broadcaster to start streaming into the webinar.

No additional flags — pass the webinar ID as a positional argument.

```bash
# Get room connection info (stream key + room URL)
twentythree webinar room connect <id> --json

# Example with a real ID
twentythree webinar room connect 12345 --json
```

---

### webinar room info

**Auth scope:** read  **Side effects:** none  **Output:** key-value

No additional flags — pass the webinar ID as a positional argument.

```bash
# Get room information for a webinar
twentythree webinar room info <id> --json

# Example with a real ID
twentythree webinar room info 12345 --json
```

---

### webinar room send-recording

**Auth scope:** write  **Side effects:** updates  **Output:** none

No additional flags — pass the webinar ID as a positional argument.

```bash
# Send a recording from the webinar room
twentythree webinar room send-recording <id> --json

# Example with a real ID
twentythree webinar room send-recording 12345 --json
```

---

### webinar room themes

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Name, Description)

No additional flags.

```bash
# List available room themes
twentythree webinar room themes --json

# Use the ID value when configuring room appearance
twentythree webinar room themes --json
```

---

## Subtopic: webinar section

Sections are agenda items (time-stamped chapter markers) displayed to viewers. Unlike `video section`, webinar sections can be scheduled relative to the webinar start time.

### webinar section list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Title, Start Time, Description)

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--token` | no | — | Webinar token (auto-looked up if omitted) |

```bash
# List agenda sections for a webinar
twentythree webinar section list <id> --json

# Example with a real ID
twentythree webinar section list 12345 --json
```

---

### webinar section add

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--title` | no | — | Section title |
| `--description` | no | — | Section description |
| `--start-time` | no | — | Start time in seconds |

```bash
# Add an intro section at time 0
twentythree webinar section add <id> --title "Introduction" --start-time 0 --json

# Add a Q&A section at 60 minutes
twentythree webinar section add <id> --title "Q&A" --start-time 3600 --description "Audience questions" --json
```

---

### webinar section update

**Auth scope:** write  **Side effects:** updates  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--title` | no | — | New section title |
| `--description` | no | — | New section description |
| `--start-time` | no | — | New start time in seconds |

```bash
# Update a section title
twentythree webinar section update <id> <section-id> --title "Updated Title" --json

# Update start time and description
twentythree webinar section update <id> <section-id> --start-time 1800 --description "Updated description" --json
```

---

### webinar section remove

**Auth scope:** write  **Side effects:** destructive  **Output:** none

No additional flags — pass webinar ID and section ID as positional arguments.

```bash
# Remove a section from a webinar
twentythree webinar section remove <id> <section-id> --json

# Example with real IDs
twentythree webinar section remove 12345 99 --json
```

---

## Subtopic: webinar attachment

Attachments are files (PDFs, slides, links) made available to webinar viewers.

### webinar attachment list

**Auth scope:** read  **Side effects:** none  **Output:** table (Filename, Size, Hidden)

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--token` | no | — | Webinar token (auto-looked up if omitted) |
| `--include-hidden` | no | false | Include hidden attachments |

```bash
# List attachments for a webinar
twentythree webinar attachment list <id> --json

# Include hidden attachments
twentythree webinar attachment list <id> --include-hidden --json
```

---

### webinar attachment upload

**Auth scope:** write  **Side effects:** creates  **Output:** none

Chunked upload is automatic.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--chunk-size` | no | 5242880 | Chunk size in bytes (default: 5 MB) |
| `--concurrency` | no | 5 | Number of chunks to upload in parallel |
| `--hidden` | no | false | Upload attachment as hidden |

```bash
# Upload slides as a downloadable attachment
twentythree webinar attachment upload <id> ./slides.pdf --json

# Upload a handout as hidden (not visible to viewers until unhidden)
twentythree webinar attachment upload <id> ./handout.pdf --hidden --json
```

---

### webinar attachment set-hidden

**Auth scope:** write  **Side effects:** updates  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--filename` | no | — | Filename of the attachment |
| `--hidden` | yes | — | Set hidden (`--hidden`) or visible (`--no-hidden`) |

```bash
# Hide an attachment from viewers
twentythree webinar attachment set-hidden <id> --filename slides.pdf --hidden --json

# Make a hidden attachment visible
twentythree webinar attachment set-hidden <id> --filename slides.pdf --no-hidden --json
```

---

### webinar attachment delete

**Auth scope:** write  **Side effects:** destructive  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--filename` | no | — | Filename of the attachment to delete |

```bash
# Delete an attachment from a webinar
twentythree webinar attachment delete <id> --filename slides.pdf --json

# Delete another attachment
twentythree webinar attachment delete <id> --filename handout.pdf --json
```

---

## Subtopic: webinar queued-video

Queued videos are pre-recorded clips played during a live webinar (simulated-live / interstitial content).

### webinar queued-video add

**Auth scope:** write  **Side effects:** creates  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--video-id` | no | — | Video ID to queue |

```bash
# Add a pre-recorded intro video to the queue
twentythree webinar queued-video add <id> --video-id <video-id> --json

# Example with real IDs
twentythree webinar queued-video add 12345 --video-id 67890 --json
```

---

### webinar queued-video remove

**Auth scope:** write  **Side effects:** destructive  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--video-id` | no | — | Video ID to remove from queue |

```bash
# Remove a video from the webinar queue
twentythree webinar queued-video remove <id> --video-id <video-id> --json

# Example with real IDs
twentythree webinar queued-video remove 12345 --video-id 67890 --json
```

---

## Subtopic: webinar transcription

These commands manage *live* (real-time) transcription for a webinar — connecting a transcription, listing locales, and listing configured transcriptions. They configure transcription; they do **not** return the finished transcript text.

> **Retrieving a webinar's transcript:** the transcript lives on the webinar's **recording video** as a subtitle track, not on the webinar object. Find the recording with `twentythree video list --live-id <webinarId> --json` (look for a video with `subtitles_p: true`), then use `twentythree video subtitle list <recordingVideoId>` and `twentythree video subtitle data <recordingVideoId> --subtitle-id <locale> --format json`. See the **Transcripts are subtitles** and **Transcripts for webinars** sections in [video.md](video.md).

### webinar transcription list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Language, Status)

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--token` | no | — | Webinar token (auto-looked up if not provided) |

```bash
# List transcriptions for a webinar
twentythree webinar transcription list <id> --json

# Example with a real ID
twentythree webinar transcription list 12345 --json
```

---

### webinar transcription connect

**Auth scope:** write  **Side effects:** updates  **Output:** none

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--presenter-token` | no | — | Presenter token |

```bash
# Connect a transcription to a webinar
twentythree webinar transcription connect <id> --json

# Connect with a presenter token
twentythree webinar transcription connect <id> --presenter-token abc123 --json
```

---

### webinar transcription locales

**Auth scope:** read  **Side effects:** none  **Output:** table (Locale, Name)

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--token` | no | — | Webinar token (auto-looked up if not provided) |

```bash
# List available transcription locales
twentythree webinar transcription locales <id> --json

# Example with a real ID
twentythree webinar transcription locales 12345 --json
```

---

### webinar transcription transcriptionlist

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Webinar ID, Language, Status)

Lists all transcriptions in the workspace (not scoped to a single webinar).

No additional flags.

```bash
# List all transcriptions in the workspace
twentythree webinar transcription transcriptionlist --json

# Use to audit transcription status across all webinars
twentythree webinar transcription transcriptionlist --json
```

---

## Common Patterns

### Create and publish a webinar

```bash
# 1. Create a scheduled webinar
twentythree webinar create --title "Q2 Town Hall" --live-date "2026-05-15T16:00:00Z" --json
#    => { "data": { "id": "<webinar-id>", "admin_url": "..." } }

# 2. Publish it (make visible to registrants)
twentythree webinar update <webinar-id> --publish --json
```

### Go-live sequence

```bash
# 1. Get room connection info (stream key + room URL)
twentythree webinar room connect <id> --json
#    => Returns stream key and room URL for your streaming software

# 2. Start recording once you go live
twentythree webinar recording start <id> --json
```

### Session archive after broadcast

```bash
# 1. Stop recording when session ends
twentythree webinar recording stop <id> --json

# 2. Wait for processing, then check clips availability
twentythree webinar recording status <id> --json
twentythree webinar clips <id> --json

# 3. Mark webinar as previous (archived)
twentythree webinar update <id> --status previous --json
```

### Add a speaker and agenda section

```bash
# Add a speaker
twentythree webinar speaker add <id> --name "Jane Doe" --email jane@example.com --title "CTO" --json

# Add agenda sections
twentythree webinar section add <id> --title "Introduction" --start-time 0 --json
twentythree webinar section add <id> --title "Demo" --start-time 600 --json
twentythree webinar section add <id> --title "Q&A" --start-time 3600 --json
```

### Attach slides as a downloadable

```bash
# Upload slides PDF as an attachment
twentythree webinar attachment upload <id> ./slides.pdf --json

# Verify the attachment is visible
twentythree webinar attachment list <id> --json
```

### Schedule a repeat occurrence

```bash
# Schedule next week's repeat
twentythree webinar repeat <id> --date "2026-05-22T16:00:00Z" --json
#    => { "data": { "id": "<new-webinar-id>", "admin_url": "..." } }
```

### Filter webinar list by status

```bash
# List live webinars
twentythree webinar list --status live --json

# List all previous webinars including private
twentythree webinar list --status previous --include-private --json
```

---

## Terminology Notes

CLI `webinar` = API `live`. The `api_endpoint` field in `--agent` output uses the API name:

- `twentythree webinar create` → `POST /live/create`
- `twentythree webinar list` → `GET /live/list`
- `twentythree webinar update` → `POST /live/update`
- `twentythree webinar delete` → `POST /live/delete`
- `twentythree webinar recording start` → `POST /live/recording/start`
- `twentythree webinar room connect` → `GET /live/webinar/connect`

When reading the raw OpenAPI spec, `live` refers to a webinar. The `live session` endpoint family (`/live/webinar/*`) backs the `webinar room` concept — note that `webinar room connect` uses `/live/webinar/connect`.
When commenting on a webinar via the `comment` topic, pass `--object-type live`.

