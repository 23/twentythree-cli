# Features Research: v1.1 Repository Polish & Release

**Domain:** CLI npm publishing, developer-facing README, command reference generation, endpoint coverage audit
**Researched:** 2026-04-16
**Milestone:** v1.1 Repository Polish & Release
**Confidence:** HIGH (verified against official sources, real CLI README comparisons, oclif docs, npm docs, and live codebase analysis)

---

## README (Table Stakes vs Differentiators)

Research basis: direct inspection of gh CLI (github.com/cli/cli), Stripe CLI (github.com/stripe/stripe-cli), fly.io flyctl (github.com/superfly/flyctl), Vercel CLI, and Netlify CLI READMEs.

### Table Stakes

Features present in all five reference CLIs. Missing any of these makes the package feel untrustworthy or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| One-line description | First thing any user reads; GitHub renders it as repo description | Low | Already in package.json: "Terminal access to every TwentyThree API endpoint" — use verbatim |
| Badges row (npm version + license) | Instant trust signal; shows the package is published and live | Low | Add after first publish: `[![npm version](https://img.shields.io/npm/v/twentythree-cli.svg)](https://www.npmjs.com/package/twentythree-cli)` + MIT badge |
| Install command in a fenced code block | Friction-zero entry point; must be copy-paste-ready | Low | `npm install -g twentythree-cli` — exact, tested, the first line of action |
| Prerequisites / requirements | Users need to know Node version before installing | Low | Node >=22.0.0 (from engines field); macOS/Linux/Windows supported via @napi-rs/keyring |
| Quickstart (auth + first real command) | Without this, user guesses; gh, stripe, fly, and netlify all include a "getting started" flow | Low-Med | 5 steps: install → `twentythree auth credentials` → enter domain + token → select workspace → `twentythree video list` |
| Command group overview table | 219 commands is unreadable inline; a table of 22 topic groups with one-line descriptions is the right README granularity | Low | Generated from oclif.manifest.json; NOT a full command listing inline |
| Link to full command reference | README is the entry point, not the destination; stripe and gh both link out to external docs | Low | "Full command reference: docs/commands/" |
| License section | Standard; reinforces package.json MIT value | Low | Single line |

Pattern from gh CLI: short description → badges → installation (multi-platform) → link to documentation → contributing → comparison note. No inline command listing.

Pattern from Stripe CLI: description → installation (multi-platform, including no-package-manager option) → usage section → commands (links only, not inline) → documentation link → telemetry disclosure → feedback → contributing → license.

Pattern from Netlify CLI: logo + badges → TOC → installation → usage (brief syntax) → documentation link → commands link → contributing → development → license.

Pattern from flyctl: 1-paragraph intro → installation → getting started (3-step auth + first command) → app settings → releases → contributing. Short and focused.

**Key signal from all five:** none of them inline all their commands in the README body. All link out to a dedicated docs site or reference page.

### Differentiators

Not universally present, but present in the best-in-class reference CLIs:

| Feature | Value Proposition | Complexity | Present In |
|---------|-------------------|------------|------------|
| Terminal recording (GIF or SVG) | Stripe CLI README includes an animated GIF showing `stripe listen`; makes the tool feel alive immediately | Med | Stripe |
| Auth scope orientation table | TwentyThree has 5 scopes (anonymous, none, read, write, admin); first-time users need this to understand why some commands error without a token | Low | Unique to this project |
| `twentythree doctor` callout | "Not working? Run `twentythree doctor`" — already built; costs one line to surface; real support value | Low | Unique to this project |
| `--agent` flag callout | Positions CLI for AI agent integrations; 1 paragraph in a "For AI agents" subsection | Low | Unique to this project (agentMetadata on all 219 commands) |
| "What can I build?" prose paragraph | 219 commands is disorienting; 3-4 sentences on primary use cases (upload videos, manage categories, run webinars) grounds users | Low | Common in larger CLIs |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Exhaustive command listing inline | 219 commands × flags = thousands of lines; stripe, gh, netlify all link out | Table of 22 topic groups + link to docs/commands/ |
| Homebrew / binary install instructions | Not shipped in v1 | npm global install only; one sentence noting other distributions are not yet available |
| OAuth login instructions | Not built yet (deferred post-v1.1) | Document credential auth only; one sentence noting OAuth is planned |
| CONTRIBUTING.md content inline | Wastes prime above-the-fold real estate | Link to docs/CONTRIBUTING.md |
| Security disclaimer wall about tokens | Kills onboarding momentum | One sentence: "Tokens stored in OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)" |

