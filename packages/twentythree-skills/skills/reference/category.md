---
name: category
description: Organise videos and webinars into collections (categories). API name: album.
---

# TwentyThree Category Commands

> List, create, update, and delete content categories (collections of videos and webinars).
> Always use `--json` in agentic contexts for structured output.

> Category is the CLI name; the API uses `album`. No `category get` command exists — use `category list` with a search term or ID filter to retrieve details.

## Prerequisites

Auth scope required: anonymous (list), write (create, update, delete).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

Category `list` does not require auth — it works before running `twentythree auth credentials`. All other category commands require a `write` token.

> For any flag not listed here, run `twentythree category <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### category list

**Auth scope:** anonymous  **Side effects:** none  **Output:** table (ID, Title, Hidden, Created)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--include-hidden` | no | Include hidden categories in the results |

```bash
# List all visible categories
twentythree category list --json

# Include hidden categories
twentythree category list --include-hidden --json
```

### category create

**Auth scope:** write  **Side effects:** creates  **Output:** none

> **Note:** The API returns `output_shape: none` for category create — no ID is returned in the response. To find the newly created category, re-run `category list --json` and filter by title.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--title` | yes | Title for the new category |
| `--description` | no | Description for the new category |
| `--hidden` | no | Create as hidden category (boolean) |

```bash
# Create a visible category
twentythree category create --title "Q2 Demos" --json

# Create a hidden category with description
twentythree category create --title "Internal Videos" --description "For internal team only" --hidden --json
```

### category update

**Auth scope:** write  **Side effects:** updates  **Output:** none

Takes `<category-id>` as positional argument.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--title` | no | New title for the category |
| `--description` | no | New description for the category |
| `--hidden` | no | Show or hide the category (boolean) |

```bash
# Update a category title
twentythree category update <category-id> --title "Q2 Product Demos" --json

# Hide an existing category
twentythree category update <category-id> --hidden --json
```

### category delete

**Auth scope:** write  **Side effects:** destructive  **Output:** none

Takes `<category-id>` as positional argument. No additional flags.

```bash
# Delete a category
twentythree category delete <category-id> --json

# Delete a category you no longer need
twentythree category delete <category-id> --json
```

## Common Patterns

### Create a category and look it up

Because `category create` returns no ID, re-query after creation:

```bash
# Step 1: Create the category
twentythree category create --title "Q2 Demos" --description "Demo videos for Q2" --json

# Step 2: Find the newly created category by title
twentythree category list --json
```

### List hidden categories

```bash
twentythree category list --include-hidden --json
```

## Terminology Notes

CLI `category` = API `album`. The `api_endpoint` field in `--agent` output uses the API name (e.g. `GET /album/list`, `POST /album/create`). When debugging API responses or reading the raw OpenAPI spec, look for `/album/*` paths.
