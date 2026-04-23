# Phase 23: Behavioral Guide Authoring - Pattern Map

**Mapped:** 2026-04-23
**Files analyzed:** 4 (1 new, 3 updated)
**Analogs found:** 4 / 4

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `packages/twentythree-skills/skills/guide.md` | documentation / behavioral guide | n/a (static content) | `packages/twentythree-skills/skills/reference/webinar.md` | role-match (section structure, `###` headings, bash examples) |
| `packages/twentythree-skills/skills/SKILL.md` | skill index / entry point | n/a (static content) | `packages/twentythree-skills/skills/SKILL.md` (self) | exact (insert new section before line 124) |
| `packages/twentythree-skills/skills/reference/video.md` | reference | n/a (static content) | `packages/twentythree-skills/skills/reference/webinar.md` | exact (same `> **Note:**` callout format already used there) |
| `packages/twentythree-skills/skills/reference/webinar.md` | reference | n/a (static content) | `packages/twentythree-skills/skills/reference/webinar.md` (self) | exact (existing `> **Note:**` block at lines 13-15 is the template) |

---

## Pattern Assignments

### `packages/twentythree-skills/skills/guide.md` (NEW — behavioral guide)

**Analog:** `packages/twentythree-skills/skills/reference/webinar.md`

**File-level frontmatter pattern** (webinar.md lines 1-4):
```markdown
---
name: webinar
description: Create and manage live webinars (linked to API /live/*) — configure sessions, speakers, agenda, attachments, recordings, transcriptions, mail, and series.
---
```

Apply to guide.md as:
```markdown
---
name: guide
description: Cross-cutting behavioral rules for the TwentyThree CLI — correctness rules that prevent API errors and preference rules that improve output quality.
---
```

**Top-level heading and summary blockquote pattern** (webinar.md lines 6-10):
```markdown
# TwentyThree Webinar Commands

> Webinars are live broadcast events. Every example uses `--json` for machine-readable output.
> CLI `webinar` maps to API `live` — see Terminology Notes at the bottom of this file.
```

Apply to guide.md as:
```markdown
# TwentyThree CLI — Behavioral Guide

> Cross-cutting rules for agentic CLI use. Rules in this guide apply across all resource topics.
> **Correctness Rules** prevent API errors. **Preference Rules** improve output quality.
```

**Section heading pattern** — two H2 sections matching D-01 layout:
```markdown
## Correctness Rules

These rules must be followed to avoid API errors or incorrect data.

### <Rule Name>

<One-line explanation.>

```bash
<concrete example command>
```
```

```markdown
## Preference Rules

These rules are best practice. Following them improves output quality and agent efficiency.

### <Rule Name>

<One-line explanation.>

```bash
<concrete example command>
```
```

**Rule heading and body pattern** — `###` heading + one-line explanation + bash example. Modelled on webinar.md command blocks (e.g. lines 25-48):
```markdown
### webinar create

**Auth scope:** write  **Side effects:** creates  **Output:** key-value (id + admin_url)

After create, the CLI prints the new webinar ID and its admin URL. Capture `data.id` and `data.admin_url` from the `--json` response.

```bash
twentythree webinar create --title "Q2 Town Hall" --json
```
```

For guide.md rules the `### Heading` + explanation + `bash` block pattern is the same structure, minus the auth/output metadata line. Example shape for each rule:
```markdown
### Object Type Differentiation

Use `--object-type photo` for videos and `--object-type live` for webinars when calling `comment` or other multi-object topics.

```bash
twentythree comment list --object-id <video-id> --object-type photo --json
twentythree comment list --object-id <webinar-id> --object-type live --json
```
```

**Horizontal rule separator** — `---` between each `###` block, consistent throughout video.md and webinar.md:
```markdown
---
```

---

### `packages/twentythree-skills/skills/SKILL.md` (UPDATE — insert Behavioral Guide section)

**Analog:** Self — `packages/twentythree-skills/skills/SKILL.md`

**Insertion point:** Before line 124 (`## Resource Index`). The new section must appear before the table so agents encounter it before scanning commands (D-07).

