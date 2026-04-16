---
phase: 08-platform-polish
plan: "08"
subsystem: agent-metadata
tags: [agent, metadata, video, action, analytics, cli-06]
dependency_graph:
  requires: [08-07]
  provides: [agent-metadata-video, agent-metadata-action, agent-metadata-analytics]
  affects: [base-command-agent-handler]
tech_stack:
  added: []
  patterns: [static-agent-metadata, oclif-command-static-property]
key_files:
  created: []
  modified:
    - packages/twentythree-cli/src/commands/video/list.ts
    - packages/twentythree-cli/src/commands/video/get.ts
    - packages/twentythree-cli/src/commands/video/upload.ts
    - packages/twentythree-cli/src/commands/video/update.ts
    - packages/twentythree-cli/src/commands/video/delete.ts
    - packages/twentythree-cli/src/commands/video/frame.ts
    - packages/twentythree-cli/src/commands/video/replace.ts
    - packages/twentythree-cli/src/commands/video/transcoding-progress.ts
    - packages/twentythree-cli/src/commands/video/section/list.ts
    - packages/twentythree-cli/src/commands/video/section/create.ts
    - packages/twentythree-cli/src/commands/video/section/update.ts
    - packages/twentythree-cli/src/commands/video/section/delete.ts
    - packages/twentythree-cli/src/commands/video/section/set-thumbnail.ts
    - packages/twentythree-cli/src/commands/video/subtitle/list.ts
    - packages/twentythree-cli/src/commands/video/subtitle/create.ts
    - packages/twentythree-cli/src/commands/video/subtitle/update.ts
    - packages/twentythree-cli/src/commands/video/subtitle/delete.ts
    - packages/twentythree-cli/src/commands/video/subtitle/upload.ts
    - packages/twentythree-cli/src/commands/video/subtitle/data.ts
    - packages/twentythree-cli/src/commands/video/subtitle/locales.ts
    - packages/twentythree-cli/src/commands/video/subtitle/types.ts
    - packages/twentythree-cli/src/commands/video/subtitle/duplicate.ts
    - packages/twentythree-cli/src/commands/video/subtitle/set-primary.ts
    - packages/twentythree-cli/src/commands/video/subtitle/archive.ts
    - packages/twentythree-cli/src/commands/action/add.ts
    - packages/twentythree-cli/src/commands/action/delete.ts
    - packages/twentythree-cli/src/commands/action/exclude.ts
    - packages/twentythree-cli/src/commands/action/get.ts
    - packages/twentythree-cli/src/commands/action/include.ts
    - packages/twentythree-cli/src/commands/action/list.ts
    - packages/twentythree-cli/src/commands/action/types.ts
    - packages/twentythree-cli/src/commands/action/update.ts
    - packages/twentythree-cli/src/commands/action/upload.ts
    - packages/twentythree-cli/src/commands/analytics/video/index.ts
    - packages/twentythree-cli/src/commands/analytics/video/performance.ts
    - packages/twentythree-cli/src/commands/analytics/video/published.ts
    - packages/twentythree-cli/src/commands/analytics/video/timeseries.ts
    - packages/twentythree-cli/src/commands/analytics/video/totals.ts
    - packages/twentythree-cli/src/commands/analytics/video/weekday.ts
    - packages/twentythree-cli/src/commands/analytics/live/index.ts
    - packages/twentythree-cli/src/commands/analytics/live/event.ts
    - packages/twentythree-cli/src/commands/analytics/live/event-timeseries.ts
    - packages/twentythree-cli/src/commands/analytics/live/event-totals.ts
    - packages/twentythree-cli/src/commands/analytics/live/timeseries.ts
    - packages/twentythree-cli/src/commands/analytics/live/totals.ts
    - packages/twentythree-cli/src/commands/analytics/live/weekday.ts
    - packages/twentythree-cli/src/commands/analytics/conversions/index.ts
    - packages/twentythree-cli/src/commands/analytics/conversions/timeseries.ts
    - packages/twentythree-cli/src/commands/analytics/conversions/totals.ts
    - packages/twentythree-cli/src/commands/analytics/usage/devices.ts
    - packages/twentythree-cli/src/commands/analytics/usage/domains.ts
    - packages/twentythree-cli/src/commands/analytics/usage/locations.ts
    - packages/twentythree-cli/src/commands/analytics/usage/sourceids.ts
    - packages/twentythree-cli/src/commands/analytics/usage/sources.ts
    - packages/twentythree-cli/src/commands/analytics/usage/spots.ts
    - packages/twentythree-cli/src/commands/analytics/usage/storage.ts
    - packages/twentythree-cli/src/commands/analytics/usage/traffic.ts
