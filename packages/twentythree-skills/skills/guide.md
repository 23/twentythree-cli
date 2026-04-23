---
name: guide
description: Cross-cutting behavioral rules for the TwentyThree CLI — correctness rules that prevent API errors and preference rules that improve output quality.
---

# TwentyThree CLI — Behavioral Guide

> Cross-cutting rules for agentic CLI use. Rules in this guide apply across all resource topics.
> **Correctness Rules** prevent API errors. **Preference Rules** improve output quality.

## Correctness Rules

These rules must be followed to avoid API errors or incorrect data.

### Object Type Differentiation

Use `--object-type photo` for videos and `--object-type live` for webinars when calling `comment`, `poll`, `spot`, or other multi-object topics.

```bash
# Comments on a video — object-type is photo (CLI maps video -> API photo)
twentythree comment list --object-id <video-id> --object-type photo --json

# Comments on a webinar — object-type is live (CLI maps webinar -> API live)
twentythree comment list --object-id <webinar-id> --object-type live --json
```

---

### Retrieve Webinars with webinar list --search

There is no `webinar get` command. Retrieve a specific webinar by passing its title to `webinar list --search`, or fetch all and filter by ID client-side.

```bash
twentythree webinar list --search "Q2 Town Hall" --json
```

---

### Webinar Creation Defaults

Verify publication and draft flags when creating webinars — the defaults may not match your intent. Pass `--publish` to make the webinar immediately visible or `--draft` to hold it unpublished. Run `twentythree webinar create --agent` to confirm all available access flags before creating.

```bash
# Create a published webinar explicitly
twentythree webinar create --title "Product Launch" --live-date "2026-06-01T14:00:00Z" --publish --json

# Create a draft webinar for review before publishing
twentythree webinar create --title "Internal Update" --draft --json
```

---

### Timezone Handling

Always specify `--live-date` in ISO 8601 UTC format (ending in `Z`) to avoid timezone ambiguity when scheduling webinars or time-sensitive events.

```bash
twentythree webinar create --title "Launch Event" --live-date "2026-06-01T14:00:00Z" --json
```

---

### Admin Link Construction

The `--json` response after every upload or create includes `data.admin_url`. Use that value directly for admin deep links — never construct admin URLs by concatenating domain and ID.

```bash
# Upload a video and capture the admin URL from the response
RESPONSE=$(twentythree video upload ./video.mp4 --title "Demo" --json)
echo "Admin URL: $(echo $RESPONSE | jq -r '.data.admin_url')"
```

---

## Preference Rules

These rules are best practice. Following them improves output quality and agent efficiency.

### Thumbnails from Listing Response

When you need a video's thumbnail URL, prefer `video list --json` — the response includes thumbnail fields. Avoid a separate `thumbnail list` call when the listing data is sufficient.

```bash
# Thumbnail fields (thumbnail_*) are embedded in list output — no extra call needed
twentythree video list --limit 10 --json | jq '.data[] | {id, title, thumbnail_small_url, thumbnail_medium_url}'
```

---

### Prefer Listing Endpoints for Richer Data

Combine `--limit`, `--all`, and available filter flags to retrieve exactly the data you need in a single call, reducing round trips. Check `--agent` output to discover all available filter flags before writing client-side filtering logic.

```bash
# Fetch all videos with filtering and extraction in one pipeline
twentythree video list --all --json | jq '.data[] | {id, title, status}'

# List upcoming webinars in one call — no client-side status filtering needed
twentythree webinar list --status upcoming --all --json
```

---

### Filtering and Sorting on Listing Endpoints

Apply filtering and sorting via CLI flags on listing commands rather than fetching all results and filtering client-side. Check `--agent` output for available filter flags before writing client-side filtering logic.

```bash
# Filter webinars by status on the server — avoid fetching all and filtering locally
twentythree webinar list --status upcoming --limit 10 --json

# Include unpublished videos using a listing flag
twentythree video list --limit 20 --include-unpublished --json
```

---
