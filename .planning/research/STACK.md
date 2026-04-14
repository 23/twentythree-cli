# Technology Stack

**Project:** twentythree-cli
**Researched:** 2026-04-14

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
oclif               # Code generation and build tooling
typescript          # Type checking
tsdown              # Bundling
openapi-typescript  # API type generation (build-time)
vitest              # Test runner
@oclif/test         # oclif test helpers
@types/node         # Node.js types
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

---

## Installation

```bash
# Init with oclif generator (creates package.json, tsconfig, bin entrypoint)
npx oclif generate cli twentythree-cli

# Runtime deps
npm install @oclif/core @napi-rs/keyring conf chalk@^4 cli-table3 ora@^5 @clack/prompts openapi-fetch

# Dev deps
npm install -D oclif typescript tsdown openapi-typescript vitest @oclif/test @types/node
```

---

## Sources

- oclif features and v4 documentation: https://oclif.io/docs/features/
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
- @clack/prompts vs inquirer: https://dev.to/chengyixu/clackprompts-the-modern-alternative-to-inquirerjs-1ohb
- vitest TypeScript recommendation: https://medium.com/@ruverd/jest-vs-vitest-which-test-runner-should-you-use-in-2025-5c85e4f2bda9
- oclif lazy loading (only invoked command is required): https://oclif.io/docs/features/
- Orval vs openapi-typescript for CLI: https://debricked.com/select/compare/npm-openapi-typescript-codegen-vs-npm-orval-vs-npm-@hey-api/client-fetch
