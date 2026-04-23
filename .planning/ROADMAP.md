# Roadmap: TwentyThree CLI

## Milestones

- ✅ **v1.0 MVP** — Phases 1–8 + 6.1 (shipped 2026-04-16)
- ✅ **v1.1 Repository Polish & Release** — Phases 9–13 (shipped 2026-04-17)
- ✅ **v1.2 Burnin & Quality of Life** — Phases 14–17 (shipped 2026-04-20)
- ✅ **v1.3 TwentyThree Agent Skill** — Phases 18–20 (shipped 2026-04-20)
- **v1.4 Prepare Skill for Release on npm** — Phases 21–22 (in progress)
- **v1.5 Agent Behavioral Guidelines** — Phases 23–24 (planned)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–8 + 6.1) — SHIPPED 2026-04-16</summary>

- [x] Phase 1: Foundation (3/3 plans) — completed 2026-04-14
- [x] Phase 2: Auth & Workspaces (5/5 plans) — completed 2026-04-14
- [x] Phase 3: Video Core (5/5 plans) — completed 2026-04-14
- [x] Phase 4: Category & Webinar Core (4/4 plans) — completed 2026-04-15
- [x] Phase 5: Webinar Deep (5/5 plans) — completed 2026-04-15
- [x] Phase 6: Engagement & Actions (4/4 plans) — completed 2026-04-15
- [x] Phase 6.1: API Spec Workflow (1/1 plan) — INSERTED — completed 2026-04-15
- [x] Phase 7: Analytics & Audience (4/4 plans) — completed 2026-04-16
- [x] Phase 8: Platform & Polish (10/10 plans) — completed 2026-04-16

Full phase details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 Repository Polish & Release (Phases 9–13) — SHIPPED 2026-04-17</summary>

- [x] **Phase 9: Endpoint Coverage Audit** — Audit all 235 OpenAPI endpoints against command files; classify and fill any confirmed gaps (completed 2026-04-16)
- [x] **Phase 10: Package Hygiene** — Wire prepack script, fill missing package.json fields, update files array (completed 2026-04-16)
- [x] **Phase 11: Documentation** — Generate command reference with oclif; write getting-started and api-spec-upgrade guides (completed 2026-04-16)
- [x] **Phase 12: READMEs & CHANGELOG** — Write root README, npm package README, and CHANGELOG (completed 2026-04-17)
- [x] **Phase 13: npm Publish** — Version, publish to npm, verify installation, wire GitHub Actions CI (completed 2026-04-17)

Full phase details: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 Burnin & Quality of Life (Phases 14–17) — SHIPPED 2026-04-20</summary>

- [x] Phase 14: Bug Audit & Fix (2/2 plans) — completed 2026-04-17
- [x] Phase 15: Tab Completion (2/2 plans) — completed 2026-04-17
- [x] Phase 16: Interactive Prompts (1/1 plan) — completed 2026-04-17
- [x] Phase 17: v1.2 Tech Debt Cleanup (1/1 plan) — completed 2026-04-20

Full phase details: `.planning/milestones/v1.2-ROADMAP.md`

</details>

<details>
<summary>✅ v1.3 TwentyThree Agent Skill (Phases 18–20) — SHIPPED 2026-04-20</summary>

- [x] **Phase 18: Package Foundation** — Monorepo package scaffold, turbo no-build config, validate-skills script, root SKILL.md (completed 2026-04-20)
- [x] **Phase 19: Skill Content** — 22 hand-authored resource reference files and 2–3 agent workflow files (completed 2026-04-20)
- [x] **Phase 20: Runtime Installer** — `npx twentythree-skills add` with runtime detection, --project flag, and idempotent file copy (completed 2026-04-20)

Full phase details: `.planning/milestones/v1.3-ROADMAP.md`

</details>

### v1.4 Prepare Skill for Release on npm

