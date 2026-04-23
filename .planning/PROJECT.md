# TwentyThree CLI

## What This Is

A TypeScript/Node.js CLI (`twentythree`) for the TwentyThree video platform API, installable globally via npm. It gives users terminal access to all 235 TwentyThree API endpoints across 22 resource groups, handles multi-workspace authentication with automatic token refresh, includes machine-readable `--agent` metadata on every command for AI agent consumption, and ships alongside `twentythree-skills` — an installable AI agent skills package for Claude Code, Codex, Copilot, and Cursor.

## Core Value

A developer can authenticate, select a workspace, and call any TwentyThree API endpoint from the terminal in under a minute.

## Current Milestone: v1.5 Agent Behavioral Guidelines

**Goal:** Add behavioral and usage guidance to the `twentythree-skills` package so AI agents make better API decisions without needing to be prompted.

**Target features:**
- New `skills/guide.md` with cross-cutting behavioral rules (object type differentiation, thumbnail strategy, analytics inclusion, filtering/sorting patterns, webinar defaults, timezone handling, admin link construction)
- Inline reinforcement notes in `video.md`, `webinar.md`, and other reference files where the rules apply
- `skills/SKILL.md` updated to reference the new guide

## Previous State: v1.4 Shipped

v1.4 shipped 2026-04-20. `twentythree-skills` published to npm: `skills-v*` tag pipeline, `publishConfig.access: "public"`, dry-run CI gate, bare `npx twentythree-skills` invocation, and SKILL.md hyperlinks for all 22 reference files.

## Requirements

### Validated

- ✓ CLI installable globally via `npm install -g twentythree-cli` and runnable as `twentythree` — v1.0
- ✓ `twentythree auth credentials` — prompts for domain + bearer token, stores credentials in OS keychain — v1.0
- ✓ On credential entry, calls `/api/2/user/tokens?cross_sites_p=1` to discover all available workspaces — v1.0
- ✓ User prompted to select which workspaces to activate and set a default workspace — v1.0
- ✓ Automatic token refresh while CLI is running to prevent expiry (with file lock for concurrency) — v1.0
- ✓ Commands scoped to the active workspace; user can switch workspace or override default — v1.0
- ✓ Full API coverage — 235 endpoints across 22 resource groups, hand-authored commands using generated OpenAPI types — v1.0
- ✓ Bug audit & fix — `parseBoolParam is not defined` on `video list` fixed; 15 TypeScript errors swept and resolved; `twentythree-cli@1.0.1` published to npm — Validated in Phase 14
- ✓ Prompt on missing required flags — `BaseCommand.catch()` intercepts `FailedFlagValidationError` in TTY mode; prompts sequentially via `@clack/prompts`; re-dispatches with collected argv; non-TTY gets original oclif error unchanged — Validated in Phase 16
- ✓ Tab completion — `@oclif/plugin-autocomplete` wired for bash/zsh; guided setup via `twentythree autocomplete`; `twentythree video <TAB>` lists subcommands, `--<TAB>` lists flags — Validated in Phase 15 — v1.2
- ✓ TypeScript build clean — zero `tsc --noEmit` errors via `@types/node` + DOM lib; autocomplete extends `BaseCommand` for full PROMPT-01 coverage — Validated in Phase 17 — v1.2
- ✓ `twentythree-skills` package — `packages/twentythree-skills` published as standalone ESM npm package; 22 reference files + 2 workflow files + `npx twentythree-skills add` runtime installer for Claude Code, Codex, Copilot, Cursor — v1.3
- ✓ `twentythree-skills` published to npm — `skills-v*` tag pipeline, `publishConfig.access: "public"`, dry-run CI gate, bare `npx twentythree-skills` invocation, SKILL.md hyperlinks for all 22 reference files — v1.4

### Active (v1.5)

- [ ] **GUIDE-01**: New `skills/guide.md` with cross-cutting behavioral rules — object type differentiation, thumbnail strategy, analytics inclusion, filtering/sorting patterns, webinar creation defaults, timezone handling, admin link construction
- [ ] **GUIDE-02**: Inline behavioral notes added to `video.md`, `webinar.md`, and other reference files where rules apply at point of usage
- [ ] **GUIDE-03**: `skills/SKILL.md` updated to reference `guide.md` so agents discover it

### Deferred (post-v1.3)

- [ ] `twentythree auth login --scope read|write|admin` — browser-based OAuth flow
- [ ] Additional workflow files — expand as high-value agent automation patterns emerge from usage

### Out of Scope

- Browser OAuth (`twentythree auth login`) — deferred to a later milestone; credential-based auth ships first
- GUI / web dashboard — this is a terminal tool only
- Non-Node.js distribution (Homebrew, standalone binary) — npm global install is sufficient for v1
- Code-generated commands — mechanical generation produces bad UX; commands are hand-authored against generated types
- `resumable-upload-command` dependency — upload logic implemented natively; reference repo is unsupported example code
- Claude.ai programmatic install — no public API; browser ZIP upload only
- Runtime-specific format conversion (JSON schemas for OpenAI Assistants API) — all target runtimes use the universal SKILL.md format

## Context

