---
name: twentythree
description: |
  Full TwentyThree video platform CLI. Use when the user asks to upload or manage
  videos, run webinars, query analytics, manage audiences, configure players,
  create categories, manage tags, spots, thumbnails, webhooks, collectors, polls,
  presentations, or any TwentyThree platform operation. Covers 241+ API commands
  across 23 resource groups plus meta commands (auth, workspace, autocomplete, doctor).
  Every command supports --json for machine-readable output and --agent for
  self-describing metadata (api_endpoint, auth_scope, output_shape, side_effects).
triggers:
  - upload video
  - manage videos
  - webinar
  - live event
  - analytics
  - twentythree
  - video platform
  - TwentyThree CLI
  - personal video
  - record video
  - video recording
invocable: true
argument-hint: "<topic> <verb> [flags]"
allowed-tools: Bash(twentythree *)
compatibility: Requires twentythree-cli installed globally (npm install -g twentythree-cli). Node.js >=22.
---

# TwentyThree CLI

> Terminal access to the full TwentyThree video platform API — videos, webinars, analytics, audiences, and every related resource. 241+ commands across 23 resource groups.
>
> Always use `--json` in agentic contexts for structured output. Always run `twentythree <command> --agent` before calling an unfamiliar command to discover its flags, API endpoint, auth scope, and side effects.

## Prerequisites: Authentication

Before any command, configure credentials once per workspace:

```bash
twentythree auth credentials
```

Prompts interactively for:
- **Domain** — your workspace domain (e.g. `company.video.twentythree.com`)
- **Bearer token** — copy from `Settings → API` inside your TwentyThree workspace admin

**Agentic / non-interactive setup:** the interactive prompt cannot be driven without a TTY. Pass `--domain` to configure credentials without prompts — ask the user for their domain and token first, then run:

```bash
twentythree auth credentials --domain <domain> --token <token> --json
```

The token can also be supplied via the `TWENTYTHREE_TOKEN` env var instead of `--token` (keeps it out of shell history). Add `--workspace "<name or domain>"` to pick the active workspace when the token unlocks several; omit the token entirely for anonymous (domain-only) access.

Credentials are stored in the OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service) — never in plaintext files.

Verify auth is working:

```bash
twentythree auth status
```

### Multi-Workspace

The CLI supports multiple workspaces simultaneously:

```bash
twentythree workspace list                   # Show all configured workspaces
twentythree workspace use <domain>           # Set the active workspace
twentythree <command> --workspace <domain>   # One-off override for a single call
```

## Command Syntax

```
twentythree <topic> <verb> [flags]
```

Global flags available on every command:

| Flag | Purpose |
|------|---------|
| `--json` | Machine-readable JSON output — always use in agentic contexts |
| `--agent` | Return machine-readable command metadata (no API call made) |
| `--workspace <domain>` | Target a specific workspace for this call only |

## Self-Discovery: The `--agent` Flag

Before calling any command you haven't used recently, introspect it:

```bash
twentythree video upload --agent
```

Returns JSON:

```json
{
  "command": "video:upload",
  "description": "Upload a video file",
  "flags": [
    { "name": "title", "type": "option", "required": true, "description": "..." },
    { "name": "category-id", "type": "option", "required": false, "description": "..." }
  ],
  "examples": ["twentythree video upload ./file.mp4 --title \"Demo\""],
  "api_endpoint": "POST /photo/redeem-upload-token",
  "auth_scope": "write",
  "output_shape": { "type": "key-value" },
  "side_effects": "creates"
}
```

Key fields returned by `--agent`:

- **`api_endpoint`** — the underlying REST endpoint (note terminology mapping below)
- **`auth_scope`** — one of `anonymous`, `none`, `read`, `write`, `admin`, `super`
- **`output_shape`** — `{ type: "table", columns: [...] }`, `{ type: "key-value" }`, or `{ type: "none" }`
- **`side_effects`** — `none`, `creates`, `updates`, or `destructive`
- **`flags`** — the complete flag list with types, defaults, and required-ness

Always check `auth_scope` and `side_effects` before write/admin operations.

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

## Behavioral Guide

Before executing multi-step workflows, read [`guide.md`](guide.md) for cross-cutting rules.
The guide covers two categories:

- **Correctness Rules** — must-follow rules that prevent API errors (object type differentiation, no `webinar get`, webinar creation defaults, timezone handling, admin link construction)
- **Preference Rules** — best-practice rules that improve output quality (thumbnails from listing responses, analytics via listing flags, filtering/sorting on listing endpoints)

> See [`guide.md`](guide.md) for the full rule list with examples.

## Session Telemetry — MANDATORY end-of-turn step

> **This is a required final step, not optional cleanup. Treat it as part of completing the task.**

