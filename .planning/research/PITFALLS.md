# Pitfalls Research: twentythree-skills Agent Skills Package

**Domain:** Agent skills package alongside an existing TypeScript/Node.js CLI monorepo
**Researched:** 2026-04-20 (updated 2026-04-23 with behavioral guidance pitfalls)
**Overall Confidence:** HIGH — verified against official Anthropic skill authoring docs, Claude Code skills docs, OpenAI Codex skills docs, npm publish docs, and community research on the Agent Skills standard

---

## Summary Table

| Pitfall | Risk | Prevention | Phase |
|---------|------|------------|-------|
| Skill file too verbose — context budget wasted | Agent ignores or truncates key instructions | Keep SKILL.md body under 500 lines; move detail to referenced sub-files | Content authoring |
| Vague or missing `description` — skill never triggers automatically | Agent never self-selects the skill for relevant tasks | Front-load the exact triggers: "Use when the user asks about videos, webinars, or TwentyThree CLI commands" | Content authoring |
| Nested references (skill links to file that links to file) | Agent uses `head -100` and gets partial content, misses critical guidance | Keep all references exactly one level deep from SKILL.md | Content authoring |
| Skill documents commands that changed or disappeared | Agent produces wrong flags and stale examples | Run `agentMetadata --agent` output as ground truth; automate skill regeneration from manifest | Version drift |
| Auth flow buried or absent in skill | Agent attempts commands without running `auth credentials` first, fails with 401 | Make `twentythree auth credentials` the first step in every skill workflow section | Content authoring |
| Skill assumes OS keychain is already populated | Agent-run environments (CI, containers) have no keychain; skill gives no guidance | Document both interactive auth and non-interactive env var fallback in skill | Content authoring |
| Skill documents CLI terminology, not API terminology | API-aware users or agents pass `photo`/`album`/`live`; all commands fail | Include explicit terminology mapping table in skill | Content authoring |
| Skill hardcodes `--json` output shape and it changes | Agent parses stale JSON shape; silent wrong results | Document the `{ ok, data, summary, breadcrumbs }` shape with a note to verify with `--json` at runtime | Content authoring |
| Runtime-specific installation path assumed universally | Skill installs to `~/.claude/skills/` and breaks on Codex, Cursor, Copilot | Installer must detect runtime and copy/symlink to the correct path per runtime | Installer |
| `npx twentythree-skills add` runs different versions on each invocation | Skill file content drifts across machines in a team | Pin the installer version in team documentation; installer should print version it ran | Installer |
| Installer silently overwrites user-customized skill files | Team members lose local modifications | Detect existing files, print diff, require `--force` to overwrite | Installer |
| Installer assumes write permission to `~/.claude/skills/` | Managed enterprise installs with restricted home dirs fail silently | Check target dir access before writing; print actionable error with fallback path | Installer |
| Hallucinated `npx` package name in skill content | Agent executes non-existent or squatted npm package | Never reference `npx` commands in skill content unless the package is the CLI itself; use direct `twentythree` command names only | Content authoring |
| `twentythree-skills` vs `twentythree-cli` version skew | Skill documents flags from CLI v1.1; user has CLI v1.0 installed | Skill should state minimum CLI version requirement in frontmatter or at the top of SKILL.md | Version drift |
| Skill content enters context window once and stays — instructions written as one-time steps are forgotten | Agent follows workflow step 1 but ignores steps 2–5 | Write standing instructions, not one-time walkthroughs; use "always do X" phrasing | Content authoring |
| `agentMetadata` flag on 219 commands is the source of truth but not used to generate skills | Skills become manually authored and immediately diverge | Automate skill generation from `--agent` output; manually authored sections should be additive, not duplicative | Version drift |
| Monorepo: `workspace:*` protocol published as-is if pnpm not used for publish | `twentythree-skills` with `workspace:*` dep on `twentythree-cli` would be unresolvable for npm consumers | `twentythree-skills` must have zero workspace dependencies on `twentythree-cli`; the relationship is conceptual only | Monorepo publish |
| Monorepo: both packages publish from `pnpm publish --filter` but `prepack` missing from skills package | Stale or missing files ship for skills package | Add `prepack` script to `twentythree-skills/package.json` even if it is just `cp` of generated content | Monorepo publish |
| Monorepo: `files` whitelist in skills package doesn't include all skill sub-files | Skill references a `reference/` or `scripts/` sub-file that isn't in the published tarball | Enumerate skill sub-directories in `files` field; verify with `npm pack --dry-run` | Monorepo publish |
| `twentythree-skills` name may be taken on npm registry | Publish fails with `403 Forbidden` | Run `npm view twentythree-skills` before any publish prep; fallback is `@twentythree/skills` | Monorepo publish |
| Skills package version number diverges from CLI version number | Consumers can't tell if skill version matches CLI version | Use a clear versioning policy: either lockstep with CLI or use independent semver with a `peerDependencies` entry documenting CLI compatibility range | Monorepo publish |
| Claude Code truncates `description` at 1,536 characters in skill listing | Trigger keywords beyond the first paragraph are dropped | Put the highest-value trigger phrases in the first 200 characters of `description` | Content authoring |
| Skill written only for Claude Code; Codex uses `.agents/skills/` not `.claude/skills/` | Codex users get no skill despite installing the package | Installer must place skill in both `~/.claude/skills/` and `~/.agents/skills/` (and other runtime-specific paths) | Installer |
| Skill file uses Windows-style backslash paths in examples | Skill fails on macOS/Linux where the majority of users are | Always use forward slashes in all paths in skill content | Content authoring |
| Skill includes time-sensitive information ("as of April 2026, the API supports...") | Content is wrong within months and undermines agent trust | Use the "old patterns" pattern: current behavior in main body, deprecated behavior in a collapsed `<details>` block | Content authoring |
| Monorepo CI publishes skills package before CLI package | If skills pkg is published first and references CLI v1.2.0 which isn't yet on npm, install instructions are broken | Publish CLI first, skills second; automate with Changesets publish order or explicit CI step ordering | Monorepo publish |
| guide.md contradicts reference file examples | Agent follows the example, ignores the guide rule | Audit all reference files against guide rules before finalizing; examples must model guide behavior | Behavioral guidance |
| SKILL.md not updated to reference guide.md | guide.md is installed but never read | Update SKILL.md body in the same PR that adds guide.md | Behavioral guidance / Integration |
| guide.md not inside `skills/` source root | bin/add.js silently excludes guide.md from installs | Run `node bin/add.js --project` locally after adding guide.md and verify it appears in output | Behavioral guidance / Integration |
| guide.md and reference files both state the same rule | Copies drift; agents see conflicting versions | Authority split: guide.md owns policy, reference files forward-reference guide.md | Behavioral guidance |
| guide.md not linked from SKILL.md body early enough | Agents stop reading SKILL.md once they find the resource index | Link guide.md before the resource index table | Behavioral guidance / Integration |

