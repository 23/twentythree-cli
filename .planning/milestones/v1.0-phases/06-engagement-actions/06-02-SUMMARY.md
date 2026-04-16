---
plan: "06-02"
phase: "06-engagement-actions"
subsystem: collector, tag
tags: [collector, tag, engagement, list, get]
dependency_graph:
  requires: []
  provides: [collector-list, collector-include, collector-exclude, tag-list, tag-related]
  affects: []
tech_stack:
  added: []
  patterns: [fetchAllPages-pagination, renderTable-output, GET-based-mutation]
key_files:
  created:
    - packages/twentythree-cli/src/commands/collector/list.ts
    - packages/twentythree-cli/src/commands/collector/include.ts
    - packages/twentythree-cli/src/commands/collector/exclude.ts
    - packages/twentythree-cli/src/commands/tag/list.ts
    - packages/twentythree-cli/src/commands/tag/related.ts
  modified: []
decisions:
  - "Collector include/exclude use GET (not POST) with action_id param — matches API design where collectors are a subtype of actions"
  - "include_analytics_p typed as boolean in OpenAPI spec — passed as true (not integer 1)"
  - "tag related renders single Tag column (no count in response schema)"
metrics:
  duration: "~3min"
  completed: "2026-04-15"
  tasks: 2
  files: 5
---

# Phase 06 Plan 02: Collector and Tag Commands Summary

**One-liner:** 3 collector commands (list/include/exclude via GET with action_id) and 2 tag commands (paginated list, related lookup) following established CLI patterns.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 06-02-01 | Collector list, include, exclude commands | 1cf62a1 | collector/list.ts, collector/include.ts, collector/exclude.ts |
| 06-02-02 | Tag list and tag related commands | a1747ac | tag/list.ts, tag/related.ts |

## What Was Built

### Collector Commands

**`collector list`** — Lists all collectors (lead capture forms) in the active workspace. Accepts optional `--object-id` (filter by video/webinar) and `--include-analytics` (include reach/conversion metrics). Renders a table with columns: ID, Name, Type.

**`collector include <id>`** — Attaches a collector to a video or webinar. Uses GET (not POST — API design choice). The positional `<id>` maps to `action_id` in the query (collectors are a subtype of actions, not a distinct resource type).

**`collector exclude <id>`** — Blocks a collector from a video or webinar. Same GET pattern and `action_id` parameter as include.

### Tag Commands

**`tag list`** — Lists all workspace tags with auto-pagination via `fetchAllPages`. Supports `--search`, `--exclude-machine-tags`, `--only-machine-tags`, `--only-published`, `--orderby` (tag|count), and `--order` (asc|desc). Renders a table with columns: Tag, Count.

**`tag related <tag>`** — Returns tags related to a given tag. Single required positional arg. Renders a table with column: Tag.

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written, with one minor type correction:

**1. [Rule 1 - Bug] include_analytics_p typed as boolean in OpenAPI spec**
- **Found during:** Task 1 (verifying types before writing)
- **Issue:** Plan instructed passing `1` (integer) for `include_analytics_p`, but the OpenAPI types define it as `boolean`
- **Fix:** Pass `true` instead of `1` to satisfy TypeScript type safety without a cast
- **Files modified:** collector/list.ts
- **Commit:** 1cf62a1

## Known Stubs

None — all commands wire directly to real API endpoints with no placeholder data.

## Threat Flags

None — all 5 commands are read-only GET requests behind `AuthenticatedCommand`. No new network surface beyond the planned endpoints.

## Self-Check: PASSED

Files verified:
- packages/twentythree-cli/src/commands/collector/list.ts — FOUND
- packages/twentythree-cli/src/commands/collector/include.ts — FOUND
- packages/twentythree-cli/src/commands/collector/exclude.ts — FOUND
- packages/twentythree-cli/src/commands/tag/list.ts — FOUND
- packages/twentythree-cli/src/commands/tag/related.ts — FOUND

Commits verified:
- 1cf62a1 (collector commands)
- a1747ac (tag commands)

TypeScript: No errors in new files (pre-existing errors in other files are unrelated).
