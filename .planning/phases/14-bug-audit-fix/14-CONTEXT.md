# Phase 14: Bug Audit & Fix - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix all TypeScript errors across the codebase — starting with undefined-reference crashes (the specific `parseBoolParam is not defined` on `video list` and any similar `Cannot find name` errors across all 219 commands), then also fix the pre-existing type mismatches found by `tsc --noEmit`. End with a rebuilt npm publish so the installed CLI reflects all fixes.

</domain>

<decisions>
## Implementation Decisions

### Fix Scope
- **D-01:** Fix ALL TypeScript errors found by `tsc --noEmit` — not just the undefined-reference crashes. This includes type mismatches, missing properties, and `HeadersInit` issues in addition to the TS2304 `Cannot find name` errors.
- **D-02:** Undefined-reference errors are the priority (they cause runtime crashes). Type mismatches come second but are in scope for this phase.

### Known errors to address (from pre-discussion tsc sweep)
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

### Testing Strategy
- **D-18:** Verify with `pnpm test --run` (vitest) and `pnpm --filter twentythree-cli exec tsc --noEmit`. Both must pass clean (or with only the `conf` module resolution warning that's a tsconfig issue, not a bug).

### Publish
- **D-19:** Phase ends with `pnpm build` + `npm publish` to push fixed code to npm. This is what heals the globally installed CLI for end users.

### Claude's Discretion
- Order of fixes within the phase (undefined-refs first, then type mismatches is sensible)
- Whether to fix the `conf` moduleResolution warning (tsconfig change) or leave it — it's a build tooling concern, not a runtime bug
- Patch version bump for the publish (e.g., 1.0.1 or 1.0.2 depending on what's current)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements
- `.planning/REQUIREMENTS.md` — BUG-01, BUG-02 requirements for this phase

### Codebase
- `packages/twentythree-cli/src/lib/output.ts` — source of truth for all shared utility functions (`parseBoolParam`, `formatApiError`, etc.); verify exports before adding imports
- `packages/twentythree-cli/src/lib/base-command.ts` — base class with one pre-existing type error

### Build & publish
- `packages/twentythree-cli/package.json` — current version number; bump patch before publish
- CLAUDE.md §API Change Workflow — pattern for build verification (`pnpm --filter twentythree-cli exec tsc --noEmit` + `pnpm --filter twentythree-cli test --run`)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/twentythree-cli/src/lib/output.ts` — exports: `EXIT_SUCCESS`, `EXIT_ERROR`, `EXIT_CANCELLED`, `formatJsonOutput`, `renderTable`, `formatBytes`, `formatApiError`, `parseBoolParam`, `resolveUrl`. All TS2304 fixes will be adding missing imports from this file.

### Established Patterns
- All command files import utilities via named imports from `../../lib/output.js` (relative path with `.js` extension for CJS/ESM interop)
- tsdown bundles to `dist/` as CJS; built files are in `packages/twentythree-cli/dist/`

### Integration Points
- The globally installed CLI (`~/.nvm/versions/node/v22.22.2/lib/node_modules/twentythree-cli/`) is a stale build — fixing source alone doesn't fix end users; rebuild + publish required

</code_context>

<specifics>
## Specific Ideas

- The `parseBoolParam is not defined` error is confirmed to be a stale build issue, not a source-code bug. The function is correctly defined and exported in source. However, the undefined-ref TS2304 errors in `video/section/delete.ts`, `video/subtitle/delete.ts`, and `video/update.ts` ARE real source bugs where `formatApiError` is called without an import — those will cause the same ReferenceError at runtime.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 14-bug-audit-fix*
*Context gathered: 2026-04-17*
