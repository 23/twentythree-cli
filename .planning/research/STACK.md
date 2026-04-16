# Technology Stack

**Project:** twentythree-cli
**Researched:** 2026-04-14 (updated 2026-04-16 — v1.1 additions: publish, docs, audit)

---

## Recommended Stack

### CLI Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@oclif/core` | 4.10.5 | CLI framework, command dispatch, help generation, flag parsing | Only TypeScript-first framework designed for large multi-command CLIs; lazy-loads commands (each command file is required only when invoked — large API surface has zero startup penalty); built-in topic namespacing (`videos:list`, `albums:create`); plugin-autocomplete for tab completion; JSON output mode built in; Salesforce-maintained, v4 is actively published (6 days ago as of research date) |
| `oclif` | 4.x | CLI scaffolding and release tooling | Code-generates command files, handles npm/package.json manifest, handles `bin` entrypoint wiring |

**Confidence: HIGH** — verified on npmjs.com and oclif.io

**Why not Commander.js (v14.0.3, ~340M weekly downloads)?**
Commander is excellent for small-to-medium CLIs but has no file-based command loader. With a large API surface (50+ commands), every command must be registered manually in one place; there is no plugin/extension model, no built-in autocomplete, and no lazy loading. It becomes the right choice if you never need those things — for this project, they are required.

**Why not yargs (~167M weekly downloads)?**
yargs has the richest middleware and option-parsing API but no command-file loader, no plugin system, and it adds ~20ms startup cost versus oclif's near-zero. Builder-function verbosity grows at scale. Not designed for large multi-command CLIs.

**Why not Ink?**
Ink (React for CLIs) is for rich interactive terminal UIs — dashboards, real-time lists, forms. This CLI primarily outputs data and takes credentials as input. Ink adds React as a runtime dependency for no benefit here. Use @clack/prompts (see below) for the few interactive flows needed.

---

### Build Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `tsdown` | 0.21.x | Bundle TypeScript → distributable CJS/ESM | Powered by Rolldown (Rust); ESM-first; zero-config for CLI bundles; actively maintained as the officially endorsed successor to tsup; sensible defaults |
| `typescript` | 5.x | Type checking, declaration generation | Required for type safety; tsdown handles emit via Rolldown but TypeScript compiler handles type checking in CI |

**Confidence: MEDIUM** — tsdown is v0.21.8, pre-1.0 but actively maintained by the Rolldown/Vite core team. tsup (the predecessor) is officially abandoned. Migration from tsup to tsdown is documented as straightforward.

**tsconfig essentials for a global CLI:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "outDir": "dist",
    "declaration": true,
    "esModuleInterop": true
  }
}
```
`NodeNext` module resolution is required for modern Node.js ESM/CJS interop. `ES2022` targets Node 18+ which is the current LTS floor.

**Why not raw `tsc`?**
tsc compiles file-by-file; it does not bundle. For a global npm install, a single bundled entry point is simpler to distribute, produces smaller installs, and avoids path-resolution issues across environments.

**Why not esbuild directly?**
esbuild doesn't produce `.d.ts` files; you'd wire up `tsc --emitDeclarationOnly` separately. tsdown handles the full pipeline.

---

### OpenAPI Code Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `openapi-typescript` | 7.x | Generate TypeScript type definitions from the OpenAPI spec | Types-only, zero runtime cost; generates `paths`, `components`, `operations` interfaces that can be used with any HTTP client; CLI accepts remote URLs directly (`npx openapi-typescript https://video.twentythree.com/apidocs/swagger.json -o src/types/api.d.ts`) |
| `openapi-fetch` | latest | Type-safe HTTP client using the generated types | Tiny (~6 KB); enforces request/response types against the generated schema at compile time; same ecosystem as openapi-typescript |

**Confidence: HIGH** — openapi-typescript v7 verified on openapi-ts.dev; used by major open-source projects.

**Usage pattern:**
```typescript
// Generated once from spec:
// src/types/api.d.ts → contains paths, components

import createClient from "openapi-fetch";
import type { paths } from "../types/api.js";

const client = createClient<paths>({ baseUrl: "https://domain.twentythree.net" });

// Fully typed: TypeScript knows request params and response shape
const { data, error } = await client.GET("/api/2/photo/list", {
  params: { query: { size: 20 } }
});
```

