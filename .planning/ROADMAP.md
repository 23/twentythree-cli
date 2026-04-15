# Roadmap: TwentyThree CLI

## Overview

Eight phases take the project from a bare monorepo scaffold to a fully functional, npm-installable CLI with coverage of all 235 TwentyThree API endpoints across 22 resource groups. Phase 1 lays the structural and type-generation foundation. Phase 2 delivers working authentication and multi-workspace support — the first vertical slice users can actually run. Phase 3 builds the chunked upload engine and all video commands. Phase 4 covers categories and the core webinar lifecycle. Phase 5 completes the deep webinar surface (speakers, mail, recording, transcription, series, room, polls). Phase 6 adds engagement and action resources. Phase 7 delivers analytics and audience. Phase 8 completes the full platform surface and ships the production-ready CLI.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Monorepo scaffold, oclif wiring, OpenAPI types, and term-map module (completed 2026-04-14)
- [ ] **Phase 2: Auth & Workspaces** - Credential storage, workspace discovery, token refresh, and workspace switching
- [x] **Phase 3: Video Core** - Chunked upload engine and all video/subtitle/section commands (completed 2026-04-14)
- [ ] **Phase 4: Category & Webinar Core** - Category CRUD and core webinar lifecycle commands
- [ ] **Phase 5: Webinar Deep** - Speakers, mail, recording, transcription, series, room, polls, attachments, queued videos
- [ ] **Phase 6: Engagement & Actions** - Action CTAs, collector, comment, player, and tag commands
- [ ] **Phase 7: Analytics & Audience** - All analytics sub-dimensions and all audience commands
- [ ] **Phase 8: Platform & Polish** - Spot, thumbnail, webhook, app, presentation, protection, session, openupload, site/setting, user, doctor, agent help

## Phase Details

### Phase 1: Foundation
**Goal**: A runnable, installable CLI skeleton exists with correct project structure, generated API types, and the terminology-mapping module ready for all downstream work
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06
**Success Criteria** (what must be TRUE):
  1. Running `npm install -g twentythree-cli` succeeds and `twentythree --version` prints a version string
  2. Running `twentythree` on a Node version below the minimum prints a clear error message and exits with a non-zero code
  3. `api/types.ts` exists, was generated from the live OpenAPI spec, and the generation script can be re-run to regenerate it without manual intervention
  4. `term-map.ts` exists and correctly translates `photo`→`video`, `album`→`category`, `live`→`webinar` in both directions
**Plans**: 3 plans
Plans:
- [x] 01-01-PLAN.md — Monorepo scaffold (root config, both packages, pnpm install)
- [x] 01-02-PLAN.md — CLI package wiring (bin entrypoints, Node guard, tsdown, build pipeline)
- [x] 01-03-PLAN.md — OpenAPI types + term-map (type generation, term-map module, vitest, tests)

### Phase 2: Auth & Workspaces
**Goal**: A developer can run `twentythree auth credentials`, enter a domain and bearer token, select workspaces, and have all subsequent commands operate against the correct workspace
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09, AUTH-10, AUTH-11
**Success Criteria** (what must be TRUE):
  1. `twentythree auth credentials` prompts for domain and bearer token, calls the workspace discovery endpoint, and stores credentials securely in the OS keychain
  2. `twentythree auth status` shows current credentials, active workspace name, and token expiry
  3. `twentythree workspace list` lists all available workspaces with the default visually marked
  4. `twentythree workspace use <name>` switches the active workspace; all subsequent commands operate against the new workspace
  5. Every command output header shows the active workspace name; destructive confirmation prompts include the workspace name
**Plans**: 5 plans
Plans:
- [ ] 02-01-PLAN.md — Install deps, inspect live /user/tokens response, create test stubs (Wave 0)
- [ ] 02-02-PLAN.md — Credential store + workspace config modules (Wave 1)
- [ ] 02-03-PLAN.md — Token refresh with file locking (Wave 1)
- [ ] 02-04-PLAN.md — API client factory + BaseCommand/AuthenticatedCommand (Wave 2)
- [ ] 02-05-PLAN.md — Auth + workspace commands with end-to-end verification (Wave 3)

### Phase 3: Video Core
**Goal**: A developer can upload, list, get, update, delete, replace, and manage sections and subtitles for videos — with resumable chunked uploads, progress feedback, pagination, and zero legacy terminology in output
**Depends on**: Phase 2
**Requirements**: UPL-01, UPL-02, UPL-03, UPL-04, UPL-05, UPL-06, UPL-07, UPL-08, VID-01, VID-02, VID-03, VID-04, VID-05, VID-06, VID-07, VID-08, VID-09, VID-10, CLI-01, CLI-02, CLI-03, CLI-04
**Success Criteria** (what must be TRUE):
  1. `twentythree video upload <file>` uploads a file in resumable 100MB chunks with a live progress bar showing bytes, percentage, and ETA; an interrupted upload resumes without re-uploading completed chunks
  2. `twentythree video list`, `video get`, `video update`, `video delete`, `video replace`, `video transcoding-progress`, and `video frame` all work correctly; delete requires workspace-scoped confirmation
  3. `twentythree video section` subcommands (list, create, update, delete, set-thumbnail) and all `video subtitle` subcommands work end-to-end
  4. All commands accept `--json` and return `{ ok, data, summary, breadcrumbs }`; list commands auto-paginate; exit codes are 0/1/2
  5. No user-visible string including error messages contains the legacy API terms `photo`, `album`, or `live`
