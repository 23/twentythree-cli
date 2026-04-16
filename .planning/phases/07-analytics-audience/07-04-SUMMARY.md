---
phase: 07-analytics-audience
plan: "04"
subsystem: audience
tags: [audience, get, post, form-urlencoded, confirmation-prompt, 3-level-topic, AUD-01, AUD-02, AUD-03, AUD-04, AUD-05, AUD-06, AUD-07, AUD-08, AUD-09, AUD-10, AUD-11, AUD-12]
dependency_graph:
  requires: [07-02]
  provides: [audience-commands, audience-field-commands]
  affects: [audience-topic]
tech_stack:
  added: []
  patterns: [authenticated-command-pattern, paginated-table-output, single-object-key-value-render, post-form-urlencoded, destructive-confirm-prompt, 3-level-oclif-topic]
key_files:
  created:
    - packages/twentythree-cli/src/commands/audience/list.ts
    - packages/twentythree-cli/src/commands/audience/search.ts
    - packages/twentythree-cli/src/commands/audience/metrics.ts
    - packages/twentythree-cli/src/commands/audience/funnel.ts
    - packages/twentythree-cli/src/commands/audience/timelines.ts
    - packages/twentythree-cli/src/commands/audience/companies.ts
    - packages/twentythree-cli/src/commands/audience/identity-sources.ts
    - packages/twentythree-cli/src/commands/audience/list-collectors.ts
    - packages/twentythree-cli/src/commands/audience/register.ts
    - packages/twentythree-cli/src/commands/audience/unregister.ts
    - packages/twentythree-cli/src/commands/audience/remove.ts
    - packages/twentythree-cli/src/commands/audience/field/list.ts
    - packages/twentythree-cli/src/commands/audience/field/set.ts
    - packages/twentythree-cli/src/commands/audience/field/remove.ts
    - packages/twentythree-cli/src/commands/audience/field/types.ts
  modified: []
decisions:
  - "audience/search uses GET (not POST) per Pitfall 3 — required --text flag for query param"
  - "audience/field/list uses GET (not POST) per Pitfall 4 — D-5 documentation note claiming POST is an error; OpenAPI spec is authoritative"
  - "metrics and funnel use key-value rendering (not renderTable) for single-object responses per Pitfall 6"
  - "remove and field/remove have confirm() prompts before POST execution (T-07-08, T-07-09 mitigations)"
  - "JSON mode skips confirmation for remove and field/remove (automation use case)"
  - "identity-sources and list-collectors have no pagination flags (not in OpenAPI spec)"
  - "audience/field/ directory creates 3-level oclif topic automatically via filesystem discovery (same pattern as comment/reaction/)"
metrics:
  duration: "5 minutes"
  completed: "2026-04-16"
  tasks_completed: 3
  files_created: 15
---

# Phase 07 Plan 04: Audience Commands Summary

**One-liner:** All 15 audience management commands implemented — 11 top-level GET/POST commands plus 4 audience/field/ sub-commands as a 3-level oclif topic — completing the full audience surface for Phase 7.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Audience GET commands with special handling | bd23aac | list.ts, search.ts, metrics.ts, funnel.ts |
| 2 | Simple audience GET list commands | 7e9f6d1 | timelines.ts, companies.ts, identity-sources.ts, list-collectors.ts |
| 3 | POST mutations + all 4 field sub-commands | 2c13620 | register.ts, unregister.ts, remove.ts, field/list.ts, field/set.ts, field/remove.ts, field/types.ts |

## What Was Built

### Task 1: Audience GET Commands with Special Handling

4 GET commands with per-command specific behavior:

- **`audience/list.ts`** (AUD-01) — Paginated table with D-4 direct pagination flags (page/size/offset/orderby/order). Columns: UUID, Name, Email, Company, Score, Timelines.
- **`audience/search.ts`** (AUD-02) — GET endpoint (Pitfall 3 — NOT POST). Required `--text` flag. Columns: UUID, Name, Email, Company, Score, Last Seen.
- **`audience/metrics.ts`** (AUD-06) — GET, single-object response (Pitfall 6). Key-value rendering of profile_count, identified_count, timeline_count, timeline_engagement, event_count, score_avg.
- **`audience/funnel.ts`** (AUD-07) — GET, single-object response. Key-value rendering with `_fmt`-suffixed values preferred (visits, views, engagement, conversions, new_conversions).

### Task 2: Simple Audience GET List Commands

