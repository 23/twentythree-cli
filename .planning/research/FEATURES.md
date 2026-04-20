# Feature Research: twentythree-skills npm Publishing + SKILL.md Hyperlinks

**Domain:** npm package publishing UX; AI agent skill file discoverability
**Researched:** 2026-04-20
**Milestone:** v1.4 — Publish twentythree-skills to npm; add hyperlinks to SKILL.md
**Confidence:** HIGH — based on official npm docs (Context7), official Claude Code docs (Context7), and codebase analysis

---

## Background: What This Milestone Is

Two distinct features ship in v1.4:

1. **NPM-01 — Publish twentythree-skills to npm.** The package is complete (22 reference files, 2 workflow files, `bin/add.js` installer). It has not been published. Publishing makes `npx twentythree-skills add` work from any machine without a local clone.

2. **SKILL-03 — Add hyperlinks to SKILL.md resource index.** The Resource Index table in `skills/SKILL.md` lists 22 topics as plain text. Adding `[video](reference/video.md)` links (or the correct relative format) improves discoverability for AI runtimes that follow markdown links when loading skill context.

These are independent. Neither blocks the other.

---

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `npx twentythree-skills add` works without local clone | Users follow README instructions; if the command fails because the package isn't on npm, the README is a lie | Low | Requires `npm publish` with correct `files` field and `bin` entry |
| npm page has a useful README | npmjs.com renders README.md as the package page; developers evaluate packages in 30 seconds from the npm page | Low | README.md is already well-written; it renders on npm page automatically |
| Correct `files` field in package.json | `npm publish` without `files` sends everything including dev files; `files: ["/bin", "/skills", "/README.md"]` is already set correctly | Low | Already correct in `package.json`; no changes needed |
| Version aligned to initial release | npm requires a version; `0.1.0` is present; first publish should be `1.0.0` to signal production readiness alongside `twentythree-cli@1.0.2` | Low | Bump to `1.0.0` on first publish |
| No runtime detected → clear message | When `npx twentythree-skills add` runs on a machine with no supported agent runtime, the user needs to understand why nothing happened | Low | Already handled in `bin/add.js`: prints which dirs were checked + npm URL |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Idempotent install | Running `npx twentythree-skills add` multiple times is safe — it overwrites files in place; no state machine, no error if already installed | Low | Already implemented via `cpSync` with no existence check needed |
| `--project` flag for local install | Installs skills into the current working directory's agent config dirs rather than `~`; supports teams adding skills to a repo | Low | Already implemented; document prominently in README |
| Output shows exactly which files were copied | `✓ SKILL.md`, `✓ reference/video.md` — users can see exactly what landed where | Low | Already implemented; each file prints on copy |
| SKILL.md hyperlinks to reference files | AI runtimes that follow markdown links (Claude Code, Copilot) can navigate from the index directly to `reference/video.md`; no need to manually construct paths | Low | The specific feature of SKILL-03; covered in depth below |
| Keywords for AI-specific discoverability | npm search indexes keywords; adding "claude", "claude-code", "copilot", "cursor", "codex", "ai-agent" alongside "twentythree" maximizes findability for developers searching for AI integrations | Low | Current keywords: `["ai", "skills", "twentythree", "cli", "agent"]`; add runtime-specific terms |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Avoid | What to Do Instead |
|---------|-----------|-------------------|
| Interactive prompts in `npx twentythree-skills add` | Adding a "which runtime do you want?" prompt breaks the auto-detection model; the value is zero-config install | Auto-detect via directory presence; print what was detected; done |
| Publishing to a scoped package (`@twentythree/skills`) | Scoped packages require npm org setup and add friction to `npx` invocation (`npx @twentythree/skills add` is harder to remember than `npx twentythree-skills add`) | Keep `twentythree-skills` as the unscoped name |
| Version pinning in install instructions | Telling users `npx twentythree-skills@1.0.0 add` forces them to manually update; npx uses latest by default | `npx twentythree-skills add` without a version pin; latest is correct behavior |
| Changelog in README | README is the npm page; changelogs belong in CHANGELOG.md or GitHub Releases, not the README | Keep README focused on install + what's included + supported runtimes |
| `--dry-run` flag for the installer | Would add complexity to a 100-line file with no strong use case; the operation is already safe (copy-only, no destructive writes) | Trust idempotent behavior; no dry-run needed |

---

## npm Page Quality: What Makes a Good npm Page

The npm page for `twentythree-skills` is rendered from `README.md`. Key findings from official npm docs:

