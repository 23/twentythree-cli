# Research Summary: v1.5 — Agent Behavioral Guidelines

**Synthesized:** 2026-04-23
**Milestone:** `twentythree-skills` v1.5 — `guide.md` behavioral document for AI agents

---

## Executive Summary

This milestone adds a single new file (`skills/guide.md`) and two modifications (`SKILL.md` updated,
up to 4 reference files cross-referenced). No tooling, build step, or dependency changes are needed.
The package's recursive installer (`bin/add.js`) picks up any new file under `skills/` automatically.

The central risk is not authoring quality — it is integration failure: guide.md written but never
discovered (SKILL.md not updated), SKILL.md updated but guide.md linked too late in the file (agents
stop reading at the resource index), and guide.md contradicting reference file examples (agents follow
the example, ignore the rule). Each failure mode is silent and produces no errors.

The 7 user-stated behavioral rules divide cleanly into 4 correctness rules (wrong behavior if
violated: wrong API family called, bad scheduling data, broken URLs) and 3 preference rules (extra
round-trips if violated, but correct output). Three implied rules emerge from the reference files that
belong alongside the stated rules. Two flag names require verification before execution (`open_p` and
`--include-analytics`) — these cannot be assumed from user description alone.

---

## Stack Additions / Changes

**None required.** The existing package is static markdown with no build step, no external
dependencies, and ESM module type. The recursive `walkDir` installer requires no modification.

The `npm pack --dry-run` file count assertion (currently 28) will increase by 1 when guide.md is
added. Update the assertion before publishing.

---

## Feature Breakdown

### The 7 User-Stated Rules

**Correctness Rules** (wrong behavior if violated — agents produce incorrect API calls or data):

| # | Rule | Violation Consequence |
|---|------|----------------------|
| 1 | Object type differentiation (video vs webinar) | Wrong API family (`/photo/*` vs `/live/*`); silent wrong results |
| 5 | Webinar creation defaults (no `--publish`, omit `open_p`) | Accidental public, open-registration live event |
| 6 | Timezone handling (pass as-is, do not convert to UTC) | Corrupted scheduling data; platform applies workspace timezone |
| 7 | Admin link construction (URL patterns per resource type) | Agents present bare IDs with no actionable link |

**Preference Rules** (suboptimal but correct behavior if violated):

| # | Rule | Violation Consequence |
|---|------|----------------------|
| 2 | Thumbnails: read URL from listing response first | Extra API round-trip; thumbnail URL already in listing |
| 3 | Analytics: prefer `--include-analytics` on list commands | Extra round-trip to analytics API for simple queries |
| 4 | Filtering/sorting via listing flags | Client-side filtering on full result sets; slower, more memory |

### Three Implied Rules (From Reference Files — Same Priority as Stated Rules)

**Implied A (correctness): No `webinar get` command — use `webinar list --search`.**
`webinar.md` documents this explicitly. Agents default to `<topic> get <id>` and fail silently on
webinars. Group with Rule 1 (object type differentiation).

**Implied B (correctness): `--object-type` flag takes the API name, not the CLI name.**
`comment create --object-type photo` (not `video`), `--object-type live` (not `webinar`). This is
the inverse of the standard terminology mapping. Agents that internalize CLI terms will pass wrong
values. Group with Rule 1.

**Implied C (sequencing): Clips not immediately available after `webinar recording stop`.**
Processing delay before `webinar clips` returns results. Brief note in the webinar defaults section.

### Admin URL Patterns (Rule 7 — Must Be Verified)

These are the four URL patterns stated by the user. Agents use them verbatim — treat as approximate
until confirmed against a live workspace:

- Video: `https://<domain>/manage/video/<id>`
- Webinar: `https://<domain>/manage/webinar/<id>`
- Webinar series: `https://<domain>/manage/webinar/series/<id>`
- User: `https://<domain>/manage/user/<id>`

Workspace domain is retrieved at runtime via `twentythree workspace list --json` — the guide must
state this explicitly as a prerequisite for Rule 7.

### What guide.md Must NOT Include

| Excluded | Reason |
|----------|--------|
| Exhaustive flag tables | Reference files already cover all flags |
| Auth setup instructions | Already in SKILL.md prerequisites section |
| Workflow step-by-step sequences | Already in `skills/workflows/` files |
| API endpoint paths (`/photo/`, `/live/`) | Terminology sections at bottom of each reference file |
| Conditional "it depends" framing | Guide exists to give firm guidance; hedged statements defeat the purpose |
| Rules that only apply to one command | Command-specific rules belong in the relevant reference file as inline notes |

---

## Architecture Decisions

### Where guide.md Lives

**Path: `packages/twentythree-skills/skills/guide.md`**

Not in `reference/` (scoped to single resource groups) and not in `workflows/` (task-specific
sequences). At the `skills/` root, same level as SKILL.md. This ensures:
- `bin/add.js` picks it up automatically (recursive `walkDir` from `skills/` root)
- Agents scanning the skill index can find it without descending into subdirectories

