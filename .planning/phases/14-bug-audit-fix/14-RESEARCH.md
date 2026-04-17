# Phase 14: Bug Audit & Fix - Research

**Researched:** 2026-04-17
**Domain:** TypeScript error remediation — missing imports, type mismatches, stale npm build
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Fix ALL TypeScript errors found by `tsc --noEmit` — not just the undefined-reference crashes. This includes type mismatches, missing properties, and `HeadersInit` issues in addition to the TS2304 `Cannot find name` errors.
- **D-02:** Undefined-reference errors are the priority (they cause runtime crashes). Type mismatches come second but are in scope for this phase.
- **D-03:** `video/section/delete.ts` — uses `formatApiError` without importing it (TS2304)
- **D-04:** `video/subtitle/delete.ts` — uses `formatApiError` without importing it (TS2304)
- **D-05:** `video/update.ts` — uses `formatApiError` without importing it (TS2304)
- **D-06:** `video/section/list.ts` — type mismatch: `string` not assignable to `number`
- **D-07:** `video/get.ts` — type mismatch: `number` not assignable to `string`
- **D-08:** `video/list.ts` — type mismatch: `number | undefined` not assignable to `string | undefined`
- **D-09:** `video/replace.ts` — type mismatch: `string` not assignable to `number`
- **D-10:** `video/frame.ts` — path type error (`/photo/frame` not assignable to PathsWithMethod)
- **D-11:** `video/subtitle/data.ts` — missing required `token` property in type
- **D-12:** `video/transcoding-progress.ts` — type mismatch: `string` not assignable to `number`
- **D-13:** `webinar/mail/preview.ts` — `HeadersInit` not found (TS2304)
- **D-14:** `upload/chunked-upload.ts` — `HeadersInit` not found (TS2304)
- **D-15:** `auth/credentials.ts` — `v` possibly `undefined` (TS18048)
- **D-16:** `lib/base-command.ts` — type mismatch: `number` not assignable to `string`
- **D-17:** `auth/workspace-config.ts` — `conf` module resolution issue (pre-existing, low priority)
- **D-18:** Verify with `pnpm test --run` (vitest) and `pnpm --filter twentythree-cli exec tsc --noEmit`. Both must pass clean.
- **D-19:** Phase ends with `pnpm build` + `npm publish` to push fixed code to npm.

### Claude's Discretion