This approach generates **types only** — no bloated SDK with opinionated HTTP client choices baked in. The `openapi-fetch` companion is a 1:1 mapping of the generated paths type to fetch calls.

**Why not Orval?**
Orval generates full client SDKs with React Query hooks, Axios clients, or SWR patterns. This is excellent for frontend applications but over-engineered for a CLI. The output is heavier, assumes a frontend runtime, and the generated code is harder to customise for CLI-specific concerns (workspace switching, credential injection, term mapping).

**Why not @hey-api/openapi-ts?**
Similar issue — generates full SDK clients with 20+ plugins. Pre-1.0 (pin required). Better suited for frontend SDK generation. openapi-typescript + openapi-fetch is the lighter, more composable choice for a CLI.

**Why not swagger-codegen / openapi-generator?**
Java-based tools with heavy JVM requirements. Output is verbose and difficult to customise for CLI patterns. Not standard in the Node.js ecosystem.

**Note on the TwentyThree spec:** The publicly accessible swagger.json at `https://video.twentythree.com/apidocs/swagger.json` only exposes 13 paths at time of research (actions and collectors resources) — this is likely the unauthenticated subset. The full spec likely requires authentication to retrieve. The generation step should be gated: fetch the full spec with credentials first, then run codegen. Build script should handle this.

---

### Config and Credential Storage

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `conf` | latest | Store non-sensitive config: active workspace, workspace list, preferences | XDG-compliant; writes to `~/.config/twentythree-cli/` on Linux/macOS; atomic writes prevent corruption; actively maintained by sindresorhus |
| `@napi-rs/keyring` | 1.2.x | Store bearer tokens securely in OS keychain | Rust-backed native addon via NAPI-RS; wraps macOS Keychain, Windows Credential Manager, Linux Secret Service; actively maintained (last publish 3 months ago); keytar replacement with no abandoned-atom baggage; MSAL (Microsoft) is migrating to this library |

**Confidence: MEDIUM** — @napi-rs/keyring verified on npm, cross-platform support verified. The native addon adds a compilation step on install, but prebuilt binaries are provided for all major platforms, so `npm install -g` still works without a local toolchain.

**Storage split:**
- **Sensitive** (bearer tokens, per-workspace credentials) → `@napi-rs/keyring` → OS keychain
- **Non-sensitive** (active workspace selection, workspace display names, CLI preferences) → `conf` → `~/.config/twentythree-cli/config.json`

**Fallback strategy:** If the keyring is unavailable (headless servers, CI environments), fall back to storing tokens in the `conf` file with a clear warning. This is what GitHub CLI (`gh`) does — keyring by default, config-file fallback with explicit warning.

**Why not original `keytar`?**
Archived by Atom/GitHub in December 2022. No longer maintained. Active issues with newer Node.js versions. `@napi-rs/keyring` is the community-standard replacement.

**Why not `configstore`?**
Older, less actively maintained than `conf`. Both store in `~/.config` but `conf` has better cross-platform path resolution and atomic writes.

---

### Output Formatting and UX

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `chalk` | 4.x (NOT 5.x) | Terminal colour | Chalk 5 is ESM-only and breaks in CJS contexts; Chalk 4 is the safe choice until the build outputs pure ESM cleanly. Re-evaluate when fully ESM |
| `cli-table3` | latest | Tabular output for list commands | Lightweight; no extra deps; widely used; supports column truncation |
| `ora` | 5.x (NOT 6.x) | Spinners for async operations (API calls, token refresh) | ora 6+ is ESM-only, same issue as chalk 5. ora 5 is CJS-safe |
| `@clack/prompts` | latest | Interactive prompts (auth setup, workspace selection) | Ships beautiful opinionated styling out of the box; replaces the need for chalk + boxen + inquirer together; fewer dependencies; modern alternative to inquirer; actively maintained |

**Confidence: MEDIUM** — ESM/CJS notes verified via community sources; versions verified against npm. The ESM-only issue with newer major versions of chalk and ora is a known pattern in the Node.js ecosystem.

