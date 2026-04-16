# Feature Landscape: npm Publish, README, and docs/ for twentythree-cli

**Domain:** CLI npm publishing, developer-facing README, command reference generation
**Researched:** 2026-04-16
**Milestone:** v1.1 Repository Polish & Release
**Supersedes:** Previous FEATURES.md (v1.0 — API surface features; those features are shipped)

---

## Scope of This Research

This file focuses exclusively on the new v1.1 deliverables:

- (A) A well-crafted npm CLI README
- (B) A developer-facing docs/ structure for a 219-command CLI
- (C) The npm publish experience for this oclif CLI

---

## Part A: npm CLI README

### Table Stakes

Features users expect in any published CLI README. Missing any of these makes the package feel untrustworthy or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| One-line description | First thing any user reads; GitHub renders it as repo description | Low | Already in package.json: "Terminal access to every TwentyThree API endpoint" — use verbatim |
| Badges row (npm version + license) | Instant trust signal; shows the package is published and actively maintained | Low | Add after first npm publish: `[![npm version](https://img.shields.io/npm/v/twentythree-cli.svg)](https://www.npmjs.com/package/twentythree-cli)` + MIT badge |
| Install command in a fenced code block | Friction-zero entry point; must be copy-paste-ready | Low | `npm install -g twentythree-cli` — exact, tested, first line of action |
| Prerequisites / requirements | Users need to know Node version and OS support before installing | Low | Node >=18 (LTS); macOS/Linux/Windows supported; @napi-rs/keyring installs via NAPI-RS without extra system tools |
| Quickstart (auth + first real command) | Without this, user guesses; gh, stripe, and railway all include a "getting started" flow | Low-Med | ~5 steps: install → `twentythree auth credentials` (enter domain + token) → select workspace → `twentythree video list` → see output |
| Command group overview table | 219 commands is unreadable; a table of 22 topic groups with one-line descriptions is the right granularity | Low | Generated content (see oclif readme below); NOT a full command listing |
| Link to full command reference | README is the entry point, not the destination; stripe and gh both link out | Low | "Full command reference: [docs/](docs/)" |
| License section | Standard; reinforces the package.json MIT value | Low | One line |

### Differentiators

Not universally expected, but elevates the README above the median npm CLI package.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Terminal recording (GIF or SVG) | Stripe CLI README includes an animated GIF; makes the tool feel alive and immediately understandable without reading | Med | Record a `twentythree video list` output; tools: `vhs` (charmbracelet/vhs), `asciinema`, or a static terminal screenshot. Defer if time-constrained |
| Auth scope orientation | TwentyThree API has 5 scopes (anonymous, none, read, write, admin); first-time users need this to understand why some commands error | Low | Small 5-row table: scope → what it means → example command |
| `twentythree doctor` callout | "Not working? Run `twentythree doctor`" — already built; costs one line to surface; saves support overhead | Low | Single line + code block in the troubleshooting/quickstart section |
| "What can I build?" prose paragraph | 219 commands is disorienting; 3-4 sentences on primary use cases (upload videos, manage categories, monitor webinars) grounds users in the tool's value | Low | Write once; rarely changes |
| `--agent` flag callout | Positions the CLI for AI agent integrations; one paragraph in a "For AI agents" subsection | Low | Relevant now that agentMetadata exists on all 219 commands; forward-positions the planned skills package |

### Anti-Features

Explicitly do NOT include in the README.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Exhaustive command listing in README body | 219 commands × flags is thousands of lines; stripe and gh both link out instead of inline-listing | Table of 22 topic groups; link to docs/ for full reference |
| Homebrew / standalone binary install instructions | Not supported in v1; listing unshipped install paths creates confusion and support burden | npm global install only; note other distribution methods are not available |
| OAuth login instructions (`twentythree auth login`) | Not built yet; deferred to a later milestone | Document credential auth only; one sentence noting OAuth is planned |
| CONTRIBUTING.md content in README body | Wastes prime real estate above the fold | Link to docs/CONTRIBUTING.md |
| Security disclaimer wall about tokens | Kills onboarding momentum; condescending to developers | One sentence: "Bearer tokens are stored in your OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)" |

