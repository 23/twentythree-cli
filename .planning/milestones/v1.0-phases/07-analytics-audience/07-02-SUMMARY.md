---
phase: 07-analytics-audience
plan: "02"
subsystem: analytics
tags: [analytics, live, conversions, vitest, wave-0]
dependency_graph:
  requires: [07-01]
  provides: [analytics-video-root, analytics-live-commands, analytics-conversions-commands, phase7-test-stubs]
  affects: [analytics-topic]
tech_stack:
  added: []
  patterns: [authenticated-command-pattern, analytics-flags-spread, paginated-vs-non-paginated-analytics]
key_files:
  created:
    - packages/twentythree-cli/src/commands/analytics/__tests__/video-index.test.ts
    - packages/twentythree-cli/src/commands/analytics/__tests__/live.test.ts
    - packages/twentythree-cli/src/commands/analytics/__tests__/conversions.test.ts
    - packages/twentythree-cli/src/commands/analytics/__tests__/usage.test.ts
    - packages/twentythree-cli/src/commands/audience/__tests__/list.test.ts
    - packages/twentythree-cli/src/commands/audience/__tests__/search.test.ts
    - packages/twentythree-cli/src/commands/audience/__tests__/register.test.ts
    - packages/twentythree-cli/src/commands/audience/__tests__/mutations.test.ts
    - packages/twentythree-cli/src/commands/audience/field/__tests__/set.test.ts
    - packages/twentythree-cli/src/commands/analytics/video/index.ts
    - packages/twentythree-cli/src/commands/analytics/live/index.ts
    - packages/twentythree-cli/src/commands/analytics/live/timeseries.ts
    - packages/twentythree-cli/src/commands/analytics/live/totals.ts
    - packages/twentythree-cli/src/commands/analytics/live/weekday.ts
    - packages/twentythree-cli/src/commands/analytics/live/event.ts
    - packages/twentythree-cli/src/commands/analytics/live/event-timeseries.ts
    - packages/twentythree-cli/src/commands/analytics/live/event-totals.ts
    - packages/twentythree-cli/src/commands/analytics/conversions/index.ts
    - packages/twentythree-cli/src/commands/analytics/conversions/timeseries.ts
    - packages/twentythree-cli/src/commands/analytics/conversions/totals.ts
  modified: []
decisions:
  - "analytics/video/index.ts uses index.ts pattern so oclif registers `analytics video` as the bare topic command"
  - "Live event sub-commands use hyphenated CLI filenames (event-timeseries.ts) but map to slash API paths (/live/event/timeseries)"
  - "Conversions root has no pagination (no p/size per OpenAPI spec); live root has pagination"
metrics:
  duration: "4 minutes"
  completed: "2026-04-16"
  tasks_completed: 3
  files_created: 20
---

# Phase 07 Plan 02: Live and Conversions Analytics Commands Summary

**One-liner:** Wave 0 vitest stub scaffolding for all Phase 7 command groups plus root analytics video/live/conversions commands and all 6 live sub-dimension commands using shared analytics-flags pattern.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 0 | Wave 0 vitest .todo() stubs | 865447c | 9 test stub files across analytics/__tests__, audience/__tests__, audience/field/__tests__ |
| 1 | Root analytics video/live + all 6 live sub-dimension commands | 0303149 | analytics/video/index.ts + analytics/live/*.ts (7 files) |
| 2 | Root analytics conversions + timeseries/totals sub-commands | 3190173 | analytics/conversions/*.ts (3 files) |

## What Was Built

### Wave 0 Test Stubs (Task 0)
9 vitest `.todo()` stub files establishing test scaffolding for all Phase 7 command groups. These act as a living specification of expected behaviors for plans 07-02 through 07-04.

### Analytics Video Root (Task 1)
`analytics/video/index.ts` — Closes ANL-01 gap. Root `analytics video` command calling GET `/analytics/data/videos` with full pagination (`p`, `size`) and date/filter flags. Uses `index.ts` pattern so oclif registers it as the bare `analytics video` topic command.

### Analytics Live Commands (Task 1)
7 commands covering the complete live/webinar analytics surface (ANL-03, ANL-04):
- `analytics/live/index.ts` — Root paginated live command (GET `/analytics/data/live`)
- `analytics/live/timeseries.ts` — GET `/analytics/data/live/timeseries` (no pagination)
- `analytics/live/totals.ts` — GET `/analytics/data/live/totals` (no pagination)
- `analytics/live/weekday.ts` — GET `/analytics/data/live/weekday` (paginated)
- `analytics/live/event.ts` — GET `/analytics/data/live/event` (paginated)
- `analytics/live/event-timeseries.ts` — GET `/analytics/data/live/event/timeseries` (slash path, no pagination)
- `analytics/live/event-totals.ts` — GET `/analytics/data/live/event/totals` (slash path, no pagination)

### Analytics Conversions Commands (Task 2)
3 commands covering the full conversions analytics surface (ANL-05, ANL-06):
- `analytics/conversions/index.ts` — Root conversions command (GET `/analytics/data/conversions`, no pagination)
- `analytics/conversions/timeseries.ts` — GET `/analytics/data/conversions/timeseries` (no pagination)
- `analytics/conversions/totals.ts` — GET `/analytics/data/conversions/totals` (no pagination)

## Verification

- vitest: 15 passed | 24 skipped | 69 todo — all stubs discovered, no failures
- tsc --noEmit: 0 new errors from any of the 20 new files (pre-existing errors in base-command.ts, chunked-upload.ts unaffected)
- All 11 command files have `static enableJsonFlag = true`
- All 11 command files import from `../../../lib/analytics-flags.js`
- Paginated commands correctly include `p: flags.page, size: flags.size`
- Non-paginated commands do NOT spread `ANALYTICS_PAGINATION_FLAGS`
- Critical: event-timeseries and event-totals use `/live/event/timeseries` and `/live/event/totals` (slash paths per OpenAPI spec, not hyphens)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all new commands wire real API paths; no placeholder data.

## Self-Check: PASSED

Files verified to exist:
- packages/twentythree-cli/src/commands/analytics/video/index.ts — FOUND
- packages/twentythree-cli/src/commands/analytics/live/index.ts — FOUND
- packages/twentythree-cli/src/commands/analytics/live/event-timeseries.ts — FOUND
- packages/twentythree-cli/src/commands/analytics/live/event-totals.ts — FOUND
- packages/twentythree-cli/src/commands/analytics/conversions/index.ts — FOUND
- packages/twentythree-cli/src/commands/analytics/conversions/timeseries.ts — FOUND
- packages/twentythree-cli/src/commands/analytics/conversions/totals.ts — FOUND
- All 9 test stub files — FOUND

Commits verified:
- 865447c — test(07-02): Wave 0 vitest .todo() stubs
- 0303149 — feat(07-02): root analytics video/live commands and all 6 live sub-dimension commands
- 3190173 — feat(07-02): root analytics conversions command and sub-dimension commands