---

## npm Publish Checklist

Research basis: npm official docs, GitHub Actions provenance docs, npm trusted publishing announcement (GA July 2025), real-world npm publish guides.

### Table Stakes

| Task | Why Required | Complexity | Notes |
|------|--------------|------------|-------|
| `npm login` (or `npm adduser`) | Prerequisite for any publish; requires npm account with verified email | Low | One-time setup |
| `package.json files` field | Whitelist approach controls tarball contents unambiguously | Low | Already present in package.json: `["dist", "bin", "oclif.manifest.json"]` — correct, no changes needed |
| `npm pack --dry-run` before first publish | Verify tarball contents before making package public; catch accidental inclusion of secrets, planning files, source TypeScript, or swagger spec | Low | Run and inspect output; confirm: no `.planning/`, no `src/`, no `specs/`, no `*.sh` |
| `oclif manifest` before publish | Must be fresh so installed CLI has a current command list | Low | Already wired as `postbuild` script; running `npm run build` triggers it automatically |
| First publish: `npm publish --access public` | Unscoped packages can default to restricted on first publish; `--access public` is explicit and safe | Low | `twentythree-cli` is unscoped so this is the correct flag |
| `npm version` + git tag before publish | Creates a versioned git tag; releases without tags cannot be git-bisected | Low | `npm version 1.0.0` — creates tag `v1.0.0` automatically |
| Install verification on clean environment | Confirms end-to-end install before declaring victory | Med | `npm install -g twentythree-cli` on Docker or fresh machine; test `twentythree --version`, `twentythree --help`, `twentythree doctor` |

### Missing `package.json` Fields (package.json currently lacks these)

These are not in the current package.json and must be added before publish:

| Field | Required? | Current Value | Recommended Value |
|-------|-----------|---------------|-------------------|
| `repository` | Strong recommendation; npm renders it on the package page | absent | `{ "type": "git", "url": "git+https://github.com/[org]/twentythree-cli.git" }` |
| `bugs` | npm renders as "Report a bug" link | absent | `{ "url": "https://github.com/[org]/twentythree-cli/issues" }` |
| `homepage` | npm renders as "Homepage" link | absent | GitHub repo URL |
| `keywords` | npm search discoverability | absent | `["cli", "video", "twentythree", "api", "media"]` |
| `author` | Displayed on npm package page | absent | Name + email |

The `engines` field is already present: `"node": ">=22.0.0"` — correct, no change needed.

The `files` field is already present and correct — it excludes `src/`, `specs/`, `.planning/`, all config files by default.

### Differentiators

| Task | Value Proposition | Complexity | Notes |
|------|-------------------|------------|-------|
| `prepack` lifecycle script | Ensures fresh build + manifest in every tarball without manual coordination | Low | `"prepack": "npm run build"` — `postbuild` already runs `oclif manifest`, so chain is: prepack → build → oclif manifest |
| `npm publish --provenance` via GitHub Actions | Links published package to CI workflow via Sigstore; verifiable supply chain | Med | Requires GitHub Actions workflow with `id-token: write` permission + `NPM_CONFIG_PROVENANCE: true` env var. npm Trusted Publishing went GA July 2025. Overkill for first manual publish. Defer to v1.2 |
| `.npmignore` | Not needed; `files` whitelist is already present and takes precedence. Do NOT add `.npmignore` — the two mechanisms interact poorly and `.npmignore` silently overrides `.gitignore` but not `files` | N/A | Explicit: do not add this file |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Publishing `src/` TypeScript source | Bloats package 3-4x; consumers get the CLI, not a library | `files` whitelist already handles this |
| Publishing `specs/` swagger JSON | ~500 KB file consumers don't need; dev-time artifact only | `files` whitelist already excludes it |
| Publishing `.planning/` | Internal artifacts | `files` whitelist already excludes it |
| Using `.npmignore` alongside `files` field | Confusing interaction; `files` whitelist is unambiguous and already present | Remove if one exists; use `files` only |
| Publishing before install verification | If install fails post-publish, public package is broken | `npm pack` + local test first |
| Skipping `npm version` + git tag | Releases become untrackable | Always version before publish |

---

## CLI Reference Docs