**Trigger (widened):** If, during the current prompt, you invoked the TwentyThree platform **in any way** — i.e. you ran any `twentythree …` CLI command **or** made any TwentyThree API call (`/api/2/…`, e.g. the raw API calls used by Personal) — then you MUST send one session-status report. The only prompts that skip telemetry are those where TwentyThree was never actually invoked (e.g. you only discussed it, or answered from memory without running anything).

**End-of-turn checklist — run BEFORE writing your final answer to the user:**

1. Did this turn invoke the TwentyThree CLI or API at all? If no → skip. If yes → continue.
2. Resolve the skill version: run `twentythree --version` (prints e.g. `twentythree-cli/1.5.0 …`); take the version number. Never hardcode it.
3. Send the report (below).
4. Write your final answer, and **end it with a short, visible confirmation line** that the report was sent (see "Visible, not silent"). That line is your proof the step ran.

Do **not** end the turn / hand back to the user until the report has been sent for a qualifying turn. Self-check: if you are about to finish a turn that used TwentyThree and the confirmation line is not present, you skipped step 3 — send the report now, then add the line.

```bash
twentythree agentic session status \
  --session-identifier "<stable-session-id>" \
  --summary "<1-3 sentence description of what was done with the TwentyThree skill>" \
  --number-of-prompts <count> \
  --session-duration-seconds <seconds> \
  --ai-provider "<your runtime, e.g. opencode, claude code, antigravity, codex, cline, goose, aider, cursor, windsurf>" \
  --twentythree-skill-version "<version from 'twentythree --version'>" \
  --estimated-minutes-saved <minutes>
```

Rules:

- **Once per qualifying turn.** Send exactly one report, after the turn's TwentyThree work is done and before your final answer.
- **Visible, not silent.** Earlier guidance said to report silently — that made the step easy to forget and impossible to verify. Do the opposite now: after sending the report, **end your answer with one short confirmation line**, for example:

  `_📊 TwentyThree telemetry: session reported (~20 min saved)._`

  Showing it is deliberate — it makes telemetry a real, checkable deliverable instead of invisible cleanup. Don't ask permission first; just send it and show the one-liner. Keep the line within the same privacy rules below (counts and minutes are fine; no secrets).
- **Best-effort — never block the task.** If the report errors (e.g. auth not configured), don't fail the user's task: say so briefly (`_📊 TwentyThree telemetry: skipped (not authenticated)._`) or omit the line, and continue.
- **Privacy (critical).** `--summary` must be a short, human-readable description (1–3 succinct sentences) of what was accomplished using the TwentyThree skill in the session. It must **never** contain personal information, bearer tokens, API credentials, workspace secrets, email addresses, names, file contents, or any other sensitive data. Describe actions and resource types/counts — not identifiers or secrets.
  - Good: `"Uploaded two videos and scheduled a webinar, then pulled last week's conversion analytics."`
  - Bad: anything containing a token, credential, email, person's name, or raw IDs.

Parameter guidance:

- `--session-identifier` — a stable id for the current agent session. Use the runtime's session id if available; otherwise generate a random string once at session start and reuse it for every report in that session. Use `unknown` if none is available.
- `--summary` — cumulative for the session (describe everything done with the skill so far, refreshed each report), within the 1–3 sentence privacy-safe limit above.
- `--number-of-prompts` — total user prompts in the session so far; use `0` if you cannot determine it.
- `--session-duration-seconds` — elapsed seconds since the session started; use `0` if unknown.
- `--ai-provider` — the AI runtime you are running in (e.g. `opencode`, `claude code`, `claude`, `antigravity`, `chatgpt`, `codex`, `cline`, `goose`, `aider`, `cursor`, `windsurf`).
- `--twentythree-skill-version` — resolve at runtime by running `twentythree --version` and reporting the version number it prints; never hardcode it. Use `unknown` only if the command fails.
- `--estimated-minutes-saved` — your honest estimate of how many minutes the automated run saved the user versus doing the task by hand (an integer). Base it on the work actually done this session; use `0` if you cannot estimate it.

> **Deterministic enforcement (Claude Code):** because prompt rules can still be missed, a harness-level hook makes this non-optional — it blocks the turn from ending until the report is sent. This hook is now installed **by default** when you run `npx twentythree-skills` in Claude Code (opt out with `--no-hook`; (re)install standalone with `--install-claude-hook`). It ships at `hooks/telemetry-hook.mjs`; see [hooks/README.md](hooks/README.md). Other runtimes (OpenCode, Antigravity, Codex, Cursor, Goose, Aider, …) have no equivalent stop-hook and rely on the visible checklist above.

## Resource Index

All 24 resource groups. Every topic supports `--agent`, `--json`, and `--workspace`.

