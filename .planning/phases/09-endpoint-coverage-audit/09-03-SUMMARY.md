---
phase: 09-endpoint-coverage-audit
plan: 03
subsystem: analytics-commands
tags: [analytics, endpoint-coverage, gap-fill, usage, devices, domains, locations, sourceids, sources, spots, traffic]
dependency_graph:
  requires: [09-01, 09-02]
  provides: [10-usage-analytics-gap-fill-commands, audit-exit-0]
  affects:
    - packages/twentythree-cli/src/commands/analytics/usage/devices/
    - packages/twentythree-cli/src/commands/analytics/usage/domains/
    - packages/twentythree-cli/src/commands/analytics/usage/locations/
    - packages/twentythree-cli/src/commands/analytics/usage/sourceids/
    - packages/twentythree-cli/src/commands/analytics/usage/sources/
    - packages/twentythree-cli/src/commands/analytics/usage/spots/
    - packages/twentythree-cli/src/commands/analytics/usage/traffic/
tech_stack:
  added: []
  patterns: [AuthenticatedCommand, ANALYTICS_DATE_FLAGS, ANALYTICS_FILTER_FLAGS, agentMetadata]
key_files:
  created:
    - packages/twentythree-cli/src/commands/analytics/usage/devices/timeseries.ts
    - packages/twentythree-cli/src/commands/analytics/usage/devices/totals.ts
    - packages/twentythree-cli/src/commands/analytics/usage/domains/totals.ts
    - packages/twentythree-cli/src/commands/analytics/usage/locations/totals.ts
    - packages/twentythree-cli/src/commands/analytics/usage/sourceids/totals.ts
    - packages/twentythree-cli/src/commands/analytics/usage/sources/totals.ts
    - packages/twentythree-cli/src/commands/analytics/usage/spots/timeseries.ts
    - packages/twentythree-cli/src/commands/analytics/usage/spots/totals.ts
    - packages/twentythree-cli/src/commands/analytics/usage/traffic/timeseries.ts
    - packages/twentythree-cli/src/commands/analytics/usage/traffic/totals.ts
  modified: []
decisions:
  - All 10 usage analytics sub-series commands use ANALYTICS_DATE_FLAGS + ANALYTICS_FILTER_FLAGS only -- no ANALYTICS_PAGINATION_FLAGS, matching the no-pagination contract of timeseries/totals endpoints
  - traffic/timeseries and traffic/totals use row.traffic_type ?? row.type for resilient field resolution
metrics:
  duration_minutes: 8
  completed_date: "2026-04-16"
  tasks_completed: 2
  tasks_total: 2
  files_created: 10
  files_modified: 0
---

# Phase 09 Plan 03: Analytics Gap-Fill Wave 3 Summary

**One-liner:** 10 usage analytics sub-series commands added (devices/domains/locations/sourceids/sources/spots/traffic timeseries+totals variants), closing all 18 analytics gaps so the audit script exits 0.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create usage analytics sub-series commands (devices, domains, locations, sourceids, sources) | 0603765 | 6 files in analytics/usage/{devices,domains,locations,sourceids,sources}/ |
| 2 | Create usage spots and traffic sub-series commands, run final audit | 35f61b7 | 4 files in analytics/usage/{spots,traffic}/ |

## What Was Built

### 10 Usage Analytics Sub-Series Commands

All extend `AuthenticatedCommand`, use `ANALYTICS_DATE_FLAGS` + `ANALYTICS_FILTER_FLAGS` (no pagination), have `static enableJsonFlag = true`, `agentMetadata` with `auth_scope: 'read'`, and follow the exact structure of the existing timeseries/totals archetypes. All imports use the 4-level deep `'../../../../lib/'` prefix.