### bin/add.js — No Changes Required

The installer uses `walkDir(skillsSource)` where `skillsSource = join(__dirname, '..', 'skills')`.
It recursively copies every file under `skills/` without filename or extension filtering. Placing
`guide.md` inside `skills/` is sufficient. Verify with `node bin/add.js --project` after adding
the file — `guide.md` must appear in the output.

### How SKILL.md References guide.md

**Placement: Before the Resource Index table, after "Key Invariants" section.**

Current section order in SKILL.md:
1. Frontmatter
2. Prerequisites: Authentication
3. Multi-Workspace
4. Command Syntax
5. Self-Discovery: The `--agent` Flag
6. Key Invariants
7. **Insert "Behavioral Guide" section here**
8. Resource Index
9. Meta Commands
10. Common Workflows
11. Diagnostics

Rationale: Agents often stop reading SKILL.md once they locate a relevant row in the resource
index. The guide.md reference must appear before that table.

Section to insert:

```markdown
## Behavioral Guide

Before executing any multi-step workflow, read [guide.md](guide.md) for standing rules on
object type selection, thumbnail strategy, analytics shortcuts, filtering patterns, webinar
creation defaults, timezone handling, and admin URL construction.
```

### Inline Notes in Reference Files

The existing callout pattern is `> **Note:**` or `> **Warning:**` blockquotes. A cross-reference
to guide.md uses:

```markdown
> **See also:** [Agent Guide](../guide.md) — decision trees for [topic] sequencing and error recovery.
```

Placed immediately after the opening tagline blockquote at the top of the file, before Prerequisites.

Files where a cross-reference is warranted (maximum 4):
- `reference/video.md` — if guide.md covers video lifecycle sequencing
- `reference/webinar.md` — if guide.md covers live-event sequencing
- `reference/user.md` — if guide.md covers auth-scope diagnostics
- `reference/analytics.md` — if guide.md covers subtopic selection

Remaining 18 reference files: self-contained, no guide-specific decision trees apply.

### guide.md Frontmatter

```yaml
---
name: guide
description: Behavioral rules for TwentyThree CLI agents. Use when calling any
  twentythree command — covers object type identification, thumbnail strategy,
  analytics inclusion, filtering patterns, webinar defaults, timezone handling,
  and admin URL output.
user-invocable: false
---
```

`user-invocable: false` hides it from the slash-command menu (it is background knowledge, not a
user command). No `disable-model-invocation`, no `allowed-tools`, no `context: fork`.

### guide.md Structure (4 Sections)

**Section 1 — Object Types**
Rules 1, Implied A, Implied B. Terse statements; one command pair example; single-sentence callout
for the `--object-type` legacy name gotcha.

**Section 2 — Listing Endpoint Patterns**
Rules 2, 3, 4, Implied C. Framing: "Before reaching for a specialized endpoint, check what the
listing command already returns." Two to three filter examples; one-sentence rationales for
thumbnail and analytics shortcuts.

**Section 3 — Webinar Creation Defaults**
Rule 5 alone. One short paragraph; no example needed (flag-omission rule).

**Section 4 — Data Handling**
Rules 6 and 7. Rule 6: one "do not" example. Rule 7: URL template table + prerequisite note to
fetch workspace domain first.

### Build Order for the Phase

1. Write `skills/guide.md` — all other changes depend on its content
2. Update `skills/SKILL.md` — add "Behavioral Guide" section before Resource Index
3. Add inline cross-reference notes to selected reference files (max 4) — only if guide.md has
   a section that directly answers a question the reference file's users would have
4. Smoke-test installer: `node bin/add.js --project` from package root; verify guide.md appears

Steps 2 and 3 are independent of each other; both depend on step 1.

---

## Key Pitfalls to Avoid

### Critical (Silent Failure — No Error, Wrong Behavior)

**guide.md contradicts reference file examples.**
Agents follow the nearest example, not the abstract rule. Before finalizing any guide.md rule,
audit all 22 reference files for command blocks that govern that behavior. Every example that
would violate the rule must either be updated to model it, or the rule must name the exception.

**SKILL.md not updated — guide.md is installed but never read.**
`bin/add.js` copies guide.md correctly regardless. The agent's entry point is SKILL.md. If
SKILL.md does not reference guide.md, the file is invisible. Update SKILL.md in the same PR;
link before the resource index. Block merge if SKILL.md does not reference guide.md.

**guide.md linked too late in SKILL.md — agents stop reading before reaching it.**
The link must appear before the Resource Index table, not after it. Placement after line ~130
(where the resource table starts) means the link exists but is consistently skipped.

**guide.md placed outside `skills/` source root.**
Only files inside `skills/` are copied by `bin/add.js`. A misplaced guide.md (package root,
`docs/`, `skills/draft/`) is silently excluded from all installs with no error.

### Moderate

