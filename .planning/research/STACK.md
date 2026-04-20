# Stack Research

**Domain:** npm publishing — standalone ESM skills package from pnpm monorepo
**Researched:** 2026-04-20
**Confidence:** HIGH

## Context

`packages/twentythree-skills` is a complete, no-build ESM package. The task is purely publishing
configuration — no new runtime code, no new dependencies. The existing `twentythree-cli` publish
workflow (tag-triggered GitHub Actions, `NODE_AUTH_TOKEN`, `pnpm publish --no-git-checks`) is the
proven pattern to replicate.

---

## Current package.json State (Already Correct)

The following fields in `packages/twentythree-skills/package.json` are already correct and need
no change:

| Field | Current Value | Status |
|-------|--------------|--------|
| `name` | `"twentythree-skills"` | Correct |
| `version` | `"0.1.0"` | Correct — use semver independently from twentythree-cli |
| `type` | `"module"` | Correct — ESM only, no CJS needed |
| `bin.twentythree-skills` | `"./bin/add.js"` | Correct — enables `npx twentythree-skills` |
| `files` | `["/bin", "/skills", "/README.md"]` | Correct — whitelist approach |
| `engines.node` | `">=22.0.0"` | Correct — matches monorepo constraint |
| `license` | `"MIT"` | Correct |

---

## Recommended Stack Additions

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `pnpm publish` (existing) | pnpm 9.x | Publish command | Already works for `twentythree-cli`; `--no-git-checks` bypasses monorepo root/tag mismatch; `--access public` required for scoped packages (not needed here but harmless to add) |
| GitHub Actions (existing) | — | CI publish trigger | `release.yml` already wires `NODE_AUTH_TOKEN → NPM_TOKEN` secret; extend it with a second job for the skills package |
| npm provenance (`--provenance`) | npm 9.5+ / Node 22 | Signed build attestation | Single flag addition; links the published tarball to the exact GitHub Actions run that produced it; npm registry displays a provenance tab on the package page; requires `id-token: write` permission on the job |

### Supporting Libraries

No new runtime dependencies needed. The package uses Node built-ins only (`node:fs`, `node:path`, `node:os`, `node:url`).

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | — | — | The installer is 103 lines of Node built-ins; adding any dependency would require a lockfile and create install friction for `npx` invocations |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `scripts/validate-skills.mjs` (existing) | Validates skills file structure before publish | Already wired as `"test"` script in package.json; run in CI before publish step |
| `.npmignore` (do NOT add) | Exclude files from tarball | Using `files` whitelist is simpler and explicit; `.npmignore` overrides `files` and is easy to misconfigure — avoid |

---

## package.json Changes Required

### 1. Add `publishConfig`

```json
"publishConfig": {
  "access": "public",
  "registry": "https://registry.npmjs.org"
}
```

`access: public` is required for any package published to npm if you want `npm publish` to succeed
without the `--access public` flag on the CLI. It is also self-documenting intent.

### 2. Verify `bin` shebang

`bin/add.js` already has `#!/usr/bin/env node` on line 1. This is required for npm to make the
binary executable on install. No change needed.

### 3. No `main` or `exports` field needed

This package has no importable surface — it is a pure binary package. Omitting `main`/`exports`
is correct. npm does not require them for bin-only packages.

---

## bin Script Pattern

The current `bin` field maps the package name to `./bin/add.js`:

```json
"bin": {
  "twentythree-skills": "./bin/add.js"
}
```

This means:
- `npx twentythree-skills` invokes `bin/add.js` directly
- `npm install -g twentythree-skills` makes `twentythree-skills` available as a global command
- There is no `add` subcommand in the bin mapping

**Important:** `npx twentythree-skills add` passes `add` as `process.argv[2]` to the script.
The current script checks for `--project` flag but does not explicitly handle an `add` positional.
The `add` argument is silently ignored. This is safe but should be clarified in README docs.
Recommend documenting the correct invocation as `npx twentythree-skills` (bare), or add explicit
argv handling to accept `add` as a no-op alias for the default behavior.

No bin structure changes needed. The single binary-per-package pattern is correct for this use
case.

---

## CI Publish Step

### Tag Strategy

Use a separate tag prefix to keep the two packages' release cadences independent:

```
skills-v0.1.0   →  triggers publish of twentythree-skills@0.1.0
v1.4.0          →  triggers publish of twentythree-cli@1.4.0 (existing)
```

The existing `release.yml` triggers on `v*` tags — extend it with a second job that conditions
on `skills-v*` tags, and add an `if:` guard to the existing CLI publish job.

### Recommended release.yml Extension

Add a second job to `.github/workflows/release.yml`:

