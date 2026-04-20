---
phase: 19-skill-content
plan: "06"
subsystem: documentation
tags: [skills, markdown, workflow, video, webinar]

# Dependency graph
requires:
  - phase: 19-04
    provides: reference/video.md and reference/category.md — command signatures and flag data sourced by upload-and-publish workflow
  - phase: 19-05
    provides: reference/webinar.md — all webinar command signatures sourced verbatim by webinar-lifecycle workflow

provides:
  - skills/workflows/upload-and-publish.md — 6-step sequence: category list, upload, metadata, frame, transcoding poll, publish
  - skills/workflows/webinar-lifecycle.md — 10-step sequence: create, sections, speakers, thumbnail, publish, room connect, recording start/stop, status/clips, archive
  - SKILL-03 satisfied: 2 workflow files in skills/workflows/

affects: [20-installer, phase-20, any agent reading skills package]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Workflow step template: exact command + expected output shape + capture fields + on failure guidance"
    - "Polling bash loop pattern: while true + jq + sleep for async status checks"
    - "admin_url capture pattern: always surface data.id and data.admin_url after create/upload"
    - "Cross-reference pattern: workflow files link to reference files for exhaustive flag detail"

key-files:
  created:
    - packages/twentythree-skills/skills/workflows/upload-and-publish.md
    - packages/twentythree-skills/skills/workflows/webinar-lifecycle.md
  modified: []

key-decisions:
  - "Workflow commands sourced verbatim from reference files (no inference): webinar section add (not create), speaker add, recording start/stop match webinar.md §Subtopic: webinar section and §webinar recording exactly"
  - "On failure guidance placed inline per step (not just in Error Handling table) for maximum agent visibility without scrolling"
  - "Recording output shape documented as minimal ({} body) — matches live CLI behavior where start/stop return no significant data; status check is the follow-up"
  - "Clips polling uses jq .data | length pattern — consistent with --json output shape across all twentythree commands"

patterns-established:
  - "Workflow file structure: frontmatter + H1 + blockquote summary + Prerequisites + numbered Steps + Error Handling table + Notes"
  - "Step template: ### N. Name → ```bash command``` → Expected output shape → Capture: → On failure:"
  - "Optional steps marked (Optional) in heading — only strictly required steps are unnoted"

requirements-completed: [SKILL-03]

# Metrics
duration: 8min
completed: 2026-04-20
---

# Phase 19 Plan 06: Workflow Files Summary

**Two agent-executable workflow files covering the full upload→publish and create→configure→record→archive sequences, with exact commands sourced from reference/video.md and reference/webinar.md**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-20T13:13:18Z
- **Completed:** 2026-04-20T13:21:00Z
- **Tasks:** 2
- **Files modified:** 2 created

## Accomplishments

- Created `skills/workflows/` directory (new subdirectory not previously present in package)
- Wrote `upload-and-publish.md` with 6-step sequence (145 lines, meets >= 120 minimum); each step has exact command + expected output shape + capture fields + on failure guidance; Error Handling table with 11 rows; cross-references to reference/video.md and reference/category.md
- Wrote `webinar-lifecycle.md` with 10-step sequence (209 lines, meets >= 150 minimum); covers create through archive including go-live credentials, recording, and clip polling loop; Error Handling table with 10 rows; cross-references to reference/webinar.md
- All command names verified against reference/webinar.md (e.g. `webinar section add`, not `create`); commands are copy-paste correct
- `pnpm --filter twentythree-skills test` exits 0 (Gate 2 unchanged: 22 reference files + validator pass)
- SKILL-03 satisfied: exactly 2 workflow files in skills/workflows/

## Task Commits

1. **Task 1: Create workflows directory and write upload-and-publish.md** - `7324d14` (feat)
2. **Task 2: Write webinar-lifecycle.md and validator run** - `850d128` (feat)

**Plan metadata:** (committed with this SUMMARY)

## Files Created/Modified

- `packages/twentythree-skills/skills/workflows/upload-and-publish.md` — 6-step video upload workflow: category list (optional), upload, metadata, frame, transcoding poll, publish; admin_url capture in Step 2
- `packages/twentythree-skills/skills/workflows/webinar-lifecycle.md` — 10-step webinar lifecycle workflow: create, sections, speakers, thumbnail, publish, room connect, recording start/stop, status/clips polling, archive; admin_url capture in Step 1, stream_key/room_url capture in Step 6

## Decisions Made

- Commands sourced verbatim from reference files, not plan interfaces or training data — ensures accuracy (e.g. `webinar section add` not `webinar section create`)
- `On failure:` guidance placed inline per step (not only in Error Handling table) — agents reading a single step have all diagnostic context without needing to scroll to the bottom
- Recording start/stop output shape documented as minimal `{ data: {} }` — matches live CLI behavior (these commands return no significant data; follow-up is `recording status`)
- Clips polling uses `jq '.data | length'` pattern — consistent with standard `--json` output shape

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None — both workflow files contain real command data sourced from reference files and live CLI output.

## Threat Flags

None — static markdown files, no runtime trust boundaries introduced.

## Self-Check: PASSED

- `packages/twentythree-skills/skills/workflows/upload-and-publish.md`: FOUND (145 lines)
- `packages/twentythree-skills/skills/workflows/webinar-lifecycle.md`: FOUND (209 lines)
- Commit `7324d14`: confirmed in git log
- Commit `850d128`: confirmed in git log
- `pnpm --filter twentythree-skills test`: exits 0

## Next Phase Readiness

- Phase 19 content complete: 22 reference files + 2 workflow files = 24 content files
- SKILL-02 (22 reference files) and SKILL-03 (2 workflow files) both fully satisfied
- Phase 20 (installer) can proceed — all skill content it will package is now present

---
*Phase: 19-skill-content*
*Completed: 2026-04-20*
