# TwentyThree CLI

## What This Is

A TypeScript/Node.js CLI (`twentythree`) for the TwentyThree video platform API, installable globally via npm. It gives users terminal access to all 235 TwentyThree API endpoints across 22 resource groups, handles multi-workspace authentication with automatic token refresh, and includes machine-readable `--agent` metadata on every command for AI agent consumption.

## Core Value

A developer can authenticate, select a workspace, and call any TwentyThree API endpoint from the terminal in under a minute.

## Current Milestone: v1.1 Repository Polish & Release

**Goal:** Make the CLI publishable, fully documented, and verified to have complete endpoint coverage before going public on npm.

**Target features:**
- Endpoint audit — compare OpenAPI spec against command files; fill any gaps found
- npm publish — get package live on npm (first publish)
- Install verification — test end-to-end `npm install -g` flow and document it
- README.md — install + quickstart entry point, links into docs/
- docs/ reference — full command reference, API spec upgrade guide, contributing / dev setup

## Requirements

### Validated

- ✓ CLI installable globally via `npm install -g twentythree-cli` and runnable as `twentythree` — v1.0
- ✓ `twentythree auth credentials` — prompts for domain + bearer token, stores credentials in OS keychain — v1.0
- ✓ On credential entry, calls `/api/2/user/tokens?cross_sites_p=1` to discover all available workspaces — v1.0
- ✓ User prompted to select which workspaces to activate and set a default workspace — v1.0
- ✓ Automatic token refresh while CLI is running to prevent expiry (with file lock for concurrency) — v1.0
- ✓ Commands scoped to the active workspace; user can switch workspace or override default — v1.0
- ✓ Full API coverage — 235 endpoints across 22 resource groups, hand-authored commands using generated OpenAPI types — v1.0

### Active

- ✓ Endpoint audit — compare OpenAPI spec against all command files; fill any gaps found — Validated in Phase 9: Endpoint Coverage Audit. Audit script exits 0 (Gaps: 0, Phantoms: 0), 18 analytics sub-series commands added.
- [ ] npm publish — get `twentythree-cli` package live on npm (first publish)
- [ ] Install verification — test `npm install -g twentythree-cli` end-to-end and document
- [ ] README.md — install + quickstart entry point at repo root, links into docs/
- [ ] docs/ — full command reference, API spec upgrade guide, contributing / dev setup

### Deferred (post-v1.1)

- [ ] AI skills package — installable agent skills wrapping the CLI (e.g., `npx skills add twentythree/skills`), published alongside the CLI
- [ ] `twentythree auth login --scope read|write|admin` — browser-based OAuth flow

### Out of Scope

- Browser OAuth (`twentythree auth login`) — deferred to a later milestone; credential-based auth ships first
- GUI / web dashboard — this is a terminal tool only
- Non-Node.js distribution (Homebrew, standalone binary) — npm global install is sufficient for v1
- Code-generated commands — mechanical generation produces bad UX; commands are hand-authored against generated types
- `resumable-upload-command` dependency — upload logic implemented natively; reference repo is unsupported example code

## Context

- **Shipped:** v1.0 MVP on 2026-04-16. ~61,000 TypeScript LOC, 219 command files, 9 phases, 41 plans, 225 commits over 3 days.
- **Tech stack:** oclif v4, tsdown (CJS), openapi-typescript, openapi-fetch, @napi-rs/keyring, conf, @clack/prompts, chalk 4, ora 5, cli-table3, vitest
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
| AI skills as separate package | Follows Basecamp pattern; skills published alongside CLI releases | — Pending (v2) |
| CLI uses modern terminology | API uses legacy names; CLI maps to `video`, `category`, `webinar` — forward-looking UX | ✓ Good — term-map.ts works transparently |
| tsdown (not tsup) | tsup officially abandoned; tsdown is the Rolldown-powered maintained successor | ✓ Good — CJS build works cleanly |
| CJS module type | Required for oclif v4 and chalk 4.x / ora 5.x CJS-only pins | ✓ Good — no ESM interop issues |
| Chunked upload native | No dependency on `resumable-upload-command` (unsupported example code) | ✓ Good — clean resumable.js protocol implementation |
| Hand-authored commands | Code generation produces bad UX and breaks term mapping | ✓ Good — consistent UX across all 219 commands |
| @napi-rs/keyring | Keytar archived Dec 2022; keyring is the actively maintained Rust-backed replacement | ✓ Good — OS keychain integration works on macOS |
| Local OpenAPI spec | Store spec locally, update via script; Claude can diff + fix types | ✓ Good — `pnpm update-api-spec` workflow in CLAUDE.md |
| delayFn injectable in chunk-pool | Deterministic test timing without real setTimeout delays | ✓ Good — test suite runs fast |
| doctor extends Command not BaseCommand | Doctor must work even when no workspace is configured | ✓ Good — avoids hard error at startup |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-16 — Phase 11 complete (documentation; 157 oclif-generated command docs, getting-started guide, api-spec-upgrade contributor guide)*