Research basis: oclif docs (github.com/oclif/oclif/docs/readme.md), gh CLI manual structure, Netlify CLI (cli.netlify.com), Stripe CLI (docs.stripe.com/cli), fly.io docs structure.

### Table Stakes

| Format | What It Produces | Complexity | Notes |
|--------|-----------------|------------|-------|
| `oclif readme --multi --output-dir docs/commands` | One `.md` file per topic group (22 files for this CLI) from `oclif.manifest.json` | Low — one command | Reads `description`, `examples`, `flags` statics from each command class. Zero hand-writing. Already buildable from existing command files. |
| `oclif readme` (standard, no `--multi`) | Replaces `<!-- commands -->` block in README.md with full command listing | Low | For README inline reference. Requires `<!-- usage -->`, `<!-- commands -->`, `<!-- toc -->` placeholder tags in README.md. |
| `docs/CONTRIBUTING.md` | Contribution guide: clone, build, test, command authoring conventions | Low | Formalizes what's in CLAUDE.md for external contributors |
| `docs/API-SPEC-UPGRADE.md` | How to update the OpenAPI spec and regenerate types | Low | Steps already in CLAUDE.md; formalize for external contributors |
| `CHANGELOG.md` (repo root) | What changed per release; npmjs.com package page renders it | Low | Hand-written for v1.0.0; automate later with `commit-and-tag-version` |

### How oclif readme --multi Works

This is the most consequential tooling decision for docs generation. Confidence: HIGH (verified against oclif source).

- Reads `oclif.manifest.json` (generated by `postbuild: oclif manifest` — already wired)
- Reads these statics from each command class: `description`, `examples`, `flags`, `aliases`
- In `--multi` mode: generates one `.md` file per topic group into `--output-dir`
- The 22 topic groups for this CLI: action, analytics, app, audience, auth, category, collector, comment, openupload, player, poll, presentation, protection, session, setting, site, spot, tag, thumbnail, video, webhook (+ doctor)

Key flags:
- `--multi` — one file per topic group (22 files for this CLI)
- `--output-dir=docs/commands` — where topic files land (default: `docs/`)
- `--aliases` — include command aliases
- `--source-links` — adds links back to TypeScript source files
- `--dry-run` — preview without writing
- `--nested-topics-depth` — for deeply nested topic hierarchies (video/subtitle, video/section, etc.)

**Note:** `agentMetadata` static is not read by `oclif readme` — it reads standard oclif statics only. Since `description`, `examples`, and `flags` are fully populated on all 219 commands, generated output will be complete.

Recommended script addition to package.json:
```json
"readme": "oclif readme --multi --output-dir docs/commands"
```

