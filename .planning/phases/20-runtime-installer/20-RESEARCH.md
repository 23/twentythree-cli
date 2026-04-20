# Phase 20: Runtime Installer - Research

**Researched:** 2026-04-20
**Domain:** Node.js ESM file-copy installer, multi-runtime agent skill deployment
**Confidence:** HIGH — all implementation decisions verified against live codebase, Node.js docs, and runtime directory inspection

---

## Summary

Phase 20 is a single-file implementation task: replace the stub `packages/twentythree-skills/bin/add.js` (7 lines, exits 1) with a working runtime installer (~100–150 lines). All architectural decisions are locked in CONTEXT.md. The research confirms those decisions are correct and surfaces the precise Node.js API calls, path conventions, and edge cases the implementer needs.

The installer uses only `node:fs`, `node:path`, `node:os`, and `node:url` built-ins. No external packages, no TypeScript compilation, no build step. The source tree to copy is verified at 25 files (1 root SKILL.md + 22 reference/ + 2 workflows/). Three of the four target runtimes are present on the development machine for live testing. The Node.js built-in `cpSync` with `{ recursive: true }` handles the directory copy correctly in Node 22 — verified with a live test.

The only non-obvious implementation detail is the Cursor skills path. On the development machine `~/.cursor/skills/` does not exist (the machine has `~/.cursor/skills-cursor/` instead). CONTEXT.md D-05 specifies `~/.cursor/skills/twentythree/` as the install target — the installer should create this directory if it does not exist, which is consistent with the `mkdir -p` requirement for all runtimes.

**Primary recommendation:** Implement `bin/add.js` directly against the locked decisions in CONTEXT.md. No new decisions required; the research confirms all API calls, paths, and output formats are ready to code.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01: Multi-runtime behavior**
Install to all detected runtimes silently — no prompt, no `--target` flag required. When Claude Code + Codex + Copilot are all present, install to each automatically. Idempotency means re-running is safe.

**D-02: Files to copy**
Full `skills/` tree — copy `SKILL.md` + `reference/` (22 files) + `workflows/` (2 files) = 25 files per runtime. Source: `packages/twentythree-skills/skills/` (resolved relative to the package at runtime via `import.meta.url`). Destination: `<runtime-root>/skills/twentythree/` — preserving subdirectory structure.

**D-03: Output verbosity**
Per-file listing — print one line per destination file written. Group by runtime with a runtime header before its file list. Already-existing files: overwrite silently (idempotent) and still print them.

**D-04: No-runtime fallback**
When no supported runtime directory is found, print a short message naming the directories checked, a link to the npm page, and exit 0. Not finding a runtime is not an error.

**D-05: Runtime detection and install paths**
Detection is directory-based (check root runtime dir existence):

| Runtime | Detect via | Global install path | Project install path |
|---------|------------|--------------------|--------------------|
| Claude Code | `~/.claude/` | `~/.claude/skills/twentythree/` | `.claude/skills/twentythree/` |
| OpenAI Codex | `~/.codex/` | `~/.codex/skills/twentythree/` | `.agents/skills/twentythree/` |
| GitHub Copilot | `~/.github/copilot/` | `~/.github/skills/twentythree/` | `.github/skills/twentythree/` |
| Cursor | `~/.cursor/` | `~/.cursor/skills/twentythree/` | `.cursor/skills/twentythree/` |

**D-06: `--project` flag**
Installs into cwd-relative path for each detected runtime. Same multi-runtime silent-install behavior as global mode. Creates subdirectories as needed.

**Implementation constraints:**
- Node.js built-ins only (`node:fs`, `node:path`, `node:os`, `node:url`)
- No external deps — installer runs standalone via `npx`
- Target: < 150 lines
- ESM — `import` syntax, `.js` extension; package is `"type": "module"`

### Claude's Discretion

