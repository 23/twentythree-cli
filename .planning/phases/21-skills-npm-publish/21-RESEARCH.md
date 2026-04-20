# Phase 21: Skills npm Publish - Research

**Researched:** 2026-04-20
**Domain:** npm publish configuration, GitHub Actions CI/CD, pnpm monorepo publish
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Keep bare-invocation-only behavior — `bin/add.js` always runs the installer regardless of arguments. No explicit arg routing, no help flag, no unknown-arg errors. `npx twentythree-skills` is the canonical form documented in README. `npx twentythree-skills add` continues to work silently (add is ignored).
- **D-02:** `publish-skills` job runs: validate-skills test → dry-run (NPM_TOKEN check) → real publish. No post-publish smoke-test job in this phase (future requirement).
- **D-03:** Existing `publish` job gets guarded with `if: "!startsWith(github.ref, 'refs/tags/skills-v')"` so it only fires on `v*` tags, not `skills-v*` tags.
- **D-04:** `publish-skills` job fires only on `skills-v*` tags (separate trigger condition from the existing `v*` job).
- **D-05:** Use `pnpm publish --no-git-checks --provenance` for skills — matches CLI publish pattern; provenance adds Sigstore attestation at zero cost.
- **D-06:** Dry-run step uses `npm publish --dry-run` from `packages/twentythree-skills` — verifies NPM_TOKEN has publish access for this package. If dry-run fails, job fails and real publish is skipped.
- **D-07:** Bump `packages/twentythree-skills/package.json` version from `0.1.0` → `1.0.0` in a manual commit before pushing the `skills-v1.0.0` tag. No CI version rewriting.
- **D-08:** Add `"publishConfig": { "access": "public" }` to `packages/twentythree-skills/package.json`.
- **D-09:** Expand keywords array to include: `claude`, `claude-code`, `copilot`, `cursor`, `codex`, `ai-agent` (in addition to existing `ai`, `skills`, `twentythree`, `cli`, `agent`).

### Claude's Discretion
- Exact step names and `needs:` dependency ordering within the `publish-skills` job
- README wording for canonical invocation form (`npx twentythree-skills`)
- Whether `publish-skills` runs `pnpm install --frozen-lockfile` or can skip install (no build step, no deps)

### Deferred Ideas (OUT OF SCOPE)
- Post-publish smoke-test job for skills (verifies `npx twentythree-skills` resolves after publish)
- Installer post-success message with "start a new session" hint
- Changesets integration
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NPM-01 | User can publish `twentythree-skills` to npm at version 1.0.0 by pushing a `skills-v*` tag — requires `publishConfig.access: "public"` in `packages/twentythree-skills/package.json` and a skills publish step wired into `.github/workflows/release.yml` | CI job structure, tag trigger mechanics, `publishConfig` field documented below |
| NPM-02 | `packages/twentythree-skills/package.json` includes runtime-specific keywords (`claude`, `claude-code`, `copilot`, `cursor`, `codex`, `ai-agent`) for improved npm discoverability | Simple JSON field edit; keywords verified against D-09 |
| NPM-03 | `bin/add.js` handles bare `npx twentythree-skills` invocation without requiring the `add` subcommand; README documents the canonical invocation form | `bin/add.js` already handles bare invocation (no argument check on argv[2]); README needs update from `npx twentythree-skills add` to `npx twentythree-skills` |
| NPM-04 | CI includes a dry-run step that verifies `NPM_TOKEN` has publish access for `twentythree-skills` before the real publish step executes | `npm publish --dry-run` mechanics; token scope caveat documented below |
</phase_requirements>

---

## Summary

Phase 21 is a configuration and CI phase — no new features, no build steps. All four requirements reduce to edits in three files: `packages/twentythree-skills/package.json`, `.github/workflows/release.yml`, and `packages/twentythree-skills/README.md`.

The `bin/add.js` binary already handles bare `npx twentythree-skills` invocation correctly. The file checks `process.argv.includes('--project')` but never requires a subcommand — passing `add` (or any other word) silently does nothing harmful. Only the README needs updating to document the canonical form without `add`.

The most significant risk in this phase is the NPM_TOKEN. npm classic tokens were permanently revoked on December 9, 2025. Any `NPM_TOKEN` secret that predates that date will be a Granular Access Token (the only type now available). Granular tokens can be scoped to specific packages — if the existing token was created for `twentythree-cli` only, a new Granular Access Token scoped to `twentythree-skills` (or both packages) must be created before the first `skills-v*` tag push. The dry-run step (D-06) serves as the detection mechanism for this token-scope problem.

