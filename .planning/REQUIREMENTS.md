# Requirements: TwentyThree CLI

**Defined:** 2026-04-14
**Core Value:** A developer can authenticate, select a workspace, and call any TwentyThree API endpoint from the terminal in under a minute.

## v1 Requirements

Requirements for initial release. Maps to roadmap phases.

### Foundation

- [ ] **FOUND-01**: Project is a pnpm monorepo with two packages: `twentythree-cli` (global binary) and `twentythree-skills` (SKILL.md only)
- [ ] **FOUND-02**: CLI is built with oclif v4, TypeScript, and bundled via tsdown into a single entry point
- [ ] **FOUND-03**: CLI is installable globally via `npm install -g twentythree-cli` and runnable as `twentythree`
- [ ] **FOUND-04**: `engines` field enforces minimum Node.js version; CLI prints a clear error and exits on unsupported versions
- [ ] **FOUND-05**: OpenAPI types are generated from `video.twentythree.com/apidocs/swagger.json` and committed as `api/types.ts`; type generation script re-runs as the spec grows
- [ ] **FOUND-06**: A `term-map.ts` module translates legacy API terms (`photo`→`video`, `album`→`category`, `live`→`webinar`) — applied to all user-visible output including error messages

### Authentication & Workspaces

- [ ] **AUTH-01**: `twentythree auth credentials` prompts for domain and bearer token and stores them securely in the OS keychain via `@napi-rs/keyring`
- [ ] **AUTH-02**: On credential entry, CLI calls `/api/2/user/tokens?cross_sites_p=1` with the bearer token to discover all available workspaces
- [ ] **AUTH-03**: User is prompted to select which workspaces to activate and set a default workspace
- [ ] **AUTH-04**: Active workspace name is printed in every command's output header and all destructive confirmation prompts
- [ ] **AUTH-05**: Token refresh runs proactively before expiry while CLI is active; a file lock prevents race conditions on concurrent invocations
- [ ] **AUTH-06**: `twentythree auth status` shows current credentials, active workspace, and token expiry
- [ ] **AUTH-07**: `twentythree workspace list` lists all available workspaces with the default marked
- [ ] **AUTH-08**: `twentythree workspace use <name>` switches the default workspace
- [ ] **AUTH-09**: Every command accepts a `--workspace <name>` flag to override the active workspace for a single invocation

### Uploads (Chunked & Resumable)

- [ ] **UPL-01**: File uploads use the two-step token flow: POST `/api/2/photo/get-upload-token` to obtain an `upload_token`, then POST chunks to `/api/2/photo/redeem-upload-token`
- [ ] **UPL-02**: Files are split into chunks and uploaded using the resumable.js protocol parameters (`resumableChunkNumber`, `resumableTotalChunks`, `resumableChunkSize`, `resumableTotalSize`, `resumableIdentifier`, `resumableFilename`)
- [ ] **UPL-03**: Default chunk size is 100MB; configurable via `--chunk-size` flag
- [ ] **UPL-04**: Up to 5 chunks are uploaded in parallel by default; configurable via `--concurrency` flag
- [ ] **UPL-05**: Each chunk retries up to 5 times on transient failure before the upload is aborted
- [ ] **UPL-06**: Interrupted uploads can be resumed — the CLI checks which chunks were already accepted before re-uploading
- [ ] **UPL-07**: A progress bar displays bytes uploaded, percentage, and estimated time remaining during upload
- [ ] **UPL-08**: Upload implementation is native to the CLI — no dependency on `resumable-upload-command`

### Video Commands

- [ ] **VID-01**: `twentythree video list` lists videos in the active workspace with pagination
- [ ] **VID-02**: `twentythree video get <id>` retrieves a single video's details
- [ ] **VID-03**: `twentythree video upload <file>` uploads a video file using the chunked upload protocol (UPL-01–UPL-08)
- [ ] **VID-04**: `twentythree video update <id>` updates video metadata
- [ ] **VID-05**: `twentythree video delete <id>` deletes a video with confirmation prompt

### Category Commands