| File | api_endpoint | Columns |
|------|-------------|---------|
| `analytics/usage/devices/timeseries.ts` | `GET /analytics/data/usage/devices/timeseries` | Date, Device, Plays, Engagement |
| `analytics/usage/devices/totals.ts` | `GET /analytics/data/usage/devices/totals` | Device, Plays, Engagement, Traffic, Impressions |
| `analytics/usage/domains/totals.ts` | `GET /analytics/data/usage/domains/totals` | Domain, Plays, Engagement, Traffic |
| `analytics/usage/locations/totals.ts` | `GET /analytics/data/usage/locations/totals` | Location, Plays, Engagement, Traffic |
| `analytics/usage/sourceids/totals.ts` | `GET /analytics/data/usage/sourceids/totals` | Source ID, Plays, Engagement, Traffic |
| `analytics/usage/sources/totals.ts` | `GET /analytics/data/usage/sources/totals` | Source, Plays, Engagement, Traffic |
| `analytics/usage/spots/timeseries.ts` | `GET /analytics/data/usage/spots/timeseries` | Date, Spot, Plays, Engagement |
| `analytics/usage/spots/totals.ts` | `GET /analytics/data/usage/spots/totals` | Spot, Plays, Engagement, Traffic |
| `analytics/usage/traffic/timeseries.ts` | `GET /analytics/data/usage/traffic/timeseries` | Date, Traffic Type, Plays, Engagement |
| `analytics/usage/traffic/totals.ts` | `GET /analytics/data/usage/traffic/totals` | Traffic Type, Plays, Engagement, Traffic, Impressions |

## Phase 9 Goal Achieved

After Plans 01 + 02 + 03:
- Plan 01: Audit infrastructure (18 gaps identified, 0 phantoms)
- Plan 02: 8 analytics gaps closed (video weekday/performance/published + live weekday)
- Plan 03: 10 analytics gaps closed (all usage sub-series)
- **Final audit result: Gaps: 0, Phantoms: 0, exit code 0**

Every OpenAPI endpoint is either covered by a command file or listed in `EXCLUDED_OPERATIONS` with a documented reason.

## Verification Results

1. `node packages/twentythree-cli/scripts/audit-endpoints.mjs` — **Gaps: 0, Phantoms: 0, exit 0** (phase gate passed)
2. `pnpm --filter twentythree-cli exec tsc --noEmit` — 15 pre-existing errors, 0 new errors introduced by these 10 files
3. `pnpm --filter twentythree-cli test --run` — 151 passed, 69 todo, 0 failures
4. All 10 `api_endpoint` values confirmed present and spec-matching

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. All commands have full implementation: typed flags, --json output, table rendering, agentMetadata, error handling, and empty-state handling.

## Threat Flags

None. All 10 commands extend `AuthenticatedCommand` (T-09-07 mitigated) and declare `auth_scope: 'read'` (T-09-09 mitigated). Analytics data is read-only, scoped to authenticated workspace (T-09-08 accepted).

## Self-Check: PASSED

- `packages/twentythree-cli/src/commands/analytics/usage/devices/timeseries.ts` — FOUND
- `packages/twentythree-cli/src/commands/analytics/usage/devices/totals.ts` — FOUND
- `packages/twentythree-cli/src/commands/analytics/usage/domains/totals.ts` — FOUND
- `packages/twentythree-cli/src/commands/analytics/usage/locations/totals.ts` — FOUND
- `packages/twentythree-cli/src/commands/analytics/usage/sourceids/totals.ts` — FOUND
- `packages/twentythree-cli/src/commands/analytics/usage/sources/totals.ts` — FOUND
- `packages/twentythree-cli/src/commands/analytics/usage/spots/timeseries.ts` — FOUND
- `packages/twentythree-cli/src/commands/analytics/usage/spots/totals.ts` — FOUND
- `packages/twentythree-cli/src/commands/analytics/usage/traffic/timeseries.ts` — FOUND
- `packages/twentythree-cli/src/commands/analytics/usage/traffic/totals.ts` — FOUND
- Commit 0603765 — FOUND
- Commit 35f61b7 — FOUND
