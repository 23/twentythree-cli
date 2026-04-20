# Architecture: twentythree-skills Package

**Milestone:** Add packages/twentythree-skills to the existing pnpm monorepo
**Researched:** 2026-04-20
**Overall confidence:** HIGH — findings drawn from live codebase, official runtime docs (Claude Code, Codex, Copilot), and ecosystem patterns

---

## Package Structure

### Directory Tree

```
packages/twentythree-skills/
├── package.json                  # npm manifest, bin wiring, files whitelist
├── SKILL.md                      # Top-level index skill (already exists, needs content)
├── skills/                       # One subdirectory per domain area
│   ├── videos/
│   │   └── SKILL.md              # Deep instructions for video commands
│   ├── categories/
│   │   └── SKILL.md
│   ├── webinars/
│   │   └── SKILL.md
│   ├── analytics/
│   │   └── SKILL.md
│   ├── auth/
│   │   └── SKILL.md
│   ├── ... (one per topic area)
│   └── references/               # Shared reference material (optional)
│       └── api-terms.md          # CLI→API term mapping (video=photo, category=album, etc.)
└── bin/
    └── add.js                    # Installer — #!/usr/bin/env node, plain JS, no build step
```

**Why one skill per topic, not one monolithic SKILL.md:** Runtimes have description length limits (Claude Code: no documented limit, but Codex recommends concise descriptions; Copilot caps description at 1024 characters). More importantly, agents perform better with fine-grained skills that describe narrow contexts — "video upload and management" vs "all 219 TwentyThree commands." The top-level `SKILL.md` serves as the entry point; topic skills provide depth.

**Why `skills/` subdirectory, not flat structure:** All three target runtimes scan for `SKILL.md` files recursively. Grouping under `skills/` gives the installer a single source path to copy from and keeps the package root clean.

---

## Skill File Format

All three target runtimes (Claude Code, OpenAI Codex, GitHub Copilot) share the same SKILL.md format:

```markdown
---
name: twentythree-videos
description: |
  Upload, list, update, delete, and manage videos in TwentyThree.
  Use for: uploading video files, retrieving video metadata, updating titles/descriptions,
  managing video sections, subtitles, and thumbnails.
triggers:
  - upload video
  - video list
  - video management
invocable: true
argument-hint: "<command> [flags]"
---

# TwentyThree Video Commands

## Available Commands

| Command | Description |
|---------|-------------|
| `twentythree video upload <file>` | Upload a video file (chunked) |
| `twentythree video list` | List all videos |
| `twentythree video get <id>` | Get video details |
...

## Key Flags

...
## Examples

...
```

**Fields used by all three runtimes:** `name` (required, must match directory name, lowercase-hyphenated), `description` (required, drives implicit activation). All other frontmatter fields (`triggers`, `invocable`, `argument-hint`) are Claude Code/Codex extensions — Copilot ignores unknown fields gracefully.

---

## Installer Design: `bin/add.js`

### Wiring in package.json

```json
{
  "bin": {
    "twentythree-skills": "./bin/add.js"
  }
}
```

Usage: `npx twentythree-skills add` or `npx twentythree-skills add --global`

The installer is a plain `.js` file (no TypeScript, no build step). It is the only executable artifact in the package. Keep it under 200 lines.

### What the Installer Does

```
1. Parse flags: --global (default: false), --target <runtime> (default: auto-detect)
2. Detect which runtimes are present (see detection strategy below)
3. Prompt user if multiple runtimes detected (use @clack/prompts — already a dep of twentythree-cli
   but twentythree-skills should NOT import from twentythree-cli; use a lightweight alternative
   or a simple readline prompt since the installer is tiny)
4. Resolve target directory
5. Copy skills/ tree into target/twentythree/ (creates twentythree/ subdirectory to namespace)
6. Print confirmation: "Installed to ~/.claude/skills/twentythree/"
```

### Runtime Detection Strategy

Detection is directory-based, not environment-variable-based. The installer runs in the user's terminal, not inside the agent, so `CLAUDECODE=1` is not set during `npx twentythree-skills add`. Directory existence is the reliable signal.