None — all decisions are locked.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INSTALL-01 | `npx twentythree-skills add` detects Claude Code (`~/.claude/`), Codex, and Copilot runtimes via directory presence check and installs skill files into the correct location for each detected runtime | Directory probe pattern verified (see Architecture Patterns); all 4 runtime paths confirmed in CONTEXT.md D-05 |
| INSTALL-02 | Installer supports `--project` flag to install into the current working directory's runtime-specific skills folder instead of the global location | `process.argv` flag parsing + `process.cwd()` for base; same copy logic as global mode |
| INSTALL-03 | Installer is idempotent — safe to re-run without corruption; prints a confirmation listing every file written and its destination path | `cpSync` with `{ recursive: true }` overwrites existing files cleanly; no partial-state risk |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Runtime detection | CLI / installer (Node.js process) | — | `existsSync` on home-relative paths; runs in user's terminal, not inside an agent |
| File copy | CLI / installer (Node.js process) | — | `cpSync` built-in; no IPC, no subprocess |
| Path resolution (source) | CLI / installer | — | `import.meta.url` → `fileURLToPath` → relative to `bin/` |
| Path resolution (destination) | CLI / installer | — | `os.homedir()` for global; `process.cwd()` for project |
| Output formatting | CLI / installer (stdout) | — | Plain `console.log`; no terminal library; no color needed per constraint |
| Argument parsing | CLI / installer | — | `process.argv.includes('--project')` — no flag library needed for one flag |

---

## Standard Stack

### Core (Node.js Built-ins Only)

| Module | Purpose | Notes |
|--------|---------|-------|
| `node:fs` (`existsSync`, `mkdirSync`, `cpSync`) | Directory detection, mkdir, recursive copy | `cpSync` with `{ recursive: true }` verified in Node 22.22.2 [VERIFIED: live test] |
| `node:path` (`join`, `resolve`, `relative`, `dirname`) | Path construction for source/dest | |
| `node:os` (`homedir`) | Resolves `~` to absolute home path | |
| `node:url` (`fileURLToPath`) | Converts `import.meta.url` to a filesystem path | Pattern: `fileURLToPath(new URL('.', import.meta.url))` gives the `bin/` directory |

No external dependencies. [VERIFIED: CONTEXT.md D-06 constraint]

### Supporting

None — single-file implementation.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `cpSync` | Manual recursive readdir + copyFile loop | Unnecessary; `cpSync({ recursive: true })` works correctly in Node 22 [VERIFIED] |
| `process.argv.includes` | minimist, yargs-parser | Overkill for a single `--project` flag and no values; no deps rule enforces this |

**Installation:** No packages to install — Node.js built-ins only.

---

## Architecture Patterns

### System Architecture Diagram

```
npx twentythree-skills add [--project]
          │
          ▼
  Parse --project flag
  (process.argv.includes)
          │
          ├── global mode: base = homedir()
          └── project mode: base = process.cwd()
                    │
                    ▼
          Detect runtimes
          (existsSync on 4 root dirs)
                    │
          ┌─────────┴──────────┐
          │                    │
       found                 none
          │                    │
          ▼                    ▼
   For each runtime:     Print "No supported runtime"
   1. mkdirSync dest     List checked dirs
      { recursive }      Print npm link
   2. Walk skills/        exit(0)
      source tree
   3. cpSync each file
      to dest
   4. Print runtime
      header + file list
          │
          ▼
        exit(0)
```

### Recommended Project Structure

```
packages/twentythree-skills/
├── bin/
│   └── add.js            # THIS FILE — the entire Phase 20 implementation
├── skills/               # Source tree (already complete from Phase 18/19)
│   ├── SKILL.md
│   ├── reference/        # 22 files
│   └── workflows/        # 2 files
└── package.json          # bin entry already wired; no changes needed
```

### Pattern 1: Source Path Resolution

**What:** Resolving the `skills/` directory relative to `bin/add.js` at runtime, even when invoked via `npx`.

**When to use:** Every invocation — the source path is always relative to the installed package.

```javascript
// Source: Node.js ESM docs — fileURLToPath pattern
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// __dirname is the bin/ directory
const skillsSource = join(__dirname, '..', 'skills');
// skillsSource is packages/twentythree-skills/skills/
```