**Duplicated rules drift between guide.md and reference files.**
Authority split: guide.md owns policy (when and why); reference files forward-reference guide.md
rather than restate rules. One authoritative location; all others point to it.

**guide.md rules at wrong granularity.**
Guide rules are cross-cutting workflow-level rules that apply across multiple resource groups.
If a rule applies to only one command or one resource type, it belongs in that reference file
as an inline note, not in guide.md.

**guide.md uses API terminology (`photo`, `album`, `live`).**
Search guide.md source for these strings before publishing. Add a one-line terminology anchor
at the top: "All terms use CLI names. CLI `video` = API `photo`; CLI `category` = API `album`;
CLI `webinar` = API `live`."

**`npm pack --dry-run` file count assertion becomes stale.**
Current count is 28. Adding guide.md brings it to 29. Update the assertion before publishing.

**Cross-references use non-relative paths.**
All links in guide.md must use relative paths (`reference/video.md`, not GitHub URLs or absolute
paths). The installer preserves directory structure, so relative paths work identically in
installed copies.

---

## Open Questions — Must Resolve Before Writing guide.md

These two flag names could not be verified from reference files alone. The user stated them;
they do not appear in the hand-authored command flag tables. Wrong flag names in guide.md will
cause agents to pass invalid flags and fail silently.

**1. Does `--include-analytics` exist on `video list` and/or `webinar list`?**
Run: `twentythree video list --agent` and `twentythree webinar list --agent`
If the flag does not appear, Rule 3 needs the correct flag name or mechanism.

**2. What is the exact CLI flag name for `open_p`?**
Run: `twentythree webinar create --agent`
If `open_p` does not appear as a CLI flag, Rule 5 may need to reference the underlying API
parameter name and note that the CLI does not expose it directly.

**3. Are the admin link URL patterns confirmed? (Lower priority)**
The four URL patterns were stated by the user. Verify against a live workspace admin console
before hardcoding.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack (no changes needed) | HIGH | Confirmed from direct read of `bin/add.js`, `package.json`, skills directory structure |
| Agent load model and frontmatter | HIGH | Official Claude Code skills docs read directly |
| 5,000-token compaction budget per skill | HIGH | Official Claude Code docs read directly |
| Rule categorization (correctness vs preference) | HIGH | Based on direct reading of reference files and object model |
| Implied rules A, B, C | HIGH | Explicitly documented in `webinar.md` and `video.md` |
| Positive framing and example-anchor compliance improvements | MEDIUM | Multiple practitioner and research sources; not product docs |
| `--include-analytics` flag existence | MEDIUM | User-stated; not confirmed in reference files. Must verify before writing. |
| `open_p` as CLI flag name | MEDIUM | User-stated; not confirmed in reference files. Must verify before writing. |
| Admin URL patterns | MEDIUM | User-stated; cannot verify without live workspace access |
| SKILL.md section placement recommendation | HIGH | Confirmed by reading current SKILL.md section order directly |

**Overall: MEDIUM-HIGH.** Architecture and pitfall guidance is high-confidence (directly verified
against source files). The two unresolved flag names are the only blockers that could require
rework after execution begins.

---

## Files Changed in This Phase

| Action | File |
|--------|------|
| NEW | `packages/twentythree-skills/skills/guide.md` |
| MODIFIED | `packages/twentythree-skills/skills/SKILL.md` |
| CONDITIONALLY MODIFIED | `packages/twentythree-skills/skills/reference/video.md` |
| CONDITIONALLY MODIFIED | `packages/twentythree-skills/skills/reference/webinar.md` |
| CONDITIONALLY MODIFIED | `packages/twentythree-skills/skills/reference/user.md` |
| CONDITIONALLY MODIFIED | `packages/twentythree-skills/skills/reference/analytics.md` |
| NOT MODIFIED | `packages/twentythree-skills/bin/add.js` |
| NOT MODIFIED | 18 remaining reference files |
| NOT MODIFIED | `skills/workflows/*.md` |

---

## Sources (Aggregated)

- Claude Code skills official docs: https://code.claude.com/docs/en/skills (HIGH)
- Anthropic skill authoring best practices: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices (HIGH)
- HumanLayer "Writing a good CLAUDE.md": https://www.humanlayer.dev/blog/writing-a-good-claude-md (MEDIUM)
- Eric Ma "Teaching coding agents with AGENTS.md": https://ericmjl.github.io/blog/2025/10/4/how-to-teach-your-coding-agent-with-agentsmd/ (MEDIUM)
- AGENTIF benchmark (arxiv 2505.16944): directional only (LOW-MEDIUM)
- `bin/add.js`, `SKILL.md`, `reference/video.md`, `reference/webinar.md`, all 22 reference file headers: read directly (HIGH)
- `packages/twentythree-skills/package.json`, `.github/workflows/release.yml`, `.changeset/config.json`: read directly (HIGH)

---

*Synthesized from: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*
*Research date: 2026-04-23*
