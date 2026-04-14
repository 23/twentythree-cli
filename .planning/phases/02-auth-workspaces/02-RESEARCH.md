# Phase 2: Auth & Workspaces - Research

**Researched:** 2026-04-14
**Domain:** CLI authentication, credential storage, workspace management, HTTP client factory
**Confidence:** HIGH (library APIs verified; /user/tokens response shape CONFIRMED from live API — see Pattern 6)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Two token types**: User login tokens (long-lived, stored in keychain, never refresh) vs cross-site workspace tokens (expire, refresh by re-calling `/api/2/user/tokens?cross_sites_p=1`)
- **Re-auth behavior**: `auth credentials` is per-domain — overwrites existing entry for that domain, adds new entry for new domains; no confirmation before overwrite
- **Workspace identity**: Matched by display name OR domain (case-insensitive contains OR exact domain match); exact domain takes precedence; ambiguous match → present list
- **Workspace storage schema**: `{ domain, display_name, bearer_token, expiration_time, api_base_url, site_name, canonical_user_p, starred_p }` in `conf` — field names match live `/api/2/user/tokens` response exactly (CONFIRMED from live API)
- **Output header**: `[domain]` prefix once at top of command output in dim/muted style
- **API client location**: `src/api/client.ts` — factory function taking workspace config; `Authorization: Bearer` header only when token configured; no header in domain-only mode
- **Domain-only / anonymous mode**: Token is optional; skips workspace discovery; only 11 anonymous-scope endpoints accessible; commands requiring auth fail with exact message: "This command requires authentication — run `twentythree auth credentials` to add a bearer token"

### Claude's Discretion

- Exact `conf` schema / key names for stored workspace list
- Token refresh timing window (e.g., refresh if < N minutes remaining)
- File lock implementation for concurrent invocations
- Interactive prompt styling (clack/prompts component choices)
- Error message wording beyond the AUTH-10 specified message

### Deferred Ideas (OUT OF SCOPE)

- Browser OAuth login (`twentythree auth login`) — v2
- Interactive fuzzy workspace search — v2 (UX-02)
- Shell completions for `--workspace` values — v2
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | `auth credentials` prompts domain + bearer token (optional), stores securely in OS keychain via `@napi-rs/keyring` | Entry class API verified; setPassword/getPassword/deletePassword signatures documented |
| AUTH-02 | When token provided, calls `/api/2/user/tokens?cross_sites_p=1` to discover workspaces; domain-only skips discovery | CONFIRMED from live API — response is `{ status, sites: WorkspaceEntry[] }` with exact field names in Pattern 6 |
| AUTH-03 | User prompted to select which workspaces to activate and set default (skipped in domain-only mode) | `@clack/prompts` multiselect + select API verified |
| AUTH-04 | Active workspace name printed in every command output header | `chalk` dim style; `[domain]` header pattern documented |
| AUTH-05 | Token refresh proactively before expiry; file lock prevents race conditions | `proper-lockfile` API verified; refresh timing window is Claude's discretion |
| AUTH-06 | `auth status` shows credentials, active workspace, token expiry, auth mode | No special lib needed; reads conf + keyring |
| AUTH-07 | `workspace list` lists all workspaces with default marked | Reads conf workspace list |
| AUTH-08 | `workspace use <name>` switches default workspace | Matching logic (name/domain) documented |
| AUTH-09 | Every command accepts `--workspace` flag to override active workspace | oclif BaseCommand + baseFlags pattern verified |
| AUTH-10 | Commands requiring auth in anonymous mode fail with exact specified error message | isAuthenticated check in BaseCommand.init() |
| AUTH-11 | API client sends `Authorization: Bearer` only when token configured | openapi-fetch middleware pattern verified |
</phase_requirements>

---

## Summary

Phase 2 builds the authentication and workspace infrastructure that every downstream command depends on. The work divides into four cohesive areas: (1) credential storage using `@napi-rs/keyring` for bearer tokens and `conf` for workspace metadata; (2) workspace discovery by calling `/api/2/user/tokens?cross_sites_p=1` after login; (3) the API client factory in `src/api/client.ts` that conditionally injects the auth header; and (4) oclif command structure for `auth credentials`, `auth status`, `workspace list`, and `workspace use` plus a `BaseCommand` that resolves the active workspace and adds the `--workspace` flag to every command.

The `/api/2/user/tokens?cross_sites_p=1` response shape has been confirmed from a live API call — field names are authoritative (see Pattern 6). The token refresh timing window remains Claude's discretion (5 minutes chosen). No Wave 0 live inspection is needed.

**Primary recommendation:** Build bottom-up — credential storage layer first (`src/config/credentials.ts`), workspace config module second (`src/config/workspace.ts`), API client factory third (`src/api/client.ts`), then commands on top. This order means every layer is testable before the next depends on it.