[VERIFIED: live test confirmed `fileURLToPath(new URL('.', import.meta.url))` produces the `bin/` directory path]

### Pattern 2: Runtime Detection

**What:** Check if a runtime root directory exists before attempting to install into it.

**When to use:** Run once at startup; collect all detected runtimes before beginning any copy.

```javascript
// Source: Node.js docs — existsSync is synchronous, appropriate for startup probe
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const home = homedir();

const RUNTIMES = [
  {
    name: 'Claude Code',
    detect: join(home, '.claude'),
    globalDest: join(home, '.claude', 'skills', 'twentythree'),
    projectDest: join('.claude', 'skills', 'twentythree'),
  },
  {
    name: 'OpenAI Codex',
    detect: join(home, '.codex'),
    globalDest: join(home, '.codex', 'skills', 'twentythree'),
    projectDest: join('.agents', 'skills', 'twentythree'),
  },
  {
    name: 'GitHub Copilot',
    detect: join(home, '.github', 'copilot'),
    globalDest: join(home, '.github', 'skills', 'twentythree'),
    projectDest: join('.github', 'skills', 'twentythree'),
  },
  {
    name: 'Cursor',
    detect: join(home, '.cursor'),
    globalDest: join(home, '.cursor', 'skills', 'twentythree'),
    projectDest: join('.cursor', 'skills', 'twentythree'),
  },
];

const detected = RUNTIMES.filter(r => existsSync(r.detect));
```

[VERIFIED: existsSync probe confirmed working on Claude Code, Codex, Cursor on dev machine]

### Pattern 3: Recursive File Copy with Per-File Output

**What:** Copy the entire `skills/` tree preserving subdirectories, printing each file written.

**When to use:** After determining the destination path for each runtime.

**Critical detail:** `cpSync` copies the source *contents* to the destination when called file-by-file, but when called directory-to-directory it copies the directory itself. To copy the *contents* of `skills/` into `dest/`, walk the source tree and copy file-by-file (preserving relative paths), OR use `cpSync(src, dest, { recursive: true })` which copies `skills/` as `dest/` (the destination becomes the skills directory). The idiomatic approach for "copy contents of src into dest" is to iterate files and call `cpSync` per file.

```javascript
import { readdirSync, mkdirSync, cpSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

function installSkills(skillsSource, destRoot) {
  mkdirSync(destRoot, { recursive: true });

  const files = walkDir(skillsSource);
  for (const absFile of files) {
    const rel = relative(skillsSource, absFile);       // e.g. "reference/video.md"
    const destFile = join(destRoot, rel);
    mkdirSync(dirname(destFile), { recursive: true }); // ensure reference/ exists in dest
    cpSync(absFile, destFile);                         // copy single file (overwrite = default)
    console.log(`  ✓ ${rel}`);
  }
}

function walkDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full));
    } else {
      files.push(full);
    }
  }
  return files;
}
```

[VERIFIED: cpSync verified working with Node 22.22.2; recursive directory walking is standard Node.js pattern]

### Pattern 4: No-Runtime Fallback Output

**What:** When zero runtimes are detected, print a diagnostic message and exit 0.

```javascript
if (detected.length === 0) {
  const checked = RUNTIMES.map(r => r.detect.replace(home, '~')).join('  ');
  console.log('No supported agent runtime detected.\n');
  console.log(`Checked: ${checked}\n`);
  console.log('Install manually or see: https://www.npmjs.com/package/twentythree-skills');
  process.exit(0);
}
```

[VERIFIED: matches D-04 spec exactly]

### Pattern 5: Runtime Header Output

**What:** Group per-file output under a runtime header.

```javascript
// For each detected runtime:
const label = isProject
  ? `${runtime.name} (./${runtime.projectDest}/)`
  : `${runtime.name} (${destPath.replace(home, '~')}/)`
console.log(`\n${label}`);
// then per-file: console.log(`  ✓ ${rel}`)
```