```
Detect Claude Code:
  ~/.claude/skills/    →  global install target: ~/.claude/skills/twentythree/
  ./.claude/skills/    →  project install target: .claude/skills/twentythree/

Detect Codex CLI:
  ~/.codex/            →  global: ~/.codex/skills/twentythree/
  ~/.agents/skills/    →  check for .codex/ dir as confirmation
  ./.agents/skills/    →  project: .agents/skills/twentythree/

Detect GitHub Copilot:
  ~/.github/copilot/   →  check if gh CLI is installed: `which gh` + `gh extension list | grep copilot`
  global: ~/.github/skills/twentythree/ (or ~/.copilot/skills/twentythree/)
  project: .github/skills/twentythree/

Detect Cursor:
  ~/.cursor/           →  global: ~/.cursor/skills/twentythree/
  ./.cursor/skills/    →  project: .cursor/skills/twentythree/
```

**Priority when multiple detected:** Prompt the user to choose, or pass `--target claude-code|codex|copilot|cursor`. Default behavior without `--target`: install to all detected runtimes.

**Fallback:** If no runtimes detected, print a help message listing supported runtimes and their install paths. Do not error silently.

### Target Directories (complete reference)

| Runtime | Global Path | Project Path |
|---------|------------|--------------|
| Claude Code | `~/.claude/skills/twentythree/` | `.claude/skills/twentythree/` |
| OpenAI Codex | `~/.codex/skills/twentythree/` | `.agents/skills/twentythree/` |
| GitHub Copilot | `~/.github/skills/twentythree/` | `.github/skills/twentythree/` |
| Cursor | `~/.cursor/skills/twentythree/` | `.cursor/skills/twentythree/` |

Use a `twentythree/` subdirectory in all cases to namespace the skills and avoid collisions with other packages.

### Installer Code Pattern

```javascript
#!/usr/bin/env node
// bin/add.js — skills installer, plain JS, no transpilation needed

import { existsSync, mkdirSync, cpSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const skillsSource = resolve(__dirname, '../skills')
const home = homedir()

// Detection + copy logic here
// No external dependencies — use only node: built-ins
```

**No external dependencies in the installer.** The installer runs as `npx twentythree-skills add` — users may not have the package installed, so no `node_modules` are guaranteed. Use only Node.js built-ins (`node:fs`, `node:path`, `node:os`, `node:readline` for prompts).

---

## Static vs Generated Skill Files

**Recommendation: static (hand-authored) markdown, not generated.**

### Why Static

1. **Quality over coverage.** A generated skill that lists all 219 commands is a command reference manual, not an agent skill. Good skill files explain *when* to use a command group, show realistic workflows, and describe edge cases. This requires authorial judgment — it cannot be generated from `static description` strings and flag lists.

2. **The `agentMetadata` on each command is too sparse.** `{ api_endpoint, auth_scope, output_shape, side_effects }` tells an agent about side effects and output shape but says nothing about when to prefer `video list` over `video get`, how pagination works, or how the upload flow differs from the replace flow. That context is authorial.

3. **Generated skill files go stale in a different way.** A generated file from today's manifest will be accurate today but diverge from the CLI as commands are added/removed. A hand-authored file is intentionally curated and is updated when its content would meaningfully change — not on every build.

4. **The audit-endpoints script already covers coverage tracking.** Command completeness is validated by `scripts/audit-endpoints.mjs` in the CLI package. The skills package does not need to replicate this.

### What "Static" Looks Like in Practice

- One SKILL.md per topic directory (videos, categories, webinars, etc.)
- The top-level SKILL.md is the entry-point description
- `references/api-terms.md` documents the CLI→API terminology mapping (video=photo, category=album, etc.) — this IS generated once and rarely changes
- When a new command topic is added to twentythree-cli, a corresponding skill directory is added to twentythree-skills in the same PR

### The One Generated Artifact

`references/api-terms.md` — the CLI-to-API term mapping — is appropriate to generate from the codebase's `term-map.ts`. This is factual, enumerable, and changes with API updates. Generate it as part of the skills package's `build` script (see below).

---

## Turborepo Integration

### The Problem

The standard turbo `build` task has `"dependsOn": ["^build"]`, meaning every package waits for its dependencies to build. `twentythree-skills` has no TypeScript to compile — its primary artifact is the `skills/` markdown tree.

### Solution: Declare a `build` Task with Empty Outputs

Add a `package.json` `build` script that only generates the one generated artifact:

```json
// packages/twentythree-skills/package.json
"scripts": {
  "build": "node scripts/generate-references.mjs",
  "test": "node scripts/validate-skills.mjs"
}
```

```json
// packages/twentythree-skills/turbo.json (package-level override)
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "dependsOn": [],
      "inputs": ["skills/**/*.md", "scripts/**/*.mjs"],
      "outputs": ["skills/references/api-terms.md"]
    }
  }
}
```

