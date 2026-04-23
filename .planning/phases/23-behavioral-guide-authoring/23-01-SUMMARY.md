---
phase: 23-behavioral-guide-authoring
plan: 01
subsystem: documentation
tags: [skills, guide, behavioral-rules, twentythree-cli, agent]

# Dependency graph
requires:
  - phase: 22-skill-hyperlinks
    provides: SKILL.md hyperlinks and skills package structure
provides:
  - "skills/guide.md with 5 Correctness Rules and 3 Preference Rules, all flag names verified from live --agent output"
affects: [23-02, twentythree-skills-publish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "skills/guide.md at skills/ root (not reference/ or workflows/) for cross-cutting behavioral rules"
    - "D-04 verify-first: run --agent before authoring any rule that references a flag name"
    - "PR-2 reframe: when --include-analytics absent, prefer listing endpoints rule covers the intent"

key-files:
  created:
    - packages/twentythree-skills/skills/guide.md
  modified: []

key-decisions:
  - "--include-analytics does not exist on video list or webinar list (confirmed via live --agent output) — PR-2 reframed as prefer-listing-endpoints-for-richer-data"
  - "open_p has no direct CLI flag on webinar create — CR-3 references --draft and --publish (verified) and directs agents to run --agent to check access flags"

patterns-established:
  - "guide.md structure: YAML frontmatter + H1 heading + blockquote summary + two H2 sections (Correctness/Preference) + ### rule headings with one-line explanation + bash block + --- separator"
  - "Always run live --agent output before authoring any rule that references a CLI flag name"

requirements-completed: [GUIDE-01]

# Metrics
duration: 10min
completed: 2026-04-23
---

# Phase 23 Plan 01: Behavioral Guide Summary

**skills/guide.md authored with 8 verified behavioral rules — 5 correctness rules covering object type differentiation, no-webinar-get, webinar creation defaults, timezone handling, and admin link construction; 3 preference rules covering thumbnails-from-listing, prefer-listing-endpoints, and filtering/sorting on listings**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-23T21:00:00Z
- **Completed:** 2026-04-23T21:10:00Z
- **Tasks:** 2 (Task 1: verify flags; Task 2: author guide.md)
- **Files modified:** 1

## Accomplishments

- Verified all flag names from live `--agent` output before writing any rule (D-04 compliance)
- Discovered `--include-analytics` does not exist on `video list` or `webinar list` — avoided writing a rule with a non-existent flag
- Discovered `open_p` has no direct CLI flag on `webinar create` — CR-3 references verified `--draft`/`--publish` flags instead
- Created `packages/twentythree-skills/skills/guide.md` with all 8 rules, correct structure, and positive framing throughout
- All 8 acceptance criteria verified programmatically

## Task Commits

1. **Task 1: Verify flag names** — no write (prep/verification only)
2. **Task 2: Author skills/guide.md** — `45ce8b6` (feat)

## Files Created/Modified

- `packages/twentythree-skills/skills/guide.md` — New file: 8 cross-cutting behavioral rules for AI agents using the TwentyThree CLI

## Decisions Made

- `--include-analytics` is absent from both `video list` and `webinar list` (confirmed via live `--agent` output). PR-2 was reframed as "Prefer Listing Endpoints for Richer Data" — covers the same intent (fewer round trips) without referencing a non-existent flag.
- `open_p` API parameter has no direct CLI flag on `webinar create`. CR-3 was updated to reference the verified `--draft` and `--publish` flags and directs agents to run `twentythree webinar create --agent` to check current access flags before creating.

## Deviations from Plan

### Auto-adjusted Content (not a bug fix — flag verification result)

**1. [D-04 Flag Verification] PR-2 reframed — --include-analytics absent from live --agent output**
- **Found during:** Task 1 (flag verification)
- **Issue:** Plan PR-2 said: "If --include-analytics was NOT FOUND on either command, reframe the rule." Ran `twentythree video list --agent` and `twentythree webinar list --agent` — neither has this flag.
- **Fix:** PR-2 written as "Prefer Listing Endpoints for Richer Data" using `--all`, `--status`, and `--limit` flags (all verified present).
- **Files modified:** `packages/twentythree-skills/skills/guide.md`

**2. [D-04 Flag Verification] CR-3 reframed — open_p has no CLI flag on webinar create**
- **Found during:** Task 1 (flag verification)
- **Issue:** Plan CR-3 said: "Use the VERIFIED flag name from Task 1 (the open_p equivalent)." Ran `twentythree webinar create --agent` — no `--open-p` or privacy flag; only `--draft` and `--publish`.
- **Fix:** CR-3 references `--draft` and `--publish` (verified) and instructs agents to run `--agent` to confirm current access flags.
- **Files modified:** `packages/twentythree-skills/skills/guide.md`

---

**Total deviations:** 2 (both are expected D-04 verification outcomes — plan explicitly provided fallback instructions for both cases)
**Impact on plan:** Content is correct and verified. No scope creep. All acceptance criteria satisfied.

## Issues Encountered

None.

## Threat Flags

No new security-relevant surface introduced. `guide.md` is static markdown with no credentials or PII (T-23-01: accepted).

## Known Stubs

None — all 8 rules have concrete bash examples with verified flag names.

## Next Phase Readiness

- `skills/guide.md` is ready for Phase 23-02 which adds inline notes to `video.md` and `webinar.md` and updates `SKILL.md`
- File is at `skills/` root — `bin/add.js` walkDir will pick it up automatically, no code changes needed
- Phase 24 will need to update the `npm pack --dry-run` file count assertion from 28 to 29

---
*Phase: 23-behavioral-guide-authoring*
*Completed: 2026-04-23*