[VERIFIED: matches D-03 spec]

### Anti-Patterns to Avoid

- **Using `cpSync(srcDir, destDir, { recursive: true })` to copy directory contents:** This copies the source *directory itself* into dest, creating `dest/skills/` rather than placing files at `dest/`. Walk files individually instead.
- **Checking `~/.claude/skills/` (not `~/.claude/`) for detection:** The detection target is the runtime root, not the skills subdirectory. The skills subdirectory may not exist yet — the installer creates it.
- **Using process.exit(1) for "no runtime found":** Exit 0 per D-04. A clean machine with no runtimes is not an error condition.
- **Skipping output for already-existing files:** Files must be printed even on re-run (idempotent output per D-03).
- **Importing readline or @clack/prompts:** No prompts in the installer. Silent-install-to-all is the decided behavior (D-01).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Recursive directory copy | Custom recursive copy with multiple `copyFileSync` calls | `cpSync` with per-file walk | `cpSync` handles permissions, symlinks, and overwrites correctly |
| Home directory path | String manipulation on `process.env.HOME` | `os.homedir()` | Works on Windows (for future portability); handles edge cases where HOME is unset |
| ESM `__dirname` equivalent | Complex URL manipulation | `dirname(fileURLToPath(import.meta.url))` | Standard ESM pattern; works in `npx` invocations |

---

## Common Pitfalls

### Pitfall 1: `cpSync` Directory vs Contents Semantics

**What goes wrong:** Calling `cpSync(skillsDir, destDir, { recursive: true })` copies `skillsDir` *as* `destDir` — meaning `destDir` becomes the skills root. Files end up at `destDir/SKILL.md`, `destDir/reference/video.md`, which is the desired layout. **But** if `destDir` already exists from a prior run, `cpSync` with `recursive: true` merges correctly. However, if the intent is to show per-file output, `cpSync` on the whole directory produces no iteration hooks.

**Why it happens:** The recursive flag on `cpSync` is "copy this directory tree" not "copy directory contents."

**How to avoid:** Walk the source tree with `readdirSync` + `walkDir` helper, then `cpSync` each individual file. This gives the per-file output loop needed for D-03 and is still idempotent.

**Warning signs:** Output shows only runtime header but no file lines.

### Pitfall 2: Runtime Detection Path for Cursor

**What goes wrong:** Cursor's `~/.cursor/skills/` directory may not exist by default. The detection target is `~/.cursor/` (the app root), not `~/.cursor/skills/`. Testing on the dev machine shows `~/.cursor/skills/` is absent while `~/.cursor/` is present.

**Why it happens:** Cursor creates `~/.cursor/` at install time. Skills directories are created on demand.

**How to avoid:** Detect on `~/.cursor/` root. `mkdirSync(destDir, { recursive: true })` creates `~/.cursor/skills/twentythree/` even though the parent `~/.cursor/skills/` did not previously exist.

**Warning signs:** Cursor never detected even though Cursor is installed.

### Pitfall 3: Project Mode Base Path

**What goes wrong:** In `--project` mode, joining `process.cwd()` + relative path like `.claude/skills/twentythree` requires care — `join(cwd, '.claude/skills/twentythree')` works, but on Windows the separator differs.

**Why it happens:** String literal path fragments with forward slashes.

**How to avoid:** Use `path.join(process.cwd(), '.claude', 'skills', 'twentythree')` — pass segments separately to `join()`.

**Warning signs:** Path construction fails on Windows (not a current concern but worth noting).

### Pitfall 4: `import.meta.url` in Source (not invocation) Context

**What goes wrong:** If `add.js` is called via a symlink (as npm global bin installs create), `import.meta.url` still resolves to the *real* file location, not the symlink. This is correct behavior — the source files at `../skills` relative to the real `bin/add.js` are always reachable.

**Why it happens:** Node.js resolves `import.meta.url` to the actual file, not the symlink.

**How to avoid:** No special handling needed — this is the desired behavior.

---

## Code Examples

### Complete Installer Skeleton