**Plans**: 5 plans
Plans:
- [x] 03-01-PLAN.md — Install deps, output/pagination helpers, upload types, topic stubs (Wave 1)
- [x] 03-02-PLAN.md — Chunked upload engine (chunk-pool + chunked-upload modules) (Wave 2)
- [x] 03-03-PLAN.md — Core video commands (list, get, upload, update, delete) (Wave 3)
- [x] 03-04-PLAN.md — Video replace, transcoding-progress, frame + section subcommands (Wave 3)
- [x] 03-05-PLAN.md — All 11 subtitle subcommands (Wave 3)

### Phase 4: Category & Webinar Core
**Goal**: A developer can perform full CRUD on categories and run the core webinar lifecycle — create, update, delete, upload image, retrieve metrics, clips, highlights, formats, log, and repeat
**Depends on**: Phase 3
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04, WEB-01, WEB-02, WEB-03, WEB-04, WEB-05, WEB-06, WEB-07, WEB-08, WEB-09, WEB-10, WEB-11
**Success Criteria** (what must be TRUE):
  1. `twentythree category list`, `category create`, `category update`, and `category delete` all work; delete requires confirmation
  2. `twentythree webinar list`, `webinar create`, `webinar update`, and `webinar delete` work with the same behavioral guarantees as video commands
  3. `twentythree webinar upload-image`, `webinar metrics`, `webinar clips`, `webinar highlights`, `webinar list-formats`, `webinar log`, and `webinar repeat` all return correct data
  4. All new commands in this phase respect the `--json` flag, auto-paginate lists, and apply the term map to all output
**Plans**: 4 plans
Plans:
- [ ] 04-01-PLAN.md — Category CRUD commands (list, create, update, delete) + tests
- [ ] 04-02-PLAN.md — Webinar CRUD commands (list, create, update, delete) + fetchWebinarToken + tests
- [ ] 04-03-PLAN.md — Upload engine extraFields extension + webinar upload-image command + tests
- [ ] 04-04-PLAN.md — Webinar read-only commands (metrics, clips, highlights, list-formats, log, repeat) + tests

### Phase 5: Webinar Deep
**Goal**: The full webinar surface is operable — speakers, mail, recording, transcription, series, room, polls, attachments, sections, and queued videos can all be managed from the terminal
**Depends on**: Phase 4
**Requirements**: WEB-12, WEB-13, WEB-14, WEB-15, WEB-16, WEB-17, WEB-18, WEB-19, WEB-20, POL-01, POL-02, POL-03, POL-04, POL-05, POL-06
**Success Criteria** (what must be TRUE):
  1. `twentythree webinar attachment` and `webinar section` subcommands manage attachments and agenda sections on a webinar
  2. `twentythree webinar speaker` subcommands (list, add, update, remove, invitation, guest request, library) fully manage speakers; `webinar mail` subcommands manage email communications including preview, send, and test
  3. `twentythree webinar recording` start/stop/status controls recording; `webinar transcription` list/connect/locales/transcriptionlist manages transcriptions; `webinar room` info/themes/send-recording/connect manages the room
  4. All `twentythree webinar series` subcommands manage the full series lifecycle including recurrences, on-demand, and thumbnail upload
  5. `twentythree poll` CRUD commands and `webinar queued-video add|remove` work correctly
**Plans**: 5 plans
Plans:
- [ ] 05-01-PLAN.md — Webinar attachment (list, upload, delete, set-hidden) + section (list, add, update, remove)
- [ ] 05-02-PLAN.md — Webinar speaker (14 commands) + mail (7 commands)
- [ ] 05-03-PLAN.md — Recording (start, stop, status) + transcription (4) + room (4) + queued-video (2)
- [ ] 05-04-PLAN.md — Webinar series (12 commands including recurrences + thumbnail upload)
- [ ] 05-05-PLAN.md — Poll CRUD (6 commands — new top-level topic)

### Phase 6: Engagement & Actions
**Goal**: A developer can manage action CTAs, collectors, comments, players, and tags from the terminal with the same behavioral guarantees established in earlier phases
**Depends on**: Phase 3
**Requirements**: ACT-01, ACT-02, ACT-03, ACT-04, ACT-05, ACT-06, ACT-07, ACT-08, ACT-09, COL-01, COL-02, COL-03, CMT-01, CMT-02, CMT-03, CMT-04, CMT-05, CMT-06, CMT-07, CMT-08, PLY-01, PLY-02, PLY-03, PLY-04, PLY-05, PLY-06, TAG-01, TAG-02
**Success Criteria** (what must be TRUE):
  1. All nine `twentythree action` subcommands work including `action upload` for attaching image/video files to action variables
  2. `twentythree collector list|include|exclude` work; `collector list` supports the optional analytics flag
  3. All eight `twentythree comment` subcommands work including reaction management; all six `twentythree player` subcommands work including embed code generation and style listing
  4. `twentythree tag list` and `twentythree tag related` return correct results
