# Phase 18: Package Foundation - Pattern Map

**Mapped:** 2026-04-20
**Files analyzed:** 6
**Analogs found:** 5 / 6

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `packages/twentythree-skills/package.json` | config | — | `packages/twentythree-cli/package.json` | exact |
| `packages/twentythree-skills/turbo.json` | config | — | root `turbo.json` | role-match (read-only reference) |
| `packages/twentythree-skills/bin/add.js` | utility | request-response | `packages/twentythree-cli/bin/run.js` | role-match |
| `packages/twentythree-skills/scripts/validate-skills.mjs` | utility | file-I/O | `packages/twentythree-cli/scripts/audit-endpoints.mjs` | exact |
| `packages/twentythree-skills/skills/SKILL.md` | content | — | `packages/twentythree-skills/SKILL.md` (existing placeholder) | exact (move + expand) |
| root `turbo.json` | config | — | root `turbo.json` | read-only reference — do NOT modify |

---

## Pattern Assignments

### `packages/twentythree-skills/package.json` (config)

**Analog:** `packages/twentythree-cli/package.json`

**Key constraint:** Do NOT copy `"type": "commonjs"` from the CLI. The skills package uses `"type": "module"` (D-02). Do NOT add a `"main"` field — this is not a library package.

**Fields to carry over verbatim** (lines 6–20 of CLI package.json):
```json
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
```

**Fields that differ from CLI (skills-specific values):**
```json
{
  "name": "twentythree-skills",
  "version": "0.1.0",
  "type": "module",
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

**Fields NOT to include (present in CLI but not applicable to skills):**
- `"main"` — no library entry point
- `"build"` script — no TypeScript compile step
- `"prepack"` — no build artifacts to generate
- `"postbuild"` — no oclif manifest
- `"oclif"` — not an oclif package
- `"dependencies"` / `"devDependencies"` — no runtime or dev dependencies in Phase 18
- `"dev"` script — no dev mode

---

### `packages/twentythree-skills/turbo.json` (config)

**Analog:** root `turbo.json` (lines 1–20) — read as a reference for structure; then override selectively.

**Root config structure** (read-only reference, do NOT modify):
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.ts", "test/**/*.ts", "vitest.config.*"]
    }
  }
}
```

**Package-level override pattern** (new file — Turbo v2 `extends` pattern):
```json
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

**Why `"extends": ["//"]`:** Inherits root turbo.json and overrides only the tasks listed. `"dependsOn": []` on `build` removes the root `"^build"` dependency — skills package does not wait for CLI compilation. `"dependsOn": []` on `test` removes the root `"dependsOn": ["build"]` — prevents skills `pnpm test` from triggering a build.

---

### `packages/twentythree-skills/bin/add.js` (utility)

**Analog:** `packages/twentythree-cli/bin/run.js` (lines 1–2 — shebang pattern only)

**Shebang pattern to copy** (line 1 of `bin/run.js`):
```javascript
#!/usr/bin/env node
```

**Stub body (Phase 18 only — Phase 20 replaces with runtime detection logic):**
```javascript
#!/usr/bin/env node
// bin/add.js — TwentyThree Skills installer
// Full runtime detection and file copy logic is implemented in Phase 20.
// This stub exists to wire the bin entry and validate the package structure.

