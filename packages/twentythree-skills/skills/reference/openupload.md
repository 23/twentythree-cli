---
name: openupload
description: Third-party upload tokens — allow anonymous users to upload files using a pre-issued token.
---

# TwentyThree Open Upload Commands

> Issue tokens that let third parties upload files without full API credentials.
> The chunked upload engine handles large files automatically — never construct multipart requests directly.
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: read (list), write (upload-file, update-file).
`upload-file` and `update-file` additionally require `--token-upload-id` and `--token` values
provided by the workspace admin who issued the token.
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree openupload <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### openupload list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Name, Token, Public)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--token-upload-id` | no | Filter by open upload token upload ID |
| `--token` | no | Filter by open upload token value |
| `--app` | no | Filter by app open uploads (boolean) |

```bash
# List all open upload tokens in the workspace
twentythree openupload list --json

# Filter to a specific token upload
twentythree openupload list --token-upload-id 123 --json
```

### openupload upload-file

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

> **Memory rule:** Always use chunked upload for file uploads. This command handles chunking
> automatically — never construct multipart requests directly.

The returned `upload-key` identifies the uploaded file and is required for subsequent metadata
updates via `openupload update-file`.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--file-path` | yes | Path to the file to upload |
| `--token-upload-id` | yes | Open upload token upload ID (provided by workspace admin) |
| `--token` | yes | Open upload token (provided by workspace admin) |
| `--chunk-size` | no | Chunk size in bytes (default: 5242880) |
| `--concurrency` | no | Parallel chunk uploads (default: 5) |

```bash
# Upload a video file using a token
twentythree openupload upload-file --file-path ./video.mp4 \
  --token-upload-id <id> --token <tok> --json

# Upload with custom chunk size for a slow connection
twentythree openupload upload-file --file-path ./recording.mp4 \
  --token-upload-id <id> --token <tok> --chunk-size 2097152 --json
```

### openupload update-file

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Updates metadata for an already-uploaded file. Requires the `--upload-key` returned by `upload-file`.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--token-upload-id` | yes | Open upload token upload ID |
| `--token` | yes | Open upload token |
| `--upload-key` | yes | Upload key identifying the uploaded file |
| `--title` | no | New title for the uploaded file |
| `--description` | no | New description for the uploaded file |
| `--tags` | no | Tags for the uploaded file (space-separated) |

```bash
# Set title and description after upload
twentythree openupload update-file \
  --token-upload-id <id> --token <tok> --upload-key <key> \
  --title "Product Demo" --description "Q2 launch demo" --json

# Set tags on the uploaded file
twentythree openupload update-file \
  --token-upload-id <id> --token <tok> --upload-key <key> \
  --tags "demo product q2" --json
```

## Common Patterns

### Full third-party upload workflow

```bash
# Step 1: Workspace admin shares token-upload-id and token out-of-band with the third party.
# The third party runs:

# Step 2: Upload the file (chunking is automatic)
twentythree openupload upload-file \
  --file-path ./presentation.mp4 \
  --token-upload-id <token-upload-id> \
  --token <token> \
  --json
# => Returns { upload_key: "<key>", ... }
# Capture: upload_key for the next step

# Step 3: Set metadata on the uploaded file
twentythree openupload update-file \
  --token-upload-id <token-upload-id> \
  --token <token> \
  --upload-key <key> \
  --title "Partner Submission" \
  --tags "partner external" \
  --json
```

### Verify uploaded files as workspace admin

```bash
# List all open uploads to review received files
twentythree openupload list --json

# Filter to a specific token upload ID
twentythree openupload list --token-upload-id <token-upload-id> --json
```
