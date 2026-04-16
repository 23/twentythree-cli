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
- **Auth model**: Simple bearer token via `Authorization: Bearer <token>` request header — no OAuth signing required. `/api/2/user/tokens?cross_sites_p=1` returns cross-site workspace tokens. Interactive login (not OAuth 1.0a) is a later milestone. Bearer token is optional — domain-only mode enables anonymous endpoint access.
- **API auth scopes** (from swagger `security` fields):
  - `anonymous` (11 endpoints): no token needed — domain only. Includes: `album/list`, `tag list/related`, `site/search`, `player/embed`, `poll list/answer`, `user list/get`, `live/section/list`, `webhook/events`
  - `none` (44 endpoints): token required, no specific scope level
  - `read` (75 endpoints): token with read access
  - `write` (84 endpoints): token with write access
  - `admin` (19 endpoints): token with admin access
  - `super` (2 endpoints): super-admin (`session/get-token`, `user/get-login-token`)
- **API reference authority**: Only the OpenAPI/swagger spec at `video.twentythree.com/apidocs/swagger.json` is authoritative. Disregard other TwentyThree endpoint documentation.
- **Multi-workspace**: Users may belong to multiple TwentyThree sites (workspaces); the CLI must support switching between them
- **Reference implementation**: `github.com/basecamp/basecamp-cli` — similar scope, command structure, and AI skills pattern
- **AI skills reference**: `github.com/basecamp/skills` — installable skill packages that wrap CLI commands for AI agents
- **Terminology mapping**: API uses legacy object names — `photo` → `video`, `album` → `category`, `live` → `webinar`. All CLI commands and output use the modern terms; mapping happens transparently at the API call layer
- **URL normalization**: API responses mix absolute URLs (e.g. `https://video.company.com/webinar-page`) and relative paths (e.g. `/webinar-page`). All formatted CLI output must resolve relative URLs to full URLs using the active workspace domain before display. Applies to all URL fields including page links, thumbnail URLs, and poster images.
- **Thumbnail URL structure**: Thumbnails follow the pattern `https://domain/<tree_id>/<photo_id>/<token>/<width>x<height><crop>:<time>/thumbnail.png`. Crop methods: `cr` (centered crop, default), `st` (stretch), `mtw` (white letterbox), `mtb` (black letterbox). Time parameter (`:N` seconds) selects a specific frame. Pre-defined sizes available on video objects: `small_download`, `standard_download`, `medium_download`. The CLI outputs these URLs as-is after normalization — dimension/crop manipulation is not a CLI concern.

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
| CLI uses modern terminology | API uses legacy names (`photo`, `album`, `live`); CLI maps these to `video`, `category`, `webinar` — forward-looking UX without breaking the underlying API calls | — Pending |

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
*Last updated: 2026-04-16 — Phase 8 complete: platform-polish — all remaining resource groups implemented (spot, webhook, app, thumbnail, user, presentation, protection, session, site, setting, openupload), doctor health-check command, --agent flag on BaseCommand, agentMetadata backfilled across 219 command files*
