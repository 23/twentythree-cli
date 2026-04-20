---
phase: 17-tech-debt-cleanup
plan: "01"
subsystem: infra
tags: [typescript, tsconfig, types, autocomplete, oclif, base-command, traceability]
gap_closure: true
closes_audit_items: ["phase-14-item-1", "phase-15-item-1", "phase-15-item-2"]
requirements_completed: []

dependency_graph:
  requires:
    - phase: 16-interactive-prompts
      provides: BaseCommand with interactive catch() override
    - phase: 15-tab-completion
      provides: autocomplete command, 15-02-SUMMARY.md
  provides:
    - tsc-clean build (zero TypeScript errors)
    - autocomplete command inheriting BaseCommand.catch() for interactive prompts
    - requirements_completed traceability in 15-02-SUMMARY.md
  affects: [packages/twentythree-cli/src/upload/chunked-upload.ts, CI type-checking]

tech-stack:
  added: ["@types/node@^22.0.0 (devDependency)"]
  patterns:
    - "tsconfig.base.json lib:[ES2022,DOM] + types:[node] as the canonical Node CLI type setup"
    - "BaseCommand subclass with empty init() override for commands that must run without workspace auth"

key-files:
  created: []
  modified:
    - tsconfig.base.json
    - packages/twentythree-cli/package.json
    - pnpm-lock.yaml
    - packages/twentythree-cli/src/commands/autocomplete/index.ts
    - packages/twentythree-cli/src/upload/chunked-upload.ts
    - .planning/phases/15-tab-completion/15-02-SUMMARY.md

key-decisions:
  - "Add DOM lib alongside node types — fetch/FormData/Blob/AbortSignal are used in upload code and need DOM lib, not just @types/node"
  - "Override init() empty in Autocomplete rather than skipping BaseCommand — preserves catch() inheritance while bypassing workspace resolution"
  - "Fix Buffer→ArrayBuffer cast in chunked-upload.ts — Buffer.buffer is ArrayBufferLike (includes SharedArrayBuffer), not assignable to BlobPart under DOM types"

patterns-established:
  - "Commands that run without workspace: extend BaseCommand, override init() as empty no-op to bypass workspace resolution while still inheriting catch()"

metrics:
  duration_seconds: 133
  completed_date: "2026-04-20"
  tasks_completed: 4
  tasks_total: 4
  files_created: 0
  files_modified: 6
---

# Phase 17 Plan 01: v1.2 Tech Debt Cleanup Summary

**TypeScript build cleaned to zero errors via @types/node + DOM lib, autocomplete wired into BaseCommand inheritance chain, and Phase 15 SUMMARY traceability completed**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-20T07:34:00Z
- **Completed:** 2026-04-20T07:36:08Z
- **Tasks:** 4 of 4
- **Files modified:** 6

## Accomplishments

- `pnpm --filter twentythree-cli exec tsc --noEmit` now exits 0 with zero errors — pre-existing node/DOM lib errors (`Cannot find name 'process'`, `Cannot find name 'fetch'`, `Cannot find name 'FormData'`, `Cannot find module 'node:*'`) fully resolved
- `autocomplete/index.ts` now extends `BaseCommand<typeof Autocomplete>` with an empty `init()` override, inheriting `BaseCommand.catch()` for interactive missing-flag prompting (PROMPT-01) while preserving workspace-less startup
- `15-02-SUMMARY.md` frontmatter now carries `requirements_completed: [COMPLETE-01, COMPLETE-02, COMPLETE-03]`, completing REQUIREMENTS.md → SUMMARY.md traceability chain for Phase 15
- All 163 tests pass (0 failures); test count grew from 158 baseline to 163 from later phases — no regressions

## Task Commits

1. **Task 1: Add @types/node and wire DOM lib into tsconfig.base.json** - `849e727` (chore)
2. **Task 2: Make autocomplete command extend BaseCommand** - `b5d6127` (feat)
3. **Task 3: Add requirements_completed to 15-02-SUMMARY.md frontmatter** - `ebf2ebf` (docs)
4. **Task 4: Verify tsc-clean and no vitest regressions** — verification only (no separate commit; Rule 1 fix committed as `e401053`)

**Rule 1 auto-fix (exposed during Task 4 verification):** `e401053` (fix)

## Files Created/Modified

