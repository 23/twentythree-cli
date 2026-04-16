# Phase 1: Foundation - Research

**Researched:** 2026-04-14
**Domain:** oclif v4 monorepo scaffold + tsdown + openapi-typescript + pnpm workspaces + turborepo + changesets
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **OpenAPI type generation:** `pnpm generate-types` fetches from `https://video.twentythree.com/apidocs/swagger.json` (public, no auth required) → outputs `packages/twentythree-cli/src/api/types.ts`. Generated types committed to repo; script is re-runnable.
- **Monorepo scope:** Two packages from day one: `twentythree-cli` (real CLI) and `twentythree-skills` (stub — SKILL.md placeholder only, no real content)
- **Node minimum:** Node 22. Set in `engines` in both packages and root `package.json`. CLI prints clear error and exits non-zero on Node < 22.
- **CLI framework:** oclif v4 (`@oclif/core` 4.x), file-per-command layout, lazy manifest, topic namespacing. Binary: `twentythree`. npm package: `twentythree-cli`.
- **Build:** tsdown (NOT tsup — tsup is abandoned). Bundle to CJS for oclif compatibility.
- **Terminology module:** `term-map.ts` at `packages/twentythree-cli/src/lib/term-map.ts`. Bidirectional: `photo`↔`video`, `album`↔`category`, `live`↔`webinar`. Applied to ALL user-visible output including error messages.
- **Stack pins:** chalk ^4 (NOT 5.x — ESM-only), ora ^5 (NOT 6.x — ESM-only), @clack/prompts (latest), @napi-rs/keyring (NOT keytar — archived), conf for non-sensitive config, vitest for testing.

### Claude's Discretion

- Exact pnpm workspace / turborepo pipeline configuration
- tsdown entry point and output target details
- oclif manifest generation script setup
- Exact structure of `term-map.ts` exports (functions vs object vs both)

### Deferred Ideas (OUT OF SCOPE)

- Browser OAuth login (`twentythree auth login`) — deferred to v2
- AI skills content (`twentythree-skills` package body) — stub in Phase 1, real content in v2
- Shell completions — Phase 8 / v2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | pnpm monorepo with two packages: `twentythree-cli` (global binary) and `twentythree-skills` (SKILL.md only) | pnpm-workspace.yaml + turborepo patterns documented in Architecture Patterns section |
| FOUND-02 | CLI built with oclif v4, TypeScript, bundled via tsdown into a single entry point | oclif v4 package.json structure + tsdown unbundle mode documented in Standard Stack + Architecture Patterns |
| FOUND-03 | Globally installable via `npm install -g twentythree-cli`; runnable as `twentythree` | bin entrypoint wiring documented in Architecture Patterns |
| FOUND-04 | `engines` field enforces Node 22; CLI prints clear error and exits on unsupported versions | init hook Node check pattern documented in Architecture Patterns |
| FOUND-05 | OpenAPI types generated from spec and committed as `api/types.ts`; generation script re-runnable | openapi-typescript v7 CLI command documented in Standard Stack + Code Examples |
| FOUND-06 | `term-map.ts` translates `photo`→`video`, `album`→`category`, `live`→`webinar` — all user-visible output | term-map.ts structure and exports documented in Architecture Patterns + Code Examples |
</phase_requirements>

---

## Summary

Phase 1 scaffolds a greenfield pnpm monorepo containing two packages: `twentythree-cli` (the real CLI, built with oclif v4 and tsdown) and `twentythree-skills` (a stub with only a `SKILL.md` placeholder). The phase delivers no real commands beyond `--version` and `--help`, but establishes the full structural, build, and type-generation foundation that every downstream phase depends on.

The critical architectural insight is that **oclif does not support single-file bundling**. It requires the `dist/commands` directory tree to be intact at runtime for lazy loading. tsdown's `unbundle: true` mode is the correct build strategy — it compiles each TypeScript source file individually to a mirrored `dist/` directory (transpile-only, no merging), which satisfies oclif's command discovery while still benefiting from Rolldown's speed and TypeScript transformation. The `bin/run.js` entrypoint (a thin shim) tells oclif where to find its root; it does NOT bundle the command tree.

The Node 22 minimum check must run before oclif loads. The correct mechanism is a plain JavaScript guard at the top of `bin/run.js` that checks `process.version` before `require`-ing oclif — this fires even on old Node runtimes that would otherwise crash on newer syntax. The oclif `init` hook fires after oclif is already loaded, so it cannot catch pre-load Node version failures cleanly.