---

## Part B: docs/ Structure for a 219-Command CLI

### Table Stakes

| File | Why Required | Complexity | Notes |
|------|--------------|------------|-------|
| `docs/commands/` (one .md per topic group) | Any CLI with >20 commands needs a dedicated reference; 219 commands across 22 groups is the definitive case | Med — but automatable | Use `oclif readme --multi --output-dir docs/commands` — generates 22 .md files (video.md, webinar.md, auth.md, etc.) automatically from oclif.manifest.json. Do NOT hand-write these. |
| `docs/CONTRIBUTING.md` | Required for any open-source or collaborator-facing repo; sets expectations for contributions | Low | Contents: clone, `pnpm install`, `pnpm --filter twentythree-cli build`, `pnpm --filter twentythree-cli test --run`, command authoring conventions (static agentMetadata pattern, term-map.ts), `pnpm update-api-spec` workflow |
| `docs/API-SPEC-UPGRADE.md` | Unique to this project; the workflow is already documented in CLAUDE.md — formalize in docs/ for external contributors | Low | Steps: `pnpm update-api-spec` → read diff output → `tsc --noEmit` for new errors → fix command files → verify → commit. Cross-link with CLAUDE.md |

### Differentiators

| File | Value Proposition | Complexity | Notes |
|------|-------------------|------------|-------|
| `CHANGELOG.md` (repo root) | npm users and contributors look for this to understand what changed between releases; npmjs.com package page links to it | Low | Write a minimal hand-crafted CHANGELOG for v0.1.0 initial release; list the 9 phases and major feature areas. Automate later with `commit-and-tag-version` if commit discipline is maintained (git log shows conventional commits: `chore:`, `docs:`, `fix:` patterns already) |
| `docs/AUTH.md` | The credential-based multi-workspace auth model is non-obvious; a standalone explainer covering token storage, workspace switching, token refresh, and auth scopes reduces onboarding friction | Low-Med | Covers: `auth credentials` flow, keychain storage rationale, `workspace switch`, auto-refresh behavior, auth scope table |
| `docs/AGENT.md` | Documents the `--agent` flag and agentMetadata format for external AI agent integrators; the protocol is already implemented on all 219 commands | Low | Documents: what `--agent` outputs, the agentMetadata schema, how agents should consume breadcrumbs; forward-positions the planned skills package |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Hand-writing all 22 command topic pages | 219 commands × flags = thousands of lines of maintenance burden; breaks immediately on any spec update | Use `oclif readme --multi`; it reads from oclif.manifest.json which is already generated by `postbuild` |
| Separate docs website (Docusaurus, GitBook, VitePress) | Overkill for v1.1; adds hosting, deployment, and maintenance overhead with zero marginal benefit for a developer audience | GitHub renders Markdown natively; docs/ folder in repo is sufficient |
| Versioned docs per CLI version | Premature; CLI is v0.1.0 on npm; API surface is stable | Single docs/ folder; update in place at each release |
| Duplicating README content in docs/ files | Creates two sources of truth that drift | README = entry point + quickstart. docs/ = deep reference. Enforce this boundary |

### oclif readme Command — Key Infrastructure Detail

This is the most consequential tooling decision for docs generation. Confidence: HIGH (verified against oclif source and official docs).

**How it works:**
- Reads `oclif.manifest.json` (already generated by `postbuild: oclif manifest` in package.json)
- Reads static properties from command classes: `description`, `examples`, `flags`, `aliases`
- In `--multi` mode: generates one `.md` file per topic group into `--output-dir`
- In standard mode: replaces content between `<!-- commands -->` and `<!-- commandsstop -->` in README.md

**Key flags:**
- `--multi` — generates one file per topic group (22 files for this CLI)
- `--output-dir=docs/commands` — where topic files land
- `--aliases` — include command aliases
- `--source-links` — adds links back to TypeScript source files
- `--dry-run` — preview without writing