- **Shipped:** v1.3 on 2026-04-20. v1.0 MVP shipped 2026-04-16 (~61,000 TS LOC, 219 commands); v1.1 published to npm as 1.0.0 on 2026-04-17; v1.2 burnin fixes published as 1.0.2 on 2026-04-17; v1.3 skills package complete 2026-04-20 (not yet published to npm).
- **Tech stack:** oclif v4, tsdown (CJS), openapi-typescript, openapi-fetch, @napi-rs/keyring, conf, @clack/prompts, chalk 4, ora 5, cli-table3, vitest; `twentythree-skills` is ESM-only, no build step, Node built-ins only
- **API reference**: OpenAPI spec stored locally at `packages/twentythree-cli/specs/twentythree-api-swagger.json`; regenerate types with `pnpm update-api-spec`
- **Auth model**: Bearer token via `Authorization: Bearer <token>`. Domain-only mode enables anonymous endpoint access. `/api/2/user/tokens?cross_sites_p=1` returns cross-site workspace tokens.
- **API auth scopes** (from swagger `security` fields):
  - `anonymous` (11 endpoints): no token needed
  - `none` (44 endpoints): token required, no specific scope
  - `read` (75 endpoints): read access
  - `write` (84 endpoints): write access
  - `admin` (19 endpoints): admin access
  - `super` (2 endpoints): super-admin
- **Multi-workspace**: Users may belong to multiple TwentyThree sites; CLI supports switching between them
- **Terminology mapping**: API uses legacy object names — `photo`→`video`, `album`→`category`, `live`→`webinar`. All CLI commands and output use modern terms; mapping happens transparently via `term-map.ts`
- **URL normalization**: API responses mix absolute and relative URLs. All formatted output resolves relative URLs to full URLs using the active workspace domain.
- **Chunked upload**: Shared engine in `src/upload/` used by video, webinar attachment, action, and open upload commands. 100MB chunks, 5-way parallelism, resume-on-failure.
- **Agent support**: All 219 command files declare `static agentMetadata`; `--agent` flag on any command outputs machine-readable metadata for AI agent consumption.
- **Skills package**: `packages/twentythree-skills` — ESM, no build, Node 22+, no external deps. 25 files: `skills/SKILL.md` + `skills/reference/*.md` (22 files) + `skills/workflows/*.md` (2 files). Installer at `bin/add.js` detects 4 runtimes via dir presence.

## Constraints

- **Tech Stack**: TypeScript + Node.js — no other runtimes; keeps the ecosystem consistent and npm distribution natural
- **Distribution**: npm global install only for v1 — simplest path to ship
- **Auth**: Credential-based (domain + bearer token) for v1 — browser OAuth is a subsequent milestone
- **API**: Must support all endpoints in the OpenAPI spec as the long-term target — architecture must not artificially limit coverage

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TypeScript + Node.js | Natural fit for npm distribution; rich CLI tooling ecosystem | ✓ Good — tsdown+oclif pipeline worked well |
| Credential auth before OAuth | Simpler to ship; OAuth adds browser flow complexity | ✓ Good — shipped in 3 days |
| npm global install only | Sufficient for developer users; avoids multi-distribution maintenance | ✓ Good — no issues |
| CLI uses modern terminology | API uses legacy names; CLI maps to `video`, `category`, `webinar` — forward-looking UX | ✓ Good — term-map.ts works transparently |
| tsdown (not tsup) | tsup officially abandoned; tsdown is the Rolldown-powered maintained successor | ✓ Good — CJS build works cleanly |
| CJS module type | Required for oclif v4 and chalk 4.x / ora 5.x CJS-only pins | ✓ Good — no ESM interop issues |
| Chunked upload native | No dependency on `resumable-upload-command` (unsupported example code) | ✓ Good — clean resumable.js protocol implementation |
| Hand-authored commands | Code generation produces bad UX and breaks term mapping | ✓ Good — consistent UX across all 219 commands |
| @napi-rs/keyring | Keytar archived Dec 2022; keyring is the actively maintained Rust-backed replacement | ✓ Good — OS keychain integration works on macOS |
| Local OpenAPI spec | Store spec locally, update via script; Claude can diff + fix types | ✓ Good — `pnpm update-api-spec` workflow in CLAUDE.md |
| delayFn injectable in chunk-pool | Deterministic test timing without real setTimeout delays | ✓ Good — test suite runs fast |
| doctor extends Command not BaseCommand | Doctor must work even when no workspace is configured | ✓ Good — avoids hard error at startup |
| twentythree-skills as separate ESM package | Static markdown + tiny ESM installer; no CJS, no build step, no external deps | ✓ Good — `npx twentythree-skills add` works standalone |
| Hand-authored skill content over generation | Live `--agent` output is authoritative; generation would drift from real flag names | ✓ Good — all 22 reference files sourced from live CLI output |
| Directory-based runtime detection | No runtime-specific APIs needed; dir presence is stable and cross-platform | ✓ Good — works for Claude Code, Codex, Copilot, Cursor |
| Skills install to namespaced subdirectory | `skills/twentythree/` avoids collisions with other skill packages | ✓ Good — clean namespace, idempotent re-runs safe |
| All flag data from live --agent output | Research docs and training data can be stale; live output is always correct | ✓ Good — caught user delete non-existence and other gaps |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-23 — v1.5 started (agent behavioral guidelines for twentythree-skills)*
