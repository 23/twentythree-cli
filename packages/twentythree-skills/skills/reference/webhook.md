---
name: webhook
description: Subscribe to and manage TwentyThree platform event webhooks (video uploads, webinar events, recording completions, etc.)
---

# TwentyThree Webhook Commands

> Webhooks deliver platform events (video upload complete, webinar started, recording finished, etc.) to a URL you control.
> Every example uses `--json` for machine-readable output.

## Prerequisites

Auth scope varies: **read** (list, events, sample), **write** (subscribe, unsubscribe).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree webhook <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### webhook list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Event, Target URL)

No additional flags.

```bash
# List all webhook subscriptions for the workspace
twentythree webhook list --json

# Review subscriptions before adding or removing
twentythree webhook list --json
```

---

### webhook subscribe

**Auth scope:** write  **Side effects:** creates  **Output:** key-value (webhook_id)

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--target-url` | yes | — | URL to receive webhook POST requests |
| `--event` | yes | — | Event type to subscribe to (use `webhook events` to discover) |

```bash
# Subscribe to video upload events
twentythree webhook subscribe --event video.uploaded --target-url https://example.com/hook --json

# Subscribe to a webinar started event discovered via webhook events
twentythree webhook subscribe --event webinar.started --target-url https://example.com/hook --json
```

---

### webhook unsubscribe

**Auth scope:** write  **Side effects:** destructive  **Output:** key-value

> **Warning: This action removes the webhook subscription.** The target URL will stop receiving events for the specified webhook. Use `webhook list` to confirm the correct subscription ID before unsubscribing.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--webhook-id` | no | — | Webhook subscription ID (at least one of `--webhook-id` or `--target-url` required) |
| `--target-url` | no | — | Target URL to unsubscribe (at least one of `--webhook-id` or `--target-url` required) |

```bash
# Unsubscribe by webhook ID
twentythree webhook unsubscribe --webhook-id 12345 --json

# Unsubscribe by target URL (removes all subscriptions pointing to that URL)
twentythree webhook unsubscribe --target-url https://example.com/hook --json
```

---

### webhook events

**Auth scope:** read  **Side effects:** none  **Output:** table (Event)

Lists all available webhook event types. Use this to discover valid event names before subscribing. Pass `--test-authentication` to include test authentication events.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--test-authentication` | no | false | Include test authentication events |

```bash
# List all available webhook event types
twentythree webhook events --json

# Include test authentication events to validate workspace credentials
twentythree webhook events --test-authentication --json
```

---

### webhook sample

**Auth scope:** read  **Side effects:** none  **Output:** key-value

Returns a sample JSON payload for the given event type. Useful for consumer-side schema validation before subscribing. Pass the event name as a positional argument.

No additional flags — pass the event name as a positional argument.

```bash
# Get a sample payload for video.uploaded events
twentythree webhook sample video.uploaded --json

# Redirect sample payload to a file for schema inference
twentythree webhook sample video.uploaded --json > sample-video-uploaded.json
```

---

## Common Patterns

### Discover-then-subscribe (canonical flow)

```bash
# 1. Discover available events
twentythree webhook events --json

# 2. Inspect a sample payload for one event
twentythree webhook sample video.uploaded --json

# 3. Subscribe
twentythree webhook subscribe --event video.uploaded --target-url https://example.com/hook --json
```

### Audit and clean up stale subscriptions

```bash
# List all current webhook subscriptions
twentythree webhook list --json

# Remove a stale subscription by ID
twentythree webhook unsubscribe --webhook-id <id> --json

# Or remove all subscriptions pointing to a decommissioned endpoint
twentythree webhook unsubscribe --target-url https://old-endpoint.example.com/hook --json
```

### Test authentication before subscribing

```bash
# Confirm workspace credentials are valid for webhook subscription
twentythree webhook events --test-authentication --json

# If authentication passes, proceed with subscription
twentythree webhook subscribe --event webinar.started --target-url https://example.com/hook --json
```