- [x] **Phase 21: Skills npm Publish** — Wire `release.yml` for skills publish, add `publishConfig`, expand keywords, fix bare-npx invocation, verify with dry-run (completed 2026-04-20)
- [ ] **Phase 22: SKILL.md Hyperlinks** — Upgrade all 22 plain-text resource index entries to markdown hyperlinks

### v1.5 Agent Behavioral Guidelines

- [ ] **Phase 23: Behavioral Guide Authoring** — Verify flag names, write `skills/guide.md`, update `skills/SKILL.md`, add inline notes to reference files
- [ ] **Phase 24: Integration & CI Validation** — Update `npm pack --dry-run` file count assertion, smoke-test installer confirms guide.md is copied

## Phase Details

### Phase 9: Endpoint Coverage Audit
**Goal**: Every OpenAPI endpoint is either covered by a command or documented as an intentional omission
**Depends on**: Nothing (first v1.1 phase)
**Requirements**: AUDIT-01, AUDIT-02
**Success Criteria** (what must be TRUE):
  1. Developer can run the audit script and get a count of covered vs uncovered endpoints matched on `agentMetadata.api_endpoint` values
  2. Every uncovered endpoint is classified: either a new command is implemented or a rationale entry is added to `EXCLUDED_OPERATIONS`
  3. Audit script exits 0 (no unaddressed gaps, no phantoms)
**Plans**: 3 plans
Plans:
- [x] 09-01-PLAN.md — Audit infrastructure (EXCLUDED_OPERATIONS, audit script, phantom fixes)
- [x] 09-02-PLAN.md — Video & live analytics gap fill (8 commands)
- [x] 09-03-PLAN.md — Usage analytics gap fill (10 commands) + final audit pass

### Phase 10: Package Hygiene
**Goal**: The package.json is publish-ready and every tarball built from it contains a fresh dist/ and manifest
**Depends on**: Phase 9
**Requirements**: PKG-01, PKG-02, PKG-03
**Success Criteria** (what must be TRUE):
  1. `npm pack --dry-run` output includes `/docs`, `/README.md`, `/dist`, and `oclif.manifest.json`
  2. `prepack` script exists and runs the full build before pack/publish
  3. `package.json` contains `repository`, `bugs`, `homepage`, `keywords`, and `author` fields
**Plans**: 1 plan
Plans:
- [x] 10-01-PLAN.md — Add npm metadata fields, prepack script, and files array entries

### Phase 11: Documentation
**Goal**: A developer can find reference docs for every command and follow step-by-step guides to set up auth and upgrade the API spec
**Depends on**: Phase 9 (manifest must be final before doc generation), Phase 10
**Requirements**: DOCS-01, DOCS-02, DOCS-03
**Success Criteria** (what must be TRUE):
  1. `docs/commands/` exists and contains per-topic markdown files generated by `oclif readme --multi --nested-topics-depth 2`
  2. `docs/guides/getting-started.md` covers auth credentials setup, workspace selection, and running a first command
  3. `docs/guides/api-spec-upgrade.md` documents the `pnpm update-api-spec` workflow end-to-end
**Plans**: 2 plans
Plans:
- [x] 11-01-PLAN.md — Generate command reference with oclif readme + handwritten topic index
- [x] 11-02-PLAN.md — Write getting-started and api-spec-upgrade guides

### Phase 12: READMEs & CHANGELOG
**Goal**: Anyone arriving at the repo root or npm page knows how to install, authenticate, and start using the CLI within two minutes
**Depends on**: Phase 11 (docs/ must exist before README links into them)
**Requirements**: README-01, README-02, README-03
**Success Criteria** (what must be TRUE):
  1. Root `README.md` includes install command, quickstart with `auth credentials` as step 1, 22-topic command overview table, terminology mapping table, and link to `docs/`
  2. `packages/twentythree-cli/README.md` (npm page) contains install command, short quickstart, and link to full GitHub docs
  3. `CHANGELOG.md` exists at repo root with entries for v1.0 and v1.1