**Pattern for new section** — modelled on the existing `## Key Invariants` section (SKILL.md lines 113-122):
```markdown
## Key Invariants

- **Use `--json` in agentic contexts.** Human-formatted tables are the default; agents should always request JSON.
- **File uploads use chunked upload automatically.** Never construct multipart requests directly — `twentythree video upload <file>` handles chunking under the hood.
- **Terminology mapping** — the CLI uses product-domain names while the API uses legacy names:
  - CLI `video` ↔ API `photo`
  - CLI `category` ↔ API `album`
  - CLI `webinar` ↔ API `live`
  - The `api_endpoint` field in `--agent` output shows the actual API path.
- **After upload or create, the CLI prints the new resource ID and its admin URL.** Use the ID for follow-up updates (e.g. setting thumbnail, publishing).
- **On persistent errors, run `twentythree doctor`** to diagnose auth, connectivity, and dependency issues.
```

New section to insert immediately before line 124, following the same H2 + short description + link pattern:

```markdown
## Behavioral Guide

Before executing multi-step workflows, read `skills/guide.md` for cross-cutting rules.
The guide covers two categories:

- **Correctness Rules** — must-follow rules that prevent API errors (object type differentiation, no `webinar get`, webinar creation defaults, timezone handling, admin link construction)
- **Preference Rules** — best-practice rules that improve output quality (thumbnails from listing responses, analytics via listing flags, filtering/sorting on listing endpoints)

> See [`guide.md`](guide.md) for the full rule list with examples.
```

---

### `packages/twentythree-skills/skills/reference/video.md` (UPDATE — add inline `> **Note:**` callouts)

**Analog:** `packages/twentythree-skills/skills/reference/webinar.md` lines 13-15 (the canonical `> **Note:**` block format)

**Established `> **Note:**` format from webinar.md lines 13-15:**
```markdown
> **There is no `webinar get` command.** To retrieve details for a specific webinar,
> use `twentythree webinar list --search "<title>" --json` or filter by status/ID client-side.
> The API does not expose a single-record GET; list + filter is the canonical pattern.
```

**Established `> **Warning:**` format from video.md lines 113-115:**
```markdown
> **Warning: This action is destructive and cannot be undone.** The video and all associated data (subtitles, sections, analytics) are permanently deleted from the workspace.
```

**Established `> **Chunked upload is automatic.**` format from video.md lines 25-27:**
```markdown
> **Chunked upload is automatic.** `twentythree video upload <file>` handles chunking internally.
> `--chunk-size` (default 5 MB) and `--concurrency` (default 5) are tunables — never construct multipart requests directly.
```

**Rule for new notes:** `> **Note:**` opener, one-to-two lines, forward-reference to guide.md, placed immediately after the command header line (the `**Auth scope:**` line). Do not restate the full rule — point to guide.md.

**Affected commands in video.md and where to insert (by role, based on GUIDE-01/02 rules):**

1. `### video list` (line 50) — analytics-via-listing-flags preference rule (if `--include-analytics` flag is confirmed). Insert after the `**Auth scope:**` line 52.
2. `### video get` (line 69) — thumbnail-from-listing-response preference rule (thumbnails are embedded in list output; avoid a separate `thumbnail list` call when listing suffices). Insert after `**Auth scope:**` line 71.
3. After upload (`### video upload`, line 21) — admin link construction note. Insert after line 28 ("After upload the CLI prints the new video ID and its admin URL.") or after the `> **Chunked upload is automatic.**` block.

Example note shape (copy this pattern for each):
```markdown
> **Note:** For analytics data, prefer `twentythree video list --include-analytics --json` over a separate analytics command when listing suffices. See [guide.md](../guide.md) for the full Preference Rules.
```

```markdown
> **Note:** The admin URL is included in the `--json` response after every upload or create. Construct deep links from `data.admin_url` — do not build URLs manually. See [guide.md](../guide.md).
```

**Flag names must be verified before writing** (D-04): run `twentythree video list --agent` and capture actual flag names from the JSON output before authoring any note that references `--include-analytics` or similar flags.

---

### `packages/twentythree-skills/skills/reference/webinar.md` (UPDATE — add inline `> **Note:**` callouts)