`"dependsOn": []` — the skills package does not depend on `twentythree-cli`'s build. The installer reads static files from the package itself; it does not import anything from the CLI's compiled output.

**Why not `"dependsOn": ["^build"]`:** The skills package doesn't import from twentythree-cli (see Integration Points below). Having it depend on the CLI build would force sequential execution with no benefit.

**If generate-references is skipped initially:** Set `"build": "echo 'no build step'"` and declare `"outputs": []`. Turbo handles empty-output packages gracefully — it caches the task as complete immediately. This is the correct pattern for a package whose "build" is a no-op.

### Full turbo.json Root Impact

No changes needed to the root `turbo.json`. The package-level override (`packages/twentythree-skills/turbo.json`) handles the exception cleanly. Turborepo merges package-level configs with root config using `"extends": ["//"]`.

---

## Monorepo Dependency Graph

```
twentythree-skills
  │
  ├── does NOT import twentythree-cli (runtime or dev dependency)
  │
  └── peerDependency: twentythree-cli (optional, for documentation purposes only)
      "To use these skills, install twentythree-cli: npm install -g twentythree-cli"
```

**`twentythree-skills` does NOT import from `twentythree-cli`.** This is the most important architectural decision. The skills are markdown files that describe the CLI's behavior — they do not need to execute code from the CLI. Adding `twentythree-cli` as a dependency would:
- Create a circular-ish coupling (skills → cli → skills is the conceptual loop)
- Force users who install skills to also install the full CLI as a transitive dep of the skills package
- Create a build ordering constraint in turbo that isn't needed

If the `generate-references.mjs` script needs to read the CLI's `term-map.ts` to generate `api-terms.md`, it reads the file by path within the monorepo — it does not `import()` from the compiled CLI package. This is a script reading source files, not a runtime dependency.

### package.json for twentythree-skills

```json
{
  "name": "twentythree-skills",
  "version": "0.1.0",
  "description": "AI agent skills for the TwentyThree CLI",
  "license": "MIT",
  "type": "module",
  "bin": {
    "twentythree-skills": "./bin/add.js"
  },
  "files": [
    "/bin",
    "/skills",
    "/SKILL.md"
  ],
  "scripts": {
    "build": "node scripts/generate-references.mjs",
    "test": "node scripts/validate-skills.mjs"
  },
  "engines": {
    "node": ">=22.0.0"
  },
  "keywords": ["ai", "skills", "twentythree", "cli", "agent"]
}
```

`"type": "module"` — the installer and scripts use ESM (`import`). The installer runs standalone via `npx`, so ESM is safe (no CJS-interop issues — these are not oclif commands loaded by a CJS host). This is the inverse of the CLI package which is `"type": "commonjs"` due to oclif's CJS loading model.

---

## Publish Strategy

### Linked Versioning via Changesets

The `.changeset/config.json` already has `"linked": [["twentythree-cli", "twentythree-skills"]]`. This means both packages share version bumps — when you run `changeset version`, both packages receive the same new version number.

**This is the correct strategy.** Skill files describe a specific version of the CLI's behavior. Keeping versions in sync makes the relationship explicit: `twentythree-skills@1.2.0` documents `twentythree-cli@1.2.0`. Users can match package versions to confirm compatibility.

### What "Linked" Means in Practice

- `changeset add` creates a changeset that bumps both packages
- `changeset version` increments both to the same new version
- `pnpm publish --filter twentythree-cli --filter twentythree-skills` publishes both in a single CI step
- Neither package needs its own independent release cadence

### Publish Script (root package.json addition)

```json
"publish-all": "pnpm publish --filter twentythree-cli --filter twentythree-skills --no-git-checks"
```

### When to Publish Independently

If the skill content needs a correction independent of a CLI release (e.g., a wrong command example), publish `twentythree-skills` alone with a patch bump. The `linked` config allows independent bumps — it just prevents one package from having a higher major/minor than the other.

---

## Integration Points

### Does twentythree-skills need to import anything from twentythree-cli?

No. The skill files are markdown. The installer copies files. Neither needs to execute CLI code.

The only integration is **one-way documentation**: the skill files describe CLI commands by name, flag syntax, and behavior. This is maintained manually, the same way any documentation is maintained.

### What Changes When a New Command is Added to twentythree-cli

1. The command is added to `packages/twentythree-cli/src/commands/<topic>/`
2. If it's a new topic: add `packages/twentythree-skills/skills/<topic>/SKILL.md`
3. If it's a command in an existing topic: update the relevant skill file
4. Both changes go in the same PR

