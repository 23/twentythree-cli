# Roadmap: TwentyThree CLI

## Overview

Five phases take the project from a bare monorepo scaffold to a fully functional, npm-installable CLI with coverage of every major TwentyThree API resource. Phase 1 lays the structural and type-generation foundation. Phase 2 delivers working authentication and multi-workspace support — the first vertical slice users can actually run. Phase 3 builds the chunked upload engine and the three primary resource commands (video, category, webinar), establishing all cross-cutting CLI patterns. Phase 4 extends coverage to player, action, and collector resources. Phase 5 completes the surface with site and user commands, adds the developer-facing quality tools (doctor, agent help), and polishes the distribution.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Monorepo scaffold, oclif wiring, OpenAPI types, and term-map module
- [ ] **Phase 2: Auth & Workspaces** - Credential storage, workspace discovery, token refresh, and workspace switching
- [ ] **Phase 3: Core Commands** - Chunked upload engine, video/category/webinar CRUD, and cross-cutting CLI patterns
- [ ] **Phase 4: Extended Resources** - Player, action (CTAs), and collector commands
- [ ] **Phase 5: Site, Users & Polish** - Site and user commands, doctor, agent help, and distribution hardening

## Phase Details

### Phase 1: Foundation
**Goal**: A runnable, installable CLI skeleton exists with correct project structure, generated API types, and the terminology-mapping module ready for all downstream work
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06
**Success Criteria** (what must be TRUE):
  1. Running `npm install -g twentythree-cli` succeeds and `twentythree --version` prints a version string
  2. Running `twentythree` on a Node version below the minimum prints a clear error and exits non-zero
  3. `api/types.ts` exists, was generated from the live OpenAPI spec, and the generation script can be re-run to regenerate it
  4. `term-map.ts` exists and translates `photo`→`video`, `album`→`category`, `live`→`webinar` in both directions
**Plans**: TBD

Plans:
- [ ] 01-01: Monorepo scaffold — pnpm workspaces, Turborepo, root tsconfig, vitest, CI skeleton
- [ ] 01-02: oclif CLI package — bin entrypoint, tsdown build, Node version guard (FOUND-02, FOUND-03, FOUND-04)
- [ ] 01-03: OpenAPI types + term-map — generate `api/types.ts`, author `term-map.ts`, commit both (FOUND-05, FOUND-06)

### Phase 2: Auth & Workspaces
**Goal**: A developer can run `twentythree auth credentials`, enter a domain and bearer token, select workspaces, and have all subsequent commands operate against the correct workspace
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09
**Success Criteria** (what must be TRUE):
  1. `twentythree auth credentials` prompts for domain and bearer token, calls the workspace discovery endpoint, and stores credentials securely in the OS keychain
  2. `twentythree auth status` shows the current credentials, active workspace name, and token expiry
  3. `twentythree workspace list` lists all available workspaces; the default is visually marked
  4. `twentythree workspace use <name>` switches the active workspace and subsequent commands operate against the new workspace
  5. Every command output header shows the active workspace name; destructive confirmation prompts include the workspace name
**Plans**: TBD

Plans:
- [ ] 02-01: Credential store — `auth/store.ts` with `@napi-rs/keyring` primary, `conf` fallback, file lock for refresh race prevention (AUTH-01, AUTH-05)
- [ ] 02-02: Workspace discovery & selection — `auth/workspace.ts`, `auth credentials` command, workspace picker prompt (AUTH-02, AUTH-03)
- [ ] 02-03: Workspace management commands — `auth status`, `workspace list`, `workspace use`, `--workspace` flag on base command (AUTH-04, AUTH-06, AUTH-07, AUTH-08, AUTH-09)

