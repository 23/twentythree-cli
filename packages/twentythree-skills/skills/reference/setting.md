---
name: setting
description: Update workspace settings via key=value pairs with optional dry-run validation.
---

# TwentyThree Setting Commands

> Update workspace configuration settings as key=value pairs.
> Setting keys are workspace-specific. Check the workspace admin UI for the list of valid keys.
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: write.
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree setting update --agent` to get the complete flag list, types, and defaults.

## Commands

### setting update

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Updates one or more workspace settings as key=value pairs. The `--set` flag is repeatable —
pass it multiple times to update several settings in a single call.

Use `--validate-only` to perform a dry-run and verify that the key=value pairs are accepted
before actually applying them. This is especially useful when updating multiple settings.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--set` | no | Setting key=value pair (repeatable) |
| `--validate-only` | no | Dry-run: validate settings without applying changes |

```bash
# Update a single setting
twentythree setting update --set site_name="My Workspace" --json

# Update multiple settings in one call
twentythree setting update --set theme=dark --set language=en --json

# Dry-run: validate before applying
twentythree setting update --set site_name="Test" --validate-only --json
```

## Common Patterns

### Dry-run a setting change before applying

```bash
# Step 1: Validate the change (no write to the workspace)
twentythree setting update --set branding_color="#ff0000" --validate-only --json

# Step 2: If validation passes, apply the change for real
twentythree setting update --set branding_color="#ff0000" --json
```

### Apply multiple settings atomically

```bash
# All settings applied in a single API call
twentythree setting update \
  --set site_name="Brand Workspace" \
  --set language=en \
  --set timezone=UTC \
  --json
```

### Validate a multi-key update before committing

```bash
# Step 1: Validate all keys together
twentythree setting update \
  --set key1=val1 \
  --set key2=val2 \
  --set key3=val3 \
  --validate-only \
  --json

# Step 2: Review validation response, then apply if OK
twentythree setting update \
  --set key1=val1 \
  --set key2=val2 \
  --set key3=val3 \
  --json
```

### Timezone and locale configuration

```bash
# Set workspace timezone
twentythree setting update --set timezone=Europe/Copenhagen --json

# Set workspace language
twentythree setting update --set language=da --json

# Set both together with a dry-run check first
twentythree setting update --set timezone=Europe/Copenhagen --set language=da --validate-only --json
twentythree setting update --set timezone=Europe/Copenhagen --set language=da --json
```

### Branding and appearance settings

```bash
# Update the workspace site name shown in the embed player
twentythree setting update --set site_name="Company Video Hub" --json

# Validate a logo URL before applying
twentythree setting update --set logo_url="https://cdn.example.com/logo.png" --validate-only --json
twentythree setting update --set logo_url="https://cdn.example.com/logo.png" --json
```