---

## Standard Stack

### Core (already in package.json)
| Library | Version | Purpose | Note |
|---------|---------|---------|------|
| `@oclif/core` | ^4.10.5 | Command framework, BaseCommand, flag parsing | Already installed [VERIFIED: package.json] |
| `openapi-fetch` | ^0.17.0 | Type-safe API client | Already installed [VERIFIED: package.json] |

### To Install This Phase
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@napi-rs/keyring` | 1.2.0 | OS keychain storage for bearer tokens | Rust-backed; wraps macOS Keychain, Windows Credential Manager, Linux Secret Service; keytar replacement; 1.2.0 is latest [VERIFIED: npm registry] |
| `conf` | 15.1.0 | XDG config for workspace list, active workspace | 15.1.0 is latest; XDG-compliant; atomic writes; typed generics [VERIFIED: npm registry] |
| `chalk` | 4.1.2 (^4) | Terminal colour for dim workspace header | Chalk 5.x is ESM-only — CJS incompatible with this project [VERIFIED: CLAUDE.md constraint; version from npm] |
| `ora` | 5.4.1 (^5) | Spinner for async operations (token refresh, API calls) | ora 6+ is ESM-only — CJS incompatible [VERIFIED: CLAUDE.md constraint; version from npm] |
| `@clack/prompts` | 1.2.0 | Interactive auth flow prompts | 1.2.0 latest [VERIFIED: npm registry] |
| `proper-lockfile` | 4.1.2 | File lock for concurrent token refresh | 4.1.2 is latest; inter-process lock; mkdir strategy works on network filesystems [VERIFIED: npm registry] |

### Dev Dependencies to Install
| Library | Version | Purpose |
|---------|---------|---------|
| `@types/proper-lockfile` | latest | TypeScript types for proper-lockfile |

**Installation:**
```bash
pnpm --filter twentythree-cli add @napi-rs/keyring conf chalk@^4 ora@^5 @clack/prompts proper-lockfile
pnpm --filter twentythree-cli add -D @types/proper-lockfile
```

**Important version pins:** Do NOT upgrade chalk past ^4 or ora past ^5. This project is `"type": "commonjs"` and chalk 5 / ora 6 are ESM-only. This is a CLAUDE.md hard constraint.

---

## Architecture Patterns

### Recommended File Structure (new files this phase)

```
packages/twentythree-cli/src/
├── api/
│   ├── types.ts              # Already exists — generated OpenAPI types
│   └── client.ts             # NEW: API client factory
├── commands/
│   ├── auth/
│   │   ├── credentials.ts    # NEW: auth credentials command
│   │   └── status.ts         # NEW: auth status command
│   └── workspace/
│       ├── list.ts           # NEW: workspace list command
│       └── use.ts            # NEW: workspace use command
├── config/
│   ├── credentials.ts        # NEW: keyring read/write helpers
│   └── workspace.ts          # NEW: conf read/write helpers
├── lib/
│   ├── base-command.ts       # NEW: BaseCommand with --workspace flag
│   ├── term-map.ts           # Already exists
│   └── __tests__/
│       ├── term-map.test.ts  # Already exists
│       ├── credentials.test.ts  # NEW: unit tests
│       └── workspace.test.ts    # NEW: unit tests
└── index.ts                  # Already exists
```

### Pattern 1: @napi-rs/keyring — Credential Storage

The `Entry` class takes `(service, username)` where service is a constant app identifier and username is the domain.

```typescript
// Source: github.com/Brooooooklyn/keyring-node README + index.d.ts [VERIFIED: WebFetch]
import { Entry } from '@napi-rs/keyring'

const SERVICE_NAME = 'twentythree-cli'

export function setCredential(domain: string, token: string): void {
  const entry = new Entry(SERVICE_NAME, domain)
  entry.setPassword(token)
}

export function getCredential(domain: string): string | null {
  const entry = new Entry(SERVICE_NAME, domain)
  return entry.getPassword()  // returns null if not found (does NOT throw)
}

export function deleteCredential(domain: string): void {
  const entry = new Entry(SERVICE_NAME, domain)
  entry.deleteCredential()  // returns boolean; true if deleted
}
```

**Key API facts** [VERIFIED: @napi-rs/keyring index.d.ts via WebFetch]:
- `Entry` constructor: `new Entry(service: string, username: string)`
- `setPassword(password: string): void` — synchronous, blocking
- `getPassword(): string | null` — returns null when no credential found (does NOT throw `NoEntry`)
- `deleteCredential(): boolean` — returns true if deleted
- `deletePassword(): boolean` — alias for deleteCredential()
- All methods are **synchronous** (the `AsyncEntry` class is the async variant)
- Error types: `NoEntry` (no credential), `Ambiguous` (platform-specific edge case)

**Service name convention:** Use a fixed string `'twentythree-cli'`. The username parameter is the domain (e.g. `'company.video23.com'`), giving one keychain entry per domain.

### Pattern 2: conf — Workspace Config Storage

```typescript
// Source: github.com/sindresorhus/conf README [VERIFIED: WebFetch]
import Conf from 'conf'