- [ ] **CAT-01**: `twentythree category list` lists categories in the active workspace
- [ ] **CAT-02**: `twentythree category get <id>` retrieves a single category's details
- [ ] **CAT-03**: `twentythree category create` creates a new category
- [ ] **CAT-04**: `twentythree category update <id>` updates category metadata
- [ ] **CAT-05**: `twentythree category delete <id>` deletes a category with confirmation prompt

### Webinar Commands

- [ ] **WEB-01**: `twentythree webinar list` lists webinars in the active workspace
- [ ] **WEB-02**: `twentythree webinar get <id>` retrieves a single webinar's details
- [ ] **WEB-03**: `twentythree webinar create` creates a new webinar
- [ ] **WEB-04**: `twentythree webinar update <id>` updates webinar details
- [ ] **WEB-05**: `twentythree webinar delete <id>` deletes a webinar with confirmation prompt

### Player Commands

- [ ] **PLY-01**: `twentythree player list` lists players in the active workspace
- [ ] **PLY-02**: `twentythree player get <id>` retrieves player configuration
- [ ] **PLY-03**: `twentythree player create` creates a new player
- [ ] **PLY-04**: `twentythree player update <id>` updates player settings
- [ ] **PLY-05**: `twentythree player delete <id>` deletes a player with confirmation prompt

### Action Commands (CTAs)

- [ ] **ACT-01**: `twentythree action list` lists CTAs for a given video/webinar
- [ ] **ACT-02**: `twentythree action get` fetches actions by object or action ID
- [ ] **ACT-03**: `twentythree action types` lists available action type definitions
- [ ] **ACT-04**: `twentythree action add` creates a new CTA with default values
- [ ] **ACT-05**: `twentythree action update <id>` modifies action name, timing, and data fields
- [ ] **ACT-06**: `twentythree action delete <id>` removes a CTA permanently
- [ ] **ACT-07**: `twentythree action include <id>` adds an object to a CTA's scope
- [ ] **ACT-08**: `twentythree action exclude <id>` prevents a CTA from displaying on a specific object
- [ ] **ACT-09**: `twentythree action upload <id>` uploads an image/video file to an action variable

### Collector Commands

- [ ] **COL-01**: `twentythree collector list` lists workspace collectors with optional analytics
- [ ] **COL-02**: `twentythree collector include <id>` attaches a collector to a video or webinar
- [ ] **COL-03**: `twentythree collector exclude <id>` blocks a collector from displaying on a video/webinar

### Site Commands

- [ ] **SITE-01**: `twentythree site get` retrieves site settings for the active workspace
- [ ] **SITE-02**: `twentythree site update` updates site settings

### User Commands

- [ ] **USR-01**: `twentythree user list` lists users in the active workspace
- [ ] **USR-02**: `twentythree user get <id>` retrieves a user's details
- [ ] **USR-03**: `twentythree user tokens` retrieves cross-site tokens for the authenticated user

### Cross-Cutting CLI Quality

- [ ] **CLI-01**: All commands support `--json` flag returning machine-readable output with `ok`, `data`, `summary`, and `breadcrumbs` fields
- [ ] **CLI-02**: All list commands handle API pagination transparently (auto-fetches all pages by default)
- [ ] **CLI-03**: All commands return correct exit codes: `0` success, `1` user error, `2` API/network error
- [ ] **CLI-04**: API errors are mapped through `term-map.ts` before display — no legacy term (`photo`, `album`, `live`) appears in user-visible output
- [ ] **CLI-05**: `twentythree doctor` checks credentials, connectivity, and token validity and prints a structured health report
- [ ] **CLI-06**: `--help --agent` on any command outputs machine-readable command metadata for AI agent consumption

## v2 Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### Browser Auth

- **BAUTH-01**: `twentythree auth login --scope read|write|admin` opens a browser for interactive authentication
- **BAUTH-02**: Auth callback completes in the CLI and stores the resulting token in the keychain

### AI Skills Package

- **SKILL-01**: `twentythree-skills` package contains a hand-authored `SKILL.md` covering all CLI commands with decision trees and quick-reference tables
- **SKILL-02**: Skills package is installable via `npx skills add twentythree/skills`
- **SKILL-03**: Skills package version is pinned to a specific CLI release; versions stay in sync

