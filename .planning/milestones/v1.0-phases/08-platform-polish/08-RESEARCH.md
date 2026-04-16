# Phase 8: Platform & Polish - Research

**Researched:** 2026-04-16
**Domain:** oclif v4 CLI commands, TwentyThree API (spot/thumbnail/webhook/app/presentation/protection/session/openupload/site/user), `doctor` health check, `--agent` machine-readable metadata
**Confidence:** HIGH — all findings verified directly against the codebase and OpenAPI spec

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-1: `doctor` — 3-check pass/fail table**
- Exactly 3 checks in order: (1) Credentials stored, (2) Connectivity, (3) Token valid
- Output: coloured pass/fail table with Check | Status | Detail columns
- Green `✓ OK` / Red `✗ FAIL` per row using chalk; exit 0 all pass, exit 1 any fail
- `--json` output: `{ ok: boolean, checks: [{ name, passed, detail }] }`
- No auto-fix — report only

**D-2: `--help --agent` — global flag, oclif-derived JSON**
- `--agent` global flag on `BaseCommand` — all commands inherit
- Invocation: `twentythree <any-command> --help --agent`
- Output JSON includes: `command`, `description`, `flags`, `examples`, `api_endpoint`, `auth_scope`, `output_shape`, `side_effects`
- Each command provides `static agentMetadata` with API endpoint, auth scope, output shape, side effects
- auth_scope values: `anonymous` | `none` | `read` | `write` | `admin` | `super`
- side_effects values: `none` | `destructive` | `creates` | `updates`

**D-3: `thumbnail file upload` — direct multipart, not chunked engine**
- PNG/JPEG images (<5 MB) — direct multipart POST, no progress bar
- Simple spinner only
- 3-level oclif topic: `thumbnail/file/list.ts`, `thumbnail/file/upload.ts`, `thumbnail/file/delete.ts`
- Note: in the OpenAPI spec these are `thumbnail/template/list-files`, `thumbnail/template/upload-file`, `thumbnail/template/delete-file`

**D-4: `presentation` — 3-level oclif topic matching domain structure**
- `presentation/setting/list.ts`, `presentation/setting/update.ts`, `presentation/page/link-locations.ts`

**D-5: Patterns carried from prior phases (global, apply everywhere)**
- Pagination: `--offset`/`--size` (or `--page`/`--size` where API uses `p`) — no auto-fetch loops
- List output: `renderTable()` + dim count line; empty state "No X found."
- Single-object output: key-value render
- `--json` shape: `{ ok, data, summary, breadcrumbs }` on all commands
- Confirmation + exit 2: all destructive commands
- `applyCliTerms()`: on all user-facing strings
- 3-level oclif topics: via directory structure

### Claude's Discretion

