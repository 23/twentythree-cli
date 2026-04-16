# Stack Research: v1.1 Repository Polish & Release

**Project:** twentythree-cli
**Milestone:** v1.1 — Repository Polish & Release
**Researched:** 2026-04-16
**Overall confidence:** HIGH — all critical claims verified against official docs and current npm data

---

## New Dependencies Needed

Only one new devDependency is required for this milestone. Everything else is already present.

| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| `tsx` | `^4.21.0` | Run TypeScript scripts directly without a compile step | The endpoint audit script (`scripts/audit-coverage.ts`) and any other utility scripts should run as TypeScript, not require a full tsdown build pass. `tsx` wraps esbuild for fast transpilation. Zero config. Maintained by privatenumber; used widely in the Vite ecosystem. Currently at 4.21.0 (verified npm, 2026-04-16). |

**Runtime dependencies added:** none. The audit, docs generation, and publish workflows are all dev-time operations.

---

## Tooling Decisions

### 1. Endpoint Coverage Audit — Custom Node.js Script (no new tools)

Write `packages/twentythree-cli/scripts/audit-coverage.ts`. It reads two sources already in the repo:

- `specs/twentythree-api-swagger.json` — the ground truth (235 endpoints)
- `static agentMetadata.api_endpoint` fields across all command files — the coverage evidence

All 219 command files declare `static agentMetadata = { api_endpoint, ... }`. The audit script extracts `api_endpoint` values via regex, builds a set, diffs against the spec paths, and prints uncovered endpoints with a coverage percentage.

Run via: `pnpm --filter twentythree-cli exec tsx scripts/audit-coverage.ts`

No external auditing tool is worth adding here. The script is ~60 lines of TypeScript with zero runtime dependencies; it is faster and more targeted than any generic OpenAPI diff tool.

### 2. npm Publish — Granular Token + Changesets

`@changesets/cli` is already in root devDependencies at `^2.30.0`. Use it.

**Critical note on npm tokens (as of December 2025):** npm permanently deprecated and revoked all Classic Tokens on December 9, 2025. `NPM_TOKEN` in GitHub Actions must be a **Granular Access Token** (max 90-day lifetime, requires periodic rotation) — not a classic token. Alternatively, use npm Trusted Publishing (OIDC) which eliminates token management entirely.

**Recommended approach: npm Trusted Publishing (OIDC)**

npm Trusted Publishing is now generally available. It uses OIDC to authenticate directly from GitHub Actions — no NPM_TOKEN secret to store or rotate. Requires npm CLI v11.5.1+ and Node 22.14.0+ (already in the repo's engine requirement).

**Limitation:** `changesets/action` does not natively support OIDC as of April 2026. The workaround is to disable the built-in `publish` parameter and add a separate step that runs `changeset publish` directly (npm auto-detects OIDC credentials when the `id-token: write` permission is set).

GitHub Actions workflow pattern (`.github/workflows/release.yml`):

```yaml
name: Release
on:
  push:
    branches: [main]
permissions:
  contents: write
  pull-requests: write
  id-token: write   # required for OIDC trusted publishing
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: https://registry.npmjs.org
      - run: corepack enable && pnpm install
      - uses: changesets/action@v1
        with:
          # Do NOT use publish: here — use a separate step for OIDC
          createGithubReleases: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - name: Publish to npm (OIDC)
        run: pnpm --filter twentythree-cli exec changeset publish
        env:
          NPM_CONFIG_PROVENANCE: true
```

If OIDC is not available (self-hosted runners, org policy restrictions), fall back to a Granular Access Token stored as `NPM_TOKEN`. Set `NPM_CONFIG_PROVENANCE: true` in both cases.

**package.json fields to add before first publish:**

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ORG/twentythree-cli.git"
  },
  "homepage": "https://github.com/ORG/twentythree-cli#readme",
  "bugs": {
    "url": "https://github.com/ORG/twentythree-cli/issues"
  },
  "keywords": ["twentythree", "cli", "video", "api", "terminal"],
  "publishConfig": {
    "access": "public"
  }
}
```

`publishConfig.provenance: true` is not needed when using `NPM_CONFIG_PROVENANCE=true` in CI or OIDC trusted publishing (provenance is automatic). Include it if you want the package.json itself to document the intent.

The existing `"files": ["/bin", "/dist", "/oclif.manifest.json"]` allowlist is correct. **No `.npmignore` needed** — `files` is already an allowlist. Run `npm pack --dry-run` from `packages/twentythree-cli/` to verify what gets included before the first publish.

### 3. CLI Reference Documentation — `oclif readme` (already installed)

`oclif` is already in devDependencies at `^4.23.0`. The `oclif readme` command is bundled inside it. No new package needed.

`oclif readme` reads `oclif.manifest.json` (built by `postbuild: oclif manifest`) and replaces HTML comment placeholders in a README:

- `<!-- toc -->` — table of contents
- `<!-- usage -->` — install + basic usage
- `<!-- commands -->` — full command table

**Multi-file mode** (`--multi`) produces one markdown file per topic in an output directory. With 219 commands across 24 topics, multi-file output is the right choice — 24 topic files are navigable; a single 8,000-line README is not.

```bash
# Single README (add placeholders to README.md first)
pnpm --filter twentythree-cli exec oclif readme --readme-path ../../README.md