This is a content maintenance workflow, not a code generation workflow. The audit-endpoints script in the CLI package guards against missing command implementations; the skills package has no equivalent gate (content quality cannot be automated).

---

## New vs Modified Files Summary

### New Files

| File | Type | Notes |
|------|------|-------|
| `packages/twentythree-skills/bin/add.js` | New — installer | Plain ESM JS, node: built-ins only, no deps |
| `packages/twentythree-skills/skills/videos/SKILL.md` | New — skill content | One per topic |
| `packages/twentythree-skills/skills/categories/SKILL.md` | New — skill content | |
| `packages/twentythree-skills/skills/webinars/SKILL.md` | New — skill content | |
| `packages/twentythree-skills/skills/analytics/SKILL.md` | New — skill content | |
| `packages/twentythree-skills/skills/auth/SKILL.md` | New — skill content | |
| `packages/twentythree-skills/skills/references/api-terms.md` | New — generated | From term-map.ts |
| `packages/twentythree-skills/scripts/generate-references.mjs` | New — build script | Reads term-map.ts, writes api-terms.md |
| `packages/twentythree-skills/scripts/validate-skills.mjs` | New — test script | Checks all SKILL.md have valid frontmatter |
| `packages/twentythree-skills/turbo.json` | New — turbo override | `dependsOn: []`, declares outputs |

### Modified Files

| File | Change |
|------|--------|
| `packages/twentythree-skills/package.json` | Add `bin`, `files`, `scripts`, `type: module`, `engines` |
| `packages/twentythree-skills/SKILL.md` | Replace placeholder content with real top-level skill |

### No Changes Needed

| File | Reason |
|------|--------|
| Root `turbo.json` | Package-level override handles the exception |
| Root `package.json` | Already has `pnpm workspace` setup; add `publish-all` script optionally |
| `.changeset/config.json` | Already has correct `linked` configuration |
| `pnpm-workspace.yaml` | Already includes `packages/*` |

---

## Build Order

```
1. Generate references (if implemented):
   node packages/twentythree-skills/scripts/generate-references.mjs
   Reads: packages/twentythree-cli/src/lib/term-map.ts
   Writes: packages/twentythree-skills/skills/references/api-terms.md

2. Validate skill files:
   node packages/twentythree-skills/scripts/validate-skills.mjs
   Reads: packages/twentythree-skills/skills/**/*.md
   Fails: if any SKILL.md missing name/description frontmatter

3. Publish:
   pnpm publish --filter twentythree-skills --no-git-checks
```

The CLI build (`pnpm build --filter twentythree-cli`) is NOT a prerequisite for the skills build. They are independent in the turbo graph.

---

## Anti-Patterns to Avoid

**Don't generate skill files from agentMetadata at install time.** The metadata provides api_endpoint, auth_scope, output_shape, and side_effects. A SKILL.md that just lists these fields is less useful than the `twentythree --help` output the agent can already see. Skill files add workflow context, not command enumeration.

**Don't add twentythree-cli as a runtime dependency of twentythree-skills.** `npx twentythree-skills add` would pull in the entire CLI (oclif, openapi-fetch, keyring, etc.) just to copy markdown files. The installer uses only node: built-ins.

**Don't use a single SKILL.md at the package root as the only skill file.** The current placeholder SKILL.md is a stub. It must be split into per-topic files to be useful — agents work better with scoped, activatable skills than with a single file covering 219 commands.

**Don't put skill files in `dist/`.** There is no dist/ directory for this package. The `files` whitelist in package.json ships `/skills` and `/bin` directly from source.

**Don't make the installer depend on the user having twentythree-cli installed.** The installer copies files — it does not verify CLI installation. Print a note ("Requires twentythree-cli: npm install -g twentythree-cli") but don't block the install.

---

## Sources

- Claude Code skills directory structure: https://code.claude.com/docs/en/skills
- Codex skills directory and SKILL.md format: https://developers.openai.com/codex/skills
- GitHub Copilot skills paths: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- skills-npm pattern (npm package ships skills/ directory): https://github.com/antfu/skills-npm
- skills.sh runtime detection (directory-based): https://github.com/vercel-labs/skills
- Turborepo package-level turbo.json override: https://turborepo.dev/docs/reference/configuration
- Turborepo no-build task pattern: https://turborepo.dev/docs/core-concepts/internal-packages
- Live codebase: packages/twentythree-skills/package.json, .changeset/config.json, turbo.json