interface WorkspaceEntry {
  domain: string
  display_name: string
  bearer_token: string
  expiration_time: string  // ISO 8601 string — CONFIRMED from live API
  api_base_url: string     // with trailing slash
  site_name: string
  canonical_user_p: boolean
  starred_p: boolean
}

interface CliConfig {
  activeDomain: string | undefined
  workspaces: WorkspaceEntry[]
}

const config = new Conf<CliConfig>({
  projectName: 'twentythree-cli',  // → ~/.config/twentythree-cli-nodejs/config.json on Linux/macOS
  defaults: {
    activeDomain: undefined,
    workspaces: [],
  },
})

// Usage
config.get('workspaces')           // WorkspaceEntry[]
config.set('activeDomain', domain) // atomic write
config.get('activeDomain')         // string | undefined
```

**Key API facts** [VERIFIED: conf npm + sindresorhus/conf WebFetch]:
- Constructor: `new Conf({ projectName, defaults, schema? })`
- `get(key)` — dot notation supported for nested access
- `set(key, value)` — atomic write
- `has(key)` — existence check
- `delete(key)` — remove key
- Storage locations:
  - macOS: `~/Library/Preferences/twentythree-cli-nodejs/config.json`
  - Linux: `~/.config/twentythree-cli-nodejs/config.json`
  - Windows: `%APPDATA%\twentythree-cli-nodejs\config.json`
- Note: `conf` appends `-nodejs` to `projectName` as suffix
- TypeScript generic: `new Conf<MyType>({...})` gives typed access

**Recommended schema** (Claude's discretion):
```typescript
// Key names chosen for clarity
config.get('workspaces')    // WorkspaceEntry[] — all discovered workspaces
config.get('activeDomain')  // string | undefined — which workspace is active
```

### Pattern 3: openapi-fetch Client Factory

```typescript
// Source: openapi-ts.dev/openapi-fetch/middleware-auth [VERIFIED: WebFetch]
import createClient, { type Middleware } from 'openapi-fetch'
import type { paths } from './types.js'

interface ClientConfig {
  baseUrl: string  // use workspace.api_base_url directly (has trailing slash)
  token?: string   // undefined in domain-only mode
}

export function createApiClient(config: ClientConfig) {
  const client = createClient<paths>({
    baseUrl: config.baseUrl,  // api_base_url from WorkspaceEntry, already has trailing slash
  })

  if (config.token) {
    const authMiddleware: Middleware = {
      async onRequest({ request }) {
        request.headers.set('Authorization', `Bearer ${config.token}`)
        return request
      },
    }
    client.use(authMiddleware)
  }

  return client
}
```

**Key API facts** [VERIFIED: openapi-ts.dev WebFetch]:
- `createClient<paths>({ baseUrl })` — typed to your generated paths
- `client.use(middleware)` — register middleware
- `client.eject(middleware)` — remove middleware
- Middleware `onRequest` fires in registration order
- Middleware `onResponse` fires in reverse order
- Return `undefined` from `onRequest` to skip middleware for that request
- Response: `{ data, error, response }` — data on 2xx, error on 4xx/5xx

**AUTH-11 pattern:** Only register the auth middleware when `config.token` is defined. Pass `workspace.bearer_token` as the token arg. In domain-only mode, `bearer_token` is empty string — treat as falsy to omit the header.

### Pattern 4: oclif BaseCommand with --workspace Flag

```typescript
// Source: oclif.io/docs/base_class/ [VERIFIED: WebFetch]
import { Command, Flags, Interfaces } from '@oclif/core'
import chalk from 'chalk'
import { resolveWorkspace } from '../config/workspace.js'

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<
  typeof BaseCommand['baseFlags'] & T['flags']
>

export abstract class BaseCommand<T extends typeof Command> extends Command {
  static enableJsonFlag = true

  static baseFlags = {
    workspace: Flags.string({
      char: 'w',
      summary: 'Workspace domain or display name to use for this invocation.',
      helpGroup: 'GLOBAL',
    }),
  }

  protected flags!: Flags<T>
  protected workspace!: WorkspaceEntry  // resolved in init()