# Multi-file docs (produces docs/video.md, docs/category.md, etc.)
pnpm --filter twentythree-cli exec oclif readme --multi --output-dir docs
```

Add a `docs` script to root `package.json`:

```json
"docs": "pnpm --filter twentythree-cli build && pnpm --filter twentythree-cli exec oclif readme --multi --output-dir packages/twentythree-cli/docs/commands"
```

**Integration note:** `oclif readme` reads `static description`, `static flags`, `static examples`, and `static args` from each command class. The `static agentMetadata` field is separate and does not appear in generated output — this is correct. agentMetadata is for machine consumption; oclif readme output is for human consumption.

### 4. README Conventions

**Two README files, different audiences:**

| File | Audience | Content |
|------|----------|---------|
| `/README.md` (repo root) | GitHub visitors, contributors | What it is, install, quickstart, link to `docs/` |
| `packages/twentythree-cli/README.md` | npm page visitors | Install one-liner, auth setup, one example, link to GitHub for full docs |

The root README is rendered as the GitHub repository homepage. The package README is rendered on the npm package page. They serve different audiences and should not be identical.

**oclif README markers** — add these to the README(s) so `oclif readme` can populate them:

```markdown
<!-- toc -->
<!-- tocstop -->

<!-- usage -->
<!-- usagestop -->

<!-- commands -->
<!-- commandsstop -->
```

**Standard badges for a CLI README (no new tooling):**

```markdown
[![npm version](https://img.shields.io/npm/v/twentythree-cli.svg)](https://www.npmjs.com/package/twentythree-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

Shields.io badges require no tooling — just markdown img tags. Add them manually.

---

## What NOT to Add

| Rejected Addition | Why Not |
|-------------------|---------|
| `typedoc` | Generates TypeScript API reference from source code. Wrong tool — we need CLI help output, not type docs. `oclif readme` already does this correctly. |
| `docsify` / `vitepress` | Full documentation site frameworks. Markdown files in `docs/` committed to the repo are sufficient and simpler for a CLI tool. No website infrastructure needed for v1.1. |
| `openapi-diff` | Compares two OpenAPI spec files (e.g., v1 vs v2 of the spec). Does not compare spec-to-implementation. Not useful for coverage auditing. |
| `specmatic` | Java-based contract testing tool. Heavyweight, wrong problem domain. |
| `semantic-release` | Infers version from commit message format (requires conventional commits discipline across all contributors). Changesets is explicit and PR-driven — better fit for this project. |
| Custom agentMetadata parser for docs | Would duplicate what `oclif readme` already does from `static description/flags/examples`. Unnecessary. |
| `ts-node` | `tsx` is faster, simpler, zero-config. `ts-node` has more configuration surface area and is slower for scripts. |
| `@types/node` (if not already present) | Check — already needed for `fs`, `path`, `process` in command files. Verify it is in devDependencies; do not add twice. |

---

## Integration Notes

**tsx + existing scripts:** The `update-api-spec.sh` shell script does not need tsx — it is bash. The new `scripts/audit-coverage.ts` is the only script that needs tsx. If the audit script is kept simple (pure fs + regex, no complex typing), it can be written as plain `.js` to avoid adding tsx entirely.

**oclif readme + manifest freshness:** `oclif readme` reads the built `oclif.manifest.json`. Always run `pnpm build` (which runs `postbuild: oclif manifest`) before running `oclif readme`. If the manifest is stale, the docs will reflect the previous build state.

**changesets + monorepo:** `@changesets/cli` is already at the monorepo root. Run `pnpm changeset` from the root to create changeset files. The `changeset publish` command publishes only packages whose version has been bumped. The `twentythree-cli` package is the only publishable package in this monorepo (root is `"private": true`).

**npm pack dry run before first publish:** Run from `packages/twentythree-cli/`:

```bash
npm pack --dry-run
```

Verify the output contains `/bin`, `/dist`, `/oclif.manifest.json`, and the README but does NOT contain source TypeScript files, spec files, or test files. If the docs folder needs to be included in the npm package, add `"/docs"` to the `files` array.

**OIDC trusted publishing setup:** Before the OIDC workflow runs for the first time, configure the trusted publisher relationship on npmjs.com:
1. Log into npmjs.com
2. Navigate to the package (must exist — first publish may need to be manual or via Granular Token)
3. Under "Publishing access" → "Add a publisher" → select GitHub Actions + repo + workflow
4. After that, subsequent publishes from the configured workflow use OIDC automatically

The first publish cannot use OIDC trusted publishing because the package does not yet exist on npm and the trusted publisher relationship cannot be configured until the package page exists. For the first publish: use a Granular Access Token manually or run `npm publish --access public` locally from `packages/twentythree-cli/` after `pnpm build`.

---

## Sources

- tsx npm (v4.21.0 confirmed): https://www.npmjs.com/package/tsx
- npm Trusted Publishing (OIDC) generally available: https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/
- npm Trusted Publishers docs: https://docs.npmjs.com/trusted-publishers/
- npm Classic Token deprecation (Dec 9, 2025): https://dev.to/zhangjintao/from-deprecated-npm-classic-tokens-to-oidc-trusted-publishing-a-cicd-troubleshooting-journey-4h8b
- npm Generating provenance statements: https://docs.npmjs.com/generating-provenance-statements/
- changesets/action OIDC issue (not natively supported): https://github.com/changesets/action/issues/515
- changesets with pnpm: https://pnpm.io/using-changesets
- @changesets/cli npm (v2.30.0): https://www.npmjs.com/package/@changesets/cli
- oclif readme command docs: https://github.com/oclif/oclif/blob/main/docs/readme.md
- oclif readme.ts source (--multi, --output-dir, --nested-topics-depth flags): https://github.com/oclif/oclif/blob/main/src/commands/readme.ts
- oclif package npm (v4.23.0): https://www.npmjs.com/package/oclif
