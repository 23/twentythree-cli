---
name: site
description: Query workspace-level information (domain, quotas) and run cross-content search.
---

# TwentyThree Site Commands

> Retrieve workspace-level configuration and run cross-content search across videos, webinars,
> and categories in a single call. Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: read (both commands).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree site <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### site get

**Auth scope:** read  **Side effects:** none  **Output:** key-value

Returns workspace-level configuration including domain, settings, and optional quota and
presentation data. Use `--include-quota` to check storage and bandwidth usage.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--include-presentation` | no | Include presentation settings in the response |
| `--include-quota` | no | Include quota (storage and bandwidth) information in the response |

```bash
# Get basic workspace info
twentythree site get --json

# Get workspace info including quotas and presentation settings
twentythree site get --include-presentation --include-quota --json
```

### site search

**Auth scope:** read  **Side effects:** none  **Output:** table (Type, Title, ID)

Searches across all content types (videos, webinars, categories) in the workspace in a single
call. Returns a mixed result set with a `Type` column identifying each result's content type.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--search` | no | Search query string |
| `--search-in` | no | Scope the search field: `title`, `description`, or `tags` (repeatable) |
| `--selection` | no | Filter by content selection |
| `--size` | no | Number of results to return |

```bash
# Search all content types for a keyword
twentythree site search --search "product demo" --json

# Scoped search: title and tags only, with result limit
twentythree site search --search "q2" --search-in title --search-in tags --size 20 --json
```

## Common Patterns

### Workspace health check

```bash
# Check workspace status and quota usage in one call
twentythree site get --include-quota --json
```

### Cross-content discovery in one call

```bash
# Find all content (videos + webinars + categories) matching a term
twentythree site search --search "onboarding" --json

# Refine to title matches only, returning up to 50 results
twentythree site search --search "onboarding" --search-in title --size 50 --json
```

### Review workspace configuration before bulk operations

```bash
# Inspect full workspace settings including presentation config
twentythree site get --include-presentation --include-quota --json

# Search for content to confirm what is available
twentythree site search --search "webinar" --json
```