**Prerequisites:**
- `oclif.manifest.json` must exist and be current (already ensured by `postbuild`)
- Command `description`, `examples`, and `flags` statics must be populated (they are on all 219 commands)

**Recommended script addition to package.json:**
```json
"readme": "oclif readme --multi --output-dir docs/commands"
```

Note: `agentMetadata` static is not read by `oclif readme` — it reads standard oclif statics only. But since standard statics are fully populated, generated output will be complete.

**Regeneration workflow (for each release):**
1. `npm run build` (runs `oclif manifest` via postbuild)
2. `npm run readme` (regenerates docs/commands/*.md)
3. Commit docs/commands/ alongside spec and type changes

---

## Part C: npm Publish Experience for This oclif CLI

### Table Stakes

| Task | Why Required | Complexity | Notes |
|------|--------------|------------|-------|
| `npm login` | Prerequisite for any publish | Low | Requires npm account with verified email |
| `package.json files` field | Controls what's in the published tarball; whitelist approach is unambiguous and recommended over .npmignore | Low | See recommended value below |
| `npm pack --dry-run` before first publish | Verify tarball contents before making public; catch accidental inclusion of secrets, source TS, or internal planning files | Low | Run, inspect output, confirm no `.planning/`, no `src/`, no `specs/` |
| `npm version patch` (or minor/major) | Bumps version in package.json, creates git tag; oclif recommends this as the standard pre-publish version step | Low | Current version is 0.1.0; first public release should be 1.0.0 |
| `oclif manifest` before publish | Must be fresh so installed CLI has a current command list; already in `postbuild` so `npm run build` triggers it | Low | Ensure `oclif.manifest.json` is in the `files` field |
| First publish: `npm publish --access public` | Unscoped packages default to public; adding `--access public` explicitly is safe and recommended for first publish | Low | `twentythree-cli` is unscoped so this is the correct flag |
| Install verification on clean environment | Required by PROJECT.md; confirms end-to-end install works | Med | `npm install -g twentythree-cli` on a fresh machine or Docker container; run `twentythree --version`, `twentythree --help`, `twentythree doctor` |

### Differentiators

| Task | Value Proposition | Complexity | Notes |
|------|-------------------|------------|-------|
| `prepack` lifecycle script | Ensures fresh build and manifest are always in the tarball without manual coordination | Low | `"prepack": "npm run build"` — `postbuild` already runs `oclif manifest`, so this chain is: prepack → build → postbuild (manifest) |
| `engines` field in package.json | npm shows a warning if the installing user's Node version is too old; prevents confusing runtime errors | Low | `"engines": { "node": ">=18.0.0" }` |
| `repository`, `bugs`, `homepage` fields in package.json | npmjs.com package page renders these as "Repository", "Homepage", and "Report a bug" links | Low | These fields are currently absent from package.json |
| `keywords` field in package.json | Improves npm search discoverability | Low | Currently `null`; add: `["cli", "video", "twentythree", "api", "media"]` |
| `npm publish --provenance` | Links the published package to the GitHub Actions workflow that produced it via Sigstore | Med | Requires CI-based publish workflow; overkill for first manual publish. Defer to v1.2 |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Publishing `src/` TypeScript source | Bloats package by ~3-4x; consumers get the built CLI, not a library | Whitelist only `dist/`, `bin/`, `oclif.manifest.json` in `files` |
| Publishing `.planning/` directory | Internal planning artifacts of no value to consumers | `files` whitelist naturally excludes this |
| Publishing `specs/` (swagger JSON) | ~500 KB file consumers don't need; it's a dev-time artifact | Excluded by `files` whitelist |
| Using `.npmignore` alongside `files` field | These two mechanisms interact poorly; `files` whitelist is unambiguous | Use `files` field only; drop .npmignore if one exists |
| Publishing before install verification | If install verification fails post-publish, you've already made the package public with a broken release | Run `npm pack`, local install test, then publish |
| Skipping `npm version` + git tag | Releases become untrackable; no git tag = no way to git-bisect a regression | Always run `npm version X.Y.Z` before `npm publish` |

### Recommended `package.json` additions

**`files` field:**
```json
"files": [
  "dist",
  "bin",
  "oclif.manifest.json"
]
```
This excludes: `src/`, `specs/`, `.planning/`, `*.sh`, `tsconfig.json`, `tsdown.config.ts`, `vitest.config.ts`.

**`engines` field:**
```json
"engines": {
  "node": ">=18.0.0"
}
```

**`repository` field:**
```json
"repository": {
  "type": "git",
  "url": "https://github.com/[org]/twentythree-cli.git"
}
```

**`keywords` field:**
```json
"keywords": ["cli", "video", "twentythree", "api", "media"]
```

---

## Feature Dependencies

```
oclif manifest (postbuild, already wired)
  └── oclif readme --multi → docs/commands/ (22 topic files)
        └── README.md command overview section links to docs/commands/
              └── npm publish (npmjs.com renders README as package landing page)
                    └── install verification

package.json files field
  └── npm pack --dry-run (verify tarball)
        └── npm publish --access public
              └── install verification (npm install -g twentythree-cli on clean env)
```

---

## MVP for v1.1 (Priority Order)

**Phase 1 — Package hygiene (30 min):**
1. Add `files`, `engines`, `keywords`, `repository`, `bugs`, `homepage` to package.json
2. Add `prepack` script
3. Add `readme` script (`oclif readme --multi --output-dir docs/commands`)

**Phase 2 — Generate docs (15 min):**
4. Run `npm run build` (fresh manifest)
5. Run `npm run readme` (generate docs/commands/*.md — 22 files, zero hand-writing)

**Phase 3 — Write README.md (2-3 hours):**
6. Description, badges (placeholder until published), install, prerequisites
7. Quickstart: 5-step auth + first command flow
8. Topic group overview table (22 rows: group name + one-line description)
9. Link to docs/commands/
10. `twentythree doctor` troubleshooting callout
11. License

**Phase 4 — Write docs/ (2-3 hours):**
12. `docs/CONTRIBUTING.md` (clone, build, test, command authoring conventions)
13. `docs/API-SPEC-UPGRADE.md` (formalize CLAUDE.md workflow for external contributors)
14. `CHANGELOG.md` at repo root (hand-written for v1.0.0 initial release)

**Phase 5 — Publish (1 hour):**
15. `npm pack --dry-run` — verify tarball
16. `npm version 1.0.0` (or keep 0.1.0 for first publish; discuss with owner)
17. `npm publish --access public`
18. Add real npm version badge to README.md
19. Install verification on clean environment
20. `git push --tags`

**Defer:**
- Terminal GIF recording: good-to-have; do not block publish on it
- `docs/AUTH.md` and `docs/AGENT.md`: write after skills package lands (v1.2)
- Provenance (`--provenance`): requires CI; v1.2 item

---

## Sources

- oclif readme command (--multi, --output-dir, markers): https://oclif.io/docs/releasing/ and https://github.com/oclif/oclif/blob/main/README.md
- oclif manifest purpose: https://github.com/oclif/oclif/blob/main/docs/manifest.md
- Stripe CLI README structure (animated GIF, most-used commands section): https://github.com/stripe/stripe-cli/blob/master/README.md
- GitHub CLI reference structure (hierarchical topic groups): https://cli.github.com/manual/gh_help_reference
- Railway CLI README patterns (quickstart, multi-platform install): https://github.com/railwayapp/cli/blob/master/README.md
- npm publish files field vs .npmignore: https://github.com/npm/cli/wiki/Files-&-Ignores
- npm scoped/unscoped --access public: https://docs.npmjs.com/cli/v11/using-npm/developers/
- shields.io npm version badge: https://shields.io/badges/npm-version
- conventional-changelog for CHANGELOG automation: https://github.com/conventional-changelog/conventional-changelog
