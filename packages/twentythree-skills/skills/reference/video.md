---
name: video
description: Manage video assets — upload, list, metadata updates, thumbnails, transcoding status, sections (chapters), and subtitles.
---

# TwentyThree Video Commands

> Video is the primary asset type in TwentyThree. Every example uses `--json` for machine-readable output.
> CLI `video` maps to API `photo` — see Terminology Notes at the bottom of this file.

## Prerequisites

Auth scope varies: **read** (list, get, transcoding-progress), **write** (upload, update, delete, replace, frame, all section writes, all subtitle writes).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree video <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### video upload

**Auth scope:** write  **Side effects:** creates  **Output:** key-value (id + admin_url)

> **Chunked upload is automatic.** `twentythree video upload <file>` handles chunking internally.
> `--chunk-size` (default 5 MB) and `--concurrency` (default 5) are tunables — never construct multipart requests directly.

After upload the CLI prints the new video ID and its admin URL. Capture `data.id` and `data.admin_url` from the `--json` response.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--title` | no | — | Title for the uploaded video |
| `--description` | no | — | Description for the uploaded video |
| `--tags` | no | — | Space-separated tags for the uploaded video |
| `--category-id` | no | — | Category ID (or comma-separated IDs) to assign the video to |
| `--publish` | no | false | Publish the video immediately after upload |
| `--chunk-size` | no | 5242880 | Chunk size in bytes (default: 5 MB) |
| `--concurrency` | no | 5 | Number of chunks to upload in parallel |

```bash
# Basic upload
twentythree video upload ./video.mp4 --title "Demo" --json

# Upload with category, tags, and publish immediately
twentythree video upload ./video.mp4 --title "Q2 Keynote" --category-id <cat-id> --tags "product q2" --publish --json
```

---

### video list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Title, Duration, Status, Published, Updated)

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--limit` | no | — | Maximum number of videos to return (default: all) |
| `--include-unpublished` | no | — | Include unpublished videos in results |

```bash
# List all published videos
twentythree video list --json

# List up to 20 videos including unpublished
twentythree video list --limit 20 --include-unpublished --json
```

---

### video get

**Auth scope:** read  **Side effects:** none  **Output:** key-value

No additional flags — pass the video ID as a positional argument.

```bash
# Get details of a specific video
twentythree video get <id> --json

# Example with a real ID
twentythree video get 12345 --json
```

---

### video update

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--title` | no | — | New title for the video |
| `--description` | no | — | New description for the video |
| `--tags` | no | — | Space-separated tags (replaces existing tags) |
| `--category-id` | no | — | Category ID (or comma-separated IDs) to assign the video to |
| `--publish` | no | — | Publish or unpublish the video |
| `--promote` | no | — | Promote or demote the video |
| `--publish-date` | no | — | Scheduled publish date/time (ISO 8601) |
| `--360` | no | — | Mark as 360° video |

```bash
# Update title and description
twentythree video update <id> --title "New Title" --description "Updated description" --json

# Assign to category, add tags, and schedule publish
twentythree video update <id> --category-id <cat-id> --tags "demo q2" --publish-date "2026-06-01T10:00:00Z" --json
```

---

### video delete

**Auth scope:** write  **Side effects:** destructive  **Output:** key-value

> **Warning: This action is destructive and cannot be undone.** The video and all associated data (subtitles, sections, analytics) are permanently deleted from the workspace.

No additional flags — pass the video ID as a positional argument.

```bash
# Delete a video (destructive — cannot be undone)
twentythree video delete <id> --json

# Example with a real ID
twentythree video delete 12345 --json
```

---

### video replace

**Auth scope:** write  **Side effects:** updates  **Output:** key-value (id + admin_url)

Replaces the video file while preserving metadata (title, description, subtitles, etc.). After replace the CLI prints the video ID and its admin URL.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--chunk-size` | no | 5242880 | Chunk size in bytes (default: 5 MB) |
| `--concurrency` | no | 5 | Number of chunks to upload in parallel |

> **Chunked upload is automatic.** Replacement uses the same chunked engine as upload.

After replace, the CLI prints the video ID and its admin URL. Capture `data.id` and `data.admin_url` from the `--json` response.