The `--provenance` flag (D-05) requires `permissions: id-token: write` in the CI job. The existing `publish` job in `release.yml` does NOT have this permission set. The new `publish-skills` job must add it explicitly, or `pnpm publish --provenance` will fail with an OIDC token error.

**Primary recommendation:** Three-task plan — (1) package.json edits + README, (2) `release.yml` edits, (3) manual version bump commit + tag verification walkthrough.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| npm publish config (`publishConfig`, `keywords`, version) | Package manifest | — | Field values in `package.json` control registry behavior |
| Bare-npx invocation (`npx twentythree-skills`) | bin script (`bin/add.js`) | README documentation | Invocation already works; only docs need updating |
| Tag-triggered CI publish | GitHub Actions (`release.yml`) | — | Job trigger and step ordering are CI concerns only |
| NPM_TOKEN scope verification | CI dry-run step | Human (token creation) | Dry-run detects scope mismatch; human must create corrected token if needed |
| Provenance attestation | CI job permissions + `pnpm publish --provenance` | npm registry (Sigstore) | Requires `id-token: write` permission on the CI job |

---

## Standard Stack

### Core

| Library / Tool | Version | Purpose | Why Standard |
|---------------|---------|---------|--------------|
| `pnpm publish` | (workspace pnpm version) | Publish package to npm | Already used for `twentythree-cli`; `--no-git-checks` + `--provenance` flags match D-05 |
| `npm publish --dry-run` | npm bundled with Node 22 | Verify token access before real publish | npm CLI's built-in dry-run mode resolves auth without uploading tarball |
| `actions/setup-node@v4` | v4 | Node setup with `registry-url` for `NODE_AUTH_TOKEN` injection | Already used in existing `publish` job; same pattern required for `publish-skills` |
| `pnpm/action-setup@v4` | v4 | pnpm setup in GitHub Actions | Already used in existing `publish` job |

No new npm packages needed. This phase is pure configuration.

---

## Architecture Patterns

### System Architecture Diagram

```
git push skills-v1.0.0 tag
        │
        ▼
release.yml on: push → tags: ['v*', 'skills-v*']
        │
        ├──► publish job (existing)
        │    condition: if NOT startsWith(ref, 'refs/tags/skills-v')
        │    fires on: v* tags only
        │    (unchanged behavior)
        │
        └──► publish-skills job (new)
             condition: if startsWith(ref, 'refs/tags/skills-v')
             fires on: skills-v* tags only
                  │
                  ▼
             Step 1: pnpm install --frozen-lockfile
                  │
                  ▼
             Step 2: pnpm --filter twentythree-skills test --run
             (runs validate-skills.mjs — Gate 1 + Gate 2)
                  │
                  ▼
             Step 3: npm publish --dry-run (from packages/twentythree-skills)
             env: NODE_AUTH_TOKEN = NPM_TOKEN
             (verifies token scope — fails here if token lacks access to twentythree-skills)
                  │
                  ▼
             Step 4: pnpm publish --no-git-checks --provenance
             working-directory: packages/twentythree-skills
             env: NODE_AUTH_TOKEN = NPM_TOKEN
             (Sigstore attestation generated; package lands on registry)
```

### Recommended Project Structure (unchanged)

No structural changes. All edits are to existing files:

```
.github/workflows/
└── release.yml           # Add publish-skills job; guard existing publish job

packages/twentythree-skills/
├── package.json          # version 1.0.0, publishConfig, expanded keywords
└── README.md             # Update canonical invocation from 'add' to bare form
```

### Pattern 1: Tag-Guarded Job Dispatch

**What:** Two jobs in one workflow, each guarded by a tag prefix check, so `v*` and `skills-v*` tags never double-trigger.

**When to use:** Monorepos with multiple independently-released packages sharing one workflow file.

**Example:**