**Plans**: 4 plans
Plans:
- [x] 06-01-PLAN.md — Action CTA commands (add, delete, types, update, get, list, exclude, include, upload)
- [x] 06-02-PLAN.md — Collector and Tag commands (list, include, exclude, tag list, tag related)
- [x] 06-03-PLAN.md — Comment commands including reaction 3-level topic (list, add, update, delete, promote, clone, set-order, reaction add/list/remove)
- [ ] 06-04-PLAN.md — Player commands (list, update, delete, embed, embed-versions, styles)

### Phase 06.1: Download and store swagger file; prescribe api-change workflow with claude-aided code updates (INSERTED)

**Goal:** [Urgent work - to be planned]
**Requirements**: TBD
**Depends on:** Phase 6
**Plans:** 3/4 plans executed

Plans:
- [ ] TBD (run /gsd-plan-phase 06.1 to break down)

### Phase 7: Analytics & Audience
**Goal**: A developer can query any analytics dimension (video, live, conversions, usage sub-dimensions) and manage the full audience — members, fields, companies, collectors, funnels, and timelines
**Depends on**: Phase 3
**Requirements**: ANL-01, ANL-02, ANL-03, ANL-04, ANL-05, ANL-06, ANL-07, ANL-08, AUD-01, AUD-02, AUD-03, AUD-04, AUD-05, AUD-06, AUD-07, AUD-08, AUD-09, AUD-10, AUD-11, AUD-12
**Success Criteria** (what must be TRUE):
  1. `twentythree analytics videos` and its five sub-dimensions (timeseries, totals, weekday, performance, published) return correct data and accept standard date range filters
  2. `twentythree analytics live` and its six sub-dimensions and `twentythree analytics conversions` with its two sub-dimensions all return correct data
  3. All eight `twentythree analytics usage` sub-dimensions (devices, domains, locations, sources, sourceids, spots, storage, traffic) return correct data
  4. All analytics commands support `--json` output
  5. All twelve `twentythree audience` commands work — list, search, register, unregister, remove, metrics, funnel, timelines, companies, identity-sources, list-collectors, and field management
**Plans**: TBD

### Phase 8: Platform & Polish
**Goal**: The complete platform surface is covered — spot, thumbnail, webhook, app, presentation, protection, session, openupload, site/setting, and user commands all work; `twentythree doctor` gives an instant health check; `--help --agent` exposes machine-readable metadata; the CLI is distribution-ready
**Depends on**: Phase 6, Phase 7
**Requirements**: SPT-01, SPT-02, SPT-03, SPT-04, SPT-05, SPT-06, SPT-07, THB-01, THB-02, THB-03, THB-04, THB-05, THB-06, THB-07, WHK-01, WHK-02, WHK-03, WHK-04, WHK-05, APP-01, APP-02, APP-03, PRS-01, PRS-02, PRS-03, PRT-01, PRT-02, PRT-03, SES-01, SES-02, OUP-01, OUP-02, OUP-03, SITE-01, SITE-02, SITE-03, USR-01, USR-02, USR-03, USR-04, USR-05, USR-06, USR-07, USR-08, CLI-05, CLI-06
**Success Criteria** (what must be TRUE):
  1. All seven `twentythree spot` subcommands and all seven `twentythree thumbnail` subcommands (including file management) work correctly
  2. All five `twentythree webhook` subcommands work; `twentythree app add|update|delete`, `twentythree presentation` commands, `twentythree protection` commands, `twentythree session` commands, and `twentythree openupload` commands all work
  3. `twentythree site get`, `site search`, and `setting update` work; all eight `twentythree user` subcommands (list, get, create, update, send-invitation, get-login-token, redeem-login-token, tokens) work
  4. `twentythree doctor` checks credentials, connectivity, and token validity and prints a structured pass/fail health report
  5. `twentythree <any-command> --help --agent` outputs machine-readable command metadata consumable by an AI agent
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in the following order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
Note: Phases 6 and 7 both depend on Phase 3 and can be planned/executed in parallel once Phase 3 is complete. Phase 8 depends on Phase 6 and Phase 7 both being complete.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete   | 2026-04-14 |
| 2. Auth & Workspaces | 0/5 | Planned | - |
| 3. Video Core | 5/5 | Complete   | 2026-04-14 |
| 4. Category & Webinar Core | 0/4 | Planned | - |
| 5. Webinar Deep | 0/5 | Planned | - |
| 6. Engagement & Actions | 3/4 | In Progress|  |
| 7. Analytics & Audience | 0/4 | Not started | - |
| 8. Platform & Polish | 0/5 | Not started | - |