**ESM vs CJS decision:** If you commit fully to ESM output from tsdown (`"type": "module"` in package.json), then chalk 5 and ora 6 become safe to use. However, oclif currently works best with CJS or dual-output builds. Recommendation: stay CJS-safe with chalk 4 / ora 5 initially; migrate to ESM-first after oclif settles its own ESM story.

**Why not Ink?**
React runtime for CLIs. Appropriate for interactive dashboards or real-time streaming UIs. This project needs data output (tables, JSON) and a handful of prompts — @clack/prompts and cli-table3 cover that without React.

---

### HTTP Client

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `openapi-fetch` | latest | API calls to TwentyThree endpoints | Already in stack (see OpenAPI section); type-safe; tiny; supports middleware for auth injection |

The `openapi-fetch` middleware pattern is ideal for inserting the bearer token and handling token refresh:

```typescript
client.use({
  async onRequest({ request }) {
    const token = await getToken(activeWorkspace);
    request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  }
});
```

No need for axios, got, or node-fetch. The fetch API is built into Node.js 18+.

---

### Token Refresh

**Pattern: Pre-flight check on every command invocation**

Since the TwentyThree auth model uses bearer tokens (not short-lived JWTs with separate refresh tokens), the relevant concern is token expiry detection and re-prompting. The approach:

1. On CLI startup (oclif `init` hook), check if the stored token is approaching expiry by making a cheap ping to `/api/2/user/tokens`
2. If the call fails with 401, surface a clear error: "Your token has expired. Run `twentythree auth credentials` to re-authenticate."
3. For background long-running commands (future: watch mode), use a `setInterval` to refresh before expiry

**Why not a background daemon?**
A CLI is invoked and exits. Background token refresh daemons (like `launchd` agents or `cron`) are appropriate for GUI apps or server processes, not CLIs that live for milliseconds to seconds. The pre-flight check on invocation is the standard pattern used by `gh`, AWS CLI, and Heroku CLI.

**Confidence: MEDIUM** — based on standard CLI auth patterns; TwentyThree-specific token TTL not confirmed (spec research was limited to public endpoints).

---

### Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `vitest` | latest | Unit and integration tests | Native TypeScript support; no ts-jest config; Jest-compatible API; 30-70% faster than Jest in benchmarks; actively maintained by Vite core team |
| `@oclif/test` | latest | oclif command testing helpers | Provides `runCommand()` helper that captures stdout/stderr for assertion; works with oclif's command loading |

**Confidence: HIGH** — vitest is the clear 2025 recommendation for TypeScript projects not using Jest.

---

## v1.1 Additions: Publish, Docs, Endpoint Audit

These are new capabilities for the v1.1 milestone. Nothing below requires new runtime dependencies.

---

### (a) npm Publish

**No new tooling required.** The existing stack covers everything. The work is configuration.

#### package.json fields to add

The current `package.json` is missing several fields that npm requires or strongly recommends for a public first publish:

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
  "keywords": ["twentythree", "cli", "video", "api"],
  "publishConfig": {
    "access": "public",
    "provenance": true
  }
}
```

- `repository` — required for npm provenance; URL must exactly match the GitHub repo (case-sensitive)
- `publishConfig.access: "public"` — required for unscoped public packages on first publish; prevents "private package" publish errors
- `publishConfig.provenance: true` — enables Sigstore-backed provenance attestation; links the npm package to its source commit and CI run; free, increases trust

#### .npmignore

The current `"files"` field in `package.json` already allowlists `/bin`, `/dist`, `/oclif.manifest.json`. This is the right pattern — it's an allowlist not a denylist, which is safer. **No `.npmignore` needed** when `"files"` is present. Run `npm pack --dry-run` from `packages/twentythree-cli/` to verify what gets included before publishing.

#### GitHub Actions publish workflow

**Use `changesets/action`** — already in the repo as `@changesets/cli` is in devDependencies (root `package.json` shows it). The changeset workflow:

1. Developer runs `pnpm changeset` to describe the change (patch/minor/major)
2. `changesets/action` opens a "Version Packages" PR on merge to main
3. Merging the Version PR triggers `changeset publish` → `npm publish` with `NPM_TOKEN`

Minimal GitHub Actions workflow (`.github/workflows/release.yml`):

```yaml
name: Release
on:
  push:
    branches: [main]
