---
phase: 20-runtime-installer
verified: 2026-04-20T00:00:00Z
status: passed
score: 5/5
overrides_applied: 0
re_verification: false
---

# Phase 20: Runtime Installer Verification Report

**Phase Goal:** Implement `bin/add.js` — the `npx twentythree-skills add` runtime installer. Detects supported agent runtimes via directory presence, copies the full `skills/` tree into the correct namespaced location for each detected runtime, supports `--project` flag for project-local install, is idempotent, and prints every file written.

**Verified:** 2026-04-20
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Running `node bin/add.js` on a machine with `~/.claude/` present copies 25 skill files into `~/.claude/skills/twentythree/` and prints each destination path | VERIFIED | Live run confirmed: `find ~/.claude/skills/twentythree -type f | wc -l` = 25; output shows 25 `✓` lines per detected runtime |
| 2 | Running `node bin/add.js --project` installs into `<cwd>/.claude/skills/twentythree/` (and analogous project paths) instead of global | VERIFIED | Live `--project` run into `/tmp/tt-project-verify` produced `.claude/`, `.agents/` (Codex), `.cursor/` subdirs, 25 files each, 75 total; exit 0 |
| 3 | Re-running the installer a second time completes without error and prints the same per-file output (idempotent overwrite) | VERIFIED | Two back-to-back runs: `diff /tmp/tt-run1.txt /tmp/tt-run2.txt` = empty diff, exit 0 both runs |
| 4 | When no runtime is detected, prints a message naming the four checked directories and the npm link, exits 0 | VERIFIED | `HOME=/tmp/tt-empty-home-verify node bin/add.js` output exactly: "No supported agent runtime detected." + "Checked: ~/.claude  ~/.codex  ~/.github/copilot  ~/.cursor" + npm link; exit=0 |
| 5 | `pnpm --filter twentythree-skills test` exits 0 after the change | VERIFIED | `validate-skills.mjs` reports "OK (SKILL.md frontmatter valid)"; skills/ tree is untouched |

**Score:** 5/5 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/twentythree-skills/bin/add.js` | Runtime installer: detect -> copy -> print per-file; contains `walkDir`; min 80 lines | VERIFIED | 103 lines; contains `walkDir`; `node -c` syntax OK; no semicolons (grep count = 0) |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `bin/add.js` | `packages/twentythree-skills/skills/` | `fileURLToPath(import.meta.url)` + `join(__dirname, '..', 'skills')` | VERIFIED | Line 11: `const skillsSource = join(__dirname, '..', 'skills')` — relative to the package's own location |
| `bin/add.js` | `os.homedir()` runtime subpaths | `RUNTIMES` array with `detect`/`globalDest`/`projectDest` | VERIFIED | Lines 16-41: RUNTIMES array using `homedir()` for all four runtimes with correct global paths |
| `bin/add.js` | `process.cwd()` project paths | `isProject = process.argv.includes('--project')` | VERIFIED | Line 14: `const isProject = process.argv.includes('--project')`; line 97 switches `dest` based on flag |

---

## Data-Flow Trace (Level 4)

Not applicable — this is a file-copy CLI installer, not a rendering component. Data flows from `skills/` source tree through `cpSync` to destination directories; verified by live file existence checks.

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| No-runtime fallback exits 0 | `HOME=/tmp/empty node bin/add.js; echo exit=$?` | "No supported agent runtime detected." + checked dirs + npm link; exit=0 | PASS |
| Idempotent re-run | Two runs, diff output | Byte-identical stdout, both exit 0 | PASS |
| `--project` mode creates cwd-relative paths | `node bin/add.js --project` from scratch dir | 75 files created across `.claude/`, `.agents/`, `.cursor/`; exit 0 | PASS |
| Test suite still passes | `pnpm --filter twentythree-skills test` | "validate-skills: OK (SKILL.md frontmatter valid)" | PASS |
| Node syntax check | `node -c bin/add.js` | exits 0 | PASS |

---

## Requirements Coverage

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| INSTALL-01 | Detects 4 runtimes via dir existence; copies 25-file `skills/` tree to `<runtime>/skills/twentythree/`; preserves subdirs; prints per-file output by runtime; exits 0 with helpful message when no runtime detected | SATISFIED | All 4 runtimes in RUNTIMES array (lines 16-41); `walkDir` preserves subdir structure; `cpSync` per-file with `console.log(\`  ✓ ${rel}\`)`; no-runtime path exits 0 with checked dirs listed |
| INSTALL-02 | `--project` flag installs to cwd-relative paths (`.claude/`, `.agents/`, `.github/`, `.cursor/`) | SATISFIED | `isProject` flag (line 14); ternary on line 97 selects `projectDest`; Codex uses `.agents/` not `.codex/` per D-05; live test confirmed |
| INSTALL-03 | Re-running produces same output, no corruption (idempotent) | SATISFIED | `mkdirSync({recursive:true})` + `cpSync` with `{dereference:false}` = overwrite semantics; identical diff across two runs |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | None found |

Checks performed:
- No semicolons: `grep -c ';' add.js` = 0
- No TODO/FIXME/placeholder comments: clean
- No empty implementations (`return null`, `return {}`, `return []`): not present
- No hardcoded empty data structures passed to rendering: not applicable (CLI, no rendering)
- `walkDir` function is substantive (lines 43-55), not a stub
- `installTo` function is substantive (lines 64-79), not a stub
- `shortPath` function is substantive (lines 57-62), not a stub

---

## One Deviation Noted (Non-Blocking)

The PLAN acceptance criteria listed `cpSync(absFile, destFile)` (no options), and the SUMMARY claimed "cpSync with no options". The actual implementation uses `cpSync(absFile, destFile, { dereference: false })`. This is a correct improvement: `dereference: false` prevents symlinks in the skills source from being followed and resolved to their targets during copy, preserving link integrity. This does not affect functionality for the current skills tree (which contains no symlinks) and is strictly more correct behavior. No deviation from the requirements — INSTALL-01 through INSTALL-03 are satisfied.

---

## Human Verification Required

None. All observable behaviors were verified programmatically via live execution.

---

## Gaps Summary

No gaps. All five must-have truths verified. All three requirements satisfied. The installer is a substantive, working implementation: 103 lines, zero external dependencies, ESM-only, `node:` prefix on all imports, no trailing semicolons, no stubs, no placeholders, functionally verified across all four code paths (global, project, idempotent, no-runtime).

---

_Verified: 2026-04-20_
_Verifier: Claude (gsd-verifier)_
