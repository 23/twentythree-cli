---
phase: 04-category-webinar-core
plan: "01"
subsystem: category-commands
tags: [category, crud, oclif, album-api]
dependency_graph:
  requires:
    - Phase 03 video commands (pattern source)
    - src/lib/base-command.ts (AuthenticatedCommand)
    - src/lib/output.ts (formatJsonOutput, renderTable, parseBoolParam, formatApiError)
    - src/lib/pagination.ts (fetchAllPages)
    - src/lib/term-map.ts (applyCliTerms)
  provides:
    - category/index.ts (oclif topic registration)
    - category/list.ts (CAT-01)
    - category/create.ts (CAT-02)
    - category/update.ts (CAT-03)
    - category/delete.ts (CAT-04)
  affects:
    - oclif command discovery (new category/* topic)
tech_stack:
  added: []
  patterns:
    - fetchAllPages for auto-pagination (same as video/list.ts)
    - parseBoolParam for _p-suffixed boolean flag resolution
    - applyCliTerms on all user-visible output (album→category)
    - AuthenticatedCommand base class for auth guard
    - @clack/prompts confirm/text/select for interactive mode
key_files:
  created:
    - packages/twentythree-cli/src/commands/category/index.ts
    - packages/twentythree-cli/src/commands/category/list.ts
    - packages/twentythree-cli/src/commands/category/create.ts
    - packages/twentythree-cli/src/commands/category/update.ts
    - packages/twentythree-cli/src/commands/category/delete.ts
    - packages/twentythree-cli/src/commands/category/__tests__/list.test.ts
    - packages/twentythree-cli/src/commands/category/__tests__/create.test.ts
    - packages/twentythree-cli/src/commands/category/__tests__/update.test.ts
    - packages/twentythree-cli/src/commands/category/__tests__/delete.test.ts
  modified: []
decisions:
  - include_hidden_p typed as boolean in OpenAPI schema — passed as boolean (true/undefined) not 1/undefined unlike video commands that pass number to string-typed fields
metrics:
  duration: "~20min"
  completed: "2026-04-14T17:10:02Z"
  tasks_completed: 2
  files_created: 9
---

# Phase 4 Plan 01: Category Commands Summary

**One-liner:** Full CRUD category commands (list/create/update/delete) targeting /album/* API endpoints with auto-pagination, interactive mode, and domain-scoped delete confirmation.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Category topic index + list + create commands with tests | 3d7d3f1 | index.ts, list.ts, create.ts, __tests__/list.test.ts, __tests__/create.test.ts |
| 2 | Category update + delete commands with tests | 3cb7d14 | update.ts, delete.ts, __tests__/update.test.ts, __tests__/delete.test.ts |

## What Was Built

### category/index.ts
oclif topic index registration. Prints help redirect message. Follows video/index.ts pattern exactly.

### category/list.ts (CAT-01)
- GET /album/list with auto-pagination via fetchAllPages
- Flags: `--include-hidden` (boolean, allowNo), hidden `--include-hidden-p` (string)
- Table columns: ID, Title, Hidden, Created
- Row data: album_id, applyCliTerms(title), hide_p→yes/no, creation_date_ansi
- --json: `{ ok, data, summary, breadcrumbs }` with summary `N categor(y|ies)`
- Empty state: "No categories found."
- include_hidden_p passed as boolean (schema type is boolean, unlike video's string-typed fields)

### category/create.ts (CAT-02)
- POST /album/create with Content-Type application/x-www-form-urlencoded
- Required flag: `--title`; optional: `--description`, `--hidden`/`--no-hidden`, hidden `--hide-p`
- parseBoolParam resolves hidden flag to 0/1 for hide_p body field
- Success output: chalk.green("Category created") + "ID:    {album_id}"
- No admin URL for categories (per CONTEXT.md decision)
- --json: `{ ok, data, summary: "Category created", breadcrumbs with id }`

### category/update.ts (CAT-03)
- POST /album/update with Content-Type application/x-www-form-urlencoded
- T-04-01: validates album_id is numeric and > 0 before sending
- Flag mode: only explicitly provided flags included in body (prevents clearing unset fields)
- Interactive mode: fetches current via GET /album/list?album_id=N, pre-fills @clack/prompts
  - text prompts for title and description
  - select prompt for hidden (yes/no) with current value pre-selected
  - isCancel check on each prompt, process.exit(EXIT_CANCELLED) on cancel
- --json suppresses interactive mode
- Success: chalk.green(`Category ${id} updated`)

### category/delete.ts (CAT-04)
- POST /album/delete with Content-Type application/x-www-form-urlencoded
- T-04-02: confirm prompt includes workspace domain: "Delete category N from domain?"
- --json skips confirmation (scripting mode)
- isCancel or !confirmed → process.exit(EXIT_CANCELLED)
- Success: chalk.green(`Category ${id} deleted`)

## Verification

```
pnpm --filter twentythree-cli exec vitest run src/commands/category/__tests__/ --reporter=dot
```
Result: 4 test files discovered, 10 todos (all pass — stubs)

TypeScript: `tsc --noEmit` produces zero errors in category/* files.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed include_hidden_p type mismatch**
- **Found during:** Task 1, TypeScript check
- **Issue:** Plan specified passing `parseBoolParam(...) ? 1 : undefined` which produces `number | undefined`, but OpenAPI schema types include_hidden_p as `boolean`. This would cause a TypeScript error (different from video/list which has string-typed fields).
- **Fix:** Changed to `parseBoolParam(flags['include-hidden'], flags['include-hidden-p']) ?? undefined` — passes `boolean | undefined` matching the schema type
- **Files modified:** packages/twentythree-cli/src/commands/category/list.ts
- **Commit:** 3d7d3f1

## Known Stubs

None — all commands are fully implemented. Test files contain it.todo() stubs for future test implementation, which is expected for this plan.

## Threat Surface Scan

No new network endpoints beyond those in the plan's threat model. All four commands extend AuthenticatedCommand (T-04-04 mitigated). Category delete includes domain-scoped confirmation (T-04-02 mitigated). Category update validates numeric ID (T-04-01 mitigated).

## Self-Check: PASSED

All 5 command files exist. Both task commits verified in git log.
