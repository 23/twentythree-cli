# Phase 18: Package Foundation - Research

**Researched:** 2026-04-20
**Domain:** npm package scaffold, turborepo no-build override, ESM package.json, SKILL.md format, CI validation script
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Skill files live under `skills/` subdirectory — NOT at package root
  - `skills/SKILL.md` — root skill (the full shell)
  - `skills/reference/` — per-resource reference files (Phase 19)
  - `skills/workflows/` — multi-step automation workflows (Phase 19)
  - The existing placeholder `packages/twentythree-skills/SKILL.md` moves to `packages/twentythree-skills/skills/SKILL.md`

- **D-02:** `"type": "module"` (ESM) — no TypeScript compilation, no build step
  - The installer bin (`bin/add.js`) is a native ESM script using `node:` built-ins
  - Node 22 engines constraint (matches the CLI)
  - `turbo.json` override marks the package as no-build

- **D-03:** Root SKILL.md scope (`skills/SKILL.md`) — full shell, immediately useful without Phase 19 reference files
  - Full auth setup section: `twentythree auth credentials` as prerequisite, workspace select, multi-workspace switching
  - Complete resource index: all 22 resource groups with `twentythree <topic>` syntax
  - `--agent` flag documentation: how agents should introspect any command before calling it
  - `allowed-tools: Bash(twentythree *)` YAML frontmatter field to pre-approve all CLI calls
  - Workflow notes: common multi-step patterns (upload + publish, webinar setup)
  - 22 resource groups: action, analytics, app, audience, auth, autocomplete, category, collector, comment, openupload, player, poll, presentation, protection, session, setting, site, spot, tag, thumbnail, user, video, webhook, webinar, workspace

### Claude's Discretion

- validate-skills script format (JS vs bash — prefer .mjs for portability)
- Exact SKILL.md `description` wording and `triggers` frontmatter values
- `files` array ordering and exact whitelist entries in package.json

### Deferred Ideas (OUT OF SCOPE)

- Runtime installer logic (bin/add.js directory detection, file copy, --project flag) — Phase 20
- 22 resource reference files — Phase 19
- Workflow files — Phase 19

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PKG-01 | `packages/twentythree-skills` exists as a standalone npm package with ESM type, `bin` entry wiring `twentythree-skills add`, and `files` whitelist that excludes dev artifacts | Exact current stub state documented; exact fields needed identified; bin entry must point to `./bin/add.js` |
| PKG-02 | A `turbo.json` override in `packages/twentythree-skills` marks the package as no-build so turborepo does not attempt to compile static skill files | Package-level turbo.json pattern for Turbo v2.9.6 with `"extends": ["//"]` confirmed; exact task config documented |
| PKG-03 | A `validate-skills` script checks all skill files for valid SKILL.md frontmatter (`name`, `description`) and that all 22 resource groups have a corresponding reference file — runs as part of CI | Script strategy (pure Node.js, manual YAML frontmatter parsing, no gray-matter) documented; 22 group list confirmed |
| SKILL-01 | Root `SKILL.md` (~200 lines) includes auth setup, command syntax overview, full resource index, `--agent` flag documentation, and `allowed-tools: Bash(twentythree *)` declaration | Live `--agent` output sampled; auth commands verified; exact frontmatter format confirmed from existing placeholder |

</phase_requirements>

---

## Summary

Phase 18 bootstraps the `packages/twentythree-skills` directory from its current 2-file stub into a fully wired publishable npm package. The stub already has `package.json` (missing `type`, `bin`, `engines`, `scripts`, `author`, `repository`, `keywords`) and `SKILL.md` at the package root (wrong location per D-01 — must move to `skills/SKILL.md`). All work is additive: extend the existing `package.json`, create `skills/SKILL.md`, `bin/add.js` (empty/stub for Phase 20), `scripts/validate-skills.mjs`, and `turbo.json`.

The package is deliberately no-build: `"type": "module"`, no TypeScript, no tsdown. The only executable is `bin/add.js` — a stub in Phase 18 (Phase 20 adds the runtime detection logic). The `turbo.json` override uses the Turbo v2 `"extends": ["//"]` pattern with `"dependsOn": []` to opt out of the build pipeline.

The root `skills/SKILL.md` is the phase's primary content deliverable: a ~200-line document covering auth setup, command syntax, the 22-group resource index, `--agent` self-discovery documentation, and `allowed-tools: Bash(twentythree *)`. The existing placeholder frontmatter (`name: twentythree`, with `triggers`, `invocable`, `argument-hint`) provides the structural template.