---

## Critical Pitfalls (Rewrites or Major Issues)

### 1. Auth Flow Absent from Skill

**What goes wrong:** Skills document what commands to run but don't mention that `twentythree auth credentials` is a prerequisite. An agent attempts `twentythree video list` and gets a cryptic 401 or "no credentials found" error. The agent retries, invents flags, and produces noise — none of which fixes the underlying missing auth.

**Why it happens:** Skill authors assume the user is already set up. Agents don't assume anything — they follow the skill exactly. If auth isn't in the skill, the agent doesn't know it's needed.

**Consequences:** Every agent workflow fails until a human intervenes. The skill is effectively unusable in automated contexts.

**Prevention:** The first section of every skill workflow must be:
```markdown
## Prerequisites
Run `twentythree auth credentials` once to store your API token before any command.
The CLI stores credentials in the OS keychain — no plaintext files.
```

**Detection:** Test the skill from scratch with a fresh agent session that has no prior CLI auth.

---

### 2. Skill File Becomes the Source of Truth (Not the CLI)

**What goes wrong:** Skill content is authored manually against the v1.0 CLI. CLI adds flags, renames parameters, or changes output shapes. Skill still says the old thing. Agents use the skill's stale guidance. When they fail, they retry with variations of wrong flags rather than reading `--help`.

**Why it happens:** There is no automated pipeline from CLI changes to skill updates. Skills are documentation, and documentation drifts.

**Consequences:** Skill becomes a liability rather than an asset — it actively misleads agents. 219 commands means 219 places to drift.

**Prevention:** Treat `agentMetadata` (the `--agent` flag output already on all 219 commands) as the canonical machine-readable source. Build a code generation step that produces skill reference sections from `agentMetadata` output. Manually authored narrative content (auth setup, common patterns) lives separately and changes rarely.

**Detection:** Version comparison: `twentythree-skills` version vs `twentythree-cli` version. If they've diverged more than one minor, regenerate.

---

### 3. Installer Overwrites User Customizations

**What goes wrong:** User modifies the installed skill file to add project-specific context or adjust instructions. A later `npx twentythree-skills add` run overwrites the customized file silently.

**Why it happens:** Simple installers use `cp` or `fs.writeFileSync` without checking whether a file already exists or differs from the canonical version.

**Consequences:** Team members stop using the installer. Skill files diverge across machines. Support burden increases.