**Primary recommendation:** Use tsdown with `unbundle: true, format: 'cjs'` for the CLI package; use a plain Node version guard in `bin/run.js` (not an oclif hook) for the startup version check; generate types once with `openapi-typescript` CLI from the public spec URL.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@oclif/core` | 4.10.5 | CLI framework: command dispatch, help, flag parsing, lazy loading | Only TypeScript-first framework for large multi-command CLIs; lazy-loads per-command at invocation; topic namespacing built in |
| `oclif` | 4.23.0 | CLI tooling: manifest generation, release tooling | Generates `oclif.manifest.json`; wires `bin` entrypoints; `prepack` integration |
| `tsdown` | 0.21.8 | Transpile TypeScript → CJS in unbundle mode | Rolldown-powered; `unbundle: true` preserves file-per-file structure oclif requires; actively maintained successor to tsup |
| `typescript` | 5.x | Type checking | Type checking in CI; tsdown handles transpilation; declarations via tsdown `dts: true` |
| `openapi-typescript` | 7.13.0 | Generate types from OpenAPI spec | Types-only; zero runtime cost; fetches from remote URL directly; output is a single `.d.ts` file |
| `openapi-fetch` | 0.17.0 | Type-safe HTTP client | Tiny (~6 KB); runtime client that consumes the generated types; middleware for auth injection |
| `vitest` | 4.1.4 | Test runner | Native TypeScript; Jest-compatible API; fast; no ts-jest config needed |

[VERIFIED: npm registry — versions confirmed via `npm view` 2026-04-14]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `turbo` | 2.9.6 | Monorepo task orchestration | Build, test, lint pipelines with caching |
| `@changesets/cli` | 2.30.0 | Version management and publishing | Changelog generation, coordinated package bumps |

[VERIFIED: npm registry — versions confirmed via `npm view` 2026-04-14]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| tsdown unbundle | tsup | tsup is officially abandoned; tsdown is the endorsed successor |
| tsdown unbundle | tsc directly | tsc works but tsdown is faster (Rolldown/Rust) and has better DX |
| Node guard in bin/run.js | oclif init hook | init hook fires after oclif loads — too late to catch old Node that crashes on modern syntax |
| pnpm | npm workspaces | pnpm is faster, stricter phantom dependency isolation; decision already locked |

### Installation (root workspace)

```bash
# Root devDeps
pnpm add -Dw turbo @changesets/cli typescript

# twentythree-cli package
pnpm --filter twentythree-cli add @oclif/core openapi-fetch
pnpm --filter twentythree-cli add -D oclif tsdown openapi-typescript vitest @oclif/test

# Verify type generation (one-off check)
npx openapi-typescript https://video.twentythree.com/apidocs/swagger.json -o /tmp/types-check.d.ts
```

**Version verification (confirmed 2026-04-14):**
- `@oclif/core`: 4.10.5 [VERIFIED: npm registry]
- `oclif`: 4.23.0 [VERIFIED: npm registry]
- `tsdown`: 0.21.8 [VERIFIED: npm registry]
- `openapi-typescript`: 7.13.0 [VERIFIED: npm registry]
- `openapi-fetch`: 0.17.0 [VERIFIED: npm registry]
- `vitest`: 4.1.4 [VERIFIED: npm registry]
- `turbo`: 2.9.6 [VERIFIED: npm registry]
- `@changesets/cli`: 2.30.0 [VERIFIED: npm registry]
- `pnpm` (installed on machine): 10.33.0 [VERIFIED: local environment]

---

## Architecture Patterns

### Recommended Project Structure

```
twentythree-cli/              # repo root
├── package.json              # private: true; pnpm workspace root; turbo scripts
├── pnpm-workspace.yaml       # declares packages/*
├── turbo.json                # build/test/lint pipelines
├── tsconfig.base.json        # shared TS base config
├── .changeset/
│   └── config.json           # changesets config
└── packages/
    ├── twentythree-cli/
    │   ├── package.json      # name: twentythree-cli; bin: twentythree
    │   ├── tsconfig.json     # extends ../../tsconfig.base.json
    │   ├── tsdown.config.ts  # unbundle: true, format: cjs
    │   ├── bin/
    │   │   ├── run.js        # production entrypoint (Node guard + oclif run)
    │   │   ├── run.cmd       # Windows production entrypoint
    │   │   ├── dev.js        # dev entrypoint (ts-node/tsx)
    │   │   └── dev.cmd       # Windows dev entrypoint
    │   └── src/
    │       ├── index.ts      # re-exports for programmatic use (optional)
    │       ├── commands/     # one file per command; oclif discovers via dist/commands
    │       │   └── .gitkeep  # Phase 1: no real commands yet
    │       ├── api/
    │       │   └── types.ts  # generated from swagger.json; committed
    │       └── lib/
    │           └── term-map.ts  # terminology translation module
    └── twentythree-skills/
        ├── package.json      # name: twentythree-skills
        └── SKILL.md          # stub placeholder only
