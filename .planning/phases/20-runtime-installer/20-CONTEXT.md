# Phase 20: Runtime Installer - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement `bin/add.js` — the `npx twentythree-skills add` runtime installer. Detects supported agent runtimes via directory presence, copies the full `skills/` tree into the correct namespaced location for each detected runtime, supports `--project` flag for project-local install, is idempotent, and prints every file written.

No new skill content. No new package structure. Only `bin/add.js` changes (from stub to implementation).

</domain>

<decisions>
## Implementation Decisions

### Multi-runtime behavior (D-01)
- **Install to all detected runtimes silently** — no prompt, no `--target` flag required
- When Claude Code + Codex + Copilot are all present, install to each automatically
- Idempotency means re-running is safe — "install everywhere" has no downside

### Files to copy (D-02)
- **Full `skills/` tree** — copy `SKILL.md` + `reference/` (22 files) + `workflows/` (2 files) = 25 files per runtime
- Source: `packages/twentythree-skills/skills/` (resolved relative to the package at runtime via `import.meta.url`)
- Destination: `<runtime-root>/skills/twentythree/` — preserving the subdirectory structure (`reference/`, `workflows/`)

### Output verbosity (D-03)
- **Per-file listing** — print one line per destination file written
- Format: `  ✓ ~/.claude/skills/twentythree/SKILL.md` (one line per file)
- Group by runtime: print a runtime header before its file list
  ```
  Claude Code (~/.claude/skills/twentythree/)
    ✓ SKILL.md
    ✓ reference/action.md
    ...
  ```
- Already-existing files: overwrite silently (idempotent) and still print them

### No-runtime fallback (D-04)
- When no supported runtime directory is found, print a short message naming the directories checked, then a link to the npm page, and exit 0
- Example:
  ```
  No supported agent runtime detected.

  Checked: ~/.claude/  ~/.codex/  ~/.github/copilot/  ~/.cursor/

  Install manually or see: https://www.npmjs.com/package/twentythree-skills
  ```
- **Exit 0** — not finding a runtime is not an error; user may be on a clean machine

### Runtime detection and install paths (D-05)
Detection is directory-based (check existence of the root runtime dir, not env vars):

| Runtime | Detect via | Global install path | Project install path |
|---------|------------|--------------------|--------------------|
| Claude Code | `~/.claude/` | `~/.claude/skills/twentythree/` | `.claude/skills/twentythree/` |
| OpenAI Codex | `~/.codex/` | `~/.codex/skills/twentythree/` | `.agents/skills/twentythree/` |
| GitHub Copilot | `~/.github/copilot/` | `~/.github/skills/twentythree/` | `.github/skills/twentythree/` |
| Cursor | `~/.cursor/` | `~/.cursor/skills/twentythree/` | `.cursor/skills/twentythree/` |

### `--project` flag (D-06)
- `--project` installs into the cwd-relative path for each detected runtime (same multi-runtime logic, different base)
- Creates subdirectories as needed (`mkdir -p`)
- No prompt — same silent-install-to-all behavior as global mode

### Implementation constraints
- **Node.js built-ins only** — `node:fs`, `node:path`, `node:os`, `node:url` (for `import.meta.url`)
- **No external deps** — installer runs standalone via `npx`; no `node_modules` are guaranteed
- **Target: < 150 lines** — keep the installer small and auditable
- **ESM** — `import` syntax, `.js` extension; package is `"type": "module"`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing package state
- `packages/twentythree-skills/bin/add.js` — current stub (exits 1); this is the file to implement
- `packages/twentythree-skills/package.json` — bin entry is `"twentythree-skills": "./bin/add.js"`; `"type": "module"`; engines `node >=22.0.0`
- `packages/twentythree-skills/skills/` — source tree to copy: `SKILL.md`, `reference/*.md` (22 files), `workflows/*.md` (2 files)

### Requirements
- `.planning/REQUIREMENTS.md` — INSTALL-01, INSTALL-02, INSTALL-03

### Research
- `.planning/research/ARCHITECTURE.md` §Installer section — install paths per runtime, detection strategy, no-external-deps rule, <200 line target

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/twentythree-skills/skills/` — the source tree; installer resolves this path relative to `import.meta.url`
- No other reusable code — installer is standalone by design

### Established Patterns
- Package is ESM (`"type": "module"`) — use `import { ... } from 'node:fs/promises'` etc.
- `import.meta.url` → `fileURLToPath` → `path.dirname` for resolving package-relative paths
- No TypeScript — plain `.js` file, no compilation

### Integration Points
- `packages/twentythree-skills/package.json` `bin` field already points to `bin/add.js` — no manifest changes needed
- `packages/twentythree-skills/package.json` `files` whitelist includes `/bin` and `/skills` — both will be present in the published package

</code_context>

<specifics>
## Specific Ideas

- Output per-file with a runtime header for grouping (see D-03 example above)
- No-runtime fallback prints the exact directories checked so the user can diagnose why detection failed
- Fallback links to `https://www.npmjs.com/package/twentythree-skills` for manual install instructions

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 20-runtime-installer*
*Context gathered: 2026-04-20*