**Prevention:**
1. Hash the canonical skill content and compare to the installed file
2. If they differ (user has modified it), print a diff and require `--force` to overwrite
3. Offer `--merge` as an option to append new content to existing file
4. Symlink mode (symlinks to a canonical copy in the package) is immune to this problem

---

### 4. `workspace:*` Dependency Leakage

**What goes wrong:** If `twentythree-skills/package.json` ever lists `twentythree-cli` as a `workspace:*` dependency (even as peerDependencies), pnpm replaces it with the resolved version during publish — but only if `pnpm publish` is used. Any CI step using `npm publish` or manual publish will ship `workspace:*` as a literal string, making the package uninstallable.

**Why it happens:** In pnpm monorepos, sibling packages are easy to cross-reference using workspace protocol. Skills package has no runtime code dependency on CLI, but a developer might add it for type imports or convenience.

**Consequences:** Published package is unresolvable. `npm install twentythree-skills` fails immediately.

**Prevention:** `twentythree-skills` must be a zero-dependency package. No `dependencies`, no `devDependencies` that reference `twentythree-cli`. The relationship is purely conceptual — the skill documents how to use the CLI; it does not import it.

---

### 5. guide.md Contradicts Reference File Examples

**What goes wrong:** guide.md states a behavioral rule (e.g., "always poll transcoding-progress before publishing"), but `reference/video.md` shows a minimal shortcut example that skips the poll (`twentythree video upload ./demo.mp4 --publish --json`). An agent reading both surfaces sees two valid paths and picks the shorter one — the example wins because it is closer to the call site.

**Why it happens:** Behavioral rules are written at the guide level in the abstract. Reference file examples are written to demonstrate the minimum viable invocation. The minimum-viable example often violates a rule without the author noticing because both look correct in isolation.

**Consequences:** guide.md rules are silently ignored whenever a reference file example demonstrates a shortcut that violates them. The author sees no error — both files look fine individually.

**Prevention:**
- Before finalizing any guide.md rule, audit every code block in all 22 reference files and both workflow files that relates to that behavior.
- Any example that would violate the rule must either be updated to model the rule, or the rule must explicitly name the shortcut as a valid exception with its conditions stated.
- Write rules against specific commands or flags, not against prose concepts: "Before calling `video update --publish`, confirm `transcoding-progress` returns `status: complete`" is checkable; "prefer safe sequencing" is not.

**Detection:** After drafting guide.md, extract every imperative rule and grep the reference files for the commands or flags that rule governs. Read every matching example. Any example that bypasses the rule without acknowledging it is a conflict.

---

### 6. SKILL.md Not Updated — guide.md Is Never Discovered

**What goes wrong:** guide.md is added to the `skills/` directory. `bin/add.js` copies it correctly (it uses `walkDir` — recursive copy of all files under `skills/`). But SKILL.md, which is the agent's entry point, does not reference guide.md anywhere. Agents load SKILL.md, navigate to the relevant reference file, and never discover guide.md. It is installed on disk and effectively invisible.

**Why it happens:** Adding a file to the directory is mechanical. Updating the index document that agents read first is a separate manual step that is easy to treat as optional.

**Consequences:** The entire behavioral guidance effort produces zero change in agent behavior. guide.md is present on every installed machine and never read.

**Prevention:**
- SKILL.md body must include an explicit reference to guide.md. Place it before the resource index table (agents often stop reading once they find a relevant topic row).
- A one-liner is sufficient: "Before running any command sequence, read `guide.md` for behavioral rules (error recovery, output handling, pre-flight checks)."
- The SKILL.md update and the guide.md addition must ship in the same PR. Block merge if SKILL.md does not reference guide.md.

**Detection:** After adding guide.md, read SKILL.md and confirm it links to guide.md in the body before the resource index.

---

## Moderate Pitfalls

### 7. Multi-Runtime Path Mismatch

Different agents use different skill directories:

| Runtime | User-scoped path | Project-scoped path |
|---------|-----------------|---------------------|
| Claude Code | `~/.claude/skills/<name>/SKILL.md` | `.claude/skills/<name>/SKILL.md` |
| OpenAI Codex | `~/.agents/skills/<name>/SKILL.md` | `.agents/skills/<name>/SKILL.md` |
| GitHub Copilot | VS Code extension settings | `.github/skills/<name>/SKILL.md` |
| Cursor | `~/.cursor/skills/<name>/SKILL.md` | `.cursor/skills/<name>/SKILL.md` |

An installer that only writes to `~/.claude/skills/` silently provides nothing to Codex users. The milestone description lists "Claude Code, Claude.ai, OpenAI Assistants, Codex" as targets — each needs its own write path.

