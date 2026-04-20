---
phase: 18-package-foundation
reviewed: 2026-04-20T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - packages/twentythree-skills/package.json
  - packages/twentythree-skills/turbo.json
  - packages/twentythree-skills/bin/add.js
  - packages/twentythree-skills/scripts/validate-skills.mjs
  - packages/twentythree-skills/skills/SKILL.md
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 18: Code Review Report

**Reviewed:** 2026-04-20T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five files reviewed spanning the `twentythree-skills` package foundation: the npm manifest, Turborepo config, the binary stub, the validation script, and the SKILL.md index. The code is generally clean and well-commented. No security or critical correctness issues were found. Three warnings relate to logic correctness in the validator (a hoisted-function-call ordering issue, a block-scalar false-negative, and a missing check for `description` emptiness) and four info items cover minor style and completeness gaps.

## Warnings

### WR-01: `parseFrontmatter` called before it is declared (temporal dead zone risk)

**File:** `packages/twentythree-skills/scripts/validate-skills.mjs:40`

**Issue:** `parseFrontmatter(content)` is called at line 40, but the function declaration (`function parseFrontmatter`) is at line 83. In this `.mjs` file the code is treated as an ES module. `function` declarations are hoisted in JavaScript regardless of module type, so this works correctly at runtime today. However, the pattern is fragile — if the function is ever refactored to a `const parseFrontmatter = (content) => { ... }` (arrow/const), the call at line 40 will throw a `ReferenceError` at startup with no other warning. The inverted definition order also makes the file harder to read linearly.

**Fix:** Move the `parseFrontmatter` definition above the Gate 1 block (before line 32), or add a comment explicitly noting the hoisting dependency so a future refactor doesn't silently break it.

```js
// Move this block to BEFORE Gate 1 (before line 32):
function parseFrontmatter(content) {
  // ...
}

// ─── Gate 1: Root SKILL.md ────────────────────────────────────────────────────
const rootSkillPath = join(skillsDir, 'SKILL.md')
// ...
```

---

### WR-02: Block-scalar `description` values pass `isEmpty` check incorrectly

**File:** `packages/twentythree-skills/scripts/validate-skills.mjs:44-49`

**Issue:** The parser marks block-scalar values (`|`, `>`, `|-`, `>-`) with the sentinel string `'__block__'` (line 101). The `isEmpty` helper (line 113) returns `true` only when the value is `undefined` or `''`. This means a key whose value is `__block__` correctly passes the `isEmpty` check — intended behaviour for `name`.

However, `description` is checked only for presence (`hasKey`) but not emptiness (line 48: `if (!fm.hasKey('description'))`). The current `SKILL.md` uses a block scalar for `description`, which is fine. But if someone writes `description:` with no value (empty inline), `hasKey` returns `true` and `isEmpty` would return `true` — yet no error is reported. The validator silently accepts an empty `description`.

**Fix:** Apply the same `isEmpty` guard to `description` that is already applied to `name`:

```js
if (!fm.hasKey('description')) {
  errors.push(`skills/SKILL.md frontmatter is missing required key 'description'`)
} else if (fm.isEmpty('description')) {
  errors.push(`skills/SKILL.md frontmatter 'description' is empty`)
}
```

---

### WR-03: `bin/add.js` exits with code 1 on every invocation — no help output

**File:** `packages/twentythree-skills/bin/add.js:6-7`

**Issue:** The stub always exits 1 and writes only to `stderr`. When a user runs `twentythree-skills add` (or just `twentythree-skills` via `npm exec`) they get an error exit code with no hint of what the eventual command surface will look like, no `--help` flag, and no version info. A non-zero exit from a globally-installed binary can break shell pipelines and CI scripts that probe for the binary's existence.

The comment documents this as intentional for Phase 20, so this is a known deferral — but the failure mode is user-hostile: npm's post-install scripts or other tooling may invoke the binary and treat exit code 1 as a broken install.

**Fix:** Exit 0 with a descriptive message, or check for `--version`/`--help` flags and respond appropriately:

