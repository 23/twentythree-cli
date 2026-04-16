# Requirements: TwentyThree CLI

**Defined:** 2026-04-14
**Core Value:** A developer can authenticate, select a workspace, and call any TwentyThree API endpoint from the terminal in under a minute.

**API surface:** 235 endpoints across 22 resource groups (source: `video.twentythree.com/apidocs/swagger.json`)

## v1 Requirements

Requirements for initial release. Maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Project is a pnpm monorepo with two packages: `twentythree-cli` (global binary) and `twentythree-skills` (SKILL.md only)
- [x] **FOUND-02**: CLI is built with oclif v4, TypeScript, and bundled via tsdown into a single entry point
- [x] **FOUND-03**: CLI is installable globally via `npm install -g twentythree-cli` and runnable as `twentythree`
- [x] **FOUND-04**: `engines` field enforces minimum Node.js version; CLI prints a clear error and exits on unsupported versions
- [x] **FOUND-05**: OpenAPI types are generated from `video.twentythree.com/apidocs/swagger.json` and committed as `api/types.ts`; generation script is re-runnable
- [x] **FOUND-06**: A `term-map.ts` module translates legacy API terms (`photo`→`video`, `album`→`category`, `live`→`webinar`) — applied to all user-visible output including error messages

### Authentication & Workspaces

- [ ] **AUTH-01**: `twentythree auth credentials` prompts for domain and bearer token (token is optional — press Enter to skip for anonymous-only access) and stores them securely in the OS keychain via `@napi-rs/keyring`
- [ ] **AUTH-02**: When a token is provided, CLI calls `/api/2/user/tokens?cross_sites_p=1` to discover all available workspaces; when domain-only, workspace is the provided domain itself
- [ ] **AUTH-03**: User is prompted to select which workspaces to activate and set a default workspace (skipped in domain-only/anonymous mode)
- [ ] **AUTH-04**: Active workspace name is printed in every command's output header and all destructive confirmation prompts
- [ ] **AUTH-05**: Token refresh runs proactively before expiry while CLI is active; a file lock prevents race conditions on concurrent invocations
- [ ] **AUTH-06**: `twentythree auth status` shows current credentials, active workspace, token expiry, and auth mode (anonymous / authenticated / scope level)
- [ ] **AUTH-07**: `twentythree workspace list` lists all available workspaces with the default marked
- [ ] **AUTH-08**: `twentythree workspace use <name>` switches the default workspace
- [ ] **AUTH-09**: Every command accepts a `--workspace <name>` flag to override the active workspace for a single invocation
- [ ] **AUTH-10**: Commands requiring authentication that are invoked in anonymous/domain-only mode fail with a clear error: "This command requires authentication — run `twentythree auth credentials` to add a bearer token"
- [ ] **AUTH-11**: The API client layer sends `Authorization: Bearer <token>` only when a token is configured; anonymous-scope endpoints are called without the header when in domain-only mode

### Uploads (Chunked & Resumable)

The chunked upload engine is **shared infrastructure** used by any command that uploads a potentially large file. Small files (images, avatars, subtitles) use a direct multipart POST. Large files (videos, webinar attachments, action video files, open uploads) use the chunked engine.

**Commands using chunked upload:** `video upload`, `video replace`, `webinar attachment upload`, `action upload` (when file is video), `openupload upload-file`