```javascript
#!/usr/bin/env node
// bin/add.js — TwentyThree Skills installer
// Node.js built-ins only. ESM. No build step. Target: < 150 lines.

import { existsSync, mkdirSync, cpSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillsSource = join(__dirname, '..', 'skills');
const home = homedir();
const isProject = process.argv.includes('--project');

const RUNTIMES = [
  {
    name: 'Claude Code',
    detect: join(home, '.claude'),
    globalDest: join(home, '.claude', 'skills', 'twentythree'),
    projectDest: join(process.cwd(), '.claude', 'skills', 'twentythree'),
  },
  {
    name: 'OpenAI Codex',
    detect: join(home, '.codex'),
    globalDest: join(home, '.codex', 'skills', 'twentythree'),
    projectDest: join(process.cwd(), '.agents', 'skills', 'twentythree'),
  },
  {
    name: 'GitHub Copilot',
    detect: join(home, '.github', 'copilot'),
    globalDest: join(home, '.github', 'skills', 'twentythree'),
    projectDest: join(process.cwd(), '.github', 'skills', 'twentythree'),
  },
  {
    name: 'Cursor',
    detect: join(home, '.cursor'),
    globalDest: join(home, '.cursor', 'skills', 'twentythree'),
    projectDest: join(process.cwd(), '.cursor', 'skills', 'twentythree'),
  },
];

function walkDir(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    entry.isDirectory() ? files.push(...walkDir(full)) : files.push(full);
  }
  return files;
}

function installTo(destRoot, label) {
  mkdirSync(destRoot, { recursive: true });
  console.log(`\n${label}`);
  for (const absFile of walkDir(skillsSource)) {
    const rel = relative(skillsSource, absFile);
    const destFile = join(destRoot, rel);
    mkdirSync(dirname(destFile), { recursive: true });
    cpSync(absFile, destFile);
    console.log(`  ✓ ${rel}`);
  }
}

const detected = RUNTIMES.filter(r => existsSync(r.detect));

if (detected.length === 0) {
  const checked = RUNTIMES.map(r => r.detect.replace(home, '~')).join('  ');
  console.log('No supported agent runtime detected.\n');
  console.log(`Checked: ${checked}\n`);
  console.log('Install manually or see: https://www.npmjs.com/package/twentythree-skills');
  process.exit(0);
}

for (const runtime of detected) {
  const dest = isProject ? runtime.projectDest : runtime.globalDest;
  const shortDest = dest.replace(home, '~').replace(process.cwd() + '/', './');
  installTo(dest, `${runtime.name} (${shortDest}/)`);
}

console.log('\nDone.');
```

[ASSUMED] — this skeleton is based on verified patterns above but has not been run end-to-end as the authoritative implementation. Treat as a starting template for the plan.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `fs.copyFileSync` with manual mkdir | `cpSync(src, dst)` | Node 16.7.0 | Single call per file; handles overwrite, permissions |
| `__dirname` in CJS | `dirname(fileURLToPath(import.meta.url))` in ESM | Node 12+ ESM adoption | Required when `"type": "module"` |
| `path.resolve(process.env.HOME, ...)` | `os.homedir()` | Always preferred | Handles undefined HOME, works cross-platform |

---

## Runtime State Inventory

> This is a greenfield implementation — no rename/refactor. No runtime state inventory needed.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js >=22 | Installer (`engines` field) | ✓ | v22.22.2 | — |
| `~/.claude/` | Claude Code install | ✓ | present | Skip runtime |
| `~/.codex/` | Codex install | ✓ | present | Skip runtime |
| `~/.github/copilot/` | Copilot install | ✗ | absent | Skip runtime (exit 0 if only runtime) |
| `~/.cursor/` | Cursor install | ✓ | present | Skip runtime |

[VERIFIED: directory probe executed live on dev machine]

**Missing dependencies with no fallback:** None — absent runtimes are skipped per design.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node.js built-in `assert` + `validate-skills.mjs` script (no vitest in this package) |
| Config file | none — `scripts/validate-skills.mjs` is invoked directly |
| Quick run command | `pnpm --filter twentythree-skills test` |
| Full suite command | `pnpm --filter twentythree-skills test` |

