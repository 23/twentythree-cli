# Milestones

## v1.2 Burnin & Quality of Life (Shipped: 2026-04-20)

**Phases completed:** 4 phases (14–17), 6 plans
**Timeline:** 2026-04-17 → 2026-04-20 (3 days)
**Commits:** 69

**Key accomplishments:**

- Fixed `parseBoolParam is not defined` crash on `video list`; audited all 219 commands for the same pattern, fixing all 15 occurrences; published as npm@1.0.1
- Wired `@oclif/plugin-autocomplete` for bash/zsh tab completion with guided `@clack/prompts` setup wizard; published as npm@1.0.2
- Implemented `BaseCommand.catch()` to intercept missing required flags and replace raw oclif errors with interactive `@clack/prompts` prompts
- TypeScript build zeroed to zero errors (`@types/node` + DOM lib); autocomplete command wired into `BaseCommand` inheritance for full PROMPT-01 coverage

**Archive:** `.planning/milestones/v1.2-ROADMAP.md`, `.planning/milestones/v1.2-REQUIREMENTS.md`

---

## v1.0 MVP (Shipped: 2026-04-16)

**Phases completed:** 9 phases (1–8 + 6.1), 41 plans
**Timeline:** 2026-04-14 → 2026-04-16 (3 days)
**LOC:** ~61,000 TypeScript across 439 files, 225 commits

**Key accomplishments:**

- pnpm monorepo scaffold with oclif v4, tsdown CJS build, Node 22 guard, turborepo v2 pipeline — installable as global npm package
- OpenAPI types generated from live spec (35,862 lines) and bidirectional terminology translator (`photo`→`video`, `album`→`category`, `live`→`webinar`) with 19 passing tests
- Credential-based auth + multi-workspace management with OS keychain storage (`@napi-rs/keyring`) and proactive token refresh with file locking
- Native resumable chunked upload engine — 100MB chunks, 5-way parallelism, resume-on-failure, progress bar; shared by video, webinar attachment, action, and open upload commands
- 235 API endpoints covered across 22 resource groups: video, category, webinar (40+ subcommands), analytics, audience, action, collector, comment, player, poll, tag, spot, thumbnail, webhook, app, presentation, protection, session, openupload, site, setting, user
- `twentythree doctor` health check command; `--agent` flag with `agentMetadata` on all 219 command files for AI agent consumption
- Local OpenAPI spec storage with shell update script and Claude-aided API change workflow documented in CLAUDE.md

**Archive:** `.planning/milestones/v1.0-ROADMAP.md`, `.planning/milestones/v1.0-REQUIREMENTS.md`

---