**Prevention:** Installer detects installed runtimes (check for `~/.claude/`, `~/.agents/`, `~/.cursor/` etc.) and writes to each. Print a summary of where files were placed.

---

### 8. Vague Skill Description — Skill Never Self-Activates

The `description` field drives automatic skill loading in Claude Code. If the description says "TwentyThree CLI skills for AI agents" (current state in the existing `SKILL.md`), Claude never loads it unless the user explicitly invokes `/twentythree`. The description must include the trigger phrases users actually say.

**Prevention:**
```yaml
description: >
  Commands for the TwentyThree video platform CLI. Use when the user asks to 
  upload a video, list videos, manage webinars, create thumbnails, work with 
  categories, manage audience segments, or use the twentythree CLI. Covers all 
  219 API commands across video, webinar, analytics, category, audience, 
  action, comment, player, poll, tag, spot, app, and more.
```

---

### 9. Skill Content Lifecycle After Context Compaction

When Claude Code compacts a conversation, it re-attaches skill content up to 5,000 tokens per skill (25,000 total budget across all skills). If a long session has many skills loaded, the twentythree skill may be dropped entirely after compaction. Instructions written as "one-time setup" stop applying.

**Prevention:** Write every instruction as a standing rule, not a one-time step. "Always run `--json` when the output will be piped." Not "In step 1, run `--json`."

---

### 10. guide.md Outside `skills/` Source Root — Silent Omission from Installs

**What goes wrong:** guide.md is written and committed to the repo but placed in the package root, a `docs/` directory, or a `skills/draft/` staging area rather than directly inside `skills/`. `bin/add.js` uses `walkDir(skillsSource)` where `skillsSource = join(__dirname, '..', 'skills')`. Only files inside `skills/` are walked and copied. A misplaced guide.md is silently absent from all installed runtimes.

**Why it happens:** The author treats "the file is in the repo" as equivalent to "the file will be installed." The installer's source root is `skills/`, not the package root.

**Consequences:** Users who run `npx twentythree-skills add` get the package without guide.md. No error is reported. The omission is invisible — the install appears to succeed.

**Prevention:**
- guide.md must live inside `skills/` directly (alongside SKILL.md) or inside a named subdirectory under `skills/` (e.g., `skills/guidance/guide.md`).
- After placing guide.md, run `node bin/add.js --project` in a scratch directory and check the printed file list. `✓ guide.md` (or `✓ guidance/guide.md`) must appear. If it does not, the file is outside the source root.
- Add a smoke-test step to CI or the publish checklist: "run `node bin/add.js --project` in a temp dir and grep output for `guide.md`."

**Detection:** `node bin/add.js --project` output should include the file. Absence means the file is in the wrong location.

---

### 11. Duplication Between guide.md and Reference Files Creates Authority Ambiguity

**What goes wrong:** The same rule appears verbatim in guide.md and in callout blocks across multiple reference files. Over time the copies drift — a default changes, an exception is added to one location but not the other. Agents see two versions of the same rule with no signal about which is current. The reference file version usually wins (it is closer to the call site), meaning guide.md is the one that becomes stale and misleads.

**Why it happens:** Copy-paste at authoring time. When both copies are true, the duplication seems harmless. When one copy is updated, the other is forgotten.

**Prevention:**
- Establish an authority split before writing: guide.md owns behavioral policy (when and why); reference files own call-site facts (flags, defaults, examples). Do not state the same sentence in both.
- Where duplication cannot be avoided (e.g., "use `--json` in agentic contexts" is essential in both SKILL.md and reference files), make reference file callouts forward-reference guide.md rather than restating the rule: "See `guide.md` §Output Rules." One authoritative location; all other locations point to it.
- When updating a rule, search all files in `skills/` for the rule text before committing.

**Detection:** Extract every imperative sentence from guide.md. Grep for equivalent text in reference files. Any verbatim or near-verbatim match should become a cross-reference, not a duplicate.

---

### 12. Publish Order Dependency

`twentythree-cli@1.2.0` and `twentythree-skills@1.2.0` ship together. If skills publishes first, any install instruction or peerDependency pointing to `twentythree-cli@1.2.0` fails because the CLI isn't yet on the registry.

**Prevention:** CI pipeline publishes `twentythree-cli` first, waits for registry availability, then publishes `twentythree-skills`. Or use Changesets, which respects dependency graph order automatically.

---

### 13. Agent Assumes Interactive Terminal

Skills may document interactive commands (workspace picker prompts, auth setup wizard) that don't work in non-interactive agent environments. Agents can't respond to `@clack/prompts` interactive selects.