```

[VERIFIED: oclif docs — commands directory structure; VERIFIED: tsdown docs — unbundle mode output]

### Pattern 1: pnpm-workspace.yaml

**What:** Declares which directories are packages in the monorepo.

```yaml
# pnpm-workspace.yaml (repo root)
packages:
  - "packages/*"
```

[CITED: https://pnpm.io/workspaces]

### Pattern 2: Root package.json

**What:** Workspace root with private flag, package manager spec, and turborepo scripts.

```json
{
  "private": true,
  "name": "twentythree-cli-monorepo",
  "packageManager": "pnpm@10.33.0",
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=10.0.0"
  },
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "generate-types": "openapi-typescript https://video.twentythree.com/apidocs/swagger.json -o packages/twentythree-cli/src/api/types.ts"
  },
  "devDependencies": {
    "turbo": "^2.9.6",
    "@changesets/cli": "^2.30.0",
    "typescript": "^5.0.0"
  }
}
```

[ASSUMED: exact `packageManager` field value; pattern itself is standard pnpm workspace convention]

### Pattern 3: turbo.json Pipeline

**What:** Defines build/test task dependencies and output caching for the two-package monorepo.

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.ts", "test/**/*.ts", "vitest.config.*"]
    },
    "lint": {
      "inputs": ["src/**/*.ts", ".eslintrc*"]
    },
    "generate-types": {
      "outputs": ["src/api/types.ts"],
      "cache": false
    }
  }
}
```