  public async init(): Promise<void> {
    await super.init()
    const { args, flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      enableJsonFlag: this.ctor.enableJsonFlag,
      args: this.ctor.args,
      strict: this.ctor.strict,
    })
    this.flags = flags as Flags<T>
    // Resolve workspace (throws with AUTH-10 message if unauthenticated and requiresAuth)
    this.workspace = await resolveWorkspace(flags.workspace)
  }

  /**
   * Print the [domain] workspace header. Call at the top of every run().
   */
  protected printWorkspaceHeader(): void {
    this.log(chalk.dim(`[${this.workspace.domain}]`))
  }
}

// Auth-requiring commands extend with an auth guard
export abstract class AuthenticatedCommand<T extends typeof Command> extends BaseCommand<T> {
  public async init(): Promise<void> {
    await super.init()
    if (!this.workspace.bearer_token) {
      this.error(
        'This command requires authentication — run `twentythree auth credentials` to add a bearer token',
        { exit: 1 }
      )
    }
  }
}
```

**Key oclif v4 facts** [VERIFIED: oclif.io/docs/base_class/ WebFetch]:
- `static baseFlags` — flags inherited by all subcommands
- Subcommands spread baseFlags: `static flags = { ...BaseCommand.baseFlags, myFlag: ... }`
- `init()` must call `super.init()` first
- `this.parse({ flags, baseFlags, ... })` merges both flag sets
- `static enableJsonFlag = true` — adds `--json` flag to all commands automatically
- `this.error(message, { exit: N })` — print error and exit with code N

### Pattern 5: Token Refresh with File Lock

```typescript
// Source: github.com/moxystudio/node-proper-lockfile [VERIFIED: WebSearch + npm view]
import * as lockfile from 'proper-lockfile'
import path from 'path'
import os from 'os'

const TOKEN_CACHE_PATH = path.join(os.homedir(), '.config', 'twentythree-cli-nodejs', 'token-cache.json')
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000  // refresh if < 5 minutes remaining (Claude's discretion)

export async function ensureFreshToken(domain: string): Promise<string | null> {
  const workspace = getWorkspace(domain)
  if (!workspace?.bearer_token) return null

  const now = Date.now()
  const expiresAt = new Date(workspace.expiration_time).getTime()
  if (expiresAt - now > REFRESH_THRESHOLD_MS) {
    return workspace.bearer_token  // still valid
  }

  // Acquire lock before refreshing to prevent concurrent refreshes
  let release: (() => Promise<void>) | undefined
  try {
    release = await lockfile.lock(TOKEN_CACHE_PATH, { realpath: false, retries: 3 })
    // Re-check after acquiring lock (another process may have refreshed)
    const fresh = getWorkspace(domain)
    if (fresh && new Date(fresh.expiration_time).getTime() - Date.now() > REFRESH_THRESHOLD_MS) {
      return fresh.bearer_token
    }
    // Perform refresh using the stored user login token
    const loginToken = getCredential(domain)
    if (!loginToken) return null
    const newTokens = await fetchWorkspaceTokens(domain, loginToken)
    saveWorkspaceTokens(domain, newTokens)
    return newTokens.find(t => t.domain === domain)?.bearer_token ?? null
  } finally {
    await release?.()
  }
}
```

**proper-lockfile key facts** [VERIFIED: npm view + WebSearch]:
- `lockfile.lock(filePath, options)` — returns a release function (Promise)
- `options.realpath: false` — allows locking a file that doesn't yet exist
- `options.retries: N` — retry on contention (default 0)
- Lock file is `<filePath>.lock` directory (uses mkdir strategy, atomic on all filesystems)
- Lock is auto-removed on process exit (SIGKILL and OOM exceptions)
- Version 4.1.2 is current [VERIFIED: npm registry]

**Refresh timing window** (Claude's discretion): 5 minutes is a reasonable default. Refresh if `new Date(expiration_time).getTime() - now < 5 * 60 * 1000`. The lock file path should be the token cache file itself.

### Pattern 6: /api/2/user/tokens Response Shape

**Status: CONFIRMED — live API response provided by user**

The endpoint `GET /api/2/user/tokens?cross_sites_p=1` is not in the public swagger spec but response shape has been confirmed from a live API call. The response envelope is:

```typescript
// CONFIRMED from live API
interface UserTokensResponse {
  status: 'ok' | 'error'
  sites: WorkspaceEntry[]
}

