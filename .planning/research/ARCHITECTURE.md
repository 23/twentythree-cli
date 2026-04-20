# Architecture Research

**Domain:** pnpm monorepo — second-package npm publish wiring
**Researched:** 2026-04-20
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
.github/workflows/release.yml
          |
          |  on: push tags 'v*'
          v
+---------------------------------------------------------+
|                     publish job                         |
|                                                         |
|  checkout -> pnpm install -> test (cli) -> build (cli)  |
|      -> validate skills (node scripts/validate-skills)  |
|      -> pnpm publish twentythree-cli                    |
|      -> pnpm publish twentythree-skills                 |
+---------------------------------------------------------+
          |
          |  needs: publish
          v
+---------------------------------------------------------+
|                   smoke-test job                        |
|                                                         |
|  npm install -g twentythree-cli -> twentythree --version|
|  npx twentythree-skills add --help                      |
+---------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Notes |
|-----------|----------------|-------|
| `release.yml` publish job | Build, test, publish both packages sequentially | Single job ensures atomic release |
| `release.yml` smoke-test job | Verify installability from live npm registry | Runs after publish; polls for registry propagation |
| `packages/twentythree-cli/` | CJS CLI, built by tsdown, published with dist/ artifacts | Has a required `pnpm run build` step |
| `packages/twentythree-skills/` | ESM-only, no build step, static markdown + bin/add.js | pnpm publish copies `files` directly from source |
| git tag (`v*`) | Publish trigger; single tag governs both packages | Each package publishes at its own version from its own package.json |

## Recommended Project Structure

```
.github/
  workflows/
    release.yml              # one workflow, one publish job, two pnpm publish steps

packages/
  twentythree-cli/
    package.json             # version: "1.1.1"
    dist/                    # built output, published
  twentythree-skills/
    package.json             # version: "0.1.0", needs publishConfig.access: "public"
    bin/
      add.js                 # ESM bin, #!/usr/bin/env node, node: built-ins only
    skills/
      SKILL.md
      reference/*.md
      workflows/*.md
    scripts/
      validate-skills.mjs    # test script, already exists
```

### Structure Rationale

- **Single workflow file:** Two sequential `pnpm publish` steps inside one job is correct. A matrix strategy runs both in parallel, which prevents sharing build artifacts and loses ordering guarantees. A separate triggered workflow adds latency and tricky `workflow_run` permission semantics.
- **No turbo involvement for publish:** turbo.json correctly excludes skills from the global build pipeline (skills has its own package-level turbo.json with empty `dependsOn`). Publishing is a CI step, not a turbo task.

## Architectural Patterns

### Pattern 1: Sequential pnpm publish in one job

**What:** Add a second `pnpm publish` step in the existing `publish` job, directly after the cli publish step.
**When to use:** When both packages share a release cadence and a single git tag governs both.
**Trade-offs:** Simple, atomic, visible. If cli publishes but skills fails, cli is already live — acceptable because skills has no build step and no realistic failure mode beyond bad credentials.

**Example:**
```yaml
- name: Publish CLI to npm
  working-directory: packages/twentythree-cli
  run: pnpm publish --no-git-checks --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

- name: Validate skills package
  working-directory: packages/twentythree-skills
  run: node scripts/validate-skills.mjs

- name: Publish Skills to npm
  working-directory: packages/twentythree-skills
  run: pnpm publish --no-git-checks --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

The `--no-git-checks` flag is required in both cases. pnpm publish refuses to run if the git working tree appears dirty or HEAD is not on a tagged commit — GitHub Actions checkout does not always put HEAD on a branch, so `--no-git-checks` bypasses this. The tag-based trigger already guarantees publish intent.

### Pattern 2: Independent versioning (do not sync versions)

**What:** `twentythree-skills` keeps its own version (`0.1.0`) while `twentythree-cli` is at `1.1.1`. Do not force them to match.
**When to use:** When the two packages have different change rates. Skills is content (markdown files); CLI is code. Their semver signals are semantically different.
**Trade-offs:** The git tag `v1.2.0` triggers the workflow and publishes cli@1.2.0 and skills@0.1.x — the tag and the skills version do not need to match. Slightly more cognitive overhead, but avoids the false signal of bumping skills to 1.x just because cli is there.

**Recommendation:** Keep independent versioning. Each package reads its own `package.json` version at publish time. No coordination mechanism needed. When skills hits a stable release, bump it to 1.0.0 independently.

Note: The monorepo already has `@changesets/cli` in devDependencies, which supports independent versioning. The root `package.json` does not have a `.changeset/config.json` visible from the current state — if changesets is not actively used, ignore it and manage package.json versions manually.

### Pattern 3: publishConfig.access for unscoped packages

**What:** pnpm publish requires `--access public` on the command line or `publishConfig.access: "public"` in `package.json` for packages not under an npm scope (`@org/name`). `twentythree-skills` is unscoped.
**When to use:** Any unscoped public package published to npm via pnpm.
**Trade-offs:** None — this is required.

Add to `packages/twentythree-skills/package.json`:
```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

