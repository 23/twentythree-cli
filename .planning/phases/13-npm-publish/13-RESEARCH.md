# Phase 13: npm Publish - Research

**Researched:** 2026-04-17
**Domain:** GitHub Actions CI/CD, npm publishing, pnpm monorepo, package distribution
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** CI-first approach — set up the GitHub Actions workflow, bump version to `1.0.0`, push a `v1.0.0` tag, and let CI handle the publish. No local `npm publish` from a dev machine.
- **D-02:** Workflow steps: run test suite → build → `npm publish --access public` → smoke test (install from npm in a clean environment and verify `twentythree --version`).
- **D-03:** Trigger: tag push only — pattern `v*.*.*`. No manual dispatch, no workflow_dispatch.
- **D-04:** Use `npm version 1.0.0` to bump `package.json`, create the version commit, and create the local tag automatically. Then `git push && git push --tags`.
- **D-05:** Tag format: `v`-prefixed — `v1.0.0`. Workflow trigger pattern: `tags: ['v*']`.
- **D-06:** Publish at `1.0.0` — the `v1.0` milestone is internally complete. `package.json` currently shows `0.1.0`; bump to `1.0.0` as the first step.
- **D-07:** Classic npm automation token (not OIDC/provenance — deferred to v1.2). Token stored as `NPM_TOKEN` in GitHub repository secrets. Workflow injects it via `NODE_AUTH_TOKEN` in the npm publish step.

