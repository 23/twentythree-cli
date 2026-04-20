---
name: user
description: Manage workspace users (admin-scope only). Invite, update, and issue login tokens.
---

# TwentyThree User Commands

> Manage users in a TwentyThree workspace — list, create, update, invite, and issue login tokens.
> Always use `--json` in agentic contexts for structured output.

> **ALL user commands require admin scope.** If your bearer token lacks admin, every command in this topic will fail with 401/403.

## Prerequisites

Auth scope required: admin (create, get, list, update, get-login-token, send-invitation), read (tokens, redeem-login-token).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

Run `twentythree auth status --json` to confirm the current workspace's bearer token has admin scope before using these commands.

> For any flag not listed here, run `twentythree user <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### user list

**Auth scope:** admin  **Side effects:** none  **Output:** table (ID, Username, Display Name, URL)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--page` | no | Page number |
| `--size` | no | Number of results per page |
| `--search` | no | Search query (username, display name, or email) |
| `--user-id` | no | Filter by user ID |

```bash
# List all users in the workspace
twentythree user list --json

# Search for a user by name or email
twentythree user list --search "alice" --json
```

### user create

**Auth scope:** admin  **Side effects:** creates  **Output:** key-value (user ID)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--email` | yes | Email address for the new user |
| `--username` | no | Username for the new user |
| `--full-name` | no | Full display name for the new user |
| `--site-admin` | no | Grant site admin privileges (boolean) |
| `--user-type` | no | User type (e.g. standard, administrator) |

```bash
# Create a new editor user
twentythree user create --email colleague@example.com --full-name "New User" --user-type editor --json

# Create a site admin user
twentythree user create --email admin@example.com --full-name "Admin User" --site-admin --json
```

### user get

**Auth scope:** admin  **Side effects:** none  **Output:** key-value

Takes `<user-id>` as positional argument.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--include-invitation` | no | Include invitation details in the response (boolean) |

```bash
# Get details of a specific user
twentythree user get <user-id> --json

# Get user details including invitation status
twentythree user get <user-id> --include-invitation --json
```

### user update

**Auth scope:** admin  **Side effects:** updates  **Output:** key-value

Takes `<user-id>` as positional argument.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--email` | no | New email address |
| `--full-name` | no | New full display name |
| `--password` | no | New password |
| `--profile-image` | no | Path to profile image file |

> **Security:** `--password` is visible in process lists and shell history.
> Prefer the admin UI for password changes in sensitive environments.

```bash
# Update a user's display name
twentythree user update <user-id> --full-name "Alice Smith" --json

# Update a user's password (see security warning above)
twentythree user update <user-id> --password "new-password" --json
```

### user get-login-token

**Auth scope:** admin  **Side effects:** none  **Output:** key-value (token)

Takes `<user-id>` as positional argument. Generates a time-limited login token that allows the user to authenticate without their password.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--return-url` | no | URL to redirect to after login |

```bash
# Generate a login token for a user
twentythree user get-login-token <user-id> --json

# Generate a token with a post-login redirect
twentythree user get-login-token <user-id> --return-url https://video.twentythree.com/ --json
```

### user send-invitation

**Auth scope:** admin  **Side effects:** updates  **Output:** key-value

Takes `<user-id>` as positional argument. Sends an invitation email to the specified user.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--invitation-message` | no | Custom message to include in the invitation email |

```bash
# Send a default invitation email
twentythree user send-invitation <user-id> --json

# Send an invitation with a custom message
twentythree user send-invitation <user-id> --invitation-message "Welcome to the platform!" --json
```

### user tokens

**Auth scope:** read  **Side effects:** none  **Output:** table (Domain, Token)

Lists cross-site tokens for the authenticated user. Useful for auditing active workspace tokens.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--cross-sites` | no | Include cross-site tokens (default: true) |

```bash
# List all active cross-site tokens
twentythree user tokens --json

# List tokens without cross-site tokens
twentythree user tokens --no-cross-sites --json
```

### user redeem-login-token

**Auth scope:** read  **Side effects:** none  **Output:** key-value

Redeems a login token (previously generated by `user get-login-token`) to authenticate a user.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--login-token` | yes | Login token to redeem |

```bash
# Redeem a login token
twentythree user redeem-login-token --login-token <token> --json

# Redeem a token received from get-login-token output
twentythree user redeem-login-token --login-token <token> --json
```

## Common Patterns

### Invite a new user

```bash
# Step 1: Create the user account
twentythree user create --email colleague@example.com --full-name "New User" --user-type editor --json

# Step 2: Capture the user_id from the output, then send invitation
twentythree user send-invitation <user-id> --invitation-message "Welcome to TwentyThree!" --json
```

### Issue a time-limited login token

```bash
twentythree user get-login-token <user-id> --return-url https://video.twentythree.com/ --json
```

### Audit active tokens

```bash
twentythree user tokens --json
```