```yaml
# Source: CONTEXT.md D-03 / D-04 (verified against existing release.yml pattern)

on:
  push:
    tags:
      - 'v*'
      - 'skills-v*'

jobs:
  publish:
    if: "!startsWith(github.ref, 'refs/tags/skills-v')"
    runs-on: ubuntu-latest
    # ... existing steps unchanged ...

  publish-skills:
    if: startsWith(github.ref, 'refs/tags/skills-v')
    runs-on: ubuntu-latest
    permissions:
      id-token: write   # REQUIRED for --provenance
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
      - name: Validate skills package
        run: pnpm --filter twentythree-skills test --run
      - name: Dry-run publish (verify NPM_TOKEN scope)
        working-directory: packages/twentythree-skills
        run: npm publish --dry-run
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - name: Publish to npm
        working-directory: packages/twentythree-skills
        run: pnpm publish --no-git-checks --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Pattern 2: `publishConfig` for Public Scoped or Unscoped Packages

**What:** Declare publish-time overrides inside `package.json` so the package can be developed in a private monorepo but published as public.

**When to use:** Any npm package that needs `--access public` without requiring the flag on every publish command.

**Example:**

```json
// Source: npm docs [CITED: docs.npmjs.com/creating-and-publishing-unscoped-public-packages]
{
  "publishConfig": {
    "access": "public"
  }
}
```

### Pattern 3: Bare npx Binary Invocation

**What:** When a package declares a single `bin` entry, `npx <package-name>` invokes that binary directly with no subcommand needed.

**When to use:** Single-purpose installer/bootstrapper tools that do one thing.

**Current state of `bin/add.js`:**

```js
// Source: packages/twentythree-skills/bin/add.js (read directly)
// The script does NOT check argv[2] for a required 'add' keyword.
// process.argv.includes('--project') is the only argv check.
// Therefore 'npx twentythree-skills' already works identically to 'npx twentythree-skills add'.
// No code change needed — README change only.
const isProject = process.argv.includes('--project')
```

### Anti-Patterns to Avoid

- **Missing `id-token: write` permission:** `pnpm publish --provenance` silently falls through to a non-provenance publish or fails with OIDC error. Add `permissions: id-token: write` to the `publish-skills` job explicitly.
- **Forgetting `registry-url` in `setup-node`:** Without `registry-url: 'https://registry.npmjs.org'`, the `NODE_AUTH_TOKEN` env var is not injected into `.npmrc` — npm auth fails even with a valid token.
- **Using `pnpm publish` for dry-run instead of `npm publish --dry-run`:** `pnpm publish --dry-run` uses pnpm's resolver and may behave differently than the real npm registry path. The decision (D-06) specifically uses `npm publish --dry-run` for the verification step.
- **Tagging before bumping the version:** Pushing `skills-v1.0.0` before `package.json` reads `1.0.0` will publish `0.1.0` with the tag. Bump version in a commit, then tag that commit.
- **Omitting the guard on the existing `publish` job:** Without the `if:` condition on the existing job, pushing `skills-v1.0.0` triggers CLI publish, causing a version conflict or accidental publish of an unchanged CLI package.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Provenance attestation | Custom signing workflow | `pnpm publish --provenance` + `id-token: write` | Sigstore/Rekor integration is built into npm CLI; hand-rolling is complex and fragile |
| Token scope verification | Custom npm registry API call | `npm publish --dry-run` | npm CLI's own dry-run exercises the same auth path as the real publish |
| Package access control | `--access public` CLI flag on every publish | `publishConfig.access: "public"` in package.json | Config in manifest is canonical and survives any automation change |

---

## Runtime State Inventory

> Not applicable — this is a greenfield CI/config phase with no rename or migration.

---

## Common Pitfalls

### Pitfall 1: NPM_TOKEN Scope Mismatch (HIGH RISK)

**What goes wrong:** The existing `NPM_TOKEN` secret in GitHub repository settings was created for `twentythree-cli` only. Granular Access Tokens on npm can be restricted to specific packages. Pushing `skills-v1.0.0` triggers the job but the dry-run step (or real publish step) fails with 403.

**Why it happens:** npm revoked all classic (automation) tokens on December 9, 2025. Only Granular Access Tokens remain. A Granular Token created for `twentythree-cli` before this phase will not have publish access to `twentythree-skills` (a different package name).

**How to avoid:** Before pushing any `skills-v*` tag, run `npm publish --dry-run` locally from `packages/twentythree-skills` with the same token to confirm access. If it fails, create a new Granular Token with publish access for `twentythree-skills` (or update the existing token's package scope). Update the `NPM_TOKEN` secret in GitHub repo settings.

**Warning signs:** CI dry-run step fails with `403 Forbidden` or `You do not have permission to publish "twentythree-skills"`.

**Source:** [CITED: github.blog/changelog/2025-12-09-npm-classic-tokens-revoked]

---

### Pitfall 2: `--provenance` Fails Without `id-token: write` Permission

**What goes wrong:** `pnpm publish --provenance` requires the GitHub Actions job to have `permissions: id-token: write` to obtain an OIDC token from GitHub. Without this permission, the publish either fails or silently publishes without provenance.

**Why it happens:** The existing `publish` job in `release.yml` has no explicit `permissions` block (defaults to read). The new `publish-skills` job must declare it explicitly.

**How to avoid:** Add `permissions: id-token: write` at the job level in the `publish-skills` job definition.

**Warning signs:** `Error: Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable` in GitHub Actions log.

**Source:** [CITED: docs.npmjs.com/generating-provenance-statements]

---

### Pitfall 3: Workflow Trigger Mismatch — Double-Publishing

**What goes wrong:** The existing `on: push: tags: ['v*']` trigger also matches `skills-v*` (because `v*` glob matches any tag containing `v`). Without the `if:` guard on the existing `publish` job, pushing `skills-v1.0.0` triggers both jobs.

**Why it happens:** `v*` is a glob pattern and `skills-v1.0.0` contains `v` — actually, `v*` matches strings starting with `v`, so `skills-v1.0.0` does NOT match `v*` (it starts with `s`). However, updating the trigger to add `skills-v*` requires careful testing.

**The actual safe state:** The existing trigger `tags: ['v*']` already excludes `skills-v*` because `v*` only matches tags beginning with the letter `v`. But the trigger section must be updated to add `skills-v*` for the new job to fire at all. Updating to `tags: ['v*', 'skills-v*']` is safe because the job-level `if:` guards correctly isolate which job runs.

**How to avoid:** Update `on.push.tags` to `['v*', 'skills-v*']` and add `if:` guards to both jobs as specified in D-03/D-04.

**Warning signs:** Pushing `skills-v*` tag and seeing neither job triggered (if trigger not updated) or both jobs triggered (if guards missing).

---

### Pitfall 4: README Documents Wrong Invocation Form

**What goes wrong:** README currently says `npx twentythree-skills add` — the old form that implies `add` is a required subcommand. After publish, users may think the bare form doesn't work, or copy the `add` form into automation scripts unnecessarily.

**Why it happens:** Historical artifact from when the binary was named around the `add` action.

**How to avoid:** Update both occurrences in README (global install and project-local install sections) to use `npx twentythree-skills` as the canonical form. Note that `--project` flag remains the mechanism for project-local installs.

---

### Pitfall 5: pnpm install May or May Not Be Needed

**What's uncertain:** `twentythree-skills` has zero runtime dependencies (no `dependencies` block). The validate-skills script is pure Node.js built-ins. Whether `pnpm install --frozen-lockfile` is required before the test step is discretionary (CONTEXT.md "Claude's Discretion").

**Recommendation:** Include `pnpm install --frozen-lockfile` for consistency with the existing `publish` job pattern and to ensure workspace hoisting resolves correctly. The step is fast (no packages to install) and adding it ensures the job does not break if a dev dependency is later added.

---

## Code Examples

### Updated `packages/twentythree-skills/package.json` (diff view)

```json
// Source: read directly from packages/twentythree-skills/package.json
// Changes per D-07, D-08, D-09:
{
  "name": "twentythree-skills",
  "version": "1.0.0",                          // was 0.1.0
  "description": "AI agent skills for the TwentyThree CLI",
  "license": "MIT",
  "author": "TwentyThree",
  "repository": {
    "type": "git",
    "url": "https://github.com/23/twentythree-cli.git"
  },
  "bugs": {
    "url": "https://github.com/23/twentythree-cli/issues"
  },
  "homepage": "https://github.com/23/twentythree-cli#readme",
  "type": "module",
  "engines": {
    "node": ">=22.0.0"
  },
  "bin": {
    "twentythree-skills": "./bin/add.js"
  },
  "files": [
    "/bin",
    "/skills",
    "/README.md"
  ],
  "scripts": {
    "test": "node scripts/validate-skills.mjs"
  },
  "publishConfig": {                             // NEW per D-08
    "access": "public"
  },
  "keywords": [                                  // expanded per D-09
    "ai",
    "skills",
    "twentythree",
    "cli",
    "agent",
    "claude",
    "claude-code",
    "copilot",
    "cursor",
    "codex",
    "ai-agent"
  ]
}
```

### README.md — Canonical Invocation Change

```markdown
// Current (incorrect for this phase):
npx twentythree-skills add