```bash
# Replace a video file
twentythree video replace <id> ./new-video.mp4 --json

# Replace with custom chunk size for large files
twentythree video replace <id> ./new-video.mp4 --chunk-size 52428800 --concurrency 3 --json
```

---

### video frame

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Extracts a frame from the video at a given time offset and sets it as the video thumbnail.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--time` | no | — | Time offset in seconds to extract the frame from |

```bash
# Extract a frame from the beginning (default time)
twentythree video frame <id> --json

# Extract a frame at 30 seconds and set as thumbnail
twentythree video frame <id> --time 30 --json
```

---

### video transcoding-progress

**Auth scope:** read  **Side effects:** none  **Output:** key-value

Returns the transcoding status and progress percentage for a video. Poll this after upload to confirm processing is complete before publishing.

No additional flags — pass the video ID as a positional argument.

```bash
# Check transcoding status
twentythree video transcoding-progress <id> --json

# Example with a real ID
twentythree video transcoding-progress 12345 --json
```

---

## Subtopic: video section

Sections are chapter markers on a video. Start time is expressed in seconds from the beginning of the video. Use sections to help viewers navigate long-form content.

### video section list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Title, Start Time, Description)

No additional flags — pass the video ID as a positional argument.

```bash
# List all sections for a video
twentythree video section list <id> --json

# Example with a real ID
twentythree video section list 12345 --json
```

---

### video section create

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--title` | yes | — | Section title |
| `--start-time` | yes | — | Start time in seconds |
| `--description` | no | — | Section description |

```bash
# Create an intro section at the beginning
twentythree video section create <id> --title "Introduction" --start-time 0 --json

# Create a named chapter at 30 seconds with description
twentythree video section create <id> --title "Deep Dive" --start-time 30 --description "Technical walkthrough" --json
```

---

### video section update

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--section-id` | yes | — | Section ID to update |
| `--title` | no | — | New section title |
| `--start-time` | no | — | New start time in seconds |
| `--description` | no | — | New section description |

```bash
# Update a section title
twentythree video section update <id> --section-id <section-id> --title "New Title" --json

# Update start time and description
twentythree video section update <id> --section-id <section-id> --start-time 45 --description "Updated description" --json
```

---

### video section delete

**Auth scope:** write  **Side effects:** destructive  **Output:** key-value

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--section-id` | yes | — | Section ID to delete |

```bash
# Delete a section from a video
twentythree video section delete <id> --section-id <section-id> --json

# Example with real IDs
twentythree video section delete 12345 --section-id 67 --json
```

---

### video section generate

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

Automatically generates chapter sections using AI. **Prerequisite:** the video must have a transcript (auto-transcription or manual subtitle upload). The AI reads the transcript and identifies natural chapter boundaries.

No additional flags — pass the video ID as a positional argument.

```bash
# Generate AI sections from transcript (transcript must exist)
twentythree video section generate <id> --json

# Example with a real ID
twentythree video section generate 12345 --json
```

---

### video section set-thumbnail

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Sets the thumbnail image for a video section by extracting a frame at the given time offset.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--section-id` | yes | — | Section ID |
| `--time` | no | — | Time offset in seconds for the thumbnail frame |

```bash
# Set thumbnail for a section (uses video frame at section start by default)
twentythree video section set-thumbnail <id> --section-id <section-id> --json

# Set thumbnail at a specific time offset
twentythree video section set-thumbnail <id> --section-id <section-id> --time 15 --json
```

---

## Subtopic: video subtitle

Subtitle commands manage caption tracks on a video (SRT/WebVTT formats). Use `twentythree video subtitle locales --json` to list all supported locales, and `twentythree video subtitle types --json` to list available subtitle types. Use `--agent` on any subtitle command to inspect the full flag list.

### video subtitle list

**Auth scope:** read  **Side effects:** none  **Output:** table (Locale, Language, Type, Status, Primary)

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--include-drafts` | no | — | Include draft (unpublished) subtitle tracks |

```bash
# List published subtitle tracks for a video
twentythree video subtitle list <id> --json

# List all tracks including drafts
twentythree video subtitle list <id> --include-drafts --json
```

---

### video subtitle create

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

