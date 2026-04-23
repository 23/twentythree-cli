---
phase: 23-behavioral-guide-authoring
plan: 02
subsystem: documentation
tags: [skills, guide, behavioral-rules, skill-index, inline-notes]

# Dependency graph
requires:
  - phase: 23-01
    provides: skills/guide.md with 8 verified behavioral rules
provides:
  - "SKILL.md Behavioral Guide section linking to guide.md, positioned before Resource Index"
  - "video.md with 3 inline Note callouts (upload, list, get) referencing guide.md"
  - "webinar.md with 2 inline Note callouts (create, list) referencing guide.md"
affects: [twentythree-skills-publish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "## Behavioral Guide section inserted before ## Resource Index in SKILL.md — agents encounter guide link before command table"
    - "> **Note:** forward-reference callout format used in reference files — one-to-two lines, ends with See [guide.md](../guide.md)"
    - "Inline notes placed immediately after Auth scope line, before flag tables or bash blocks"

key-files:
  created: []
  modified:
    - packages/twentythree-skills/skills/SKILL.md
    - packages/twentythree-skills/skills/reference/video.md
    - packages/twentythree-skills/skills/reference/webinar.md

key-decisions:
  - "Behavioral Guide section uses backtick-formatted link text [`guide.md`](guide.md) — matches existing SKILL.md style for inline code references"
  - "webinar list Note restates the no-webinar-get rule with --search guidance — reinforces existing file-header block at point of use"
  - "video list Note covers both analytics and thumbnails in a single callout — avoids two notes in the same Auth scope line context"

patterns-established:
  - "SKILL.md section insertion pattern: locate exact ## heading, insert new ## section immediately before it using Edit tool"
  - "Reference file Note placement: immediately after Auth scope metadata line, before flag table"

requirements-completed: [GUIDE-02, GUIDE-03]

# Metrics
duration: 8min
completed: 2026-04-23
---

# Phase 23 Plan 02: SKILL.md + Inline Notes Summary

**SKILL.md updated with Behavioral Guide section before Resource Index; video.md and webinar.md annotated with 5 inline Note callouts referencing guide.md at point of use**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-23T21:00:00Z
- **Completed:** 2026-04-23T21:06:30Z
- **Tasks:** 2 auto + 1 checkpoint (human-verify: approved)
- **Files modified:** 3

## Accomplishments

- Inserted `## Behavioral Guide` section into SKILL.md immediately before `## Resource Index` (line 124 → now line 134 after insertion), with two links to guide.md using correct relative path `(guide.md)`
- Added 3 inline `> **Note:**` callouts to video.md: after video upload (admin_url), after video list (analytics/thumbnails prefer listing), after video get (thumbnails from listing)
- Added 2 inline `> **Note:**` callouts to webinar.md: after webinar create (explicit publish/draft + admin_url), after webinar list (no webinar get, use --search)
- Existing no-webinar-get block at webinar.md file header (lines 11-13) preserved untouched
- All notes use `../guide.md` relative path (reference files are one level deeper than guide.md)
- All notes forward-reference guide.md without restating full rule text (D-06 compliance)

## Task Commits

1. **Task 1: Insert Behavioral Guide section into SKILL.md** — `106bd34`
2. **Task 2: Add inline Note callouts to video.md and webinar.md** — `0ecf14e`
3. **Task 3: Human verification** — approved (no separate commit)

## Files Created/Modified

- `packages/twentythree-skills/skills/SKILL.md` — New `## Behavioral Guide` section (10 lines) inserted before `## Resource Index`
- `packages/twentythree-skills/skills/reference/video.md` — 3 new `> **Note:**` callouts (video upload, video list, video get)
- `packages/twentythree-skills/skills/reference/webinar.md` — 2 new `> **Note:**` callouts (webinar create, webinar list)

## Decisions Made

- Behavioral Guide section uses backtick-formatted link text (`` [`guide.md`](guide.md) ``) — consistent with SKILL.md code-in-prose style for tool/file names.
- webinar list Note explicitly restates "there is no `webinar get` command" + `--search` guidance — reinforces the file-header block at the exact point where an agent would be about to run a non-existent command.
- video list Note covers both analytics and thumbnails in a single sentence — avoids placing two separate notes on the same Auth scope line.

## Deviations from Plan

### Auto-adjusted Content

**1. [D-04 Flag Verification carry-forward] video list Note uses general wording (no --include-analytics)**
- **Found during:** Task 2 (inherited from Plan 01 flag verification)
- **Issue:** Plan 01 confirmed `--include-analytics` does not exist on `video list`. The plan's Location 2 provided an EXCEPTION path for this case.
- **Fix:** Note uses general language ("prefer including them in the listing call") rather than referencing a non-existent flag. Matches plan's EXCEPTION fallback text.
- **Files modified:** `packages/twentythree-skills/skills/reference/video.md`

**2. [D-04 Flag Verification carry-forward] webinar create Note references --publish/--draft (no --open-p)**
- **Found during:** Task 2 (inherited from Plan 01 flag verification)
- **Issue:** Plan 01 confirmed `open_p` has no direct CLI flag on `webinar create`. Plan text provided: "If Plan 01 verified a specific flag name for open_p, include it."
- **Fix:** Note references verified `--publish` and `--draft` flags explicitly instead of a placeholder.
- **Files modified:** `packages/twentythree-skills/skills/reference/webinar.md`

**Total deviations:** 2 (both expected D-04 verification carry-forwards from Plan 01 — plan explicitly provided fallback text for both cases)

## Issues Encountered

None.

## Threat Flags

No new security-relevant surface introduced. All changes are static markdown (T-23-04: accepted).

T-23-03 (SKILL.md insertion order): Mitigated — verified via grep that Behavioral Guide (line 124) appears before Resource Index (line 134).

T-23-05 (webinar.md no-webinar-get block): Mitigated — verified existing block at lines 11-13 is unchanged.

## Known Stubs

None — all notes reference concrete flag names (`--publish`, `--draft`) and real guide.md rule names. No placeholder text.

## Self-Check

Files present:
- `packages/twentythree-skills/skills/SKILL.md` — modified
- `packages/twentythree-skills/skills/reference/video.md` — modified
- `packages/twentythree-skills/skills/reference/webinar.md` — modified

Commits:
- `106bd34` — SKILL.md Behavioral Guide section
- `0ecf14e` — video.md and webinar.md inline notes

## Self-Check: PASSED

- FOUND: packages/twentythree-skills/skills/SKILL.md
- FOUND: packages/twentythree-skills/skills/reference/video.md
- FOUND: packages/twentythree-skills/skills/reference/webinar.md
- FOUND commit: 106bd34 feat(23-02): insert Behavioral Guide section into SKILL.md
- FOUND commit: 0ecf14e feat(23-02): add inline Note callouts to video.md and webinar.md

---
*Phase: 23-behavioral-guide-authoring*
*Completed: 2026-04-23*
