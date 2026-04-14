# Feature Landscape

**Domain:** API CLI for a video platform (TwentyThree)
**Researched:** 2026-04-14

---

## TwentyThree API Surface Area

The swagger.json at `video.twentythree.com/apidocs/swagger.json` exposes only a small portion of the full API (action and collector resources). The complete API surface is documented at `twentythree.com/api` and covers significantly more. Based on official docs and cross-referencing against library source code (node-23video, visualplatform.js), the known API resources are:

### Resource Groups (CLI terminology → API terminology)

| CLI Command Group | API Path Prefix | Key Operations |
|-------------------|-----------------|----------------|
| `video` | `/photo` | list, upload, update, delete, get |
| `video attachment` | `/photo/attachment` | list, upload |
| `video chapter` | `/photo/section` | create, delete, list, set-thumbnail |
| `video coordinate` | `/photo/coordinate` | add, delete |
| `video edit` | `/photo/edit` | get-trimming, set-trimming |
| `video subtitle` | `/photo/subtitle` | upload, remove, list, data |
| `category` | `/album` | list, create, update, delete |
| `webinar` | `/live` | create, list, update, delete, upload-image |
| `player` | `/player` | list, settings |
| `action` (CTA) | `/action` | add, update, delete, get, types, include, exclude, upload |
| `collector` | `/collector` | list, include, exclude |
| `site` | `/site` | search |
| `user` | `/user` | list, tokens |
| `protection` | `/protection` | protect, unprotect, verify |

**Note on swagger.json:** The spec served at `video.twentythree.com/apidocs/swagger.json` currently only defines `/action/*` and `/collector/*` paths — it appears to be a partial or staged spec. Full API coverage must be built from the official docs at `twentythree.com/api` and not assumed to be derivable from the swagger alone.
Confidence: MEDIUM — confirmed from official docs and library cross-reference, but complete endpoint list not exhaustively enumerated.

### Authentication

The API uses **OAuth 1.0a** (Consumer Key, Consumer Secret, Access Token, Access Token Secret). The CLI maps this to a domain + bearer token credential model with workspace discovery via `/api/2/user/tokens?cross_sites_p=1`. The swagger spec lists `read` and `write` permission levels across endpoints.

---

## Table Stakes

Features users expect from any production API CLI. Missing any of these makes the tool feel incomplete or unshippable.

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Credential storage** — `twentythree auth credentials` prompting for domain + token, stored in `~/.config/twentythree/` | Every API CLI must auth; local credential file is universal pattern | Low | None |
| **Multi-workspace support** — discover workspaces via `/api/2/user/tokens`, prompt to activate, store per-workspace tokens | TwentyThree users belong to multiple sites; a single-workspace CLI is a non-starter for most | Medium | Credential storage |
| **Default workspace with override** — all commands scoped to active workspace; `--workspace` flag or `twentythree workspace switch` | Without this, every command requires boilerplate context-setting | Medium | Multi-workspace support |
| **Video CRUD** — `twentythree video list`, `video get <id>`, `video update <id>`, `video delete <id>` | The primary resource; a video platform CLI without video management is useless | Low-Med | Auth |
| **Video upload** — `twentythree video upload <file>` | Most common write operation; table stakes for any media platform CLI | Medium | Auth (write scope) |
| **Category CRUD** — `twentythree category list/create/update/delete` | Organizational structure; needed to put videos anywhere meaningful | Low | Auth |
| **Webinar CRUD** — `twentythree webinar list/create/update/delete` | Second major content type on the platform | Low | Auth |
| **JSON output mode** — `--json` flag on every command | Required for scripting, piping, and agent consumption; human-readable by default, JSON when piped | Low | All commands |
| **Help system** — `--help` on every command with meaningful descriptions | Universal expectation; users won't tolerate a CLI that requires reading external docs for every call | Low | All commands |
| **Error messages with context** — non-zero exit codes, structured error output, human-readable failure reasons | Without this, debugging is impossible; scripting becomes fragile | Low | All commands |
| **`twentythree doctor`** — validates credentials, connectivity, and workspace config | Basecamp pattern; saves enormous support overhead when setup breaks | Low | Auth, workspace |

