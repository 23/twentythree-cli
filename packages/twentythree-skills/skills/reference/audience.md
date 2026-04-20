---
name: audience
description: Manage viewer audience records, segments, lead-capture registrations, and audience fields.
---

# TwentyThree Audience Commands

> Query, register, and manage viewer audience profiles, registrations, and custom fields.
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: read (list, search, metrics, timelines, companies, funnel, identity-sources, list-collectors, field list), write (register, unregister, remove, field set, field remove).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree audience <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### audience list

**Auth scope:** read  **Side effects:** none  **Output:** table (UUID, Name, Email, Company, Score, Timelines)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--page` | no | Page number |
| `--size` | no | Page size (max 500) |
| `--offset` | no | Offset for pagination |
| `--orderby` | no | Order by field (recent, timeline_count, score, first) |
| `--order` | no | Sort direction (asc/desc) |
| `--search` | no | Free-text search across names and emails |
| `--identified` | no | Filter to identified profiles only |
| `--objects` | no | Filter by viewed object IDs (space-separated) |

```bash
# List all audience members (paginated)
twentythree audience list --json

# List identified audience members ordered by engagement score
twentythree audience list --identified --orderby score --order desc --size 100 --json
```

### audience search

**Auth scope:** read  **Side effects:** none  **Output:** table (UUID, Name, Email, Company, Score, Last Seen)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--text` | yes | Search text (required) |
| `--size` | no | Number of results |
| `--offset` | no | Results offset |
| `--orderby` | no | Order by field |
| `--order` | no | Sort direction (asc/desc) |

```bash
# Search for an audience member by name or email
twentythree audience search --text "jane@example.com" --json

# Search for all audience members from a company
twentythree audience search --text "acme" --size 20 --orderby score --order desc --json
```

### audience metrics

**Auth scope:** read  **Side effects:** none  **Output:** key-value

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--page` | no | Page number |
| `--size` | no | Page size |
| `--offset` | no | Offset for pagination |
| `--search` | no | Free-text search filter |
| `--identified` | no | Filter to identified profiles only |
| `--objects` | no | Filter by viewed object IDs (space-separated) |

```bash
# Get overall audience metrics for the workspace
twentythree audience metrics --json

# Get metrics for identified audience members only
twentythree audience metrics --identified --json
```

### audience timelines

**Auth scope:** read  **Side effects:** none  **Output:** table (UUID, Object ID, Type, Engagement, Sessions, Source)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--page` | no | Page number |
| `--size` | no | Page size |
| `--offset` | no | Offset for pagination |
| `--uuid` | no | Filter by audience member UUID |
| `--objects` | no | Filter by object IDs (space-separated) |
| `--orderby` | no | Order by field |
| `--order` | no | Sort direction (asc/desc) |

```bash
# Get all timelines for a specific audience member
twentythree audience timelines --uuid <uuid> --json

# Get timelines for specific videos across all viewers
twentythree audience timelines --objects "<video-id-1> <video-id-2>" --json
```

### audience register

**Auth scope:** write  **Side effects:** creates  **Output:** none

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--email` | yes | Contact email address |
| `--object-id` | no | Webinar/video ID to register for |
| `--uuid` | no | Existing contact UUID |
| `--action-id` | no | Collector action ID |
| `--firstname` | no | First name |
| `--lastname` | no | Last name |
| `--company` | no | Company name |
| `--phone` | no | Phone number |
| `--return-url` | no | Base URL for tracking URL |
| `--source` | no | Registration source (api, import, site, custom) |

```bash
# Register a new audience member
twentythree audience register --email "jane@example.com" --json

# Register a member for a specific webinar with full profile data
twentythree audience register --email "john@acme.com" --object-id <webinar-id> --firstname "John" --lastname "Doe" --company "Acme Corp" --source api --json
```

### audience unregister

**Auth scope:** write  **Side effects:** destructive  **Output:** none

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | yes | Object ID to unregister from |
| `--email` | no | Contact email |
| `--uuid` | no | Contact UUID |

```bash
# Unregister by email from a specific webinar
twentythree audience unregister --object-id <webinar-id> --email "jane@example.com" --json

# Unregister by UUID
twentythree audience unregister --object-id <webinar-id> --uuid <uuid> --json
```

### audience remove

**Auth scope:** write  **Side effects:** destructive  **Output:** none

Permanently removes an audience profile. At least one of `--email` or `--uuid` required.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--email` | no | Contact email address |
| `--uuid` | no | Contact UUID |

```bash
# Permanently remove an audience member by email (GDPR deletion)
twentythree audience remove --email "jane@example.com" --json

# Remove by UUID
twentythree audience remove --uuid <uuid> --json
```