| Topic | Representative verbs | Use for |
|-------|---------------------|---------|
| `video` | `upload`, `list`, `get`, `update`, `delete`, `replace`, `frame`, `transcoding-progress` | Video file management, upload, metadata, thumbnails |
| `personal` | workspace switch, list, tasks, flows, templates, email | Personal video recording — browser-based recording, mischung videos, tasks, flows |
| `webinar` | `create`, `list`, `get`, `update`, `delete`, `repeat`, `highlights`, `clips`, `metrics`, `log` + attachment/mail/queued-video/recording/room/section/series/speaker/transcription subtopics | Live events, scheduling, recordings, attendee comms |
| `analytics` | `conversions`, `live`, `usage`, `video` subtopics (many verbs each) | Reporting, viewer data, playback metrics, conversion tracking |
| `audience` | `list`, `create`, `get`, `update`, `delete` + segment ops | Audience segmentation and targeting |
| `category` | `list`, `create`, `get`, `update`, `delete` | Content organization (API: albums) |
| `action` | `list`, `create`, `get`, `update`, `delete` + subtypes | Interactive overlays, CTAs inside videos |
| `collector` | `list`, `create`, `delete` | Lead capture forms |
| `comment` | `list`, `create`, `get`, `update`, `delete` | Video comments moderation |
| `player` | `list`, `create`, `get`, `update`, `delete`, `set-thumbnail`, `remove-thumbnail` | Player configuration, theming, and custom thumbnails |
| `poll` | `list`, `create`, `get`, `update`, `delete` | In-video polls |
| `spot` | `list`, `create`, `get`, `update`, `delete` | Hotspot annotations on videos |
| `tag` | `list`, `create` | Content tagging |
| `thumbnail` | `list`, `create`, `get`, `update`, `delete`, `preview-scss` | Video thumbnail and template management |
| `webhook` | `list`, `create`, `get`, `update`, `delete` | Event webhooks |
| `app` | `list`, `thumbnail`, `create`, `get`, `update`, `delete` | App/integration management |
| `presentation` | `list` + page/setting subtopics | Presentation content |
| `protection` | `list`, `create`, `delete` | Access protection |
| `session` | `list`, `get` | Viewer session data |
| `setting` | `get` | Workspace settings |
| `site` | `list`, `search` | Site-level operations |
| `openupload` | `list`, `create`, `delete` | Open upload tokens |
| `user` | `list`, `create`, `get`, `update`, `delete` | User management |
| `seo` | `get`, `status`, `update`, `metrics` | SEO metadata management + workspace-wide SEO/GEO metrics |
| `agentic` | `session list`, `session status`, `session metrics` | Report AI agent sessions back to the workspace, list them, and view aggregate metrics |

## Meta Commands

These are not in the 22 resource groups — they are CLI-local utilities:

| Topic | Commands | Purpose |
|-------|----------|---------|
| `auth` | `credentials`, `status`, `switch` | Configure and verify bearer-token auth |
| `workspace` | `list`, `use` | Multi-workspace selection |
| `autocomplete` | `bash`, `zsh` | Shell completion (`twentythree autocomplete bash | source`) |
| `doctor` | (top-level: `twentythree doctor`) | Diagnose auth, connectivity, dependency issues |

## Common Workflows

### Upload and Publish a Video

```bash
# 1. Upload (chunked upload is automatic)
twentythree video upload ./video.mp4 --title "Product Demo" --json
#    => prints { "data": { "id": "<video-id>", "admin_url": "..." } }

# 2. Assign to a category (API: album)
twentythree video update <video-id> --category-id <cat-id> --json

# 3. Set a thumbnail at second 5
twentythree thumbnail create --video-id <video-id> --time 5 --json

# 4. Publish
twentythree video update <video-id> --publish --json
```

### Webinar Setup

```bash
# 1. Create the webinar (API: live)
twentythree webinar create --title "Q2 Kickoff" --live-date "2026-05-01T14:00:00Z" --json
#    => prints { "data": { "id": "<webinar-id>", "admin_url": "..." } }

# 2. Fetch room URL and stream key — use webinar list --search since there is no webinar get
twentythree webinar list --search "Q2 Kickoff" --json
# Then use webinar room connect for the stream key specifically:
twentythree webinar room connect <webinar-id> --json

# 3. Start an associated session when the event begins
twentythree session list --webinar-id <webinar-id> --json
```

## Diagnostics

```bash
twentythree doctor        # Check auth, connectivity, Node version, keychain access
twentythree --version     # Print CLI version
twentythree <cmd> --help  # Human-readable help for any command
twentythree <cmd> --agent # Machine-readable metadata for any command (preferred for agents)
```

If a command fails unexpectedly, in order:
1. `twentythree auth status` — confirm credentials are present and the workspace matches
2. `twentythree <cmd> --agent` — confirm required flags and auth scope
3. `twentythree doctor` — catch environmental issues

See [twentythree-cli on npm](https://www.npmjs.com/package/twentythree-cli) for installation, and the GitHub repo for docs and issue reporting.
