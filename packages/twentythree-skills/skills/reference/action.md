---
name: action
description: Manage calls-to-action (CTAs) and interactive overlays on videos and webinars.
---

# TwentyThree Action Commands

> Attach, configure, and manage interactive CTA overlays on video and webinar timelines.
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: read (list, get, types), write (add, update, delete, exclude, include, upload).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree action <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### action list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Name, Type, Start, End)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | no | Object ID to filter actions by |
| `--video-id` | no | Video ID to filter actions by (maps to photo_id) |
| `--webinar-id` | no | Webinar ID to filter actions by (maps to live_id) |
| `--player-id` | no | Player ID to filter actions by |
| `--exclude-internal` | no | Exclude internal actions |
| `--exclude-pending` | no | Exclude pending actions |
| `--exclude-items` | no | Exclude action items |

```bash
# List all actions in the workspace
twentythree action list --json

# List actions for a specific video
twentythree action list --video-id <video-id> --json
```

### action add

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--type` | yes | Action type (use `action types` to list valid values) |
| `--object-id` | yes | Object ID (video or webinar) to attach the action to |
| `--fields` | no | Additional fields for the action (key=value pairs) |

```bash
# Add a basic CTA action to a video
twentythree action add --type overlay --object-id <video-id> --json

# Add a CTA with custom field values
twentythree action add --type overlay --object-id <video-id> --fields "title=Buy Now" --json
```

### action get

**Auth scope:** read  **Side effects:** none  **Output:** key-value

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | no | Object ID context |
| `--video-id` | no | Video ID context (maps to photo_id) |
| `--webinar-id` | no | Webinar ID context (maps to live_id) |
| `--token` | no | Object token for authentication |
| `--player-id` | no | Player ID context |
| `--exclude-internal` | no | Exclude internal actions |
| `--exclude-pending` | no | Exclude pending actions |
| `--exclude-items` | no | Exclude action items |

```bash
# Get details of a specific action by ID
twentythree action get <action-id> --json

# Get action in the context of a video
twentythree action get <action-id> --video-id <video-id> --json
```

### action update

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--name` | yes | Display name for the action |
| `--start-time` | yes | Start time of the action (seconds) |
| `--end-time` | yes | End time of the action (seconds) |
| `--time-relative-to` | no | What the timing is relative to (default: duration) |
| `--return-url` | no | Return URL for the action |

```bash
# Update action timing and name
twentythree action update <action-id> --name "Buy Now" --start-time 10 --end-time 20 --json

# Update action with a click-through URL
twentythree action update <action-id> --name "Learn More" --start-time 30 --end-time 60 --return-url "https://example.com" --json
```

### action delete

**Auth scope:** write  **Side effects:** destructive  **Output:** key-value

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| (none) | — | Takes action ID as positional argument |

```bash
# Delete a CTA action
twentythree action delete <action-id> --json

# Delete with confirmation
twentythree action delete <action-id> --json
```

### action types

**Auth scope:** read  **Side effects:** none  **Output:** table (Type, Name / Description)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--exclude-internal` | no | Exclude internal action types from the list |

```bash
# List all available action types
twentythree action types --json

# List only public action types (excluding internal)
twentythree action types --exclude-internal --json
```

### action exclude

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | yes | Object ID to exclude the action from |
| `--undo` | no | Remove the exclusion (reverse this operation) |

```bash
# Exclude a CTA from a specific video
twentythree action exclude <action-id> --object-id <video-id> --json

# Undo the exclusion (re-enable the action on the video)
twentythree action exclude <action-id> --object-id <video-id> --undo --json
```

### action include

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | yes | Object ID to include the action on |
| `--undo` | no | Remove the inclusion (reverse this operation) |

```bash
# Include an action on a specific video
twentythree action include <action-id> --object-id <video-id> --json

# Undo the inclusion
twentythree action include <action-id> --object-id <video-id> --undo --json
```

### action upload

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

Takes positional arguments: `<action-id> <variable> <file>` — no additional flags.

```bash
# Upload a banner image to an action's image variable
twentythree action upload <action-id> image ./banner.png --json

# Upload a video clip to an action's video variable
twentythree action upload <action-id> video ./clip.mp4 --json
```

## Common Patterns

### Discover types, create, and configure an action

```bash
# Step 1: List available action types to find a valid type value
twentythree action types --exclude-internal --json

# Step 2: Add the action to a video using the chosen type
twentythree action add --type <type> --object-id <video-id> --fields "title=Click Here" --json

# Step 3: Update the timing on the newly created action
twentythree action update <action-id> --name "Click Here" --start-time 15 --end-time 45 --json
```

### Suppress a global CTA on a specific video

```bash
# List actions to find the global action ID
twentythree action list --json

# Exclude that action from the video where it should not appear
twentythree action exclude <action-id> --object-id <video-id> --json
```

### Upload a custom image to an overlay action

```bash
# First add the action
twentythree action add --type overlay --object-id <video-id> --json

# Then upload the image file to the action variable
twentythree action upload <action-id> image ./custom-banner.png --json
```
