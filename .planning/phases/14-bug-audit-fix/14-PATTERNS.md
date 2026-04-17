# Phase 14: Bug Audit & Fix - Pattern Map

**Mapped:** 2026-04-17
**Files analyzed:** 15 (all are modifications to existing files, no new files)
**Analogs found:** 15 / 15 (each file is its own analog — fixes are surgical edits within existing code)

---

## File Classification

| Modified File | Role | Data Flow | Fix Type | Error Code |
|---------------|------|-----------|----------|------------|
| `src/commands/video/section/delete.ts` | command | request-response | Add missing named import | TS2304 |
| `src/commands/video/subtitle/delete.ts` | command | request-response | Add missing named import | TS2304 |
| `src/commands/video/update.ts` | command | request-response | Add missing named import | TS2304 |
| `src/commands/webinar/mail/preview.ts` | command | request-response | Replace `HeadersInit` with `Record<string, string>` | TS2304 |
| `src/upload/chunked-upload.ts` | utility | file-I/O | Replace `HeadersInit` with `Record<string, string>` | TS2304 |
| `src/commands/video/subtitle/data.ts` | command | request-response | Add missing `token` param via `fetchVideoToken()` | TS2741 |
| `src/commands/video/frame.ts` | command | request-response | Cast path with `as any` | TS2345 |
| `src/commands/video/section/list.ts` | command | request-response | Wrap `args.id` with `Number()` | TS2322 |
| `src/commands/video/replace.ts` | command | file-I/O | Wrap `args.id` with `Number()` | TS2322 |
| `src/commands/video/transcoding-progress.ts` | command | request-response | Wrap `args.id` with `Number()` | TS2322 |
| `src/commands/video/get.ts` | command | request-response | Cast `include_unpublished_p` explicitly | TS2322 |
| `src/commands/video/list.ts` | command | request-response | Fix `include_unpublished_p` param type | TS2322 |
| `src/commands/auth/credentials.ts` | command | interactive | Add null guard in validate callback | TS18048 |
| `src/lib/base-command.ts` | base-class | request-response | Add `String()` cast on `photo_id` in `fetchVideoToken` | TS2322 |
| `src/auth/workspace-config.ts` | config | CRUD | Fix `moduleResolution` in `tsconfig.base.json` (optional D-17) | TS2307 |

---

## Pattern Assignments

### Group 1: Missing `formatApiError` Import (TS2304) — Priority: RUNTIME CRASH

**Affects:** `video/section/delete.ts`, `video/subtitle/delete.ts`, `video/update.ts`

**Pattern source:** `src/commands/video/list.ts` lines 1-6 (correct existing import)

The three broken files all have an import line that includes other exports from `../../lib/output.js` (or `../../../lib/output.js`) but omits `formatApiError`. The fix is to add `formatApiError` to the named import list.

**Correct import pattern** — copy from `src/commands/video/list.ts` lines 1-6:
```typescript
import { renderTable, formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR } from '../../lib/output.js'
```

**Broken import in `video/section/delete.ts`** (line 5):
```typescript
// BEFORE:
import { formatJsonOutput, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'

// AFTER:
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
```

**Broken import in `video/subtitle/delete.ts`** (line 5):
```typescript
// BEFORE:
import { formatJsonOutput, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'

// AFTER:
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
```

**Broken import in `video/update.ts`** (line 5):
```typescript
// BEFORE:
import { formatJsonOutput, parseBoolParam, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'

// AFTER:
import { formatJsonOutput, parseBoolParam, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
```

**Depth note:** `video/section/delete.ts` and `video/subtitle/delete.ts` are two levels deep (`commands/video/section/`) so the path is `../../../lib/output.js`. `video/update.ts` is one level deep (`commands/video/`) so the path is `../../lib/output.js`.

**Confirmed export:** `formatApiError` is exported from `src/lib/output.ts`. The call site in all three files is `this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })` — identical pattern to working commands like `video/list.ts` line 62-63.

---

### Group 2: `HeadersInit` Not in Scope (TS2304) — Priority: RUNTIME CRASH

**Affects:** `src/commands/webinar/mail/preview.ts` line 72, `src/upload/chunked-upload.ts` line 125