- Flag naming for commands not explicitly specified — follow existing patterns (mirror API param names, drop `_p` suffix for booleans)
- `openupload upload-file` flag shape — use same flag names as `video upload` where applicable
- Column selection for table output per command — most useful subset of API response fields
- Whether to add a root `presentation index.ts` / `thumbnail index.ts` — follow `analytics video index.ts` pattern if needed

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
Browser OAuth flow, non-npm distribution, GUI tooling are out of scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SPT-01 | `twentythree spot list` — list spots with pagination | GET /spot/list; params: spot_id, search, spot_type, p, size, orderby, order |
| SPT-02 | `twentythree spot create` — create a new spot | POST /spot/create; required: spot_name; optional: spot_type, spot_design, spot_layout, etc. |
| SPT-03 | `twentythree spot update <id>` — update spot settings | POST /spot/update; required: spot_id; optional: spot_name, active_p, etc. |
| SPT-04 | `twentythree spot delete <id>` — delete with confirmation | POST /spot/delete; required: spot_id; destructive |
| SPT-05 | `twentythree spot set-videos <id>` — set videos assigned to spot | POST /spot/set-videos; required: spot_id, videos (comma-separated?) |
| SPT-06 | `twentythree spot check <id>` — check spot CORS status | GET /spot/check; required: spot_id; returns {allowInlineEdit} |
| SPT-07 | `twentythree spot reset-version <id>` — reset spot version | POST /spot/reset-version; required: spot_id |
| THB-01 | `twentythree thumbnail list` — list thumbnail templates | GET /thumbnail/template/list; params: search, object_type |
| THB-02 | `twentythree thumbnail add` — create thumbnail template | POST /thumbnail/template/add; required: name, liquid_template |
| THB-03 | `twentythree thumbnail update <id>` — update template | POST /thumbnail/template/update; required: thumbnail_template_id |
| THB-04 | `twentythree thumbnail delete <id>` — delete with confirmation | POST /thumbnail/template/delete; required: thumbnail_template_id |
| THB-05 | `twentythree thumbnail duplicate <id>` — duplicate template | POST /thumbnail/template/duplicate; required: thumbnail_template_id |
| THB-06 | `twentythree thumbnail data <id>` — retrieve template data | GET /thumbnail/template/data; required: thumbnail_template_id, object_id |
| THB-07 | `twentythree thumbnail file list\|upload\|delete <id>` — manage template files | GET /thumbnail/template/list-files; POST /thumbnail/template/upload-file; POST /thumbnail/template/delete-file |
| WHK-01 | `twentythree webhook list` — list webhook subscriptions | GET /webhook/list; returns: webhook_id, event, target_url |
| WHK-02 | `twentythree webhook subscribe` — create subscription | POST /webhook/subscribe; required: target_url, event |
| WHK-03 | `twentythree webhook unsubscribe <id>` — remove subscription | POST /webhook/unsubscribe; webhook_id OR target_url |
| WHK-04 | `twentythree webhook events` — list event types | GET /webhook/events; returns array of {event} strings |
| WHK-05 | `twentythree webhook sample <event>` — sample payload | GET /webhook/sample; required: event |
| APP-01 | `twentythree app add` — install app integration | POST /app/add; required: name; optional: description, style, type |
| APP-02 | `twentythree app update <id>` — update app settings | POST /app/update; required: app_id, name |
| APP-03 | `twentythree app delete <id>` — remove app with confirmation | POST /app/delete; required: app_id; destructive |
| PRS-01 | `twentythree presentation setting list` — list settings | GET /presentation/setting/list; returns large settings object |
| PRS-02 | `twentythree presentation setting update` — update settings | POST /presentation/setting/update; body is freeform key-value pairs |
| PRS-03 | `twentythree presentation page link-locations` — retrieve options | GET /presentation/page/link-locations; returns [{link_location, label}] |
| PRT-01 | `twentythree protection protect <id>` — apply protection | POST /protection/protect; required: protection_method; optional: object_id, grace_minutes |
| PRT-02 | `twentythree protection unprotect <id>` — remove protection | POST /protection/unprotect; optional: object_id |
| PRT-03 | `twentythree protection verify` — verify credentials | GET /protection/verify; required: protection_method; optional: photo_id, live_id, object_id, verification_data |
| SES-01 | `twentythree session get-token` — create session token | GET /session/get-token; optional: return_url, email, full_name; returns access_token |
| SES-02 | `twentythree session redeem-token` — redeem session token | POST /session/redeem-token; required: session_token |
| OUP-01 | `twentythree openupload list` — list open upload entries | GET /openupload/list; params: token_upload_id, token, app_p |
| OUP-02 | `twentythree openupload upload-file` — upload via open upload using chunked engine | POST /openupload/upload-file; multipart; required: token_upload_id, token; supports Resumable.js |
| OUP-03 | `twentythree openupload update-file <id>` — update entry | POST /openupload/update-file; required: token_upload_id, token, upload_key |
| SITE-01 | `twentythree site get` — retrieve site settings | GET /site/get; optional: include_presentation_p, include_quota_p |
| SITE-02 | `twentythree site search` — search within site | GET /site/search; optional: search, search_in, selection, size |
| SITE-03 | `twentythree setting update` — update global site settings | POST /setting/update; freeform key-value; validate_only_p to dry-run |
| USR-01 | `twentythree user list` — list users with pagination | GET /user/list; many filter params including search, user_id, p, size |
| USR-02 | `twentythree user get <id>` — retrieve user details | GET /user/get; params: user_id, include_invitation_p |
| USR-03 | `twentythree user create` — create new user | POST /user/create; required: email; optional: username, full_name, site_admin, user_type, etc. |
| USR-04 | `twentythree user update <id>` — update user details | POST /user/update; multipart/form-data; optional: email, password, full_name, profile_image, etc. |
| USR-05 | `twentythree user send-invitation <id>` — send invitation | POST /user/send-invitation; required: user_id; optional: invitation_message |
| USR-06 | `twentythree user get-login-token <id>` — generate login token | GET /user/get-login-token; required: user_id; optional: return_url; returns login_token |
| USR-07 | `twentythree user redeem-login-token` — redeem login token | GET /user/redeem-login-token; required: login_token |
| USR-08 | `twentythree user tokens` — retrieve cross-site tokens | NOT IN SPEC — `/user/tokens` does not exist in swagger.json; AUTH-02 references it; needs clarification |
| CLI-05 | `twentythree doctor` — health check | 3 checks: credentials stored, connectivity, token valid; coloured table output |
| CLI-06 | `--help --agent` — machine-readable metadata | Global flag on BaseCommand; JSON output with static agentMetadata per command |
</phase_requirements>

---

## Summary

Phase 8 completes the TwentyThree CLI platform surface by implementing 11 command groups (spot, thumbnail, webhook, app, presentation, protection, session, openupload, site/setting, user) plus two infrastructure features (`doctor` and `--agent`). All patterns are firmly established from prior phases — this phase is primarily a systematic application of those patterns against the remaining API endpoints.

The research confirms the codebase is in excellent shape for this phase. All required infrastructure (BaseCommand, output helpers, chunk upload engine, pagination, confirm() pattern) is already implemented and tested. The implementation will be largely mechanical following established patterns, with a few specific complexity areas: the `--agent` global flag requires modifying `BaseCommand` and adding `static agentMetadata` to every existing command; `openupload upload-file` uses the chunked engine but with `token_upload_id`/`token` as the auth mechanism instead of `upload_token`; `setting/update` and `presentation/setting/update` accept freeform key-value pairs; USR-08 references an endpoint not in the swagger spec.

**Primary recommendation:** Organize implementation into waves by similarity: (Wave 1) simple CRUD groups (spot, webhook, app, user); (Wave 2) structural groups (thumbnail with 3-level file subtopic, presentation with 3-level setting subtopic); (Wave 3) special commands (protection, session, openupload, site); (Wave 4) infrastructure features (doctor, --agent global flag + agentMetadata on all commands).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| spot/thumbnail/webhook/app/presentation commands | CLI (oclif command layer) | API tier (TwentyThree backend) | Standard CRUD commands dispatched by oclif; state lives in remote API |
| protection/session commands | CLI (oclif command layer) | API tier | Security operations proxied to API; CLI is a thin orchestration layer |
| openupload upload-file | CLI (chunked upload engine) | API tier | Large file upload; chunked engine handles retry/progress; endpoint supports Resumable.js |
| thumbnail file upload | CLI (direct multipart POST) | API tier | Images are small (<5MB); chunked engine overhead unwarranted |
| `doctor` health check | CLI (connectivity probe) | OS keychain + API tier | Reads local credentials, makes HTTPS probe, then authenticated API call |
| `--agent` metadata | CLI (oclif introspection) | — | Pure CLI layer: reads flag descriptors + static metadata, outputs JSON |
| user management commands | CLI (oclif command layer) | API tier | Standard admin operations; user/update uses multipart for profile image upload |

## Standard Stack

All dependencies already installed. No new packages required for Phase 8.