**Prevention:** For every interactive command in the skill, document the non-interactive flags equivalent:
```markdown
# Interactive (human users)
twentythree workspace select

# Non-interactive (agent / CI)
twentythree workspace select --workspace <domain>
```

---

### 14. guide.md Not Positioned Early in SKILL.md — Agents Stop Reading Before They Reach the Link

**What goes wrong:** SKILL.md is updated to include a link to guide.md, but the link is placed after the resource index table (the 22-row table at line ~130 of the current SKILL.md). Agents often stop reading once they locate the relevant topic row. The guide.md link is present but consistently skipped.

**Why it happens:** The link is added at the end of SKILL.md as an afterthought. Authors assume agents read all of SKILL.md before acting.

**Consequences:** guide.md remains undiscovered despite SKILL.md technically referencing it. The pitfall is harder to catch than missing SKILL.md update entirely, because the reference exists — it is just in the wrong position.

**Prevention:** The guide.md reference must appear in SKILL.md before the Key Invariants section and before the Resource Index table. A good placement: immediately after the "Self-Discovery: The `--agent` Flag" section, as the next section before "Key Invariants." Something like:

```markdown
## Behavioral Rules

See `guide.md` for standing rules that govern command sequencing, error recovery,
and output handling in agentic contexts. Read it before executing any multi-step workflow.
```

---

### 15. guide.md Rules Written at Wrong Granularity

**What goes wrong:** guide.md contains rules so general they add no information ("be careful with destructive operations" — already in reference files with `side_effects: destructive` metadata) or so specific they belong as inline notes ("when calling `video delete`, confirm the ID with `video get` first" — call-site knowledge belonging in `reference/video.md`). Neither type changes agent behavior: the general rules are noise, the specific rules are mis-located.

**Why it happens:** Rule authors write from intuition about what needs emphasis, not from analysis of where in the agent's decision loop the rule should fire.

**Prevention:**
- guide.md rules belong at the workflow-decision level: cross-cutting rules about sequencing, error recovery strategy, output format, and pre-flight checks that apply across multiple resource groups.
- Command-specific rules go in the relevant reference file as inline notes.
- Global rules already in SKILL.md (e.g., "always use `--json` in agentic contexts") should be referenced from guide.md, not restated.
- Useful filter: if a rule only applies to one command or one resource type, it is not a guide.md rule.

---

## Minor Pitfalls

### 16. Missing `files` Whitelist for Skill Sub-Directories

If the skills package grows to include `reference/`, `examples/`, or `scripts/` sub-directories (per the progressive disclosure pattern), they must be explicitly listed in `package.json`'s `files` field. The current `files: ["SKILL.md"]` would exclude them.

**Prevention:** Add `"files": ["SKILL.md", "reference/", "examples/", "scripts/"]` and verify with `npm pack --dry-run`.

---

### 17. Version Number Mismatch Between CLI and Skills

If CLI is `v1.2.0` and skills is `v0.1.0`, consumers can't tell if the skill content matches their CLI version. If the skill documents a flag added in CLI v1.1 and the user has CLI v0.9 installed, the agent will fail on that flag with no clear error.

**Prevention:** State the minimum CLI version at the top of SKILL.md:
```markdown
> Requires twentythree-cli >= 1.0.0. Check your version with `twentythree --version`.
```
Use lockstep versioning or explicit `peerDependencies` in `package.json`.

---

### 18. Skill References `npx twentythree-skills add` in Content

If the skill file itself contains instructions like "install skills by running `npx twentythree-skills add`", this creates a circular reference (skill tells you how to install the skill). Worse, if the npm package name is slightly different, agents may hallucinate variations of the command and attempt to `npm install` non-existent packages.

**Prevention:** Keep installer instructions in the README, not in SKILL.md content. Skill content should only reference `twentythree` CLI commands.

---

### 19. guide.md Frontmatter Missing or Inconsistent With Existing Files

The existing reference files all have YAML frontmatter (`name`, `description`). guide.md added without frontmatter may be skipped by runtimes that index skill files by frontmatter, or may cause parse errors in future tooling that expects frontmatter in all `.md` files under `skills/`.

**Prevention:** Add frontmatter consistent with the existing files:
```yaml
---
name: guide
description: Behavioral rules for using the TwentyThree CLI in agentic contexts — command sequencing, error recovery, output handling, and pre-flight checks.
---
```

---

### 20. Cross-References in guide.md Use Non-Relative Paths

guide.md links to reference files using absolute paths or GitHub URLs. The installed copy of the skills package lives in `~/.claude/skills/twentythree/` (or the equivalent for other runtimes). Absolute paths break on every user's machine. GitHub URLs work but require network access and will drift from the installed version.