**Primary recommendation:** Work in this order: (1) extend `package.json`, (2) create `turbo.json` override, (3) create `bin/add.js` stub, (4) write `skills/SKILL.md`, (5) write `scripts/validate-skills.mjs`. Remove original `SKILL.md` once `skills/SKILL.md` is written.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Package manifest (ESM, bin, files) | Static config | — | Pure package.json fields; no runtime logic |
| No-build turborepo config | Static config | — | Package-level turbo.json override; affects CI pipeline only |
| Bin entry stub | Node.js script | — | Placeholder for Phase 20; Phase 18 only wires the entry |
| validate-skills.mjs | Node.js script | — | CI script reading filesystem + parsing YAML frontmatter manually |
| skills/SKILL.md content | Markdown content | — | Consumed by AI agent runtimes at activation time; no runtime code involved |

---

## Existing Package Stub — Current State

**Verified by direct codebase inspection.** [VERIFIED: codebase read]

`packages/twentythree-skills/` currently contains exactly 2 files:

### Current `package.json` (the stub to extend)

```json
{
  "name": "twentythree-skills",
  "version": "0.1.0",
  "description": "AI agent skills for the TwentyThree CLI",
  "license": "MIT",
  "files": [
    "SKILL.md"
  ],
  "keywords": ["ai", "skills", "twentythree", "cli"]
}
```

**Missing fields** (all must be added in Phase 18):
- `"type": "module"` — required by D-02
- `"bin"` — required by PKG-01
- `"engines": { "node": ">=22.0.0" }` — per D-02
- `"scripts"` — `validate-skills` for CI (PKG-03); `prepack` for safety
- `"author"`, `"repository"`, `"bugs"`, `"homepage"` — match CLI package for consistency
- `files` array needs to be updated: `["SKILL.md"]` must become `["/bin", "/skills", "/README.md"]` and drop the root `SKILL.md` (which moves to `skills/SKILL.md`)

### Current `SKILL.md` (the placeholder to move)

```yaml
---
name: twentythree
description: |
  TwentyThree CLI skills for AI agents.
  Commands for managing videos, categories, webinars, and all TwentyThree resources.
triggers:
  - twentythree
  - video platform
  - webinar management
invocable: true
argument-hint: "<command> [flags]"
---
```

Body: stub text saying "Skills content is a work in progress."

**Phase 18 action:** Move this file to `skills/SKILL.md` and replace body with full content per D-03. Keep the frontmatter structure; expand `description` and `triggers`.

---

## Standard Stack

### Core (all verified from codebase)

| Library/Tool | Version | Purpose | Status |
|-------------|---------|---------|--------|
| Node.js built-ins | 22.22.2 installed | `fs`, `path`, `os`, `readline` for validate-skills.mjs and bin stub | [VERIFIED: node --version] |
| Turborepo | 2.9.6 (installed) | Pipeline; package-level `turbo.json` override for no-build | [VERIFIED: pnpm-lock.yaml] |
| pnpm workspaces | `packages/*` | Already includes `packages/twentythree-skills` | [VERIFIED: pnpm-workspace.yaml] |

### Supporting (if needed for test step)

| Library/Tool | Version | Purpose | When to Use |
|-------------|---------|---------|-------------|
| vitest | 4.1.4 (in CLI devDeps) | Test runner for validate-skills unit tests | Only if validate-skills.mjs has unit tests; Phase 18 can run the script directly as `"test": "node scripts/validate-skills.mjs"` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual YAML frontmatter parse | gray-matter | gray-matter adds a dependency; manual `---` block extraction is 10 lines of Node.js and sufficient for the narrow use case (just `name` + `description` validation) |
| `node scripts/validate-skills.mjs` as test | vitest wrapping the script | Vitest adds setup overhead; script exits non-zero on failure which is all CI needs |

---

## Architecture Patterns

### System Architecture Diagram

```
package.json (ESM manifest)
  └── bin entry: ./bin/add.js  ─────────────────► bin/add.js (stub)
        (Phase 20 adds runtime detection)              └── exits 0

scripts/validate-skills.mjs  ◄─── CI test task ──── turbo.json (no-build override)
  └── reads: skills/SKILL.md  (frontmatter: name, description required)
  └── reads: skills/reference/*.md  (22 files — Phase 19 creates them)
  └── exits 0 (all present + valid) or 1 (missing/invalid)

skills/
  └── SKILL.md  ◄──────────────────────── moved from package root
        └── frontmatter: name, description, allowed-tools, triggers
        └── body: auth setup + syntax + 22-group resource index + --agent docs
  └── reference/   (Phase 19)
  └── workflows/   (Phase 19)
```

### Recommended Package Structure

```
packages/twentythree-skills/
├── package.json          # Extended from stub: type=module, bin, engines, scripts, files
├── turbo.json            # New: no-build override for Turbo v2
├── bin/
│   └── add.js            # New: ESM bin stub (Phase 20 adds logic)
├── scripts/
│   └── validate-skills.mjs  # New: CI validation script
└── skills/
    └── SKILL.md          # Moved + rewritten from package root placeholder
```

### Pattern 1: Turborepo v2 Package-Level No-Build Override

