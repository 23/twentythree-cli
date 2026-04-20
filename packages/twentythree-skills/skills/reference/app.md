---
name: app
description: Manage TwentyThree apps (player design integrations) including thumbnails.
---

# TwentyThree App Commands

> Create and manage player design app integrations on the active workspace. Apps customise
> player appearance and behaviour. Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: read (list), write (add, update, delete, set-thumbnail, remove-thumbnail).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree app <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### app list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Name, Type, Description)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--app-id` | no | Filter results to a specific app ID |
| `--page` | no | Page offset |
| `--size` | no | Number of results per page (default 20, max 100) |

```bash
# List all apps in the workspace
twentythree app list --json

# Filter to a specific app and paginate
twentythree app list --app-id 42 --page 1 --size 50 --json
```

### app add

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--name` | yes | App name |
| `--description` | no | App description |
| `--style` | no | App style identifier |
| `--type` | no | App type identifier |

```bash
# Create a minimal new app
twentythree app add --name "Brand Player" --json

# Create an app with full metadata
twentythree app add --name "Brand Player" --description "Custom branded embed player" --style clean --json
```

### app update

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Takes `<app-id>` as positional argument.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--name` | no | New app name |
| `--description` | no | New app description |
| `--style` | no | New app style identifier |

```bash
# Rename an existing app
twentythree app update 42 --name "Redesigned Player" --json

# Update description and style
twentythree app update 42 --description "Updated embed player" --style minimal --json
```

### app delete

**Auth scope:** write  **Side effects:** destructive  **Output:** key-value

Takes `<app-id>` as positional argument. No flags.

```bash
# Delete an app by ID
twentythree app delete 42 --json

# Check existing apps before deletion
twentythree app list --json
twentythree app delete 42 --json
```

### app set-thumbnail

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Takes `<file-path>` as positional argument. Uploads a custom thumbnail image for the app.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--app-id` | yes | App ID to update |

```bash
# Upload a PNG thumbnail for an app
twentythree app set-thumbnail ./thumbnail.png --app-id 42 --json

# Upload a JPEG thumbnail
twentythree app set-thumbnail ./thumb.jpg --app-id 42 --json
```

### app remove-thumbnail

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Takes `<app-id>` as positional argument. Reverts the app thumbnail to the platform default. No flags.

```bash
# Remove custom thumbnail and revert to default
twentythree app remove-thumbnail 42 --json

# Verify the app state after removal
twentythree app list --app-id 42 --json
```

## Common Patterns

### Upload and then remove a custom app thumbnail

```bash
# Step 1: List apps to find the target app ID
twentythree app list --json

# Step 2: Upload a custom thumbnail
twentythree app set-thumbnail ./brand-thumb.png --app-id <app-id> --json

# Step 3: Later, revert to the default thumbnail
twentythree app remove-thumbnail <app-id> --json
```

### Create an app and configure it

```bash
# Create the app
twentythree app add --name "Q2 Campaign Player" --description "Campaign branded player" --json
# => Returns { id: <app-id>, ... }

# Update style after reviewing available options
twentythree app update <app-id> --style minimal --json

# Attach a thumbnail
twentythree app set-thumbnail ./campaign-logo.png --app-id <app-id> --json
```
