# Phase 18: Package Foundation - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold `packages/twentythree-skills` as a publishable npm package in the monorepo with ESM type, bin wiring, turborepo no-build config, validate-skills CI script, and a root `skills/SKILL.md` that is immediately useful to an agent without requiring the Phase 19 reference files.

A stub already exists at `packages/twentythree-skills/` with a minimal `package.json` and a placeholder `SKILL.md` at the package root. Phase 18 fills this out — the existing placeholder `SKILL.md` moves to `skills/SKILL.md`.

Installer implementation (bin/add.js runtime detection + file copy logic) is Phase 20. Phase 18 wires the bin entry and validate-skills script, but does not implement runtime detection logic.

</domain>

<decisions>
## Implementation Decisions

### Skill file directory structure
- **D-01:** Skill files live under `skills/` subdirectory — NOT at package root
  - `skills/SKILL.md` — root skill (the full shell)
  - `skills/reference/` — per-resource reference files (Phase 19)
  - `skills/workflows/` — multi-step automation workflows (Phase 19)
- The existing placeholder `packages/twentythree-skills/SKILL.md` moves to `packages/twentythree-skills/skills/SKILL.md`

### Package module type
- **D-02:** `"type": "module"` (ESM) — no TypeScript compilation, no build step
  - The installer bin (`bin/add.js`) is a native ESM script using `node:` built-ins
  - Node 22 engines constraint (matches the CLI)
  - `turbo.json` override marks the package as no-build

### Root SKILL.md scope (skills/SKILL.md)
- **D-03:** Full shell — immediately useful without Phase 19 reference files
  - Full auth setup section: `twentythree auth credentials` as prerequisite, workspace select, multi-workspace switching
  - Complete resource index: all 22 resource groups with `twentythree <topic>` syntax
  - `--agent` flag documentation: how agents should introspect any command before calling it (`twentythree <command> --agent` returns api_endpoint, auth_scope, output_shape, side_effects)
  - `allowed-tools: Bash(twentythree *)` YAML frontmatter field to pre-approve all CLI calls in Claude Code
  - Workflow notes: common multi-step patterns (upload + publish, webinar setup)
  - 22 resource groups to cover: action, analytics, app, audience, auth, autocomplete, category, collector, comment, openupload, player, poll, presentation, protection, session, setting, site, spot, tag, thumbnail, user, video, webhook, webinar, workspace

### Claude's Discretion
- validate-skills script format (JS vs bash — prefer .mjs for portability)
- Exact SKILL.md `description` wording and `triggers` frontmatter values
- `files` array ordering and exact whitelist entries in package.json

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing package stub
- `packages/twentythree-skills/package.json` — existing stub to extend (not replace)
- `packages/twentythree-skills/SKILL.md` — existing placeholder to move to `skills/SKILL.md`

### Monorepo patterns
- `packages/twentythree-cli/package.json` — reference for fields, keywords, repository, author, engines pattern
- `turbo.json` — root turbo config; package-level `turbo.json` override pattern needed for no-build
- `.changeset/config.json` — linked versioning already wired (`twentythree-cli` + `twentythree-skills`)

### Requirements
- `.planning/REQUIREMENTS.md` — PKG-01, PKG-02, PKG-03, SKILL-01

### Research
- `.planning/research/STACK.md` — installer dependency choices (commander, Node built-ins)
- `.planning/research/FEATURES.md` — SKILL.md format spec (agentskills.io), allowed-tools, description field limits, auth pattern
- `.planning/research/ARCHITECTURE.md` — package structure, bin wiring, turborepo no-build pattern
- `.planning/research/PITFALLS.md` — workspace:* pitfall, static vs generated trade-off

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/twentythree-cli/src/commands/` — 22 topic directories; exact names are the `twentythree <topic>` command roots to document in the resource index
- `packages/twentythree-cli/src/commands/*/` — any command's `--agent` flag output is the reference for what to document in SKILL.md

### Established Patterns
- CJS for the CLI (`"type": "commonjs"`), but `twentythree-skills` uses ESM (`"type": "module"`) — both coexist fine in a pnpm monorepo
- `packages/twentythree-cli/package.json` `files` whitelist pattern — use same approach for `twentythree-skills`
- Changeset linked versioning already configured — no additional setup needed

### Integration Points
- `packages/twentythree-skills/` stub exists — extend in place, do not create a new directory
- Root `turbo.json` has `build` with `dist/**` outputs; the skills package needs its own `turbo.json` to opt out of the build pipeline

</code_context>

<specifics>
## Specific Ideas

- The root SKILL.md should enable an agent to authenticate and orient itself across all 22 resource groups without needing any reference files — it is a complete starting point, not a teaser
- `allowed-tools: Bash(twentythree *)` pre-approves all twentythree CLI calls in Claude Code runtimes
- The `--agent` flag self-discovery mechanism should be prominently documented as the primary way agents learn command details at runtime

</specifics>

<deferred>
## Deferred Ideas

- Runtime installer logic (bin/add.js directory detection, file copy, --project flag) — Phase 20
- 22 resource reference files — Phase 19
- Workflow files — Phase 19

</deferred>

---

*Phase: 18-package-foundation*
*Context gathered: 2026-04-20*