interface WorkspaceEntry {
  domain: string             // e.g. "company.video23.com"
  display_name: string       // human-readable workspace name
  bearer_token: string       // cross-site bearer token (use this for API calls)
  expiration_time: string    // ISO 8601 string, e.g. "2026-05-14T12:34:56Z"
  api_base_url: string       // base URL with trailing slash, e.g. "https://company.video23.com/"
  site_name: string          // internal site name (may differ from domain)
  canonical_user_p: boolean  // true for the user's primary/canonical workspace
  starred_p: boolean         // true if workspace is starred/favourited
}
```

**Key implementation notes:**
- Response is `json.sites` (not `json.data` or top-level array)
- Token field is `bearer_token` (NOT `token`)
- Expiry is `expiration_time` as ISO 8601 string — parse with `new Date(expiration_time).getTime()` for ms comparison
- `api_base_url` has a trailing slash — use as `baseUrl` in openapi-fetch directly
- `canonical_user_p: true` identifies the user's primary workspace — suggest as default during `auth credentials` setup
- No Wave 0 live inspection needed — field names are now authoritative

### Pattern 7: Anonymous Scope Enforcement

The 11 anonymous-scope endpoints (from swagger `security: anonymous`) are:
- `GET /album/list`, `GET /live/section/list`, `GET /player/embed`, `GET /poll/list`, `GET /poll/answer`, `GET /site/search`, `GET /tag/list`, `GET /tag/related`, `GET /user/get`, `GET /user/list`, `GET /webhook/events`

[VERIFIED: live swagger spec enumeration]

All other 224 endpoints require authentication. AUTH-10 enforcement: commands that call authenticated endpoints should extend `AuthenticatedCommand` rather than `BaseCommand`, which checks `this.workspace.bearer_token` in `init()`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OS keychain storage | Custom encrypted file | `@napi-rs/keyring` | Platform-native security; macOS Keychain, Windows Credential Manager, Linux Secret Service; handles encryption, access control, OS prompts |
| Config file management | `fs.writeFileSync` + JSON | `conf` | Atomic writes prevent corruption on crash; XDG-compliant paths; handles concurrent access at file level |
| File-level process lock | `fs.openSync` with O_EXCL | `proper-lockfile` | mkdir strategy is atomic on network filesystems; handles stale locks; handles SIGKILL cleanup edge cases |
| HTTP client type safety | `fetch` with manual typing | `openapi-fetch` + generated types | Compile-time enforcement of request/response shapes; catches URL typos; ~6KB runtime |
| Interactive prompts | Raw readline + manual styling | `@clack/prompts` | Handles terminal resize, Ctrl+C, arrow keys, validation loops; styled out of the box; no manual ANSI code management |

**Key insight:** The credential and config storage domain has critical correctness requirements (no plaintext tokens, no corrupt config on crash) that make the hand-rolled approach significantly more dangerous than the library overhead suggests.

---

## Common Pitfalls

### Pitfall 1: chalk/ora ESM Version Conflict
**What goes wrong:** Installing `chalk@latest` (5.x) or `ora@latest` (9.x) in a CJS package causes `ERR_REQUIRE_ESM` at runtime after a clean build.
**Why it happens:** chalk 5+ and ora 6+ are pure ESM and cannot be `require()`d. This project is `"type": "commonjs"`.
**How to avoid:** Pin `chalk@^4` (latest: 4.1.2) and `ora@^5` (latest: 5.4.1). Never run `pnpm update` without checking these pins.
**Warning signs:** `ERR_REQUIRE_ESM` at startup; `SyntaxError: Cannot use import statement in a module` in dist output.

### Pitfall 2: conf Storage Path Includes "-nodejs" Suffix
**What goes wrong:** Code assumes config is at `~/.config/twentythree-cli/` but conf writes to `~/.config/twentythree-cli-nodejs/`.
**Why it happens:** conf appends `-nodejs` to `projectName` on Linux/macOS to avoid collisions with native apps.
**How to avoid:** Use `config.path` property to get the actual path at runtime. Do not hardcode the config path in lockfile or migration code.
**Warning signs:** Config not found after writing; lock file created at wrong path.

### Pitfall 3: /user/tokens Response Field Names (RESOLVED)
**Status:** RESOLVED — field names confirmed from live API. Use `bearer_token`, `expiration_time` (ISO string), `display_name`, `api_base_url`. See Pattern 6 for full interface.

### Pitfall 4: @napi-rs/keyring Synchronous Methods Block Event Loop
**What goes wrong:** Calling `entry.setPassword()` in a hot path (e.g., inside each API request) adds 10–100ms latency per call because the OS keychain is synchronous.
**Why it happens:** `Entry` methods are blocking native calls. The `AsyncEntry` variant exists but is not needed here.
**How to avoid:** Call keyring only at command startup (read once, cache in memory for the invocation) and on explicit credential writes (`auth credentials`). Never call in middleware.
**Warning signs:** CLI feels sluggish on every invocation.

### Pitfall 5: Missing proper-lockfile File Before Locking
**What goes wrong:** `lockfile.lock(path)` throws `ENOENT` if the file at `path` doesn't exist and `realpath: false` is not set.
**Why it happens:** By default proper-lockfile validates the target file exists.
**How to avoid:** Pass `{ realpath: false }` option, or ensure the token cache file is created (even as empty `{}`) during `auth credentials`. Both are acceptable.
**Warning signs:** `Error: ENOENT: no such file or directory` on first `ensureFreshToken` call.

### Pitfall 6: oclif baseFlags TypeScript Type Merge
**What goes wrong:** `this.flags.workspace` is typed as `string | undefined` in BaseCommand but the subcommand's own flags are not available on the base class instance.
**Why it happens:** TypeScript needs the generic `T extends typeof Command` to infer the merged flag type.
**How to avoid:** Use the exact `BaseCommand<typeof MyCommand>` generic and the `Flags<T>` type alias shown in Pattern 4. Do not use `any` for flags.
**Warning signs:** `Property 'myFlag' does not exist on type` TypeScript errors.

---

## Code Examples

### Complete auth credentials flow (abbreviated)

```typescript
// src/commands/auth/credentials.ts
// Source: @clack/prompts docs [VERIFIED: WebFetch], @napi-rs/keyring [VERIFIED: WebFetch]
import { Command } from '@oclif/core'
import * as p from '@clack/prompts'
import { Entry } from '@napi-rs/keyring'
import { setCredential } from '../../config/credentials.js'
import { fetchAndStoreWorkspaces } from '../../config/workspace.js'

