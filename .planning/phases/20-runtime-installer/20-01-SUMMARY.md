---
phase: 20-runtime-installer
plan: "01"
subsystem: twentythree-skills
tags: [installer, runtime-detection, ESM, skills]
dependency_graph:
  requires: []
  provides: [runtime-installer, INSTALL-01, INSTALL-02, INSTALL-03]
  affects: [packages/twentythree-skills/bin/add.js]
tech_stack:
  added: []
  patterns: [ESM-only bin script, node: prefix imports, walkDir recursive copy, shortPath home/cwd normalization]
key_files:
  created: []
  modified:
    - packages/twentythree-skills/bin/add.js
decisions:
  - "Codex project path uses .agents/ (not .codex/) per D-05 — deliberate, not corrected"
  - "shortPath function centralises ~ and ./ substitution to avoid inline duplication"
  - "walkDir uses readdirSync withFileTypes to avoid statSync — matches pattern in RESEARCH.md skeleton"
  - "cpSync with no options provides idempotent overwrite semantics by default"
metrics:
  duration: "2 minutes"
  completed: "2026-04-20"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 1
---

# Phase 20 Plan 01: Runtime Installer Summary

**One-liner:** Full ESM runtime installer detecting 4 agent runtimes, copying 25 skill files with per-file output, --project flag, idempotency, and no-runtime fallback — all via Node built-ins only.

## What Was Changed

**`packages/twentythree-skills/bin/add.js`** — replaced a 7-line stub with a 92-line complete installer.

| Before | After |
|--------|-------|
| 7 lines (stub, exits 1) | 92 lines (full implementation) |
| `process.exit(1)` on all invocations | Detects runtimes, copies 25 files, exits 0 |
| No functionality | INSTALL-01, INSTALL-02, INSTALL-03 satisfied |

## Runtime Detection Table (as implemented, matching D-05)

| Runtime | detect | globalDest | projectDest |
|---------|--------|------------|-------------|
| Claude Code | `~/.claude` | `~/.claude/skills/twentythree` | `./.claude/skills/twentythree` |
| OpenAI Codex | `~/.codex` | `~/.codex/skills/twentythree` | `./.agents/skills/twentythree` |
| GitHub Copilot | `~/.github/copilot` | `~/.github/skills/twentythree` | `./.github/skills/twentythree` |
| Cursor | `~/.cursor` | `~/.cursor/skills/twentythree` | `./.cursor/skills/twentythree` |

Note: Codex `projectDest` deliberately uses `.agents/` — this matches D-05 (locked decision) and is not a typo.

## Sample Stdout — Global Mode (first 10 lines)

```
Claude Code (~/.claude/skills/twentythree/)
  ✓ SKILL.md
  ✓ reference/action.md
  ✓ reference/analytics.md
  ✓ reference/app.md
  ✓ reference/audience.md
  ✓ reference/category.md
  ✓ reference/collector.md
  ✓ reference/comment.md
  ✓ reference/openupload.md
```

Three runtimes detected on this machine: Claude Code, OpenAI Codex, Cursor. Total: 75 check-mark lines (25 per runtime). Ends with blank line then `Done.`.

## Sample Stdout — --project Mode (first 10 lines)

```
Claude Code (./.claude/skills/twentythree/)
  ✓ SKILL.md
  ✓ reference/action.md
  ✓ reference/analytics.md
  ✓ reference/app.md
  ✓ reference/audience.md
  ✓ reference/category.md
  ✓ reference/collector.md
  ✓ reference/comment.md
  ✓ reference/openupload.md
```

Headers use `./` prefix instead of `~/`. Codex writes to `.agents/` not `.codex/`. Files land in cwd-relative paths.

## Sample Stdout — No-Runtime Fallback (exact message)

```
No supported agent runtime detected.

Checked: ~/.claude  ~/.codex  ~/.github/copilot  ~/.cursor

Install manually or see: https://www.npmjs.com/package/twentythree-skills
```

Exit code: 0. Tested via `HOME=/tmp/tt-empty-home node bin/add.js`.

## Test Results

- `pnpm --filter twentythree-skills test` exits 0 — validate-skills.mjs continues to pass
- `node -c packages/twentythree-skills/bin/add.js` exits 0 — syntax valid
- `grep -c ';$' bin/add.js` → 0 — no trailing semicolons
- `grep -c "from 'node:" bin/add.js` → 4 — all built-in imports use node: prefix
- `wc -l bin/add.js` → 92 — within 80-160 line target
- Global mode: 75 check-mark lines (25 per runtime x 3 runtimes detected)
- Idempotency: diff of two consecutive runs exits 0 (byte-identical)
- Project mode: .agents/ for Codex confirmed; .claude/, .cursor/ also written
- No-runtime fallback: exits 0 with exact diagnostic message

## Deviations from Plan

None — plan executed exactly as written. The implementation block in the plan's `<action>` section was copied verbatim. No unexpected behaviour encountered during smoke testing.

## Known Stubs

None — all functionality fully implemented and verified.

## Self-Check: PASSED

- `packages/twentythree-skills/bin/add.js` exists: FOUND
- Commit `0d44b89` exists: FOUND
- `pnpm --filter twentythree-skills test` exits 0: CONFIRMED
- Only `bin/add.js` modified (git diff --stat confirms 1 file changed): CONFIRMED