**Plans**: 2 plans
Plans:
- [x] 12-01-PLAN.md — Write root README.md and npm package README.md
- [x] 12-02-PLAN.md — Write CHANGELOG.md

### Phase 13: npm Publish
**Goal**: The CLI is live on npm, installable globally, and future releases can be triggered by pushing a git tag
**Depends on**: Phase 10 (package hygiene), Phase 12 (READMEs must exist before publish)
**Requirements**: PUBLISH-01, PUBLISH-02, PUBLISH-03
**Success Criteria** (what must be TRUE):
  1. `npm view twentythree-cli` returns package metadata at version `1.0.0`
  2. `npm install -g twentythree-cli && twentythree --version` succeeds on a clean environment
  3. GitHub Actions workflow exists that publishes on git tag push
**Plans**: 2 plans
Plans:
- [x] 13-01-PLAN.md — Create release workflow + bump version to 1.0.0
- [x] 13-02-PLAN.md — Set npm token, push tag, verify publish

### Phase 18: Package Foundation
**Goal**: The `twentythree-skills` package exists in the monorepo as a publishable npm package with CI validation and a root SKILL.md that an agent can use immediately
**Depends on**: Nothing (first v1.3 phase; no dependency on prior phases)
**Requirements**: PKG-01, PKG-02, PKG-03, SKILL-01
**Success Criteria** (what must be TRUE):
  1. `packages/twentythree-skills/package.json` exists with `type: "module"`, a `bin` entry pointing at the add script, and a `files` whitelist that excludes dev artifacts
  2. `turbo.json` in the package marks it as no-build so `pnpm build` does not attempt to compile it
  3. Running `node scripts/validate-skills.js` from the package root exits 0 when all 22 resource files are present with valid frontmatter, and exits non-zero with a descriptive error otherwise
  4. `skills/SKILL.md` exists and contains auth setup, command syntax, a resource index linking all 22 groups, `--agent` flag docs, and the `allowed-tools: Bash(twentythree *)` declaration
**Plans**: 2 plans
Plans:
- [x] 18-01-PLAN.md — Package scaffold (extend package.json, add turbo.json no-build override, bin/add.js ESM stub, validate-skills.mjs two-gate validator; move placeholder SKILL.md to skills/ via git mv)
- [x] 18-02-PLAN.md — Rewrite skills/SKILL.md with full D-03 content (expanded frontmatter, auth setup, --agent docs, 22-group resource index, meta commands, 2 workflow examples)
**UI hint**: no

### Phase 19: Skill Content
**Goal**: A developer or agent consulting `twentythree-skills` can find complete, accurate documentation for every CLI resource group and copy ready-made workflow patterns
**Depends on**: Nothing (can proceed in parallel with Phase 18; needs only the file locations from PKG-01 scaffold)
**Requirements**: SKILL-02, SKILL-03
**Success Criteria** (what must be TRUE):
  1. `skills/reference/` contains exactly 22 files — one for each resource group (video, category, webinar, analytics, audience, action, collector, comment, player, poll, tag, spot, thumbnail, webhook, app, presentation, protection, session, openupload, site, setting, user)
  2. Each reference file documents at minimum the list, get, create, update, and delete commands (where they exist) with flag names and a usage example
  3. `skills/workflows/` contains 2–3 files; each workflow file shows a multi-step agent automation sequence (e.g. upload-and-publish, webinar-lifecycle)
  4. `validate-skills` script exits 0 against all 22 reference files (valid frontmatter, all groups present)
**Plans**: 6 plans
Plans:
- [x] 19-01-PLAN.md — 7 CRUD reference files (action, audience, collector, comment, poll, spot, tag)
- [x] 19-02-PLAN.md — 8 platform-mgmt reference files (app, openupload, player, presentation, protection, session, setting, site)
- [x] 19-03-PLAN.md — 4 complex reference files (analytics, category, thumbnail, user)
- [x] 19-04-PLAN.md — video.md (25 commands: video + section + subtitle subtopics; terminology notes)
- [x] 19-05-PLAN.md — webinar.md (40+ commands across 9 subtopics) + webhook.md (5 commands)
- [x] 19-06-PLAN.md — workflows/upload-and-publish.md + workflows/webinar-lifecycle.md (SKILL-03)
**UI hint**: no

