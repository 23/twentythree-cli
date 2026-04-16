# Phase 8: Platform & Polish - Pattern Map

**Mapped:** 2026-04-16
**Files analyzed:** 56 new files + 2 modified files (BaseCommand, lib/output.ts)
**Analogs found:** 56 / 58

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/commands/spot/list.ts` | command | request-response (GET list) | `src/commands/audience/field/list.ts` | exact |
| `src/commands/spot/create.ts` | command | request-response (POST create) | `src/commands/category/create.ts` | exact |
| `src/commands/spot/update.ts` | command | request-response (POST update) | `src/commands/video/update.ts` | exact |
| `src/commands/spot/delete.ts` | command | request-response (POST destructive) | `src/commands/video/delete.ts` | exact |
| `src/commands/spot/set-videos.ts` | command | request-response (POST mutation) | `src/commands/video/delete.ts` (POST pattern) | role-match |
| `src/commands/spot/check.ts` | command | request-response (GET single) | `src/commands/video/get.ts` | role-match |
| `src/commands/spot/reset-version.ts` | command | request-response (POST action) | `src/commands/video/delete.ts` (POST pattern) | role-match |
| `src/commands/thumbnail/index.ts` | topic-root | — | `src/commands/category/index.ts` | exact |
| `src/commands/thumbnail/list.ts` | command | request-response (GET list) | `src/commands/audience/field/list.ts` | exact |
| `src/commands/thumbnail/add.ts` | command | request-response (POST create) | `src/commands/category/create.ts` | exact |
| `src/commands/thumbnail/update.ts` | command | request-response (POST update) | `src/commands/video/update.ts` | role-match |
| `src/commands/thumbnail/delete.ts` | command | request-response (POST destructive) | `src/commands/video/delete.ts` | exact |
| `src/commands/thumbnail/duplicate.ts` | command | request-response (POST action) | `src/commands/video/subtitle/duplicate.ts` | exact |
| `src/commands/thumbnail/data.ts` | command | request-response (GET single) | `src/commands/video/get.ts` | role-match |
| `src/commands/thumbnail/file/list.ts` | command | request-response (GET list) | `src/commands/audience/field/list.ts` | exact |
| `src/commands/thumbnail/file/upload.ts` | command | file-I/O (POST multipart) | `src/commands/video/subtitle/upload.ts` | exact |
| `src/commands/thumbnail/file/delete.ts` | command | request-response (POST destructive) | `src/commands/video/delete.ts` | exact |
| `src/commands/webhook/list.ts` | command | request-response (GET list) | `src/commands/audience/field/list.ts` | exact |
| `src/commands/webhook/subscribe.ts` | command | request-response (POST create) | `src/commands/category/create.ts` | exact |
| `src/commands/webhook/unsubscribe.ts` | command | request-response (POST destructive) | `src/commands/video/delete.ts` | exact |
| `src/commands/webhook/events.ts` | command | request-response (GET list) | `src/commands/audience/field/list.ts` | role-match |
| `src/commands/webhook/sample.ts` | command | request-response (GET single) | `src/commands/video/get.ts` | role-match |
| `src/commands/app/add.ts` | command | request-response (POST create) | `src/commands/category/create.ts` | exact |
| `src/commands/app/update.ts` | command | request-response (POST update) | `src/commands/video/update.ts` | role-match |
| `src/commands/app/delete.ts` | command | request-response (POST destructive) | `src/commands/video/delete.ts` | exact |
| `src/commands/presentation/setting/list.ts` | command | request-response (GET single object) | `src/commands/video/get.ts` | role-match |
| `src/commands/presentation/setting/update.ts` | command | request-response (POST freeform) | `src/commands/video/update.ts` | role-match |
| `src/commands/presentation/page/link-locations.ts` | command | request-response (GET list) | `src/commands/audience/field/list.ts` | exact |
| `src/commands/protection/protect.ts` | command | request-response (POST action) | `src/commands/category/create.ts` | role-match |
| `src/commands/protection/unprotect.ts` | command | request-response (POST destructive) | `src/commands/video/delete.ts` | exact |
| `src/commands/protection/verify.ts` | command | request-response (GET single) | `src/commands/video/get.ts` | role-match |
| `src/commands/session/get-token.ts` | command | request-response (GET returns token) | `src/commands/video/get.ts` | role-match |
| `src/commands/session/redeem-token.ts` | command | request-response (POST action) | `src/commands/video/delete.ts` (POST pattern) | role-match |
| `src/commands/openupload/list.ts` | command | request-response (GET list) | `src/commands/audience/field/list.ts` | exact |
| `src/commands/openupload/upload-file.ts` | command | file-I/O (POST chunked) | `src/commands/video/upload.ts` | exact |
| `src/commands/openupload/update-file.ts` | command | request-response (POST update) | `src/commands/video/update.ts` | role-match |
| `src/commands/site/get.ts` | command | request-response (GET single object) | `src/commands/video/get.ts` | role-match |
| `src/commands/site/search.ts` | command | request-response (GET list) | `src/commands/audience/field/list.ts` | role-match |
| `src/commands/setting/update.ts` | command | request-response (POST freeform) | `src/commands/video/update.ts` | role-match |
| `src/commands/user/list.ts` | command | request-response (GET list) | `src/commands/audience/field/list.ts` | exact |
| `src/commands/user/get.ts` | command | request-response (GET single) | `src/commands/video/get.ts` | exact |
| `src/commands/user/create.ts` | command | request-response (POST create) | `src/commands/category/create.ts` | exact |
| `src/commands/user/update.ts` | command | file-I/O (POST multipart) | `src/commands/video/subtitle/upload.ts` | exact |
| `src/commands/user/send-invitation.ts` | command | request-response (POST action) | `src/commands/video/delete.ts` (POST pattern) | role-match |
| `src/commands/user/get-login-token.ts` | command | request-response (GET returns token) | `src/commands/video/get.ts` | role-match |
| `src/commands/user/redeem-login-token.ts` | command | request-response (GET action) | `src/commands/video/get.ts` | role-match |
| `src/commands/user/tokens.ts` | command | request-response (GET — spec unclear) | `src/commands/video/get.ts` | role-match |
| `src/commands/doctor.ts` | command | request-response (health probe) | `src/commands/auth/credentials.ts` (Command base) | role-match |
| `src/lib/base-command.ts` | utility | — | self (modified) | — |
| All ~60 existing commands | command | — | themselves (add `static agentMetadata`) | — |

---

## Pattern Assignments

### Pattern A: Standard GET List Command

**Analog:** `packages/twentythree-cli/src/commands/audience/field/list.ts`

**Applies to:** `spot/list`, `thumbnail/list`, `thumbnail/file/list`, `webhook/list`, `webhook/events`, `openupload/list`, `user/list`, `presentation/page/link-locations`, `site/search`

**Imports pattern** (lines 1-5):
```typescript
import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'
```

**Class structure** (lines 15-35):
```typescript
export default class SpotList extends AuthenticatedCommand<typeof SpotList> {
  static description = 'List spots in the active workspace'
  static examples = [
    '<%= config.bin %> spot list',
    '<%= config.bin %> spot list --json',
  ]
  static enableJsonFlag = true
  static flags = {
    ...AuthenticatedCommand.baseFlags,
    page: Flags.integer({ description: 'Page number', required: false }),
    size: Flags.integer({ description: 'Number of results per page', required: false }),
    search: Flags.string({ description: 'Search term', required: false }),
  }
  static args = {}
  // agentMetadata added here (see Pattern G)
```

**Run body** (lines 36-88):
```typescript
  public async run(): Promise<void | object> {
    const { flags } = await this.parse(SpotList)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/spot/list', {
      params: { query: { p: flags.page, size: flags.size, search: flags.search } },
    })

    if (error) this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })

    const resp = data as any
    const rows: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: rows,
        summary: `${rows.length} spot(s)`,
        breadcrumbs: [{ domain: this.activeWorkspace.domain }, { resource: 'spot' }],
      })
    }

    if (rows.length === 0) { this.log('No spots found.'); return }

    const table = renderTable(['ID', 'Name', 'Type', 'Active'], rows.map((r: any) => [
      String(r.spot_id ?? ''), String(r.spot_name ?? ''),
      String(r.spot_type ?? ''), String(r.active_p ?? ''),
    ]))
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} spot(s)`))
  }
```

