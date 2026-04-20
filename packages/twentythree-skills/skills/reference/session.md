---
name: session
description: Generate and redeem short-lived viewer session tokens for SSO-style access.
---

# TwentyThree Session Commands

> Generate and redeem short-lived viewer session tokens for SSO-style access to TwentyThree content.
> Session tokens are for viewer SSO. They are distinct from CLI auth (`twentythree auth credentials`).
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: read (both commands).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree session <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### session get-token

**Auth scope:** read  **Side effects:** none  **Output:** key-value

Generates a short-lived session token for a viewer. The token can be passed to the viewer who
then redeems it via `session redeem-token` to gain authenticated access to TwentyThree content.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--return-url` | no | Return URL after the viewer authenticates via the session token |
| `--email` | no | Viewer's email address (used to identify the viewer in the session) |
| `--full-name` | no | Viewer's full name (used to identify the viewer in the session) |

```bash
# Generate a basic session token
twentythree session get-token --json

# Generate a session token for a named viewer with a return URL
twentythree session get-token \
  --email viewer@example.com \
  --full-name "Jane Doe" \
  --return-url "https://example.com/videos" \
  --json
```

### session redeem-token

**Auth scope:** read  **Side effects:** updates  **Output:** key-value

Redeems a session token to authenticate a viewer. The token is typically passed from the
server-side `session get-token` response to the viewer's browser, which then exchanges it
for a session.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--session-token` | yes | Session token to redeem |

```bash
# Redeem a session token
twentythree session redeem-token --session-token <token> --json

# Redeem in a scripted viewer-access flow
twentythree session redeem-token --session-token <session-token> --json
```

## Common Patterns

### Full SSO viewer access flow

```bash
# Step 1: Server-side — generate a session token for the viewer
twentythree session get-token \
  --email viewer@example.com \
  --full-name "Jane Doe" \
  --return-url "https://platform.example.com/dashboard" \
  --json
# => Returns { session_token: "<token>", ... }
# Capture: session_token

# Step 2: Pass the token to the viewer (via redirect, page param, or API response)

# Step 3: Viewer redeems the token to establish their session
twentythree session redeem-token --session-token <token> --json
```

### Generate a session token for anonymous viewer access

```bash
# Token without email/name — creates an anonymous viewer session
twentythree session get-token \
  --return-url "https://example.com/content" \
  --json
```
