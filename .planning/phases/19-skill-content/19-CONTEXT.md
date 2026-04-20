# Phase 19: Skill Content - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Write 22 hand-authored reference files (`skills/reference/`) and 2 workflow files (`skills/workflows/`). These are markdown content files — no code, no compilation. The validate-skills.mjs script (Phase 18) must exit 0 against all 22 reference files when Phase 19 is complete.

The 22 resource groups: action, analytics, app, audience, category, collector, comment, openupload, player, poll, presentation, protection, session, setting, site, spot, tag, thumbnail, user, video, webhook, webinar

The 2 workflows: upload-and-publish, webinar-lifecycle

Additional workflow patterns (video management, analytics reporting, personal video recording preparation, webinar analysis) are deferred to a future roadmap item — do NOT include them in Phase 19 plans.

</domain>

<decisions>
## Implementation Decisions

### Reference file depth (D-01)
- **Comprehensive guides** — each reference file is ~80-100 lines covering:
  - All flags for each command (not just the most common ones)
  - Multiple usage examples per command (basic + realistic agent usage)
  - Common patterns specific to that resource group
  - Notes on auth scope where relevant (read vs write vs admin)
  - Terminology notes where the API uses legacy names (e.g. `photo`→`video`, `album`→`category`, `live`→`webinar`)
- Source all flag/endpoint data from `twentythree <topic> <command> --agent` output — this is the authoritative source, not the code
- Include `--json` flag usage in every example (agents always use structured output)

### Workflow files (D-02)
- **2 workflows only** for Phase 19:
  1. `upload-and-publish.md` — upload a video file, set metadata, publish
  2. `webinar-lifecycle.md` — create a webinar, create a session, configure, start, end, archive
- Additional workflow patterns deferred to roadmap backlog:
  - Video management (bulk operations, category assignment)
  - Analytics reporting (pull metrics, export data)
  - Personal video recording preparation
  - Webinar analysis (post-event metrics)
- Each workflow file shows a complete multi-step agent automation sequence with:
  - All commands in order with exact flags
  - Expected output shape at each step
  - Error handling notes (what to check if a step fails)
  - Prerequisites and auth scope

### Coverage consistency (D-03)
- **All 22 reference files at equal comprehensive depth** — no tiered treatment
- Lower-traffic groups (spot, protection, openupload, etc.) get the same depth as high-value groups (video, webinar, analytics)
- Consistency makes the package predictable and avoids a "first-class vs second-class" feel for developers working with less common resources

### Reference file frontmatter
- **Claude's Discretion** — validator requires only `name` and `description`; add `topic` if useful but no extended schema required
- File naming: `<resource>.md` (e.g. `video.md`, `webinar.md`, `analytics.md`)

### Content sourcing
- **Claude's Discretion** — run `twentythree <topic> --help` or `--agent` on representative commands to gather accurate flag data; verify against the actual CLI, not assumptions
- Cross-reference `packages/twentythree-cli/src/commands/<topic>/` source files where flag descriptions are sparse

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 18 deliverables (what Phase 19 writes into)
- `packages/twentythree-skills/skills/SKILL.md` — root skill file; reference files link from the resource index here
- `packages/twentythree-skills/scripts/validate-skills.mjs` — the 22 resource group names and validation rules Phase 19 must satisfy
- `packages/twentythree-skills/skills/` — target directory structure (reference/ and workflows/ subdirs to create)

### Content source: CLI commands
- `packages/twentythree-cli/src/commands/` — 22 topic directories; each subcommand file has `static agentMetadata` with api_endpoint, auth_scope, output_shape, side_effects
- Run `twentythree <topic> <verb> --agent` for authoritative flag/endpoint data for any command

### Requirements
- `.planning/REQUIREMENTS.md` — SKILL-02 (22 reference files), SKILL-03 (2–3 workflow files)

### Milestone research (content guidance)
- `.planning/research/FEATURES.md` — SKILL.md format spec, agentskills.io patterns, content quality bar
- `.planning/research/PITFALLS.md` — auth must be explicit prerequisite; no npx references in skill content

### Phase 18 context (decisions carried forward)
- `.planning/phases/18-package-foundation/18-CONTEXT.md` — D-01 (skills/ directory structure), D-02 (ESM package), D-03 (full shell SKILL.md scope)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/twentythree-skills/skills/SKILL.md` — established format for frontmatter, section headers, code block style; reference files should match this style
- `packages/twentythree-cli/src/commands/<topic>/` — each directory is one resource group; subcommand files declare `static agentMetadata` — accurate source for flags, endpoints, side effects

### Established Patterns
- All examples use `--json` flag for machine-readable output (set in SKILL.md)
- Terminology mapping is established: `video` (CLI) = `photo` (API), `category` = `album`, `webinar` = `live`
- Auth scopes: anonymous (11 ep), none (44 ep), read (75 ep), write (84 ep), admin (19 ep) — note in reference files where non-read scopes required

### Integration Points
- `validate-skills.mjs` Gate 2 checks that `skills/reference/` contains all 22 named files — exact filenames must match the `RESOURCE_GROUPS` array in that script
- `skills/SKILL.md` resource index links to reference files with `twentythree <topic>` syntax — reference files should be the deep-dive companion to those index entries

</code_context>

<specifics>
## Specific Ideas

- Each reference file is a comprehensive guide an agent reads *before* calling commands in that resource group — it should answer "what can I do with this resource and how?" without requiring the agent to run `--agent` on every command first
- Workflow files are executable sequences — every step should have the exact command + flags the agent would run, not vague descriptions
- The 2 workflow files (upload-and-publish, webinar-lifecycle) should be immediately copy-paste usable by an agent with minimal parameter substitution

</specifics>

<deferred>
## Deferred Ideas

- Additional workflow patterns — user explicitly requested these go to roadmap backlog, NOT Phase 19:
  - Video management workflow (bulk operations, category assignment)
  - Analytics reporting workflow (pull metrics, export data)
  - Personal video recording preparation workflow
  - Webinar analysis workflow (post-event metrics)
- Auto-generation of reference file stubs from `agentMetadata` output — out of scope per REQUIREMENTS.md (hand-authored for v1.3)

</deferred>

---

*Phase: 19-skill-content*
*Context gathered: 2026-04-20*