**What:** A `turbo.json` at the package root that extends root config and overrides the `build` and `test` tasks for this package only.

**When to use:** When a package in the monorepo has no TypeScript to compile and should not participate in the build pipeline.

```json
// packages/twentythree-skills/turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "dependsOn": [],
      "inputs": ["skills/**/*.md"],
      "outputs": []
    },
    "test": {
      "dependsOn": [],
      "inputs": ["skills/**/*.md", "scripts/validate-skills.mjs"]
    }
  }
}
```

`"extends": ["//"]` means "inherit root turbo.json and override selectively." [VERIFIED: Turbo v2.9.6 schema confirms `extends` is a top-level property]

`"dependsOn": []` on `build` removes the `^build` dependency — skills package does not wait for CLI to compile. [VERIFIED: ARCHITECTURE.md, cross-checked with Turbo schema]

The root `turbo.json` `test` task has `"dependsOn": ["build"]` — the override removes this so `pnpm test` doesn't trigger a build for the skills package.

### Pattern 2: ESM Bin Stub

**What:** A minimal `bin/add.js` that satisfies the PKG-01 bin wiring requirement without implementing Phase 20 logic.

**When to use:** Phase 18 only needs the file to exist and be executable. Phase 20 replaces the body.

```javascript
#!/usr/bin/env node
// bin/add.js — TwentyThree Skills installer
// Full runtime detection and file copy logic is implemented in Phase 20.
// This stub exists to wire the bin entry and validate the package structure.

console.error('twentythree-skills add: installer not yet implemented')
process.exit(1)
```

The `#!/usr/bin/env node` shebang is required for global/npx execution. The file must be executable (`chmod +x`). [ASSUMED — standard Node.js bin pattern; no verification needed]

### Pattern 3: Manual YAML Frontmatter Parsing for validate-skills.mjs

**What:** Parse YAML frontmatter in SKILL.md files without a dependency, using only Node.js built-ins.

**When to use:** CI validation script that checks `name` and `description` presence — no need for a full YAML parser.

```javascript
// scripts/validate-skills.mjs
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const skillsDir = join(__dirname, '..', 'skills')

function parseFrontmatter(content) {
  // Frontmatter is between the first --- and second ---
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null
  const fm = {}
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      const val = line.slice(colonIdx + 1).trim()
      if (val && !val.startsWith('|')) fm[key] = val
    }
  }
  return fm
}
```

This covers the `key: value` style for `name` — sufficient for the narrow validation need. Multi-line `description` with `|` block scalar is harder to parse manually; the validator can check that the key exists without parsing the value. [VERIFIED: inspected existing SKILL.md placeholder — `name` is single-line, `description` uses `|` block scalar]

### Pattern 4: SKILL.md Frontmatter for skills/SKILL.md

**What:** Full frontmatter matching agentskills.io spec + Claude Code extensions.

**Reference:** Existing placeholder frontmatter provides the template; expand it.

```yaml
---
name: twentythree
description: |
  Full TwentyThree video platform CLI. Use when the user asks to upload or manage
  videos, run webinars, query analytics, manage audiences, configure players,
  create categories, handle tags, spots, thumbnails, webhooks, or any other
  TwentyThree platform operation. Covers all 239 commands across 25 topics.
triggers:
  - upload video
  - video management
  - webinar
  - twentythree cli
  - video platform
  - analytics
  - manage videos
invocable: true
argument-hint: "<topic> <verb> [flags]"
allowed-tools: Bash(twentythree *)
compatibility: Requires Node.js >=22 and twentythree-cli installed globally (npm install -g twentythree-cli)
---
```

[VERIFIED: frontmatter structure from existing placeholder; `allowed-tools` field from FEATURES.md research citing Claude Code docs]

### Anti-Patterns to Avoid

- **`files: ["SKILL.md"]` at package root:** The root placeholder SKILL.md moves to `skills/SKILL.md`; the files whitelist must reference `/skills` not a root file. The existing `files` value is wrong after D-01.
- **`workspace:*` dependency on twentythree-cli:** twentythree-skills has no runtime code dependency on the CLI. Adding workspace:* would break npm consumers. [VERIFIED: PITFALLS.md; .changeset/config.json shows no cross-package dependency]
- **`"type": "commonjs"` matching CLI:** The CLI is CJS due to oclif. The skills package is ESM per D-02. Both coexist fine in pnpm monorepos. Do NOT copy `"type": "commonjs"` from CLI package.json.
- **Root turbo.json modification:** Use package-level `turbo.json` only. The root config stays untouched.
- **Running vitest in the skills package `test` script:** The validate-skills.mjs is a plain Node.js script. Setting `"test": "node scripts/validate-skills.mjs"` is simpler and correct. No vitest config needed for this package in Phase 18.

---

## Canonical Command List — Verified from Codebase