### Core (Already Installed)
| Library | Version | Purpose | Role in Phase 8 |
|---------|---------|---------|----------------|
| `@oclif/core` | 4.x | CLI framework, flag parsing, help generation | `--agent` global flag; 3-level topics via directory structure |
| `chalk` | 4.x (CJS) | Terminal colour | `doctor` output: green `✓ OK` / red `✗ FAIL` |
| `@clack/prompts` | latest | confirm() prompts | Destructive command confirmations (delete, unprotect, etc.) |
| `openapi-fetch` | latest | Type-safe API client | All HTTP calls using generated types |
| `ora` | 5.x (CJS) | Spinner | thumbnail file upload, session, simple non-upload commands |
| `node:https`/`node:http` | built-in | Connectivity check | `doctor` Connectivity check: simple HTTPS HEAD/GET probe |

### Supporting (Already Installed)
| Library | Version | Purpose | Role in Phase 8 |
|---------|---------|---------|----------------|
| `cli-table3` | latest | Tabular output | `doctor` pass/fail table; spot/user/webhook/etc. list tables |
| `conf` | latest | Non-sensitive config store | `doctor` reads active workspace via `getActiveWorkspace()` |
| `@napi-rs/keyring` | 1.2.x | OS keychain | `doctor` reads credentials via credential store helpers |

**Installation:** No new packages needed.

## Architecture Patterns

### System Architecture Diagram

```
User invokes: twentythree <command> [flags]
        |
        v
[oclif dispatch] ─── --help --agent ──> [BaseCommand --agent handler]
        |                                       |
        |                               reads static agentMetadata
        |                               reads oclif flag descriptors
        |                               prints JSON; exits 0
        |
        v
[BaseCommand.init()]
  - resolve workspace (conf store)
  - ensure fresh token (keyring)
  - create apiClient (openapi-fetch)
        |
        v
[Command.run()]
  ├─ printWorkspaceHeader()
  ├─ parse flags
  ├─ [if destructive] confirm() prompt ──> isCancel → exit(2)
  ├─ apiClient.GET/POST(endpoint, params)
  │     |
  │     └─> TwentyThree API (HTTPS)
  │           returns JSON
  │
  ├─ error handling: applyCliTerms(formatApiError(error))
  │
  └─ [if --json] return formatJsonOutput({ok, data, summary, breadcrumbs})
     [else]       renderTable() + dim count line
                  OR renderKeyValue() for single object


twentythree doctor:
  BaseCommand.init() ─→ skip (doctor uses custom init that tolerates no workspace)
        |
        v
  Check 1: credentials stored ──> read conf + keyring ──> pass/fail
  Check 2: connectivity ──> HTTPS probe to active domain ──> pass/fail
  Check 3: token valid ──> apiClient.GET(/photo/list) → 200 ──> pass/fail
        |
        v
  renderTable(['Check','Status','Detail'], rows)
  exit(allPassed ? 0 : 1)

openupload upload-file flow:
  user provides: --token-upload-id, --token, --file-path
        |
        v
  uploadChunked({
    filePath, uploadUrl: apiBaseUrl + 'openupload/upload-file',
    uploadToken: token, tokenFieldName: 'token',
    extraFields: { token_upload_id, ...metadata }
  })
        |
        v
  Resumable.js chunked POST ──> TwentyThree openupload endpoint
```

### Recommended Project Structure

The existing structure is correct. Phase 8 adds these directories/files:

```
src/commands/
├── spot/
│   ├── list.ts               → twentythree spot list
│   ├── create.ts             → twentythree spot create
│   ├── update.ts             → twentythree spot update
│   ├── delete.ts             → twentythree spot delete
│   ├── set-videos.ts         → twentythree spot set-videos
│   ├── check.ts              → twentythree spot check
│   └── reset-version.ts      → twentythree spot reset-version
├── thumbnail/
│   ├── index.ts              → twentythree thumbnail (topic root — mirrors analytics/video/index.ts)
│   ├── list.ts               → twentythree thumbnail list
│   ├── add.ts                → twentythree thumbnail add
│   ├── update.ts             → twentythree thumbnail update
│   ├── delete.ts             → twentythree thumbnail delete
│   ├── duplicate.ts          → twentythree thumbnail duplicate
│   ├── data.ts               → twentythree thumbnail data
│   └── file/
│       ├── list.ts           → twentythree thumbnail file list
│       ├── upload.ts         → twentythree thumbnail file upload
│       └── delete.ts         → twentythree thumbnail file delete
├── webhook/
│   ├── list.ts               → twentythree webhook list
│   ├── subscribe.ts          → twentythree webhook subscribe
│   ├── unsubscribe.ts        → twentythree webhook unsubscribe
│   ├── events.ts             → twentythree webhook events
│   └── sample.ts             → twentythree webhook sample
├── app/
│   ├── add.ts                → twentythree app add
│   ├── update.ts             → twentythree app update
│   └── delete.ts             → twentythree app delete
├── presentation/
│   ├── setting/
│   │   ├── list.ts           → twentythree presentation setting list
│   │   └── update.ts         → twentythree presentation setting update
│   └── page/
│       └── link-locations.ts → twentythree presentation page link-locations
├── protection/
│   ├── protect.ts            → twentythree protection protect
│   ├── unprotect.ts          → twentythree protection unprotect
│   └── verify.ts             → twentythree protection verify
├── session/
│   ├── get-token.ts          → twentythree session get-token
│   └── redeem-token.ts       → twentythree session redeem-token
├── openupload/
│   ├── list.ts               → twentythree openupload list
│   ├── upload-file.ts        → twentythree openupload upload-file
│   └── update-file.ts        → twentythree openupload update-file
├── site/
│   ├── get.ts                → twentythree site get
│   └── search.ts             → twentythree site search
├── setting/
│   └── update.ts             → twentythree setting update
├── user/
│   ├── list.ts               → twentythree user list
│   ├── get.ts                → twentythree user get
│   ├── create.ts             → twentythree user create
│   ├── update.ts             → twentythree user update
│   ├── send-invitation.ts    → twentythree user send-invitation
│   ├── get-login-token.ts    → twentythree user get-login-token
│   ├── redeem-login-token.ts → twentythree user redeem-login-token
│   └── tokens.ts             → twentythree user tokens (USR-08 — needs investigation)
└── doctor.ts                 → twentythree doctor
```