---

### Pattern B: POST Create Command

**Analog:** `packages/twentythree-cli/src/commands/category/create.ts`

**Applies to:** `spot/create`, `thumbnail/add`, `webhook/subscribe`, `app/add`, `user/create`, `protection/protect`

**Imports pattern** (lines 1-5):
```typescript
import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'
```

**Core POST with form-urlencoded** (lines 62-68):
```typescript
const { data: createData, error: createError } = await this.apiClient.POST('/spot/create', {
  body: body as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})

if (createError) {
  this.error(applyCliTerms(formatApiError(createError)), { exit: EXIT_ERROR })
}
```

**Success output** (lines 74-88):
```typescript
const spotId = (createData as any)?.data?.spot_id

this.log(chalk.green('Spot created'))
this.log(`ID: ${spotId}`)

if (this.jsonEnabled()) {
  return formatJsonOutput({
    ok: true,
    data: createData,
    summary: 'Spot created',
    breadcrumbs: [
      { domain: this.activeWorkspace.domain },
      { resource: 'spot', id: String(spotId) },
    ],
  })
}
```

**CRITICAL:** Always include `headers: { 'Content-Type': 'application/x-www-form-urlencoded' }` — openapi-fetch does not infer it.

---

### Pattern C: POST Destructive Command (with confirmation)

