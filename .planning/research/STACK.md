# Stack Research: Behavioral Guide Document for AI Agent Skills

**Milestone:** v1.5 — Agent Behavioral Guidelines (`guide.md` for `twentythree-skills`)
**Researched:** 2026-04-23
**Overall confidence:** HIGH — official Claude Code skills docs read directly; LLM instruction-following research reviewed from published sources

---

## Context and Scope

This research covers ONLY what is needed to write a `skills/guide.md` behavioral guidance document
and add inline reinforcement notes to existing reference files. The existing `twentythree-skills`
package (ESM, no build, Node built-ins only, 25 files) requires no new tooling, no new
dependencies, and no changes to its publish pipeline. All findings here are content and structural
guidance, not technology additions.

**What does NOT change:**
- Package toolchain (no build step, ESM, Node 22+, no external deps)
- Installer (`bin/add.js`)
- YAML frontmatter structure in existing `.md` files
- How skills are discovered by agents (SKILL.md already wired correctly)

---

## How AI Agents Parse and Apply Skill Content

Understanding the agent runtime is prerequisite to knowing how to write for it.

### Load model: lazy, description-first

Source: official Claude Code skills docs (code.claude.com/docs/en/skills) — HIGH confidence.

When a skill package is installed, agents load only the `name` and `description` from YAML
frontmatter. The full markdown body of each file is loaded only when that file is explicitly
invoked or referenced. This means:

- `skills/SKILL.md` frontmatter description is always in context (the index)
- Individual reference files (`video.md`, `webinar.md`, etc.) load on demand
- `guide.md` — once invoked or referenced — enters the conversation and stays for the session

**Implication for guide.md:** The guide's `description` frontmatter must be written to trigger
automatic loading whenever the agent is doing TwentyThree work (not just when the user asks for
"a guide"). The body should be compact enough to stay in context once loaded.

### Persistence after load

Once a skill file is loaded into a Claude Code session, its rendered content stays in the
conversation for the rest of the session. Claude Code does not re-read the file on later turns.
After auto-compaction, the first 5,000 tokens of each invoked skill are re-attached, sharing a
combined 25,000-token budget across all invoked skills.

**Implication for guide.md:** Write behavioral rules as standing instructions (apply throughout
the task), not as one-time procedural steps. Keep guide.md under ~400 lines / ~3,000 tokens so
it comfortably fits within the compaction budget.

### Description character budget

All skill descriptions combined are capped at 1,536 characters per skill entry, and the total
listing uses 1% of the context window (fallback 8,000 characters). Front-load the key use case
in the `description` field; later text may be truncated.

---

## Format Conventions for Behavioral Guidance Docs

### What the evidence shows

Sources consulted:
- Claude Code official skills documentation (HIGH confidence)
- HumanLayer blog "Writing a good CLAUDE.md" (MEDIUM confidence — well-cited, references
  LLM instruction-following research)
- Eric Ma "How to teach your coding agent with AGENTS.md" (MEDIUM confidence)
- Agent Skills open standard reference at agentskills.io (MEDIUM confidence)
- LLM instruction-following research: "AGENTIF" (arxiv 2505.16944), "The Instruction Gap"
  (arxiv 2601.03269) (LOW-MEDIUM — academic, not product docs, but directionally consistent)

### Rule 1: Fewer rules, applied consistently

Research finding: LLMs can reliably follow ~150-200 individual instructions. Claude Code's own
system prompt consumes ~50 of that budget. Instruction-following quality degrades uniformly as
rule count increases — agents do not simply ignore new rules, they begin ignoring all rules.

**Implication:** `guide.md` should contain 6-10 high-value behavioral rules, not 30. Each rule
should be universally applicable to TwentyThree work, not a narrow edge-case fix. Rules that
only apply in rare situations belong in the relevant reference file as an inline note, not in
the global guide.

### Rule 2: Positive framing outperforms negative framing

