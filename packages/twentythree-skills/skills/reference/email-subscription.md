---
name: email-subscription
description: Manage email subscriptions to new-video digests — list subscribers, subscribe an address with a digest frequency, and remove subscriptions.
---

# TwentyThree Email Subscription Commands

> Email subscriptions send subscribers a digest email when new videos are published on the workspace. Every example uses `--json` for machine-readable output.
> The API calls these `photo_subscription`s; the CLI topic is `email-subscription`.

## Prerequisites

Auth scope: **write** for all three commands (including `list`).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

The workspace must have email subscriptions enabled; otherwise the API answers `412 email_subscriptions_not_enabled`. That is a workspace setting, not something the CLI can turn on — tell the user.

> For any flag not listed here, run `twentythree email-subscription <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### email-subscription list

**Auth scope:** write  **Side effects:** none  **Output:** table (ID, Email, User, Scope, Frequency, Created)

Lists subscriptions newest first. Without `--page`/`--size` the command fetches every page. A subscription's **Scope** (`object_pretty`) says what it covers: the whole workspace, or one tag, category or uploading user — only workspace-wide subscriptions can be created from the CLI.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--email` | no | — | Only return subscriptions for this email address |
| `--user-id` | no | — | Only return subscriptions belonging to this user |
| `--page` | no | all pages | Page number |
| `--size` | no | 50 | Results per page (max 500) |
| `--fields` | no | — | Comma-separated list of fields to return |

```bash
# All subscriptions on the workspace
twentythree email-subscription list --json

# Is this address subscribed, and how often does it get the digest?
twentythree email-subscription list --email anna@example.com --json
```

The `--json` response is a list of objects with `photo_subscription_id`, `email`, `user_id`, `object_type`, `object_id`, `object_pretty`, `frequency` and `send_interval`.

---

### email-subscription add

**Auth scope:** write  **Side effects:** creates  **Output:** key-value (photo_subscription_id, email, object_pretty, frequency)

Subscribes an address to a digest of all new videos on the workspace. If the address already has a workspace-wide subscription it is **replaced**, so re-running with a new `--frequency` changes the frequency.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--email` | yes | — | Email address to subscribe |
| `--frequency` | no | `daily` | `instant`, `four_hours`, `twelve_hours`, `daily` or `weekly` |
| `--fields` | no | — | Comma-separated list of fields to return |

```bash
# Daily digest (default)
twentythree email-subscription add --email anna@example.com --json

# Weekly digest
twentythree email-subscription add --email anna@example.com --frequency weekly --json
```

Capture `data.photo_subscription_id` from the response — `remove` needs it.

---

### email-subscription remove

**Auth scope:** write  **Side effects:** destructive  **Output:** key-value

> **Warning: the subscriber stops receiving digests.** Look the ID up with `email-subscription list --email <address>` first; the command takes the `photo_subscription_id`, not the email address.

Pass `--yes` (or `--json`) to skip the confirmation prompt — without a terminal and without either flag the command exits 2 and asks for `--yes`.

```bash
# Find the subscription, then remove it
twentythree email-subscription list --email anna@example.com --json
twentythree email-subscription remove <photo_subscription_id> --yes --json
```

---

## Common Patterns

### Change how often someone receives the digest

```bash
# Adding again with a new frequency replaces the workspace-wide subscription
twentythree email-subscription add --email anna@example.com --frequency weekly --json
```

### Unsubscribe an address completely

```bash
# One address can hold several subscriptions (workspace, tag, category, user) — remove each ID
twentythree email-subscription list --email anna@example.com --json | jq -r '.data[].photo_subscription_id' \
  | xargs -I{} twentythree email-subscription remove {} --yes --json
```

## Terminology Notes

- `twentythree email-subscription list` -> `GET /email-subscription/list`
- `twentythree email-subscription add` -> `POST /email-subscription/add`
- `twentythree email-subscription remove` -> `POST /email-subscription/remove`
- The response field `photo_subscription_id` is the subscription ID (API `photo` = CLI `video`).
