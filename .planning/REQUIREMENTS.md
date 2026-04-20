# Requirements: v1.3 TwentyThree Agent Skill

**Milestone:** v1.3
**Status:** Active
**Created:** 2026-04-20

---

## Active Requirements

### Package Scaffold (PKG)

- [x] **PKG-01**: `packages/twentythree-skills` exists as a standalone npm package in the monorepo with ESM type, `bin` entry wiring `twentythree-skills add`, and `files` whitelist that excludes source/dev artifacts
- [x] **PKG-02**: A `turbo.json` override in `packages/twentythree-skills` marks the package as no-build so turborepo does not attempt to compile static skill files
- [x] **PKG-03**: A `validate-skills` script checks all skill files for valid SKILL.md frontmatter (`name`, `description`) and that all 22 resource groups have a corresponding reference file — runs as part of CI

### Skill Content (SKILL)

- [x] **SKILL-01**: Root `SKILL.md` (~200 lines) includes: auth setup section documenting `twentythree auth credentials` as a prerequisite, command syntax overview, full resource index linking to all 22 reference files, `--agent` flag documentation, and `allowed-tools: Bash(twentythree *)` declaration
- [x] **SKILL-02**: 22 hand-authored reference files (one per resource group: video, category, webinar, analytics, audience, action, collector, comment, player, poll, tag, spot, thumbnail, webhook, app, presentation, protection, session, openupload, site, setting, user) — each documents key commands with flags and usage examples
- [ ] **SKILL-03**: 2–3 workflow files covering high-value agent automation patterns (e.g. upload-and-publish flow, webinar-lifecycle flow)

### Runtime Installer (INSTALL)

- [ ] **INSTALL-01**: `npx twentythree-skills add` detects Claude Code (`~/.claude/`), Codex, and Copilot runtimes via directory presence check and installs skill files into the correct location for each detected runtime
- [ ] **INSTALL-02**: Installer supports `--project` flag to install into the current working directory's runtime-specific skills folder (e.g. `.claude/skills/`) instead of the global location
- [ ] **INSTALL-03**: Installer is idempotent — safe to re-run without corruption; prints a confirmation listing every file written and its destination path

---

## Future Requirements (post-v1.3)

- Claude.ai web installation — requires ZIP upload through browser UI; cannot be automated; may be documented as a manual step
- Auto-generation of reference file stubs from `agentMetadata` output — reduces drift risk; deferred in favour of hand-authored quality for v1.3
- Workflow files beyond the initial 2–3 — expand as high-value patterns are identified through usage

---

## Out of Scope

- Claude.ai programmatic install — no public API; browser ZIP upload only
- Runtime-specific format conversion (JSON schemas for OpenAI Assistants API) — all target runtimes use the universal SKILL.md format (agentskills.io)
- `twentythree-skills` importing from `twentythree-cli` at runtime — installer is a file-copy tool using Node built-ins only; no CLI dependency in package.json
- Auto-generated skill content — hand-authored for UX quality per v1.3 scope decision

---

## Traceability

| Requirement | Phase | Plan |
|-------------|-------|------|
| PKG-01 | Phase 18 | TBD |
| PKG-02 | Phase 18 | TBD |
| PKG-03 | Phase 18 | TBD |
| SKILL-01 | Phase 18 | TBD |
| SKILL-02 | Phase 19 | TBD |
| SKILL-03 | Phase 19 | TBD |
| INSTALL-01 | Phase 20 | TBD |
| INSTALL-02 | Phase 20 | TBD |
| INSTALL-03 | Phase 20 | TBD |
