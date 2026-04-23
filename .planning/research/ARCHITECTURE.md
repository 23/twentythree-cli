# Architecture Patterns

**Project:** twentythree-skills — guide.md integration
**Researched:** 2026-04-23

---

## Current Package Structure

```
packages/twentythree-skills/
  bin/
    add.js                    # installer — walks skills/ recursively, copies everything
  skills/
    SKILL.md                  # top-level index for agent runtimes
    reference/
      action.md
      analytics.md
      app.md
      audience.md
      category.md
      collector.md
      comment.md
      openupload.md
      player.md
      poll.md
      presentation.md
      protection.md
      session.md
      setting.md
      site.md
      spot.md
      tag.md
      thumbnail.md
      user.md
      video.md
      webhook.md
      webinar.md              # 22 reference files total
    workflows/
      upload-and-publish.md
      webinar-lifecycle.md
```

---

## 1. Where guide.md Should Live

**Path:** `packages/twentythree-skills/skills/guide.md`

Place it directly inside `skills/`, not inside `reference/` or `workflows/`. Rationale:

- `reference/` files are scoped reference docs for a single resource group. guide.md spans the entire CLI — it does not belong in that directory.
- `workflows/` files are task-specific step-by-step sequences. guide.md is a behavioral document (how to operate the CLI as an agent), not a workflow.
- Placing it at the `skills/` root gives it the same visibility level as SKILL.md. Agents reading the skill index can find it immediately without descending into subdirectories.
- `bin/add.js` uses `walkDir(skillsSource)` which recurses all of `skills/` without restriction — a file at `skills/guide.md` is automatically picked up with zero installer changes.

---

## 2. bin/add.js Behavior — No Changes Required

`bin/add.js` works as follows (verified against source):

1. `skillsSource = join(__dirname, '..', 'skills')` — the root of the skills tree.
2. `walkDir(skillsSource)` — recursively enumerates every file in `skills/` and all subdirectories. Skips symlinks. Does not filter by extension or filename.
3. For each discovered file, it copies it to the destination preserving the relative path under `skills/`. So `skills/guide.md` is installed to `<destRoot>/guide.md`, and `skills/reference/video.md` is installed to `<destRoot>/reference/video.md`.

**Conclusion:** Adding `skills/guide.md` requires zero changes to `bin/add.js`. The installer picks it up on the next run automatically.

---

## 3. How SKILL.md Should Reference guide.md

### Placement: Before the Resource Index

guide.md should be linked from SKILL.md **before** the Resource Index table. The Resource Index is a look-up table; guide.md is behavioral context that shapes how an agent uses everything below it. Agents reading SKILL.md top-to-bottom should encounter the behavioral guide before scanning commands.

Current SKILL.md section order:
1. Frontmatter
2. Prerequisites: Authentication
3. Multi-Workspace
4. Command Syntax
5. Self-Discovery: The `--agent` Flag
6. Key Invariants
7. Resource Index  ← insert guide.md reference immediately before this
8. Meta Commands
9. Common Workflows
10. Diagnostics

### Section to Insert

Place a new "Behavioral Guide" section between "Key Invariants" and "Resource Index":

```markdown
## Behavioral Guide

For a complete picture of how to operate this CLI as an agent — including decision trees,
error recovery, command sequencing, and anti-patterns — see:

- [TwentyThree CLI Agent Guide](guide.md)

The guide complements this index. Reference files below cover command flags; the guide
covers when and how to chain them.
```

### Why Not After Resource Index

Placing it after the Resource Index risks agents never reaching it — SKILL.md is already long and agents reading it as context may stop after finding the relevant command. The guide is orientation material, not a lookup document.

### Why Not at the Very Top

Prerequisites and Authentication are correctly first — an agent cannot do anything without auth. The guide comes after those setup sections but before the reference material that requires it to be interpreted correctly.

---

## 4. Which Reference Files Need Inline Notes

All 22 reference file headers were read. The following assessment covers every file.

### Existing Coverage Is Strong

Most "agent-trapping" behaviors are already captured inline in the reference files:

| File | Already-present inline callout |
|------|-------------------------------|
| `video.md` | Chunked upload automatic; terminology `video` = API `photo` |
| `webinar.md` | No `webinar get` command (use list + filter); terminology `webinar` = API `live` |
| `category.md` | No `category get` command; `list` works without auth (anonymous scope) |
| `spot.md` | No `spot get` — use `spot check` instead |
| `tag.md` | Tag topic is read-only; create tags via `video update --tags` |
| `user.md` | ALL commands require admin scope (prominently noted at top) |
| `openupload.md` | `upload-file` requires token values from workspace admin |
| `session.md` | Session tokens are for viewer SSO, distinct from CLI auth credentials |

### The Right Model for Inline Notes in Reference Files

Reference files are self-contained lookup docs. They should not duplicate guide.md content — that creates maintenance drift. The only reason to add a note to a reference file is when guide.md contains a decision tree or recovery pattern that directly answers a question a user of that file would have while looking at the command list.