console.error('twentythree-skills add: installer not yet implemented. Check back with twentythree-skills >= 1.2.0')
process.exit(1)
```

**Critical differences from CLI `bin/run.js`:**
- No Node version guard needed at this stub stage (Phase 20 can add it)
- No oclif import — plain ESM stub
- Uses `console.error` not `process.stderr.write` for simplicity
- File must be executable: `chmod +x bin/add.js` before commit

---

### `packages/twentythree-skills/scripts/validate-skills.mjs` (utility, file-I/O)

**Analog:** `packages/twentythree-cli/scripts/audit-endpoints.mjs`

**ESM imports pattern** (lines 1–6 of `audit-endpoints.mjs`):
```javascript
#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, dirname, join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
```

**`__dirname` shim for ESM** (line 6 — required because ESM doesn't have `__dirname`):
```javascript
const __dirname = dirname(fileURLToPath(import.meta.url))
```

**Path resolution pattern** (lines 19–20 of `audit-endpoints.mjs`):
```javascript
const specPath = resolve(__dirname, '../specs/twentythree-api-swagger.json')
```
Adapt for skills: `const skillsDir = join(__dirname, '..', 'skills')`

**Directory walk pattern** (lines 36–53 of `audit-endpoints.mjs`):
```javascript
function walkDir(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      walkDir(fullPath)
    } else if (extname(entry) === '.ts') {
      // process file
    }
  }
}
```
Adapt for skills: walk `skills/reference/` checking for `.md` files.

**Exit code pattern** (line 123 of `audit-endpoints.mjs`):
```javascript
process.exit(gaps.length > 0 || phantoms.length > 0 ? 1 : 0)
```
Adapt for skills: `process.exit(errors.length > 0 ? 1 : 0)`

**Section header comment style** (lines 17, 31, etc. of `audit-endpoints.mjs`):
```javascript
// ─── Step A: Extract spec endpoints ───────────────────────────────────────────
```
Use same visual separator style.

**Frontmatter parsing (no analog in codebase — use research pattern):**
```javascript
function parseFrontmatter(content) {
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

**Two-gate validation logic (per RESEARCH.md recommendation):**
- Gate 1 (strict): `skills/SKILL.md` must exist with `name` and `description` frontmatter keys — exit 1 if missing or invalid
- Gate 2 (soft): `skills/reference/` — if directory is absent, print a warning and exit 0; if present but incomplete (not all 22 groups), exit 1

**22 resource groups constant:**
```javascript
const RESOURCE_GROUPS = [
  'action', 'analytics', 'app', 'audience', 'category', 'collector',
  'comment', 'openupload', 'player', 'poll', 'presentation', 'protection',
  'session', 'setting', 'site', 'spot', 'tag', 'thumbnail', 'user',
  'video', 'webhook', 'webinar'
]
```

---

### `packages/twentythree-skills/skills/SKILL.md` (content)

**Analog:** `packages/twentythree-skills/SKILL.md` (existing placeholder — move to `skills/SKILL.md` and expand)

**Frontmatter to preserve from placeholder** (lines 1–12 of existing `SKILL.md`):
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

**Expanded frontmatter for `skills/SKILL.md`** (keep `name: twentythree` exactly — must match installer target directory):
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

**Body must cover (D-03, ~200 lines):**
1. Prerequisites: `twentythree auth credentials` → prompts (domain, bearer token) → OS keychain storage
2. `twentythree auth status` verification step
3. Multi-workspace: `workspace list`, `workspace use <domain>`, `--workspace <domain>` per-call override
4. Command syntax: `twentythree <topic> <verb> [flags]`
5. Global flags: `--json`, `--agent`, `--workspace`
6. `--agent` self-discovery section with example JSON output (api_endpoint, auth_scope, output_shape, side_effects, flags)
7. Key invariants: always use `--json` in agentic contexts; chunked upload is automatic; check `auth_scope` before writes; API terminology differs from CLI (video→photo, category→album)
8. Resource index table: all 22 resource groups with representative verbs and use-for descriptions
9. Utility commands: `auth` (credentials, status), `workspace` (list, use), `doctor`, `--version`
10. Common workflows: upload+publish flow; webinar setup flow

**Note:** Body text in the existing placeholder ("Skills content is a work in progress...") is discarded entirely — replace with full content.

---

## Shared Patterns

### ESM `__dirname` Shim
**Source:** `packages/twentythree-cli/scripts/audit-endpoints.mjs` line 6
**Apply to:** `scripts/validate-skills.mjs`, `bin/add.js`
```javascript
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
const __dirname = dirname(fileURLToPath(import.meta.url))
```

### Node.js Built-ins Only (no external deps)
**Source:** `packages/twentythree-cli/scripts/audit-endpoints.mjs` lines 1–3
**Apply to:** `scripts/validate-skills.mjs`, `bin/add.js`
```javascript
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
```
Always use `node:` prefix for built-in imports — matches existing project style.

### Shebang Line
**Source:** `packages/twentythree-cli/bin/run.js` line 1 and `packages/twentythree-cli/scripts/audit-endpoints.mjs` line 1
**Apply to:** `bin/add.js`, `scripts/validate-skills.mjs`
```javascript
#!/usr/bin/env node
```

### Process Exit Pattern
**Source:** `packages/twentythree-cli/scripts/audit-endpoints.mjs` line 123
**Apply to:** `scripts/validate-skills.mjs`
```javascript
process.exit(errors.length > 0 ? 1 : 0)
```

### Package Metadata Fields
**Source:** `packages/twentythree-cli/package.json` lines 6–20
**Apply to:** `packages/twentythree-skills/package.json`
Copy `author`, `repository`, `bugs`, `homepage`, `engines` verbatim. Override `type` to `"module"` (not `"commonjs"`).

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `packages/twentythree-skills/turbo.json` | config | — | Package-level turbo override pattern doesn't exist anywhere else in the monorepo — the CLI package has no `turbo.json`. Pattern comes from RESEARCH.md (Turbo v2 schema). |

---

## Metadata

**Analog search scope:**
- `packages/twentythree-cli/package.json` — bin, files, engines, scripts, author, repository pattern
- `packages/twentythree-cli/bin/run.js` — bin shebang pattern
- `packages/twentythree-cli/scripts/audit-endpoints.mjs` — ESM script style, node: imports, __dirname shim, exit code
- `packages/twentythree-skills/SKILL.md` — existing placeholder to move and expand
- root `turbo.json` — task structure reference for package-level override
- `.changeset/config.json` — linked versioning confirmation (no action needed)

**Files scanned:** 8
**Pattern extraction date:** 2026-04-20