permissions:
  contents: write
  pull-requests: write
  id-token: write  # required for provenance attestation
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: corepack enable && pnpm install
      - uses: changesets/action@v1
        with:
          publish: pnpm --filter twentythree-cli publish --no-git-checks
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

`id-token: write` permission is required for provenance attestation to work in CI.

**Why changesets and not a manual `npm publish`?**
The repo already has `@changesets/cli` in devDependencies. Changesets produces a CHANGELOG.md automatically, prevents accidental publishes, and makes version bumps auditable via PR. Manual `npm publish` from a developer machine risks version drift and missing the provenance flag.

**Why not semantic-release?**
semantic-release infers version from commit messages (conventional commits), which adds a commit message discipline requirement. Changesets is explicit and developer-driven — fits better for a project where changelogs are intentional, not inferred.

**Confidence: HIGH** — changesets pattern verified across multiple pnpm monorepo examples; provenance `id-token: write` requirement confirmed via npm docs.

---

### (b) Docs Generation — Markdown Command Reference

**Use `oclif readme` (already in devDependencies as `oclif` package).**

The `oclif` package (already installed as devDep at `^4.23.0`) includes the `oclif readme` command. No new packages needed.

#### How it works

`oclif readme` scans the built `oclif.manifest.json` and replaces placeholder HTML comments in a README with generated content:

- `<!-- usage -->` → install + basic usage block
- `<!-- commands -->` → full command table with descriptions, flags, examples
- `<!-- toc -->` → table of contents

#### Two modes

**Mode 1: Inline (augment existing README)**

Suitable for a root `README.md` that shows the command list inline:

```bash
pnpm --filter twentythree-cli exec oclif readme --readme-path ../../README.md
```

**Mode 2: Multi-file (separate per-topic docs pages)**

Suitable for a `docs/` directory with one file per command group:

```bash
pnpm --filter twentythree-cli exec oclif readme --multi --output-dir ../../docs
```

This produces `docs/video.md`, `docs/category.md`, etc. — one file per top-level topic. Use `--nested-topics-depth=2` if subtopics should also get their own files.

#### Integration with agentMetadata

`oclif readme` reads from `static description`, `static flags`, `static examples`, and `static args` on each command class — the standard oclif fields. The `static agentMetadata` field is separate and does not appear in generated docs. This is correct: agentMetadata is for machine consumption, the oclif readme output is for human consumption. No conflict.

#### When to run

Add a `docs` script to the root `package.json`:

```json
"docs": "pnpm --filter twentythree-cli build && pnpm --filter twentythree-cli exec oclif readme --multi --output-dir ../../docs"
```

Run before each release as part of the changeset publish step, or as a separate pre-commit hook.

**Confidence: HIGH** — `oclif readme` command syntax and `--multi` flag verified directly from oclif GitHub docs; oclif package already present as devDep.

**What NOT to add:**
- `typedoc` — TypeDoc generates API reference from TypeScript types, not CLI help. Wrong tool for a command reference.
- `docsify` / `vitepress` — heavyweight documentation sites. Markdown files in `docs/` committed to the repo are sufficient.
- Any custom AST parser of agentMetadata — `oclif readme` already reads the right fields; don't duplicate.

---

### (c) Endpoint Coverage Audit

**Use a custom Node.js script — no new packages needed.**

The audit compares:
- **Source of truth:** `specs/twentythree-api-swagger.json` — 235 paths
- **Implementation:** `static agentMetadata.api_endpoint` fields across all 219 command files — already grep-able as `'METHOD /path'` strings

Both datasets are already available in the repo. No external tool adds value here.

#### Approach

Write a standalone script at `packages/twentythree-cli/scripts/audit-coverage.ts` (or `.js`):

1. Parse `specs/twentythree-api-swagger.json` → extract all `{ method, path }` pairs (235 total)
2. Grep all `.ts` files under `src/commands/` for `api_endpoint:` values → extract `{ method, path }` pairs
3. Normalize: strip `/api/2` prefix from spec paths if present (spec uses bare paths like `/photo/list`, commands use same format — verify consistency)
4. Diff: covered = spec paths that appear in at least one command; uncovered = spec paths with no matching command
5. Output: table of uncovered paths + summary `N/235 covered (X%)`