```js
#!/usr/bin/env node
// bin/add.js — TwentyThree Skills installer stub (Phase 20 implements full logic)

const args = process.argv.slice(2)

if (args.includes('--version') || args.includes('-v')) {
  // Read from package.json at runtime, or hard-code for stub
  console.log('twentythree-skills 0.1.0 (stub)')
  process.exit(0)
}

console.error('twentythree-skills: installer not yet implemented (available in >= 1.2.0)')
console.error('Usage: twentythree-skills add <target-dir>')
process.exit(1)
```

Alternatively, if the stub is purely internal (never published), exit 0 with an info message to avoid breaking callers.

---

## Info

### IN-01: `package.json` missing `devDependencies` and `validate` script is the only script

**File:** `packages/twentythree-skills/package.json:27-29`

**Issue:** The `scripts` object has only `"test"`. No `"lint"`, `"validate"`, or `"build"` alias. The Turborepo `turbo.json` declares a `build` task, but `package.json` has no corresponding `build` script. Turborepo will silently skip the task when no matching script exists, which means `turbo build` from the repo root will not warn that this package has no build step — it just does nothing.

**Fix:** Add a no-op or echo build script to make the Turbo task explicit:

```json
"scripts": {
  "build": "echo 'No build step for skills package'",
  "test": "node scripts/validate-skills.mjs"
}
```

---

### IN-02: `parseFrontmatter` does not handle duplicate keys

**File:** `packages/twentythree-skills/scripts/validate-skills.mjs:88-116`

**Issue:** If `SKILL.md` contains a duplicate frontmatter key (e.g., two `name:` lines), the parser silently overwrites the first value with the second. YAML spec treats duplicate keys as an error, but the hand-rolled parser accepts them. For a validation script this is a minor gap — it could mask a malformed SKILL.md.

**Fix:** Add a duplicate-key warning:

```js
if (keys.has(lastKey)) {
  warnings.push(`skills/SKILL.md frontmatter has duplicate key '${lastKey}' — last value wins`)
}
keys.add(lastKey)
```

---

### IN-03: `turbo.json` build task has no inputs that reflect actual package files

**File:** `packages/twentythree-skills/turbo.json:6-9`

**Issue:** The `build` task lists `inputs: ["skills/**/*.md"]` but the package also contains `bin/add.js` and `scripts/validate-skills.mjs`. A change to either of those files will not invalidate the Turbo cache for the `build` task, meaning `turbo build` may return a stale cache hit after modifying the installer or validator.

**Fix:** Add the relevant source files to `inputs`:

```json
"build": {
  "dependsOn": [],
  "inputs": ["skills/**/*.md", "bin/**", "scripts/**"],
  "outputs": []
}
```

---

### IN-04: `SKILL.md` `allowed-tools` value may be too restrictive for diagnostic use

**File:** `packages/twentythree-skills/skills/SKILL.md:22`

**Issue:** `allowed-tools: Bash(twentythree *)` restricts the agent to only the `twentythree` CLI binary. If a consuming agent needs to run `twentythree doctor` (which itself may need system introspection) or check node version as part of diagnostics, the restriction is correct. However, the SKILL.md text at line 209 tells agents to run `twentythree doctor` for diagnostics, and at line 209 it also implies checking environment issues — all of which stay within `Bash(twentythree *)`. This is fine as written, but worth confirming that the glob `twentythree *` matches `twentythree doctor` (no subcommand) as well as `twentythree video upload` (with subcommand). Most agent runtimes treat `Bash(twentythree *)` as a prefix match, so `twentythree doctor` (no space after the binary name in the wildcard) may or may not match depending on the agent's ACL implementation.

**Fix:** If the runtime uses exact prefix matching, change to:

```yaml
allowed-tools: Bash(twentythree), Bash(twentythree *)
```

This explicitly covers both the bare `twentythree` invocation and any subcommand form.

---

_Reviewed: 2026-04-20T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