export default class Credentials extends Command {
  static summary = 'Configure domain and bearer token'

  public async run(): Promise<void> {
    p.intro('TwentyThree credentials')

    const domain = await p.text({
      message: 'Domain (e.g. company.video23.com)',
      validate: (v) => (v.includes('.') ? undefined : 'Enter a valid domain'),
    })
    if (p.isCancel(domain)) { p.cancel('Cancelled'); return }

    const token = await p.text({
      message: 'Bearer token (press Enter to skip for anonymous access)',
      placeholder: 'optional',
    })
    if (p.isCancel(token)) { p.cancel('Cancelled'); return }

    // Store login token in keychain (overwrites if domain already exists)
    if (token) {
      setCredential(domain as string, token as string)
      // Discover workspaces
      const spinner = (await import('ora')).default('Discovering workspaces...').start()
      await fetchAndStoreWorkspaces(domain as string, token as string)
      spinner.succeed('Workspaces discovered')
    } else {
      // Domain-only mode: store domain with no token
      setCredential(domain as string, '')  // or skip keyring entirely
    }

    p.outro('Credentials saved')
  }
}
```

### Workspace matching logic

```typescript
// src/config/workspace.ts
// Source: CONTEXT.md locked decisions [VERIFIED: 02-CONTEXT.md]
export function findWorkspace(
  query: string,
  workspaces: WorkspaceEntry[]
): WorkspaceEntry | WorkspaceEntry[] | null {
  // Exact domain match takes precedence
  const exactDomain = workspaces.find(
    (w) => w.domain.toLowerCase() === query.toLowerCase()
  )
  if (exactDomain) return exactDomain

  // Partial display name or domain contains match (case-insensitive)
  const matches = workspaces.filter(
    (w) =>
      w.display_name.toLowerCase().includes(query.toLowerCase()) ||
      w.domain.toLowerCase().includes(query.toLowerCase())
  )
  if (matches.length === 1) return matches[0]
  if (matches.length > 1) return matches  // caller must prompt to disambiguate
  return null
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `keytar` (archived atom project) | `@napi-rs/keyring` | Dec 2022 (keytar archived) | Must use keyring; keytar shows deprecation warnings and is unmaintained |
| `tsup` for bundling | `tsdown` | 2024 (tsdown positioned as successor) | Already handled in Phase 1 |
| `inquirer` for prompts | `@clack/prompts` | 2023–2024 | Already in stack decision; do not introduce inquirer |
| `ora@6+` / `chalk@5+` | `ora@5` / `chalk@4` | ESM-only from those versions | Pin required; ESM-only breaks CJS project |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | ~~`/api/2/user/tokens?cross_sites_p=1` response has field `domain` for workspace domain~~ | Pattern 6 | **RESOLVED: confirmed `domain` field** |
| A2 | ~~Token expiry field is named `expires_at` or `expire_time` and is a Unix timestamp~~ | Pattern 6 | **RESOLVED: `expiration_time` ISO 8601 string** |
| A3 | ~~Response `data` field contains array of workspace tokens~~ | Pattern 6 | **RESOLVED: response is `{ status, sites: [] }`** |
| A4 | ~~Display name for workspace is in a `name` or `display_name` field~~ | Pattern 6 | **RESOLVED: `display_name`** |
| A5 | `@clack/prompts` v1.2.0 does not have breaking changes vs the API documented | Standard Stack | Prompt functions throw or have different signatures |

**A1–A4 resolved:** Live API response confirmed all field names. See Pattern 6 for the authoritative interface.

---

## Open Questions

1. **~~Response shape of /api/2/user/tokens?cross_sites_p=1~~** — **RESOLVED**
   - Confirmed: `{ status, sites: WorkspaceEntry[] }` — see Pattern 6 for authoritative interface
   - No Wave 0 live inspection task needed

2. **Domain-only mode: should the login token be stored in keychain or skipped?**
   - What we know: Domain-only stores no usable token; commands requiring auth fail with AUTH-10 message
   - What's unclear: Whether an empty-token entry should be in keyring (noisy) or only in conf (cleaner)
   - Recommendation: Store domain-only entries in conf only (no keyring entry). Check conf for domain existence, keyring for token presence. If conf has domain but keyring returns null → domain-only mode.

3. **proper-lockfile: where should the lock file live?**
   - What we know: conf path includes `-nodejs` suffix; `config.path` exposes the actual path
   - Recommendation: Lock on the conf config file itself (`config.path`). This ties the lock to the exact file being modified.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js >=22 | Runtime | ✓ (enforced by FOUND-04) | >=22 | None needed |
| OS keychain | @napi-rs/keyring | ✓ macOS/Linux/Windows | native | None — required |
| npm registry | Install phase deps | ✓ (assumed for dev) | — | — |
| TwentyThree API | Live token endpoint | ✓ (confirmed 403 response) | v2 | — |

Step 2.6: No external service/tool dependencies beyond the above. Package installation and keychain access are both standard.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.4 |
| Config file | none — vitest auto-discovers |
| Quick run command | `pnpm --filter twentythree-cli test` |
| Full suite command | `pnpm --filter twentythree-cli test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | setCredential/getCredential/deleteCredential store and retrieve correctly | unit | `pnpm --filter twentythree-cli test -- credentials` | ❌ Wave 0 |
| AUTH-02 | fetchAndStoreWorkspaces calls correct endpoint and stores result | unit (mock fetch) | `pnpm --filter twentythree-cli test -- workspace` | ❌ Wave 0 |
| AUTH-03 | Workspace selection prompt logic selects and sets default | unit | `pnpm --filter twentythree-cli test -- workspace` | ❌ Wave 0 |
| AUTH-05 | ensureFreshToken returns cached token when not near expiry | unit | `pnpm --filter twentythree-cli test -- workspace` | ❌ Wave 0 |
| AUTH-05 | ensureFreshToken refreshes token when near expiry | unit (mock API) | `pnpm --filter twentythree-cli test -- workspace` | ❌ Wave 0 |
| AUTH-08 | findWorkspace matches by exact domain taking precedence | unit | `pnpm --filter twentythree-cli test -- workspace` | ❌ Wave 0 |
| AUTH-08 | findWorkspace matches by display name contains (case-insensitive) | unit | `pnpm --filter twentythree-cli test -- workspace` | ❌ Wave 0 |
| AUTH-08 | findWorkspace returns array when multiple matches (ambiguous) | unit | `pnpm --filter twentythree-cli test -- workspace` | ❌ Wave 0 |
| AUTH-10 | AuthenticatedCommand.init() throws with exact error message when no token | unit | `pnpm --filter twentythree-cli test -- base-command` | ❌ Wave 0 |
| AUTH-11 | createApiClient sets Authorization header when token present | unit | `pnpm --filter twentythree-cli test -- client` | ❌ Wave 0 |
| AUTH-11 | createApiClient does NOT set Authorization header when no token | unit | `pnpm --filter twentythree-cli test -- client` | ❌ Wave 0 |
| AUTH-04, AUTH-06, AUTH-07 | auth status / workspace list output format | manual | run command, inspect output | ❌ Wave 0 |

**Note on AUTH-01 keyring tests:** `@napi-rs/keyring` calls the real OS keychain in tests — this is acceptable for unit tests on developer machines and CI. Use unique service names in tests (e.g., `'twentythree-cli-test'`) and clean up via `deleteCredential()` in `afterEach`.

### Sampling Rate
- **Per task commit:** `pnpm --filter twentythree-cli test`
- **Per wave merge:** `pnpm --filter twentythree-cli test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/config/__tests__/credentials.test.ts` — covers AUTH-01
- [ ] `src/config/__tests__/workspace.test.ts` — covers AUTH-02, AUTH-03, AUTH-05, AUTH-08
- [ ] `src/lib/__tests__/base-command.test.ts` — covers AUTH-10
- [ ] `src/api/__tests__/client.test.ts` — covers AUTH-11

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `@napi-rs/keyring` — tokens stored in OS keychain, never plaintext |
| V3 Session Management | yes | expiration_time (ISO string) tracked; proactive refresh before expiry; no session fixation risk |
| V4 Access Control | yes | AUTH-10 guard; anonymous vs authenticated command distinction |
| V5 Input Validation | yes | domain input validated (contains `.`); `@clack/prompts` validate callback |
| V6 Cryptography | no | Token storage delegates to OS keychain; no custom crypto |

### Known Threat Patterns for Auth CLI

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Token in plaintext config file | Information Disclosure | `@napi-rs/keyring` OS keychain — tokens never written to disk unencrypted |
| Race condition on token refresh | Elevation of Privilege | `proper-lockfile` prevents concurrent refresh writing stale tokens |
| Domain input manipulation | Spoofing | Validate domain format before storage; don't allow path traversal chars |
| Token logged to stdout/stderr | Information Disclosure | Never log token value; log only domain and expiry |

---

## Project Constraints (from CLAUDE.md)

- **TypeScript + Node.js only** — no other runtimes
- **npm global install distribution** — no Homebrew, no standalone binary
- **Bearer token auth only** — no OAuth 1.0a in v1
- **chalk pinned to `^4` (NOT 5.x)** — ESM-only in 5.x breaks CJS project
- **ora pinned to `^5` (NOT 6.x)** — same ESM reason
- **`@napi-rs/keyring`** for credentials — NOT archived `keytar`
- **`conf`** for non-sensitive config — NOT custom JSON files
- **`openapi-fetch`** for API calls — type-safe, already in stack
- **`@clack/prompts`** for interactive prompts — NOT `inquirer`
- **`vitest`** for tests — NOT Jest
- **`tsdown`** for build — NOT tsup (abandoned)
- **oclif v4 CJS command file layout**: `src/commands/<topic>/<verb>.ts`
- **execute({dir: __dirname})** for entrypoints — NOT run()+handle()
- **GSD workflow enforcement**: edits must go through GSD commands

---

## Sources

### Primary (HIGH confidence)
- `packages/twentythree-cli/package.json` — confirmed installed deps and versions
- `packages/twentythree-cli/src/lib/term-map.ts` — established module patterns
- `packages/twentythree-cli/src/api/types.ts` — confirmed `/user/tokens` is absent from generated types
- `https://video.twentythree.com/apidocs/swagger.json` — full paths enumerated; 11 anonymous endpoints identified; `/user/tokens` confirmed absent from spec
- `live GET https://video.twentythree.com/api/2/user/tokens` — confirmed endpoint exists (returns 403 permission_denied without auth)
- npm registry `@napi-rs/keyring@1.2.0` — confirmed latest version
- npm registry `conf@15.1.0` — confirmed latest version
- npm registry `openapi-fetch@0.17.0` — confirmed latest version
- npm registry `@clack/prompts@1.2.0` — confirmed latest version
- npm registry `proper-lockfile@4.1.2` — confirmed latest version
- npm registry `chalk` versions — confirmed 4.1.2 is latest 4.x
- npm registry `ora` versions — confirmed 5.4.1 is latest 5.x

### Secondary (MEDIUM confidence)
- `github.com/Brooooooklyn/keyring-node` via WebFetch — Entry class TypeScript API (setPassword, getPassword, deleteCredential signatures)
- `openapi-ts.dev/openapi-fetch/middleware-auth` via WebFetch — middleware pattern, auth middleware example
- `oclif.io/docs/base_class/` via WebFetch — BaseCommand, baseFlags, init() pattern, TypeScript generics
- `github.com/sindresorhus/conf` via WebFetch — constructor API, storage paths, TypeScript generic support
- `github.com/bombshell-dev/clack/packages/prompts` via WebFetch — complete prompt function API

### Tertiary (now CONFIRMED)
- `/api/2/user/tokens?cross_sites_p=1` response field names — confirmed from live API: `domain`, `display_name`, `bearer_token`, `expiration_time` (ISO string), `api_base_url`, `site_name`, `canonical_user_p`, `starred_p`

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry
- Library APIs (keyring, conf, openapi-fetch, clack, oclif BaseCommand): HIGH — verified via official docs/repos
- Architecture patterns: HIGH — derived from verified library APIs and CONTEXT.md locked decisions
- /user/tokens response shape: HIGH — confirmed from live API call
- Pitfalls: HIGH — derived from verified library characteristics (ESM, conf path, lockfile)

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (stable libraries; /user/tokens response shape requires live verification before use)
