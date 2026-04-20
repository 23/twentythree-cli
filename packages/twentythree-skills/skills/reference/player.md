---
name: player
description: List and configure TwentyThree embed players, generate embed HTML, and discover available styles.
---

# TwentyThree Player Commands

> List and update embed players, generate embed code for videos/webinars/categories, and
> discover available player styles and embed versions.
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: anonymous (embed), read (list, embed-versions, styles), write (update, delete).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree player <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### player list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Name, Default)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--source` | no | Analytics source tag to filter by |

```bash
# List all players in the workspace
twentythree player list --json

# List players tagged with a specific analytics source
twentythree player list --source embed --json
```

### player update

**Auth scope:** write  **Side effects:** updates  **Output:** none

Takes `<player-id>` as positional argument.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--name` | no | New name for the player |
| `--description` | no | New description for the player |
| `--data` | no | JSON-encoded player properties to merge into the request body |

```bash
# Rename a player
twentythree player update 42 --name "Brand Player v2" --json

# Update a player with custom data properties
twentythree player update 42 --name "Campaign Player" --description "Q2 campaign" --json
```

### player delete

**Auth scope:** write  **Side effects:** destructive  **Output:** none

Takes `<player-id>` as positional argument. No flags.

```bash
# Delete a player by ID
twentythree player delete 42 --json

# List players first to confirm the ID before deletion
twentythree player list --json
twentythree player delete 42 --json
```

### player embed

**Auth scope:** anonymous  **Side effects:** none  **Output:** key-value (HTML embed code)

Generates embed HTML for a video, webinar, or category. Because this command returns HTML,
redirecting to a file is more practical than `--json` for most uses.

**Exception:** `player embed` outputs HTML. Use redirect (`> embed.html`) to save output to a file.
Use `--json` only when capturing the raw embed code string in a structured response.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--video-id` | no | Video ID to embed (maps to photo_id in API) |
| `--webinar-id` | no | Webinar ID to embed (maps to live_id in API) |
| `--category-id` | no | Category ID to embed (maps to album_id in API) |
| `--player-id` | no | Player ID to use (default: workspace default player) |
| `--url` | no | Workspace URL to resolve to an embed code |
| `--width` | no | Desired embed width in pixels |
| `--height` | no | Desired embed height in pixels |
| `--responsive` | no | Return a responsive embed code |
| `--autoplay` | no | Enable auto-play in the embed code |
| `--iframe` | no | Return an iframe-based embed code |
| `--start` | no | Start position in seconds |
| `--include-unpublished` | no | Include unpublished content in player parameters |
| `--token` | no | Video token for private or token-protected videos |
| `--source` | no | Analytics source tag |

```bash
# Generate embed HTML and save to file (most common usage)
twentythree player embed --video-id 123 --responsive > embed.html

# Generate embed code as structured JSON for programmatic use
twentythree player embed --video-id 123 --responsive --autoplay --json
```

### player embed-versions

**Auth scope:** read  **Side effects:** none  **Output:** table (Type, Key, Label)

Lists available embed versions for a specific object. Requires both `--object-type` and `--object-id`.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-type` | yes | Object type: `photo`, `live`, `album`, or `site` |
| `--object-id` | yes | Object ID |
| `--source` | no | Embed source parameter (e.g. `embed`, `share`) |

```bash
# List embed versions for a video (use API legacy name 'photo')
twentythree player embed-versions --object-type photo --object-id 123 --json

# List embed versions for a webinar (use API legacy name 'live')
twentythree player embed-versions --object-type live --object-id 456 --json
```

### player styles

**Auth scope:** read  **Side effects:** none  **Output:** table (Style, Name, Icon)

Lists available player visual styles. No required flags.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--fields` | no | Comma-separated list of fields to return |

```bash
# Discover all available player styles
twentythree player styles --json

# Request specific fields only
twentythree player styles --fields style,name --json
```

## Common Patterns

### Generate responsive embed code for a video

```bash
# Discover players to pick one, or use the workspace default
twentythree player list --json

# Generate a responsive, autoplay embed
twentythree player embed --video-id <id> --responsive --autoplay --json

# Save to file for use in HTML templates
twentythree player embed --video-id <id> --responsive > embed.html
```

### Discover available styles before updating a player

```bash
# Step 1: List current players
twentythree player list --json

# Step 2: Check available visual styles
twentythree player styles --json

# Step 3: Update the player with a chosen style via --data
twentythree player update <player-id> --name "Styled Player" --data '{"style":"minimal"}' --json
```

### Generate webinar embed for a live event

```bash
# Generate an iframe embed for a webinar (use API name 'live')
twentythree player embed --webinar-id <webinar-id> --iframe --responsive --json

# List embed versions for the webinar
twentythree player embed-versions --object-type live --object-id <webinar-id> --json
```
