# Phase 19: Skill Content - Pattern Map

**Mapped:** 2026-04-20
**Files analyzed:** 24 (22 reference files + 2 workflow files)
**Analogs found:** 24 / 24 (all files follow the SKILL.md house style; no code analogs needed)

---

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `skills/reference/action.md` | reference doc | request-response | `skills/SKILL.md` | role-match (same doc type, narrower scope) |
| `skills/reference/analytics.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/app.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/audience.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/category.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/collector.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/comment.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/openupload.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/player.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/poll.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/presentation.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/protection.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/session.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/setting.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/site.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/spot.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/tag.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/thumbnail.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/user.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/video.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/webhook.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/reference/webinar.md` | reference doc | request-response | `skills/SKILL.md` | role-match |
| `skills/workflows/upload-and-publish.md` | workflow doc | batch / sequential | `skills/SKILL.md` §Common Workflows | partial-match (same doc type, multi-step format) |
| `skills/workflows/webinar-lifecycle.md` | workflow doc | batch / sequential | `skills/SKILL.md` §Common Workflows | partial-match |

---

## Pattern Assignments

### All 22 reference files — shared pattern

**Analog:** `packages/twentythree-skills/skills/SKILL.md`

---

#### Frontmatter pattern (SKILL.md lines 1–23)

Every reference file must open with a YAML frontmatter block. The validator (`validate-skills.mjs`) only checks Gate 1 (root SKILL.md), but consistency with the house style requires `name` and `description` at minimum:

```markdown
---
name: <resource>
description: <one-line description of what this resource group does>
---
```

Minimal valid example for `webhook.md`:

```markdown
---
name: webhook
description: Subscribe to and manage TwentyThree platform event webhooks (video uploads, webinar events, etc.)
---
```

Rules:
- `name` must be the lowercase resource group name matching the filename stem (e.g. `webhook` for `webhook.md`).
- `description` is a single string on one line (no block scalar needed for short descriptions).
- Do NOT add `triggers`, `invocable`, `allowed-tools`, or other SKILL.md-specific keys — those belong only in the root `SKILL.md`.
- The validator does NOT enforce frontmatter on reference files (Gate 2 is file-presence only), but include it for format consistency.

---

#### Document structure pattern (SKILL.md lines 26–211)

Every reference file follows this section order, modeled on SKILL.md:

```markdown
---
name: <resource>
description: <one-line>
---

# TwentyThree <Resource> Commands

> <two-line summary of what agents can do with this resource>

## Prerequisites

Auth scope required: <scope(s)>. Run `twentythree auth credentials` if not already configured.

## Commands

### <resource> <verb>

**Auth scope:** <scope>
**Side effects:** <none | creates | updates | destructive>
**Output:** <table | key-value | none>

Flags:

| Flag | Required | Description |
|------|----------|-------------|
| `--<flag>` | yes/no | description |

```bash
# Basic usage
twentythree <resource> <verb> --json