### Pattern 1: Standard GET List Command

```typescript
// Source: packages/twentythree-cli/src/commands/audience/field/list.ts
export default class SpotList extends AuthenticatedCommand<typeof SpotList> {
  static description = 'List spots in the active workspace'
  static examples = ['<%= config.bin %> spot list', '<%= config.bin %> spot list --json']
  static enableJsonFlag = true
  static flags = {
    ...AuthenticatedCommand.baseFlags,
    page: Flags.integer({ description: 'Page number', required: false }),
    size: Flags.integer({ description: 'Number of results per page', required: false }),
    search: Flags.string({ description: 'Search term', required: false }),
  }

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
      return formatJsonOutput({ ok: true, data: rows, summary: `${rows.length} spot(s)`,
        breadcrumbs: [{ domain: this.activeWorkspace.domain }, { resource: 'spot' }] })
    }
    if (rows.length === 0) { this.log('No spots found.'); return }
    const table = renderTable(['ID', 'Name', 'Type', 'Active'], rows.map((r: any) => [
      String(r.spot_id ?? ''), String(r.spot_name ?? ''), String(r.spot_type ?? ''),
      String(r.active_p ?? ''),
    ]))
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} spot(s)`))
  }
}
```

### Pattern 2: POST with form-urlencoded Body

All POST mutation endpoints use `application/x-www-form-urlencoded`. The existing pattern is to pass body and header:

```typescript
// Source: packages/twentythree-cli/src/commands/video/delete.ts
const { data, error } = await this.apiClient.POST('/spot/delete', {
  body: { spot_id: Number(args.id) } as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
```

### Pattern 3: Destructive Command with Confirmation

```typescript
// Source: packages/twentythree-cli/src/commands/video/delete.ts
import { confirm, isCancel } from '@clack/prompts'
if (!this.jsonEnabled()) {
  const confirmed = await confirm({
    message: `Delete spot ${args.id} from ${this.activeWorkspace.domain}? This cannot be undone.`,
  })
  if (isCancel(confirmed) || !confirmed) {
    process.exit(EXIT_CANCELLED)
  }
}
```

### Pattern 4: Multipart File Upload (Direct, Not Chunked)

Reference: `video subtitle upload` command. Use `bodySerializer` with FormData:

```typescript
// Source: packages/twentythree-cli/src/commands/video/subtitle/upload.ts
const { data, error } = await this.apiClient.POST('/thumbnail/template/upload-file', {
  body: {
    thumbnail_template_id: Number(args.id),
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
```

### Pattern 5: Chunked Upload (openupload upload-file)

The `openupload/upload-file` endpoint accepts Resumable.js params. The upload flow differs from `video upload` because open upload tokens are provided by the user (they already have `token_upload_id` and `token` from the platform). No `photo/get-upload-token` step is needed.

```typescript
// Based on: packages/twentythree-cli/src/commands/video/upload.ts + chunked-upload.ts
// The uploadChunked function accepts extraFields and tokenFieldName
await uploadChunked({
  filePath: flags['file-path'],
  uploadUrl: this.apiBaseUrl + 'openupload/upload-file',
  uploadToken: flags.token,         // the open upload token
  tokenFieldName: 'token',          // field name for the token in form data
  bearerToken: this.activeWorkspace.bearer_token || undefined,
  chunkSize: flags['chunk-size'],
  concurrency: flags.concurrency,
  extraFields: {
    token_upload_id: flags['token-upload-id'],
    // title, album_id, etc. as optional extras
  },
  onProgress: (bytes, total) => bar.render(bytes, total, 0),
})
```

### Pattern 6: `doctor` Command Structure

The `doctor` command is unique — it must tolerate the case where no workspace is configured (Credentials check should report FAIL, not error out). This means it cannot extend the standard `BaseCommand` path that calls `this.error()` when workspace is missing. Instead it should catch and handle the missing-workspace case gracefully.

```typescript
// doctor.ts — simplified structure
export default class Doctor extends Command {  // NOT AuthenticatedCommand
  static description = 'Check CLI credentials, connectivity, and token validity'
  static enableJsonFlag = true

  public async run(): Promise<void | object> {
    const checks: { name: string; passed: boolean; detail: string }[] = []

    // Check 1: Credentials stored
    // Use getActiveWorkspace() + getWorkspaceForDomain() from workspace-config
    // If null → { name: 'Credentials stored', passed: false, detail: 'No workspace configured' }

    // Check 2: Connectivity (only if check 1 passed)
    // Use https.get() or fetch() to HEAD the workspace domain
    // If unreachable → { name: 'Connectivity', passed: false, detail: error message }

    // Check 3: Token valid (only if check 2 passed)
    // Make authenticated GET /photo/list?size=1
    // 200 → pass; 401/403 → fail

    // Render table with chalk colors
    const table = renderDoctorTable(checks)
    this.log(table)

    const allPassed = checks.every(c => c.passed)
    if (this.jsonEnabled()) {
      return { ok: allPassed, checks }
    }
    if (!allPassed) process.exit(1)
  }
}
```

**Key design note:** Doctor extends base `Command` from oclif, not `BaseCommand` — otherwise missing credentials throws an error before the command can report it as a check failure.

### Pattern 7: `--agent` Global Flag with Static Metadata

The `--agent` flag is registered on `BaseCommand.baseFlags`. When present alongside `--help`, the command outputs JSON and exits instead of running:

```typescript
// In BaseCommand.baseFlags:
static baseFlags = {
  workspace: Flags.string({ ... }),
  agent: Flags.boolean({
    description: 'Output machine-readable command metadata (for AI agent consumption)',
    helpGroup: 'GLOBAL',
    hidden: true,  // hidden from normal --help; shown with --help --agent
  }),
}

// In BaseCommand.init() or run():
// After parsing flags, check if --agent was provided
// If yes: serialize agentMetadata + flag introspection to JSON, then process.exit(0)
```

Each command declares `static agentMetadata`:

```typescript
// Example: spot/list.ts
static agentMetadata = {
  api_endpoint: 'GET /spot/list',
  auth_scope: 'read' as const,
  output_shape: { type: 'table', columns: ['ID', 'Name', 'Type', 'Active'] } as const,
  side_effects: 'none' as const,
}
```

The `--agent` handler in BaseCommand reads `this.ctor.agentMetadata` alongside `this.ctor.flags` (oclif's introspectable flag definitions) to build the output JSON.

**Implementation note for flag serialization:** oclif stores flag definitions on the command class as `static flags`. Each flag has `name`, `description`, `required`, `default`, and `type` (derived from the flag constructor: `Flags.string` → `"string"`, `Flags.integer` → `"integer"`, `Flags.boolean` → `"boolean"`). The `--agent` handler iterates `Object.entries(this.ctor.flags)` to build the `flags` array.

### Anti-Patterns to Avoid

- **Extending AuthenticatedCommand for `doctor`:** Doctor must tolerate missing credentials to report them as a check failure. Using AuthenticatedCommand causes `this.error()` before the check table is rendered.
- **Using chunked engine for thumbnail file upload:** D-3 locks this to direct multipart. Thumbnails are <5MB images; the chunked engine adds unnecessary complexity and progress bar overhead.
- **Putting `token_upload_id` as `uploadToken` in chunked upload:** The extraFields mechanism exists for this. `uploadToken` maps to `tokenFieldName` in the form body; `token_upload_id` goes in `extraFields`.
- **Freeform flags for `setting/update`:** The API accepts arbitrary key-value pairs (it's a workspace settings endpoint). The CLI should expose the most common settings as named flags, not try to enumerate all possible keys.
- **Not calling `applyCliTerms()` on error messages:** All error strings must pass through `applyCliTerms()` to avoid leaking `photo`, `album`, `live` to the user.
- **Skipping confirmation on `protection/unprotect`:** This is a destructive action (removes access control from content) — confirm() + exit 2 required like any delete.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chunked file upload with retry | Custom upload loop | `uploadChunked()` from `src/upload/chunked-upload.ts` | Handles Resumable.js protocol, concurrency, retry, progress callback — already tested |
| Table rendering | String concatenation | `renderTable()` from `src/lib/output.ts` | Consistent cyan headers, cli-table3 column width management |
| JSON output shape | Custom object | `formatJsonOutput()` from `src/lib/output.ts` | Enforces `{ ok, data, summary, breadcrumbs }` contract (CLI-01) |
| API error formatting | `String(error)` | `formatApiError()` from `src/lib/output.ts` | Handles object error bodies that String() renders as "[object Object]" |
| Term translation | Direct string output | `applyCliTerms()` from `src/lib/term-map.ts` | CLI-04: no `photo`, `album`, `live` in user output |
| Destructive confirmation | Custom readline | `confirm()` + `isCancel()` from `@clack/prompts` | Consistent UX; already handles Ctrl+C (isCancel pattern) |
| Boolean param parsing | Conditional checks | `parseBoolParam()` from `src/lib/output.ts` | Handles `--flag / --no-flag` and hidden `--flag-p 1/0` alt |
| URL resolution | String concatenation | `resolveUrl()` from `src/lib/output.ts` | Handles relative vs absolute URL correctly (CLI-07) |

**Key insight:** Phase 8 is explicitly a "don't hand-roll" phase — every primitive needed (upload, table, JSON, error, term, confirm, bool, URL) already exists as a tested utility. The implementation is pattern application, not infrastructure building.

## API Endpoint Reference

### Spot Group (SPT-01 to SPT-07)

| Command | Method | Endpoint | Key Params |
|---------|--------|----------|------------|
| `spot list` | GET | `/spot/list` | spot_id, search, spot_type, active_p, p, size, orderby, order |
| `spot create` | POST form | `/spot/create` | spot_name* |
| `spot update` | POST form | `/spot/update` | spot_id* |
| `spot delete` | POST form | `/spot/delete` | spot_id* |
| `spot set-videos` | POST form | `/spot/set-videos` | spot_id*, videos |
| `spot check` | GET | `/spot/check` | spot_id* — returns `{allowInlineEdit}` |
| `spot reset-version` | POST form | `/spot/reset-version` | spot_id* |

**Table columns for `spot list`:** ID, Name, Type, Active (from: spot_id, spot_name, spot_type, active_p)

### Thumbnail Group (THB-01 to THB-07)

| Command | Method | Endpoint | Key Params |
|---------|--------|----------|------------|
| `thumbnail list` | GET | `/thumbnail/template/list` | search, object_type |
| `thumbnail add` | POST form | `/thumbnail/template/add` | name*, liquid_template* |
| `thumbnail update` | POST form | `/thumbnail/template/update` | thumbnail_template_id* |
| `thumbnail delete` | POST form | `/thumbnail/template/delete` | thumbnail_template_id* |
| `thumbnail duplicate` | POST form | `/thumbnail/template/duplicate` | thumbnail_template_id*, name |
| `thumbnail data` | GET | `/thumbnail/template/data` | thumbnail_template_id*, object_id* |
| `thumbnail file list` | GET | `/thumbnail/template/list-files` | thumbnail_template_id* |
| `thumbnail file upload` | POST multipart | `/thumbnail/template/upload-file` | thumbnail_template_id*, file |
| `thumbnail file delete` | POST form | `/thumbnail/template/delete-file` | thumbnail_template_id*, filename* |

**Table columns for `thumbnail list`:** ID, Name, Type, Width, Height (from: thumbnail_template_id, name, object_type, width, height)
**Table columns for `thumbnail file list`:** Filename, Size, URL (from: filename, size_fmt, url)

### Webhook Group (WHK-01 to WHK-05)

| Command | Method | Endpoint | Key Params |
|---------|--------|----------|------------|
| `webhook list` | GET | `/webhook/list` | (none) |
| `webhook subscribe` | POST form | `/webhook/subscribe` | target_url*, event* |
| `webhook unsubscribe` | POST form | `/webhook/unsubscribe` | webhook_id OR target_url |
| `webhook events` | GET | `/webhook/events` | test_authentication_p |
| `webhook sample` | GET | `/webhook/sample` | event* |

**Table columns for `webhook list`:** ID, Event, Target URL (from: webhook_id, event, target_url)
**Output for `webhook events`:** Simple list of event strings (the `event` field from each item)
**Output for `webhook sample`:** Pretty-printed raw JSON (the sample payload object)

### App Group (APP-01 to APP-03)

| Command | Method | Endpoint | Key Params |
|---------|--------|----------|------------|
| `app add` | POST form | `/app/add` | name* |
| `app update` | POST form | `/app/update` | app_id*, name* |
| `app delete` | POST form | `/app/delete` | app_id* |

**Note:** There is no `app list` endpoint in the spec. App commands are write-only from the CLI perspective.

### Presentation Group (PRS-01 to PRS-03)

| Command | Method | Endpoint | Key Params |
|---------|--------|----------|------------|
| `presentation setting list` | GET | `/presentation/setting/list` | (none) |
| `presentation setting update` | POST form | `/presentation/setting/update` | freeform key-value pairs |
| `presentation page link-locations` | GET | `/presentation/page/link-locations` | (none) |

**Critical note on `presentation/setting/update`:** The OpenAPI spec body schema only declares `fields` as a named property, but the description says to submit any key-value pairs alongside it. This is an open-ended settings update. The CLI command should expose the most commonly used setting keys as named flags; additional keys can be accepted via a `--set key=value` flag pattern.

**Output for `presentation setting list`:** key-value render (large object, not a list of rows)
**Output for `presentation page link-locations`:** table with columns [Link Location, Label]

### Protection Group (PRT-01 to PRT-03)

| Command | Method | Endpoint | Key Params |
|---------|--------|----------|------------|
| `protection protect` | POST form | `/protection/protect` | protection_method*; optional: object_id, grace_minutes |
| `protection unprotect` | POST form | `/protection/unprotect` | optional: object_id |
| `protection verify` | GET | `/protection/verify` | protection_method*; optional: photo_id, live_id, object_id, verification_data |

**Protection methods** (per API): the protection_method field is a string (e.g. "password", "sso", "token") — exact values not enumerated in spec schema; expose as free-form string flag.

### Session Group (SES-01 to SES-02)

| Command | Method | Endpoint | Key Params |
|---------|--------|----------|------------|
| `session get-token` | GET | `/session/get-token` | optional: return_url, email, full_name; returns access_token |
| `session redeem-token` | POST form | `/session/redeem-token` | session_token* |

### Open Upload Group (OUP-01 to OUP-03)

| Command | Method | Endpoint | Key Params |
|---------|--------|----------|------------|
| `openupload list` | GET | `/openupload/list` | optional: token_upload_id, token, app_p |
| `openupload upload-file` | POST multipart + Resumable.js | `/openupload/upload-file` | token_upload_id*, token*; then file via chunked engine |
| `openupload update-file` | POST form | `/openupload/update-file` | token_upload_id*, token*, upload_key* |

**Table columns for `openupload list`:** ID, Name, Token, Public (from: token_upload_id, name, token, public_p)

### Site & Setting Group (SITE-01 to SITE-03)

| Command | Method | Endpoint | Key Params |
|---------|--------|----------|------------|
| `site get` | GET | `/site/get` | optional: include_presentation_p, include_quota_p |
| `site search` | GET | `/site/search` | optional: search, search_in, selection, size |
| `setting update` | POST form | `/setting/update` | freeform key-value; validate_only_p to dry-run |

**Output for `site get`:** key-value render (large site object)
**Table columns for `site search`:** Type, Title/Label, ID (from: object_type, title OR label, object_id)
**Note on `setting update`:** The spec description says "Submit key-value pairs as form parameters alongside any declared parameters." Same pattern as `presentation/setting/update` — expose a `--set key=value` flag or accept common settings as named flags.

### User Group (USR-01 to USR-08)

| Command | Method | Endpoint | Key Params |
|---------|--------|----------|------------|
| `user list` | GET | `/user/list` | search, user_id, p, size, plus many filters |
| `user get` | GET | `/user/get` | user_id, include_invitation_p |
| `user create` | POST form | `/user/create` | email*; optional: username, full_name, site_admin, user_type |
| `user update` | POST multipart | `/user/update` | optional: user_id, email, full_name, profile_image (file upload), password |
| `user send-invitation` | POST form | `/user/send-invitation` | user_id*; optional: invitation_message |
| `user get-login-token` | GET | `/user/get-login-token` | user_id*; optional: return_url; returns login_token |
| `user redeem-login-token` | GET | `/user/redeem-login-token` | login_token* |
| `user tokens` | UNKNOWN | N/A — not in spec | USR-08 — see Open Questions |

**user/update is multipart/form-data** (confirmed from spec — includes profile_image file field)
**Table columns for `user list`:** ID, Username, Display Name, URL (from: user_id, username, display_name, url)

## Common Pitfalls

### Pitfall 1: `doctor` Extending AuthenticatedCommand
**What goes wrong:** If Doctor extends BaseCommand (which calls `this.error()` when no workspace is configured), the Credentials check can never report FAIL gracefully — it throws and exits with an unformatted error before printing the table.
**Why it happens:** BaseCommand.init() enforces workspace presence as a hard error.
**How to avoid:** Doctor extends oclif's base `Command` directly and handles workspace resolution manually using the auth helper functions directly (`getActiveWorkspace()`, `getWorkspaceForDomain()`).
**Warning signs:** Doctor throws "No workspace configured" instead of printing a FAIL row.

### Pitfall 2: POST body without Content-Type header
**What goes wrong:** `application/x-www-form-urlencoded` POSTs fail if the Content-Type header is not explicitly set. openapi-fetch does not infer it automatically from the form body.
**Why it happens:** Established in Phase 6 (player/list pitfall). All form POST commands need the header.
**How to avoid:** Always include `headers: { 'Content-Type': 'application/x-www-form-urlencoded' }` in POST calls with form body.
**Warning signs:** API returns 400 or unexpected 200 with error status.

### Pitfall 3: openupload upload-file token confusion
**What goes wrong:** `openupload/upload-file` uses `token_upload_id` + `token` — not `upload_token` (the photo upload flow). If `tokenFieldName` defaults to `upload_token`, the form data will have the wrong field name.
**Why it happens:** The chunked engine defaults `tokenFieldName = 'upload_token'` (for backward compat with video upload). Open upload uses `token` instead.
**How to avoid:** Pass `tokenFieldName: 'token'` when calling `uploadChunked()` for open upload. Pass `token_upload_id` in `extraFields`.
**Warning signs:** API returns 401/403 or "invalid token" despite correct token value.

### Pitfall 4: Assuming presentation/setting/update has named settings
**What goes wrong:** The spec body schema for `/presentation/setting/update` only shows `fields` as a named property. The API actually accepts arbitrary setting keys as form params.
**Why it happens:** The OpenAPI schema is incomplete — the description text ("Submit key-value pairs as form parameters") contradicts the schema.
**How to avoid:** Accept freeform settings via `--set key=value` flags or expose the most common keys as named flags. Test with known setting keys from the platform.

### Pitfall 5: Forgetting `applyCliTerms()` on user-facing output
**What goes wrong:** API field names `photo_id`, `album_id`, `live_id` appear in error messages or output columns.
**Why it happens:** Easy to skip when rapidly implementing many commands.
**How to avoid:** All `this.error()` calls and all string fields in output pass through `applyCliTerms()`.

### Pitfall 6: agentMetadata missing on existing commands
**What goes wrong:** When `--agent` is implemented, the BaseCommand handler reads `this.ctor.agentMetadata`. If existing commands (video, analytics, audience, etc.) don't declare `static agentMetadata`, the --agent output will be incomplete or fail.
**Why it happens:** agentMetadata must be added to ALL ~60+ existing commands, not just Phase 8 commands.
**How to avoid:** Plan a dedicated task to add `static agentMetadata` to all existing commands before or alongside CLI-06 implementation.

### Pitfall 7: user/update multipart vs form-urlencoded
**What goes wrong:** `user/update` uses `multipart/form-data` (to support profile_image upload) while most other update commands use `application/x-www-form-urlencoded`. Using form-urlencoded will fail for user/update.
**Why it happens:** `user/update` includes a file field (`profile_image`), requiring multipart.
**How to avoid:** Use `bodySerializer` FormData pattern (same as subtitle/upload and thumbnail/file/upload) for `user update`.

## Code Examples

### Doctor Command Pass/Fail Table

```typescript
// Source: verified against CLI-table3 docs + chalk 4.x patterns used in codebase
import Table from 'cli-table3'
import chalk from 'chalk'

function renderDoctorTable(checks: { name: string; passed: boolean; detail: string }[]): string {
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
  return table.toString()
}
```

### --agent JSON Output Shape

```json
{
  "command": "spot list",
  "description": "List spots in the active workspace",
  "flags": [
    { "name": "page", "type": "integer", "required": false, "default": null, "description": "Page number" },
    { "name": "size", "type": "integer", "required": false, "default": null, "description": "Results per page" }
  ],
  "examples": ["twentythree spot list", "twentythree spot list --json"],
  "api_endpoint": "GET /spot/list",
  "auth_scope": "read",
  "output_shape": { "type": "table", "columns": ["ID", "Name", "Type", "Active"] },
  "side_effects": "none"
}
```

### agentMetadata Declaration Pattern

```typescript
// Add to every command class
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

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `keytar` for credentials | `@napi-rs/keyring` | Phase 1 | keytar archived; @napi-rs/keyring is maintained |
| `tsup` for build | `tsdown` | Phase 1 | tsup abandoned; tsdown is Rolldown-powered successor |
| Manual pagination | `fetchAllPages()` in pagination.ts | Phase 3 | Consistent pagination, DRY |
| `Flags.boolean()` only for boolean params | `parseBoolParam()` + hidden alt flag | Phase 3 | Script automation; `--flag-p 1` raw access |

No deprecated approaches are being used in this phase.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `protection_method` accepts freeform string values (e.g. "password", "sso") | API Endpoint Reference — Protection | Could have a fixed enum; exposing as free-form flag might accept invalid values |
| A2 | `setting/update` and `presentation/setting/update` accept arbitrary key-value pairs per description text (overriding narrow spec schema) | Common Pitfalls — Pitfall 4 | The spec schema may be authoritative; commands may only support the one documented field |
| A3 | `user tokens` (USR-08) maps to `/user/tokens` but that endpoint does not appear in the swagger spec | Phase Requirements — USR-08 | Endpoint may exist under a different path, or the requirement may be satisfied by `session/get-token` |

## Open Questions

1. **USR-08: `/user/tokens` endpoint not in swagger spec**
   - What we know: REQUIREMENTS.md says `twentythree user tokens` retrieves cross-site tokens; STATE.md says AUTH-02 calls `/api/2/user/tokens?cross_sites_p=1` to discover workspaces
   - What's unclear: The endpoint path `/user/tokens` does not appear in `twentythree-api-swagger.json`. It may be an authenticated-only endpoint excluded from public docs, or may be at a different path.
   - Recommendation: Implement `user tokens` as a best-effort GET call to `/user/tokens` with `cross_sites_p: 1`; accept that TypeScript types may require casting to `any`; flag for runtime verification against a live workspace.

2. **`presentation/setting/update` and `setting/update` flag design**
   - What we know: Both endpoints accept arbitrary key-value pairs; the spec schemas do not enumerate them.
   - What's unclear: What are the most commonly used setting keys a developer would want to update from the CLI?
   - Recommendation: Accept a repeatable `--set key=value` flag pattern (similar to Helm's `--set`). Parse the key=value pairs into form body fields at runtime.

3. **`thumbnail/template/data` output format**
   - What we know: Response data has nested objects: `{ site, themeoption, thumbnailtemplate, live, photo, liveseries, brandtokens }`
   - What's unclear: This is a complex nested object — unclear whether to display as flattened key-value or as raw JSON.
   - Recommendation: Output as formatted JSON by default (via `this.log(JSON.stringify(data, null, 2))`); `--json` returns the full structure in the standard envelope.

## Environment Availability

Step 2.6: SKIPPED — Phase 8 is purely code changes against already-established infrastructure. All tooling (Node.js, pnpm, TypeScript, vitest) is confirmed operational from prior phases.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest (globals: true) |
| Config file | `packages/twentythree-cli/vitest.config.ts` |
| Quick run command | `pnpm --filter twentythree-cli test --run` |
| Full suite command | `pnpm --filter twentythree-cli test --run` |

### Phase Requirements — Test Map

Phase 8 commands follow the same pattern as prior phases: command-level integration tests are manual/UAT (oclif commands require a live workspace to test end-to-end). The existing test infrastructure covers shared utilities. New unit tests should cover novel logic:

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLI-05 | doctor renders pass/fail table correctly | unit | `pnpm --filter twentythree-cli test --run src/lib/__tests__/doctor.test.ts` | ❌ Wave 0 |
| CLI-05 | doctor exits 0 on all pass, 1 on any fail | unit | same | ❌ Wave 0 |
| CLI-06 | --agent flag outputs valid JSON with all required fields | unit | `pnpm --filter twentythree-cli test --run src/lib/__tests__/agent.test.ts` | ❌ Wave 0 |
| OUP-02 | openupload upload-file uses tokenFieldName: 'token' | unit | existing chunk-pool/chunked-upload tests cover the engine | ✅ exists |
| All | Existing lib tests remain green | unit | `pnpm --filter twentythree-cli test --run` | ✅ exists |

### Sampling Rate

- **Per task commit:** `pnpm --filter twentythree-cli test --run`
- **Per wave merge:** `pnpm --filter twentythree-cli test --run`
- **Phase gate:** Full suite green + TypeScript clean (`pnpm --filter twentythree-cli exec tsc --noEmit`)

### Wave 0 Gaps

- [ ] `src/lib/__tests__/doctor.test.ts` — unit tests for doctor check logic and table rendering
- [ ] `src/lib/__tests__/agent.test.ts` — unit tests for --agent JSON output shape

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Bearer token via @napi-rs/keyring; doctor checks token validity |
| V3 Session Management | yes — SES-01/SES-02 | session/get-token returns access_token; display only, don't store |
| V4 Access Control | yes — USR-03/04/05 | user creation/update are admin operations; extend AuthenticatedCommand |
| V5 Input Validation | yes | All ID args validated as integers; file paths validated via fs.existsSync |
| V6 Cryptography | no — platform-handled | Protection tokens and session tokens generated server-side |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Token leakage in `session get-token` output | Information Disclosure | Print token value clearly but do not log to stderr or include in `--json` summary string |
| upload_token leakage (openupload) | Information Disclosure | T-03-03: onProgress reports byte counts only; `uploadToken` not logged (inherited from chunked engine) |
| HTTPS bypass on openupload URL | Elevation of Privilege | T-03-02: uploadUrl HTTPS validation in chunked-upload.ts already enforced |
| User update with profile_image arbitrary file | Tampering | Validate file path exists (fs.existsSync) before reading; API enforces file type server-side |
| doctor connectivity check SSRF | Not applicable | Doctor connects only to the already-configured workspace domain (user-controlled) |

## Sources

### Primary (HIGH confidence)
- `packages/twentythree-cli/specs/twentythree-api-swagger.json` — All endpoint paths, methods, request body schemas, response schemas (verified via direct inspection)
- `packages/twentythree-cli/src/lib/base-command.ts` — BaseCommand structure for --agent flag placement
- `packages/twentythree-cli/src/lib/output.ts` — All output helpers
- `packages/twentythree-cli/src/upload/chunked-upload.ts` — Chunked engine interface (tokenFieldName, extraFields)
- `packages/twentythree-cli/src/commands/video/subtitle/upload.ts` — Direct multipart FormData pattern
- `packages/twentythree-cli/src/commands/video/delete.ts` — Destructive confirm() pattern
- `packages/twentythree-cli/src/commands/analytics/video/index.ts` — 3-level topic index pattern
- `.planning/phases/08-platform-polish/08-CONTEXT.md` — Locked decisions D-1 through D-5

### Secondary (MEDIUM confidence)
- Prior phase STATE.md decision log — confirmed chunk-pool interface, term-map, parseBoolParam patterns

### Tertiary (LOW confidence)
- None — all claims verified directly against codebase or spec

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all verified against installed package.json; no new packages needed
- Architecture: HIGH — verified against existing command implementations and OpenAPI spec
- API surface: HIGH — all endpoint methods, params, and response schemas verified from swagger.json
- Pitfalls: HIGH — based on verified code patterns and spec inspection; Pitfalls 1-3 confirmed by spec/code; Pitfalls 4-5 from prior phase learnings

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (stable spec; low churn expected)
