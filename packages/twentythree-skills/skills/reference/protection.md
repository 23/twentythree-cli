---
name: protection
description: Apply and verify access protection (password/SSO/token) on videos and webinars.
---

# TwentyThree Protection Commands

> Apply, remove, and verify access protection on videos and webinars.
> Supported protection methods: `password`, `sso`, `token`.
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: write (protect, unprotect), read (verify).
Valid `--protection-method` values: `password`, `sso`, `token`.
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree protection <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### protection protect

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

Applies protection to a video or webinar. Specify the method with `--protection-method`.
The optional `--grace-minutes` flag delays protection activation to allow existing sessions to continue.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--protection-method` | yes | Protection method: `password`, `sso`, or `token` |
| `--object-id` | no | ID of the video or webinar to protect |
| `--grace-minutes` | no | Grace period in minutes before protection activates |

```bash
# Protect a video with password, allowing a 10-minute grace period
twentythree protection protect --protection-method password \
  --object-id <video-id> --grace-minutes 10 --json

# Apply SSO protection to a webinar
twentythree protection protect --protection-method sso \
  --object-id <webinar-id> --json
```

### protection unprotect

**Auth scope:** write  **Side effects:** destructive  **Output:** key-value

Removes protection from a video or webinar.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | no | ID of the video or webinar to unprotect |

```bash
# Remove protection from a specific video
twentythree protection unprotect --object-id <video-id> --json

# Remove protection from a webinar
twentythree protection unprotect --object-id <webinar-id> --json
```

### protection verify

**Auth scope:** read  **Side effects:** none  **Output:** key-value

Checks whether a viewer has valid credentials for protected content. Useful for server-side
access checks before serving an embed or issuing a session token.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--protection-method` | yes | Protection method to verify against: `password`, `sso`, or `token` |
| `--video-id` | no | Video ID to verify access for (maps to photo_id in API) |
| `--webinar-id` | no | Webinar ID to verify access for (maps to live_id in API) |
| `--object-id` | no | Object ID to verify access for |
| `--verification-data` | no | Verification data (e.g. password value, token) |

```bash
# Verify password access to a video
twentythree protection verify --protection-method password \
  --video-id <video-id> --verification-data "secretpass" --json

# Verify token access to a webinar
twentythree protection verify --protection-method token \
  --webinar-id <webinar-id> --verification-data <viewer-token> --json
```

## Common Patterns

### Protect a webinar with a password and a grace period

```bash
# Apply password protection with a 30-minute grace period for current viewers
twentythree protection protect \
  --protection-method password \
  --object-id <webinar-id> \
  --grace-minutes 30 \
  --json
```

### Verify a viewer's access before serving content

```bash
# Server-side check: verify the viewer has a valid token before embedding
twentythree protection verify \
  --protection-method token \
  --video-id <video-id> \
  --verification-data <viewer-token> \
  --json
# => Returns access status in the response
```

### Full lifecycle: protect, verify, then unprotect

```bash
# Step 1: Apply SSO protection to a video
twentythree protection protect --protection-method sso --object-id <video-id> --json

# Step 2: Verify a viewer has SSO access
twentythree protection verify --protection-method sso --video-id <video-id> --json

# Step 3: Remove protection when the access period ends
twentythree protection unprotect --object-id <video-id> --json
```