### Phase 3: Core Commands
**Goal**: A developer can upload a video, and list/get/create/update/delete videos, categories, and webinars — with progress feedback, pagination, correct exit codes, JSON output, and no legacy terminology visible
**Depends on**: Phase 2
**Requirements**: UPL-01, UPL-02, UPL-03, UPL-04, UPL-05, UPL-06, UPL-07, UPL-08, VID-01, VID-02, VID-03, VID-04, VID-05, CAT-01, CAT-02, CAT-03, CAT-04, CAT-05, WEB-01, WEB-02, WEB-03, WEB-04, WEB-05, CLI-01, CLI-02, CLI-03, CLI-04
**Success Criteria** (what must be TRUE):
  1. `twentythree video upload <file>` uploads a file in resumable 100MB chunks with a live progress bar showing bytes, percentage, and ETA; an interrupted upload can be resumed without re-uploading completed chunks
  2. `twentythree video list`, `video get`, `video update`, and `video delete` work correctly; delete requires confirmation showing the workspace name; list auto-paginates
  3. `twentythree category list|get|create|update|delete` and `twentythree webinar list|get|create|update|delete` all work with the same behavioral guarantees as video commands
  4. All commands accept `--json` and return `{ ok, data, summary, breadcrumbs }`; piped output contains no spinner frames; exit codes are 0/1/2 as specified
  5. No user-visible string (including error messages) contains the legacy API terms `photo`, `album`, or `live`
**Plans**: TBD

Plans:
- [ ] 03-01: API client layer — `api/client.ts` workspace-scoped factory, auth middleware, `openapi-fetch` wiring, `--json` envelope and `--workspace` override integration (CLI-01, CLI-03)
- [ ] 03-02: Chunked upload engine — two-step token flow, resumable.js protocol, 100MB chunks, 5 parallel, 5 retries, resume detection, progress bar, stderr-only output (UPL-01 through UPL-08)
- [ ] 03-03: Video commands — `video list|get|upload|update|delete` with pagination, confirmation prompts, and term-map applied (VID-01 through VID-05, CLI-02, CLI-04)
- [ ] 03-04: Category and webinar commands — `category list|get|create|update|delete` and `webinar list|get|create|update|delete` (CAT-01 through CAT-05, WEB-01 through WEB-05)

### Phase 4: Extended Resources
**Goal**: A developer can manage players, CTAs (actions), and collectors from the terminal with the same behavioral guarantees established in Phase 3
**Depends on**: Phase 3
**Requirements**: PLY-01, PLY-02, PLY-03, PLY-04, PLY-05, ACT-01, ACT-02, ACT-03, ACT-04, ACT-05, ACT-06, ACT-07, ACT-08, ACT-09, COL-01, COL-02, COL-03
**Success Criteria** (what must be TRUE):
  1. `twentythree player list|get|create|update|delete` all work; delete requires confirmation
  2. All nine `twentythree action` subcommands work including `action upload` for image/video attachments to action variables
  3. `twentythree collector list|include|exclude` work; `collector list` supports the optional analytics flag
**Plans**: TBD

Plans:
- [ ] 04-01: Player commands — `player list|get|create|update|delete` (PLY-01 through PLY-05)
- [ ] 04-02: Action (CTA) commands — `action list|get|types|add|update|delete|include|exclude|upload` (ACT-01 through ACT-09)
- [ ] 04-03: Collector commands — `collector list|include|exclude` (COL-01 through COL-03)

### Phase 5: Site, Users & Polish
**Goal**: Full API surface coverage is complete, `twentythree doctor` gives users an instant health check, `--help --agent` exposes machine-readable metadata, and the CLI is distribution-ready
**Depends on**: Phase 4
**Requirements**: SITE-01, SITE-02, USR-01, USR-02, USR-03, CLI-05, CLI-06
**Success Criteria** (what must be TRUE):
  1. `twentythree site get` and `twentythree site update` retrieve and update site settings for the active workspace
  2. `twentythree user list`, `user get`, and `user tokens` all work correctly
  3. `twentythree doctor` checks credentials, connectivity, and token validity and prints a structured health report with clear pass/fail indicators
  4. `twentythree <any-command> --help --agent` outputs machine-readable command metadata consumable by an AI agent
**Plans**: TBD

Plans:
- [ ] 05-01: Site and user commands — `site get|update`, `user list|get|tokens` (SITE-01, SITE-02, USR-01, USR-02, USR-03)
- [ ] 05-02: Developer quality tools — `doctor` health check, `--help --agent` metadata output, install path documentation (CLI-05, CLI-06)
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. Auth & Workspaces | 0/3 | Not started | - |
| 3. Core Commands | 0/4 | Not started | - |
| 4. Extended Resources | 0/3 | Not started | - |
| 5. Site, Users & Polish | 0/2 | Not started | - |