- [x] **UPL-01**: The chunked upload engine is a shared module in `src/upload/`; video token-based uploads use `photo/get-upload-token` → `photo/redeem-upload-token`; direct-endpoint uploads (e.g. webinar attachments) send resumable.js params directly to the endpoint URL
- [x] **UPL-02**: Files are split into chunks using the resumable.js protocol parameters (`resumableChunkNumber`, `resumableTotalChunks`, `resumableChunkSize`, `resumableTotalSize`, `resumableIdentifier`, `resumableFilename`)
- [x] **UPL-03**: Default chunk size is 100MB; configurable via `--chunk-size` flag
- [x] **UPL-04**: Up to 5 chunks are uploaded in parallel by default; configurable via `--concurrency` flag
- [x] **UPL-05**: Each chunk retries up to 5 times on transient failure before the upload is aborted
- [x] **UPL-06**: Interrupted uploads can be resumed — CLI checks which chunks were already accepted before re-uploading
- [x] **UPL-07**: A progress bar displays bytes uploaded, percentage, and estimated time remaining during upload
- [x] **UPL-08**: Upload implementation is native to the CLI — no dependency on `resumable-upload-command`

### Video Commands (`photo` → `video`)

- [x] **VID-01**: `twentythree video list` lists videos in the active workspace with pagination
- [x] **VID-02**: `twentythree video get <id>` retrieves a single video's details (includes `photo/list` with id filter)
- [x] **VID-03**: `twentythree video upload <file>` uploads a video file using the chunked upload protocol (UPL-01–UPL-08)
- [x] **VID-04**: `twentythree video update <id>` updates video metadata
- [x] **VID-05**: `twentythree video delete <id>` deletes a video with confirmation prompt
- [ ] **VID-06**: `twentythree video replace <id> <file>` replaces a video file using `photo/get-replace-token` + chunked upload
- [ ] **VID-07**: `twentythree video transcoding-progress <id>` retrieves transcoding status
- [ ] **VID-08**: `twentythree video frame <id>` extracts a frame/thumbnail from a video
- [ ] **VID-09**: `twentythree video section list|create|update|delete|set-thumbnail <id>` manages video sections/chapters
- [x] **VID-10**: `twentythree video subtitle list|create|update|delete|upload|data|locales|types|duplicate|set-primary|archive` manages subtitles

### Category Commands (`album` → `category`)

- [ ] **CAT-01**: `twentythree category list` lists categories in the active workspace
- [ ] **CAT-02**: `twentythree category create` creates a new category
- [ ] **CAT-03**: `twentythree category update <id>` updates category metadata
- [ ] **CAT-04**: `twentythree category delete <id>` deletes a category with confirmation prompt

### Webinar Commands (`live` → `webinar`)

- [ ] **WEB-01**: `twentythree webinar list` lists webinars in the active workspace with pagination
- [ ] **WEB-02**: `twentythree webinar create` creates a new webinar
- [ ] **WEB-03**: `twentythree webinar update <id>` updates webinar details
- [ ] **WEB-04**: `twentythree webinar delete <id>` deletes a webinar with confirmation prompt
- [ ] **WEB-05**: `twentythree webinar upload-image <id> <file>` uploads a webinar image/thumbnail
- [ ] **WEB-06**: `twentythree webinar metrics <id>` retrieves webinar metrics
- [ ] **WEB-07**: `twentythree webinar clips <id>` lists generated clips from a webinar
- [ ] **WEB-08**: `twentythree webinar highlights <id>` lists highlights
- [ ] **WEB-09**: `twentythree webinar list-formats` lists available webinar formats
- [ ] **WEB-10**: `twentythree webinar log <id>` retrieves the webinar event log
- [ ] **WEB-11**: `twentythree webinar repeat <id>` repeats/schedules a recurring webinar
- [ ] **WEB-12**: `twentythree webinar attachment list|upload|delete|set-hidden <id>` manages webinar attachments; `attachment upload` uses the shared chunked upload engine (UPL-01–UPL-08) since handouts/PDFs/slides can be large
- [ ] **WEB-13**: `twentythree webinar section list|add|update|remove <id>` manages webinar agenda sections
- [ ] **WEB-14**: `twentythree webinar speaker list|add|add-from-user|add-from-speaker|update|remove|set-avatar|remove-avatar|set-order|send-invitation|request-guest|cancel-guest-request|connection-types|library` manages speakers
- [ ] **WEB-15**: `twentythree webinar mail list|add|update|remove|preview|send|test` manages webinar email communications
- [ ] **WEB-16**: `twentythree webinar recording start|stop|status` controls webinar recording
- [ ] **WEB-17**: `twentythree webinar transcription list|connect|locales|transcriptionlist` manages transcriptions
- [ ] **WEB-18**: `twentythree webinar room info|themes|send-recording|connect` manages the webinar room
- [ ] **WEB-19**: `twentythree webinar series list|create|update|delete|metrics|recurrences|apply-recurrence|skip-recurrence|cancel|set-ondemand|mapped-objects|upload-thumbnail` manages webinar series
- [ ] **WEB-20**: `twentythree webinar queued-video add|remove` manages queued videos for a webinar

