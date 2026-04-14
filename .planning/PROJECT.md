# TwentyThree CLI

## What This Is

A TypeScript/Node.js CLI (`twentythree`) for the TwentyThree video platform API, installable globally via npm. It gives users terminal access to every TwentyThree API endpoint, handles multi-workspace authentication with automatic token refresh, and ships alongside an installable AI agent skills package — modeled after the Basecamp CLI.

## Core Value

A developer can authenticate, select a workspace, and call any TwentyThree API endpoint from the terminal in under a minute.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] CLI installable globally via `npm install -g twentythree-cli` and runnable as `twentythree`
- [ ] `twentythree auth credentials` — prompts for domain + bearer token, stores credentials locally
- [ ] On credential entry, calls `/api/2/user/tokens?cross_sites_p=1` to discover all available workspaces
- [ ] User prompted to select which workspaces to activate and set a default workspace
- [ ] Automatic token refresh while CLI is running to prevent expiry
- [ ] Commands scoped to the active workspace; user can switch workspace or override default
- [ ] Full API coverage — commands generated/scaffolded from OpenAPI spec (`video.twentythree.com/apidocs/swagger.json`)
- [ ] `twentythree auth login --scope read|write|admin` — browser-based OAuth flow (future milestone)
- [ ] AI skills package — installable agent skills wrapping the CLI (e.g., `npx skills add twentythree/skills`), published alongside the CLI

### Out of Scope

- Browser OAuth (`twentythree auth login`) — deferred to a later milestone; credential-based auth ships first
- GUI / web dashboard — this is a terminal tool only
- Non-Node.js distribution (Homebrew, standalone binary) — npm global install is sufficient for v1

## Context

- **API reference**: OpenAPI spec at `https://video.twentythree.com/apidocs/swagger.json` — full endpoint coverage is the long-term goal
- **Auth model**: TwentyThree uses bearer tokens scoped per domain; `/api/2/user/tokens?cross_sites_p=1` returns cross-site workspace tokens
- **Multi-workspace**: Users may belong to multiple TwentyThree sites (workspaces); the CLI must support switching between them
- **Reference implementation**: `github.com/basecamp/basecamp-cli` — similar scope, command structure, and AI skills pattern
- **AI skills reference**: `github.com/basecamp/skills` — installable skill packages that wrap CLI commands for AI agents

## Constraints

- **Tech Stack**: TypeScript + Node.js — no other runtimes; keeps the ecosystem consistent and npm distribution natural
- **Distribution**: npm global install only for v1 — simplest path to ship
- **Auth**: Credential-based (domain + bearer token) for v1 — browser OAuth is a subsequent milestone
- **API**: Must support all endpoints in the OpenAPI spec as the long-term target — architecture must not artificially limit coverage

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TypeScript + Node.js | Natural fit for npm distribution; rich CLI tooling ecosystem | — Pending |
| Credential auth before OAuth | Simpler to ship; OAuth adds browser flow complexity | — Pending |
| npm global install only | Sufficient for developer users; avoids multi-distribution maintenance | — Pending |
| AI skills as separate package | Follows Basecamp pattern; skills published alongside CLI releases | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-14 after initialization*