Creates an empty subtitle track. Use `video subtitle upload` to add content to the track.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--locale` | yes | — | Locale for the subtitle track (e.g. `en_US`, `fr_FR`, `auto`) |
| `--type` | no | general | Subtitle type: `general`, `closedcaptions`, `audiodescriptions` |
| `--draft` | no | — | Create the subtitle track as a draft (hidden from viewers) |

```bash
# Create an English subtitle track
twentythree video subtitle create <id> --locale en_US --json

# Create a French closed-captions track as a draft
twentythree video subtitle create <id> --locale fr_FR --type closedcaptions --draft --json
```

---

### video subtitle upload

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

Uploads an SRT or WebVTT subtitle file for a video. Creates the track and populates it with the uploaded file content.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--locale` | yes | — | Locale for the subtitle track (e.g. `en_US`, `fr_FR`) |
| `--type` | no | general | Subtitle type: `general`, `closedcaptions`, `audiodescriptions` |
| `--draft` | no | — | Upload as a draft (hidden from viewers until published) |

```bash
# Upload an SRT file for English subtitles
twentythree video subtitle upload <id> ./subtitles.srt --locale en_US --json

# Upload a WebVTT file as French closed captions (draft)
twentythree video subtitle upload <id> ./captions.vtt --locale fr_FR --type closedcaptions --draft --json
```

---

### video subtitle update

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--subtitle-id` | yes | — | Locale of the subtitle track to update (e.g. `en_US`) |
| `--type` | no | — | New subtitle type: `general`, `closedcaptions`, `audiodescriptions` |
| `--draft` | no | — | Set draft status: true = hidden, false = published |
| `--default` | no | — | Set this subtitle track as the default |

```bash
# Publish a draft subtitle track
twentythree video subtitle update <id> --subtitle-id en_US --draft false --json

# Change subtitle type and set as default
twentythree video subtitle update <id> --subtitle-id en_US --type closedcaptions --default --json
```

---

### video subtitle delete

**Auth scope:** write  **Side effects:** destructive  **Output:** key-value

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--subtitle-id` | yes | — | Locale of the subtitle track to delete (e.g. `en_US`) |
| `--type` | no | general | Subtitle type to delete: `general`, `closedcaptions`, `audiodescriptions` |

```bash
# Delete an English subtitle track
twentythree video subtitle delete <id> --subtitle-id en_US --json

# Delete a specific subtitle type
twentythree video subtitle delete <id> --subtitle-id en_US --type closedcaptions --json
```

---

### video subtitle duplicate

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

Copies a subtitle track to a new locale. Useful for pre-populating a track before translation.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--subtitle-id` | yes | — | Source locale of the subtitle track to duplicate (e.g. `en_US`) |
| `--target-locale` | yes | — | Target locale for the duplicated track (e.g. `fr_FR`) |
| `--source-type` | no | general | Source subtitle type |
| `--target-type` | no | general | Target subtitle type |
| `--draft` | no | — | Create the duplicated track as a draft |

```bash
# Duplicate English subtitles to French
twentythree video subtitle duplicate <id> --subtitle-id en_US --target-locale fr_FR --json

# Duplicate to German and keep as draft for review
twentythree video subtitle duplicate <id> --subtitle-id en_US --target-locale de_DE --draft --json
```

---

### video subtitle locales

**Auth scope:** read  **Side effects:** none  **Output:** table (Code, Name, Auto Transcribe, Auto Translate, Live)

Lists all subtitle locale codes supported by TwentyThree. Use the `Code` value as the `--locale` or `--subtitle-id` argument in other subtitle commands.

No additional flags.

```bash
# List all available locales
twentythree video subtitle locales --json

# Pipe to filter for English locales
twentythree video subtitle locales --json
```

---

### video subtitle types

**Auth scope:** read  **Side effects:** none  **Output:** table (Type, Label)

Lists all valid subtitle types accepted by the platform.

No additional flags.

```bash
# List available subtitle types
twentythree video subtitle types --json

# Use to verify the type value before creating/updating
twentythree video subtitle types --json
```

---

### video subtitle data

**Auth scope:** read  **Side effects:** none  **Output:** key-value

Retrieves the raw subtitle content for a track. Use `--format` to select the file format.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--subtitle-id` | yes | — | Locale of the subtitle track to retrieve (e.g. `en_US`) |
| `--format` | no | websrt | Subtitle format: `websrt`, `webvtt`, `json`, `adobe`, `subviewer` |
| `--type` | no | general | Subtitle type: `general`, `closedcaptions`, `audiodescriptions` |