### Player Commands

- [x] **PLY-01**: `twentythree player list` lists players in the active workspace
- [x] **PLY-02**: `twentythree player update <id>` updates player settings
- [x] **PLY-03**: `twentythree player delete <id>` deletes a player with confirmation prompt
- [x] **PLY-04**: `twentythree player embed <id>` generates embed code for a player
- [x] **PLY-05**: `twentythree player embed-versions` lists available embed versions
- [x] **PLY-06**: `twentythree player styles` lists available player styles

### Action Commands (CTAs)

- [x] **ACT-01**: `twentythree action list` lists CTAs for a given video/webinar
- [x] **ACT-02**: `twentythree action get` fetches actions by object or action ID
- [x] **ACT-03**: `twentythree action types` lists available action type definitions
- [x] **ACT-04**: `twentythree action add` creates a new CTA with default values
- [x] **ACT-05**: `twentythree action update <id>` modifies action name, timing, and data fields
- [x] **ACT-06**: `twentythree action delete <id>` removes a CTA permanently with confirmation
- [x] **ACT-07**: `twentythree action include <id>` adds an object to a CTA's scope
- [x] **ACT-08**: `twentythree action exclude <id>` prevents a CTA from displaying on a specific object
- [x] **ACT-09**: `twentythree action upload <id>` uploads an image/video file to an action variable; uses the shared chunked upload engine (UPL-01–UPL-08) when the file is a video

### Collector Commands

- [x] **COL-01**: `twentythree collector list` lists workspace collectors with optional analytics flag
- [x] **COL-02**: `twentythree collector include <id>` attaches a collector to a video or webinar
- [x] **COL-03**: `twentythree collector exclude <id>` blocks a collector from displaying on a video/webinar

### Comment Commands

- [x] **CMT-01**: `twentythree comment list <id>` lists comments on a video or webinar
- [x] **CMT-02**: `twentythree comment add <id>` adds a comment
- [x] **CMT-03**: `twentythree comment update <id>` updates a comment
- [x] **CMT-04**: `twentythree comment delete <id>` deletes a comment with confirmation
- [x] **CMT-05**: `twentythree comment promote <id>` promotes a comment
- [x] **CMT-06**: `twentythree comment clone <id>` clones a comment
- [x] **CMT-07**: `twentythree comment set-order <id>` sets comment display order
- [x] **CMT-08**: `twentythree comment reaction list|add|remove <id>` manages comment reactions

### Poll Commands

- [ ] **POL-01**: `twentythree poll list <id>` lists polls for a webinar
- [ ] **POL-02**: `twentythree poll add <id>` creates a new poll
- [ ] **POL-03**: `twentythree poll update <id>` updates a poll
- [ ] **POL-04**: `twentythree poll remove <id>` removes a poll with confirmation
- [ ] **POL-05**: `twentythree poll set-options <id>` sets poll options
- [ ] **POL-06**: `twentythree poll answer <id>` submits a poll answer

### Analytics Commands

