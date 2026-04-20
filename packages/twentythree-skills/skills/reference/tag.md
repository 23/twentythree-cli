---
name: tag
description: List and discover content tags. Tags are created implicitly via video update --tags.
---

# TwentyThree Tag Commands

> Discover and explore content tags on TwentyThree. The tag topic is read-only — tags are created
> implicitly when applied to videos. Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: anonymous (both commands — no auth token required).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree tag <cmd> --agent` to get the complete flag list, types, and defaults.

> **Note:** To add or remove tags from content, use `video update --tags` or `webinar update --tags`. The `tag` topic itself is read-only.

## Commands

### tag list

**Auth scope:** anonymous  **Side effects:** none  **Output:** table (Tag, Count)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--search` | no | Filter tags by a search string |
| `--exclude-machine-tags` | no | Exclude machine-generated tags from the results |
| `--only-machine-tags` | no | Return only machine tags (overrides --exclude-machine-tags) |
| `--only-published` | no | Return only tags from published videos |
| `--orderby` | no | Order tags by this value |
| `--order` | no | Sort order for the results |

```bash
# List all tags in the workspace
twentythree tag list --json

# Find tags matching a search term, ordered by usage count
twentythree tag list --search "product" --orderby count --order desc --json
```

### tag related

**Auth scope:** anonymous  **Side effects:** none  **Output:** table (Tag)

Takes `<tag>` as a positional argument. No additional flags.

```bash
# Discover tags related to a specific tag
twentythree tag related "product" --json

# Find tags related to a topic for content discovery
twentythree tag related "webinar" --json
```

## Common Patterns

### Content discovery by tag

```bash
# Step 1: Find tags that match a topic
twentythree tag list --search "onboarding" --only-published --json

# Step 2: Explore related tags to broaden content discovery
twentythree tag related "onboarding" --json

# Step 3: Use found tags to filter video search via video list
twentythree video list --json | jq '.[] | select(.tags | contains("onboarding"))'
```

### Audit all tags in the workspace

```bash
# List all tags sorted by usage count (most used first)
twentythree tag list --orderby count --order desc --json

# List only human-authored tags (exclude machine-generated)
twentythree tag list --exclude-machine-tags --orderby count --order desc --json
```

### Apply tags to a video (write operation — not a tag command)

```bash
# Tags are managed via video update, not the tag topic
twentythree video update <video-id> --tags "product demo tutorial" --json

# Then verify the tags were applied
twentythree tag list --search "demo" --only-published --json
```