#### Why not an existing tool?

- `openapi-diff` — compares two spec files, not spec-to-implementation
- `specmatic` — heavyweight Java tool for contract testing, not CLI coverage
- Custom script reading agentMetadata directly is 50 lines of Node.js with zero new dependencies and full control over the output format

#### Script outline (TypeScript-compatible, runs via `tsx` or compiled)

```typescript
import { readFileSync } from 'fs'
import { globSync } from 'fs' // Node 22 has globSync natively
import path from 'path'

// 1. Load spec
const spec = JSON.parse(readFileSync('specs/twentythree-api-swagger.json', 'utf8'))
const specEndpoints = new Set<string>()
for (const [specPath, methods] of Object.entries(spec.paths as Record<string, Record<string, unknown>>)) {
  for (const method of ['get','post','put','delete','patch']) {
    if (methods[method]) specEndpoints.add(`${method.toUpperCase()} ${specPath}`)
  }
}

// 2. Collect covered endpoints from agentMetadata
const commandFiles = globSync('src/commands/**/*.ts')
const coveredEndpoints = new Set<string>()
for (const file of commandFiles) {
  const content = readFileSync(file, 'utf8')
  const match = content.match(/api_endpoint:\s*'([^']+)'/)
  if (match) coveredEndpoints.add(match[1])
}

// 3. Report
const uncovered = [...specEndpoints].filter(ep => !coveredEndpoints.has(ep))
console.log(`Coverage: ${specEndpoints.size - uncovered.length}/${specEndpoints.size}`)
if (uncovered.length) {
  console.log('\nUncovered endpoints:')
  uncovered.forEach(ep => console.log(' ', ep))
}
```

Run via: `pnpm --filter twentythree-cli exec tsx scripts/audit-coverage.ts`

#### Add `tsx` as devDep (only new addition)

`tsx` (TypeScript execute) runs `.ts` scripts directly without a compile step — useful for one-off scripts and tasks that shouldn't go through the full tsdown build pipeline:

```bash
pnpm add -D tsx --filter twentythree-cli
```

`tsx` is maintained by privatenumber; actively used by the Vite ecosystem; ~4MB; no config required. It wraps esbuild for fast TypeScript transpilation.

**Alternative:** Write the audit script as plain `.js` using `require('fs')` — avoids the tsx dependency entirely. The script logic is simple enough that TypeScript types add minimal value.

**Confidence: HIGH** — approach uses only built-in Node.js 22 APIs (`fs`, `globSync` native in Node 22) + the existing spec and source files. No external auditing tools required.

---

## Full Dependency Map

### Runtime Dependencies (`dependencies`)
```
@oclif/core         # CLI framework
@napi-rs/keyring    # Secure credential storage
conf                # Config file storage
chalk               # Terminal colours (pin to ^4)
cli-table3          # Tabular output
ora                 # Spinners (pin to ^5)
@clack/prompts      # Interactive prompts
openapi-fetch       # Type-safe HTTP client
```

### Dev Dependencies (`devDependencies`)
```
oclif               # Code generation, build tooling, and docs generation (oclif readme)
typescript          # Type checking
tsdown              # Bundling
openapi-typescript  # API type generation (build-time)
vitest              # Test runner
@oclif/test         # oclif test helpers
@types/node         # Node.js types
tsx                 # Run .ts scripts directly (new — for audit-coverage.ts)
```