Add a cross-reference note only where guide.md is likely to provide directly relevant decision-tree guidance:

| File | Add cross-reference if guide.md covers... |
|------|-------------------------------------------|
| `video.md` | Video lifecycle sequencing (upload → poll transcoding → set metadata → publish) |
| `webinar.md` | Live-event sequencing (create → publish → room connect → record start → record stop → archive) |
| `user.md` | Auth-scope diagnostic or admin-token verification patterns |
| `analytics.md` | The shared flag pattern across video/live/conversions/usage subtopics, or how to pick the right subtopic |

Files where a cross-reference is NOT warranted (complete and self-contained; guide.md adds nothing specific to the command surface):

`action.md`, `app.md`, `audience.md`, `collector.md`, `comment.md`, `openupload.md`, `player.md`, `poll.md`, `presentation.md`, `protection.md`, `session.md`, `setting.md`, `site.md`, `spot.md`, `tag.md`, `thumbnail.md`, `webhook.md`, `category.md`

### Inline Note Format

Use the existing blockquote pattern already established in the reference files. The convention across the files is `> **Note:**` or `> **Warning:**` inside a blockquote for important callouts. Examples in the current files:

- `> **Chunked upload is automatic.**` (video.md, webinar.md, openupload.md)
- `> **Warning: This action is destructive and cannot be undone.**` (video.md, webinar.md)
- `> **There is no webinar get command.**` (webinar.md)
- `> **ALL user commands require admin scope.**` (user.md)

For guide cross-references, use:

```markdown
> **See also:** [Agent Guide](../guide.md) — decision trees for [topic] sequencing and error recovery.
```

Place the cross-reference note immediately after the opening tagline blockquote at the top of the file (the `> [topic] maps to API [name]` line), before the Prerequisites section. This matches the existing placement of the "no get command" and "read-only" notes in the current files.

Do NOT use:
- A new `## Guide` section header — adds structural noise to reference-style docs
- HTML callout divs — these are plain markdown files with no rendering guarantee
- Placement at the bottom of the file — it will not be seen before the agent starts using commands

---

## 5. Build Order for the Phase

There is no build step — all files are static markdown. Install order is irrelevant because `bin/add.js` processes the whole tree atomically. The authoring order for the phase:

1. **Write `skills/guide.md`** — primary deliverable. All other changes depend on knowing its content and scope.
2. **Update `skills/SKILL.md`** — add the "Behavioral Guide" section linking to `guide.md`. Can only be finalized once guide.md content is known.
3. **Add inline notes to selected reference files** — maximum 4 files (video, webinar, user, analytics). Write these after guide.md is finalized. Only add a cross-reference if guide.md has a section that directly answers a question the reference file's users would have.
4. **Smoke-test the installer** — run `node bin/add.js` from the package root to verify guide.md is copied to the expected runtime directories without error.

Dependencies:
- Steps 2, 3 depend on step 1 (guide.md content must exist)
- Step 4 depends on step 1 (needs the file to be present on disk)
- Steps 2 and 3 are independent of each other and can be done in either order

---

## 6. New vs Modified Files Summary

| Action | File | Notes |
|--------|------|-------|
| NEW | `packages/twentythree-skills/skills/guide.md` | Primary deliverable; no installer changes needed |
| MODIFIED | `packages/twentythree-skills/skills/SKILL.md` | Add "Behavioral Guide" section before Resource Index |
| CONDITIONALLY MODIFIED | `packages/twentythree-skills/skills/reference/video.md` | Add cross-reference blockquote only if guide.md covers video lifecycle sequencing |
| CONDITIONALLY MODIFIED | `packages/twentythree-skills/skills/reference/webinar.md` | Add cross-reference blockquote only if guide.md covers live-event sequencing |
| CONDITIONALLY MODIFIED | `packages/twentythree-skills/skills/reference/user.md` | Add cross-reference blockquote only if guide.md covers auth-scope diagnostics |
| CONDITIONALLY MODIFIED | `packages/twentythree-skills/skills/reference/analytics.md` | Add cross-reference blockquote only if guide.md covers the reporting model or subtopic selection |
| NOT MODIFIED | `packages/twentythree-skills/bin/add.js` | Installer already handles new files automatically via recursive walkDir |
| NOT MODIFIED | 18 remaining reference files | Self-contained; no guide-specific decision trees apply |
| NOT MODIFIED | `skills/workflows/*.md` | Workflows are task-specific sequences; guide.md is orthogonal |

---

## Sources

- `bin/add.js` read directly — recursive `walkDir` with no filename filtering confirms automatic pickup of any new file in `skills/`
- `SKILL.md` read directly — section ordering and blockquote conventions confirmed
- `reference/video.md` read directly — existing inline callout patterns and section structure confirmed
- `reference/webinar.md` read directly — existing inline callout patterns and section structure confirmed
- All 22 reference file headers read directly — inline note coverage and existing callout conventions assessed per file