Note: Turborepo 2.x uses `tasks` (not `pipeline`). [CITED: https://turbo.build/repo/docs/reference/configuration]

[ASSUMED: exact schema field names — turborepo v2 renamed `pipeline` to `tasks`; verify against current turbo docs during implementation]

### Pattern 4: twentythree-cli package.json

**What:** The CLI package configuration — the most important file for oclif wiring.

```json
{
  "name": "twentythree-cli",
  "version": "0.1.0",
  "description": "Terminal access to every TwentyThree API endpoint",
  "license": "MIT",
  "type": "commonjs",
  "engines": {
    "node": ">=22.0.0"
  },
  "bin": {
    "twentythree": "./bin/run.js"
  },
  "main": "./dist/index.js",
  "files": [
    "/bin",
    "/dist",
    "/oclif.manifest.json"
  ],
  "scripts": {
    "build": "tsdown",
    "postbuild": "oclif manifest",
    "test": "vitest run",
    "dev": "node --loader ts-node/esm ./bin/dev.js"
  },
  "oclif": {
    "bin": "twentythree",
    "dirname": "twentythree",
    "commands": "./dist/commands",
    "topicSeparator": " "
  },
  "dependencies": {
    "@oclif/core": "^4.10.5",
    "openapi-fetch": "^0.17.0"
  },
  "devDependencies": {
    "oclif": "^4.23.0",
    "tsdown": "^0.21.8",
    "typescript": "^5.0.0",
    "openapi-typescript": "^7.13.0",
    "vitest": "^4.1.4",
    "@oclif/test": "latest"
  }
}
```

Key fields:
- `"type": "commonjs"` — required for oclif CJS compat [VERIFIED: oclif docs + chalk/ora pin requirement]
- `"files"` — must include `/bin`, `/dist`, `/oclif.manifest.json` for npm global install [CITED: https://oclif.io/docs/introduction]
- `"oclif.commands": "./dist/commands"` — where oclif discovers commands after build [CITED: https://oclif.io/docs/configuring_your_cli]
- `"oclif.topicSeparator": " "` — space-separated topics (`twentythree video list`) not colon-separated [ASSUMED: space separator preferred for UX; colon is oclif default]

### Pattern 5: tsdown.config.ts (unbundle mode — correct for oclif)

**What:** tsdown configuration for the CLI package. Uses unbundle mode to preserve file-per-file directory structure.

**Critical:** oclif discovers commands by scanning `dist/commands/*.js`. A single-bundle output would prevent this. `unbundle: true` compiles each `src/` file to a matching `dist/` file.

```typescript
// packages/twentythree-cli/tsdown.config.ts
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.ts'],
  outDir: 'dist',
  format: 'cjs',
  unbundle: true,
  clean: true,
  dts: false,       // CLI binary; no consumers need declarations
  sourcemap: false, // production; enable locally if needed
  target: 'node22',
})
```

[CITED: https://tsdown.dev/options/unbundle — unbundle mode docs confirm file-per-file output]
[VERIFIED: tsdown CLI docs confirm --unbundle flag exists and is supported]

### Pattern 6: bin/run.js — Production Entrypoint with Node Guard

**What:** The production entrypoint. This file must be plain JavaScript (not TypeScript) because it runs before any build step. The Node version guard goes HERE, before any `require('@oclif/core')`, so it fires even on ancient Node runtimes.

```javascript
#!/usr/bin/env node
// bin/run.js — MUST be plain JavaScript

// Node version guard: runs BEFORE oclif loads
// This is the only location that catches old Node reliably.
// The oclif init hook fires too late (after oclif itself is loaded).
const nodeVersion = process.versions.node
const [major] = nodeVersion.split('.').map(Number)
if (major < 22) {
  process.stderr.write(
    `\nError: twentythree requires Node.js 22 or later.\n` +
    `You are running Node.js ${nodeVersion}.\n` +
    `Please upgrade: https://nodejs.org\n\n`
  )
  process.exit(1)
}

// Load oclif only after version check passes
const { run } = require('@oclif/core')
const { handle } = require('@oclif/core/handle')

run(process.argv.slice(2), require('../package.json'))
  .catch(async (error) => {
    await handle(error)
  })
```

[CITED: https://oclif.io/docs/introduction — bin/run.js is the standard production entrypoint]
[ASSUMED: exact `handle` import path — verify against @oclif/core 4.x API during implementation]

### Pattern 7: bin/dev.js — Development Entrypoint

```javascript
#!/usr/bin/env node
// bin/dev.js — development mode; auto-transpiles TypeScript via tsx

process.env.NODE_ENV = 'development'

// tsx (or ts-node) for dev-time TypeScript execution
// Requires tsx in devDependencies or globally available
import('tsx/cjs').then(() => {
  const { run } = require('@oclif/core')
  const { handle } = require('@oclif/core/handle')
  run(process.argv.slice(2), require('../package.json'))
    .catch(async (error) => {
      await handle(error)
    })
}).catch(() => {
  // Fallback: run compiled dist
  const { run } = require('@oclif/core')
  const { handle } = require('@oclif/core/handle')
  run(process.argv.slice(2), require('../package.json'))
    .catch(async (error) => {
      await handle(error)
    })
})
```

[ASSUMED: tsx integration pattern for oclif dev mode — verify during implementation]

### Pattern 8: Minimal oclif Command File

**What:** How a command file looks in oclif v4. Phase 1 needs no real commands, but the `--version` output is handled by oclif automatically via the `version` field in package.json — no command file needed.

```typescript
// src/commands/hello.ts — example; not needed in Phase 1
import { Command } from '@oclif/core'

export default class Hello extends Command {
  static description = 'Say hello'

  async run(): Promise<void> {
    this.log('Hello from twentythree')
  }
}
```

`--version` is handled by oclif core automatically when `version` is in `package.json`. No explicit version command file is required in Phase 1. [CITED: https://oclif.io/docs/commands]

### Pattern 9: openapi-typescript v7 Type Generation

**What:** The exact CLI command to generate types from the TwentyThree API spec.

```bash
# Generate types (run from repo root or as npm script)
npx openapi-typescript https://video.twentythree.com/apidocs/swagger.json \
  -o packages/twentythree-cli/src/api/types.ts

# Or as package.json script (recommended):
# "generate-types": "openapi-typescript https://video.twentythree.com/apidocs/swagger.json -o packages/twentythree-cli/src/api/types.ts"
```

The output is a `paths` interface (keyed by URL path) and `components` interface — consumed by `openapi-fetch`. [CITED: https://openapi-ts.dev/cli]

Using the generated types with openapi-fetch:
```typescript
// src/lib/client.ts
import createClient from 'openapi-fetch'
import type { paths } from '../api/types.js'

export const client = createClient<paths>({
  baseUrl: 'https://video.example.com',
})

// Type-safe usage:
// const { data, error } = await client.GET('/api/2/photo/list', { ... })
```

[CITED: https://openapi-ts.dev/openapi-fetch/]

### Pattern 10: term-map.ts Module

**What:** Canonical bidirectional terminology translation. Recommended exports: two functions (`toCliTerm` and `toApiTerm`) plus a typed `TERM_MAP` constant. Functions are preferred over raw object access so callers don't need to handle undefined — unknown terms pass through unchanged.

```typescript
// packages/twentythree-cli/src/lib/term-map.ts

/**
 * Maps API legacy terms → modern CLI terms (for display)
 * Maps CLI modern terms → API legacy terms (for request construction)
 */

// API → CLI (for output display)
const API_TO_CLI: Record<string, string> = {
  photo: 'video',
  album: 'category',
  live: 'webinar',
}

// CLI → API (for constructing API requests)
const CLI_TO_API: Record<string, string> = Object.fromEntries(
  Object.entries(API_TO_CLI).map(([k, v]) => [v, k])
)

/**
 * Convert an API legacy term to the modern CLI term.
 * Unknown terms are returned unchanged.
 *
 * @example toCliTerm('photo') // 'video'
 * @example toCliTerm('unknown') // 'unknown'
 */
export function toCliTerm(apiTerm: string): string {
  return API_TO_CLI[apiTerm.toLowerCase()] ?? apiTerm
}

/**
 * Convert a CLI modern term back to the API legacy term.
 * Unknown terms are returned unchanged.
 *
 * @example toApiTerm('video') // 'photo'
 * @example toApiTerm('unknown') // 'unknown'
 */
export function toApiTerm(cliTerm: string): string {
  return CLI_TO_API[cliTerm.toLowerCase()] ?? cliTerm
}

/**
 * Apply term mapping to an entire string, replacing all occurrences
 * of API legacy terms with CLI modern terms.
 * Used for mapping error message bodies and API response text.
 *
 * @example applyCliTerms('photo_id refers to a photo') // 'video_id refers to a video'
 */
export function applyCliTerms(text: string): string {
  let result = text
  for (const [apiTerm, cliTerm] of Object.entries(API_TO_CLI)) {
    result = result.replaceAll(apiTerm, cliTerm)
  }
  return result
}

// Export the maps for inspection/testing
export const TERM_MAP = { API_TO_CLI, CLI_TO_API }
```

[ASSUMED: function-based export structure (vs object-only) — this is Claude's discretion per CONTEXT.md]

### Pattern 11: twentythree-skills package.json (stub)

```json
{
  "name": "twentythree-skills",
  "version": "0.1.0",
  "description": "AI agent skills for the TwentyThree CLI",
  "license": "MIT",
  "files": [
    "SKILL.md"
  ],
  "keywords": ["ai", "skills", "twentythree", "cli"]
}
```

No dependencies. No scripts. SKILL.md content is v2 work. [ASSUMED: minimal stub structure; based on basecamp/skills pattern]

### Pattern 12: SKILL.md Stub (twentythree-skills)

**What:** A placeholder SKILL.md. Real content is deferred to v2. The stub establishes the file and format without committing to content.

```markdown
---
name: twentythree
description: |
  TwentyThree CLI skills for AI agents.
  Commands for managing videos, categories, webinars, and all TwentyThree resources.
triggers:
  - twentythree
  - video platform
  - webinar management
invocable: true
argument-hint: "<command> [flags]"
---

# TwentyThree CLI

> Skills content is a work in progress. This package will contain AI agent skills covering all TwentyThree CLI commands when complete.

See [twentythree-cli](https://www.npmjs.com/package/twentythree-cli) for the CLI itself.
```

[CITED: https://github.com/basecamp/skills — SKILL.md frontmatter format with name, description, triggers, invocable fields]

### Pattern 13: .changeset/config.json

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "linked": [["twentythree-cli", "twentythree-skills"]],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

`linked` keeps both packages versioned together (same version bump always). [CITED: https://pnpm.io/using-changesets]
[ASSUMED: `linked` field syntax — verify with changesets docs during implementation]

### Pattern 14: tsconfig.base.json (repo root)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": false,
    "sourceMap": false,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

Each package's `tsconfig.json` extends this. TypeScript is used only for type checking in CI — tsdown handles transpilation.

### Anti-Patterns to Avoid

- **Single-file bundle with tsdown:** Do NOT use tsdown without `unbundle: true` for the CLI package. A bundled single file cannot work with oclif's command discovery. [VERIFIED: oclif docs — "you will not be able to successfully bundle your entire CLI into a single file"]
- **Using tsup:** tsup is officially abandoned. Its GitHub README points to tsdown. Never use tsup in this project. [CITED: https://github.com/egoist/tsup]
- **chalk 5 / ora 6:** Both are ESM-only and incompatible with oclif's CJS output. Pins are `chalk@^4` and `ora@^5`. [VERIFIED: CLAUDE.md — explicit version pins with reasoning]
- **keytar:** Archived December 2022. Use `@napi-rs/keyring` instead. [CITED: CLAUDE.md]
- **Node check in oclif init hook:** The init hook fires after oclif loads. On Node < 22, the `@oclif/core` require itself may fail first. Put the guard in `bin/run.js` instead.
- **Committing `oclif.manifest.json` — depends on workflow:** oclif's `prepack` script regenerates the manifest. If manifests are generated at build time and committed, they must be regenerated before publish. The `postbuild: oclif manifest` script handles this.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TypeScript type defs from OpenAPI spec | Custom type generator | `openapi-typescript` v7 | Handles all OpenAPI 3.x constructs; battle-tested against thousands of specs; re-runnable |
| Type-safe HTTP client | Fetch wrapper with manual types | `openapi-fetch` | Already proven with `openapi-typescript` output; tiny; middleware system for auth |
| OS keychain access | Platform detection + native calls | `@napi-rs/keyring` | NAPI-RS native addon handles macOS/Windows/Linux differences; battle-tested |
| Version bump + changelog | Manual CHANGELOG.md editing | `@changesets/cli` | Handles multi-package version coordination; standard in pnpm monorepos |
| Task orchestration with caching | npm scripts chaining | `turbo` | Build cache prevents re-running unchanged packages; parallelizes independent tasks |

---

## Common Pitfalls

### Pitfall 1: oclif Cannot Discover Commands in a Single Bundle

**What goes wrong:** Developer configures tsdown to produce a single `dist/index.js` bundle. `oclif manifest` fails; `twentythree --help` shows no commands; lazy loading silently fails.

**Why it happens:** oclif's pattern-based command discovery scans for `.js` files in `dist/commands/`. A single bundle merges all commands into one file with no individual discoverable paths.

**How to avoid:** Always use `unbundle: true` in tsdown config. Confirm `dist/commands/` contains individual `.js` files after build.

**Warning signs:** `oclif.manifest.json` is empty or missing; `twentythree --help` shows only base flags; no commands listed.

[VERIFIED: oclif docs — "you will not be able to successfully bundle your entire CLI...into a single file"]

### Pitfall 2: Node Version Check Fires Too Late

**What goes wrong:** Node check placed in oclif init hook. On Node 14, `require('@oclif/core')` itself throws because oclif v4 uses modern syntax. The user sees a cryptic crash instead of the helpful version error.

**Why it happens:** oclif init hook is a TypeScript/JavaScript function that loads with oclif. It cannot fire if oclif fails to load.

**How to avoid:** Place the version check at the very top of `bin/run.js`, before any `require()` call.

**Warning signs:** Testing Node version check on old Node shows unhandled `SyntaxError` or `TypeError` instead of the intended error message.

[ASSUMED: exact oclif v4 minimum Node version (documented as >=18.0.0 for oclif v4 itself, but project enforces >=22); guard pattern is standard]

### Pitfall 3: pnpm Workspace Bin Linking Before Build

**What goes wrong:** pnpm fails to link the `twentythree` binary during `pnpm install` because `./bin/run.js` doesn't exist yet (it's not compiled). Error: `ERR_PNPM_PREPARE_FAILED`.

**Why it happens:** pnpm tries to link bin scripts during install. If the referenced `bin/run.js` is not in the repo (only generated by build), the link fails.

**How to avoid:** Commit `bin/run.js` directly to the repo (it's a plain `.js` shim, not a build artifact). Do not gitignore it.

[CITED: https://webpro.nl/scraps/compiled-bin-in-typescript-monorepo — pnpm bin linking before build issue]

### Pitfall 4: ESM-Only Libraries in CJS Context

**What goes wrong:** Installing chalk 5 or ora 6 causes runtime `ERR_REQUIRE_ESM` when oclif tries to load them in CJS mode.

**Why it happens:** These libraries changed to ESM-only starting at chalk@5 and ora@6. The project uses `"type": "commonjs"`.

**How to avoid:** Pin `chalk@^4` and `ora@^5`. These pins are documented in CLAUDE.md and must not be upgraded until the CLI is fully ESM.

**Warning signs:** `require() of ES Module` error at startup.

[VERIFIED: CLAUDE.md — explicit pins with rationale]

### Pitfall 5: openapi-typescript Output Requires Explicit .js Extensions in Imports (ESM Only)

**What goes wrong:** In CJS projects, this pitfall does NOT apply. But if the project ever migrates to ESM, imports of `../api/types` will need `.js` extension.

**How to avoid:** In Phase 1 CJS mode, bare imports work. Document this for the future ESM migration.

[ASSUMED: standard CJS module resolution allows extensionless imports]

### Pitfall 6: oclif Manifest Stale After Adding Commands

**What goes wrong:** A new command file is added in Phase 2+ but `oclif.manifest.json` is not regenerated. `twentythree --help` doesn't list the new command. This is a CI/CD issue, not a local dev issue.

**Why it happens:** `oclif.manifest.json` is a snapshot. It must be regenerated after any command file change.

**How to avoid:** The `postbuild` script runs `oclif manifest` automatically after every `tsdown` build. Ensure CI runs `pnpm build` before packaging.

[CITED: https://oclif.io/docs/command_discovery_strategies — manifest caching behavior]

---

## Code Examples

### Generating Types from Live Spec

```bash
# Source: https://openapi-ts.dev/cli
npx openapi-typescript https://video.twentythree.com/apidocs/swagger.json \
  -o packages/twentythree-cli/src/api/types.ts
```

### Using Generated Types with openapi-fetch

```typescript
// Source: https://openapi-ts.dev/openapi-fetch/
import createClient from 'openapi-fetch'
import type { paths } from '../api/types.js'

const client = createClient<paths>({ baseUrl: 'https://video.example.com' })

const { data, error } = await client.GET('/api/2/photo/list', {
  params: { query: { album_id: 123 } }
})
```

### oclif Lifecycle Hook (init — for reference only, NOT for Node check)

```typescript
// Source: https://oclif.io/docs/hooks
import { Hook } from '@oclif/core'

const hook: Hook.Init = async function (options) {
  // This runs after oclif loads — safe for workspace validation, NOT for Node check
}
export default hook
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tsup for bundling | tsdown (tsup successor) | 2024 (tsup archived) | tsdown is actively maintained; same API surface |
| keytar for keychain | @napi-rs/keyring | Dec 2022 (keytar archived) | Drop-in replacement; Rust-backed; MSAL-endorsed |
| Mocha for oclif testing | vitest + @oclif/test | 2024 | vitest is faster; oclif's test helpers work with any runner |
| `pipeline` key in turbo.json | `tasks` key in turbo.json | Turborepo v2 (2024) | Old `pipeline` key is deprecated; use `tasks` |
| `type: "module"` for ESM oclif | `type: "commonjs"` with chalk ^4/ora ^5 pins | Ongoing | Chalk 5/ora 6 ESM-only forces CJS pin until full ESM migration |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `oclif.topicSeparator: " "` is correct for `twentythree video list` UX | Pattern 4 (package.json) | Default is `:` — commands would be `twentythree:video:list`; fixable at any time |
| A2 | Turborepo v2 uses `tasks` key (not `pipeline`) in turbo.json | Pattern 3 (turbo.json) | Build pipeline would silently not run if wrong key used; verify against current turbo.json schema |
| A3 | `linked` field syntax in `.changeset/config.json` | Pattern 13 | If wrong, version bumps would be independent; minor coordination issue |
| A4 | `@oclif/core/handle` is the correct v4 import path for error handling | Pattern 6 (bin/run.js) | Runtime crash at CLI invocation; fixable by checking @oclif/core 4.x API |
| A5 | tsx integration for dev mode in bin/dev.js | Pattern 7 | Dev mode only; no production impact; fixable during Phase 1 implementation |
| A6 | SKILL.md frontmatter uses `name`, `description`, `triggers`, `invocable`, `argument-hint` fields | Pattern 12 | Stub only; no functional impact in Phase 1; real content is v2 |
| A7 | tsdown `target: 'node22'` is a valid target identifier | Pattern 5 | Build may fail or output wrong target; use `node22` or check tsdown target options |

---

## Open Questions

1. **Does `twentythree --version` work without an explicit version command file?**
   - What we know: oclif v4 automatically handles `--version` from `package.json.version`
   - What's unclear: Whether the auto-version output format matches expectations (`twentythree/0.1.0 darwin-arm64 node-v22.x`)
   - Recommendation: Verify during Wave 0 by running `node bin/run.js --version` after build

2. **Should `oclif.manifest.json` be gitignored or committed?**
   - What we know: `prepack` regenerates it; it's a snapshot
   - What's unclear: Whether committing it improves CI performance or causes merge conflicts
   - Recommendation: Commit it (standard oclif practice); regenerate in CI `postbuild`

3. **Does tsdown `unbundle: true` handle `src/**/*.ts` glob entries correctly including subdirectories?**
   - What we know: tsdown docs confirm unbundle mode preserves directory structure
   - What's unclear: Whether `entry: ['src/**/*.ts', '!src/**/*.test.ts']` glob exclusion works as expected
   - Recommendation: Verify with a small test build during Wave 0

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All | Yes | v22.22.2 | — |
| npm | Package installs | Yes | 10.9.7 | — |
| pnpm | Monorepo workspace | Yes (installed during research) | 10.33.0 | — |
| curl/https fetch | openapi-typescript remote URL fetch | Yes (built into Node) | — | — |
| Internet access to video.twentythree.com | `generate-types` script | Assumed yes (no offline fallback) | — | Manual: download spec and use local file path |

**Missing dependencies with no fallback:**
- None that would block execution

**Missing dependencies with fallback:**
- `video.twentythree.com` reachability: if spec is unreachable during type generation, use `openapi-typescript ./swagger.json -o ...` with a locally cached copy

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.1.4 |
| Config file | `packages/twentythree-cli/vitest.config.ts` — Wave 0 gap |
| Quick run command | `pnpm --filter twentythree-cli test` |
| Full suite command | `pnpm test` (turbo runs all packages) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-04 | Node < 22 prints error and exits non-zero | unit | `vitest run src/lib/__tests__/node-check.test.ts` | Wave 0 gap |
| FOUND-06 | `toCliTerm('photo')` → `'video'`, `toCliTerm('album')` → `'category'`, `toCliTerm('live')` → `'webinar'` | unit | `vitest run src/lib/__tests__/term-map.test.ts` | Wave 0 gap |
| FOUND-06 | `toApiTerm('video')` → `'photo'`, `toApiTerm('category')` → `'album'`, `toApiTerm('webinar')` → `'live'` | unit | `vitest run src/lib/__tests__/term-map.test.ts` | Wave 0 gap |
| FOUND-06 | `applyCliTerms(str)` replaces all occurrences of API terms in a string | unit | `vitest run src/lib/__tests__/term-map.test.ts` | Wave 0 gap |
| FOUND-03 | `twentythree --version` prints version string | smoke | `node bin/run.js --version` (manual after build) | N/A — manual |
| FOUND-05 | `api/types.ts` exists and is valid TypeScript (tsc check) | build check | `tsc --noEmit` | Wave 0 gap |

### Sampling Rate

- **Per task commit:** `pnpm --filter twentythree-cli test`
- **Per wave merge:** `pnpm test` (full turbo suite)
- **Phase gate:** Full suite green + `tsc --noEmit` passes + `bin/run.js --version` prints correctly before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `packages/twentythree-cli/vitest.config.ts` — framework config
- [ ] `packages/twentythree-cli/src/lib/__tests__/term-map.test.ts` — covers FOUND-06 (6 test cases minimum: 3 toCliTerm, 3 toApiTerm, 1 applyCliTerms)
- [ ] `packages/twentythree-cli/src/lib/__tests__/node-check.test.ts` — covers FOUND-04 (test the guard logic in isolation)

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase 2 concern |
| V3 Session Management | No | Phase 2 concern |
| V4 Access Control | No | Phase 2 concern |
| V5 Input Validation | No | No user input in Phase 1 |
| V6 Cryptography | No | No token storage in Phase 1 |

Phase 1 establishes infrastructure only — no credentials, no API calls, no user input. Security surface is deferred to Phase 2 (AUTH-01 through AUTH-11).

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: npm registry] — `@oclif/core@4.10.5`, `oclif@4.23.0`, `tsdown@0.21.8`, `openapi-typescript@7.13.0`, `openapi-fetch@0.17.0`, `vitest@4.1.4`, `turbo@2.9.6`, `@changesets/cli@2.30.0` — all confirmed via `npm view` 2026-04-14
- [https://oclif.io/docs/configuring_your_cli](https://oclif.io/docs/configuring_your_cli) — oclif package.json `oclif` section fields
- [https://oclif.io/docs/command_discovery_strategies/](https://oclif.io/docs/command_discovery_strategies/) — manifest lazy loading and bundling limitation
- [https://oclif.io/docs/hooks](https://oclif.io/docs/hooks) — init hook lifecycle
- [https://oclif.io/docs/commands](https://oclif.io/docs/commands) — command file structure and `run()` method
- [https://tsdown.dev/options/unbundle](https://tsdown.dev/options/unbundle) — unbundle mode docs
- [https://tsdown.dev/reference/cli](https://tsdown.dev/reference/cli) — `--unbundle` CLI flag
- [https://openapi-ts.dev/cli](https://openapi-ts.dev/cli) — CLI usage and remote URL support
- [https://openapi-ts.dev/openapi-fetch/](https://openapi-ts.dev/openapi-fetch/) — createClient pattern
- [https://pnpm.io/using-changesets](https://pnpm.io/using-changesets) — changesets setup with pnpm
- [https://pnpm.io/workspaces](https://pnpm.io/workspaces) — pnpm-workspace.yaml format
- [https://turborepo.dev/repo/docs/crafting-your-repository/structuring-a-repository](https://turborepo.dev/repo/docs/crafting-your-repository/structuring-a-repository) — turborepo pnpm workspace layout

### Secondary (MEDIUM confidence)
- [https://github.com/basecamp/skills](https://github.com/basecamp/skills) — SKILL.md format and frontmatter fields (basecamp pattern)
- [https://webpro.nl/scraps/compiled-bin-in-typescript-monorepo](https://webpro.nl/scraps/compiled-bin-in-typescript-monorepo) — pnpm bin linking before build pitfall

### Tertiary (LOW confidence)
- [https://raw.githubusercontent.com/antfu/skills/refs/heads/main/skills/tsdown/SKILL.md](https://raw.githubusercontent.com/antfu/skills/refs/heads/main/skills/tsdown/SKILL.md) — SKILL.md structure reference (antfu's tsdown skills)

---

## Metadata

**Confidence breakdown:**
- Standard stack versions: HIGH — all verified against npm registry 2026-04-14
- Architecture patterns: HIGH for oclif+tsdown structure; MEDIUM for turbo.json `tasks` key (A2)
- Pitfalls: HIGH for bundle/CJS pitfalls (verified against oclif docs); MEDIUM for Node check placement (assumed from oclif load order)
- term-map.ts structure: MEDIUM — export shape is Claude's discretion; logic is trivially correct

**Research date:** 2026-04-14
**Valid until:** 2026-07-14 (90 days — stable tooling; re-verify oclif/tsdown versions before implementation)
