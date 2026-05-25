---
name: poll
description: Create and manage in-webinar polls (questions with answer options shown to live viewers).
---

# TwentyThree Poll Commands

> Create, configure, and manage interactive polls shown to live webinar viewers.
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: anonymous (list, answer), write (add, update, remove, set-options).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> Polls are attached to webinars (live objects) via `--object-id`. Always pass the webinar ID as `--object-id`.
> For any flag not listed here, run `twentythree poll <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### poll list

**Auth scope:** anonymous  **Side effects:** none  **Output:** table (ID, Question, Open, Results Visible)

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--object-id` | yes | — | Object ID (webinar or live object) |
| `--object-token` | no | — | Object token (auto-looked up if omitted) |
| `--poll-id` | no | — | Limit results to a single poll by its ID |
| `--open` | no | — | Filter by open/closed status (use `--no-open` for closed) |
| `--public` | no | — | Filter by public/non-public status (use `--no-public` for non-public) |
| `--display-results` | no | — | Filter to polls with publicly displayed results (use `--no-display-results` to negate) |
| `--fields` | no | — | Comma-separated list of fields to return in the API response |

```bash
# List all polls for a webinar
twentythree poll list --object-id <webinar-id> --json

# List only open polls
twentythree poll list --object-id <webinar-id> --open --json

# Get a specific poll by ID
twentythree poll list --object-id <webinar-id> --poll-id <poll-id> --json

# List public polls with results displayed
twentythree poll list --object-id <webinar-id> --public --display-results --json
```

### poll add

**Auth scope:** write  **Side effects:** creates  **Output:** none

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | yes | Object ID (webinar or live object) |
| `--question` | no | Poll question text |

```bash
# Create a new poll for a webinar
twentythree poll add --object-id <webinar-id> --question "What is your role?" --json

# Create a poll without a question (set it later with update)
twentythree poll add --object-id <webinar-id> --json
```

### poll update

**Auth scope:** write  **Side effects:** updates  **Output:** none

Takes `<poll-id>` as positional argument.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--question` | no | Updated poll question text |
| `--open` | no | Open or close the poll (boolean) |
| `--display-results` | no | Show or hide results to viewers (boolean) |

```bash
# Open a poll for voting
twentythree poll update <poll-id> --open --json

# Close the poll and display results to viewers
twentythree poll update <poll-id> --no-open --display-results --json
```

### poll remove

**Auth scope:** write  **Side effects:** destructive  **Output:** none

Takes `<poll-id>` as positional argument. No additional flags.

```bash
# Delete a poll from a webinar
twentythree poll remove <poll-id> --json

# Remove a poll that is no longer needed
twentythree poll remove <poll-id> --json
```

### poll answer

**Auth scope:** anonymous  **Side effects:** creates  **Output:** none

Takes `<poll-id>` as positional argument. Submits a viewer's answer to a poll.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | no | Object ID (webinar or live object) |
| `--object-token` | no | Object token (auto-looked up if omitted) |
| `--option-id` | no | Poll option ID to vote for |

```bash
# Submit a poll answer by option ID
twentythree poll answer <poll-id> --object-id <webinar-id> --option-id <option-id> --json

# Answer with an object token
twentythree poll answer <poll-id> --object-id <webinar-id> --object-token <token> --option-id <option-id> --json
```

### poll set-options

**Auth scope:** write  **Side effects:** updates  **Output:** none

Takes `<poll-id>` as positional argument. Use `--option` repeatedly to set multiple options.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--option` | no | Poll option text (repeat flag for multiple options) |

```bash
# Set two options on a poll
twentythree poll set-options <poll-id> --option "Yes" --option "No" --json

# Set multiple options
twentythree poll set-options <poll-id> --option "Option A" --option "Option B" --option "Option C" --json
```

## Common Patterns

### Create a poll with options and open it for voting

```bash
# Step 1: Create the poll for a webinar
twentythree poll add --object-id <webinar-id> --question "Which feature matters most?" --json

# Step 2: Set the answer options using the poll ID from step 1
twentythree poll set-options <poll-id> --option "Performance" --option "Ease of Use" --option "Integrations" --json

# Step 3: Open the poll so viewers can vote
twentythree poll update <poll-id> --open --json

# Step 4: Close the poll and display results at the end
twentythree poll update <poll-id> --no-open --display-results --json
```

### Review existing polls on a webinar

```bash
# List all polls and their current state
twentythree poll list --object-id <webinar-id> --json

# Open a previously closed poll again
twentythree poll update <poll-id> --open --json
```

### Update a poll question before opening

```bash
# Change the question text before opening to viewers
twentythree poll update <poll-id> --question "Updated: Which feature is most important?" --json

# Then open for voting
twentythree poll update <poll-id> --open --json
```
