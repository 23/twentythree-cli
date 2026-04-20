---
name: spot
description: Create and manage embeddable video widgets (spots) that reference one or more videos.
---

# TwentyThree Spot Commands

> Create and manage spots — embeddable video widgets that display curated sets of videos.
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: read (list, check), write (create, update, delete, set-videos, reset-version).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> Use `spot check <id>` rather than `spot get` — there is no `spot get` command.
> For any flag not listed here, run `twentythree spot <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### spot list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Name, Type, Active)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--page` | no | Page number |
| `--size` | no | Number of results per page |
| `--search` | no | Search term |
| `--spot-type` | no | Filter by spot type |
| `--active` | no | Filter by active status (boolean) |
| `--orderby` | no | Field to order results by |
| `--order` | no | Sort order (asc or desc) |

```bash
# List all spots in the workspace
twentythree spot list --json

# List only active spots
twentythree spot list --active --json
```

### spot create

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--spot-name` | yes | Name for the new spot |
| `--spot-type` | no | Type of spot |
| `--spot-design` | no | Design for the spot |
| `--spot-layout` | no | Layout for the spot |

```bash
# Create a basic spot
twentythree spot create --spot-name "Homepage Widget" --json

# Create a spot with type and layout specified
twentythree spot create --spot-name "Featured Videos" --spot-type video --spot-layout grid --json
```

### spot check

**Auth scope:** read  **Side effects:** none  **Output:** key-value

Takes `<spot-id>` as positional argument. Use this to retrieve spot details — there is no `spot get` command.

No additional flags.

```bash
# Get details of a specific spot
twentythree spot check <spot-id> --json

# Inspect a spot before updating it
twentythree spot check <spot-id> --json
```

### spot update

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Takes `<spot-id>` as positional argument.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--spot-name` | no | New name for the spot |
| `--active` | no | Set active status (boolean) |

```bash
# Rename a spot
twentythree spot update <spot-id> --spot-name "Updated Widget Name" --json

# Deactivate a spot
twentythree spot update <spot-id> --no-active --json
```

### spot delete

**Auth scope:** write  **Side effects:** destructive  **Output:** key-value

Takes `<spot-id>` as positional argument. No additional flags.

```bash
# Delete a spot
twentythree spot delete <spot-id> --json

# Delete a spot that is no longer in use
twentythree spot delete <spot-id> --json
```

### spot set-videos

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Takes `<spot-id>` as positional argument. Assigns the video playlist shown in the spot.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--videos` | yes | Comma-separated video IDs to assign to the spot |

```bash
# Assign a single video to a spot
twentythree spot set-videos <spot-id> --videos "<video-id>" --json

# Assign multiple videos to a spot
twentythree spot set-videos <spot-id> --videos "<video-id-1>,<video-id-2>,<video-id-3>" --json
```

### spot reset-version

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Takes `<spot-id>` as positional argument. Resets the spot to its initial version state. No additional flags.

```bash
# Reset a spot's version
twentythree spot reset-version <spot-id> --json

# Use after a spot update goes wrong to restore default state
twentythree spot reset-version <spot-id> --json
```

## Common Patterns

### Create a spot and attach videos

```bash
# Step 1: Create the spot
twentythree spot create --spot-name "Homepage Videos" --json

# Step 2: Assign videos to the spot using the ID from step 1
twentythree spot set-videos <spot-id> --videos "<video-id-1>,<video-id-2>,<video-id-3>" --json

# Step 3: Verify the spot configuration
twentythree spot check <spot-id> --json
```

### Find and inspect active spots

```bash
# List only active spots
twentythree spot list --active --json

# Get full details of a specific spot
twentythree spot check <spot-id> --json
```

### Update a spot's video playlist

```bash
# Get current spot details to see existing video assignment
twentythree spot check <spot-id> --json

# Replace the video playlist with a new set
twentythree spot set-videos <spot-id> --videos "<new-video-id-1>,<new-video-id-2>" --json

# Activate the spot if it was inactive
twentythree spot update <spot-id> --active --json
```