### Claude's Discretion
- GitHub Actions runner version and Node.js version to use in CI (match project's `engines.node >= 22`)
- Whether to add a `pnpm` setup step or use `npm ci` in the workflow
- Exact smoke test implementation (separate job, `npx --yes` to avoid cache, or a matrix step)
- Whether to include `npm view twentythree-cli` output in the smoke test job summary

### Deferred Ideas (OUT OF SCOPE)
- OIDC trusted publishing (npm provenance) — explicitly deferred to v1.2
- `workflow_dispatch` trigger for manual re-publish — not chosen; tag push only
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PUBLISH-01 | Package published to npm as `twentythree-cli` at version `1.0.0` with `--access public` | D-01 through D-07 decisions; npm publish workflow pattern; `twentythree-cli` name confirmed unregistered |
| PUBLISH-02 | `npm install -g twentythree-cli` and `twentythree --version` verified on a clean environment after publish | Smoke test job pattern in separate GitHub Actions job using `needs:` dependency |
| PUBLISH-03 | GitHub Actions workflow publishes the package on git tag push | Tag-trigger workflow pattern: `on: push: tags: ['v*']` |
</phase_requirements>

---

## Summary

Phase 13 requires creating a GitHub Actions workflow that triggers on git tag push (`v*`), runs the test suite, builds the CLI, publishes to npm, then verifies the publish in a clean environment. No `.github/workflows/` directory exists yet — the workflow file is created fresh.

The project uses a pnpm monorepo (`pnpm-workspace.yaml` at root, CLI at `packages/twentythree-cli/`). The CLI's `prepack` lifecycle script calls `pnpm build`, which means pnpm must be available in CI at publish time. The cleanest approach is an explicit `pnpm build` step (which triggers `postbuild` → `oclif manifest`) followed by `pnpm publish --no-git-checks --access public` from inside the package directory. Using `pnpm publish` avoids npm/pnpm interop issues and the `--no-git-checks` flag handles GitHub's detached HEAD state during tag checkouts.

The smoke test runs as a dependent job (`needs: publish`) that installs the CLI globally in a clean runner and verifies `twentythree --version` exits 0. A brief polling wait is needed for npm registry CDN propagation (typically 30-60 seconds) before the smoke test install.

**Primary recommendation:** Single workflow file `.github/workflows/release.yml` with two jobs: `publish` (test → build → pnpm publish) and `smoke-test` (needs: publish, installs globally, verifies `--version`).

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Version bump | Developer machine | — | `npm version 1.0.0` run locally before tag push |
| Build & pack | CI (publish job) | — | `pnpm build` in workflow; prepack fires via publish lifecycle |
| npm authentication | CI secrets | — | `NPM_TOKEN` → `NODE_AUTH_TOKEN` via `setup-node` registry-url config |
| Publish to registry | CI (publish job) | — | `pnpm publish --no-git-checks --access public` |
| Smoke test | CI (smoke-test job) | — | Separate job with `needs: publish` on clean runner |
| Tag trigger | GitHub Actions | — | `on: push: tags: ['v*']` |

---

## Standard Stack

### Core

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| `actions/checkout` | v4 | Checkout repo in CI | Official GitHub action, always v4 |
| `pnpm/action-setup` | v4 | Install pnpm in CI | Official pnpm action; v4 is stable, widely used in 2024-2025 |
| `actions/setup-node` | v4 | Install Node.js + configure npm registry auth | Sets `registry-url` which writes `.npmrc` with auth token; required for `NODE_AUTH_TOKEN` to work |
| `pnpm publish` | (pnpm CLI) | Publish the package | Avoids npm/pnpm prepack interop; `--no-git-checks` flag handles detached HEAD |
| `npm install -g` | (npm) | Smoke test install | Standard global install for verification |

### Supporting

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| `npm version` | (npm) | Bump version + create tag locally | Run on dev machine before pushing; creates version commit + tag atomically |
| `npm view` | (npm) | Poll for registry propagation in smoke test | Poll before `npm install -g` to avoid install failure during CDN propagation |
| `ubuntu-latest` | GitHub-hosted runner | CI execution environment | Standard runner; clean env for each job |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `pnpm publish` | `npm publish` | `npm publish` triggers prepack which calls `pnpm build` — pnpm must still be installed; `pnpm publish --no-git-checks` is simpler |
| `pnpm publish` | `pnpm publish --filter twentythree-cli` | Both work; `cd packages/twentythree-cli && pnpm publish` is more explicit about which package directory |
| `on: push: tags` trigger | `on: release: types: [published]` | Release trigger requires creating a GitHub release object separately; tag push is simpler per D-03 |
| `actions/setup-node` registry-url auth | Manually writing `.npmrc` | `setup-node` with `registry-url` auto-writes correct `.npmrc`; manual `.npmrc` is error-prone |

---

## Architecture Patterns

### System Architecture Diagram

```
Developer Machine
  └─ npm version 1.0.0          (bumps package.json + creates version commit + local tag)
       └─ git push && git push --tags

GitHub (tag: v1.0.0)
  └─ Triggers: .github/workflows/release.yml
       └─ Job: publish (ubuntu-latest)
            ├─ actions/checkout@v4
            ├─ pnpm/action-setup@v4  (installs pnpm 10.x)
            ├─ actions/setup-node@v4  (node 22, registry-url → writes .npmrc with NODE_AUTH_TOKEN)
            ├─ pnpm install --frozen-lockfile  (from repo root)
            ├─ pnpm --filter twentythree-cli test --run
            ├─ pnpm --filter twentythree-cli run build  (tsdown + oclif manifest)
            └─ pnpm publish --no-git-checks --access public
                 (run from packages/twentythree-cli/)
                 env: NODE_AUTH_TOKEN = ${{ secrets.NPM_TOKEN }}

       └─ Job: smoke-test (ubuntu-latest)  [needs: publish]
            ├─ actions/setup-node@v4  (node 22, no registry-url needed)
            ├─ Poll: npm view twentythree-cli@1.0.0 (retry up to 5x, 15s apart)
            ├─ npm install -g twentythree-cli
            └─ twentythree --version  (must exit 0)
```

### Recommended Project Structure

```
.github/
└── workflows/
    └── release.yml       # Tag-triggered publish + smoke test

packages/
└── twentythree-cli/
    ├── package.json      # version bumped to 1.0.0 before push
    └── ...
```

### Pattern 1: Tag-Triggered Workflow with Two Jobs

**What:** A GitHub Actions workflow that fires on `v*` tag push, runs a `publish` job, then a dependent `smoke-test` job.

**When to use:** Anytime a clean separation between "publish" and "verify publish" is needed. Separate jobs run on fresh runners, ensuring smoke test is truly independent.

**Example:**

```yaml
# Source: https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages
# + https://dev.to/receter/automatically-publish-your-node-package-to-npm-with-pnpm-and-github-actions-22eg
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install --frozen-lockfile

      - run: pnpm --filter twentythree-cli test --run

      - run: pnpm --filter twentythree-cli run build

      - name: Publish to npm
        working-directory: packages/twentythree-cli
        run: pnpm publish --no-git-checks --access public
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
            npm view twentythree-cli@1.0.0 version 2>/dev/null && break
            echo "Attempt $i: not yet available, waiting 15s..."
            sleep 15
          done

      - run: npm install -g twentythree-cli

      - run: twentythree --version
```

**Critical notes:**
- `registry-url` MUST be set in `setup-node` — it writes the `.npmrc` that maps `NODE_AUTH_TOKEN` to the registry. Without it, `NODE_AUTH_TOKEN` is ignored and publish fails with `ENEEDAUTH`. [VERIFIED: GitHub Docs, dev.to/receter article]
- `--no-git-checks` is required with `pnpm publish` in CI — GitHub runners check out code in detached HEAD state, and pnpm refuses to publish from a detached HEAD without this flag. [VERIFIED: pnpm docs, dev.to/receter article]
- `--access public` is required on first publish for unscoped packages to avoid defaulting to private. [VERIFIED: npm docs]
- Build step must be explicit (`pnpm run build`) rather than relying on `prepack` lifecycle, because `prepack` calls `pnpm build` — pnpm is available in CI, so it would work, but explicit build makes the workflow more readable and debuggable.

### Pattern 2: npm version + git push Release Flow

**What:** Standard Node.js release flow using `npm version` to atomically bump `package.json`, create a version commit, and create a local tag.

**When to use:** All version bumps for this project per D-04.

**Example:**
```bash
# Run from packages/twentythree-cli/
cd packages/twentythree-cli
npm version 1.0.0
# Commit message: "v1.0.0"; tag: "v1.0.0" created locally

# Push from repo root
cd ../..
git push && git push --tags
```

**Note:** `npm version` must be run from `packages/twentythree-cli/` so it updates the package-level `package.json`. The tag is created at repo root level regardless, which is fine for the GitHub Actions trigger.

### Anti-Patterns to Avoid

- **Not setting `registry-url` in `setup-node`:** Without `registry-url: 'https://registry.npmjs.org'`, the `.npmrc` auth entry is not written and `NODE_AUTH_TOKEN` has no effect. Publish fails with `ENEEDAUTH`.
- **Using `npm publish` when `prepack` calls `pnpm build`:** `npm publish` triggers `prepack`, which calls `pnpm build`. If pnpm is set up in the workflow this works, but it is implicit. Prefer `pnpm run build` explicitly followed by `pnpm publish --no-git-checks`.
- **Smoke-testing without a propagation wait:** npm CDN propagation can take 30-90 seconds. Running `npm install -g twentythree-cli` immediately after the publish job completes will often fail with 404 before the package is available globally.
- **Running `npm version` from repo root on a monorepo:** Running `npm version` at the monorepo root updates root `package.json` (which is `private: true` and not published). Always run from `packages/twentythree-cli/`.
- **Using `pnpm install --frozen-lockfile` in smoke test job:** Smoke test job has no repo checkout; it only needs `npm install -g`. Do not add `pnpm install` there.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| npm registry authentication in CI | Custom `.npmrc` write step | `actions/setup-node` with `registry-url` | `setup-node` handles scope, auth token mapping, and `.npmrc` location correctly; manual `.npmrc` misses edge cases |
| Registry availability polling | Custom curl loop against registry | `npm view <package>@<version>` with retry loop | npm CLI handles auth, redirects, and registry URL correctly; curl against registry API requires auth header handling |
| Version bump + tag creation | Custom bash + git tag script | `npm version <semver>` | Atomically updates `package.json`, creates version commit, creates annotated git tag; no custom script needed |

**Key insight:** GitHub Actions + `setup-node` + pnpm handle all the auth plumbing. The only non-obvious requirement is `registry-url` being set in `setup-node`.

---

## Runtime State Inventory

> Not applicable — this is a greenfield CI/CD setup phase, not a rename/refactor phase.

---

## Common Pitfalls

### Pitfall 1: Missing registry-url in setup-node

**What goes wrong:** `pnpm publish` (or `npm publish`) fails with `ENEEDAUTH` even though `NODE_AUTH_TOKEN` is set.

**Why it happens:** `NODE_AUTH_TOKEN` only works when `setup-node` has written a corresponding `.npmrc` entry like `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}`. Without `registry-url: 'https://registry.npmjs.org'` in the `setup-node` step, this `.npmrc` entry is never written.

**How to avoid:** Always include `registry-url: 'https://registry.npmjs.org'` in the `actions/setup-node` step that precedes publish.

**Warning signs:** `ENEEDAUTH` in CI logs; `npm whoami` returns anonymous.

### Pitfall 2: Detached HEAD causes pnpm publish refusal

**What goes wrong:** `pnpm publish` fails with a git error about uncommitted changes or detached HEAD.

**Why it happens:** GitHub Actions checks out code in detached HEAD state when triggered by a tag push. pnpm's publish command validates git state by default.

**How to avoid:** Always include `--no-git-checks` in `pnpm publish` when running in CI.

**Warning signs:** `ERR_PNPM_GIT_UNCLEAN` or similar git state errors in pnpm publish output.

### Pitfall 3: Smoke test runs before registry propagates

**What goes wrong:** Smoke test job runs immediately after publish job succeeds, but `npm install -g twentythree-cli` returns 404 or installs the previous version.

**Why it happens:** npm's CDN takes 30-90 seconds to propagate a newly published package globally. The `publish` job success only confirms the package was accepted by the registry origin, not that it is available from all CDN nodes.

**How to avoid:** Add a polling loop in the smoke test job using `npm view twentythree-cli@<version> version` before running `npm install -g`. Retry 5 times with 15-second sleeps.

**Warning signs:** `npm ERR! 404 Not Found` during global install; `npm install` installs an older version.

### Pitfall 4: npm version run from wrong directory

**What goes wrong:** `npm version 1.0.0` bumps the root `package.json` (which is `private: true`), not the CLI package.

**Why it happens:** The monorepo root has its own `package.json`. `npm version` targets the `package.json` in the current working directory.

**How to avoid:** Always run `npm version 1.0.0` from `packages/twentythree-cli/` — not from the repo root.

**Warning signs:** `git log` shows a version bump commit but `packages/twentythree-cli/package.json` still shows `0.1.0`.

### Pitfall 5: pnpm install uses wrong lockfile or workspace

**What goes wrong:** `pnpm install --frozen-lockfile` fails in CI because the lockfile is stale or workspace packages have unresolved deps.

**Why it happens:** The lockfile lives at the repo root (confirmed: `/pnpm-lock.yaml`). Running `pnpm install` from the package subdirectory without context of the workspace root may fail.

**How to avoid:** Run `pnpm install --frozen-lockfile` from the repo root (the `checkout` default), not from inside `packages/twentythree-cli/`. Then use `pnpm --filter twentythree-cli` for package-scoped commands.

**Warning signs:** `ERR_PNPM_OUTDATED_LOCKFILE` or missing dependency errors.

---

## Code Examples

### Complete release.yml

```yaml
# Source: https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages
# + https://dev.to/receter/automatically-publish-your-node-package-to-npm-with-pnpm-and-github-actions-22eg
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

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

### Version bump and tag push (from packages/twentythree-cli/)

```bash
# Run from packages/twentythree-cli/
cd packages/twentythree-cli
npm version 1.0.0

# Push from repo root
cd ../..
git push && git push --tags
```

### Adding NPM_TOKEN to GitHub repository secrets

Set in repository Settings → Secrets and variables → Actions → New repository secret:
- Name: `NPM_TOKEN`
- Value: npm automation token (type: "Automation" when generating at npmjs.com)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `keytar` for credential storage | `@napi-rs/keyring` | 2022 (keytar archived) | Already using current approach in this project |
| Personal npm token | npm automation token | Best practice since 2022 | Automation tokens skip 2FA prompts in CI; use "Automation" token type on npm |
| OIDC trusted publishing | Classic token (NPM_TOKEN) | Emerging 2024-2025; deferred to v1.2 | OIDC is more secure but requires npm provenance setup — deferred |
| `pnpm/action-setup@v2` | `pnpm/action-setup@v4` | 2024 | v2 broken on newer Node; v4 is stable current version |

**Deprecated/outdated:**
- `pnpm/action-setup@v2`: broken with newer Node.js runners; use `@v4`
- `actions/checkout@v3`: superseded by `@v4`
- `actions/setup-node@v3`: superseded by `@v4`

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `twentythree-cli` package name is available on npm | PUBLISH-01 requirement | Package name taken → use `@twentythree/cli` scoped name instead; entire publish workflow changes | 
| A2 | npm registry propagation takes 30-90 seconds | Pitfall 3 / smoke test polling | If faster (< 30s), smoke test may pass without needing full retry; if slower (> 90s), retry budget may need increase |
| A3 | `pnpm/action-setup@v4` is the correct stable version for CI in April 2026 | Standard Stack | If v4 has issues, use v5 or v6 — all use the same `with: version: 10` interface |

**Note:** A1 was verified locally: `npm view twentythree-cli` returns `npm error 404 Not Found` — name appears available. [VERIFIED: npm registry, local check]

---

## Open Questions

1. **GitHub repository secret access**
   - What we know: The workflow requires `NPM_TOKEN` as a repository secret in GitHub Actions settings
   - What's unclear: Whether the repository owner has npm account access to generate the automation token
   - Recommendation: The developer must log into npmjs.com, go to Access Tokens, create a token of type "Automation", and add it as `NPM_TOKEN` in the GitHub repository secrets. This is a manual pre-flight step before the first tag push.

2. **Version tag scope in smoke test**
   - What we know: `GITHUB_REF_NAME` in a tag-triggered workflow equals the tag name (e.g., `v1.0.0`); stripping the `v` prefix gives the npm version
   - What's unclear: Whether the smoke test should hard-code `1.0.0` or use `${GITHUB_REF_NAME#v}` dynamically
   - Recommendation: Use `${GITHUB_REF_NAME#v}` to make the workflow reusable for future releases

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js >= 22 | CLI engines requirement | ✓ (local: v22.22.2) | 22.22.2 | — |
| pnpm | Build + install + publish | ✓ (local: 10.33.0) | 10.33.0 | — |
| npm | Version bump + smoke test | ✓ (local: 10.9.7) | 10.9.7 | — |
| GitHub Actions (ubuntu-latest) | CI workflow execution | ✓ | N/A | — |
| NPM_TOKEN secret | npm auth in CI | ✗ (must be created) | — | None — blocking; must create automation token on npmjs.com |
| `twentythree-cli` npm name | PUBLISH-01 | ✓ (name unregistered) | — | `@twentythree/cli` if name taken |

**Missing dependencies with no fallback:**
- `NPM_TOKEN` GitHub Actions secret — must be created manually before first tag push

**Missing dependencies with fallback:**
- None

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.1.4 |
| Config file | `packages/twentythree-cli/vitest.config.ts` |
| Quick run command | `pnpm --filter twentythree-cli test --run` |
| Full suite command | `pnpm --filter twentythree-cli test --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PUBLISH-01 | Package published to npm at 1.0.0 | smoke (post-publish) | `npm view twentythree-cli version` | ❌ Wave 0 (external verification) |
| PUBLISH-02 | Global install + `--version` works | smoke (post-publish) | `npm install -g twentythree-cli && twentythree --version` | ❌ Wave 0 (GitHub Actions job) |
| PUBLISH-03 | Workflow triggers on tag push | integration | GitHub Actions workflow run | ❌ Wave 0 (workflow file creation) |

**Note:** All three requirements are externally verifiable post-execution. Unit tests cannot cover these — they require the npm registry and GitHub Actions infrastructure. The "tests" for this phase are the smoke test job and the GitHub Actions workflow itself.

### Sampling Rate
- **Per task commit:** `pnpm --filter twentythree-cli test --run` (existing unit test suite — 151 tests)
- **Per wave merge:** Same
- **Phase gate:** Smoke test job green in GitHub Actions + `npm view twentythree-cli` returns version `1.0.0`

### Wave 0 Gaps
- [ ] `.github/workflows/release.yml` — the workflow file is the primary deliverable
- [ ] `packages/twentythree-cli/package.json` version bumped from `0.1.0` to `1.0.0`
- [ ] `NPM_TOKEN` secret set in GitHub repository settings (manual prerequisite)

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A |
| V3 Session Management | No | N/A |
| V4 Access Control | Yes (limited) | GitHub Actions secrets; scoped npm token |
| V5 Input Validation | No | N/A |
| V6 Cryptography | No | N/A |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Secret exposure in workflow logs | Information Disclosure | Never `echo $NODE_AUTH_TOKEN`; use `env:` block scoped to publish step only, not job-level |
| Supply chain attack via compromised runner | Tampering | Pin action versions to SHA (optional for v1; important for v1.2+) |
| Malicious tag push triggers publish | Elevation of Privilege | Tag protection rules on `v*` tags in GitHub repository settings (optional but recommended) |

**npm automation token note:** Use "Automation" token type (not "Publish" or "Read-only"). Automation tokens bypass 2FA prompts in CI, which is required for non-interactive publishing. [ASSUMED - npm token types behavior in CI]

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 13 |
|-----------|-------------------|
| TypeScript + Node.js only | No other runtimes in CI workflow; Node 22 in CI matches `engines.node >= 22` |
| npm global install only for v1 | Confirms `npm install -g twentythree-cli` is the correct smoke test method |
| `prepack` script runs `pnpm build` | pnpm must be installed in CI workflow before publish |
| No existing `.github/workflows/` | Workflow file is a net-new creation |
| `type: commonjs` in package.json | Build output is CJS; no ESM compatibility concerns for npm publish |
| GSD workflow enforcement | Changes must go through GSD workflow |

---

## Sources

### Primary (HIGH confidence)
- [GitHub Docs: Publishing Node.js packages](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages) — `setup-node` registry-url pattern, NODE_AUTH_TOKEN usage
- [pnpm/action-setup GitHub](https://github.com/pnpm/action-setup) — correct action version (v4), usage with `version: 10`
- [pnpm CLI publish docs](https://pnpm.io/cli/publish) — `--no-git-checks`, `--access`, flags
- npm registry check (local `npm view twentythree-cli`) — package name availability confirmed

### Secondary (MEDIUM confidence)
- [dev.to/receter: Automatically publish npm package with pnpm and GitHub Actions](https://dev.to/receter/automatically-publish-your-node-package-to-npm-with-pnpm-and-github-actions-22eg) — complete pnpm monorepo workflow YAML, `--no-git-checks` rationale, `registry-url` requirement
- [npm/feedback discussion: publish finishes before available](https://github.com/npm/feedback/discussions/68) — CDN propagation delay confirmation

### Tertiary (LOW confidence)
- [npm community: registry propagation timing](https://github.com/orgs/community/discussions/46463) — 30-90s propagation estimate; varies by CDN load

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against official docs and confirmed working patterns from 2024-2025 articles
- Architecture: HIGH — standard two-job GitHub Actions pattern; verified against official docs
- Pitfalls: HIGH — ENEEDAUTH and `--no-git-checks` are well-documented, reproducible issues; propagation delay confirmed by npm/feedback
- Package name availability: HIGH — verified locally

**Research date:** 2026-04-17
**Valid until:** 2026-07-17 (stable domain; GitHub Actions action versions may update)