- [x] **ANL-01**: `twentythree analytics videos` retrieves video analytics data
- [ ] **ANL-02**: `twentythree analytics videos timeseries|totals|weekday|performance|published` retrieves aggregated video analytics
- [x] **ANL-03**: `twentythree analytics live` retrieves live/webinar analytics data
- [x] **ANL-04**: `twentythree analytics live timeseries|totals|weekday|event|event-timeseries|event-totals` retrieves aggregated live analytics
- [x] **ANL-05**: `twentythree analytics conversions` retrieves conversion analytics
- [x] **ANL-06**: `twentythree analytics conversions timeseries|totals` retrieves aggregated conversion analytics
- [x] **ANL-07**: `twentythree analytics usage devices|domains|locations|sources|sourceids|spots|storage|traffic` retrieves usage analytics
- [x] **ANL-08**: All analytics commands support `--json` output and accept standard date range filters

### Audience Commands

- [x] **AUD-01**: `twentythree audience list` lists audience members
- [x] **AUD-02**: `twentythree audience search` searches audience members
- [x] **AUD-03**: `twentythree audience register` registers a new audience member
- [x] **AUD-04**: `twentythree audience unregister <id>` removes an audience member
- [x] **AUD-05**: `twentythree audience remove <id>` removes audience data
- [x] **AUD-06**: `twentythree audience metrics` retrieves audience metrics
- [x] **AUD-07**: `twentythree audience funnel` retrieves funnel analytics
- [x] **AUD-08**: `twentythree audience timelines <id>` retrieves audience member timelines
- [x] **AUD-09**: `twentythree audience companies` lists audience companies
- [x] **AUD-10**: `twentythree audience identity-sources` lists available identity sources
- [x] **AUD-11**: `twentythree audience list-collectors` lists collectors linked to audience
- [x] **AUD-12**: `twentythree audience field list|set|remove|types` manages custom audience fields

### Spot Commands

- [x] **SPT-01**: `twentythree spot list` lists spots in the active workspace
- [x] **SPT-02**: `twentythree spot create` creates a new spot
- [x] **SPT-03**: `twentythree spot update <id>` updates spot settings
- [x] **SPT-04**: `twentythree spot delete <id>` deletes a spot with confirmation
- [x] **SPT-05**: `twentythree spot set-videos <id>` sets videos assigned to a spot
- [x] **SPT-06**: `twentythree spot check <id>` checks spot status
- [x] **SPT-07**: `twentythree spot reset-version <id>` resets a spot version

### Thumbnail Commands

- [ ] **THB-01**: `twentythree thumbnail list` lists thumbnail templates
- [ ] **THB-02**: `twentythree thumbnail add` creates a new thumbnail template
- [ ] **THB-03**: `twentythree thumbnail update <id>` updates a thumbnail template
- [ ] **THB-04**: `twentythree thumbnail delete <id>` deletes a thumbnail template with confirmation
- [ ] **THB-05**: `twentythree thumbnail duplicate <id>` duplicates a thumbnail template
- [ ] **THB-06**: `twentythree thumbnail data <id>` retrieves template data
- [ ] **THB-07**: `twentythree thumbnail file list|upload|delete <id>` manages template files

### Webhook Commands

- [x] **WHK-01**: `twentythree webhook list` lists webhook subscriptions
- [x] **WHK-02**: `twentythree webhook subscribe` creates a new webhook subscription
- [x] **WHK-03**: `twentythree webhook unsubscribe <id>` removes a webhook subscription
- [x] **WHK-04**: `twentythree webhook events` lists available webhook event types
- [x] **WHK-05**: `twentythree webhook sample <event>` retrieves a sample payload for an event type

### App Commands

- [x] **APP-01**: `twentythree app add` installs an app integration
- [x] **APP-02**: `twentythree app update <id>` updates app settings
- [x] **APP-03**: `twentythree app delete <id>` removes an app with confirmation

### Presentation Commands

