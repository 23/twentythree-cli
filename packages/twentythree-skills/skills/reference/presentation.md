---
name: presentation
description: Workspace-level presentation and embed settings (link locations and setting CRUD).
---

# TwentyThree Presentation Commands

> Manage workspace-level presentation and embed configuration.
> There is no CRUD for presentation objects — these commands manage workspace-level settings only.
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: read (page link-locations, setting list), write (setting update).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree presentation <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### presentation page link-locations

**Auth scope:** read  **Side effects:** none  **Output:** table (Link Location, Label)

Lists valid link location identifiers for presentation pages. No flags required.
Use this to discover accepted values before authoring presentation content.

```bash
# Discover all available link locations
twentythree presentation page link-locations --json

# Use in a script to inspect available values
twentythree presentation page link-locations --json
```

### presentation setting list

**Auth scope:** read  **Side effects:** none  **Output:** key-value

Lists all current workspace presentation settings as key-value pairs. No flags required.
Use this to review current configuration before making updates.

```bash
# List all current presentation settings
twentythree presentation setting list --json

# Inspect settings before planning updates
twentythree presentation setting list --json
```

### presentation setting update

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Updates one or more workspace presentation settings. The `--set` flag is repeatable — pass it
multiple times to update several settings in a single call.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--set` | no | Setting key=value pair (repeatable) |

```bash
# Update the site name
twentythree presentation setting update --set site_name="My Brand" --json

# Update multiple settings atomically
twentythree presentation setting update \
  --set site_name="My Brand" \
  --set logo_url="https://example.com/logo.png" \
  --json
```

## Common Patterns

### Discover link locations before authoring content

```bash
# Step 1: List available link locations to know accepted values
twentythree presentation page link-locations --json

# Step 2: Review current presentation settings
twentythree presentation setting list --json

# Step 3: Update relevant settings
twentythree presentation setting update --set site_name="Updated Brand" --json
```

### Update multiple presentation settings atomically

```bash
# Apply several settings in one command call
twentythree presentation setting update \
  --set site_name="Q2 Campaign" \
  --set logo_url="https://assets.example.com/logo-q2.png" \
  --json
```