// Correct canonical form per D-01 / NPM-03:
npx twentythree-skills

// Project-local remains:
npx twentythree-skills --project
```

### `release.yml` — Complete Updated File

```yaml
# Source: read directly from .github/workflows/release.yml + decisions D-03/D-04/D-05/D-06
name: Release

on:
  push:
    tags:
      - 'v*'
      - 'skills-v*'       # NEW — enables publish-skills job trigger

jobs:
  publish:
    if: "!startsWith(github.ref, 'refs/tags/skills-v')"   # NEW guard per D-03
    runs-on: ubuntu-latest
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
      - name: Run tests
        run: pnpm --filter twentythree-cli test --run
      - name: Build
        run: pnpm --filter twentythree-cli run build
      - name: Publish to npm
        working-directory: packages/twentythree-cli
        run: pnpm publish --no-git-checks --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

  publish-skills:
    if: startsWith(github.ref, 'refs/tags/skills-v')      # per D-04
    runs-on: ubuntu-latest
    permissions:
      id-token: write     # REQUIRED for --provenance (Sigstore OIDC)
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
      - name: Validate skills package
        run: pnpm --filter twentythree-skills test --run
      - name: Dry-run publish (verify NPM_TOKEN scope)     # per D-06
        working-directory: packages/twentythree-skills
        run: npm publish --dry-run
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - name: Publish to npm
        working-directory: packages/twentythree-skills
        run: pnpm publish --no-git-checks --provenance     # per D-05
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

  smoke-test:
    needs: publish
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Wait for registry propagation
        run: |
          for i in 1 2 3 4 5; do
            npm view twentythree-cli@${GITHUB_REF_NAME#v} version 2>/dev/null && break
            echo "Attempt $i: not yet available, waiting 15s..."
            sleep 15
          done
      - name: Install globally
        run: npm install -g twentythree-cli
      - name: Verify CLI works
        run: twentythree --version
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| npm classic automation tokens | Granular Access Tokens only | December 9, 2025 | Any `NPM_TOKEN` from before that date is revoked; must use Granular token scoped to specific packages or all packages |
| `--provenance` optional | `--provenance` strongly recommended for supply-chain security | npm v9+ / 2023 | Requires `id-token: write` in CI job; adds Sigstore transparency log entry |
| `npm publish --access public` per-command | `publishConfig.access: "public"` in manifest | npm has supported this for years | Cleaner; survives automation changes |

**Deprecated/outdated:**
- npm classic (automation) tokens: revoked December 9, 2025 — replaced by Granular Access Tokens with 90-day max expiry
- `npx twentythree-skills add` form: still works but undocumented after this phase — bare `npx twentythree-skills` is canonical

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| GitHub Actions | CI publish | ✓ (via repo) | — | — |
| `NPM_TOKEN` secret | All publish steps | Unknown — must verify scope | — | Create new Granular Token scoped to `twentythree-skills` |
| npm (Node 22 bundled) | Dry-run step | ✓ (Node 22 in CI) | npm 10.x | — |
| pnpm | Build + publish | ✓ (pnpm/action-setup@v4) | (workspace version) | — |

**Missing dependencies with no fallback:**
- None (all tools are available in CI).

**Missing dependencies requiring human action before tagging:**
- `NPM_TOKEN` scope for `twentythree-skills`: must be verified locally via `npm publish --dry-run` before pushing `skills-v*` tag. If token was created for `twentythree-cli` only, a new Granular Token is needed.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node.js built-in (validate-skills.mjs) — no test runner |
| Config file | none |
| Quick run command | `pnpm --filter twentythree-skills test --run` |
| Full suite command | `pnpm --filter twentythree-skills test --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NPM-01 | `publishConfig.access: "public"` present in package.json | manual verification | `node -e "const p=JSON.parse(require('fs').readFileSync('packages/twentythree-skills/package.json')); console.assert(p.publishConfig?.access==='public')"` | ✅ package.json exists |
| NPM-02 | Keywords include `claude`, `claude-code`, `copilot`, `cursor`, `codex`, `ai-agent` | manual verification | `node -e "const p=JSON.parse(require('fs').readFileSync('packages/twentythree-skills/package.json')); ['claude','claude-code','copilot','cursor','codex','ai-agent'].forEach(k=>console.assert(p.keywords.includes(k),k))"` | ✅ package.json exists |
| NPM-03 | Bare `npx twentythree-skills` invocation works (no subcommand) | smoke | `node packages/twentythree-skills/bin/add.js` (exits 0 on machine with agent runtime, exits 0 with no-runtime message otherwise) | ✅ bin/add.js exists |
| NPM-04 | CI dry-run step present in release.yml | manual | `grep -q 'npm publish --dry-run' .github/workflows/release.yml` | ✅ release.yml exists |

### Sampling Rate

- Per task commit: `pnpm --filter twentythree-skills test --run`
- Per wave merge: `pnpm --filter twentythree-skills test --run` + manual YAML lint of release.yml
- Phase gate: All assertions above pass before tag push

### Wave 0 Gaps

None — existing test infrastructure covers phase requirements. No new test files needed.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The existing `NPM_TOKEN` in GitHub repo secrets is a Granular Access Token (classic tokens revoked Dec 9, 2025) | Common Pitfalls / Environment | If token is stale/absent, first publish attempt fails — caught by dry-run step |
| A2 | `npm publish --dry-run` with a Granular token will fail with 403 if the token lacks access to `twentythree-skills` — this is the intended early-detection mechanism | Code Examples (dry-run step) | If dry-run does NOT accurately reflect token scope, the real publish step will be the first point of failure |
| A3 | The existing `publish` job has no `permissions` block, so defaults to restricted — adding `permissions: id-token: write` only to `publish-skills` is safe and does not affect CLI publish | Architecture Patterns (Pattern 1) | Negligible — explicitly declaring permissions per job is a GitHub Actions best practice |

**Claims A1 and A2 require human verification of the NPM_TOKEN before pushing the release tag.**

---

## Open Questions

1. **NPM_TOKEN scope for `twentythree-skills`**
   - What we know: The token was created for the monorepo, but Granular tokens can be scoped to specific package names
   - What's unclear: Whether the token was scoped to `twentythree-cli` only or all packages on the account
   - Recommendation: Planner should include a pre-flight step in the human UAT instructions: run `npm publish --dry-run` from `packages/twentythree-skills` locally with `NPM_TOKEN` before pushing `skills-v1.0.0`.

2. **`pnpm install` step in `publish-skills`**
   - What we know: Zero runtime dependencies; validate-skills.mjs uses only Node built-ins; marked as Claude's Discretion
   - What's unclear: Whether the workspace resolution in pnpm requires install to correctly find the package
   - Recommendation: Include the `pnpm install --frozen-lockfile` step for consistency and forward-compatibility.

---

## Sources

### Primary (HIGH confidence)
- `.github/workflows/release.yml` — Read directly; existing job is the template for `publish-skills`
- `packages/twentythree-skills/package.json` — Read directly; current config baseline
- `packages/twentythree-skills/bin/add.js` — Read directly; confirmed bare-invocation works without code change
- `packages/twentythree-skills/scripts/validate-skills.mjs` — Read directly; confirmed test command
- [pnpm publish docs](https://pnpm.io/cli/publish) — Confirmed `--provenance` and `--dry-run` flags are supported

### Secondary (MEDIUM confidence)
- [npm docs: generating provenance statements](https://docs.npmjs.com/generating-provenance-statements/) — Confirmed `id-token: write` permission requirement
- [GitHub Changelog: npm classic tokens revoked Dec 9 2025](https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/) — Confirmed Granular Token requirement
- [GitHub Changelog: npm security update Nov 2025](https://github.blog/changelog/2025-11-05-npm-security-update-classic-token-creation-disabled-and-granular-token-changes/) — Token transition timeline

### Tertiary (LOW confidence — training knowledge)
- `npm publish --dry-run` behavior with Granular tokens: described by npm docs as "simulate publish" — assumed to exercise auth path; not verified with a live token test [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tools already in use; no new packages
- Architecture: HIGH — all edits traced to specific locked decisions; existing release.yml is the direct template
- Pitfalls: HIGH — NPM token revocation is a documented, confirmed external event (Dec 2025); `id-token: write` requirement is from official npm docs
- Token scope behavior: MEDIUM — dry-run auth mechanics assumed to match real publish (standard expectation, not live-tested)

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (stable domain; npm token policy unlikely to change rapidly)