The CLI currently passes `--access public` on the command line. Either approach works. Embedding `publishConfig` in `package.json` is self-documenting and removes the flag from the CI step.

### Pattern 4: ESM bin script with npx — no shimming required

**What:** `bin/add.js` uses `#!/usr/bin/env node` and native ESM (`import` statements, `import.meta.url`). When a user runs `npx twentythree-skills add`, npm downloads the package and executes `bin/add.js` via the `bin` field.
**When to use:** ESM-only packages with a bin entry and no build step.
**Trade-offs:** Requires Node >=12.17 for native ESM. The package declares `"engines": {"node": ">=22.0.0"}` — no issue.

npx caching: npm caches downloaded packages in `~/.npm/_npx/`. First run downloads the latest version; subsequent runs use the cache until the version changes. No special shimming needed.

`import.meta.url` in `bin/add.js`: The existing code already uses `fileURLToPath(import.meta.url)` to derive `__dirname`. This is the correct pattern for ESM bin scripts — no changes needed.

`"type": "module"` in `package.json`: Already set. This tells Node to treat all `.js` files as ESM. The shebang line plus `type: module` means Node parses `bin/add.js` as ESM without requiring a `.mjs` extension.

## Data Flow

### Publish Flow (CI)

```
git push tag v1.2.0
    |
    v
GitHub Actions triggers release.yml (on: push tags: ['v*'])
    |
    v
pnpm install --frozen-lockfile
    |
    v
pnpm --filter twentythree-cli test --run
    |
    v
pnpm --filter twentythree-cli run build   (tsdown -> dist/)
    |
    v
pnpm publish  (cwd: packages/twentythree-cli)
    reads: packages/twentythree-cli/package.json -> version "1.2.0"
    publishes: dist/ + package.json
    |
    v
node scripts/validate-skills.mjs  (cwd: packages/twentythree-skills)
    validates: skills/SKILL.md frontmatter, reference/ file presence
    |
    v
pnpm publish  (cwd: packages/twentythree-skills)
    reads: packages/twentythree-skills/package.json -> version "0.1.0"
    publishes: bin/ + skills/ + README.md
    |
    v
smoke-test job: npm install -g twentythree-cli -> twentythree --version
                npx twentythree-skills add --help (or dry-run)
```

### npx User Flow