## Differentiators

Features that set the tool apart. Not expected by users, but valuable once discovered.

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **AI skills package** — `npx skills add twentythree/skills`, installable agent skills wrapping the CLI | Follows Basecamp pattern; lets AI agents (Claude, Copilot, Gemini) operate TwentyThree directly; significant distribution multiplier | Medium | CLI must be stable first; all commands need `--json` |
| **`--json` envelope with breadcrumbs** — structured output including `ok`, `data`, `summary`, `breadcrumbs` (next suggested commands) | Transforms the CLI into an agent-navigable tool; breadcrumbs enable chained operations without memorizing command syntax | Medium | JSON output mode |
| **`--help --agent` mode** — structured JSON describing flags, gotchas, and subcommands for machine-readable discovery | Enables AI agents to self-discover the CLI's capabilities; Basecamp pattern validated in production | Low | Help system |
| **Shell completions** — Bash, Zsh, fish | Dramatically improves daily-driver UX; tab-completing video IDs or category names feels like a superpower | Medium | Requires listing endpoints to generate completions |
| **Pagination handled transparently** — `--all` flag auto-paginates list commands; default shows first page with `--page` / `--per-page` | TwentyThree list APIs are paginated; forcing users to manage offset/limit is poor UX | Low-Med | All list commands |
| **Interactive selection prompts** — when `--id` is omitted, present a fuzzy-searchable list of resources | Removes the friction of copying IDs from the web UI; especially valuable for `video upload --category` | Medium | List commands, requires a prompt library (e.g., `@inquirer/prompts`) |
| **Terminology mapping as a design feature** — document that `video` maps to `photo`, `category` to `album`, `webinar` to `live` | Users coming from the web UI use modern terms; CLI that uses legacy terms (`photo list`) would feel broken | Low (mapping layer) | Core architecture decision |
| **Token auto-refresh** — background token refresh prevents mid-session expiry | Silent credential expiry is a frustrating failure mode; prevents surprise 401s during long operations | Medium | Auth layer, requires refresh token or re-auth flow understanding |
| **Output format selector** — `--format table|json|csv|jsonl` | Power users pipe CSV to spreadsheets, `jsonl` streams cleanly into `grep`/`jq`; table for terminal, json for pipes | Medium | Output layer |
| **`twentythree video chapters list <id>`** / subtitle management | Deep video content management; differentiates from a simple CRUD wrapper | Low (once video command exists) | Video CRUD |

## Anti-Features

Things to explicitly NOT build in v1. Each adds complexity or maintenance burden that outweighs its value at this stage.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Browser OAuth flow** (`twentythree auth login`) | Adds a callback server, browser launch, PKCE flow, and token exchange — significant complexity for marginal UX gain in v1 | Ship credential auth first; defer OAuth to milestone 2 as the PROJECT.md already specifies |
| **Config sync / remote config storage** | Storing credentials anywhere other than local `~/.config/` adds a backend dependency and security surface | Local credential file is sufficient; let users manage their own credential portability |
| **Interactive TUI (ncurses-style)** | Terminal UI frameworks (Ink, Blessed) add significant bundle size, rendering complexity, and break piping/scripting | Use targeted `@inquirer/prompts` for one-off selection prompts; keep the core CLI output-oriented |
| **Webhook / event subscription management** | TwentyThree has JSON Data Push webhooks; managing these from a CLI adds considerable complexity without clear v1 demand | Expose raw API call if needed; do not build dedicated `webhook` command group in v1 |
| **Video transcoding or processing commands** | The platform handles transcoding; wrapping this adds complexity with no leverage | `video upload` covers the upload side; transcoding status can be read via `video get` |
| **Built-in analytics dashboards** | The API has analytics data but rendering meaningful analytics in a terminal requires chart libraries and complex data aggregation | Expose `--json` output of analytics fields; let users pipe to `jq`, Grafana, or spreadsheets |
| **Plugin system** | A plugin architecture before the core API is stable adds interface-design overhead and versioning complexity | Build a stable core first; if extensibility is needed, the AI skills package pattern handles the most important case |
| **Standalone binary distribution** (Homebrew, pkg, .exe) | Multi-distribution maintenance is significant; npm global install covers the developer audience for v1 | npm only per PROJECT.md decision |
| **GUI or web dashboard** | Out of scope by definition | Explicitly excluded in PROJECT.md |
| **`--dry-run` on destructive operations** | Nice-to-have but adds branching logic to every mutating command; low ROI in v1 | Clear confirmation prompts on delete are sufficient |