- `tsconfig.base.json` — Added `"lib": ["ES2022", "DOM"]` and `"types": ["node"]` to compilerOptions
- `packages/twentythree-cli/package.json` — Added `"@types/node": "^22.0.0"` to devDependencies
- `pnpm-lock.yaml` — Regenerated with @types/node@22.19.17 added to twentythree-cli package
- `packages/twentythree-cli/src/commands/autocomplete/index.ts` — Replaced `Command` import with `BaseCommand`, added `init()` override
- `packages/twentythree-cli/src/upload/chunked-upload.ts` — Fixed `Buffer` → `ArrayBuffer` cast for `Blob` constructor (Rule 1 auto-fix)
- `.planning/phases/15-tab-completion/15-02-SUMMARY.md` — Added `requirements_completed` field to frontmatter

## Decisions Made

- **Add both DOM lib and node types:** DOM lib is needed for `fetch`/`FormData`/`Blob`/`AbortSignal` used in upload code. `@types/node` alone does not provide these. Together they cover the full runtime surface of Node 22 + built-in fetch.
- **Override init() as empty no-op rather than skipping BaseCommand:** Preserves `catch()` inheritance (the whole point of this audit item) while avoiding the `this.error('No workspace configured')` call that would break autocomplete before auth setup.
- **Fix Buffer → ArrayBuffer cast in chunked-upload.ts:** `Buffer.buffer` is typed `ArrayBufferLike` (union of `ArrayBuffer | SharedArrayBuffer`). DOM's `BlobPart` requires strict `ArrayBuffer`. Using `.buffer.slice(byteOffset, byteOffset + byteLength)` produces a precise `ArrayBuffer` copy — correct semantics, not just a type assertion.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Buffer.buffer type incompatibility in chunked-upload.ts**
- **Found during:** Task 4 (tsc verification — first tsc run returned 1 error)
- **Issue:** `new Blob([sliceBuffer])` — `sliceBuffer` is `Buffer`, whose `.buffer` is typed `ArrayBufferLike` (includes `SharedArrayBuffer`). DOM lib's `BlobPart` requires `ArrayBufferView<ArrayBuffer>`. TypeScript error TS2322 on line 109.
- **Fix:** Extracted a proper `ArrayBuffer` via `sliceBuffer.buffer.slice(byteOffset, byteOffset + byteLength)` and passed that to `Blob`. This is semantically correct — Node Buffers wrap a real ArrayBuffer at runtime, but the types need precision.
- **Files modified:** `packages/twentythree-cli/src/upload/chunked-upload.ts`
- **Verification:** `tsc --noEmit` exits 0; all 163 tests pass
- **Committed in:** `e401053`

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug exposed by new DOM lib types)
**Impact on plan:** Necessary for correctness — the type was imprecise and the DOM lib exposed it. The runtime behavior is unchanged (Node Buffers always wrap a real ArrayBuffer). No scope creep.

## Verification Results

```
pnpm --filter twentythree-cli exec tsc --noEmit
→ exit code 0, no output (zero errors)

pnpm --filter twentythree-cli exec tsc --noEmit 2>&1 | grep -c "autocomplete/index.ts"
→ 0

pnpm --filter twentythree-cli test --run
→ Test Files  17 passed | 24 skipped (41)
→ Tests  163 passed | 69 todo (232)
→ Duration  623ms
```

## Issues Encountered

None beyond the Rule 1 auto-fix described above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

v1.2 tech debt fully closed:
- [x] Phase 14 item #1: tsc-clean claim overstated — now genuinely zero errors
- [x] Phase 15 item #1: SUMMARY frontmatter missing requirements_completed — added
- [x] Phase 15 item #2: autocomplete extends bare Command — now extends BaseCommand

Remaining (out of scope, acknowledged):
- v1.2 audit tech_debt Phase 14 item #2 (BUG-01 E2E runtime confirmation) — human-deferred; npm@1.0.1 live is accepted evidence
- Nyquist validation sign-off for phases 14/15/16 — separate `/gsd-validate-phase` workflow

---
*Phase: 17-tech-debt-cleanup*
*Completed: 2026-04-20*

## Self-Check: PASSED

- `tsconfig.base.json`: FOUND
- `packages/twentythree-cli/package.json`: FOUND
- `packages/twentythree-cli/src/commands/autocomplete/index.ts`: FOUND
- `packages/twentythree-cli/src/upload/chunked-upload.ts`: FOUND
- `.planning/phases/15-tab-completion/15-02-SUMMARY.md`: FOUND
- Commit `849e727` (Task 1 — tsconfig + @types/node): FOUND
- Commit `b5d6127` (Task 2 — autocomplete BaseCommand): FOUND
- Commit `ebf2ebf` (Task 3 — 15-02-SUMMARY requirements_completed): FOUND
- Commit `e401053` (Rule 1 fix — chunked-upload ArrayBuffer): FOUND