4 straightforward GET list commands:

- **`audience/timelines.ts`** (AUD-08) — Paginated. Columns: UUID, Object ID, Type, Engagement, Sessions, Source.
- **`audience/companies.ts`** (AUD-09) — Paginated. Columns: UUID, Name, Domain, Score, Profiles, Timelines.
- **`audience/identity-sources.ts`** (AUD-10) — Non-paginated (no p/size in spec). Columns: Source, Title, Service.
- **`audience/list-collectors.ts`** (AUD-11) — Non-paginated. Filters: object-id, action-id. Columns: Action ID, Name, Start, End, Require Email.

### Task 3: POST Mutations + Field Sub-Commands

3 audience POST mutations:

- **`audience/register.ts`** (AUD-03) — POST form. Required: `--email`. Optional: object-id, uuid, action-id, firstname, lastname, company, phone, return-url, source. Outputs UUID and tracking URL from response.
- **`audience/unregister.ts`** (AUD-04) — POST form. Required: `--object-id`. Optional: email, uuid.
- **`audience/remove.ts`** (AUD-05) — POST form, destructive. `confirm()` prompt before execution (T-07-08). JSON mode skips prompt. Optional: email, uuid.

4 audience/field/ sub-commands (3-level oclif topic via filesystem structure, per D-5):

- **`audience/field/list.ts`** (AUD-12) — GET endpoint (Pitfall 4 — D-5 note claiming POST is a documentation error). Flag: `--include-widget-html`. Columns: Key, Label, Type, Priority, Options.
- **`audience/field/set.ts`** (AUD-12) — POST form. Required: `--key`, `--type`, `--label`. Optional: options, priority.
- **`audience/field/remove.ts`** (AUD-12) — POST form, destructive. `confirm()` prompt before execution (T-07-09). Required: `--key`.
- **`audience/field/types.ts`** (AUD-12) — POST form, no required body. Table of valid field types: Type, Label.

## Verification

- 11 files exist in `src/commands/audience/`
- 4 files exist in `src/commands/audience/field/`
- `audience/search.ts` uses GET (Pitfall 3 verified)
- `audience/field/list.ts` uses GET (Pitfall 4 verified)
- All POST mutations use `'Content-Type': 'application/x-www-form-urlencoded'`
- Destructive commands (remove, field/remove) have `confirm()` prompts (T-07-08, T-07-09)
- All 15 commands have `enableJsonFlag = true`
- `tsc --noEmit`: 0 new errors from any of the 15 new files
- `pnpm --filter twentythree-cli test --run`: 146 passed | 69 todo — no regressions

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all 15 commands wire real API paths; no placeholder data.

## Threat Flags

None — all new endpoints were accounted for in the plan's `<threat_model>`. Confirmation prompts for T-07-08 (audience/remove) and T-07-09 (field/remove) implemented as specified.

## Self-Check: PASSED

Files verified to exist:
- packages/twentythree-cli/src/commands/audience/list.ts — FOUND
- packages/twentythree-cli/src/commands/audience/search.ts — FOUND
- packages/twentythree-cli/src/commands/audience/metrics.ts — FOUND
- packages/twentythree-cli/src/commands/audience/funnel.ts — FOUND
- packages/twentythree-cli/src/commands/audience/timelines.ts — FOUND
- packages/twentythree-cli/src/commands/audience/companies.ts — FOUND
- packages/twentythree-cli/src/commands/audience/identity-sources.ts — FOUND
- packages/twentythree-cli/src/commands/audience/list-collectors.ts — FOUND
- packages/twentythree-cli/src/commands/audience/register.ts — FOUND
- packages/twentythree-cli/src/commands/audience/unregister.ts — FOUND
- packages/twentythree-cli/src/commands/audience/remove.ts — FOUND
- packages/twentythree-cli/src/commands/audience/field/list.ts — FOUND
- packages/twentythree-cli/src/commands/audience/field/set.ts — FOUND
- packages/twentythree-cli/src/commands/audience/field/remove.ts — FOUND
- packages/twentythree-cli/src/commands/audience/field/types.ts — FOUND

Commits verified:
- bd23aac — feat(07-04): audience GET commands with special handling (list, search, metrics, funnel)
- 7e9f6d1 — feat(07-04): simple audience GET list commands (timelines, companies, identity-sources, list-collectors)
- 2c13620 — feat(07-04): audience POST mutations and all 4 field sub-commands (AUD-03 to AUD-12)