### Extended API Coverage

- **EXT-01**: Video sub-resource commands (chapters/sections, subtitles, attachments, coordinates, edits)
- **EXT-02**: Protection/access control commands
- **EXT-03**: Additional endpoints added to the OpenAPI spec after v1 ship

### UX Enhancements

- **UX-01**: Shell completions for bash, zsh, and fish
- **UX-02**: Interactive fuzzy ID selection for commands that accept resource IDs
- **UX-03**: `--format csv|jsonl` output options on list commands

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| GUI / web dashboard | Terminal tool only — by design |
| Homebrew / standalone binary | npm global install sufficient; avoids multi-distribution maintenance |
| OAuth 1.0a signing | Auth uses simple bearer token headers; OAuth 1.0a not required by the API |
| Code-generated commands from OpenAPI spec | Mechanical generation produces bad UX and breaks the terminology mapping; commands are hand-authored against generated types |
| Dependency on `resumable-upload-command` | Upload logic is implemented natively; the reference repo is unsupported example code |
| Real-time streaming / webhooks | Out of v1 CLI scope; server-side concerns |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| FOUND-06 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| AUTH-06 | Phase 2 | Pending |
| AUTH-07 | Phase 2 | Pending |
| AUTH-08 | Phase 2 | Pending |
| AUTH-09 | Phase 2 | Pending |
| UPL-01 | Phase 3 | Pending |
| UPL-02 | Phase 3 | Pending |
| UPL-03 | Phase 3 | Pending |
| UPL-04 | Phase 3 | Pending |
| UPL-05 | Phase 3 | Pending |
| UPL-06 | Phase 3 | Pending |
| UPL-07 | Phase 3 | Pending |
| UPL-08 | Phase 3 | Pending |
| VID-01 | Phase 3 | Pending |
| VID-02 | Phase 3 | Pending |
| VID-03 | Phase 3 | Pending |
| VID-04 | Phase 3 | Pending |
| VID-05 | Phase 3 | Pending |
| CAT-01 | Phase 3 | Pending |
| CAT-02 | Phase 3 | Pending |
| CAT-03 | Phase 3 | Pending |
| CAT-04 | Phase 3 | Pending |
| CAT-05 | Phase 3 | Pending |
| WEB-01 | Phase 3 | Pending |
| WEB-02 | Phase 3 | Pending |
| WEB-03 | Phase 3 | Pending |
| WEB-04 | Phase 3 | Pending |
| WEB-05 | Phase 3 | Pending |
| PLY-01 | Phase 4 | Pending |
| PLY-02 | Phase 4 | Pending |
| PLY-03 | Phase 4 | Pending |
| PLY-04 | Phase 4 | Pending |
| PLY-05 | Phase 4 | Pending |
| ACT-01 | Phase 4 | Pending |
| ACT-02 | Phase 4 | Pending |
| ACT-03 | Phase 4 | Pending |
| ACT-04 | Phase 4 | Pending |
| ACT-05 | Phase 4 | Pending |
| ACT-06 | Phase 4 | Pending |
| ACT-07 | Phase 4 | Pending |
| ACT-08 | Phase 4 | Pending |
| ACT-09 | Phase 4 | Pending |
| COL-01 | Phase 4 | Pending |
| COL-02 | Phase 4 | Pending |
| COL-03 | Phase 4 | Pending |
| SITE-01 | Phase 5 | Pending |
| SITE-02 | Phase 5 | Pending |
| USR-01 | Phase 5 | Pending |
| USR-02 | Phase 5 | Pending |
| USR-03 | Phase 5 | Pending |
| CLI-01 | Phase 3 | Pending |
| CLI-02 | Phase 3 | Pending |
| CLI-03 | Phase 3 | Pending |
| CLI-04 | Phase 3 | Pending |
| CLI-05 | Phase 5 | Pending |
| CLI-06 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 63 total
- Mapped to phases: 63
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-14*
*Last updated: 2026-04-14 — expanded to full endpoint coverage + chunked upload protocol*