```bash
# Get raw subtitle data in default SRT format
twentythree video subtitle data <id> --subtitle-id en_US --json

# Get subtitle data in WebVTT format
twentythree video subtitle data <id> --subtitle-id en_US --format webvtt --json
```

---

### video subtitle set-primary

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Sets a subtitle track as the primary (default) language for the video.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--subtitle-id` | yes | — | Locale of the subtitle track to set as primary (e.g. `en_US`) |

```bash
# Set English as the primary subtitle language
twentythree video subtitle set-primary <id> --subtitle-id en_US --json

# Set French as primary
twentythree video subtitle set-primary <id> --subtitle-id fr_FR --json
```

---

### video subtitle archive

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

Triggers or checks workspace-wide subtitle archive transcription. Without `--progress`, starts transcription. With `--progress`, reports current transcription status.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--progress` | no | false | Check transcription progress instead of triggering transcription |

```bash
# Trigger workspace subtitle archive transcription
twentythree video subtitle archive --json

# Check transcription progress
twentythree video subtitle archive --progress --json
```

---

## Common Patterns

### Upload, update metadata, and publish

```bash
# 1. Upload video (chunked upload is automatic)
twentythree video upload ./demo.mp4 --title "Q2 Demo" --json
#    => { "data": { "id": "<video-id>", "admin_url": "..." } }

# 2. Update tags and category
twentythree video update <video-id> --tags "demo q2" --category-id <cat-id> --json

# 3. Publish
twentythree video update <video-id> --publish --json
```

### Poll for transcoding completion before publishing

```bash
# Check transcoding status (repeat until status is "complete")
twentythree video transcoding-progress <id> --json
#    => { "data": { "status": "transcoding", "progress": 45 } }

# When progress reaches 100 / status is "complete", publish
twentythree video update <id> --publish --json
```

### Extract a thumbnail frame

```bash
# Set thumbnail at 15 seconds into the video
twentythree video frame <id> --time 15 --json

# Alternatively, use video section set-thumbnail for a section preview
twentythree video section set-thumbnail <id> --section-id <section-id> --time 15 --json
```

### Create chapter markers (sections)

```bash
# Create multiple sections for a structured video
twentythree video section create <id> --title "Introduction" --start-time 0 --json
twentythree video section create <id> --title "Demo" --start-time 30 --json
twentythree video section create <id> --title "Q&A" --start-time 180 --json

# List all sections to verify
twentythree video section list <id> --json
```

### Generate AI chapters from transcript

```bash
# Prerequisite: video must have a transcript (subtitle track created or uploaded)
# First, check if subtitles/transcript exist
twentythree video subtitle list <id> --json

# Generate chapters using AI
twentythree video section generate <id> --json
#    => Creates sections based on transcript content
```

### Upload and publish subtitle tracks

```bash
# Upload English SRT subtitles
twentythree video subtitle upload <id> ./en-subtitles.srt --locale en_US --json

# Publish the track (if created as draft)
twentythree video subtitle update <id> --subtitle-id en_US --draft false --json

# Set as primary language
twentythree video subtitle set-primary <id> --subtitle-id en_US --json

# Duplicate to French for translation
twentythree video subtitle duplicate <id> --subtitle-id en_US --target-locale fr_FR --draft --json
```

---

## Terminology Notes

CLI `video` = API `photo`. The `api_endpoint` field in `--agent` output uses the API name:

- `twentythree video upload` -> `POST /photo/redeem-upload-token`
- `twentythree video list` -> `GET /photo/list`
- `twentythree video update` -> `POST /photo/update`
- `twentythree video delete` -> `POST /photo/delete`
- `twentythree video replace` -> `POST /photo/replace`
- `twentythree video frame` -> `POST /photo/frame`
- `twentythree video transcoding-progress` -> `GET /photo/get-transcoding-progress`

When reading the raw OpenAPI spec or debugging API responses, `photo` refers to a video asset.
When commenting on a video via the `comment` topic, pass `--object-type photo`.
