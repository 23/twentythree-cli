# Pitfalls Research: twentythree-skills Agent Skills Package

**Domain:** Agent skills package alongside an existing TypeScript/Node.js CLI monorepo
**Researched:** 2026-04-20
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

## Moderate Pitfalls

### 5. Multi-Runtime Path Mismatch

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

### 6. Vague Skill Description — Skill Never Self-Activates

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

### 7. Skill Content Lifecycle After Context Compaction

When Claude Code compacts a conversation, it re-attaches skill content up to 5,000 tokens per skill (25,000 total budget across all skills). If a long session has many skills loaded, the twentythree skill may be dropped entirely after compaction. Instructions written as "one-time setup" stop applying.

**Prevention:** Write every instruction as a standing rule, not a one-time step. "Always run `--json` when the output will be piped." Not "In step 1, run `--json`."

---

### 8. Publish Order Dependency

`twentythree-cli@1.2.0` and `twentythree-skills@1.2.0` ship together. If skills publishes first, any install instruction or peerDependency pointing to `twentythree-cli@1.2.0` fails because the CLI isn't yet on the registry.

**Prevention:** CI pipeline publishes `twentythree-cli` first, waits for registry availability, then publishes `twentythree-skills`. Or use Changesets, which respects dependency graph order automatically.

---

### 9. Agent Assumes Interactive Terminal

Skills may document interactive commands (workspace picker prompts, auth setup wizard) that don't work in non-interactive agent environments. Agents can't respond to `@clack/prompts` interactive selects.

**Prevention:** For every interactive command in the skill, document the non-interactive flags equivalent:
```markdown
# Interactive (human users)
twentythree workspace select

# Non-interactive (agent / CI)
twentythree workspace select --workspace <domain>
```

---

## Minor Pitfalls

### 10. Missing `files` Whitelist for Skill Sub-Directories

If the skills package grows to include `reference/`, `examples/`, or `scripts/` sub-directories (per the progressive disclosure pattern), they must be explicitly listed in `package.json`'s `files` field. The current `files: ["SKILL.md"]` would exclude them.

**Prevention:** Add `"files": ["SKILL.md", "reference/", "examples/", "scripts/"]` and verify with `npm pack --dry-run`.

---

### 11. Version Number Mismatch Between CLI and Skills

If CLI is `v1.2.0` and skills is `v0.1.0`, consumers can't tell if the skill content matches their CLI version. If the skill documents a flag added in CLI v1.1 and the user has CLI v0.9 installed, the agent will fail on that flag with no clear error.

**Prevention:** State the minimum CLI version at the top of SKILL.md:
```markdown
> Requires twentythree-cli >= 1.0.0. Check your version with `twentythree --version`.
```
Use lockstep versioning or explicit `peerDependencies` in `package.json`.

---

### 12. Skill References `npx twentythree-skills add` in Content

If the skill file itself contains instructions like "install skills by running `npx twentythree-skills add`", this creates a circular reference (skill tells you how to install the skill). Worse, if the npm package name is slightly different, agents may hallucinate variations of the command and attempt to `npm install` non-existent packages.

**Prevention:** Keep installer instructions in the README, not in SKILL.md content. Skill content should only reference `twentythree` CLI commands.

---

### 13. Skill Tests Missing for Multiple Model Sizes

Skills behave differently under Claude Haiku (economical, less reasoning), Claude Sonnet (balanced), and Claude Opus (powerful). A skill that works well under Opus may silently under-deliver under Haiku because it assumed more reasoning capability.

**Prevention:** Test the skill against at least Haiku and Sonnet. The twentythree CLI skill should probably include more explicit step-by-step guidance than skills for simpler tools, because the 219-command surface area needs more scaffolding for lighter models.

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
| Version drift management | Manual skill content authored against current CLI only | Automate skill reference sections from `agentMetadata` output; manual narrative is small surface area |
| Multi-runtime compatibility | Assuming all runtimes use same frontmatter fields | SKILL.md standard covers name/description; Claude Code extras (`disable-model-invocation`, `context: fork`) are additive and ignored by other runtimes |
| Terminology in skill | Using CLI-friendly names only (video, webinar) | Document API-to-CLI name mapping for users who know the raw TwentyThree API |

---

## Sources

- Anthropic skill authoring best practices (verified, official): https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- Claude Code skills docs (extend with skills, frontmatter reference): https://code.claude.com/docs/en/skills
- OpenAI Codex skills — install paths and format: https://developers.openai.com/codex/skills
- Agent Skills open standard overview: https://inference.sh/blog/skills/agent-skills-overview
- Vercel skills installer CLI (idempotency, symlink/copy modes): https://github.com/vercel-labs/skills
- Aikido Security — hallucinated npx commands in agent skills: https://www.aikido.dev/blog/agent-skills-spreading-hallucinated-npx-commands
- pnpm workspace:* protocol and publish behavior: https://pnpm.io/workspaces
- npm EACCES permissions errors: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally/
- Multi-platform skill compatibility (Claude Code, Codex, Cursor, Copilot): https://dev.to/nathanielc85523/skillmd-goes-multi-ecosystem-how-the-agent-skills-standard-jumped-from-anthropic-to-openai-and-3oeg
- Writing a good CLAUDE.md (HumanLayer): https://www.humanlayer.dev/blog/writing-a-good-claude-md
- npm global install permission issues (2026): https://github.com/nodejs/node/issues/57548