[VERIFIED: `ls packages/twentythree-cli/src/commands/`]

### All command topic directories (25 total):

| Directory | Commands (top-level .ts files) | Notes |
|-----------|-------------------------------|-------|
| `action` | 9 | |
| `analytics` | 42 (subdirs: conversions, live, usage, video) | Nested subdirectory structure |
| `app` | 6 | |
| `audience` | 11 | |
| `auth` | 2 | `credentials`, `status` — documented in SKILL.md auth section |
| `autocomplete` | (oclif plugin) | Internal; omit from resource index |
| `category` | 5 | |
| `collector` | 3 | |
| `comment` | 7 | |
| `openupload` | 3 | |
| `player` | 6 | |
| `poll` | 6 | |
| `presentation` | 3 (subdirs: page, setting) | |
| `protection` | 3 | |
| `session` | 2 | |
| `setting` | 1 | |
| `site` | 2 | |
| `spot` | 7 | |
| `tag` | 2 | |
| `thumbnail` | 7 | |
| `user` | 8 | |
| `video` | 9 (+ section/, subtitle/ subdirs) | |
| `webhook` | 5 | |
| `webinar` | 12 (+ attachment/, mail/, queued-video/, recording/, room/, section/, series/, speaker/, transcription/) | Largest topic |
| `workspace` | 2 | `list`, `use` — documented in SKILL.md auth section |
| `doctor.ts` | 1 (top-level) | Standalone command; include in SKILL.md utility section |

**Total: ~239 commands** [VERIFIED: `find ... -name "*.ts" | grep -v index.ts | wc -l` returned 239]

### The 22 resource groups for `reference/` files (Phase 19) and validate-skills.mjs check:

`action, analytics, app, audience, category, collector, comment, openupload, player, poll, presentation, protection, session, setting, site, spot, tag, thumbnail, user, video, webhook, webinar`

**Not in the 22 (documented directly in SKILL.md):** `auth`, `autocomplete`, `workspace` — these are meta/setup topics that belong in the auth setup and utility sections of the root SKILL.md, not in per-resource reference files.

[VERIFIED: cross-referenced REQUIREMENTS.md SKILL-02 explicit list of 22 groups]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Turborepo no-build config | Custom pipeline logic | Package-level `turbo.json` with `"extends": ["//"]` | Turbo v2 natively supports this; one file, zero risk |
| YAML frontmatter parsing | Full YAML parser | Manual `---` block extraction (10 lines) | Only need to check key presence, not values — no library needed |
| npm name availability check | Guessing | `npm view twentythree-skills` | Already confirmed: `twentythree-skills` is not taken on npm registry [VERIFIED: npm view returned 404] |
| Bin file permissions | Manual chmod | `bin/add.js` with shebang + ensure execute bit in prepack | Standard Node.js bin wiring pattern |

---

## `--agent` Flag Output — Reference for SKILL.md Documentation

[VERIFIED: live CLI execution]

**What `--agent` returns** (from `video list --agent`):

```json
{
  "command": "video:list",
  "description": "List videos in the active workspace",
  "flags": [
    { "name": "limit", "type": "option", "required": false, "default": null, "description": "..." },
    { "name": "include-unpublished", "type": "boolean", ... }
  ],
  "examples": ["<%= config.bin %> video list", ...],
  "api_endpoint": "GET /photo/list",
  "auth_scope": "read",
  "output_shape": { "type": "table", "columns": ["ID", "Title", "Duration", "Status", "Published", "Updated"] },
  "side_effects": "none"
}
```

**Key fields agents need to know about:**
- `api_endpoint` — the underlying REST endpoint (note: CLI uses `video` but API uses `photo` — terminology mapping)
- `auth_scope` — one of: `anonymous`, `none`, `read`, `write`, `admin`, `super`
- `output_shape` — `{ type: "table", columns: [...] }` or `{ type: "key-value" }` or `{ type: "none" }`
- `side_effects` — `none`, `creates`, `updates`, or `destructive`
- `flags` — full flag list with types and defaults

**SKILL.md documentation for `--agent`:**

The SKILL.md should document the self-discovery pattern as:
```
Run `twentythree <command> --agent` to get machine-readable metadata before calling any command.
Returns: api_endpoint, auth_scope, output_shape (table columns or key-value), side_effects, flags.
```

---

## Reference Package Fields (from CLI package.json)

[VERIFIED: codebase read of packages/twentythree-cli/package.json]

Fields to carry over to skills package.json (adapted):

```json
{
  "author": "TwentyThree",
  "repository": {
    "type": "git",
    "url": "https://github.com/23/twentythree-cli.git"
  },
  "bugs": {
    "url": "https://github.com/23/twentythree-cli/issues"
  },
  "homepage": "https://github.com/23/twentythree-cli#readme",
  "engines": {
    "node": ">=22.0.0"
  }
}
```