- [ ] **PRS-01**: `twentythree presentation setting list` lists presentation settings
- [ ] **PRS-02**: `twentythree presentation setting update` updates presentation settings
- [ ] **PRS-03**: `twentythree presentation page link-locations` retrieves page link location options

### Protection Commands

- [ ] **PRT-01**: `twentythree protection protect <id>` applies protection to a resource
- [ ] **PRT-02**: `twentythree protection unprotect <id>` removes protection from a resource
- [ ] **PRT-03**: `twentythree protection verify` verifies protection credentials

### Session Commands

- [ ] **SES-01**: `twentythree session get-token` creates a session token
- [ ] **SES-02**: `twentythree session redeem-token` redeems a session token

### Open Upload Commands

- [ ] **OUP-01**: `twentythree openupload list` lists open upload entries
- [ ] **OUP-02**: `twentythree openupload upload-file` uploads a file via open upload; uses the shared chunked upload engine (UPL-01–UPL-08) since open uploads accept arbitrary large files
- [ ] **OUP-03**: `twentythree openupload update-file <id>` updates an open upload entry

### Site & Setting Commands

- [ ] **SITE-01**: `twentythree site get` retrieves site settings for the active workspace
- [ ] **SITE-02**: `twentythree site search` searches within the site
- [ ] **SITE-03**: `twentythree setting update` updates global site settings

### User Commands

- [ ] **USR-01**: `twentythree user list` lists users in the active workspace
- [ ] **USR-02**: `twentythree user get <id>` retrieves a user's details
- [ ] **USR-03**: `twentythree user create` creates a new user
- [ ] **USR-04**: `twentythree user update <id>` updates user details
- [ ] **USR-05**: `twentythree user send-invitation <id>` sends a user invitation
- [ ] **USR-06**: `twentythree user get-login-token <id>` generates a login token for a user
- [ ] **USR-07**: `twentythree user redeem-login-token` redeems a login token
- [ ] **USR-08**: `twentythree user tokens` retrieves cross-site tokens for the authenticated user

### Tag Commands

- [x] **TAG-01**: `twentythree tag list` lists tags in the active workspace
- [x] **TAG-02**: `twentythree tag related` lists related tags

### Cross-Cutting CLI Quality

- [x] **CLI-01**: All commands support `--json` flag returning machine-readable output with `ok`, `data`, `summary`, and `breadcrumbs` fields
- [x] **CLI-02**: All list commands handle API pagination transparently (auto-fetches all pages by default)
- [x] **CLI-03**: All commands return correct exit codes: `0` success, `1` user error, `2` API/network error
- [x] **CLI-04**: API errors are mapped through `term-map.ts` before display — no legacy term (`photo`, `album`, `live`) appears in user-visible output
- [ ] **CLI-05**: `twentythree doctor` checks credentials, connectivity, and token validity and prints a structured health report
- [ ] **CLI-06**: `--help --agent` on any command outputs machine-readable command metadata for AI agent consumption
- [x] **CLI-07**: All formatted output resolves relative URLs to full URLs using the active workspace domain — API responses mix absolute (`https://video.company.com/page`) and relative (`/page`) URLs; this applies to all URL fields including page links, thumbnail URLs, and poster images; users always see full URLs

## v2 Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### Browser Auth

- **BAUTH-01**: `twentythree auth login --scope read|write|admin` opens a browser for interactive authentication
- **BAUTH-02**: Auth callback completes in the CLI and stores the resulting token in the keychain

### AI Skills Package