### audience companies

**Auth scope:** read  **Side effects:** none  **Output:** table (UUID, Name, Domain, Score, Profiles, Timelines)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--page` | no | Page number |
| `--size` | no | Page size |
| `--offset` | no | Offset for pagination |
| `--orderby` | no | Order by field |
| `--order` | no | Sort direction (asc/desc) |
| `--identified` | no | Filter to identified companies only |
| `--domains` | no | Filter by company domains (space-separated) |

```bash
# List all companies in the audience
twentythree audience companies --json

# Find companies in a specific domain with highest engagement score
twentythree audience companies --domains "acme.com competitor.com" --orderby score --order desc --json
```

### audience funnel

**Auth scope:** read  **Side effects:** none  **Output:** key-value

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--objects` | no | Filter by object IDs (space-separated) |
| `--live-type` | no | Live event type filter |
| `--resolve-recordings` | no | Resolve recording details |
| `--resolve-live-series` | no | Resolve live series details |

```bash
# Get overall audience funnel data
twentythree audience funnel --json

# Get funnel for specific videos
twentythree audience funnel --objects "<video-id-1> <video-id-2>" --resolve-recordings --json
```

### audience identity-sources

**Auth scope:** read  **Side effects:** none  **Output:** table (Source, Title, Service)

No additional flags.

```bash
# List all identity sources configured for the workspace
twentythree audience identity-sources --json

# Use in context to understand how audience members were identified
twentythree audience identity-sources --json
```

### audience list-collectors

**Auth scope:** read  **Side effects:** none  **Output:** table (Action ID, Name, Start, End, Require Email)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | no | Filter by object ID |
| `--action-id` | no | Filter by action ID |

```bash
# List all collectors linked to the audience system
twentythree audience list-collectors --json

# List collectors linked to a specific video
twentythree audience list-collectors --object-id <video-id> --json
```

## Subtopic: audience field

Manage custom fields on audience profiles. Fields are workspace-wide and appear on all audience records.

### audience field list

**Auth scope:** read  **Side effects:** none  **Output:** table (Key, Label, Type, Priority, Options)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--include-widget-html` | no | Include HTML widget for each field |

```bash
# List all custom audience fields
twentythree audience field list --json

# List fields including their HTML widget rendering
twentythree audience field list --include-widget-html --json
```

### audience field set

**Auth scope:** write  **Side effects:** updates  **Output:** none

Creates or updates a custom audience field. Use `audience field types` to discover valid type values.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--key` | yes | Unique field key |
| `--type` | yes | Field type (use `audience field types` to list valid values) |
| `--label` | yes | Human-readable label |
| `--options` | no | Semicolon-separated options (for enumerable types) |
| `--priority` | no | Display order priority |

```bash
# Add a simple text field to all audience profiles
twentythree audience field set --key "department" --type text --label "Department" --json

# Add an enum field with options
twentythree audience field set --key "tier" --type enum --label "Customer Tier" --options "free;pro;enterprise" --priority 1 --json
```

### audience field remove

**Auth scope:** write  **Side effects:** destructive  **Output:** none

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--key` | yes | Field key to remove |

```bash
# Remove a custom audience field
twentythree audience field remove --key "old-field" --json

# Remove a field that is no longer in use
twentythree audience field remove --key "department" --json
```

### audience field types

**Auth scope:** read  **Side effects:** none  **Output:** table (Type, Label)

No additional flags. Returns valid type values for use with `audience field set --type`.

```bash
# Discover valid field types before creating a new field
twentythree audience field types --json

# Use output to pick a type for field set
twentythree audience field types --json
```

## Common Patterns

### Register a new audience member for a webinar

```bash
# Register a viewer for a specific webinar with profile data
twentythree audience register \
  --email "jane@example.com" \
  --object-id <webinar-id> \
  --firstname "Jane" \
  --lastname "Smith" \
  --company "Acme Corp" \
  --source api \
  --json
```

### Search for a viewer and get their viewing timeline

```bash
# Step 1: Find the audience member
twentythree audience search --text "jane@example.com" --json

# Step 2: Get their full viewing history using the UUID from step 1
twentythree audience timelines --uuid <uuid> --json
```

### Add a custom field to all audience profiles

```bash
# Step 1: Check existing fields and available types
twentythree audience field list --json
twentythree audience field types --json

# Step 2: Create the new field
twentythree audience field set --key "company_size" --type text --label "Company Size" --priority 5 --json

# Step 3: Verify the field was created
twentythree audience field list --json
```