```yaml
publish-skills:
  if: startsWith(github.ref, 'refs/tags/skills-v')
  runs-on: ubuntu-latest
  permissions:
    contents: read
    id-token: write   # required for --provenance
  steps:
    - uses: actions/checkout@v4

    - uses: pnpm/action-setup@v4

    - uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: 'pnpm'
        registry-url: 'https://registry.npmjs.org'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Validate skills
      run: pnpm --filter twentythree-skills test --run

    - name: Publish to npm
      working-directory: packages/twentythree-skills
      run: pnpm publish --no-git-checks --access public --provenance
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Key decisions:

- `permissions.id-token: write` — required by npm provenance; tells GitHub to issue an OIDC
  token so npm can verify the build origin
- `--provenance` — attaches a Sigstore-signed attestation; zero cost; npm registry shows a
  Provenance tab linking to the exact workflow run
- `--no-git-checks` — standard in this monorepo; bypasses npm's check that the git tag matches
  the package version (it won't, because the tag is `skills-v0.1.0` not `0.1.0`)
- `working-directory: packages/twentythree-skills` — publish from the package dir, consistent
  with the existing CLI publish step
- Validate skills before publish — fail fast, do not publish broken content

### Guard the Existing publish Job

Add an `if:` guard to the existing `publish` job so it only runs on CLI tags:

```yaml
publish:
  if: startsWith(github.ref, 'refs/tags/v') && !startsWith(github.ref, 'refs/tags/skills-v')
```

This prevents the CLI publish from triggering when a `skills-v*` tag is pushed.

---

## files Whitelist (Already Correct)

```json
"files": ["/bin", "/skills", "/README.md"]
```

This whitelist is correct and complete. npm always includes `package.json`, `LICENSE`, and
`CHANGELOG.md` regardless of `files`, so those need no explicit listing.

What is correctly excluded (not in `files`):
- `scripts/validate-skills.mjs` — dev-only validation; not needed by consumers
- `turbo.json` — monorepo build config; irrelevant to consumers
- Any `.planning/` artifacts

Verify the tarball contents before pushing the release tag:

```bash
cd packages/twentythree-skills && pnpm pack --dry-run
```

---

## Version Strategy

| Package | Version | Strategy |
|---------|---------|----------|
| `twentythree-cli` | 1.x.x | CLI commands; follows feature milestones |
| `twentythree-skills` | 0.x.x | Content package; bump minor for new skill files, patch for content edits; major bump if skills format changes incompatibly |

The two packages version independently. Do not couple their versions.

Initial publish: `0.1.0` (already set) — correct for a first release.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Separate `skills-v*` tag prefix | Single `v*` tag triggering both publishes | Only if both packages always release together — they won't; skills content updates independently of CLI command changes |
| `files` whitelist | `.npmignore` | Never for this package — `files` already exists and `.npmignore` would silently override it |
| `--provenance` flag | No provenance | No reason to skip; zero cost; improves package trust signal on npm registry |
| `working-directory: packages/twentythree-skills` for publish | `pnpm publish -F twentythree-skills` | Both work; working-directory is consistent with the existing CLI publish step in this repo |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `.npmignore` | `files` whitelist already exists; `.npmignore` takes precedence over `files` and is easy to misconfigure | `files` field in package.json |
| Coupling skills version to CLI version | Skills content changes on a different cadence from CLI commands | Independent semver per package |
| `npm publish` (not `pnpm publish`) | Monorepo uses pnpm; `npm publish` from a pnpm workspace can fail to resolve workspace-protocol dependencies | `pnpm publish --no-git-checks` |
| Documenting invocation as `npx twentythree-skills add` | `add` is not an explicit subcommand; it is silently ignored by the script | Document as `npx twentythree-skills` or add explicit `add` argv handling |

---

## Installation (for consumers)

```bash
# Install globally, then run to install skills into detected runtimes
npm install -g twentythree-skills
twentythree-skills

# Or run without installing
npx twentythree-skills
```

---

## Sources

- `packages/twentythree-skills/package.json` — current state verified by reading source — HIGH confidence
- `packages/twentythree-skills/bin/add.js` — shebang and argv handling verified by reading source — HIGH confidence
- `.github/workflows/release.yml` — existing CLI publish pattern verified by reading source — HIGH confidence
- npm provenance docs: https://docs.npmjs.com/generating-provenance-statements — MEDIUM confidence (pattern confirmed from training data; WebSearch unavailable in this session)
- GitHub Actions `id-token: write` for OIDC provenance — MEDIUM confidence (standard GitHub Actions pattern, confirmed from training data Aug 2025)

---
*Stack research for: twentythree-skills npm publish*
*Researched: 2026-04-20*