Research finding (HumanLayer/LesswrongAI observation): The positively framed rule ("Always do X")
shows the highest compliance rate across models. Negatively framed rules ("Never do X", "Don't do
Y") show lower and more inconsistent adherence.

**Implication:** Frame rules as positive directives. "Always check `object_type` before calling
`comment create`" rather than "Don't call `comment create` without checking `object_type`."
Where a prohibition is necessary (destructive operations), make it a short, explicit sentence
immediately following the positive instruction.

### Rule 3: Include concrete examples and command syntax

Research finding (AGENTS.md article): Instructions with concrete command examples show better
compliance than abstract principles. Showing the actual CLI invocation gives the agent a
behavioral anchor.

**Implication:** Every rule in `guide.md` should include at least one concrete `twentythree`
command example. For "always use `--json` in agentic contexts," show the flag in the example.
For "always capture `data.id` after create," show the `--json` response shape.

### Rule 4: Explain rationale where it changes behavior

Research finding: Providing a brief "why" helps agents contextualize instructions and apply
them in novel situations. Without rationale, an agent may correctly follow a rule in the
documented case but fail to generalize.

**Implication:** Each rule should include one sentence of rationale. Keep it factual, not
rhetorical. "Because the API uses `photo`, `album`, and `live` as legacy object names, always
use the CLI term in commands and the API term only when reading `api_endpoint` output."

### Rule 5: Use headers for scannability, not just for navigation

AI agents read markdown sequentially when a file is loaded into context. Headers serve as
cognitive anchors that help the agent index the document. Well-structured headers let agents
skip to the relevant section when applying a rule mid-task.

**Implication:** Use `##` headers for each behavioral category (one rule or one closely related
cluster). Avoid burying multiple unrelated rules under a single header.

### Rule 6: Keep guide.md under 400 lines

Claude Code's own guidance says keep SKILL.md under 500 lines; move detailed reference material
to separate files. For a pure behavioral guide (no command reference tables), 200-400 lines is
the right range. Above 400, the file competes with reference files for the compaction budget.

---

## Recommended Document Structure for guide.md

```
---
name: twentythree-guide
description: Behavioral rules for TwentyThree CLI agents. Use when calling any
  twentythree command — covers object type identification, thumbnail strategy,
  analytics inclusion, filtering patterns, webinar defaults, and admin URL output.
user-invocable: false
---

# TwentyThree Agent Behavioral Guide

> [One-sentence scope statement]

## Object Type Identification

[Rule + rationale + example]

## Thumbnail Strategy

[Rule + rationale + example]

## Analytics Inclusion

[Rule + rationale + example]

## Filtering and Sorting Patterns

[Rule + rationale + example]

## Webinar Creation Defaults

[Rule + rationale + example]

## Timezone Handling

[Rule + rationale + example]

## Admin Link Construction

[Rule + rationale + example]

## Destructive Operations

[Rule + rationale — short; cross-reference to SKILL.md's --agent guidance]
```

### Frontmatter decisions

**`user-invocable: false`** — The guide is background knowledge, not a command. Agents should
load it automatically when TwentyThree work is detected. Hiding it from the `/` slash-command
menu prevents user confusion ("why would I invoke /twentythree-guide?"). This is the correct
Claude Code frontmatter for pure reference content. Confirmed in official docs: "`user-invocable:
false` — Use for background knowledge users shouldn't invoke directly."

**No `disable-model-invocation`** — The guide should be auto-loaded by the model when relevant.
`disable-model-invocation: true` would prevent that; omitting it (default false) allows it.

**No `allowed-tools`** — The guide imposes no tool grants. It is a knowledge document.

**No `context: fork`** — The guide should run inline with the main conversation, not in an
isolated subagent.

---

## Inline Notes in Existing Reference Files

### Where inline notes belong

Inline notes serve a different purpose than guide.md: they reinforce a rule at the exact point
of usage. An agent consulting `video.md` to learn how to upload a video should encounter the
thumbnail strategy reminder at the `video upload` command, not only in a separate guide file.

This dual-layer approach (global rule in guide.md + inline reminder at point of use) is more
reliable than either alone, because:
1. The guide establishes the rule when the agent starts working
2. The inline note catches the agent at the moment it is about to make the specific call

### Format for inline notes

Use a blockquote (`>`) immediately following the command header and auth scope line. This places
the note visually after the command signature but before the flag table, where agents read next.

Do not use a numbered list, a separate heading, or a callout box — plain markdown blockquote is
the lightest-weight formatting that visually separates an advisory note from regular prose.

**Pattern:**

```markdown
### video upload

**Auth scope:** write  **Side effects:** creates  **Output:** key-value (id + admin_url)

> After upload, always set a thumbnail using `twentythree video frame <id> --time <N>` or
> `twentythree thumbnail create --video-id <id>`. The default thumbnail is a random frame;
> set it deliberately before publishing.
```

### How many inline notes are appropriate

One note per command maximum. Adding more than one note per command creates visual noise and
competes for the agent's attention. If a command has multiple behavioral considerations, write
one consolidated note covering the most important point, and reference the guide for the rest.

Notes belong only in files where the rule applies at the command level. Do not add a note to
every command in a file — only to the specific commands where the rule is actionable.

---

## What NOT to Add (Tooling)

| Do Not Add | Why |
|------------|-----|
| Markdown linter (markdownlint, remark-lint) | Adds dev dependency; overkill for a static skills package; the existing `scripts/validate-skills.mjs` already checks structure |
| Link checker | No external URLs in guide.md; relative links within the skills dir are stable |
| Callout boxes (GitHub-flavored `> [!NOTE]`) | GitHub renders these visually, but when loaded into an LLM context as plain text the `[!NOTE]` prefix becomes noise; standard blockquote (`>`) is cleaner |
| Frontmatter schema validation | Not needed; Claude Code's runtime is forgiving of extra/missing optional fields |
| Any runtime dependency | The package has zero runtime deps by design; no reason to change that for a markdown content file |
| Numbered rules (Rule 1, Rule 2, ...) | Numbering implies ordinal priority; behavioral rules are not strictly ordered and numbering creates maintenance friction when rules are added or reordered |

---

## SKILL.md Integration

The existing `skills/SKILL.md` uses a resource-group index table. The guide should be added
as a top-level entry before the resource table, given it covers cross-cutting behavior.

Recommended placement:

```markdown
## Behavioral Guide

Before calling TwentyThree commands in an agentic context, consult the
[behavioral guide](guide.md) for rules on object type identification,
thumbnail strategy, analytics, filtering patterns, webinar defaults,
timezone handling, and admin URL output.

## Resource Index
...
```

This ensures the guide is discoverable without moving it into the YAML frontmatter's `triggers`
block, which controls when the SKILL.md itself is loaded (not when the guide is loaded).

---

## Confidence Assessment

| Area | Confidence | Source |
|------|------------|--------|
| Agent load model (lazy, description-first) | HIGH | Official Claude Code docs read directly |
| `user-invocable: false` frontmatter for background knowledge | HIGH | Official Claude Code docs read directly |
| Rule count limits (~150-200 total across system prompt) | MEDIUM | HumanLayer blog citing research; consistent with arxiv papers |
| Positive framing improves compliance | MEDIUM | Lesswrong/HumanLayer reporting on safety rule adherence research |
| Concrete examples improve compliance | MEDIUM | Multiple practitioner sources agree |
| 5,000-token compaction limit per skill | HIGH | Official Claude Code docs read directly |
| Blockquote as inline note format | MEDIUM | Derived from existing patterns in video.md/webinar.md; no contradicting evidence |

---

## Sources

- Claude Code skills official docs: https://code.claude.com/docs/en/skills (HIGH confidence — read directly)
- HumanLayer "Writing a good CLAUDE.md": https://www.humanlayer.dev/blog/writing-a-good-claude-md (MEDIUM)
- Eric Ma "Teaching coding agents with AGENTS.md": https://ericmjl.github.io/blog/2025/10/4/how-to-teach-your-coding-agent-with-agentsmd/ (MEDIUM)
- Agent Skills open standard overview: https://developers.openai.com/codex/skills (MEDIUM)
- AGENTIF benchmark (instruction following in agentic scenarios): https://arxiv.org/abs/2505.16944 (LOW-MEDIUM — directional)
- Existing `skills/SKILL.md`, `skills/reference/video.md`, `skills/workflows/upload-and-publish.md` — read directly (HIGH confidence)

---
*Stack research for: twentythree-skills v1.5 behavioral guide document*
*Researched: 2026-04-23*