### Phase 20: Runtime Installer
**Goal**: Any developer can run `npx twentythree-skills add` and have skill files installed into the correct location for their agent runtime without manual file management
**Depends on**: Phase 18 (needs scaffold and file layout from PKG-01/PKG-02)
**Requirements**: INSTALL-01, INSTALL-02, INSTALL-03
**Success Criteria** (what must be TRUE):
  1. Running `npx twentythree-skills add` on a machine with `~/.claude/` present copies skill files into `~/.claude/skills/twentythree/` and prints each destination path
  2. Running `npx twentythree-skills add --project` in a directory installs into `.claude/skills/twentythree/` relative to cwd rather than the global location
  3. Re-running the installer a second time completes without error and produces the same output (idempotent)
  4. On a machine where no supported runtime directory is detected, the command prints a clear message naming the directories it checked and exits 0
**Plans**: 1 plan
Plans:
- [x] 20-01-PLAN.md — Implement bin/add.js runtime installer (detect runtimes, copy skills tree, --project flag, idempotent) + smoke-test verification
**UI hint**: no

### Phase 21: Skills npm Publish
**Goal**: `twentythree-skills` is live on npm at version 1.0.0 and any developer can install or invoke it via npx without cloning the repo
**Depends on**: Phase 20 (installer must be complete before the package is published)
**Requirements**: NPM-01, NPM-02, NPM-03, NPM-04
**Success Criteria** (what must be TRUE):
  1. `npm view twentythree-skills` returns package metadata at version `1.0.0` with `claude`, `claude-code`, `copilot`, `cursor`, and `codex` in the keywords array
  2. `npx twentythree-skills` (bare invocation, no subcommand) runs the installer without error on a clean machine
  3. Pushing a `skills-v*` tag triggers the `publish-skills` job in `release.yml` and publishes the package; pushing a `v*` tag does not trigger the skills publish job
  4. A dry-run CI step (`npm publish --dry-run`) verifies the `NPM_TOKEN` has publish access for `twentythree-skills` before the real publish step executes
**Plans**: 2 plans
Plans:
- [x] 21-01-PLAN.md — Package.json publish config (version 1.0.0, publishConfig, keywords) + release.yml publish-skills job + README canonical invocation
- [x] 21-02-PLAN.md — Human verification checkpoint: review config, verify NPM_TOKEN scope with local dry-run
**UI hint**: no

### Phase 22: SKILL.md Hyperlinks
**Goal**: Every resource group entry in `skills/SKILL.md` is a clickable markdown hyperlink so link-following AI runtimes can navigate directly to the reference file
**Depends on**: Nothing (independent of Phase 21; can land before or with the 1.0.0 publish)
**Requirements**: SKILL-03
**Success Criteria** (what must be TRUE):
  1. All 22 resource group rows in the `skills/SKILL.md` index use `` [`topic`](reference/topic.md) `` hyperlink format — no plain-text topic names remain
  2. Each link resolves to an existing file under `skills/reference/` when opened from the package root
  3. The `validate-skills` script still exits 0 after the SKILL.md edit (no frontmatter or structure regressions)
**Plans**: TBD
**UI hint**: no