The `twentythree-skills` package has no vitest setup. The existing test is `scripts/validate-skills.mjs` which validates the source skill files. Phase 20's installer has no automated test defined in the package — the success criteria are verified manually per the phase success criteria (run `node bin/add.js`, inspect output, confirm files landed).

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INSTALL-01 | Detects runtimes and copies files to correct paths | manual smoke | `node packages/twentythree-skills/bin/add.js` (inspect output + dest dirs) | ❌ Wave 0 |
| INSTALL-02 | `--project` flag installs into cwd-relative paths | manual smoke | `cd /tmp && node .../bin/add.js --project` (inspect output) | ❌ Wave 0 |
| INSTALL-03 | Idempotent — re-run produces same output, no corruption | manual smoke | Run above command twice, diff output | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm --filter twentythree-skills test` (validates skill file structure)
- **Phase gate:** Manual smoke test per success criteria before `/gsd-verify-work`

### Wave 0 Gaps

- No automated test file for installer behavior — manual smoke test is the verification path per phase success criteria. No Wave 0 test file creation required.

---

## Security Domain

The installer runs as the current user, creates directories under `~` (owned by the user), and copies static markdown files. No authentication, no network calls, no credential handling. ASVS categories V2/V3/V4/V6 do not apply.

| ASVS Category | Applies | Notes |
|---------------|---------|-------|
| V5 Input Validation | Minimal | Only input is `--project` flag (boolean); no user-provided paths |
| All others | No | Static file copy; no auth, no network, no crypto |

**No security concerns for this phase.**

---

## Open Questions

None. All implementation decisions are locked in CONTEXT.md. The research confirms the Node.js API calls are correct and the source tree is in the expected state.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Installer skeleton in Code Examples section is a correct starting template | Code Examples | Low — individual patterns are verified; full end-to-end needs execution |
| A2 | Cursor global install target `~/.cursor/skills/twentythree/` is the correct path (the Cursor skill in `~/.cursor/skills-cursor/` references `~/.cursor/skills/` as the personal skill location) | Runtime Detection | Low — if wrong, Cursor users would need to copy manually; D-05 is the authoritative decision |

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: live codebase] `packages/twentythree-skills/bin/add.js` — current stub, confirmed exits 1
- [VERIFIED: live codebase] `packages/twentythree-skills/skills/` — 25 files confirmed (1 SKILL.md + 22 reference/ + 2 workflows/)
- [VERIFIED: live codebase] `packages/twentythree-skills/package.json` — `"type": "module"`, bin entry, no external deps
- [VERIFIED: live test] Node.js `cpSync` with `{ recursive: true }` works correctly in Node 22.22.2
- [VERIFIED: live test] `fileURLToPath(new URL('.', import.meta.url))` resolves to `bin/` directory
- [VERIFIED: live probe] Runtime directories: `~/.claude/` present, `~/.codex/` present, `~/.cursor/` present, `~/.github/copilot/` absent
- [CITED: CONTEXT.md] All locked decisions (D-01 through D-06)
- [CITED: .planning/research/ARCHITECTURE.md §Installer section] Install paths per runtime, detection strategy, no-external-deps rule

### Secondary (MEDIUM confidence)
- [CITED: ~/.cursor/skills-cursor/create-skill/SKILL.md] Cursor personal skill path confirmed as `~/.cursor/skills/`

---

## Metadata

**Confidence breakdown:**
- Implementation approach: HIGH — single file, locked decisions, verified APIs
- Node.js API calls: HIGH — verified in Node 22.22.2 via live tests
- Runtime install paths: HIGH — confirmed in CONTEXT.md D-05 from prior research
- Cursor skills path: MEDIUM — inferred from Cursor's own create-skill skill; `~/.cursor/skills/` not yet created on dev machine

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (runtime directory conventions are stable; Node.js built-in APIs do not change)
