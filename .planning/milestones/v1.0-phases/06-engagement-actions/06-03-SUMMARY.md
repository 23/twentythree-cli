---
plan: "06-03"
phase: "06-engagement-actions"
subsystem: "comment"
tags: [comment, reaction, 3-level-topic, engagement]
dependency_graph:
  requires: []
  provides: [comment-commands, comment-reaction-commands]
  affects: [oclif-command-registry]
tech_stack:
  added: []
  patterns: [3-level-oclif-topic, GET-mutation-endpoints, standalone-topic-pattern]
key_files:
  created:
    - packages/twentythree-cli/src/commands/comment/list.ts
    - packages/twentythree-cli/src/commands/comment/add.ts
    - packages/twentythree-cli/src/commands/comment/update.ts
    - packages/twentythree-cli/src/commands/comment/delete.ts
    - packages/twentythree-cli/src/commands/comment/promote.ts
    - packages/twentythree-cli/src/commands/comment/clone.ts
    - packages/twentythree-cli/src/commands/comment/set-order.ts
    - packages/twentythree-cli/src/commands/comment/reaction/add.ts
    - packages/twentythree-cli/src/commands/comment/reaction/list.ts
    - packages/twentythree-cli/src/commands/comment/reaction/remove.ts
  modified: []
decisions:
  - "D-2 applied: comment is standalone topic; --object-id and --object-type pass values through as-is (no term mapping)"
  - "D-3 applied: comment/reaction/ directory creates 3-level oclif topic automatically via filesystem convention"
  - "T-06-05: comment/delete.ts has confirmation prompt; skipped in --json mode"
  - "T-06-06: --object-token required on all reaction commands; no auto-lookup pattern"
  - "All 3 comment reaction endpoints use GET not POST per API spec"
metrics:
  duration: "3 minutes"
  completed: "2026-04-15"
  tasks: 3
  files: 10
---

# Phase 06 Plan 03: Comment Commands Including Reaction 3-Level Topic Summary

All 8 comment commands plus 3 comment reaction sub-commands implemented. First 3-level oclif topic in the CLI via directory structure (comment/reaction/).

## What Was Built

10 command files across `src/commands/comment/` and `src/commands/comment/reaction/`:

**Top-level comment commands (7 files):**
- `comment list` — GET /comment/list with fetchAllPages pagination, object_id/object_type filtering
- `comment add` — POST /comment/add, --object-id + --object-type required (D-2 values pass as-is)
- `comment update` — POST /comment/update, comment_id + object_id + optional status
- `comment delete` — POST /comment/delete with confirmation prompt (T-06-05)
- `comment promote` — POST /comment/promote with optional promoted_p (omit to toggle)
- `comment clone` — GET /comment/clone with optional comment_id and clone-type
- `comment set-order` — POST /comment/set-order with object-id (required) + order CSV (required)

**3-level reaction sub-commands (3 files):**
- `comment reaction add` — GET /comment/reaction/add, CommentReactionAdd class
- `comment reaction list` — GET /comment/reaction/list, CommentReactionList class, renderTable
- `comment reaction remove` — GET /comment/reaction/remove, CommentReactionRemove class

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 06-03-01 | abc4d98 | comment list, add, update, delete commands |
| 06-03-02 | 13ea905 | comment promote, clone, set-order commands |
| 06-03-03 | 37676cf | comment reaction add, list, remove (3-level topic) |

## Decisions Made

1. **D-2 applied** — comment is a standalone topic with --object-id and --object-type flags. object_type values (photo, album, live) pass through to the API with no term mapping, per explicit user decision.

2. **D-3 applied** — comment/reaction/ directory structure creates the 3-level `comment reaction *` topic automatically via oclif's filesystem discovery. No additional configuration needed.

3. **Class naming convention** — reaction commands follow Topic1+Topic2+Verb: `CommentReactionAdd`, `CommentReactionList`, `CommentReactionRemove`.

4. **GET for all reaction mutations** — All 3 `/comment/reaction/*` endpoints are GET queries per API spec, despite performing mutations. Applied as designed.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Mitigations Applied

| Threat | File | Mitigation |
|--------|------|------------|
| T-06-05 (unintended comment deletion) | comment/delete.ts | Confirmation prompt required; skipped only in --json mode |
| T-06-06 (object token exposure) | reaction/add.ts, reaction/list.ts, reaction/remove.ts | --object-token is required flag on all 3 commands; no auto-lookup |

## Verification

- TypeScript: 0 errors in comment/ files
- Tests: 146 passed, 36 todo (all pre-existing)
- File count: 7 in comment/, 3 in comment/reaction/
- All reaction commands use apiClient.GET (not POST)
- All 10 files have `static enableJsonFlag = true`

## Self-Check: PASSED

All 10 files confirmed present:
- packages/twentythree-cli/src/commands/comment/list.ts ✓
- packages/twentythree-cli/src/commands/comment/add.ts ✓
- packages/twentythree-cli/src/commands/comment/update.ts ✓
- packages/twentythree-cli/src/commands/comment/delete.ts ✓
- packages/twentythree-cli/src/commands/comment/promote.ts ✓
- packages/twentythree-cli/src/commands/comment/clone.ts ✓
- packages/twentythree-cli/src/commands/comment/set-order.ts ✓
- packages/twentythree-cli/src/commands/comment/reaction/add.ts ✓
- packages/twentythree-cli/src/commands/comment/reaction/list.ts ✓
- packages/twentythree-cli/src/commands/comment/reaction/remove.ts ✓

Commits abc4d98, 13ea905, 37676cf all present in git log.