**Prevention:** All cross-references in guide.md must use relative paths: `[video commands](reference/video.md)`, not `https://github.com/…/reference/video.md`. The `bin/add.js` installer preserves the directory structure (it uses `relative(skillsSource, absFile)` to reconstruct paths), so relative paths work identically in the installed copy. The existing `workflows/upload-and-publish.md` already demonstrates this pattern: `[`reference/video.md`](../reference/video.md)`.

---

### 21. guide.md Uses API Terminology Instead of CLI Terminology

The existing reference files maintain a strict CLI-domain vocabulary (`video`, `category`, `webinar`) with terminology mapping sections at the bottom. guide.md written by an author closer to the API may slip into API terms (`photo`, `album`, `live`). Agents reading guide.md alongside reference files see inconsistent names and may construct wrong commands.

**Prevention:** guide.md must use CLI-domain terms throughout. Add a one-line anchor at the top: "All terms use CLI names. CLI `video` = API `photo`; CLI `category` = API `album`; CLI `webinar` = API `live`. See `reference/video.md` §Terminology Notes." Before publishing, search the guide.md source for the strings `photo`, `album`, and `live` to catch slips.

---

### 22. Skill Tests Missing for Multiple Model Sizes

Skills behave differently under Claude Haiku (economical, less reasoning), Claude Sonnet (balanced), and Claude Opus (powerful). A skill that works well under Opus may silently under-deliver under Haiku because it assumed more reasoning capability.

**Prevention:** Test the skill against at least Haiku and Sonnet. The twentythree CLI skill should probably include more explicit step-by-step guidance than skills for simpler tools, because the 219-command surface area needs more scaffolding for lighter models.

---

## npm Publish: Second Package in a pnpm Monorepo

This section covers pitfalls specific to the v1.4 milestone: publishing `twentythree-skills` to npm from a monorepo that already publishes `twentythree-cli`.

### P1. CI workflow does not include `twentythree-skills` — it will never be published

**What goes wrong:**
The current `release.yml` builds, tests, and publishes only `twentythree-cli`. A tag push triggers the workflow but `twentythree-skills` is silently skipped. The package stays at `0.1.0` in the monorepo and never reaches the registry.

**Why it happens:**
The workflow was written for one package. Nothing auto-discovers new packages. The omission is invisible — the CI run succeeds.

**How to avoid:**
Add an explicit `pnpm publish` step for `twentythree-skills` after the CLI step:
```yaml
- name: Publish twentythree-skills to npm
  working-directory: packages/twentythree-skills
  run: pnpm publish --no-git-checks --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```
Because `twentythree-skills` has no build step, no `prepack` or build command is needed before this step.

**Warning signs:**
`npm view twentythree-skills` returns 404 after a release tag push. CI log shows no mention of `twentythree-skills`.

---

### P2. `NPM_TOKEN` may not cover `twentythree-skills`

**What goes wrong:**
The `NPM_TOKEN` secret works for `twentythree-cli` publishes. Reusing it for `twentythree-skills` fails with `403 Forbidden` if the token is a Granular Access Token scoped to a specific package list that does not include `twentythree-skills`.

**Why it happens:**
npm Granular Access Tokens can be restricted to specific packages. The first package appeared to validate the token; the second reveals a package-level scope restriction.

**How to avoid:**
Before the first skills publish, verify token scope:
```bash
# In CI, with NODE_AUTH_TOKEN set:
npm whoami --registry https://registry.npmjs.org
npm publish --dry-run  # from packages/twentythree-skills
```
Use an Automation token (not Granular) for the shared secret, or create a dedicated `NPM_TOKEN_SKILLS` secret scoped to `twentythree-skills`.

**Warning signs:**
CI publish step for `twentythree-skills` exits with `403 Forbidden`. The prior `twentythree-cli` step succeeded in the same run.

---

### P3. Bin script `add` argument is silently ignored — documentation mismatches behavior

**What goes wrong:**
The documented invocation is `npx twentythree-skills add`. The `bin` entry maps `twentythree-skills` → `./bin/add.js`. When invoked, `add` lands in `process.argv[2]` and is silently ignored — the installer runs identically whether the user types `npx twentythree-skills`, `npx twentythree-skills add`, or `npx twentythree-skills anything`. This is currently harmless but misleading.

**Why it happens:**
The bin script does not include subcommand routing. The "add" in documentation refers to intent, not a dispatched command.

**How to avoid:**
Either simplify the documented invocation to `npx twentythree-skills` (no argument), or add explicit argv routing so unknown subcommands print usage. Simplifying the docs is lower friction and matches reality.