**Root cause:** `tsconfig.base.json` sets `"lib": ["ES2022"]` with no `"dom"` entry. `HeadersInit` is a DOM-only global. Node 22 native fetch headers work fine typed as `Record<string, string>`.

**Fix pattern** — replace `HeadersInit` with `Record<string, string>` in both files:

In `src/commands/webinar/mail/preview.ts` line 72:
```typescript
// BEFORE:
const headers: HeadersInit = {}

// AFTER:
const headers: Record<string, string> = {}
```

In `src/upload/chunked-upload.ts` line 125:
```typescript
// BEFORE:
const headers: HeadersInit = {}

// AFTER:
const headers: Record<string, string> = {}
```

Both files assign only string-keyed, string-valued entries to `headers` — `Record<string, string>` is a valid, narrower subtype of Node fetch `RequestInit['headers']`.

---

### Group 3: `photo_id` / Numeric Param Type Mismatches (TS2322) — Priority: Compile-time

**Affects:** `video/section/list.ts` line 42, `video/replace.ts` line 95, `video/transcoding-progress.ts` line 44

**Pattern source:** `src/commands/video/get.ts` line 45 (correct existing pattern):
```typescript
params: { query: { photo_id: Number(args.id), include_unpublished_p: 1 } },
```

And `src/commands/video/section/list.ts` line 42 (already has token but passes `args.id` as string):
```typescript
// BEFORE (video/section/list.ts line 42):
params: { query: { photo_id: args.id, token } },

// AFTER:
params: { query: { photo_id: Number(args.id), token } },
```

For `video/replace.ts` line 95, the get-replace-token call:
```typescript
// BEFORE:
params: { query: { photo_id: args.id } },

// AFTER:
params: { query: { photo_id: Number(args.id) } },
```

For `video/transcoding-progress.ts` line 44:
```typescript
// BEFORE:
params: { query: { photo_id: args.id } },

// AFTER:
params: { query: { photo_id: Number(args.id) } },
```

**Safety note (Pitfall 2):** `args.id` is declared `required: true` in all three commands (`static args = { id: Args.string({ required: true }) }`), so unconditional `Number(args.id)` is safe — oclif rejects the command before `run()` if `args.id` is missing.

---

### `src/commands/video/get.ts` — `include_unpublished_p` Type (D-07, TS2322)

**Error at line 45:** The generated type for `include_unpublished_p` in the OpenAPI `GET /photo/list` query is `string | undefined` in one variant, but the code passes the integer literal `1`.

**Current code** (line 45):
```typescript
params: { query: { photo_id: Number(args.id), include_unpublished_p: 1 } },
```

**Fix:** Cast the literal with `as const` or coerce to string depending on what `src/api/types.ts` declares for this param at implementation time:
```typescript
// Option A — if schema expects string:
params: { query: { photo_id: Number(args.id), include_unpublished_p: '1' as const } },

// Option B — cast to any to escape union:
params: { query: { photo_id: Number(args.id), include_unpublished_p: 1 as any } },
```

**Implementor action:** Check `src/api/types.ts` for `/photo/list` query `include_unpublished_p` declaration before choosing Option A or B.

---

### `src/commands/video/list.ts` — `include_unpublished_p` Type (D-08, TS2322)

**Error at line 57:** `parseBoolParam(...)` returns `boolean | undefined`; the ternary `? 1 : undefined` returns `number | undefined`, but the schema may expect `string | undefined`.

**Current code** (line 57):
```typescript
include_unpublished_p: parseBoolParam(flags['include-unpublished'], flags['include-unpublished-p']) ? 1 : undefined,
```

**Fix options:**
```typescript
// Option A — if schema expects string:
include_unpublished_p: parseBoolParam(flags['include-unpublished'], flags['include-unpublished-p']) ? '1' : undefined,

// Option B — escape with as any:
include_unpublished_p: (parseBoolParam(flags['include-unpublished'], flags['include-unpublished-p']) ? 1 : undefined) as any,
```

**Implementor action:** Check `src/api/types.ts` for `/photo/list` query param declaration. The RESEARCH.md notes this as an open question (Open Question 2). Prefer Option A (string cast) if the schema expects string — it is semantically correct with no runtime risk.