decisions:
  - "subtitle/delete.ts api_endpoint is POST /photo/subtitle/remove (not /delete) — API endpoint name differs from CLI command name"
  - "subtitle/archive.ts uses POST /photo/subtitle/archive/transcribe as the primary endpoint since it is the default (non-progress) path"
  - "analytics/usage/storage.ts uses output_shape key-value (single object response, not an array)"
  - "action/include.ts and action/exclude.ts use side_effects: updates (POST that modifies scope association, not creates/destructive)"
metrics:
  duration: "7min"
  completed_date: "2026-04-16"
  tasks: 2
  files: 57
---

# Phase 08 Plan 08: agentMetadata Backfill (video, action, analytics) Summary

Backfilled `static agentMetadata` to all 57 existing video, action, and analytics command files, completing CLI-06 part 1 of 2. Every command now exposes the metadata block that the `--agent` flag handler in BaseCommand reads via `this.ctor.agentMetadata`.

## What Was Built

Added `static agentMetadata` blocks to 57 command files across three resource groups:

- **24 video commands** — video/, video/section/, video/subtitle/ (Task 1)
- **9 action commands** — action/ (Task 2)
- **24 analytics commands** — analytics/video/, analytics/live/, analytics/conversions/, analytics/usage/ (Task 2)

Each metadata block has four fields derived by reading the actual file:
- `api_endpoint` — matches the actual `apiClient.GET(...)` or `apiClient.POST(...)` path
- `auth_scope` — `'read'` for GETs, `'write'` for POST mutations
- `output_shape` — `{ type: 'table', columns: [...] }` with actual column names from `renderTable()`, or `{ type: 'key-value' }` for single-resource responses
- `side_effects` — `'none'` (GETs), `'creates'` (POST create/upload), `'updates'` (POST update/set), `'destructive'` (POST delete)

## Commits

- `fc3e4a9` — feat(08-08): add agentMetadata to all 24 video command files
- `0dc488e` — feat(08-08): add agentMetadata to all 9 action and 24 analytics command files

## Deviations from Plan

None — plan executed exactly as written. All mapping rules applied as specified.

Notable mapping decisions (within plan guidance):

- `subtitle/delete.ts` — api_endpoint is `POST /photo/subtitle/remove` (API endpoint is `/remove` not `/delete`, as documented in the file's JSDoc)
- `subtitle/archive.ts` — api_endpoint is `POST /photo/subtitle/archive/transcribe` (the primary non-progress path)
- `analytics/usage/storage.ts` — output_shape is `key-value` since the endpoint returns a single object, not a paginated array
- `action/include.ts` and `action/exclude.ts` — side_effects is `'updates'` since they modify scope associations (not creates/destructive)

## Known Stubs

None — this plan adds static metadata only; no data rendering is stubbed.

## Threat Flags

None — static metadata additions introduce no new trust boundaries or network surfaces.

## Self-Check: PASSED

- video/upload.ts: FOUND
- action/delete.ts: FOUND
- analytics/usage/storage.ts: FOUND
- Commit fc3e4a9: FOUND
- Commit 0dc488e: FOUND
- agentMetadata count video/: 24
- agentMetadata count action/: 9
- agentMetadata count analytics/: 24
