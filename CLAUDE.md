<!-- GSD:project-start source:PROJECT.md -->
## Project

**TwentyThree CLI**

A TypeScript/Node.js CLI (`twentythree`) for the TwentyThree video platform API, installable globally via npm. It gives users terminal access to every TwentyThree API endpoint, handles multi-workspace authentication with automatic token refresh, and ships alongside an installable AI agent skills package — modeled after the Basecamp CLI.

**Core Value:** A developer can authenticate, select a workspace, and call any TwentyThree API endpoint from the terminal in under a minute.

### Constraints

- **Tech Stack**: TypeScript + Node.js — no other runtimes; keeps the ecosystem consistent and npm distribution natural
- **Distribution**: npm global install only for v1 — simplest path to ship
- **Auth**: Credential-based (domain + bearer token) for v1 — browser OAuth is a subsequent milestone
- **API**: Must support all endpoints in the OpenAPI spec as the long-term target — architecture must not artificially limit coverage
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### CLI Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@oclif/core` | 4.10.5 | CLI framework, command dispatch, help generation, flag parsing | Only TypeScript-first framework designed for large multi-command CLIs; lazy-loads commands (each command file is required only when invoked — large API surface has zero startup penalty); built-in topic namespacing (`videos:list`, `albums:create`); plugin-autocomplete for tab completion; JSON output mode built in; Salesforce-maintained, v4 is actively published (6 days ago as of research date) |
| `oclif` | 4.x | CLI scaffolding and release tooling | Code-generates command files, handles npm/package.json manifest, handles `bin` entrypoint wiring |
### Build Tooling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `tsdown` | 0.21.x | Bundle TypeScript → distributable CJS/ESM | Powered by Rolldown (Rust); ESM-first; zero-config for CLI bundles; actively maintained as the officially endorsed successor to tsup; sensible defaults |
| `typescript` | 5.x | Type checking, declaration generation | Required for type safety; tsdown handles emit via Rolldown but TypeScript compiler handles type checking in CI |
### OpenAPI Code Generation
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `openapi-typescript` | 7.x | Generate TypeScript type definitions from the OpenAPI spec | Types-only, zero runtime cost; generates `paths`, `components`, `operations` interfaces that can be used with any HTTP client; CLI accepts remote URLs directly (`npx openapi-typescript https://video.twentythree.com/apidocs/swagger.json -o src/types/api.d.ts`) |
| `openapi-fetch` | latest | Type-safe HTTP client using the generated types | Tiny (~6 KB); enforces request/response types against the generated schema at compile time; same ecosystem as openapi-typescript |
### Config and Credential Storage
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `conf` | latest | Store non-sensitive config: active workspace, workspace list, preferences | XDG-compliant; writes to `~/.config/twentythree-cli/` on Linux/macOS; atomic writes prevent corruption; actively maintained by sindresorhus |
| `@napi-rs/keyring` | 1.2.x | Store bearer tokens securely in OS keychain | Rust-backed native addon via NAPI-RS; wraps macOS Keychain, Windows Credential Manager, Linux Secret Service; actively maintained (last publish 3 months ago); keytar replacement with no abandoned-atom baggage; MSAL (Microsoft) is migrating to this library |
- **Sensitive** (bearer tokens, per-workspace credentials) → `@napi-rs/keyring` → OS keychain
- **Non-sensitive** (active workspace selection, workspace display names, CLI preferences) → `conf` → `~/.config/twentythree-cli/config.json`
### Output Formatting and UX
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `chalk` | 4.x (NOT 5.x) | Terminal colour | Chalk 5 is ESM-only and breaks in CJS contexts; Chalk 4 is the safe choice until the build outputs pure ESM cleanly. Re-evaluate when fully ESM |
| `cli-table3` | latest | Tabular output for list commands | Lightweight; no extra deps; widely used; supports column truncation |
| `ora` | 5.x (NOT 6.x) | Spinners for async operations (API calls, token refresh) | ora 6+ is ESM-only, same issue as chalk 5. ora 5 is CJS-safe |
| `@clack/prompts` | latest | Interactive prompts (auth setup, workspace selection) | Ships beautiful opinionated styling out of the box; replaces the need for chalk + boxen + inquirer together; fewer dependencies; modern alternative to inquirer; actively maintained |
### HTTP Client
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `openapi-fetch` | latest | API calls to TwentyThree endpoints | Already in stack (see OpenAPI section); type-safe; tiny; supports middleware for auth injection |
### Token Refresh
### Testing
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `vitest` | latest | Unit and integration tests | Native TypeScript support; no ts-jest config; Jest-compatible API; 30-70% faster than Jest in benchmarks; actively maintained by Vite core team |
| `@oclif/test` | latest | oclif command testing helpers | Provides `runCommand()` helper that captures stdout/stderr for assertion; works with oclif's command loading |
## Full Dependency Map
### Runtime Dependencies (`dependencies`)
### Dev Dependencies (`devDependencies`)
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
## Installation
# Init with oclif generator (creates package.json, tsconfig, bin entrypoint)
# Runtime deps
# Dev deps
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