**Analog:** `packages/twentythree-cli/src/commands/video/delete.ts`

**Applies to:** `spot/delete`, `thumbnail/delete`, `thumbnail/file/delete`, `webhook/unsubscribe`, `app/delete`, `protection/unprotect`

**Imports** (lines 1-6):
```typescript
import { Args } from '@oclif/core'
import chalk from 'chalk'
import { confirm, isCancel } from '@clack/prompts'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'
```

**Confirmation block** (lines 48-57):
```typescript
if (!this.jsonEnabled()) {
  const confirmed = await confirm({
    message: `Delete spot ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
  })
  if (isCancel(confirmed) || !confirmed) {
    process.exit(EXIT_CANCELLED)
  }
}
```

**POST call** (lines 59-62):
```typescript
const { data: deleteData, error: deleteError } = await this.apiClient.POST('/spot/delete', {
  body: { spot_id: Number(args.id) } as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
```

**Note for `webhook/unsubscribe`:** Accept either `--webhook-id` or `--target-url` (API accepts either). Still confirm before posting.

---

### Pattern D: POST Update Command (flag-only mode)

**Analog:** `packages/twentythree-cli/src/commands/video/update.ts`

**Applies to:** `spot/update`, `thumbnail/update`, `app/update`, `openupload/update-file`, `presentation/setting/update`, `setting/update`

**Selective body building pattern** (lines 170-183):
```typescript
// Flag mode: only include flags the user explicitly provided
const body: Record<string, unknown> = { spot_id: Number(args.id) }

if (flags['spot-name'] !== undefined) body.spot_name = flags['spot-name']
if (flags['active'] !== undefined) body.active_p = flags.active ? 1 : 0
// ... other optional flags

const { data: updateData, error: updateError } = await this.apiClient.POST('/spot/update', {
  body: body as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
if (updateError) {
  this.error(applyCliTerms(String(updateError)), { exit: EXIT_ERROR })
}
this.log(chalk.green(`Spot ${args.id} updated`))
```

**For `presentation/setting/update` and `setting/update` (freeform key-value):** Accept a repeatable `--set key=value` flag. Parse each value and inject into the POST body:
```typescript
// Flag: --set key=value (repeatable)
set: Flags.string({
  description: 'Setting key=value pair (repeatable)',
  multiple: true,
  required: false,
})
// In run():
for (const pair of (flags.set ?? [])) {
  const idx = pair.indexOf('=')
  if (idx < 1) this.error(`Invalid --set value: "${pair}" (expected key=value)`, { exit: EXIT_ERROR })
  body[pair.slice(0, idx)] = pair.slice(idx + 1)
}
```

---

### Pattern E: GET Single Object / Key-Value Output

**Analog:** `packages/twentythree-cli/src/commands/video/get.ts`

**Applies to:** `spot/check`, `thumbnail/data`, `webhook/sample`, `presentation/setting/list`, `site/get`, `user/get`, `session/get-token`, `user/get-login-token`, `user/redeem-login-token`, `protection/verify`

**Run body** (lines 32-89):
```typescript
public async run(): Promise<void | object> {
  const { args } = await this.parse(SiteGet)
  this.printWorkspaceHeader()

  const { data, error } = await this.apiClient.GET('/site/get', {
    params: { query: { include_presentation_p: flags['include-presentation'] ? 1 : undefined } },
  })

  if (error) {
    this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
  }

  const resp = data as any
  const obj = resp?.data ?? resp

  if (!obj) {
    this.error('No data returned', { exit: EXIT_ERROR })
  }

  if (this.jsonEnabled()) {
    return formatJsonOutput({
      ok: true,
      data: obj,
      summary: 'Site settings',
      breadcrumbs: [{ domain: this.activeWorkspace.domain }, { resource: 'site' }],
    })
  }

  // Key-value output — iterate top-level keys
  for (const [k, v] of Object.entries(obj)) {
    this.log(`${k}: ${applyCliTerms(String(v ?? ''))}`)
  }
}
```

**For `thumbnail/data`:** Output raw JSON via `this.log(JSON.stringify(data, null, 2))` (per RESEARCH.md open question resolution — nested object not suitable for key-value).

**For `session/get-token` and `user/get-login-token`:** Print the token value clearly to stdout; do not include it in `--json` summary string (security: token leakage in logs).

---

### Pattern F: Direct Multipart File Upload

**Analog:** `packages/twentythree-cli/src/commands/video/subtitle/upload.ts`

**Applies to:** `thumbnail/file/upload`, `user/update` (profile_image field)

**Imports** (lines 1-7):
```typescript
import { Args, Flags } from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'
```

**File read + FormData bodySerializer** (lines 55-86):
```typescript
// Validate file exists
const filePath = path.resolve(args.file)
if (!fs.existsSync(filePath)) {
  this.error(`File not found: ${filePath}`, { exit: EXIT_ERROR })
}

const fileBuffer = fs.readFileSync(filePath)
const fileName = path.basename(filePath)
const fileBlob = new Blob([fileBuffer], { type: 'image/png' })   // adjust MIME as needed

const { data, error } = await this.apiClient.POST('/thumbnail/template/upload-file', {
  body: {
    thumbnail_template_id: Number(flags['template-id']),
    file: fileBlob as unknown as Record<string, never>,
  },
  bodySerializer(body) {
    const fd = new FormData()
    for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
      if (v !== undefined) {
        if (v instanceof Blob) { fd.append(k, v, fileName) }
        else { fd.append(k, String(v)) }
      }
    }
    return fd
  },
})

if (error) {
  this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
}
```

**Note for `user/update`:** The same bodySerializer pattern applies. Profile image upload uses `multipart/form-data` — do NOT use `application/x-www-form-urlencoded` for this command (Pitfall 7).

---

### Pattern G: Chunked Upload (openupload upload-file)

**Analog:** `packages/twentythree-cli/src/commands/video/upload.ts`

**Applies to:** `openupload/upload-file`

**Imports** (lines 1-8):
```typescript
import { Args, Flags } from '@oclif/core'
import { stat } from 'node:fs/promises'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { formatJsonOutput, formatBytes, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'
import { uploadChunked } from '../../upload/chunked-upload.js'
import { DEFAULT_CHUNK_SIZE, DEFAULT_CONCURRENCY } from '../../upload/types.js'
```

**Flags** — mirror `video upload` flag names where applicable:
```typescript
static flags = {
  ...AuthenticatedCommand.baseFlags,
  'file-path': Flags.string({ description: 'Path to the file to upload', required: true }),
  'token-upload-id': Flags.string({ description: 'Open upload token upload ID', required: true }),
  token: Flags.string({ description: 'Open upload token', required: true }),
  'chunk-size': Flags.integer({ description: `Chunk size in bytes (default: ${DEFAULT_CHUNK_SIZE})`, default: DEFAULT_CHUNK_SIZE }),
  concurrency: Flags.integer({ description: `Parallel chunks (default: ${DEFAULT_CONCURRENCY})`, default: DEFAULT_CONCURRENCY }),
}
```

**Upload call — CRITICAL: tokenFieldName must be 'token', not 'upload_token'** (Pitfall 3):
```typescript
result = await uploadChunked({
  filePath: flags['file-path'],
  uploadToken: flags.token,
  tokenFieldName: 'token',           // REQUIRED — open upload uses 'token', not 'upload_token'
  uploadUrl: `${this.apiBaseUrl}openupload/upload-file`,
  bearerToken: this.activeWorkspace.bearer_token || undefined,
  chunkSize: flags['chunk-size'],
  concurrency: flags.concurrency,
  extraFields: {
    token_upload_id: flags['token-upload-id'],
  },
  onProgress(bytesUploaded, total) {
    const elapsed = (Date.now() - startTime) / 1000
    const speed = elapsed > 0 ? bytesUploaded / elapsed : 0
    bar.render(bytesUploaded, total, speed)
  },
})
```

---

### Pattern H: Topic Index Root

**Analog:** `packages/twentythree-cli/src/commands/category/index.ts`

**Applies to:** `thumbnail/index.ts` (and optionally `presentation/index.ts`)

```typescript
import { Command } from '@oclif/core'

export default class ThumbnailIndex extends Command {
  static description = 'Manage thumbnail templates — list, add, update, delete, and manage files'

  async run(): Promise<void> {
    this.log('Run "twentythree thumbnail --help" for available commands')
  }
}
```

**Note:** Use `Command` from `@oclif/core` (not `AuthenticatedCommand`) — this is a topic root only.

---

### Pattern I: `doctor` Command (extends bare Command, not AuthenticatedCommand)

**Analog:** `packages/twentythree-cli/src/commands/auth/credentials.ts` (extends `Command`)

**Key design constraint:** `doctor` MUST extend oclif's `Command` directly, not `BaseCommand` or `AuthenticatedCommand`. BaseCommand.init() throws a hard error if no workspace is configured — `doctor` must catch this case and report it as a check FAIL.

**Imports**:
```typescript
import { Command } from '@oclif/core'
import Table from 'cli-table3'
import chalk from 'chalk'
import {
  getActiveWorkspace,
  getWorkspaceForDomain,
} from '../auth/workspace-config.js'
import { createApiClient } from '../api/client.js'
```

**Class structure**:
```typescript
export default class Doctor extends Command {
  static description = 'Check CLI credentials, connectivity, and token validity'
  static examples = ['<%= config.bin %> doctor', '<%= config.bin %> doctor --json']
  static enableJsonFlag = true
  static flags = {}

  public async run(): Promise<void | object> {
    const checks: { name: string; passed: boolean; detail: string }[] = []

    // Check 1: Credentials stored
    let domain: string | null = null
    try {
      domain = getActiveWorkspace()
      const ws = domain ? getWorkspaceForDomain(domain) : null
      checks.push({
        name: 'Credentials stored',
        passed: !!ws?.bearer_token,
        detail: ws ? domain! : 'No workspace configured',
      })
    } catch {
      checks.push({ name: 'Credentials stored', passed: false, detail: 'Error reading credentials' })
    }

    // Check 2: Connectivity (only if check 1 passed)
    // Use node:https HEAD request or fetch() to the workspace domain
    // ...

    // Check 3: Token valid (only if check 2 passed)
    // apiClient.GET('/photo/list', { params: { query: { size: 1 } } })
    // 200 → pass; non-200 → fail with status code as detail

    // Render table
    const table = new Table({
      head: ['Check', 'Status', 'Detail'],
      style: { head: ['cyan'] },
      colWidths: [25, 10, 50],
    })
    for (const check of checks) {
      table.push([
        check.name,
        check.passed ? chalk.green('✓ OK') : chalk.red('✗ FAIL'),
        check.detail,
      ])
    }

    const allPassed = checks.every(c => c.passed)

    if (this.jsonEnabled()) {
      return { ok: allPassed, checks }
    }

    this.log(table.toString())
    if (!allPassed) process.exit(1)
  }
}
```

---

### Pattern J: `--agent` Global Flag on BaseCommand

**Modified file:** `packages/twentythree-cli/src/lib/base-command.ts`

**Addition to `static baseFlags`** (after line 27):
```typescript
static baseFlags = {
  workspace: Flags.string({
    char: 'w',
    summary: 'Workspace domain or display name to use for this invocation.',
    helpGroup: 'GLOBAL',
  }),
  agent: Flags.boolean({
    description: 'Output machine-readable command metadata for AI agent consumption',
    helpGroup: 'GLOBAL',
    hidden: true,
  }),
}
```

**Addition to `init()` (before workspace resolution):**
```typescript
// Check for --agent flag before workspace resolution
const rawFlags = process.argv.slice(2)
if (rawFlags.includes('--agent')) {
  const ctor = this.ctor as any
  const flagDefs = ctor.flags ?? {}
  const agentMeta = ctor.agentMetadata ?? {}

  const flagsArr = Object.entries(flagDefs)
    .filter(([name]) => !['workspace', 'agent', 'json'].includes(name))
    .map(([name, def]: [string, any]) => ({
      name,
      type: def.type ?? (def.constructor?.name?.toLowerCase() ?? 'string'),
      required: def.required ?? false,
      default: def.default ?? null,
      description: def.description ?? '',
    }))

  const output = {
    command: this.id,
    description: ctor.description ?? '',
    flags: flagsArr,
    examples: ctor.examples ?? [],
    api_endpoint: agentMeta.api_endpoint ?? null,
    auth_scope: agentMeta.auth_scope ?? 'read',
    output_shape: agentMeta.output_shape ?? { type: 'none' },
    side_effects: agentMeta.side_effects ?? 'none',
  }

  process.stdout.write(JSON.stringify(output, null, 2) + '\n')
  process.exit(0)
}
```

**`static agentMetadata` declaration on each command** (add to every command class):
```typescript
static agentMetadata = {
  api_endpoint: 'GET /spot/list',          // HTTP method + path
  auth_scope: 'read' as const,             // anonymous|none|read|write|admin|super
  output_shape: {
    type: 'table' as const,
    columns: ['ID', 'Name', 'Type', 'Active'],
  },
  side_effects: 'none' as const,           // none|destructive|creates|updates
}
```

**auth_scope values by pattern:**
- GET list / GET single → `'read'`
- POST create → `'write'`
- POST update → `'write'`
- POST delete / POST destructive → `'write'`
- `doctor` → `'none'` (reads local config only for checks 1-2; check 3 uses read scope)
- User admin commands (user/create, user/update) → `'admin'`

**side_effects values by pattern:**
- GET commands → `'none'`
- POST create → `'creates'`
- POST update → `'updates'`
- POST delete/unsubscribe/unprotect → `'destructive'`
- POST actions (reset-version, send-invitation) → `'updates'`

---

### Pattern K: Simple POST Action (no confirmation, no returned data shape)

**Analog:** `packages/twentythree-cli/src/commands/video/delete.ts` (POST pattern without confirm block)

**Applies to:** `spot/set-videos`, `spot/reset-version`, `session/redeem-token`, `user/send-invitation`, `webhook/subscribe` (already covered by Pattern B)

```typescript
const { data, error } = await this.apiClient.POST('/spot/reset-version', {
  body: { spot_id: Number(args.id) } as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})

if (error) {
  this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
}

this.log(chalk.green(`Spot ${args.id} version reset`))

if (this.jsonEnabled()) {
  return formatJsonOutput({
    ok: true,
    data,
    summary: `Spot ${args.id} version reset`,
    breadcrumbs: [{ domain: this.activeWorkspace.domain }, { resource: 'spot', id: args.id }],
  })
}
```

---

## Shared Patterns

### Authentication
**Source:** `packages/twentythree-cli/src/lib/base-command.ts` lines 120-129
**Apply to:** All new command files (extend `AuthenticatedCommand`, not `BaseCommand`)
```typescript
export abstract class AuthenticatedCommand<T extends typeof Command> extends BaseCommand<T> {
  public async init(): Promise<void> {
    await super.init()
    if (!this.activeWorkspace.bearer_token) {
      this.error(
        'This command requires authentication — run `twentythree auth credentials` to add a bearer token',
        { exit: 1 },
      )
    }
  }
}
```
**Exception:** `doctor.ts` extends `Command` directly (Pitfall 1 — never `AuthenticatedCommand`).
**Exception:** `thumbnail/index.ts` and other topic-root index files extend `Command` directly.

### Error Handling
**Source:** `packages/twentythree-cli/src/lib/output.ts` lines 104-123
**Apply to:** Every API call in every command
```typescript
if (error) {
  this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
}
```
`formatApiError()` handles plain objects that `String()` renders as `[object Object]`.

### Term Translation
**Source:** `packages/twentythree-cli/src/lib/term-map.ts`
**Apply to:** All error messages, all string values shown to user
```typescript
import { applyCliTerms } from '../../lib/term-map.js'
// Wrap all user-facing error messages:
this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
// Wrap column values that may contain API internal names:
applyCliTerms(String(r.some_field ?? ''))
```

### JSON Output Shape
**Source:** `packages/twentythree-cli/src/lib/output.ts` lines 37-48
**Apply to:** All commands that return data
```typescript
return formatJsonOutput({
  ok: true,
  data: rows,           // the actual payload
  summary: `${rows.length} spot(s)`,
  breadcrumbs: [
    { domain: this.activeWorkspace.domain },
    { resource: 'spot' },
  ],
})
```

### POST Content-Type Header (CRITICAL)
**Source:** `packages/twentythree-cli/src/commands/video/delete.ts` line 61
**Apply to:** ALL POST commands using form-urlencoded (every non-multipart POST)
```typescript
headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
```
openapi-fetch does NOT infer this from the body. Missing header causes API errors.

### Workspace Header Print
**Source:** `packages/twentythree-cli/src/lib/base-command.ts` lines 108-110
**Apply to:** First line of every command's `run()` method
```typescript
this.printWorkspaceHeader()  // prints chalk.dim(`[${this.activeWorkspace.domain}]`)
```

### Boolean Flag Pair Pattern
**Source:** `packages/twentythree-cli/src/lib/output.ts` lines 135-144
**Apply to:** Any flag that maps to a `_p` API boolean param
```typescript
// In flags:
active: Flags.boolean({ description: 'Set active', allowNo: true, required: false }),
'active-p': Flags.string({ hidden: true, required: false }),
// In run():
const activeVal = parseBoolParam(flags.active, flags['active-p'])
if (activeVal !== undefined) body.active_p = activeVal ? 1 : 0
```

### Table with Dim Count Line
**Source:** `packages/twentythree-cli/src/commands/audience/field/list.ts` lines 85-87
**Apply to:** All list commands after rendering the table
```typescript
const table = renderTable(headers, tableRows)
this.log(table.toString())
this.log(chalk.dim(`${rows.length} spot(s)`))
```

---

## No Analog Found

All Phase 8 files have analogs in the existing codebase. The two infrastructure features (`doctor`, `--agent`) have close analogs in `auth/credentials.ts` (bare `Command` extension) and `base-command.ts` (flag addition), respectively — both are modifications of existing patterns rather than entirely new patterns.

| File | Notes |
|---|---|
| `src/commands/doctor.ts` | No exact analog for health-check command; uses `auth/credentials.ts` bare-Command pattern as structural base |
| `src/lib/__tests__/doctor.test.ts` | New test file — use existing test files in `src/commands/category/__tests__/` and `src/lib/__tests__/` as structural reference |
| `src/lib/__tests__/agent.test.ts` | New test file — use existing lib test files as structural reference |

---

## Anti-Patterns (Do Not Use)

| Anti-Pattern | Correct Approach | Source |
|---|---|---|
| `doctor` extends `AuthenticatedCommand` or `BaseCommand` | Extend `Command` directly; handle workspace resolution manually | Pitfall 1 in RESEARCH.md |
| POST body without `Content-Type` header | Always include `headers: { 'Content-Type': 'application/x-www-form-urlencoded' }` | Pitfall 2; `video/delete.ts` line 61 |
| `openupload/upload-file` using default `tokenFieldName` | Pass `tokenFieldName: 'token'` explicitly | Pitfall 3; `chunked-upload.ts` line 51 |
| Chunked engine for `thumbnail/file/upload` | Use FormData `bodySerializer` pattern (Pattern F) | D-3 decision |
| Direct `String(error)` on API errors | `formatApiError(error)` from `output.ts` | `output.ts` lines 110-123 |
| Skipping `applyCliTerms()` on error messages | Wrap all `this.error()` calls with `applyCliTerms()` | CLI-04 requirement |
| Multipart missing for `user/update` | Use `bodySerializer` FormData for user/update (profile_image) | Pitfall 7 in RESEARCH.md |
| Adding `static agentMetadata` only to new commands | Add to ALL ~60+ existing commands as part of CLI-06 | Pitfall 6 in RESEARCH.md |

---

## Metadata

**Analog search scope:** `packages/twentythree-cli/src/commands/`, `packages/twentythree-cli/src/lib/`, `packages/twentythree-cli/src/upload/`
**Files scanned:** 15 analog files read in full
**Pattern extraction date:** 2026-04-16