CLI version is `1.1.1`. Skills package is `0.1.0`. Changesets `"linked"` config will keep them in sync after the first changeset. No manual version alignment needed now.

---

## validate-skills.mjs — Design

[VERIFIED: PKG-03 requirements; 22 group list from REQUIREMENTS.md]

The script must:
1. Check that `skills/SKILL.md` exists with `name` and `description` frontmatter
2. Check that `skills/reference/` has exactly the 22 resource group files (Phase 19 creates them; Phase 18's script should fail with a useful error when they don't exist yet)
3. Exit 0 on success; exit 1 with a descriptive error message on any failure

**Implication for Phase 18:** In Phase 18, the 22 reference files do NOT exist yet (Phase 19 creates them). The `validate-skills.mjs` script will fail when run against the Phase 18 state. Two options:
- Option A: Script checks for reference files but they're expected to be absent in Phase 18 — CI would fail
- Option B: Script is written to validate what exists (SKILL.md frontmatter) and warns (exit 0) for missing reference files, only erroring on invalid frontmatter
- Option C: CI doesn't run `pnpm test` for the skills package until Phase 19

**Recommended (Claude's discretion per CONTEXT.md):** Write the full validator (checking all 22 reference files), but gate the reference file check: if `skills/reference/` directory doesn't exist yet, print a warning and exit 0. This makes Phase 18 CI-clean while ensuring the validator is ready for Phase 19.

**Implementation approach — pure Node.js, no dependencies:**

```javascript
#!/usr/bin/env node
// scripts/validate-skills.mjs
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RESOURCE_GROUPS = [
  'action', 'analytics', 'app', 'audience', 'category', 'collector',
  'comment', 'openupload', 'player', 'poll', 'presentation', 'protection',
  'session', 'setting', 'site', 'spot', 'tag', 'thumbnail', 'user',
  'video', 'webhook', 'webinar'
]

const __dirname = dirname(fileURLToPath(import.meta.url))
const skillsDir = join(__dirname, '..', 'skills')
```

Frontmatter parsing: extract text between first `---` and second `---`, then parse `key: value` lines for `name` and `description`. Multi-line `|` block scalar: just check that `name:` line exists (not blank). The `description:` key with `|` means the next line is the value body — check that the key exists.

---

## Changeset Linked Versioning — Confirmed

[VERIFIED: .changeset/config.json]

```json
{
  "linked": [["twentythree-cli", "twentythree-skills"]],
  "access": "public"
}
```

Both packages are already configured for linked versioning. `pnpm changeset version` will bump both together. No additional changeset setup needed in Phase 18.

CI workflow (`release.yml`) currently only publishes `twentythree-cli`. Phase 18 does not need to update the CI workflow — that is a publish concern for a future phase.

---

## Common Pitfalls

### Pitfall 1: files whitelist still points to root SKILL.md

**What goes wrong:** The current stub has `"files": ["SKILL.md"]`. After moving `SKILL.md` to `skills/SKILL.md`, the published package would contain nothing useful.
**Why it happens:** Updating the move operation without updating the files field.
**How to avoid:** Update `files` to `["/bin", "/skills", "/README.md"]` in the same task that moves SKILL.md.
**Warning signs:** `npm pack --dry-run` shows no `.md` files in tarball.

### Pitfall 2: turbo.json `extends` missing — skills build waits for CLI build

**What goes wrong:** Without a package-level `turbo.json`, the root's `"dependsOn": ["^build"]` applies. Skills package gets pulled into the build pipeline, `pnpm build` fails (no build script defined), or the `dist/**` output assertion fails.
**Why it happens:** Forgetting to create the override.
**How to avoid:** Create `packages/twentythree-skills/turbo.json` with `"extends": ["//"]` and `build.dependsOn: []` before any `pnpm build` run.
**Warning signs:** `turbo run build` errors on the skills package or hangs waiting for CLI.

### Pitfall 3: `"type": "commonjs"` copied from CLI

**What goes wrong:** The CLI uses `"type": "commonjs"` — skills package must use `"type": "module"` (D-02). If CJS is set, `bin/add.js` using `import` statements fails immediately on execution.
**How to avoid:** Set `"type": "module"` explicitly. Don't copy-paste from CLI package.json wholesale.

### Pitfall 4: bin/add.js missing shebang or execute permission

**What goes wrong:** `npx twentythree-skills add` errors with "permission denied" or treats the file as data rather than an executable.
**How to avoid:** First line of `bin/add.js` must be `#!/usr/bin/env node`. File must have execute bit. Add a `prepack` script or verify with `ls -la bin/`.

### Pitfall 5: validate-skills.mjs exits non-zero in Phase 18 CI

**What goes wrong:** If the script strictly requires all 22 reference files and Phase 19 hasn't run, `pnpm test` fails in CI for the skills package from day one.
**How to avoid:** Gate reference file check — warn if `skills/reference/` absent, only error if it's present but incomplete. (See validate-skills design above.)

### Pitfall 6: SKILL.md `name` field doesn't match skill directory

**What goes wrong:** agentskills.io spec requires `name` to match the parent directory name. The skill installs to `~/.claude/skills/twentythree/SKILL.md` — the name must be `twentythree`. The existing placeholder already has `name: twentythree` — preserve this.
**How to avoid:** Never change `name` in SKILL.md frontmatter. It must stay `twentythree`.

---

## Code Examples

### Final package.json for twentythree-skills

```json
{
  "name": "twentythree-skills",
  "version": "0.1.0",
  "description": "AI agent skills for the TwentyThree CLI",
  "license": "MIT",
  "author": "TwentyThree",
  "repository": {
    "type": "git",
    "url": "https://github.com/23/twentythree-cli.git"
  },
  "bugs": {
    "url": "https://github.com/23/twentythree-cli/issues"
  },
  "homepage": "https://github.com/23/twentythree-cli#readme",
  "type": "module",
  "engines": {
    "node": ">=22.0.0"
  },
  "bin": {
    "twentythree-skills": "./bin/add.js"
  },
  "files": [
    "/bin",
    "/skills",
    "/README.md"
  ],
  "scripts": {
    "test": "node scripts/validate-skills.mjs"
  },
  "keywords": ["ai", "skills", "twentythree", "cli", "agent"]
}
```

Notes:
- No `"main"` field — this is not a library package; no CommonJS entry point needed
- No `"build"` script — no compilation step (ESM, no TypeScript in this package)
- No `"prepack"` needed — no build artifacts to generate before publish
- `"test"` runs validate-skills.mjs directly (no vitest needed)

### skills/SKILL.md frontmatter structure

```yaml
---
name: twentythree
description: |
  Full TwentyThree video platform CLI. Use when the user asks to upload or manage
  videos, run webinars, query analytics, manage audiences, configure players,
  create categories, manage tags, spots, thumbnails, webhooks, collections, polls,
  presentations, or any TwentyThree platform operation. Covers 239 API commands
  across 25 topics: video, webinar, analytics, audience, action, category, comment,
  player, poll, spot, tag, thumbnail, webhook, app, collector, openupload,
  presentation, protection, session, setting, site, user, auth, workspace, doctor.
triggers:
  - upload video
  - manage videos
  - webinar
  - analytics
  - twentythree
  - video platform
  - TwentyThree CLI
invocable: true
argument-hint: "<topic> <verb> [flags]"
allowed-tools: Bash(twentythree *)
compatibility: Requires twentythree-cli installed globally (npm install -g twentythree-cli)
---
```

### skills/SKILL.md body outline (~200 lines target)

```markdown
# TwentyThree CLI

> 239 commands across 25 topics. Use `--agent` to introspect any command.
> Use `--json` for machine-readable output in agentic contexts.

## Prerequisites: Authentication

Before any command, configure credentials once:

\`\`\`bash
twentythree auth credentials
\`\`\`

Prompts for:
- **Domain**: your workspace domain (e.g. `company.video.twentythree.com`)
- **Bearer token**: Settings → API in your TwentyThree workspace

Verify auth:
\`\`\`bash
twentythree auth status
\`\`\`

Credentials are stored in the OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service).

### Multi-workspace

\`\`\`bash
twentythree workspace list              # List all configured workspaces
twentythree workspace use <domain>      # Switch active workspace
twentythree <command> --workspace <domain>  # One-off override
\`\`\`

## Command Syntax

\`\`\`
twentythree <topic> <verb> [flags]
\`\`\`

Global flags available on every command:
- `--json` — machine-readable JSON output (always use in agentic contexts)
- `--agent` — machine-readable command metadata (api_endpoint, auth_scope, output_shape, side_effects)
- `--workspace <domain>` — target a specific workspace for this call only

## Self-Discovery: --agent Flag

Before calling any unfamiliar command, introspect it:

\`\`\`bash
twentythree video upload --agent
\`\`\`

Returns JSON:
\`\`\`json
{
  "command": "video:upload",
  "flags": [...],
  "api_endpoint": "POST /photo/redeem-upload-token",
  "auth_scope": "write",
  "output_shape": { "type": "key-value" },
  "side_effects": "creates"
}
\`\`\`

Use `--agent` to get exact flag names, required fields, and side effects before any write operation.

## Key Invariants

- **Always use `--json`** in agentic contexts for structured output
- **File uploads use chunked protocol automatically** — never construct multipart requests directly; use `video upload <file>`
- **Check `auth_scope`** before write/admin commands — requires appropriate bearer token permissions
- **API terminology differs from CLI terminology**: CLI uses `video` → API uses `photo`; `category` → `album`. The `--agent` flag shows the actual API endpoint.
- **On persistent errors**, run `twentythree doctor` to diagnose auth, connectivity, and dependency issues

## Resource Index

| Topic | Commands | Use for |
|-------|----------|---------|
| `video` | upload, list, get, update, delete, replace, frame, transcoding-progress | Video file management, upload, metadata |
| `webinar` | create, list, get, update, delete, repeat, highlights, clips, metrics, log, + subdirs | Live events, scheduling, recordings |
| `analytics` | conversions, live, usage, video (subdirs with multiple verbs each) | Reporting, viewer data, performance |
| `audience` | list, create, get, update, delete, + segment operations | Audience segmentation, targeting |
| `category` | list, create, get, update, delete | Content organization, albums |
| `action` | list, create, get, update, delete, + subtypes | Interactive overlays, CTAs |
| `collector` | list, create, delete | Lead capture forms |
| `comment` | list, create, get, update, delete | Video comments moderation |
| `player` | list, create, get, update, delete | Player configuration |
| `poll` | list, create, get, update, delete | In-video polls |
| `spot` | list, create, get, update, delete | Hotspot annotations |
| `tag` | list, create | Content tagging |
| `thumbnail` | list, create, get, update, delete | Video thumbnail management |
| `webhook` | list, create, get, update, delete | Event webhooks |
| `app` | list, create, get, update, delete | App/integration management |
| `presentation` | page, setting, list | Presentation content |
| `protection` | list, create, delete | Access protection |
| `session` | list, get | Viewer session data |
| `setting` | get | Workspace settings |
| `site` | list, search | Site-level operations |
| `openupload` | list, create, delete | Open upload tokens |
| `user` | list, create, get, update, delete | User management |

## Common Workflows

### Upload and Publish a Video
\`\`\`bash
# Upload (chunked automatically)
twentythree video upload ./video.mp4 --title "My Video" --json

# Assign to category
twentythree video update <id> --category-id <cat-id> --json

# Set thumbnail
twentythree thumbnail create --video-id <id> --time 5 --json

# Publish
twentythree video update <id> --published 1 --json
\`\`\`

### Webinar Setup
\`\`\`bash
twentythree webinar create --title "Q2 Kickoff" --scheduled-at "2026-05-01T14:00:00Z" --json
twentythree webinar get <id> --json    # Get room URL and stream key
\`\`\`

## Diagnostics
\`\`\`bash
twentythree doctor    # Check auth, connectivity, token validity
twentythree --version # Verify CLI version
\`\`\`
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| One monolithic SKILL.md per tool | Root SKILL.md + `reference/` sub-files per topic | Agents load only what they need; context budget preserved |
| Skills only for Claude Code (`~/.claude/skills/`) | agentskills.io standard: same format for Claude Code, Codex, Cursor, Copilot | One file ships to all runtimes |
| Manual credential injection in skill content | `allowed-tools: Bash(twentythree *)` + document `auth credentials` step | Agents self-serve auth without embedding tokens |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `bin/add.js` file with `#!/usr/bin/env node` shebang gets execute bit automatically via pnpm install when `bin` is declared in package.json | Code Examples | Bin file not executable on install; fix: add `chmod +x bin/add.js` to prepack or README |
| A2 | The turbo `test` task override with `"dependsOn": []` correctly removes the `"dependsOn": ["build"]` from root config for this package | Architecture Patterns | Skills `pnpm test` would trigger a build step unnecessarily |
| A3 | `skills/SKILL.md` (not `twentythree/SKILL.md`) is the correct path; the installer (Phase 20) will create the `twentythree/` directory namespace when copying to `~/.claude/skills/twentythree/` | Package structure | Wrong directory naming causes skill to not load in runtimes |

**If A3 needs verification:** The agentskills.io spec says the named directory in the skill store must match the `name` field. The package ships `skills/SKILL.md`; the installer copies the whole `skills/` dir contents to `~/.claude/skills/twentythree/`. So the package's internal `skills/` is not the skill name — it's just the shipping container. The skill name `twentythree` comes from the SKILL.md `name` field and the installer's target directory. This is correct architecture per ARCHITECTURE.md.

---

## Open Questions (RESOLVED)

1. **Should `bin/add.js` stub in Phase 18 exit 0 or exit 1?**
   - What we know: Phase 18 is a stub — Phase 20 implements the logic
   - What's unclear: If a user tries `npx twentythree-skills add` after Phase 18 ships, exit 1 with a message is better UX than a silent exit 0 that does nothing
   - Recommendation: exit 1 with `"Installer not yet available — check back with twentythree-skills >= 1.2.0"` or similar
   - **RESOLVED:** exit 1 with descriptive message — implemented in Plan 01, Task 1

2. **Does validate-skills.mjs need to run as part of CI now (Phase 18) or only after Phase 19?**
   - What we know: PKG-03 says the script runs as part of CI; Phase 19 creates the 22 reference files
   - What's unclear: If the script strictly enforces all 22 files, CI fails until Phase 19 is merged
   - Recommendation: Implement the two-gate approach — validate frontmatter strictly; validate reference files only if `skills/reference/` directory exists (absent = warning, not error)
   - **RESOLVED:** Two-gate approach implemented in Plan 01, Task 2 — strict frontmatter check + soft reference/ directory check

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | bin/add.js, validate-skills.mjs | ✓ | 22.22.2 | — |
| pnpm | workspace commands | ✓ | (in project) | — |
| Turborepo | build/test pipeline | ✓ | 2.9.6 | — |
| npm registry (`twentythree-skills` name) | PKG-01 publish readiness | ✓ available | Name not taken | — |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Plain Node.js (no test framework for skills package) |
| Config file | None — `"test": "node scripts/validate-skills.mjs"` |
| Quick run command | `pnpm --filter twentythree-skills test` |
| Full suite command | `pnpm --filter twentythree-skills test` (same) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PKG-01 | package.json has type=module, bin entry, files whitelist | Manual inspection / `npm pack --dry-run` | `npm pack --dry-run 2>&1 \| grep -E "bin\|skills"` | ❌ Wave 0 |
| PKG-02 | `pnpm build` does not attempt to compile skills package | Integration | `pnpm run build 2>&1 \| grep twentythree-skills` | ❌ Wave 0 |
| PKG-03 | validate-skills.mjs exits 0 with valid SKILL.md | script | `pnpm --filter twentythree-skills test` | ❌ Wave 0 — create `scripts/validate-skills.mjs` |
| SKILL-01 | skills/SKILL.md has required sections | Manual review | `grep -c 'allowed-tools\|auth credentials\|--agent' skills/SKILL.md` | ❌ Wave 0 |

### Sampling Rate

- Per task commit: `pnpm --filter twentythree-skills test`
- Per wave merge: `pnpm --filter twentythree-skills test && pnpm build`
- Phase gate: validate-skills exits 0, `pnpm build` succeeds, `npm pack --dry-run` shows `/bin` and `/skills` in tarball

### Wave 0 Gaps

- [ ] `scripts/validate-skills.mjs` — covers PKG-03
- [ ] `skills/SKILL.md` — covers SKILL-01 (moved from package root)
- [ ] `bin/add.js` — required for PKG-01 bin entry
- [ ] `turbo.json` — required for PKG-02

---

## Security Domain

Security enforcement is not applicable for this phase. Phase 18 creates static markdown content files and a package manifest. There is no authentication logic, no HTTP requests, no user input processing, and no credential handling. The `bin/add.js` stub does not execute any business logic.

---

## Sources

### Primary (HIGH confidence)

- [VERIFIED: codebase] `packages/twentythree-skills/package.json` — existing stub state
- [VERIFIED: codebase] `packages/twentythree-skills/SKILL.md` — existing placeholder
- [VERIFIED: codebase] `packages/twentythree-cli/package.json` — reference fields
- [VERIFIED: codebase] `turbo.json` — root turbo config structure
- [VERIFIED: codebase] `.changeset/config.json` — linked versioning confirmed
- [VERIFIED: codebase] `packages/twentythree-cli/src/commands/` directory listing — 25 topic directories
- [VERIFIED: CLI execution] `twentythree video list --agent` — exact --agent output format
- [VERIFIED: CLI execution] `twentythree video upload --agent` — upload command metadata
- [VERIFIED: CLI execution] `twentythree auth status --agent` — auth scope `none` pattern
- [VERIFIED: pnpm-lock.yaml] Turborepo 2.9.6 installed
- [VERIFIED: npm registry] `npm view twentythree-skills` → 404 (name available)
- [CITED: .planning/research/ARCHITECTURE.md] Turbo v2 `"extends": ["//"]` package override pattern
- [CITED: .planning/research/STACK.md] No gray-matter for validate-skills; Node built-ins sufficient
- [CITED: .planning/research/FEATURES.md] `allowed-tools: Bash(twentythree *)` — Claude Code extension field
- [CITED: .planning/research/PITFALLS.md] workspace:* dependency leakage risk

### Secondary (MEDIUM confidence)

- [CITED: REQUIREMENTS.md] 22 resource group list for SKILL-02 — the canonical reference

### Tertiary (LOW confidence)

None.

---

## Metadata

**Confidence breakdown:**
- Package.json fields: HIGH — verified from codebase against CLI reference
- Turbo v2 no-build pattern: HIGH — schema confirmed, ARCHITECTURE.md cited
- SKILL.md format: HIGH — existing placeholder + FEATURES.md research
- validate-skills.mjs design: HIGH — pure Node.js, PKG-03 requirements clear
- 22 resource group list: HIGH — cross-referenced REQUIREMENTS.md SKILL-02 and live `ls` output

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (package structure is stable; Turbo API unlikely to change in 30 days)