### Root devDependencies (monorepo)
```
@changesets/cli     # Version management and changelog (already present)
changesets/action   # GitHub Actions integration (CI only, not installed locally)
turbo               # Monorepo build orchestration (already present)
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| CLI framework | oclif | Commander.js | No command-file loader, no plugin system, manual registration at scale |
| CLI framework | oclif | yargs | No command-file loader; builder verbosity grows with API surface; no autocomplete |
| CLI framework | oclif | Ink | React runtime; for interactive UIs not data CLIs |
| Build tool | tsdown | tsup | tsup is officially abandoned; tsdown is the maintained successor |
| Build tool | tsdown | tsc | No bundling; file-per-file output; path issues in global installs |
| API types | openapi-typescript | orval | Frontend-focused; generates React Query hooks, Axios clients — over-engineered for CLI |
| API types | openapi-typescript | @hey-api/openapi-ts | Pre-1.0; 20+ plugin surface area; more appropriate for SDK generation |
| API types | openapi-typescript | swagger-codegen | JVM dependency; verbose output; not Node-native |
| Credentials | @napi-rs/keyring | keytar | Archived December 2022; unmaintained; deprecation warnings |
| Credentials | @napi-rs/keyring | plain conf file | Tokens in plaintext files is a security antipattern |
| Prompts | @clack/prompts | inquirer | More dependencies needed to match @clack styling; heavier |
| Testing | vitest | Jest | Requires ts-jest config; slower; @swc/jest config complexity |
| Publish versioning | changesets | semantic-release | semantic-release infers version from commit messages; requires conventional commits discipline; changesets is explicit and PR-driven |
| Docs generation | oclif readme | typedoc | typedoc generates TypeScript API reference, not CLI help output |
| Docs generation | oclif readme | custom agentMetadata parser | Duplicates what oclif readme already does from static description/flags/examples |
| Endpoint audit | custom Node.js script | openapi-diff | openapi-diff compares two spec files, not spec-to-implementation |
| Endpoint audit | custom Node.js script | specmatic | Java-based contract testing tool; heavyweight; not designed for CLI coverage reporting |
| Script runner | tsx | ts-node | ts-node is slower and has more configuration surface area; tsx is the simpler successor |
| Script runner | tsx | plain .js script | Also valid — if the audit script stays simple, remove tsx dependency entirely |

---

## Installation

```bash
# Init with oclif generator (creates package.json, tsconfig, bin entrypoint)
npx oclif generate cli twentythree-cli

# Runtime deps
npm install @oclif/core @napi-rs/keyring conf chalk@^4 cli-table3 ora@^5 @clack/prompts openapi-fetch

# Dev deps
npm install -D oclif typescript tsdown openapi-typescript vitest @oclif/test @types/node tsx

# Root monorepo (changesets already present per package.json)
# @changesets/cli already in root devDependencies
```

---

## Sources

- oclif features and v4 documentation: https://oclif.io/docs/features/
- oclif readme command docs: https://github.com/oclif/oclif/blob/main/docs/readme.md
- @oclif/core npm (v4.10.5 confirmed): https://www.npmjs.com/package/@oclif/core
- Commander.js npm (v14.0.3): https://www.npmjs.com/package/commander
- npm download trends (commander ~340M/wk, yargs ~167M/wk, oclif ~293K/wk): https://npmtrends.com/commander-vs-oclif-vs-yargs
- openapi-typescript v7 docs: https://openapi-ts.dev/introduction
- tsdown official docs: https://tsdown.dev/guide/
- tsdown GitHub (v0.21.8): https://github.com/rolldown/tsdown
- tsup deprecation note: https://github.com/egoist/tsup
- @napi-rs/keyring npm (v1.2.0): https://www.npmjs.com/package/@napi-rs/keyring
- keytar archived December 2022: https://github.com/atom/node-keytar
- GitHub CLI keyring fallback pattern: https://github.com/cli/cli/discussions/8980
- conf credential storage caveats: https://github.com/sindresorhus/conf
- @clack/prompts vs inquirer: https://dev.to/chengyixhu/clackprompts-the-modern-alternative-to-inquirerjs-1ohb
- vitest TypeScript recommendation: https://medium.com/@ruverd/jest-vs-vitest-which-test-runner-should-you-use-in-2025-5c85e4f2bda9
- oclif lazy loading (only invoked command is required): https://oclif.io/docs/features/
- Orval vs openapi-typescript for CLI: https://debricked.com/select/compare/npm-openapi-typescript-codegen-vs-npm-orval-vs-npm-@hey-api/client-fetch
- npm provenance attestation: https://docs.npmjs.com/generating-provenance-statements/
- npm publishConfig fields: https://docs.npmjs.com/files/package.json/
- changesets GitHub Action: https://github.com/changesets/action
- changesets with pnpm: https://pnpm.io/using-changesets