**What renders well:**
- Heading hierarchy (`#`, `##`, `###`) — creates a table of contents in some npm views
- Code blocks with language tags (` ```bash `) — rendered with syntax highlighting
- Tables — rendered as HTML tables
- Links to GitHub — npm page shows repository link separately but links in README also work

**What does NOT matter on npm:**
- npm keywords appear in search results but not visually on the page; they are metadata only
- The `description` field from `package.json` appears as the one-line subtitle on npmjs.com
- Badge images (shields.io) render on npm pages but are noise for a small utility package

**Recommended improvements to `package.json`:**
```json
{
  "keywords": [
    "ai", "skills", "agent", "twentythree",
    "cli", "claude", "claude-code", "copilot",
    "cursor", "codex", "ai-agent", "video-platform"
  ]
}
```

The current keywords are correct but miss the runtime-specific terms that developers actually search for.

**README quality assessment (current state):**
- Install section: correct and concise
- "What's included" section: accurate; could link to GitHub for the actual file list
- Supported runtimes table: exactly what users need; shows detection path and install destination
- Prerequisites section: correct dependency ordering (install CLI first, then skills)

No structural changes needed to README. The content is correct. The package just needs to be published.

---

## npx UX: Output Messages, Success/Error States

Analysis of `bin/add.js` current output behavior:

**Success — runtimes detected:**
```
Claude Code (~/.claude/skills/twentythree/)
  ✓ SKILL.md
  ✓ reference/video.md
  ✓ reference/analytics.md
  ... (22 more)

Done.
```

**Success — no runtimes detected:**
```
No supported agent runtime detected.

Checked: ~/.claude  ~/.codex  ~/.github/copilot  ~/.cursor

Install manually or see: https://www.npmjs.com/package/twentythree-skills
```

**Error — package corrupted:**
```
Skills source directory not found. The package may be corrupted.
```
(exits with code 1)

**Assessment:** Output is good. There is one missing state worth adding:

**Missing: post-install next-step hint.** After successful install, users don't know what to do next. A one-line hint after "Done." would reduce support burden:

```
Done. Start a new Claude Code session — the twentythree skill is now active.
```

This is a LOW complexity improvement that has HIGH user value (reduces "did it work?" confusion).

---

## SKILL.md Hyperlinks: Link Format for AI Runtimes

### How Claude Code Loads Reference Files

From official Claude Code documentation (code.claude.com/docs/en/skills, confirmed HIGH confidence):

> "Skills can include supporting files like reference documents or example collections within their directory. These files are **not loaded into context by default**, but can be **referenced from SKILL.md to be loaded when needed**."

> "Skills can bundle supporting files like reference documents, templates, or scripts. Claude can access these bundled files **by their names**, as the **skill directory path is prepended to SKILL.md**."

This is the key mechanism: the skill directory path is prepended to SKILL.md before it is presented to the model. This means:
- When the skill is installed to `~/.claude/skills/twentythree/`, the SKILL.md is read with that prefix
- File references in SKILL.md are resolved relative to the skill directory (`~/.claude/skills/twentythree/`)
- A reference to `reference/video.md` resolves to `~/.claude/skills/twentythree/reference/video.md`

### What "Follow Links" Means for AI Runtimes

Claude Code does NOT automatically load all referenced markdown files into context. The mechanism is:

1. SKILL.md is loaded when the skill is triggered
2. References to supporting files are listed in SKILL.md (as markdown links or code paths)
3. Claude reads the file listing and **decides** to load a reference file when it determines the user's request is about that topic
4. The actual loading is done by Claude reading the file — it is not automatic background preloading

This means the value of hyperlinks is:
- **Discoverability:** The model can identify which file to read by following the link label
- **Navigability:** A human editor of SKILL.md can click links in their editor to verify references exist
- **Correctness signal:** A broken link (file missing) is detectable; a plain text name that doesn't match a file is silent failure

### Link Format: `reference/video.md` vs `./reference/video.md`

From the Claude Code docs and plugin development SKILL.md examples found in the official anthropics/claude-code repository:

**Anthropic's own pattern (from plugin-dev SKILL.md examples):**
```markdown
- **`references/patterns.md`** - Common patterns
- **`references/advanced.md`** - Advanced use cases
```

This uses backtick-quoted path names with bold formatting — NOT markdown hyperlinks. The path is presented as text, and Claude resolves it relative to the skill directory.

**Also used: markdown hyperlinks with relative paths:**
```markdown
[video](reference/video.md)
[video](./reference/video.md)
```

Both forms are equivalent for Claude Code's file resolution — the skill directory is prepended either way. The `./` prefix is redundant but not harmful.

**Recommendation: use `[video](reference/video.md)` (without `./`).** Rationale:
- Matches how the official Anthropic plugin examples format paths in SKILL.md body content
- Shorter and cleaner in a table context
- Standard relative markdown link behavior — no `./` needed for same-directory-relative paths
- Both GitHub and npmjs.com render relative markdown links correctly in their web viewers
- AI runtimes that parse markdown links extract the path from the `href` attribute, not the display text; both forms produce the same resolved path

**For the Resource Index table in SKILL.md**, the recommended format is:

```markdown
| Topic | Representative verbs | Use for |
|-------|---------------------|---------|
| [`video`](reference/video.md) | `upload`, `list`, `get`, `update`, `delete` | Video file management |
| [`webinar`](reference/webinar.md) | `create`, `list`, `get`, `update` | Live events |
```

Using backtick-quoted topic name inside a hyperlink: `` [`video`](reference/video.md) `` gives both code formatting (matches how the topic is used in CLI commands) and clickability. This is the clearest pattern for a reference index.

### Other Runtimes

- **GitHub Copilot:** Does not have a documented skill format equivalent to SKILL.md. The current install to `~/.github/skills/twentythree/` is speculative; Copilot's actual file loading mechanism differs from Claude Code. Links in SKILL.md have no special meaning for Copilot's current architecture.
- **Cursor:** Uses `~/.cursor/skills/` but Cursor's skill loading is not as well-documented. Relative markdown links are harmless — Cursor will read SKILL.md as text; links improve human readability.
- **OpenAI Codex:** Follows agentskills.io format; reference file links in SKILL.md are the documented approach for progressive disclosure.

**Conclusion:** Adding hyperlinks to the resource index is a HIGH-value, LOW-risk change. It improves Claude Code discoverability (the primary consumer), improves human readability for all runtimes, and has no downside.

---

## Feature Dependencies

```
npm publish (NPM-01)
  └── requires: package.json version = 1.0.0
  └── requires: bin/add.js works correctly (already verified)
  └── requires: files field correct (already set)
  └── enables: npx twentythree-skills add works from any machine

SKILL.md hyperlinks (SKILL-03)
  └── requires: reference files exist at reference/*.md (already present in skills/reference/)
  └── improves: agent discoverability when skill is active
  └── note: does NOT require npm publish first; can be done independently
```

---

## MVP Definition

### Launch With (v1.4)

- [x] **NPM-01:** `npm publish` with version bumped to `1.0.0` — makes `npx twentythree-skills add` work from any machine
- [x] **SKILL-03:** Replace plain-text topic names in Resource Index table with `` [`topic`](reference/topic.md) `` hyperlinks for all 22 rows
- [x] **Keywords update:** Add `claude`, `claude-code`, `copilot`, `cursor`, `codex`, `ai-agent` to `package.json` keywords before publish

### Add After Validation (v1.x)

- [ ] **Post-install next-step hint:** Add "Start a new Claude Code session" message after `Done.` in `bin/add.js`
- [ ] **Workflow SKILL.md hyperlinks:** After resource index links are proven, add corresponding links to workflow files in the SKILL.md Common Workflows section

### Future Consideration (v2+)

- [ ] **npx version check:** Warn if the installed `twentythree-cli` version is significantly behind the skills package version
- [ ] **GitHub Copilot official format:** If Copilot ships an official skills format, update the installer accordingly
- [ ] **MCP server:** Separate integration pattern; not a skills package feature

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| `npm publish` (NPM-01) | HIGH — blocks all npx users | LOW — one command after version bump | P1 |
| Keywords update | MEDIUM — improves search discoverability | LOW — 5 lines in package.json | P1 (bundle with publish) |
| SKILL.md hyperlinks (SKILL-03) | MEDIUM — improves Claude Code agent UX | LOW — 22 table rows to update | P1 |
| Post-install next-step hint | LOW-MEDIUM — reduces user confusion | LOW — one `console.log` line | P2 |
| Workflow SKILL.md hyperlinks | LOW — agents already follow reference links | LOW — a few more links | P2 |

---

## Sources

- npm package.json `keywords` and `description` fields (official): https://docs.npmjs.com/cli/v11/configuring-npm/package-json (via Context7 /websites/npmjs)
- npm README rendering (GitHub Flavored Markdown, rendered on npmjs.com): https://docs.npmjs.com/about-package-readme-files (via Context7 /websites/npmjs)
- Claude Code skills supporting files (not loaded by default, referenced from SKILL.md): https://code.claude.com/docs/en/skills (via Context7 /websites/code_claude)
- Claude Code skill directory path prepended to SKILL.md (how file references are resolved): https://code.claude.com/docs/en/claude-directory (via Context7 /websites/code_claude)
- Anthropic official SKILL.md reference file pattern (backtick-quoted path, bold format): https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/skill-development/SKILL.md (via Context7 /anthropics/claude-code)
- Claude Code plugin path resolution (`CLAUDE_PLUGIN_ROOT` vs relative paths): https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/command-development/references/plugin-features-reference.md (via Context7 /anthropics/claude-code)
- Codebase: `packages/twentythree-skills/bin/add.js` (current output behavior, installer logic)
- Codebase: `packages/twentythree-skills/package.json` (current keywords, files field, version)
- Codebase: `packages/twentythree-skills/skills/SKILL.md` (current resource index, plain-text topic names)

---
*Feature research for: twentythree-skills npm publishing + SKILL.md hyperlinks (v1.4)*
*Researched: 2026-04-20*