---

### `src/commands/video/frame.ts` — Path Not in `PathsWithMethod` (D-10, TS2345)

**Error at line 48:** `'/photo/frame'` is not in the generated `PathsWithMethod<paths, "post">` union — the OpenAPI spec does not define a POST endpoint for this path.

**Current code** (line 48):
```typescript
const { data, error } = await this.apiClient.POST('/photo/frame', {
```

**Fix:** Cast the path argument with `as any`:
```typescript
// AFTER (line 48):
const { data, error } = await this.apiClient.POST('/photo/frame' as any, {
```

**Pattern source:** Established pattern in codebase — `video/section/delete.ts` line 65-70 uses `body: { ... } as any` for body escapes; same `as any` idiom applies to paths when the spec is incomplete. Anti-pattern note from RESEARCH.md: only use `as any` for spec gaps, not for real missing imports.

---

### `src/commands/video/subtitle/data.ts` — Missing Required `token` Property (D-11, TS2741)

**Error at line 54:** The OpenAPI schema for `GET /photo/subtitle/data` requires a `token` field. Current query omits it.

**Current code** (lines 52-61):
```typescript
const { data, error } = await this.apiClient.GET('/photo/subtitle/data', {
  params: {
    query: {
      photo_id: Number(args.id),
      locale: flags['subtitle-id'],
      subtitle_format: flags.format,
      type: flags.type,
    },
  },
})
```

**Fix:** Add `fetchVideoToken()` call before the GET, then include `token` in query params.

**Pattern source:** `src/commands/video/section/list.ts` lines 39-43 — identical pattern with `fetchVideoToken`:
```typescript
// section/list.ts lines 39-43 (reference):
const token = await this.fetchVideoToken(args.id)

const { data, error } = await this.apiClient.GET('/photo/section/list', {
  params: { query: { photo_id: args.id, token } },
})
```

**Applied fix for `subtitle/data.ts`:**
```typescript
// Add before the GET call (after printWorkspaceHeader):
const token = await this.fetchVideoToken(args.id)

const { data, error } = await this.apiClient.GET('/photo/subtitle/data', {
  params: {
    query: {
      photo_id: Number(args.id),
      token,
      locale: flags['subtitle-id'],
      subtitle_format: flags.format,
      type: flags.type,
    },
  },
})
```

**Note:** `fetchVideoToken` is defined in `AuthenticatedCommand` (base-command.ts lines 182-196). `VideoSubtitleData extends AuthenticatedCommand` so `this.fetchVideoToken()` is available without any import changes.

---

### `src/commands/auth/credentials.ts` — `v` Possibly Undefined (D-15, TS18048)

**Error at line 30:** The `@clack/prompts` `text()` validate callback receives `string | symbol` in strict mode; TypeScript flags `v` as possibly `undefined`.

**Current code** (line 30-31):
```typescript
validate: (v) => (v.includes('.') ? undefined : 'Enter a valid domain'),
```

**Fix:** Add optional chaining:
```typescript
validate: (v) => (v?.includes('.') ? undefined : 'Enter a valid domain'),
```

No other changes to this file.

---

### `src/lib/base-command.ts` — Type Mismatch in `fetchVideoToken` (D-16, TS2322)

**Error at line 184:** The `photo_id` query param in `fetchVideoToken` passes `Number(videoId)`, but the generated type may expect `string` in this variant.

**Current code** (lines 183-185):
```typescript
const { data, error } = await this.apiClient.GET('/photo/list', {
  params: { query: { photo_id: Number(videoId), include_unpublished_p: 1 } },
})
```

**Fix:** Apply the same resolution as `video/get.ts` D-07 — consistent `include_unpublished_p` treatment. The `Number(videoId)` for `photo_id` follows the established pattern from `video/get.ts` line 45. If the error is specifically about `include_unpublished_p`, apply the same fix as D-07 (either `'1' as const` or `1 as any`).

**Implementor action:** Run `tsc --noEmit` with the error output to confirm which param triggers line 184. Fix `include_unpublished_p` consistently with whatever resolution is chosen for D-07 in `video/get.ts`.

---

