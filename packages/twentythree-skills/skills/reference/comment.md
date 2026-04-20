---
name: comment
description: Moderate and manage comments, questions, and chat on videos, categories, and webinars.
---

# TwentyThree Comment Commands

> List, moderate, and manage comments, questions, and chat messages on TwentyThree content.
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: read (list), write (add, update, delete, promote, clone, set-order, reaction add).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree comment <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### comment list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Author, Content, Type, Date)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | no | Filter by object ID |
| `--object-type` | no | Filter by object type (photo, album) |
| `--comment-type` | no | Filter by comment type (comment, question, chat) |
| `--search` | no | Search comments by content |
| `--order` | no | Sort order for results |
| `--include-reactions` | no | Include reactions on each comment |
| `--include-replies` | no | Include reply-to comments |
| `--promoted` | no | Filter to promoted comments only |

```bash
# List all comments in the workspace
twentythree comment list --json

# List only questions on a specific webinar
twentythree comment list --object-id <webinar-id> --object-type live --comment-type question --json
```

### comment add

**Auth scope:** write  **Side effects:** creates  **Output:** none

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | yes | Object ID to comment on |
| `--object-type` | yes | Object type (photo, album, live) |
| `--content` | no | Comment text content |
| `--name` | no | Author name for the comment |
| `--email` | no | Author email for the comment |
| `--url` | no | URL associated with the comment |
| `--comment-type` | no | Comment type (comment, question, chat) |
| `--reply-to` | no | Comment ID to reply to |
| `--comment-time` | no | Timestamp for the comment |
| `--object-token` | no | Object token for the target object |

```bash
# Add a comment to a video
twentythree comment add --object-id <video-id> --object-type photo --content "Great video!" --json

# Add a question to a webinar chat
twentythree comment add --object-id <webinar-id> --object-type live --content "What is next?" --comment-type question --json
```

### comment update

**Auth scope:** write  **Side effects:** updates  **Output:** none

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | yes | Object ID the comment belongs to |
| `--status` | no | Comment status (answered, dismissed, or empty to clear) |

```bash
# Mark a question as answered
twentythree comment update <comment-id> --object-id <webinar-id> --status answered --json

# Dismiss an inappropriate comment
twentythree comment update <comment-id> --object-id <video-id> --status dismissed --json
```

### comment delete

**Auth scope:** write  **Side effects:** destructive  **Output:** none

Takes `<comment-id>` as positional argument. No additional flags.

```bash
# Delete a comment
twentythree comment delete <comment-id> --json

# Delete a question from a webinar
twentythree comment delete <comment-id> --json
```

### comment promote

**Auth scope:** write  **Side effects:** updates  **Output:** none

Takes `<comment-id>` as positional argument. Toggles promoted status if `--promoted` is omitted.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--promoted` | no | Set promoted status explicitly (omit to toggle) |

```bash
# Promote a comment (toggle on)
twentythree comment promote <comment-id> --json

# Explicitly set promoted status to true
twentythree comment promote <comment-id> --promoted --json
```

### comment clone

**Auth scope:** write  **Side effects:** creates  **Output:** none

Takes `<comment-id>` as positional argument. Clones the comment, optionally changing its type.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--clone-type` | no | Type for the cloned comment (chat, question, comment) |

```bash
# Clone a comment as-is
twentythree comment clone <comment-id> --json

# Clone a comment and set it as a question type
twentythree comment clone <comment-id> --clone-type question --json
```

### comment set-order

**Auth scope:** write  **Side effects:** updates  **Output:** none

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | yes | Object ID whose comments are being reordered |
| `--order` | yes | Comma-separated list of comment IDs in desired display order |
| `--comment-type` | no | Comment type to reorder (default: question) |

```bash
# Reorder questions on a webinar
twentythree comment set-order --object-id <webinar-id> --order "<id1>,<id2>,<id3>" --json

# Reorder only chat-type comments
twentythree comment set-order --object-id <webinar-id> --order "<id1>,<id2>" --comment-type chat --json
```

## Subtopic: comment reaction

### comment reaction add

**Auth scope:** write  **Side effects:** creates  **Output:** none

Takes `<comment-id>` as positional argument.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--reaction` | yes | Reaction emoji to add |
| `--object-id` | yes | Object ID the comment belongs to |
| `--object-token` | yes | Object token for the target object |
| `--object-type` | no | Object type (live, photo, album) |
| `--uuid` | no | UUID identifier |

```bash
# Add a thumbs-up reaction to a comment
twentythree comment reaction add <comment-id> --object-id <webinar-id> --object-token <token> --reaction "👍" --json

# Add a heart reaction to a video comment
twentythree comment reaction add <comment-id> --object-id <video-id> --object-token <token> --reaction "❤️" --object-type photo --json
```

## Common Patterns

### Moderate webinar Q&A session

```bash
# List all questions from a webinar
twentythree comment list --object-id <webinar-id> --object-type live --comment-type question --json

# Promote an important question for visibility
twentythree comment promote <question-id> --json

# Mark a question as answered after responding
twentythree comment update <question-id> --object-id <webinar-id> --status answered --json
```

### Reorder promoted questions for display

```bash
# Step 1: List promoted questions to get their IDs
twentythree comment list --object-id <webinar-id> --object-type live --comment-type question --promoted --json

# Step 2: Set the display order using captured IDs
twentythree comment set-order --object-id <webinar-id> --order "<id1>,<id2>,<id3>" --comment-type question --json
```

## Terminology Notes

The `--object-type` flag uses the legacy API object names:
- pass `photo` for a video
- pass `album` for a category
- pass `live` for a webinar

This is the only place in the `comment` topic where terminology diverges from CLI naming.
The `api_endpoint` field in `--agent` output also uses these legacy names (e.g. `GET /comment/list`).
