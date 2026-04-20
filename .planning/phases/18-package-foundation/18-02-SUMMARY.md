---
phase: 18-package-foundation
plan: "02"
subsystem: twentythree-skills
tags: [skills, agent-skills, SKILL.md, documentation, resource-index]
dependency_graph:
  requires: [18-package-foundation/01]
  provides: [skills-SKILL.md-complete]
  affects: [Phase 19 reference files, Phase 20 runtime installer]
tech_stack:
  added: []
  patterns: [agent-skills frontmatter, allowed-tools enforcement, D-03 resource index]
key_files:
  created: []
  modified:
    - packages/twentythree-skills/skills/SKILL.md
decisions:
  - "allowed-tools: Bash(twentythree *) added to frontmatter — enables Claude Code to pre-approve all CLI calls without per-command confirmation"
  - "argument-hint updated to '<topic> <verb> [flags]' — reflects actual oclif command structure"
  - "Terminology mapping section placed in Key Invariants — collocated with chunked-upload invariant for discoverability"
metrics:
  duration: "~2 minutes"
  completed: "2026-04-20"
  tasks_completed: 1
  files_created: 0
  files_modified: 1
---

# Phase 18 Plan 02: SKILL.md Rewrite Summary

**One-liner:** Full D-03 agent-ready SKILL.md — expanded frontmatter with `allowed-tools`, 8-section body covering auth/syntax/--agent/invariants/22-group resource index/meta commands/workflows/diagnostics, 211 lines total.

## What Was Built

The placeholder `skills/SKILL.md` (19 lines with stub content) was replaced with a complete, production-ready skill file.

### Final Frontmatter Shape

7 keys present:

| Key | Value summary |
|-----|---------------|
| `name` | `twentythree` (preserved — required by agentskills.io spec) |
| `description` | Block scalar, 9 lines — full capability description covering all 22 groups and key flags |
| `triggers` | 8 entries: upload video, manage videos, webinar, live event, analytics, twentythree, video platform, TwentyThree CLI |
| `invocable` | `true` |
| `argument-hint` | `"<topic> <verb> [flags]"` (updated from `"<command> [flags]"`) |
| `allowed-tools` | `Bash(twentythree *)` — pre-approves all CLI calls for Claude Code |
| `compatibility` | References `npm install -g twentythree-cli`, Node.js >=22 |

### Final Body Section Outline

8 H2 sections in order:

1. **Prerequisites: Authentication** — `twentythree auth credentials` setup, OS keychain storage, `twentythree auth status` verification, multi-workspace switching with `workspace list` / `workspace use`
2. **Command Syntax** — `<topic> <verb> [flags]` pattern, global flags table (`--json`, `--agent`, `--workspace`)
3. **Self-Discovery: The `--agent` Flag** — introspection command, full JSON example with `api_endpoint`, `auth_scope`, `output_shape`, `side_effects`, `flags`, key field descriptions
4. **Key Invariants** — `--json` in agentic contexts, chunked upload, terminology mapping (video↔photo, category↔album, webinar↔live), ID+admin URL output, `doctor` on errors
5. **Resource Index** — 22-row markdown table with topic, representative verbs, use-for description
6. **Meta Commands** — 4-row table: auth, workspace, autocomplete, doctor
7. **Common Workflows** — "Upload and Publish a Video" (4-step bash block) and "Webinar Setup" (3-step bash block)
8. **Diagnostics** — `doctor`, `--version`, `--help`, `--agent` commands with triage steps

### Line Count

211 lines (target: 150-260).

### Content Divergence from Planned Text

None significant. The planned content in the `<action>` block was used verbatim. Minor: the `→` arrow character in workflow comments was changed to `=>` to avoid any terminal encoding edge cases in code blocks.

## Verification Results

All acceptance criteria passed:

| Check | Result |
|-------|--------|
| File exists and is 150-260 lines | 211 lines — PASS |
| `name: twentythree` in frontmatter | PASS |
| `allowed-tools: Bash(twentythree *)` in frontmatter | PASS |
| `invocable: true` in frontmatter | PASS |
| `argument-hint` key present | PASS |
| `compatibility` key present | PASS |
| `## Prerequisites: Authentication` section | PASS |
| `twentythree auth credentials` present | PASS |
| `twentythree auth status` present | PASS |
| `twentythree workspace use` present | PASS |
| `--agent` section present | PASS |
| `api_endpoint` in --agent example | PASS |
| `auth_scope` in --agent example | PASS |
| `output_shape` in --agent example | PASS |
| `side_effects` in --agent example | PASS |
| `## Resource Index` section | PASS |
| All 22 resource groups in index | 22/22 PASS |
| `## Meta Commands` section | PASS |
| `## Common Workflows` section | PASS |
| `### Upload and Publish a Video` subsection | PASS |
| `### Webinar Setup` subsection | PASS |
| Terminology mapping (video↔photo) | PASS |
| `twentythree doctor` in diagnostics | PASS |
| `pnpm --filter twentythree-skills test` exits 0 | PASS |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None in this plan. The SKILL.md body is fully populated with real content.

Previously-known stubs from plan 01 remain:
- `packages/twentythree-skills/bin/add.js` — exits 1 "not yet implemented"; Phase 20 adds runtime logic.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| packages/twentythree-skills/skills/SKILL.md | FOUND |
| Commit f43b903 (Task 1) | FOUND |