Regeneration workflow per release:
1. `npm run build` — triggers `oclif manifest` via postbuild
2. `npm run readme` — regenerates docs/commands/*.md
3. Commit `docs/commands/` alongside spec and type changes

### Differentiators

| Format | Value Proposition | Complexity | Notes |
|--------|-------------------|------------|-------|
| `docs/AUTH.md` | The multi-workspace auth model is non-obvious; standalone explainer covering token storage, workspace switching, token refresh, and auth scopes reduces onboarding friction | Low-Med | Covers: `auth credentials` flow, keychain rationale, `workspace switch`, auto-refresh behavior, auth scope table |
| `docs/AGENT.md` | Documents `--agent` flag and agentMetadata format for AI agent integrators | Low | What `--agent` outputs, the agentMetadata schema, how agents consume breadcrumbs; forward-positions the planned skills package |
| Automated README regeneration in CI | Ensures docs/commands/ never drifts from commands in main | Low | GitHub Actions job: build + readme + fail if diff exists |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Hand-writing all 22 topic pages | Thousands of lines; breaks on every spec update | `oclif readme --multi` reads from oclif.manifest.json |
| Separate docs website (Docusaurus, VitePress, GitBook) | Overkill for v1.1; adds hosting, deployment, maintenance overhead | GitHub renders Markdown natively; docs/ folder in repo is sufficient for developer audience |
| Versioned docs per CLI version | Premature; CLI is at v0.1.0/v1.0.0 initial publish | Single docs/ folder; update in place at each release |
| Duplicating README content in docs/ files | Creates two sources of truth that drift | README = entry point + quickstart. docs/ = deep reference. Enforce this boundary. |

---

## Endpoint Coverage Audit

Research basis: live codebase analysis. All 219 command files were inventoried and cross-referenced against the swagger spec. No external tooling required.

### Key Finding: Built-in Audit Capability

Every command file already declares `api_endpoint` in `static agentMetadata`:

```typescript
static agentMetadata = {
  api_endpoint: 'POST /action/add',
  auth_scope: 'write' as const,
  ...
}
```

This means the audit is a grep + diff, not a parsing challenge. The data is already in the codebase.

### Current Coverage State (as of 2026-04-16)

| Metric | Value |
|--------|-------|
| Swagger spec endpoints | 235 |
| Command files | 226 (219 with api_endpoint + 7 without: doctor, index files, etc.) |
| Unique api_endpoint values declared | 215 |
| Swagger endpoints not covered by any command | 25 |
| Command endpoints not in swagger | 5 |

**25 swagger endpoints with no matching command:**

All are `GET /analytics/data/...` timeseries and totals sub-endpoints, plus a cluster of `GET /photo/...` token endpoints:

```
GET /analytics/data/live/weekday/timeseries
GET /analytics/data/live/weekday/totals
GET /analytics/data/usage/devices/timeseries
GET /analytics/data/usage/devices/totals
GET /analytics/data/usage/domains/totals
GET /analytics/data/usage/locations/totals
GET /analytics/data/usage/sourceids/totals
GET /analytics/data/usage/sources/totals
GET /analytics/data/usage/spots/timeseries
GET /analytics/data/usage/spots/totals
GET /analytics/data/usage/traffic/timeseries
GET /analytics/data/usage/traffic/totals
GET /analytics/data/videos/performance/timeseries
GET /analytics/data/videos/performance/totals
GET /analytics/data/videos/published/timeseries
GET /analytics/data/videos/published/totals
GET /analytics/data/videos/weekday/timeseries
GET /analytics/data/videos/weekday/totals
GET /photo/frame
GET /photo/get-replace-token
GET /photo/get-update-token
GET /photo/get-upload-token
POST /photo/delete-upload-token
POST /photo/subtitle/archive/get-progress
POST /photo/update-upload-token
```

**5 command endpoints not matching swagger paths:**

```
GET /user/tokens         — utility command used internally by auth flow, not a standalone endpoint
POST /live/recording/split — may use different swagger path or be undocumented
POST /photo/frame        — note: GET /photo/frame is in swagger; this is POST vs GET discrepancy
interactive              — local utility command, no API endpoint
local                    — local utility command, no API endpoint
```

### Table Stakes Audit Approach

The fastest credible audit is a custom Node.js script that already has 90% of its logic implied by the data shape.

| Step | Approach | Complexity | Notes |
|------|----------|------------|-------|
| Extract spec endpoints | `JSON.parse(swaggerFile).paths` → iterate methods → emit `METHOD /path` | Low | 10 lines of Node |
| Extract command endpoints | `grep -r "api_endpoint:" src/commands` → parse `METHOD /path` values | Low | 10 lines shell or Node |
| Diff the two sets | `Set` operations or `comm` on sorted files | Low | Already done manually above |
| Classify gaps as intentional vs missing | Manual review per gap; analytics sub-endpoints are likely intentional (consolidated); token endpoints need decision | Low-Med | 25 gaps; most are analytics timeseries/totals that may be covered by a single consolidated command |
| Fill confirmed gaps | Add new command files for confirmed missing endpoints | Med | Depends on gap count after classification |

No external tools (specmatic, swagger-coverage-cli, openapi-diff) are needed. Those tools solve "did my server implement this spec?" not "did my CLI wrap this endpoint?" — a different problem domain.

### Differentiator: Automated Gap Check in CI

After the initial audit, a lightweight CI step can catch future regressions:

```json
"audit": "node scripts/audit-coverage.js"
```

The script would:
1. Read swagger paths → Set A
2. Grep command files for api_endpoint values → Set B  
3. Report `A minus B` (missing) and `B minus A` (phantom)
4. Exit 1 if A minus B is non-empty

Complexity: Low. No new dependencies. Uses existing swagger JSON and existing agentMetadata pattern.

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| External coverage tooling (swagger-coverage-cli, specmatic) | These tools measure API test coverage, not CLI command coverage; wrong problem domain | Custom 30-line Node script reading agentMetadata |
| Manual review of all 219 commands | Defeats the purpose of the agentMetadata pattern | Grep-based extraction |
| Skipping the audit and publishing | 25 uncovered endpoints may be intentional OR gaps; publishing without verifying is a promise broken before it's kept | Run audit, classify gaps, fill confirmed ones |

---

## Feature Dependency Map

```
oclif manifest (postbuild, already wired)
  └── oclif readme --multi → docs/commands/ (22 topic .md files, zero hand-writing)
        └── README.md command overview section links to docs/commands/

package.json fields (repository, keywords, bugs, homepage, author)
  └── npm pack --dry-run (verify tarball contents)
        └── install verification (npm install -g locally via npm pack)
              └── npm publish --access public (first public release)
                    └── npm version badge added to README.md
                          └── install verification on clean environment (Docker or fresh machine)

Endpoint audit
  └── grep api_endpoint across src/commands
        └── diff against swagger paths
              └── classify 25 gaps (intentional consolidated vs truly missing)
                    └── fill confirmed gaps (new command files)
                          └── re-run audit → 0 uncovered endpoints confirmed before publish
```

---

## MVP Priority Order for v1.1

**Phase 1 — Endpoint audit (1-2 hours):**
1. Run `grep -r "api_endpoint:" src/commands --include="*.ts"` → extract all covered endpoints
2. Extract swagger paths from `specs/twentythree-api-swagger.json`
3. Diff: 25 swagger paths currently uncovered (see list above)
4. Classify each: analytics timeseries/totals (likely intentional consolidation) vs token endpoints vs true gaps
5. Write commands for confirmed gaps; update `oclif.manifest.json` via `npm run build`

**Phase 2 — Package hygiene (30 min):**
6. Add `repository`, `bugs`, `homepage`, `keywords`, `author` to package.json
7. Add `prepack` script: `"prepack": "npm run build"`
8. Add `readme` script: `"readme": "oclif readme --multi --output-dir docs/commands"`

**Phase 3 — Generate docs (15 min):**
9. `npm run build` (fresh manifest after any gap-filling)
10. `npm run readme` (generates docs/commands/*.md — 22 files, zero hand-writing)

**Phase 4 — Write README.md (2-3 hours):**
11. Description, badges (placeholder until published), prerequisites
12. Install command
13. Quickstart: 5-step auth + first command
14. Command group overview table (22 rows)
15. Link to docs/commands/
16. `twentythree doctor` troubleshooting callout
17. License

**Phase 5 — Write docs/ (1-2 hours):**
18. `docs/CONTRIBUTING.md`
19. `docs/API-SPEC-UPGRADE.md`
20. `CHANGELOG.md` at repo root

**Phase 6 — Publish (1 hour):**
21. `npm pack --dry-run` — verify tarball
22. `npm version 1.0.0`
23. `npm publish --access public`
24. Update README badges with real npm version badge
25. Install verification on clean environment
26. `git push --tags`

**Defer post-v1.1:**
- Terminal GIF recording: good-to-have; blocks on availability of recording environment
- `docs/AUTH.md` and `docs/AGENT.md`: write after skills package research (v1.2)
- Provenance publishing (`--provenance`): requires CI workflow; v1.2

---

## Sources

- gh CLI README structure (installation, documentation, contributing, comparison): https://github.com/cli/cli/blob/trunk/README.md
- Stripe CLI README structure (animated GIF, most-used commands, documentation link): https://github.com/stripe/stripe-cli/blob/master/README.md
- flyctl README structure (install, getting started 3 steps, contributing): https://github.com/superfly/flyctl/blob/master/README.md
- Netlify CLI README structure (badges, TOC, installation, usage, commands link): https://github.com/netlify/netlify-cli/blob/main/README.md
- Vercel CLI README structure (deploy, documentation, contributing): https://github.com/vercel/vercel/blob/main/README.md
- oclif readme command (--multi, --output-dir, markers): https://github.com/oclif/oclif/blob/main/docs/readme.md
- npm package.json fields (name, version, repository, keywords, engines): https://docs.npmjs.com/cli/v11/configuring-npm/package-json/
- npm publish --access public for unscoped packages: https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/
- npm files field vs .npmignore: https://docs.npmjs.com/cli/v9/commands/npm-publish/
- npm provenance (--provenance, id-token: write, NPM_CONFIG_PROVENANCE): https://docs.npmjs.com/generating-provenance-statements/
- npm Trusted Publishing GA (July 2025): https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/
- Live codebase analysis: grep api_endpoint across 219 command files vs 235 swagger endpoints
