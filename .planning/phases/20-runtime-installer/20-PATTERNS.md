# Phase 20: Runtime Installer - Pattern Map

**Mapped:** 2026-04-20
**Files analyzed:** 1 (bin/add.js — stub replacement)
**Analogs found:** 1 / 1

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `packages/twentythree-skills/bin/add.js` | utility / CLI entrypoint | file-I/O | `packages/twentythree-skills/scripts/validate-skills.mjs` | role-match (same package, same ESM + built-ins-only constraint; different operation: read/validate vs detect/copy) |

---

## Pattern Assignments

### `packages/twentythree-skills/bin/add.js` (utility, file-I/O)

**Analog:** `packages/twentythree-skills/scripts/validate-skills.mjs`

---

**Shebang + file header comment** (lines 1-10 of analog):

```javascript
#!/usr/bin/env node
// scripts/validate-skills.mjs
// Validates twentythree-skills package structure and content.
//
// Two-gate validation (see 18-RESEARCH.md "validate-skills.mjs — Design"):
// ...
//
// Exits 0 on success, 1 on any hard failure.
```

Copy this pattern for `bin/add.js`:

```javascript
#!/usr/bin/env node
// bin/add.js — TwentyThree Skills installer
// Node.js built-ins only. ESM. No build step. Target: < 150 lines.
```

---

**Imports pattern** (analog lines 12-14):

```javascript
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
```

Copy for `bin/add.js` (adjusted for installer needs):

```javascript
import { existsSync, mkdirSync, cpSync, readdirSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
```

Key points:
- `node:` prefix on all built-in imports — mandatory in this package
- No semicolons — analog uses no semicolons; follow the same style
- Named imports only — no default imports from built-ins

---

**ESM `__dirname` + package-relative path resolution** (analog lines 16-18):

```javascript
const __dirname = dirname(fileURLToPath(import.meta.url))
const packageRoot = join(__dirname, '..')
const skillsDir = join(packageRoot, 'skills')
```

Copy for `bin/add.js` (bin/ is one level below package root, same as scripts/):

```javascript
const __dirname = dirname(fileURLToPath(import.meta.url))
const skillsSource = join(__dirname, '..', 'skills')
```

This resolves correctly when invoked via `npx` (symlink) because Node.js resolves `import.meta.url` to the real file, not the symlink.

---

**`existsSync` probe pattern** (analog lines 36, 57):

```javascript
if (!existsSync(rootSkillPath)) {
  errors.push(`Missing required file: skills/SKILL.md`)
}

if (!existsSync(referenceDir)) {
  warnings.push(...)
}
```

Copy for runtime detection in `bin/add.js`:

```javascript
const home = homedir()
const detected = RUNTIMES.filter(r => existsSync(r.detect))
```

Probe the runtime root directory (`~/.claude/`, `~/.codex/`, etc.), not any subdirectory that the installer itself will create.

---

**`readdirSync` directory walk** (analog line 61 uses `readdirSync`):

```javascript
// analog: flat read for known filenames
for (const group of RESOURCE_GROUPS) {
  const filePath = join(referenceDir, `${group}.md`)
  if (!existsSync(filePath)) { ... }
}
```

For `bin/add.js` the walk must be recursive (skills/ has subdirectories). Use the `withFileTypes` option:

```javascript
function walkDir(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    entry.isDirectory() ? files.push(...walkDir(full)) : files.push(full)
  }
  return files
}
```

---

**Console output style** (analog lines 70-78):

```javascript
for (const w of warnings) console.warn(`warn: ${w}`)
for (const e of errors) console.error(`error: ${e}`)

if (errors.length > 0) {
  console.error(`\nvalidate-skills: FAILED (${errors.length} error${errors.length === 1 ? '' : 's'})`)
  process.exit(1)
}

console.log(`validate-skills: OK (...)`)
process.exit(0)
```

For `bin/add.js` follow the same console.log-only approach (no chalk, no ora — no external deps). Use explicit `process.exit(0)` at exit paths:

```javascript
// Runtime header
console.log(`\n${runtime.name} (${shortDest}/)`)
// Per-file line
console.log(`  ✓ ${rel}`)
// Final line
console.log('\nDone.')
process.exit(0)
```

---

**`process.exit` pattern** (analog lines 75, 79):

```javascript
process.exit(1)   // hard failure
process.exit(0)   // success
```

For `bin/add.js`:
- Exit 0 always (no runtime found is not an error — D-04)
- Never exit 1 from the installer

---

## Shared Patterns

### ESM `__dirname` Equivalent
**Source:** `packages/twentythree-skills/scripts/validate-skills.mjs` lines 16-18
**Apply to:** `bin/add.js` (source path resolution)

```javascript
const __dirname = dirname(fileURLToPath(import.meta.url))
```

This is the only idiom for resolving file-relative paths in ESM. Do not use `process.env.HOME` for the home directory — use `os.homedir()`.

### No-Semicolon Style
**Source:** `packages/twentythree-skills/scripts/validate-skills.mjs` (entire file)
**Apply to:** `bin/add.js`

The entire `twentythree-skills` package uses no semicolons. `bin/add.js` must follow the same style (it lives in the same package and will be read alongside `validate-skills.mjs`).

### `node:` Prefix on All Built-in Imports
**Source:** `packages/twentythree-skills/scripts/validate-skills.mjs` lines 12-14
**Apply to:** `bin/add.js`

All Node.js built-in imports use the `node:` protocol prefix. This is enforced by the package's ESM + Node 22 baseline and matches the project-wide convention.

### Explicit `process.exit` at All Terminals
**Source:** `packages/twentythree-skills/scripts/validate-skills.mjs` lines 75, 79
**Apply to:** `bin/add.js`

Every code path ends with an explicit `process.exit(0)` or `process.exit(1)`. Do not rely on implicit exit.

---

## No Analog Found

None — `validate-skills.mjs` is a sufficient analog for the ESM + built-ins-only + same-package constraints. All implementation patterns (cpSync, walkDir, RUNTIMES table, --project flag, no-runtime fallback) are specified in full in RESEARCH.md patterns 1-5 and the verified skeleton in the Code Examples section.

---

## Implementation Note for Planner

The RESEARCH.md contains a complete, verified implementation skeleton (lines 376-455 of 20-RESEARCH.md). The planner should direct the implementer to:

1. Copy the import block pattern from `validate-skills.mjs` lines 12-14 (style: no semicolons, `node:` prefix)
2. Copy the `__dirname` pattern from `validate-skills.mjs` lines 16-18
3. Use the complete skeleton from RESEARCH.md Code Examples section as the body template
4. Verify style consistency with `validate-skills.mjs` before committing (no semicolons, no trailing newline issues)

The skeleton in RESEARCH.md is marked `[ASSUMED]` for end-to-end correctness but all individual patterns within it are `[VERIFIED]` against Node 22.22.2.

---

## Metadata

**Analog search scope:** `packages/twentythree-skills/` (scripts/, bin/)
**Files scanned:** 2 (`bin/add.js` stub, `scripts/validate-skills.mjs`)
**Pattern extraction date:** 2026-04-20
