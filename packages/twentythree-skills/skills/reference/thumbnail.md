---
name: thumbnail
description: Manage thumbnail templates (Liquid-based) used to render video thumbnails with metadata variables.
---

# TwentyThree Thumbnail Commands

> Create and manage Liquid-based thumbnail templates for rendering video and webinar thumbnails.
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: read (list, data, file list), write (add, update, delete, duplicate, file upload, file delete).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

Thumbnail templates use Liquid templating with video metadata variables. Use `thumbnail data` to preview the render variables before authoring a template.

> For any flag not listed here, run `twentythree thumbnail <cmd> --agent` to get the complete flag list, types, and defaults.

## Commands

### thumbnail list

**Auth scope:** read  **Side effects:** none  **Output:** table (ID, Name, Type, Width, Height)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--search` | no | Filter by template name |
| `--object-type` | no | Filter by object type (photo, live, liveseries) |

```bash
# List all thumbnail templates
twentythree thumbnail list --json

# List templates scoped to video objects
twentythree thumbnail list --object-type photo --json
```

### thumbnail add

**Auth scope:** write  **Side effects:** creates  **Output:** key-value (template ID)

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--name` | yes | Name for the new thumbnail template |
| `--liquid-template` | yes | Liquid template HTML content |

```bash
# Create a minimal thumbnail template
twentythree thumbnail add --name "Simple Title" --liquid-template "<div>{{ photo.title }}</div>" --json

# Create a branded template with metadata
twentythree thumbnail add --name "Brand Template" --liquid-template "<html><body><h1>{{ photo.title }}</h1><p>{{ photo.one }}</p></body></html>" --json
```

### thumbnail update

**Auth scope:** write  **Side effects:** updates  **Output:** key-value

Takes `<template-id>` as positional argument.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--name` | no | New name for the template |
| `--liquid-template` | no | New Liquid template HTML content |
| `--object-type` | no | Object type (photo, live, liveseries) |
| `--width` | no | Template width in pixels |
| `--height` | no | Template height in pixels |

```bash
# Rename a thumbnail template
twentythree thumbnail update <template-id> --name "Brand Template v2" --json

# Update template content and dimensions
twentythree thumbnail update <template-id> --liquid-template "<div>{{ photo.title }}</div>" --width 1280 --height 720 --json
```

### thumbnail delete

**Auth scope:** write  **Side effects:** destructive  **Output:** key-value

Takes `<template-id>` as positional argument. No additional flags.

```bash
# Delete a thumbnail template
twentythree thumbnail delete <template-id> --json

# Delete an unused template
twentythree thumbnail delete <template-id> --json
```

### thumbnail duplicate

**Auth scope:** write  **Side effects:** creates  **Output:** key-value (new template ID)

Takes `<template-id>` as positional argument.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--name` | no | Name for the duplicate |

```bash
# Duplicate a template (uses auto-generated name)
twentythree thumbnail duplicate <template-id> --json

# Duplicate a template with a new name
twentythree thumbnail duplicate <template-id> --name "Brand v2" --json
```

### thumbnail data

**Auth scope:** read  **Side effects:** none  **Output:** key-value (Liquid render variables)

Takes `<template-id>` as positional argument. Returns the variables available for use in the template's Liquid markup when rendering for a given object.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--object-id` | yes | Video or webinar ID to get render data for |

```bash
# Preview Liquid render data for a video
twentythree thumbnail data <template-id> --object-id <video-id> --json

# Inspect render variables before authoring a template
twentythree thumbnail data <template-id> --object-id <video-id> --json
```

## Subtopic: thumbnail file

Manage image files attached to thumbnail templates. These files can be referenced inside Liquid templates as static assets.

### thumbnail file list

**Auth scope:** read  **Side effects:** none  **Output:** table (Filename, Size, URL)

Takes `<template-id>` as positional argument. No additional flags.

```bash
# List files attached to a thumbnail template
twentythree thumbnail file list <template-id> --json

# View all assets available to a template
twentythree thumbnail file list <template-id> --json
```

### thumbnail file upload

**Auth scope:** write  **Side effects:** creates  **Output:** key-value

Takes `<file-path>` as positional argument.

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--template-id` | yes | Thumbnail template ID to attach the file to |

```bash
# Upload a logo image to a template
twentythree thumbnail file upload ./logo.png --template-id <template-id> --json

# Upload a banner image
twentythree thumbnail file upload ./banner.jpg --template-id <template-id> --json
```

### thumbnail file delete

**Auth scope:** write  **Side effects:** destructive  **Output:** key-value

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--template-id` | yes | Thumbnail template ID |
| `--filename` | yes | Filename to delete |

```bash
# Delete a file from a thumbnail template
twentythree thumbnail file delete --template-id <template-id> --filename logo.png --json

# Remove an outdated banner image
twentythree thumbnail file delete --template-id <template-id> --filename old-banner.jpg --json
```

## Common Patterns

### Author a new thumbnail template

Use `thumbnail data` to discover available Liquid variables before writing the template:

```bash
# Step 1: Preview render variables for a specific video
twentythree thumbnail data <template-id> --object-id <video-id> --json

# Step 2: Create the template using discovered variables
twentythree thumbnail add --name "Brand Template" --liquid-template "<html><body><h1>{{ photo.title }}</h1></body></html>" --json
```

### Duplicate an existing template as a starting point

```bash
twentythree thumbnail duplicate <template-id> --name "Brand v2" --json
```

### List templates scoped to object type

```bash
# List templates for videos only
twentythree thumbnail list --object-type photo --json

# List templates for webinars
twentythree thumbnail list --object-type live --json
```