### Phase 23: Behavioral Guide Authoring
**Goal**: AI agents reading `twentythree-skills` have access to a verified, cross-cutting behavioral guide that prevents the most common API decision errors before they occur
**Depends on**: Phase 22 (SKILL.md must be in its final hyperlinked form before adding the Behavioral Guide section)
**Requirements**: GUIDE-01, GUIDE-02, GUIDE-03
**Success Criteria** (what must be TRUE):
  1. `skills/guide.md` exists with verified flag names (`--include-analytics` and `open_p` confirmed via live `--agent` output before writing), covering object type differentiation, thumbnail strategy, analytics inclusion, filtering/sorting patterns, webinar creation defaults, timezone handling, and admin link construction
  2. `skills/SKILL.md` contains a "Behavioral Guide" section with a link to `guide.md` placed before the Resource Index table so agents encounter it before scanning commands
  3. At least `webinar.md` has a `> **Note:**` callout at the relevant command for the "no webinar get — use webinar list --search" rule, forward-referencing `guide.md` rather than restating the rule inline
  4. Running `node bin/add.js --project` from the package root lists `guide.md` in the copied file output
**Plans**: 2 plans
Plans:
- [ ] 23-01-PLAN.md — Verify flag names and author skills/guide.md with 8 behavioral rules
- [ ] 23-02-PLAN.md — Update SKILL.md Behavioral Guide section and add inline notes to video.md and webinar.md
**UI hint**: no

### Phase 24: Integration & CI Validation
**Goal**: The `twentythree-skills` package CI gate and installer are consistent with the new file count after `guide.md` is added
**Depends on**: Phase 23 (guide.md must exist before the file count assertion can be updated and verified)
**Requirements**: INT-01
**Success Criteria** (what must be TRUE):
  1. The `npm pack --dry-run` file count assertion in CI is updated from 28 to 29 and passes without error
  2. A full `npm pack --dry-run` run from `packages/twentythree-skills` lists `skills/guide.md` in its output
  3. `validate-skills` script still exits 0 (no regressions from guide.md addition)
**Plans**: TBD
**UI hint**: no

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 3/3 | Complete | 2026-04-14 |
| 2. Auth & Workspaces | v1.0 | 5/5 | Complete | 2026-04-14 |
| 3. Video Core | v1.0 | 5/5 | Complete | 2026-04-14 |
| 4. Category & Webinar Core | v1.0 | 4/4 | Complete | 2026-04-15 |
| 5. Webinar Deep | v1.0 | 5/5 | Complete | 2026-04-15 |
| 6. Engagement & Actions | v1.0 | 4/4 | Complete | 2026-04-15 |
| 6.1. API Spec Workflow (INSERTED) | v1.0 | 1/1 | Complete | 2026-04-15 |
| 7. Analytics & Audience | v1.0 | 4/4 | Complete | 2026-04-16 |
| 8. Platform & Polish | v1.0 | 10/10 | Complete | 2026-04-16 |
| 9. Endpoint Coverage Audit | v1.1 | 3/3 | Complete | 2026-04-16 |
| 10. Package Hygiene | v1.1 | 1/1 | Complete | 2026-04-16 |
| 11. Documentation | v1.1 | 2/2 | Complete | 2026-04-16 |
| 12. READMEs & CHANGELOG | v1.1 | 2/2 | Complete | 2026-04-17 |
| 13. npm Publish | v1.1 | 2/2 | Complete | 2026-04-17 |
| 14. Bug Audit & Fix | v1.2 | 2/2 | Complete | 2026-04-17 |
| 15. Tab Completion | v1.2 | 2/2 | Complete | 2026-04-17 |
| 16. Interactive Prompts | v1.2 | 1/1 | Complete | 2026-04-17 |
| 17. v1.2 Tech Debt Cleanup | v1.2 | 1/1 | Complete | 2026-04-20 |
| 18. Package Foundation | v1.3 | 2/2 | Complete | 2026-04-20 |
| 19. Skill Content | v1.3 | 6/6 | Complete | 2026-04-20 |
| 20. Runtime Installer | v1.3 | 1/1 | Complete | 2026-04-20 |
| 21. Skills npm Publish | v1.4 | 2/2 | Complete   | 2026-04-20 |
| 22. SKILL.md Hyperlinks | v1.4 | 0/? | Not started | - |
| 23. Behavioral Guide Authoring | v1.5 | 0/? | Not started | - |
| 24. Integration & CI Validation | v1.5 | 0/? | Not started | - |
