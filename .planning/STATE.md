---
gsd_state_version: 1.0
milestone: v1.5
milestone_name: Agent Behavioral Guidelines
status: completed
stopped_at: context exhaustion at 78% (2026-05-01)
last_updated: "2026-05-01T06:55:42.857Z"
last_activity: 2026-04-23 -- Phase 24 verified, v1.5 milestone complete
progress:
  total_phases: 12
  completed_phases: 2
  total_plans: 3
  completed_plans: 3
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-23)

**Core value:** A developer can authenticate, select a workspace, and call any TwentyThree API endpoint from the terminal in under a minute.
**Current focus:** v1.5 complete — ready for /gsd-complete-milestone

## Current Position

Phase: 24 — COMPLETE
Plan: 1/1 complete
Status: Milestone v1.5 complete — all phases done
Last activity: 2026-05-13 - Completed quick task 260513-a06: Review command documentation and make sure commands listed in the root README reflect available commands

Progress: [██████████] 100%

## Accumulated Context

### Roadmap Evolution

- Phase 6.1 inserted after Phase 6 in v1.0: Download and store swagger file; prescribe api-change workflow
- v1.1 starts at Phase 9 (continuing numbering from v1.0)
- v1.1 ended at Phase 13 (npm-publish)
- v1.2 starts at Phase 14, ends at Phase 17 (Phase 17 added 2026-04-20 for tech debt closure)
- v1.3 starts at Phase 18, ends at Phase 20 (roadmap created 2026-04-20)
- v1.4 starts at Phase 21, ends at Phase 22 (roadmap created 2026-04-20)
- v1.5 starts at Phase 23, ends at Phase 24 (roadmap created 2026-04-23)

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v1.1: Manual endpoint audit (no script) — classify 25 uncovered endpoints against spec, fill confirmed gaps
- v1.1: Publish as 1.0.0 (not 0.1.0) — v1.0 milestone internally complete
- v1.1: No .npmignore — whitelist `files` approach is safer in pnpm monorepo
- v1.1: `oclif readme --multi --nested-topics-depth 2` for docs generation — zero hand-writing for command reference
- [Phase 13-npm-publish]: NODE_AUTH_TOKEN scoped to publish step only; registry-url must be set in setup-node
- [Phase 14-bug-audit-fix]: Used paths mapping in package tsconfig to resolve conf ESM TS2307 — bundler moduleResolution incompatible with module:commonjs CJS build
- [Phase 14-bug-audit-fix]: Patch version 1.0.1 for BUG-01/BUG-02 fixes — all corrections backward-compatible, no new API surface
- [Phase 15-tab-completion]: Used this.config.runCommand for autocomplete cache build — plugin is ESM-only; avoids direct subpath import
- [Phase 15-tab-completion]: Added tmp/ to root .gitignore — oclif build tooling generates packages/twentythree-cli/tmp/ with artifacts that should not be tracked
- [Phase 16]: Use constructor.name check for FailedFlagValidationError since class is not exported from oclif/core public API
- [Phase 16]: Namespace import (import * as p) for @clack/prompts to enable both select() and new prompt functions
- [Phase 16]: Re-dispatch via this.config.runCommand to preserve existing argv (workspace, json flags)
- [Phase 17-tech-debt-cleanup]: Add DOM lib + @types/node to tsconfig.base.json — both needed for Node 22 CLI with built-in fetch/FormData/Blob
- [Phase 17-tech-debt-cleanup]: Override init() empty in Autocomplete to bypass workspace resolution while inheriting BaseCommand.catch() for PROMPT-01
- [v1.3 roadmap]: twentythree-skills must NOT have workspace:* in dependencies — breaks npm install for standalone npx users
- [v1.3 roadmap]: Runtime detection is directory-based (~/.claude/, ~/.codex/, ~/.agents/, ~/.github/) — no runtime-specific APIs needed
- [v1.3 roadmap]: No TypeScript compilation in twentythree-skills — static markdown + small ESM bin script only
- [v1.3 roadmap]: Phases 18 and 19 are independent — can proceed in parallel; Phase 20 depends on Phase 18 scaffold
- [Phase 18-package-foundation]: type=module for twentythree-skills — ESM-only, no CJS needed; static markdown + small bin script
- [Phase 18-package-foundation]: turbo.json extends:['//'] with dependsOn:[] — skills package excluded from CLI build pipeline
- [Phase 18-package-foundation]: validate-skills.mjs soft Gate 2 for reference/ — avoids failures in Phase 18/19 intermediate state
- [Phase 18-package-foundation]: allowed-tools: Bash(twentythree *) added to SKILL.md frontmatter — pre-approves all CLI calls for Claude Code agents
- [Phase 19-01]: All flag data sourced from live twentythree <cmd> --agent output rather than research doc or training data
- [Phase 19-01]: comment.md Terminology Notes required for --object-type legacy names (photo/album/live)
- [Phase 19-02]: player embed HTML output exception: document redirect idiom inline with explicit JSON vs redirect guidance
- [Phase 19-02]: openupload chunked-upload memory rule placed inline with upload-file command section for maximum agent visibility
- [Phase 19-02]: setting.md single-command topic compensated with 6 bash examples (dry-run, atomic, timezone/locale, branding patterns)
- [Phase 19-03]: analytics.md uses shared-flag pattern — all 21 commands share same base flags; single table replaces 21 identical tables
- [Phase 19-03]: user delete omitted — command does not exist in live CLI; live --agent is authoritative over research doc
- [Phase 19]: video.md written in single pass after gathering all 25 --agent outputs; A1 and A2 gaps closed
- [Phase 19]: webinar.md written via A5 gap closure: all 66 commands across 9 subtopics sourced from live --agent output
- [Phase 19]: webinar room connect api_endpoint is GET /live/webinar/connect (different prefix from /live/*) — documented in Terminology Notes
- [Phase 19]: SKILL-02 Gate 2 satisfied: pnpm --filter twentythree-skills test exits 0 with all 22 reference files present
- [Phase 19]: Workflow commands sourced verbatim from reference files (webinar section add not create) — ensures accuracy matches live CLI
- [Phase 19]: Workflow files cross-reference reference files for flag detail — workflow shows minimum viable command; reference shows exhaustive options
- [Phase 20]: Codex project path uses .agents/ (not .codex/) per D-05 — deliberate, matches locked decision
- [Phase 20]: bin/add.js uses walkDir + cpSync with node: prefix built-ins only — zero external dependencies per D-06
- [v1.4 roadmap]: Tag strategy — `skills-v*` prefix for skills-only releases; existing `v*` job guarded with `!startsWith(github.ref, 'refs/tags/skills-v')` to prevent double-publish
- [v1.4 roadmap]: Use `pnpm publish --no-git-checks --provenance` for skills — matches existing CLI publish pattern; provenance adds Sigstore attestation at zero cost
- [v1.4 roadmap]: NPM_TOKEN scope must be verified with dry-run before first real publish — Granular Access Tokens may be scoped to twentythree-cli only
- [v1.4 roadmap]: Bare `npx twentythree-skills` invocation (no subcommand) should work — `add` argument is currently a no-op; simplify or add explicit argv routing before publish
- [v1.4 roadmap]: Phase 22 (SKILL.md hyperlinks) is independent of Phase 21 but should land in same 1.0.0 publish for clean release
- [Phase 21-skills-npm-publish]: publishConfig.access: public added to skills package.json — required for npm public registry publish without explicit flag
- [Phase 21-skills-npm-publish]: skills-v* tag prefix for skills releases — keeps CLI and skills publish trains independent with if: guards
- [Phase 21-skills-npm-publish]: Dry-run step uses npm publish --dry-run (not pnpm) — more reliable for verifying NPM_TOKEN scope before real publish
- [Phase 21-skills-npm-publish]: NPM_TOKEN scope verified by user dry-run before skills-v1.0.0 tag push
- [v1.5 roadmap]: guide.md lives at skills/ root (not reference/ or workflows/) — bin/add.js walkDir picks it up automatically; same level as SKILL.md
- [v1.5 roadmap]: Flag names (--include-analytics, open_p) must be verified via live --agent output before writing guide.md — user-stated names are medium confidence only
- [v1.5 roadmap]: SKILL.md Behavioral Guide section must appear before Resource Index table — agents stop reading at the table; link placed after line ~130 would be consistently skipped
- [v1.5 roadmap]: Inline reference file notes use > **Note:** blockquote format, forward-reference guide.md rather than restate rules — single source of truth in guide.md
- [v1.5 roadmap]: npm pack --dry-run file count assertion updates from 28 to 29 when guide.md is added (INT-01)
- [Phase 23-behavioral-guide-authoring]: open_p has no direct CLI flag on webinar create; CR-3 references verified --draft/--publish flags and instructs agents to run --agent
- [Phase 23-behavioral-guide-authoring]: SKILL.md Behavioral Guide section placed before Resource Index — agents scan top-to-bottom and would miss a link placed after the command table
- [Phase 23-behavioral-guide-authoring]: Inline reference file notes use forward-reference pattern only — guide.md is single source of truth; no verbatim rule repetition in reference files
- [Phase 24-integration-ci-validation]: Gate 3 reads npm pack stderr (not stdout) for "total files:" line — npm pack outputs to stderr
- [Phase 24-integration-ci-validation]: Gate 3 checks packResult.status !== 0 to surface npm crash details; packResult.error only covers spawn failures, not non-zero exits

### Pending Todos

None — v1.5 milestone complete.

### Blockers/Concerns

- NPM_TOKEN scope: verify with `npm publish --dry-run` from `packages/twentythree-skills` before pushing first `skills-v1.1.0` tag (v1.5 adds guide.md, warrants a skills patch/minor release)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260508-dhl | Add auth switch command to re-select active workspace | 2026-05-08 | 0b5b2c4 | [260508-dhl-add-auth-switch-command-to-re-select-act](./quick/260508-dhl-add-auth-switch-command-to-re-select-act/) |
| 260508-dnq | Release v1.3.3: docs, skill update, version bump, and tags | 2026-05-08 | 7d682c2 | [260508-dnq-release-v1-3-3-docs-skill-update-version](./quick/260508-dnq-release-v1-3-3-docs-skill-update-version/) |
| 260513-aab | Add seo get/status/update commands, update SKILL.md, release v1.3.4 | 2026-05-13 | 1038e93 | [260513-aab-api-spec-update-seo-commands-release-v1-3-4](./quick/260513-aab-api-spec-update-seo-commands-release-v1-3-4/) |
| 260513-a06 | Review command documentation and make sure commands listed in the root README reflect available commands | 2026-05-13 | — | [260513-a06-readme-commands-sync](./quick/260513-a06-readme-commands-sync/) |

## Session Continuity

Last session: 2026-05-01T06:55:42.854Z
Stopped at: context exhaustion at 78% (2026-05-01)
Resume file: None