---

## Feature Dependencies

```
Credential storage
  └── Multi-workspace discovery
        └── Default workspace / workspace switch
              └── All resource commands (video, category, webinar, ...)
                    ├── JSON output mode
                    │     └── AI skills package
                    │     └── Breadcrumb envelope
                    ├── List commands
                    │     ├── Pagination handling
                    │     └── Interactive selection prompts
                    ├── Video upload
                    └── Help system
                          └── --help --agent mode
```

Key: **Auth must be solid before any resource commands ship.** Multi-workspace support must exist before resource commands are useful, because a workspace-less video list is ambiguous. JSON output is a prerequisite for the AI skills package.

---

## MVP Recommendation

The v1 MVP should include all Table Stakes features plus the two highest-leverage differentiators:

**Must ship in v1:**
1. Credential storage (`auth credentials`)
2. Multi-workspace discovery + default workspace
3. Video CRUD + upload
4. Category CRUD
5. Webinar CRUD
6. `--json` output on all commands
7. Decent `--help` on all commands
8. `doctor` command
9. Pagination handling (transparent, not forced manual)

**Ship with v1 if complexity is low:**
10. `--json` envelope with breadcrumbs (low incremental cost once JSON output exists)
11. `--help --agent` mode (low complexity, high AI agent value)
12. Terminology mapping (architectural — must be in from the start, not added later)

**Defer to v2:**
- AI skills package (depends on CLI stability; publish after v1 is solid)
- Shell completions (valuable but not blocking)
- Interactive selection prompts (nice UX but not blocking)
- Output format selector (`--format csv/jsonl`) — `--json` covers scripting for v1
- Browser OAuth flow (explicitly deferred per PROJECT.md)
- `video chapters`, subtitle management (niche, not blocking)

---

## Sources

- TwentyThree API overview: https://www.twentythree.com/api/overview
- TwentyThree API terminology: https://www.twentythree.com/api-terminology
- TwentyThree album/list endpoint: https://www.twentythree.com/api/album-list
- TwentyThree live/create endpoint: https://www.twentythree.com/api/live-create
- TwentyThree photo/section/delete: https://www.twentythree.com/api/photo-section-delete
- TwentyThree swagger spec (partial): https://video.twentythree.com/apidocs/swagger.json
- node-23video reference library: https://github.com/23/node-23video
- visualplatform.js reference library: https://github.com/23/visualplatform.js/
- Basecamp CLI (reference implementation): https://github.com/basecamp/basecamp-cli
- Basecamp CLI skills file: https://github.com/basecamp/basecamp-cli/blob/main/skills/basecamp/SKILL.md
- Basecamp CLI style guide: https://github.com/basecamp/basecamp-cli/blob/main/STYLE.md
- CLI UX patterns (2025): https://medium.com/@kaushalsinh73/top-8-cli-ux-patterns-users-will-brag-about-4427adb548b7
- Stainless CLI generator patterns: https://www.stainless.com/blog/stainless-cli-generator-your-api-now-with---help
