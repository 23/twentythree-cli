---
name: collector
description: Attach and remove lead-capture collectors (forms) on videos and webinars.
---

# TwentyThree Collector Commands

> Attach and manage lead-capture forms (collectors) on videos and webinars.
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: read (list), write (include, exclude).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree collector <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### collector list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Name, Type)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | no | Filter collectors by object (video/webinar) ID |
| `--include-analytics` | no | Include analytics data for each collector |

```bash
# List all collectors in the workspace
twentythree collector list --json

# List collectors attached to a specific video
twentythree collector list --object-id <video-id> --json
```

### collector include

**Auth scope:** write  **Side effects:** creates  **Output:** none

Attaches a collector to a video or webinar. Takes `<collector-id>` as positional argument.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | yes | ID of the video or webinar to attach the collector to |

```bash
# Attach a collector to a video
twentythree collector include <collector-id> --object-id <video-id> --json

# Attach a collector to a webinar
twentythree collector include <collector-id> --object-id <webinar-id> --json
```

### collector exclude

**Auth scope:** write  **Side effects:** updates  **Output:** none

Blocks a collector from appearing on a video or webinar. Takes `<collector-id>` as positional argument.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | yes | ID of the video or webinar to block the collector from |

```bash
# Block a collector from a specific video
twentythree collector exclude <collector-id> --object-id <video-id> --json

# Block a collector from a webinar
twentythree collector exclude <collector-id> --object-id <webinar-id> --json
```

## Common Patterns

### Attach a lead-capture form to a video

```bash
# Step 1: Find available collectors and their IDs
twentythree collector list --json

# Step 2: Attach the chosen collector to the target video
twentythree collector include <collector-id> --object-id <video-id> --json

# Step 3: Verify the collector is now attached
twentythree collector list --object-id <video-id> --json
```

### Review collector analytics and then remove from a video

```bash
# Check which collectors are on a video, including analytics
twentythree collector list --object-id <video-id> --include-analytics --json

# Remove a collector that is no longer needed on this video
twentythree collector exclude <collector-id> --object-id <video-id> --json
```