- **SKILL-01**: `twentythree-skills` package contains a hand-authored `SKILL.md` covering all CLI commands with decision trees and quick-reference tables
- **SKILL-02**: Skills package is installable via `npx skills add twentythree/skills`
- **SKILL-03**: Skills package version is pinned to a specific CLI release; versions stay in sync

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
| Real-time streaming / webhooks | Webhook subscription management is in scope; real-time event handling is server-side |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| FOUND-06 | Phase 1 | Complete |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| AUTH-06 | Phase 2 | Pending |
| AUTH-07 | Phase 2 | Pending |
| AUTH-08 | Phase 2 | Pending |
| AUTH-09 | Phase 2 | Pending |
| AUTH-10 | Phase 2 | Pending |
| AUTH-11 | Phase 2 | Pending |
| UPL-01 | Phase 3 | Complete |
| UPL-02 | Phase 3 | Complete |
| UPL-03 | Phase 3 | Complete |
| UPL-04 | Phase 3 | Complete |
| UPL-05 | Phase 3 | Complete |
| UPL-06 | Phase 3 | Complete |
| UPL-07 | Phase 3 | Complete |
| UPL-08 | Phase 3 | Complete |
| VID-01 | Phase 3 | Complete |
| VID-02 | Phase 3 | Complete |
| VID-03 | Phase 3 | Complete |
| VID-04 | Phase 3 | Complete |
| VID-05 | Phase 3 | Complete |
| VID-06 | Phase 3 | Pending |
| VID-07 | Phase 3 | Pending |
| VID-08 | Phase 3 | Pending |
| VID-09 | Phase 3 | Pending |
| VID-10 | Phase 3 | Complete |
| CLI-01 | Phase 3 | Complete |
| CLI-02 | Phase 3 | Complete |
| CLI-03 | Phase 3 | Complete |
| CLI-04 | Phase 3 | Complete |
| CAT-01 | Phase 4 | Pending |
| CAT-02 | Phase 4 | Pending |
| CAT-03 | Phase 4 | Pending |
| CAT-04 | Phase 4 | Pending |
| WEB-01 | Phase 4 | Pending |
| WEB-02 | Phase 4 | Pending |
| WEB-03 | Phase 4 | Pending |
| WEB-04 | Phase 4 | Pending |
| WEB-05 | Phase 4 | Pending |
| WEB-06 | Phase 4 | Pending |
| WEB-07 | Phase 4 | Pending |
| WEB-08 | Phase 4 | Pending |
| WEB-09 | Phase 4 | Pending |
| WEB-10 | Phase 4 | Pending |
| WEB-11 | Phase 4 | Pending |
| WEB-12 | Phase 5 | Pending |
| WEB-13 | Phase 5 | Pending |
| WEB-14 | Phase 5 | Pending |
| WEB-15 | Phase 5 | Pending |
| WEB-16 | Phase 5 | Pending |
| WEB-17 | Phase 5 | Pending |
| WEB-18 | Phase 5 | Pending |
| WEB-19 | Phase 5 | Pending |
| WEB-20 | Phase 5 | Pending |
| POL-01 | Phase 5 | Pending |
| POL-02 | Phase 5 | Pending |
| POL-03 | Phase 5 | Pending |
| POL-04 | Phase 5 | Pending |
| POL-05 | Phase 5 | Pending |
| POL-06 | Phase 5 | Pending |
| ACT-01 | Phase 6 | Complete |
| ACT-02 | Phase 6 | Complete |
| ACT-03 | Phase 6 | Complete |
| ACT-04 | Phase 6 | Complete |
| ACT-05 | Phase 6 | Complete |
| ACT-06 | Phase 6 | Complete |
| ACT-07 | Phase 6 | Complete |
| ACT-08 | Phase 6 | Complete |
| ACT-09 | Phase 6 | Complete |
| COL-01 | Phase 6 | Complete |
| COL-02 | Phase 6 | Complete |
| COL-03 | Phase 6 | Complete |
| CMT-01 | Phase 6 | Complete |
| CMT-02 | Phase 6 | Complete |
| CMT-03 | Phase 6 | Complete |
| CMT-04 | Phase 6 | Complete |
| CMT-05 | Phase 6 | Complete |
| CMT-06 | Phase 6 | Complete |
| CMT-07 | Phase 6 | Complete |
| CMT-08 | Phase 6 | Complete |
| PLY-01 | Phase 6 | Complete |
| PLY-02 | Phase 6 | Complete |
| PLY-03 | Phase 6 | Complete |
| PLY-04 | Phase 6 | Complete |
| PLY-05 | Phase 6 | Complete |
| PLY-06 | Phase 6 | Complete |
| TAG-01 | Phase 6 | Complete |
| TAG-02 | Phase 6 | Complete |
| ANL-01 | Phase 7 | Complete |
| ANL-02 | Phase 7 | Pending |
| ANL-03 | Phase 7 | Complete |
| ANL-04 | Phase 7 | Complete |
| ANL-05 | Phase 7 | Complete |
| ANL-06 | Phase 7 | Complete |
| ANL-07 | Phase 7 | Complete |
| ANL-08 | Phase 7 | Complete |
| AUD-01 | Phase 7 | Complete |
| AUD-02 | Phase 7 | Complete |
| AUD-03 | Phase 7 | Complete |
| AUD-04 | Phase 7 | Complete |
| AUD-05 | Phase 7 | Complete |
| AUD-06 | Phase 7 | Complete |
| AUD-07 | Phase 7 | Complete |
| AUD-08 | Phase 7 | Complete |
| AUD-09 | Phase 7 | Complete |
| AUD-10 | Phase 7 | Complete |
| AUD-11 | Phase 7 | Complete |
| AUD-12 | Phase 7 | Complete |
| SPT-01 | Phase 8 | Complete |
| SPT-02 | Phase 8 | Complete |
| SPT-03 | Phase 8 | Complete |
| SPT-04 | Phase 8 | Complete |
| SPT-05 | Phase 8 | Complete |
| SPT-06 | Phase 8 | Complete |
| SPT-07 | Phase 8 | Complete |
| THB-01 | Phase 8 | Pending |
| THB-02 | Phase 8 | Pending |
| THB-03 | Phase 8 | Pending |
| THB-04 | Phase 8 | Pending |
| THB-05 | Phase 8 | Pending |
| THB-06 | Phase 8 | Pending |
| THB-07 | Phase 8 | Pending |
| WHK-01 | Phase 8 | Complete |
| WHK-02 | Phase 8 | Complete |
| WHK-03 | Phase 8 | Complete |
| WHK-04 | Phase 8 | Complete |
| WHK-05 | Phase 8 | Complete |
| APP-01 | Phase 8 | Complete |
| APP-02 | Phase 8 | Complete |
| APP-03 | Phase 8 | Complete |
| PRS-01 | Phase 8 | Pending |
| PRS-02 | Phase 8 | Pending |
| PRS-03 | Phase 8 | Pending |
| PRT-01 | Phase 8 | Pending |
| PRT-02 | Phase 8 | Pending |
| PRT-03 | Phase 8 | Pending |
| SES-01 | Phase 8 | Pending |
| SES-02 | Phase 8 | Pending |
| OUP-01 | Phase 8 | Pending |
| OUP-02 | Phase 8 | Pending |
| OUP-03 | Phase 8 | Pending |
| SITE-01 | Phase 8 | Pending |
| SITE-02 | Phase 8 | Pending |
| SITE-03 | Phase 8 | Pending |
| USR-01 | Phase 8 | Pending |
| USR-02 | Phase 8 | Pending |
| USR-03 | Phase 8 | Pending |
| USR-04 | Phase 8 | Pending |
| USR-05 | Phase 8 | Pending |
| USR-06 | Phase 8 | Pending |
| USR-07 | Phase 8 | Pending |
| USR-08 | Phase 8 | Pending |
| CLI-05 | Phase 8 | Pending |
| CLI-06 | Phase 8 | Pending |
| CLI-07 | Phase 3 | Complete |

---
*Requirements defined: 2026-04-14*
*Last updated: 2026-04-14 — traceability populated for 8-phase roadmap covering all 235 endpoints*