```
npx twentythree-skills add
    |
    v
npm downloads twentythree-skills@latest to ~/.npm/_npx/
    |
    v
executes bin/add.js (ESM, Node 22+)
    |
    v
detects runtimes via directory presence:
  ~/.claude/           -> Claude Code
  ~/.codex/            -> Codex
  .github/copilot/     -> Copilot (project-local)
  .cursor/             -> Cursor
    |
    v
cpSync(skills/, <runtime-skills-dir>/twentythree/) for each detected runtime
    |
    v
prints: "Installed N skills for [runtime]"
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 2 packages (current) | Single workflow, sequential publish steps — done |
| 3-5 packages | Still one workflow; add a step per package; consider `pnpm --filter` glob if all share the same treatment |
| 5+ packages with divergent release cadences | Split into per-package workflows triggered on path changes; activate `changesets` for coordinated versioning |

### Scaling Priorities

1. **First divergence point:** If skills needs its own patch releases independent of CLI releases, add a separate `skills-v*` tag pattern as a second trigger. The two workflows can share the `NPM_TOKEN` secret without conflict.
2. **If more packages need build steps:** Invoke `turbo run build` in CI instead of `pnpm --filter twentythree-cli run build` — turbo's build pipeline already handles ordering via `dependsOn`.

## Anti-Patterns

### Anti-Pattern 1: Matrix strategy for multi-package publish

**What people do:** Define a GitHub Actions matrix `[twentythree-cli, twentythree-skills]` so both publish in parallel.
**Why it's wrong:** Parallel jobs cannot share build artifacts. `twentythree-cli` must be built before publishing; its `dist/` cannot be passed to a parallel job without `actions/upload-artifact` round-trips. For two packages where one has no build step, this adds complexity with no benefit.
**Do this instead:** Two sequential steps in one job. Simple and unambiguous.

### Anti-Pattern 2: Separate triggered workflow for skills

**What people do:** Create a second workflow file triggered via `workflow_run` after the main release workflow completes.
**Why it's wrong:** `workflow_run` events add 30-90 seconds of latency, have tricky permission semantics (`secrets` are not automatically inherited), and make debugging harder. The trigger chain is invisible at a glance.
**Do this instead:** Add a second `pnpm publish` step in the existing `publish` job. Same token, same run, visible in one place.

### Anti-Pattern 3: Lockstep versioning

**What people do:** Bump both packages to the same version on every release.
**Why it's wrong:** Skills and CLI change at different rates. Forcing lockstep creates meaningless version churn on the CLI (a documentation fix to skills should not bump CLI from 1.1.1 to 1.1.2) and misleads users about what changed.
**Do this instead:** Independent versioning. Each package publishes at its own version. The git tag triggers the workflow; it does not dictate package versions.

### Anti-Pattern 4: Omitting publishConfig.access for unscoped packages

**What people do:** Publish without `--access public` or `publishConfig`, expecting npm to infer intent.
**Why it's wrong:** pnpm's publish command in some versions treats unscoped packages as private by default to avoid accidental leaks. The `--access public` flag or `publishConfig` makes intent unambiguous and prevents CI failures on first publish of a new package.
**Do this instead:** Add `"publishConfig": {"access": "public"}` to `packages/twentythree-skills/package.json`.

### Anti-Pattern 5: Running the skills test inside the CLI test step

**What people do:** Call `pnpm test` (without `--filter`) in CI, causing both packages to be tested in one undifferentiated step.
**Why it's wrong:** Not catastrophically wrong, but unclear. The existing workflow correctly scopes with `pnpm --filter twentythree-cli test --run`. Adding a skills test as a separate, named step (`Validate skills package`) makes it visible in the CI log and independently re-runnable.
**Do this instead:** Named, explicit step for skills validation before the skills publish step.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| npm registry | `NODE_AUTH_TOKEN` env var, configured by `actions/setup-node` `registry-url` | Already wired in release.yml; same token and same `registry-url` step covers both publish steps |
| GitHub Actions | `on: push tags 'v*'` trigger | Tag must be pushed explicitly (`git push origin v1.2.0` or `git push --tags`) |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| CLI publish step -> Skills publish step | Sequential in same job | No artifact passing needed — skills has no build output |
| Skills package -> user runtime dirs | `cpSync` at npx runtime | Happens on user machine, not in CI |
| turbo.json <-> skills package | Skills has its own package-level turbo.json with `dependsOn: []` | Skills is already isolated from CLI build pipeline; no changes needed |

## Sources

- pnpm publish docs (--no-git-checks, --access, --filter): https://pnpm.io/cli/publish
- GitHub Actions workflow_run permission semantics: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_run
- npm publishConfig spec: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#publishconfig
- Node.js ESM bin script pattern (import.meta.url): https://nodejs.org/api/esm.html#importmetaurl
- npx caching behavior: https://docs.npmjs.com/cli/v10/commands/npx
- Live codebase: .github/workflows/release.yml, packages/twentythree-skills/package.json, turbo.json

---
*Architecture research for: pnpm monorepo second-package npm publish (twentythree-skills)*
*Researched: 2026-04-20*
