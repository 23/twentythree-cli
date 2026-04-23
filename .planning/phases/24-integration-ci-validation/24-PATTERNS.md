# Phase 24: Integration & CI Validation - Pattern Map

**Mapped:** 2026-04-23
**Files analyzed:** 1 (modified)
**Analogs found:** 1 / 1

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `packages/twentythree-skills/scripts/validate-skills.mjs` | utility / validator | batch | self (Gate 1 + Gate 2 blocks within the same file) | exact |

## Pattern Assignments

### `packages/twentythree-skills/scripts/validate-skills.mjs` (utility, batch)

**Analog:** The existing Gate 1 and Gate 2 blocks in the same file (`packages/twentythree-skills/scripts/validate-skills.mjs`).

**Imports pattern** (lines 12-14):
```javascript
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
```

Gate 3 needs one new import added to this block:
```javascript
import { spawnSync } from 'node:child_process'
```
Add `spawnSync` to the existing `node:child_process` import (or add a new import line). No other imports are needed.

**Gate comment header pattern** (lines 32, 53):
```javascript
// ─── Gate N: Name ────────────────────────────────────────────────────
```
Gate 3 must open with:
```javascript
// ─── Gate 3: Pack file count ──────────────────────────────────────────────────
```

**Core gate pattern — condition + errors.push** (lines 36-51 for Gate 1, lines 57-66 for Gate 2):
```javascript
// Gate 1 example — check existence then push to errors[]
if (!existsSync(rootSkillPath)) {
  errors.push(`Missing required file: skills/SKILL.md`)
} else {
  // further assertions also push to errors[]
}
```
```javascript
// Gate 2 example — conditional skip with warnings[], hard failure inside
if (!existsSync(referenceDir)) {
  warnings.push(`skills/reference/ not yet created (Phase 19 creates it). Skipping reference-file check.`)
} else {
  for (const group of RESOURCE_GROUPS) {
    const filePath = join(referenceDir, `${group}.md`)
    if (!existsSync(filePath)) {
      errors.push(`Missing reference file: skills/reference/${group}.md`)
    }
  }
}
```

Gate 3 must follow the same pattern — run a subprocess, parse output, push to `errors[]` on mismatch. No separate `process.exit()` call; the existing Report section (lines 68-79) handles exit.

**subprocess + stderr capture pattern** (new for Gate 3 — no existing analog in the file, but matches Node.js stdlib convention):

`npm pack --dry-run` writes its file listing to stderr. Use `spawnSync` with `cwd: packageRoot`:
```javascript
const EXPECTED_FILE_COUNT = 29 // Update this number when adding new files to the package

const packResult = spawnSync('npm', ['pack', '--dry-run'], {
  cwd: packageRoot,
  encoding: 'utf8',
})

if (packResult.status !== 0) {
  errors.push(`npm pack --dry-run failed: ${packResult.stderr}`)
} else {
  const packOutput = packResult.stderr

  // Assert total file count
  const countMatch = packOutput.match(/total files:\s+(\d+)/i)
  if (!countMatch) {
    errors.push(`Gate 3: could not parse "total files:" line from npm pack --dry-run output`)
  } else {
    const actualCount = parseInt(countMatch[1], 10)
    if (actualCount !== EXPECTED_FILE_COUNT) {
      errors.push(`Gate 3: npm pack file count is ${actualCount}, expected ${EXPECTED_FILE_COUNT}. Update EXPECTED_FILE_COUNT or check "files" in package.json.`)
    }
  }

  // Assert guide.md is present in the pack listing
  if (!packOutput.includes('skills/guide.md')) {
    errors.push(`Gate 3: skills/guide.md not found in npm pack --dry-run output`)
  }
}
```

**Insertion point:** Append Gate 3 immediately before the `// ─── Report ───` comment at line 68. Do not modify any code after that comment.

**Named constant pattern** (line 22-27 for RESOURCE_GROUPS):
```javascript
const RESOURCE_GROUPS = [...]
```
Gate 3 follows the same style — declare `EXPECTED_FILE_COUNT` as a named `const` at the top of the Gate 3 block, not inline in the condition.

**Error message style** (lines 37, 45, 47, 63):
```
`Missing required file: skills/SKILL.md`
`skills/SKILL.md frontmatter is missing required key 'name' (or it is empty)`
`Missing reference file: skills/reference/${group}.md`
```
Gate 3 error messages must follow the same template-literal, human-readable style. Prefix with `Gate 3:` to make the gate origin unambiguous in CI output.

---

## Shared Patterns

### Error accumulation and exit
**Source:** `packages/twentythree-skills/scripts/validate-skills.mjs`, lines 29-30 and 68-79
**Apply to:** Gate 3 (same file)
```javascript
const errors = []
const warnings = []

// ... gates push to these arrays ...

for (const w of warnings) console.warn(`warn: ${w}`)
for (const e of errors) console.error(`error: ${e}`)

if (errors.length > 0) {
  console.error(`\nvalidate-skills: FAILED (${errors.length} error${errors.length === 1 ? '' : 's'})`)
  process.exit(1)
}

console.log(`validate-skills: OK (...)`)
process.exit(0)
```
Gate 3 must NOT add its own `process.exit()` — the Report section handles it.

### ESM module convention
**Source:** `packages/twentythree-skills/scripts/validate-skills.mjs`, lines 1-14
**Apply to:** Gate 3 additions
All additions must use `import` syntax. No `require()` calls.

### packageRoot path resolution
**Source:** `packages/twentythree-skills/scripts/validate-skills.mjs`, lines 16-18
**Apply to:** Gate 3 `spawnSync` call
```javascript
const __dirname = dirname(fileURLToPath(import.meta.url))
const packageRoot = join(__dirname, '..')
```
Pass `cwd: packageRoot` to `spawnSync` so `npm pack` runs from the package root and sees the correct `package.json`.

---

## No Analog Found

No files fall into this category. Gate 3 is a pure extension of an existing file with a well-established pattern.

---

## Metadata

**Analog search scope:** `packages/twentythree-skills/scripts/validate-skills.mjs`, `packages/twentythree-skills/package.json`
**Files scanned:** 2
**Pattern extraction date:** 2026-04-23