**Analog:** Self — `packages/twentythree-skills/skills/reference/webinar.md`

**Existing `> **Note:**` block at file header (lines 13-15) — canonical format to copy:**
```markdown
> **There is no `webinar get` command.** To retrieve details for a specific webinar,
> use `twentythree webinar list --search "<title>" --json` or filter by status/ID client-side.
> The API does not expose a single-record GET; list + filter is the canonical pattern.
```

This existing block covers the no-webinar-get rule. New notes are for additional rules (D-05: one note per affected command, forward-reference only).

**Affected commands in webinar.md and where to insert:**

1. `### webinar create` (line 25) — webinar creation defaults rule (verify `open_p` or equivalent flags via `--agent` before writing). Insert after `**Auth scope:** write  **Side effects:** creates  **Output:** key-value (id + admin_url)` line (line 27).
2. `### webinar list` (line 51) — analytics-via-listing-flags preference rule (verify `--include-analytics` or equivalent flag). Insert after `**Auth scope:** read  **Side effects:** none  **Output:** table` line (line 53).
3. `### webinar create` or `### webinar update` — admin link construction note (admin_url is in the response; do not build URLs manually).

Example note shape for `webinar create`:
```markdown
> **Note:** When creating webinars, set public/private access with `--open-p` (verify flag name via `--agent`). Defaults may not match your intent. See [guide.md](../guide.md) for Webinar Creation Defaults.
```

**Flag names must be verified before writing** (D-04): run `twentythree webinar create --agent` and capture the actual flag name for `open_p` (CLI flag may be `--open-p` or similar) before writing any note that references it.

---

## Shared Patterns

### Blockquote callout format
**Source:** `packages/twentythree-skills/skills/reference/webinar.md` lines 13-15 and `packages/twentythree-skills/skills/reference/video.md` lines 25-27, 113-115
**Apply to:** All new `> **Note:**` callouts in video.md and webinar.md, and any callouts in guide.md

Three variants in use — all use the same blockquote syntax, differing only in the bold opener word:
```markdown
> **Note:** <short forward-reference text. See [guide.md](../guide.md).>
```
```markdown
> **Warning:** <destructive action text.>
```
```markdown
> **Chunked upload is automatic.** <explanation.>
```

New notes must use `> **Note:**` (not `> **Warning:**` or the chunked-upload style) per D-05/GUIDE-02.

### Command section structure
**Source:** `packages/twentythree-skills/skills/reference/webinar.md` and `packages/twentythree-skills/skills/reference/video.md` — every `###` command block
**Apply to:** Each rule entry in guide.md

Pattern: `###` heading → metadata or explanation line → optional blockquote callout → flag table (if applicable) → bash code block → `---` separator.

For guide.md rules, the flag table is omitted (rules are behavioral, not command-specific). Shape: `###` heading → one-line explanation → bash code block → `---`.

### Relative link from reference/ to skills/ root
**Source:** No existing examples — guide.md is at `skills/guide.md`, reference files are at `skills/reference/*.md`
**Apply to:** All `> **Note:**` callouts in video.md and webinar.md that reference guide.md

Correct relative path from `skills/reference/video.md` or `skills/reference/webinar.md` to `skills/guide.md`:
```markdown
[guide.md](../guide.md)
```

From SKILL.md (at `skills/SKILL.md`) to guide.md:
```markdown
[guide.md](guide.md)
```

---

## No Analog Found

All files have clear analogs. No files require falling back to RESEARCH.md patterns.

---

## Package Distribution — Confirm No Code Changes Needed

**Source:** `packages/twentythree-skills/package.json` lines 22-26

```json
"files": [
  "/bin",
  "/skills",
  "/README.md"
]
```

The `"files": ["/skills"]` glob covers all files under `skills/` recursively. `skills/guide.md` will be included in `npm pack` automatically — no `package.json` change needed. Executor should confirm by checking `npm pack --dry-run` output during smoke test (Phase 24 updates the count assertion from 28 to 29).

---

## Metadata

**Analog search scope:** `packages/twentythree-skills/skills/` (SKILL.md, reference/video.md, reference/webinar.md)
**Files scanned:** 4
**Pattern extraction date:** 2026-04-23