### `src/auth/workspace-config.ts` — `conf` Module Resolution (D-17, TS2307) — Low Priority

**Error at line 1:** `Cannot find module 'conf' or its corresponding type declarations`.

**Root cause:** `conf@15` ships ESM-only type declarations that require `"moduleResolution": "bundler"` or `"node16"`. The current `tsconfig.base.json` uses `"moduleResolution": "node"`.

**Current `tsconfig.base.json`** (`/Users/steffenchristensen/23/twentythree-cli/tsconfig.base.json`):
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "skipLibCheck": true
  }
}
```

**Fix (per RESEARCH.md open question 1 recommendation):**
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "skipLibCheck": true
  }
}
```

**Impact:** Changing `"node"` to `"bundler"` aligns with tsdown/Rolldown's bundler-first module resolution and resolves the conf import. This change is in `tsconfig.base.json` at the repo root, not the package-level `tsconfig.json`.

**Caveat:** Claude's Discretion per D-17 — fix or skip based on whether zero-error `tsc --noEmit` is the hard gate.

---

## Shared Patterns

### Named Import Pattern for `lib/output.js`

**Source:** `src/commands/video/list.ts` lines 1-6
**Apply to:** All command files calling `formatApiError`, `parseBoolParam`, or any other output utility

Import relative depth rules:
- Commands in `src/commands/video/` → `../../lib/output.js`
- Commands in `src/commands/video/section/` or `src/commands/video/subtitle/` → `../../../lib/output.js`
- Commands in `src/commands/webinar/mail/` → `../../../lib/output.js`

Full exports available from `src/lib/output.ts`:
`EXIT_SUCCESS`, `EXIT_ERROR`, `EXIT_CANCELLED`, `formatJsonOutput`, `renderTable`, `formatBytes`, `formatApiError`, `parseBoolParam`, `resolveUrl`

### `Number(args.id)` for `photo_id` Params

**Source:** `src/commands/video/get.ts` line 45, `src/commands/video/section/list.ts` line 42 (after fix)
**Apply to:** Any command passing `args.id` to a query or body param typed as `number`

Pattern:
```typescript
params: { query: { photo_id: Number(args.id) } }
// or in body:
body: { photo_id: Number(args.id), ... } as any
```

Only safe when `args.id` is `required: true` in `static args`. For optional args, use `args.id ? Number(args.id) : undefined`.

### `as any` for openapi-fetch Spec Gaps

**Source:** `src/commands/video/frame.ts` line 48, `src/commands/video/section/delete.ts` line 70
**Apply to:** Paths or body types not in the generated OpenAPI union

Pattern:
```typescript
// Path escape:
await this.apiClient.POST('/photo/frame' as any, { body: { ... } as any })

// Body-only escape (path exists in spec):
await this.apiClient.POST('/photo/section/delete', { body: { ... } as any })
```

Anti-pattern: Do not use `as any` to suppress missing import errors (TS2304). Those must be fixed with proper imports.

### `fetchVideoToken` for Token-Required Endpoints

**Source:** `src/commands/video/section/list.ts` lines 39-43
**Apply to:** Any GET command whose OpenAPI query type requires a `token` field

Pattern:
```typescript
const token = await this.fetchVideoToken(args.id)
const { data, error } = await this.apiClient.GET('/photo/some/endpoint', {
  params: { query: { photo_id: Number(args.id), token, ...otherParams } },
})
```

`fetchVideoToken` is defined in `AuthenticatedCommand` (base-command.ts line 182). All commands extending `AuthenticatedCommand` get it for free.

---

## No Analog Found

None. All 15 fixes follow established patterns already present in the codebase. No new patterns are needed.

---

## Metadata

**Analog search scope:**
- `packages/twentythree-cli/src/commands/` — command implementations
- `packages/twentythree-cli/src/lib/` — base classes and utilities
- `packages/twentythree-cli/src/upload/` — upload engine
- `packages/twentythree-cli/src/auth/` — auth and config
- `/Users/steffenchristensen/23/twentythree-cli/tsconfig.base.json` — TypeScript config

**Files read:** 15 source files + tsconfig.base.json + tsconfig.json + output.ts header
**Pattern extraction date:** 2026-04-17