# Realistic agent usage
twentythree <resource> <verb> --<flag> <value> --json
```

[...repeat for each command in this resource group...]

## Common Patterns

[2–4 realistic multi-flag examples combining commands]

## Terminology Notes

[Only include this section if the resource uses API legacy names different from the CLI name]

CLI `<resource>` = API `<legacy-name>`. Endpoints use `/legacy-name/*`.
When the `--agent` output shows the `api_endpoint` field, the legacy name appears there.
```

Target length: 80–100 lines. For `webinar.md` (40+ commands across 9 subtopics), the line count may reach 150+. The D-01 target is a quality floor — do not truncate content to hit the line cap.

---

#### Code block style (SKILL.md lines 167–195)

Every code block example uses bash fencing:

```markdown
```bash
twentythree video upload ./video.mp4 --title "Product Demo" --json
```
```

Rules from SKILL.md:
- Always include `--json` in every example (agents always use structured output).
- Show at least two examples per command: (1) basic/minimal, (2) realistic agent usage with meaningful flags.
- When redirecting output to a file is idiomatic (e.g. `player embed`), show the redirect in a separate example.

---

#### Auth scope documentation (SKILL.md lines 34–60 and agentMetadata in command files)

The source of truth for auth scope per command is `static agentMetadata.auth_scope` in each command's TypeScript file, accessible at runtime via `twentythree <topic> <cmd> --agent`.

Example from `packages/twentythree-cli/src/commands/webhook/subscribe.ts` lines 38–45:

```typescript
static agentMetadata = {
  api_endpoint: 'POST /webhook/subscribe',
  auth_scope: 'write' as const,
  output_shape: {
    type: 'key-value' as const,
  },
  side_effects: 'creates' as const,
}
```

Reference files must document these values in prose, not TypeScript. The pattern to copy from SKILL.md (lines 102–110):

```markdown
Key fields returned by `--agent`:

- **`auth_scope`** — one of `anonymous`, `none`, `read`, `write`, `admin`, `super`
- **`output_shape`** — `{ type: "table", columns: [...] }`, `{ type: "key-value" }`, or `{ type: "none" }`
- **`side_effects`** — `none`, `creates`, `updates`, or `destructive`
```

In reference files, document this per-command in a brief inline note, not as a full block. Example:

```markdown
### webhook subscribe

**Auth scope:** write  **Side effects:** creates  **Output:** key-value (webhook_id)
```

---

#### `--agent` flag discovery reminder (SKILL.md lines 78–110)

Include a one-line reminder in the Prerequisites section of every reference file directing agents to run `--agent` for undocumented flags:

```markdown
> For any flag not listed here, run `twentythree <resource> <cmd> --agent` to get the complete flag list, types, and defaults.
```

---

### `skills/workflows/upload-and-publish.md`

**Analog:** `packages/twentythree-skills/skills/SKILL.md` lines 165–181 (§Upload and Publish a Video)

The SKILL.md workflow section is a stub — the workflow file expands it into a complete executable sequence.

**Workflow file structure pattern** (extrapolated from SKILL.md §Common Workflows style):

```markdown
---
name: upload-and-publish
description: Upload a video file, set metadata, and publish it on TwentyThree.
---

# Workflow: Upload and Publish a Video

> Complete sequence for uploading a video file and making it publicly visible.
> All commands use `--json` — capture IDs from the `data.id` field of each response.

## Prerequisites

- Auth scope required: **write**
- Run `twentythree auth credentials` if not already configured.
- Confirm auth: `twentythree auth status --json`

## Steps

### 1. (Optional) List categories to find a target category ID

```bash
twentythree category list --json
```

Expected output shape: `{ data: [ { id, title, ... }, ... ] }`  
Capture: `data[n].id` as `category_id`

### 2. Upload the video

```bash
twentythree video upload ./video.mp4 --title "Title" --category-id <category_id> --json
```

Expected output shape: `{ data: { id, admin_url } }`  
Capture: `data.id` as `video_id`

[...continue for each step...]

## Error Handling

| Step | Failure | What to check |
|------|---------|---------------|
| Upload | Network/auth error | `twentythree auth status`, `twentythree doctor` |
| Publish | Permission error | Confirm auth scope is `write` (not `read`) |

```

---

### `skills/workflows/webinar-lifecycle.md`

**Analog:** `packages/twentythree-skills/skills/SKILL.md` lines 183–195 (§Webinar Setup)

Same structure as `upload-and-publish.md`. The existing SKILL.md stub covers steps 1–3 only; the workflow file must cover all 10 steps from RESEARCH.md.

---

## Shared Patterns

### Terminology Notes section

**Source:** `packages/twentythree-skills/skills/SKILL.md` lines 116–122

Only include a Terminology Notes section in reference files where the CLI name diverges from the API name. Copy this pattern:

```markdown
## Terminology Notes

CLI `video` = API `photo`. The `api_endpoint` field in `--agent` output uses the API name (e.g. `GET /photo/list`).
CLI `category` = API `album`. Endpoints: `/album/*`
CLI `webinar` = API `live`. Endpoints: `/live/*`
```

Applies to: `video.md`, `category.md`, `webinar.md`, `comment.md` (comment `--object-type` uses legacy values).

Does NOT apply to: `action.md`, `analytics.md`, `app.md`, `audience.md`, `collector.md`, `openupload.md`, `player.md`, `poll.md`, `presentation.md`, `protection.md`, `session.md`, `setting.md`, `site.md`, `spot.md`, `tag.md`, `thumbnail.md`, `user.md`, `webhook.md`.

---

### Prerequisites block (every file)

**Source:** `packages/twentythree-skills/skills/SKILL.md` lines 34–44

```markdown
## Prerequisites

Auth scope required: <read | write | admin | anonymous>.
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`
```

Tailored per file:
- `user.md` — auth scope: **admin** (all user commands)
- `tag.md` — auth scope: **anonymous** (all tag commands are public)
- `category.md` — auth scope: **anonymous** for list; **write** for create/update/delete
- `session.md`, `site.md` — auth scope: **read**
- `setting.md` — auth scope: **write**

---

### `--json` requirement (every file)

**Source:** `packages/twentythree-skills/skills/SKILL.md` lines 114–115

```markdown
> Always use `--json` in agentic contexts for structured output.
```

Enforce by placing this reminder in the opening blockquote of every reference file, and including `--json` in every code example without exception.

---

### Security warning pattern (`user.md` only)

**Source:** RESEARCH.md §Security Domain + `static agentMetadata` in user command files

The `user update --password` flag is visible in process lists and shell history. The reference file must include:

```markdown
> **Security:** `--password` is visible in process lists and shell history.
> Prefer the admin UI for password changes in sensitive environments.
```

Place this note inline with the `user update` command documentation, not in a separate security section.

---

### Validator-compliant filename rules

**Source:** `packages/twentythree-skills/scripts/validate-skills.mjs` lines 22–27

The `RESOURCE_GROUPS` array is the authoritative filename list. All names are lowercase singular, no hyphens:

```
action, analytics, app, audience, category, collector,
comment, openupload, player, poll, presentation, protection,
session, setting, site, spot, tag, thumbnail, user,
video, webhook, webinar
```

File paths must be exactly:
```
packages/twentythree-skills/skills/reference/<name>.md
```

Validator Gate 2 (`validate-skills.mjs` lines 59–66) checks each entry in this array:

```javascript
for (const group of RESOURCE_GROUPS) {
  const filePath = join(referenceDir, `${group}.md`)
  if (!existsSync(filePath)) {
    errors.push(`Missing reference file: skills/reference/${group}.md`)
  }
}
```

---

## No Analog Found

No files in this phase are truly analog-free — all follow `SKILL.md` house style. However, the following content areas have no existing deep-dive examples in the codebase (planner must instruct implementing agent to run `--agent` for accurate flag data):

| File | Gap | Instruction |
|------|-----|-------------|
| `skills/reference/video.md` — `video section update`, `video section set-thumbnail` | Flags not documented in RESEARCH.md | Run `twentythree video section update --agent` and `twentythree video section set-thumbnail --agent` before writing those sections |
| `skills/reference/video.md` — `video subtitle create/upload/update` | Full flag list not in RESEARCH.md | Run `twentythree video subtitle <cmd> --agent` for each subtitle command |
| `skills/reference/poll.md` — `poll answer`, `poll set-options` | Flags not in RESEARCH.md | Run `twentythree poll answer --agent` and `twentythree poll set-options --agent` |
| `skills/reference/user.md` — `user delete`, `user redeem-login-token` | Flags not in RESEARCH.md | Run `twentythree user delete --agent` and `twentythree user redeem-login-token --agent` |
| `skills/reference/webinar.md` — `webinar speaker`, `webinar mail`, `webinar attachment`, `webinar series`, `webinar section`, `webinar queued-video`, `webinar transcription` | Subtopic flags not in RESEARCH.md | Run `twentythree webinar <subtopic> <cmd> --agent` for each command in each subtopic |
| `skills/reference/thumbnail.md` — `thumbnail file delete` | Flags not in RESEARCH.md | Run `twentythree thumbnail file --help` and `twentythree thumbnail file delete --agent` |

---

## Metadata

**Analog search scope:** `packages/twentythree-skills/skills/` (primary), `packages/twentythree-cli/src/commands/` (agentMetadata source)
**Files scanned:** SKILL.md (full), validate-skills.mjs (full), webhook/subscribe.ts (sample), webhook/events.ts (sample)
**Pattern extraction date:** 2026-04-20