- Order of fixes within the phase (undefined-refs first, then type mismatches is sensible)
- Whether to fix the `conf` moduleResolution warning (tsconfig change) or leave it
- Patch version bump for the publish (e.g., 1.0.1 or 1.0.2 depending on what's current)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BUG-01 | `parseBoolParam is not defined` error on `twentythree video list` is fixed | Root cause identified: stale npm build. `parseBoolParam` is correctly exported in `src/lib/output.ts`. Fix is rebuild + republish. The `video/list.ts` source already imports it correctly. |
| BUG-02 | All commands using the same undefined-reference pattern are audited and fixed before release | `tsc --noEmit` sweep confirmed: 3 files call `formatApiError` without importing it (TS2304). These are `video/section/delete.ts`, `video/subtitle/delete.ts`, `video/update.ts`. Additional TS2304s: `HeadersInit` used without import in 2 files. |
</phase_requirements>

---

## Summary

This is a code-correctness repair phase, not a feature phase. The work is entirely within the existing codebase — no new libraries, no architecture changes.

The `parseBoolParam is not defined` runtime crash on `video list` is a **stale build artifact**, not a source code bug. The `video/list.ts` source already imports `parseBoolParam` correctly from `../../lib/output.js`. The globally installed CLI (`~/.nvm/versions/node/v22.22.2/lib/node_modules/twentythree-cli/`) is out of date and does not reflect the current source. Fix is: rebuild and republish.

However, a `tsc --noEmit` sweep reveals **15 genuine TypeScript errors** across the codebase. Three of these are TS2304 `Cannot find name` errors that will cause identical `ReferenceError` crashes at runtime: `formatApiError` is called in `video/section/delete.ts`, `video/subtitle/delete.ts`, and `video/update.ts` without being imported. Two more TS2304 errors affect `HeadersInit` in `webinar/mail/preview.ts` and `upload/chunked-upload.ts`. The remaining errors are type mismatches (`string`/`number` coercions) and one missing required property.

The fix strategy is: (1) add missing imports for the TS2304 errors, (2) fix type coercions with explicit `Number()` or `String()` wrapping, (3) add the missing `token` property to the subtitle/data query, (4) rebuild, and (5) publish patch version to npm.

**Primary recommendation:** Fix all errors in a single wave (grouped by error type), verify both `tsc --noEmit` and `vitest` pass clean, then rebuild and publish.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| TypeScript error fixes | Source (CLI commands + lib) | — | All errors are in `.ts` source files; fixes are import additions and type coercions |
| Runtime crash fix (BUG-01) | Build + publish pipeline | — | The crash is caused by a stale dist; fixing source alone is insufficient |
| Test validation | Vitest test suite | `tsc --noEmit` | Tests verify runtime behavior; tsc verifies types; both required per D-18 |

---

## Standard Stack

No new libraries needed. This phase uses only the existing stack.

### Relevant Existing Libraries
| Library | Version | Purpose | Relevance to Phase |
|---------|---------|---------|-------------------|
| `typescript` | 5.x | Type checker | `tsc --noEmit` is the authoritative error source |
| `vitest` | 4.1.4 | Test runner | Phase gate validation |
| `tsdown` | 0.21.8 | Build tool | `pnpm build` to regenerate dist |

---

## Architecture Patterns

### System Architecture Diagram

```
tsc --noEmit
    │
    ├── TS2304: Cannot find name
    │     ├── formatApiError (3 files) → add import from ../../lib/output.js
    │     └── HeadersInit (2 files)    → add import: { type HeadersInit } from node fetch types
    │
    ├── TS2322: Type mismatch
    │     ├── string → number: wrap with Number()
    │     ├── number → string: wrap with String()
    │     └── number | undefined → string | undefined: wrap with Number()
    │
    ├── TS2345: Path not in PathsWithMethod
    │     └── video/frame.ts: cast with `as any` on POST path
    │
    └── TS2741: Missing required property
          └── video/subtitle/data.ts: add token via fetchVideoToken()

After all fixes:
  tsc --noEmit → 0 errors (except D-17 conf moduleResolution — Claude's discretion)
  vitest run   → 151 passing, 0 failures

Then:
  pnpm build → dist/ regenerated
  npm publish → patched version live on npm registry
```

### Recommended Project Structure

No structural changes. All fixes are within existing files.

### Pattern 1: Adding Missing Named Import

**What:** Three command files call `formatApiError(error)` but the import line omits it.
**When to use:** Whenever `tsc --noEmit` reports TS2304 for a name that exists in `src/lib/output.ts`.
**Fix pattern:**

```typescript
// BEFORE (video/section/delete.ts line 5):
import { formatJsonOutput, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'

// AFTER:
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../../lib/output.js'
```

The same fix applies identically to `video/subtitle/delete.ts` and `video/update.ts`.
[VERIFIED: codebase grep — `formatApiError` is exported from `src/lib/output.ts` line 110]

### Pattern 2: Fixing HeadersInit TS2304

**What:** `HeadersInit` is a global type in DOM lib (`lib.dom.d.ts`), but this project targets `"lib": ["ES2022"]` with no DOM lib. Node 22's `fetch` uses `RequestInit` from `@types/node`.
**Fix:** Replace bare `HeadersInit` with `Record<string, string>` — which is always compatible with both DOM `HeadersInit` and Node fetch header shapes.

```typescript
// BEFORE (webinar/mail/preview.ts line 72, upload/chunked-upload.ts line 125):
const headers: HeadersInit = {}

// AFTER:
const headers: Record<string, string> = {}
```

[VERIFIED: codebase — `tsconfig.base.json` has `"lib": ["ES2022"]` with no `"dom"` entry; `HeadersInit` is DOM-only]
[VERIFIED: codebase — both files assign string values to header keys only; `Record<string, string>` is a valid subtype of `RequestInit['headers']`]

### Pattern 3: Fixing photo_id Type Mismatches

**What:** Several commands pass `args.id` (a `string`) where the OpenAPI schema expects `number`, or vice versa.
**Fix pattern:**

```typescript
// TS2322: string not assignable to number
// BEFORE (video/section/list.ts line 42):
params: { query: { photo_id: args.id, token } }

// AFTER:
params: { query: { photo_id: Number(args.id), token } }
```

```typescript
// TS2322: number not assignable to string (video/get.ts line 45)
// include_unpublished_p is typed as 0 | 1 | undefined in the OpenAPI spec
// but the schema expects string in one variant — cast explicitly
params: { query: { photo_id: Number(args.id), include_unpublished_p: 1 as const } }
```

[VERIFIED: codebase — existing working commands (e.g. `video/list.ts`) use `Number(args.id)` for photo_id]

### Pattern 4: Fixing video/list.ts include_unpublished_p (D-08)

**What:** `parseBoolParam(...)` returns `boolean | undefined`; the OpenAPI query type for `include_unpublished_p` is `0 | 1 | undefined` or a string variant. The existing code does `parseBoolParam(...) ? 1 : undefined` which returns `number | undefined`, but the schema expects `string | undefined`.
**Fix:**

```typescript
// BEFORE:
include_unpublished_p: parseBoolParam(flags['include-unpublished'], flags['include-unpublished-p']) ? 1 : undefined,

// AFTER (cast to satisfy openapi-fetch param type):
include_unpublished_p: parseBoolParam(flags['include-unpublished'], flags['include-unpublished-p']) ? 1 : undefined as any,
// OR use explicit string cast if the schema literal is string:
include_unpublished_p: parseBoolParam(flags['include-unpublished'], flags['include-unpublished-p']) ? '1' : undefined,
```

The exact fix depends on what the generated `types.ts` declares for this parameter. The planner should check the generated type at implementation time.

### Pattern 5: Fixing video/subtitle/data.ts Missing token (D-11)

**What:** The OpenAPI schema for `/photo/subtitle/data` requires a `token` field. The command passes `photo_id`, `locale`, `subtitle_format`, and `type` but not `token`.
**Fix:** Use the already-available `fetchVideoToken()` helper from `AuthenticatedCommand`:

```typescript
// Add before the GET call:
const token = await this.fetchVideoToken(args.id)

// Then add to query params:
params: {
  query: {
    photo_id: Number(args.id),
    token,
    locale: flags['subtitle-id'],
    subtitle_format: flags.format,
    type: flags.type,
  },
},
```

[VERIFIED: codebase — `fetchVideoToken` is defined in `AuthenticatedCommand` (base-command.ts line 182); `VideoSubtitleData` extends `AuthenticatedCommand` so `this.fetchVideoToken()` is available]

### Pattern 6: Fixing video/frame.ts Path Error (D-10)

**What:** `'/photo/frame'` is not in the generated `PathsWithMethod<paths, "post">` union. This means the OpenAPI spec does not define a `POST /photo/frame` endpoint.
**Fix:** Cast the path argument to bypass the strict path check:

```typescript
const { data, error } = await this.apiClient.POST('/photo/frame' as any, {
```

This is the established pattern in the codebase for paths the spec under-specifies (same approach used with `as any` on body types).

[VERIFIED: codebase — multiple existing commands use `as any` to escape spec gaps; `video/replace.ts` and others follow this pattern]

### Pattern 7: Fixing video/replace.ts Type Mismatch (D-09)

**What:** `photo_id: args.id` passes a `string` where a `number` is expected.
**Fix:**
```typescript
params: { query: { photo_id: Number(args.id) } }
```

### Pattern 8: Fixing auth/credentials.ts TS18048 (D-15)

**What:** `v` is `possibly 'undefined'` at line 30. `@clack/prompts` `text()` validate callback receives `string | symbol` and TypeScript strict mode flags the narrowing.
**Fix:** Add a null guard in the validate callback or use non-null assertion:

```typescript
validate: (v) => (!v || v.includes('.') ? undefined : 'Enter a valid domain'),
```

Or use optional chaining:
```typescript
validate: (v) => (v?.includes('.') ? undefined : 'Enter a valid domain'),
```

[VERIFIED: codebase — credentials.ts line 30-31 shows the exact code; `v` is the text input string]

### Pattern 9: Fixing lib/base-command.ts Type Mismatch (D-16)

**What:** Line 184, `fetchVideoToken(videoId)` — the `fetchVideoToken` method signature accepts `string | number` but the Breadcrumb `id` type expects `string`. The mismatch is likely in `String(videoId)` conversion.
**Fix:** Add explicit `String()` cast at the call site or in the method return assignment.

[VERIFIED: codebase — `base-command.ts` line 182 defines `fetchVideoToken(videoId: string | number)`. Error is at line 184 in the params object.]

### Anti-Patterns to Avoid

- **Suppressing errors with `@ts-ignore`:** Only use when the type system genuinely cannot express the correct constraint (e.g., the openapi-fetch path union). For real bugs like missing imports, fix properly.
- **Wrapping everything in `as any`:** Reserve for openapi-fetch path/body type escape hatches. The missing import bugs must be fixed as real imports.
- **Fixing only the runtime-crash errors and skipping the rest:** D-01 is locked — all errors are in scope.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Video token lookup | Inline API call | `this.fetchVideoToken(args.id)` | Already in `AuthenticatedCommand` base class |
| API error formatting | Custom error string | `formatApiError(error)` from `lib/output.js` | Already exists; the bug is missing the import |

---

## Common Pitfalls

### Pitfall 1: Confusing Stale Build Crash with Source Bug

**What goes wrong:** Treating `parseBoolParam is not defined` as a missing import in `video/list.ts` when the source code is correct.
**Why it happens:** Runtime `ReferenceError` looks like a missing function definition; the real cause is the dist/ directory doesn't match source.
**How to avoid:** Confirm `video/list.ts` already imports `parseBoolParam` before touching that file. The fix is rebuild + publish only.
**Warning signs:** If you see `parseBoolParam` in the import line of `video/list.ts`, the source is already correct.

[VERIFIED: codebase — `video/list.ts` line 5 already imports `parseBoolParam` from `../../lib/output.js`]

### Pitfall 2: Fixing Type Errors in a Way That Silently Breaks Tests

**What goes wrong:** A `Number()` cast or `as any` changes runtime behavior and a test starts failing.
**Why it happens:** `Number(undefined)` returns `NaN`, `Number('')` returns `0`, not `undefined`.
**How to avoid:** When casting optional params, use `args.id ? Number(args.id) : undefined` or verify the arg is `required: true` before casting unconditionally.
**Warning signs:** Tests that check zero-ID or missing-ID behavior fail after fix.

### Pitfall 3: Not Running tsc After Each Batch of Fixes

**What goes wrong:** A fix introduces a new error (e.g., adding a parameter to a query object that TypeScript now validates differently).
**How to avoid:** Run `pnpm --filter twentythree-cli exec tsc --noEmit` after each file or batch. The final gate requires zero errors (minus the D-17 conf warning).

### Pitfall 4: Publishing Without Rebuilding

**What goes wrong:** `npm publish` pushes the old `dist/` that still has the stale build. BUG-01 remains live for end users.
**How to avoid:** Always run `pnpm build` first. `package.json` has `"prepack": "pnpm build"` which runs automatically on `npm publish` — but verify it actually ran by checking the dist/ modification timestamps.

### Pitfall 5: conf moduleResolution Warning (D-17)

**What goes wrong:** Treating `src/auth/workspace-config.ts(1,18): error TS2307: Cannot find module 'conf'` as a blocking error.
**Why it happens:** `tsconfig.base.json` uses `"moduleResolution": "node"` but `conf@15` ships with ESM-only type declarations that require `"moduleResolution": "bundler"` or `"node16"`.
**How to avoid:** Per D-17, this is a pre-existing low-priority tsconfig issue. `skipLibCheck: true` suppresses it in practice. Leave as-is unless Claude's Discretion is exercised to fix it.
**Note:** `tsc --noEmit` currently reports this as a hard error (exit code 2). If the phase goal is "zero errors", either fix the tsconfig or confirm this single warning is the acceptable residual.

---

## Complete Error Inventory

[VERIFIED: `pnpm --filter twentythree-cli exec tsc --noEmit` run 2026-04-17]

| # | File | Line | Error | Fix Type |
|---|------|------|-------|---------|
| 1 | `src/auth/workspace-config.ts` | 1 | TS2307: Cannot find module 'conf' | tsconfig moduleResolution (D-17, low priority) |
| 2 | `src/commands/auth/credentials.ts` | 30 | TS18048: 'v' is possibly 'undefined' | Null guard in validate callback |
| 3 | `src/commands/video/frame.ts` | 48 | TS2345: '/photo/frame' not in PathsWithMethod | Cast path with `as any` |
| 4 | `src/commands/video/get.ts` | 45 | TS2322: number not assignable to string | Explicit cast — check generated type |
| 5 | `src/commands/video/list.ts` | 57 | TS2322: number\|undefined not assignable to string\|undefined | Cast param value |
| 6 | `src/commands/video/replace.ts` | 95 | TS2322: string not assignable to number | `Number(args.id)` |
| 7 | `src/commands/video/section/delete.ts` | 75 | TS2304: Cannot find name 'formatApiError' | Add import |
| 8 | `src/commands/video/section/list.ts` | 42 | TS2322: string not assignable to number | `Number(args.id)` |
| 9 | `src/commands/video/subtitle/data.ts` | 54 | TS2741: Property 'token' is missing | Fetch token via fetchVideoToken() |
| 10 | `src/commands/video/subtitle/delete.ts` | 82 | TS2304: Cannot find name 'formatApiError' | Add import |
| 11 | `src/commands/video/transcoding-progress.ts` | 44 | TS2322: string not assignable to number | `Number(args.id)` |
| 12 | `src/commands/video/update.ts` | 121 | TS2304: Cannot find name 'formatApiError' | Add import |
| 13 | `src/commands/webinar/mail/preview.ts` | 72 | TS2304: Cannot find name 'HeadersInit' | Replace with `Record<string, string>` |
| 14 | `src/lib/base-command.ts` | 184 | TS2322: number not assignable to string | Explicit String() cast |
| 15 | `src/upload/chunked-upload.ts` | 125 | TS2304: Cannot find name 'HeadersInit' | Replace with `Record<string, string>` |

**Error categories:**
- TS2304 (undefined reference / missing import): errors 7, 10, 12, 13, 15 — **runtime crash risk**
- TS2322 (type mismatch): errors 4, 5, 6, 8, 11, 14 — compile-time only
- TS2345 (argument type): error 3 — compile-time only
- TS2741 (missing property): error 9 — runtime risk (missing required API param)
- TS18048 (undefined check): error 2 — compile-time only
- TS2307 (module resolution): error 1 — pre-existing tsconfig issue (D-17)

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build + tests | Yes | v22.22.2 | — |
| pnpm | Build + test commands | Yes | installed in repo | — |
| npm | Publish step (D-19) | Yes | bundled with Node | — |
| TypeScript compiler | `tsc --noEmit` | Yes | 5.x (in devDeps) | — |
| vitest | Test suite | Yes | 4.1.4 | — |

No missing dependencies — this phase is pure source editing.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.1.4 |
| Config file | `packages/twentythree-cli/vitest.config.*` (or package.json scripts) |
| Quick run command | `pnpm --filter twentythree-cli test --run` |
| Full suite command | `pnpm --filter twentythree-cli test --run` |

**Current test state:** 16 passed, 24 skipped (intentional), 151 tests passing, 69 todo.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUG-01 | `video list` no longer throws ReferenceError | Integration (post-build) | `twentythree video list` (manual smoke) | Manual — vitest mocks the API |
| BUG-02 | All undefined-reference errors fixed | Type check | `pnpm --filter twentythree-cli exec tsc --noEmit` | Yes — tsc is the gate |

### Sampling Rate

- **Per fix batch:** `pnpm --filter twentythree-cli exec tsc --noEmit`
- **Phase gate:** `pnpm --filter twentythree-cli exec tsc --noEmit` (zero errors) + `pnpm --filter twentythree-cli test --run` (all existing tests still pass)

### Wave 0 Gaps

None — existing test infrastructure covers phase validation. The tsc command is the primary BUG-02 gate.

---

## Security Domain

No security-relevant changes. This phase makes no changes to authentication, authorization, input validation, or cryptography. All fixes are type corrections and missing import additions.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `HeadersInit` replacement with `Record<string, string>` is compatible with Node 22 native fetch's `RequestInit['headers']` type | Pattern 2 | Compilation error after fix — trivial to adjust |
| A2 | The `conf` moduleResolution error (D-17) does not actually block the build (tsdown/Rolldown resolves it differently than tsc) | Pitfall 5 | Build would fail; fix tsconfig if so |
| A3 | `video/frame.ts` TS2345 can be suppressed with `as any` path cast (spec gap, not a missing endpoint) | Pattern 6 | If endpoint truly doesn't exist, command fails at runtime — need spec verification |

---

## Open Questions

1. **D-17: conf moduleResolution — blocking or not?**
   - What we know: `tsc --noEmit` exits with code 2 (error) on this warning. The build (`tsdown`) succeeds regardless because `skipLibCheck: true` applies at build time.
   - What's unclear: The phase success criteria say "zero errors from `tsc --noEmit`". If that's strict, D-17 must be fixed.
   - Recommendation: Fix it. Change `"moduleResolution": "node"` to `"moduleResolution": "bundler"` in `tsconfig.base.json`. This resolves the conf import and is aligned with the tsdown/Rolldown bundler-first approach.

2. **video/list.ts include_unpublished_p exact type**
   - What we know: Error is `number | undefined not assignable to string | undefined`.
   - What's unclear: Whether the generated `types.ts` expects the param as a `string` or a numeric literal.
   - Recommendation: Check `src/api/types.ts` for the `/photo/list` query parameter definition before writing the fix.

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: codebase] — `pnpm --filter twentythree-cli exec tsc --noEmit` run live, all 15 errors confirmed
- [VERIFIED: codebase] — `src/lib/output.ts` exports enumerated; `parseBoolParam` and `formatApiError` both confirmed present
- [VERIFIED: codebase] — `video/list.ts` already imports `parseBoolParam` — BUG-01 is a stale build, not a source bug
- [VERIFIED: codebase] — `tsconfig.base.json` uses `"lib": ["ES2022"]` with no DOM lib — explains HeadersInit TS2304
- [VERIFIED: codebase] — `vitest run` passes 151 tests with 0 failures as of 2026-04-17

### Secondary (MEDIUM confidence)
- [ASSUMED] — `Record<string, string>` is compatible with Node 22 native fetch header type

---

## Metadata

**Confidence breakdown:**
- Error inventory: HIGH — confirmed by live tsc run
- Fix patterns: HIGH — all derived from existing working code in the same codebase
- Publish flow: HIGH — D-19 locked decision; `prepack` script exists in package.json

**Research date:** 2026-04-17
**Valid until:** N/A — this is a deterministic fix phase; research does not expire