**Warning signs:**
A user runs `npx twentythree-skills remove` expecting uninstall behavior — the installer runs silently instead.

---

### P4. Tag strategy: one `v*` tag format, two independently-versioned packages

**What goes wrong:**
Both packages share the tag format `v*` (e.g., `v1.4`). With two packages at different versions (`twentythree-cli@1.1.1` and `twentythree-skills@0.1.0`), a single tag push simultaneously triggers publishing both — including a package with no new changes. A skills-only release has no clean trigger without affecting the CLI version.

**Why it happens:**
Monorepo tag conventions were established for one package and carried forward. The `changesets` tool is already present and configured with `"linked": ["twentythree-cli", "twentythree-skills"]` — it is set up for coordinated versioning but is not wired into the CI release pipeline.

**How to avoid:**
For coordinated releases (both packages bump together), the existing approach works. For independent releases, use package-prefixed tags (`cli-v*`, `skills-v*`) with separate CI jobs gated on tag prefix. The simplest short-term fix: wire the existing changesets config into CI using `pnpm changeset publish`, which handles version bumping and tagging per-package automatically.

**Warning signs:**
Manually editing `package.json` version numbers without changesets. Publishing one package inadvertently republishes the other at an unchanged version.

---

### P5. `npm pack --dry-run` file count is the cheapest publish pre-flight check

**What goes wrong:**
A new top-level directory (`/templates`, `/config`) is added to the package during development but not added to the `files` array in `package.json`. Local `npx` invocations work because they run from source. The published tarball silently excludes the new directory. Users get a broken install.

**Why it happens:**
`files` is an allowlist — anything not listed is excluded. Contributors adding directories during development don't think about publish because local behavior is indistinguishable.

**How to avoid:**
Run `npm pack --dry-run` as a CI step before (or in place of) `npm publish --dry-run` and assert the expected file count:
```bash
npm pack --dry-run 2>&1 | grep "total files" | grep -q "28"
```
This breaks if files are accidentally added or removed, forcing a deliberate `files` array update.

**Current state:** `npm pack --dry-run` shows 28 files correctly. The `scripts/` directory (contains `validate-skills.mjs`) is correctly excluded. The `turbo.json` is correctly excluded. No issues detected.

**Warning signs:**
`npm pack --dry-run` file count changes unexpectedly. Installed package fails at runtime with `ENOENT` for a path inside the package.

**Note for guide.md addition:** When guide.md is added to `skills/`, the file count will increase by 1 (to 29). Update the assertion accordingly and verify with `npm pack --dry-run` before publishing.

---

### P6. ESM `"type": "module"` in skills vs CJS `"type": "commonjs"` in CLI — monorepo scripts must use `.mjs`

**What goes wrong:**
`twentythree-skills` sets `"type": "module"`. Any script or test in the monorepo that uses `require('twentythree-skills')` after a local install will fail with `ERR_REQUIRE_ESM`. New scripts added at the monorepo root default to CJS.

**Why it happens:**
The monorepo root and `twentythree-cli` are `"type": "commonjs"`. Developers adding scripts may default to `require()` without checking the target package's module type.

**How to avoid:**
Any new script for `twentythree-skills` must use `.mjs` extension (already done for `validate-skills.mjs` — correct). Any test or CI script that loads skills content must be `.mjs`. Document in the package README that this is an ESM-only package.

**Warning signs:**
`ERR_REQUIRE_ESM: require() of ES Module` in any monorepo script that references `twentythree-skills`.

---

### P7. `pnpm publish` from the wrong working directory

**What goes wrong:**
Running `pnpm publish` from the monorepo root on a `private: true` root package produces `npm error This package has been marked as private`. Running it from the wrong package directory publishes the other package at its current (possibly unchanged) version.

**How to avoid:**
Always set `working-directory: packages/twentythree-skills` explicitly in each CI publish step. For local testing, `cd packages/twentythree-skills && npm pack --dry-run` confirms the correct tarball before any real publish.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Skill content authoring | Writing verbose, encyclopedic content instead of lean trigger-based content | Keep SKILL.md body under 500 lines; use progressive disclosure with sub-files |
| Auth section | Assuming agent knows to run auth first | Explicit prerequisite section in every skill workflow |
| Keychain documentation | Assuming OS keychain works in CI/container | Document env var fallback path; note which environments are supported |
| Installer implementation | Writing to only Claude Code's path | Runtime detection loop covering all supported agents |
| Installer implementation | Silent overwrite of modified files | Hash comparison + `--force` requirement |
| Skills package publish | Adding `workspace:*` dependency on CLI | Zero-dependency package — skills package has no runtime imports |
| Skills package publish | Publishing before CLI is on registry | CLI publishes first; automate with Changesets |
| Skills package publish | CI workflow missing skills publish step | Add explicit `working-directory: packages/twentythree-skills` publish step to `release.yml` |
| Skills package publish | NPM_TOKEN scope too narrow | Verify token covers `twentythree-skills` with `npm publish --dry-run` before first real publish |
| Skills package publish | `files` array missing new directories | Run `npm pack --dry-run` and assert file count in CI; file count increases by 1 when guide.md is added |
| Version drift management | Manual skill content authored against current CLI only | Automate skill reference sections from `agentMetadata` output; manual narrative is small surface area |
| Multi-runtime compatibility | Assuming all runtimes use same frontmatter fields | SKILL.md standard covers name/description; Claude Code extras (`disable-model-invocation`, `context: fork`) are additive and ignored by other runtimes |
| Terminology in skill | Using CLI-friendly names only (video, webinar) | Document API-to-CLI name mapping for users who know the raw TwentyThree API |
| Adding guide.md | guide.md contradicts reference file examples | Audit all 22 reference files against each rule before finalizing guide.md |
| Adding guide.md | SKILL.md not updated | Update SKILL.md in the same PR; link guide.md before the resource index table |
| Adding guide.md | guide.md placed outside `skills/` source root | Run `node bin/add.js --project` and verify guide.md appears in install output |
| Adding guide.md | Duplicated rules drift between guide.md and reference files | Authority split: guide owns policy; reference files forward-reference guide.md |
| Adding guide.md | guide.md rules at wrong granularity | Limit guide.md to cross-cutting workflow-level rules; command-specific rules stay in reference files |
| Adding guide.md | guide.md uses API terminology | Search for `photo`, `album`, `live` strings before publishing; add terminology anchor at top of guide.md |
| Adding guide.md | `npm pack --dry-run` file count assertion stale | Update assertion from 28 to 29 (or current count + 1) after adding guide.md |

---

## Sources

- Anthropic skill authoring best practices (verified, official): https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- Claude Code skills docs (extend with skills, frontmatter reference): https://code.claude.com/docs/en/skills
- OpenAI Codex skills — install paths and format: https://developers.openai.com/codex/skills
- Agent Skills open standard overview: https://inference.sh/blog/skills/agent-skills-overview
- Vercel skills installer CLI (idempotency, symlink/copy modes): https://github.com/vercel-labs/skills
- Aikido Security — hallucinated npx commands in agent skills: https://www.aikido.dev/blog/agent-skills-spreading-hallucinated-npx-commands
- pnpm workspace:* protocol and publish behavior: https://pnpm.io/workspaces (HIGH confidence — official docs, verified via Context7)
- npm `bin` field shebang requirement: https://docs.npmjs.com/cli/v11/configuring-npm/package-json#bin (HIGH confidence — official docs, verified via Context7)
- npm `files` allowlist behavior: https://docs.npmjs.com/cli/v11/configuring-npm/package-json#files (HIGH confidence — official docs)
- npm EACCES permissions errors: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally/
- Multi-platform skill compatibility (Claude Code, Codex, Cursor, Copilot): https://dev.to/nathanielc85523/skillmd-goes-multi-ecosystem-how-the-agent-skills-standard-jumped-from-anthropic-to-openai-and-3oeg
- Writing a good CLAUDE.md (HumanLayer): https://www.humanlayer.dev/blog/writing-a-good-claude-md
- npm global install permission issues (2026): https://github.com/nodejs/node/issues/57548
- Actual repository state inspected directly: `packages/twentythree-skills/package.json`, `packages/twentythree-skills/bin/add.js`, `.github/workflows/release.yml`, `.changeset/config.json` (HIGH confidence)
- Observed package structure: `skills/` directory — 25 files across SKILL.md, 22 reference files, 2 workflow files (HIGH confidence — directly inspected)
- `bin/add.js` installer logic: `walkDir(skillsSource)` where `skillsSource = join(__dirname, '..', 'skills')` — recursive copy of all files in `skills/`; no name or extension filtering (HIGH confidence — directly read)
- SKILL.md loading path: agents read SKILL.md as the entry point; files not referenced from a loaded file are not automatically discovered (HIGH confidence — consistent with all runtime documentation)
- Existing inline note patterns: `reference/video.md` uses callout blocks for chunked upload, terminology, and side effect warnings — establishes the convention that guide.md additions must follow (HIGH confidence — directly read)
- Cross-reference pattern in existing package: `workflows/upload-and-publish.md` uses relative paths (`../reference/video.md`) — the correct pattern for guide.md (HIGH confidence — directly read)
