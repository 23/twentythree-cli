---
phase: 23-behavioral-guide-authoring
reviewed: 2026-04-23T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - packages/twentythree-skills/skills/guide.md
  - packages/twentythree-skills/skills/SKILL.md
  - packages/twentythree-skills/skills/reference/video.md
  - packages/twentythree-skills/skills/reference/webinar.md
findings:
  critical: 0
  warning: 4
  info: 2
  total: 6
status: issues_found
---

# Phase 23: Code Review Report

**Reviewed:** 2026-04-23
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Four behavioral guide and reference markdown files were reviewed. These files serve as authoritative operational instructions for AI agents interacting with the TwentyThree CLI. Correctness here directly determines whether agents issue valid commands or receive errors.

Two findings in `SKILL.md` are particularly high-risk: one uses a non-existent flag (`--scheduled-at` vs `--live-date`), and one demonstrates a command explicitly prohibited by the Correctness Rules defined in the same file (`webinar get`). A third finding in the same file uses an inconsistent flag form (`--published 1` vs `--publish`) that may cause failures. These three issues are in the most frequently consulted entry-point document and will propagate errors to agents before they ever reach the more accurate reference files.

The remaining three findings are lower-risk: a misleading response shape in SKILL.md, a missing code example in `reference/video.md`, and a potentially confusing naming convention note in `reference/video.md`.

## Warnings

### WR-01: SKILL.md uses non-existent `--scheduled-at` flag instead of `--live-date`

**File:** `packages/twentythree-skills/skills/SKILL.md:197`
**Issue:** The "Webinar Setup" workflow uses `--scheduled-at` as the flag to schedule a webinar:
```bash
twentythree webinar create --title "Q2 Kickoff" --scheduled-at "2026-05-01T14:00:00Z" --json
```
Every other file in scope uses `--live-date` for this purpose: `guide.md` lines 45 and 58, `reference/webinar.md` lines 38 and 48, and the workflow files. `--scheduled-at` does not appear in the `webinar create` flag table in `reference/webinar.md`. An agent following SKILL.md's example will pass an unrecognized flag and the command will fail.

**Fix:**
```bash
twentythree webinar create --title "Q2 Kickoff" --live-date "2026-05-01T14:00:00Z" --json
```

---

### WR-02: SKILL.md calls `webinar get` — a command explicitly prohibited by its own Correctness Rules

**File:** `packages/twentythree-skills/skills/SKILL.md:201`
**Issue:** The "Webinar Setup" workflow includes:
```bash
twentythree webinar get <webinar-id> --json
```
SKILL.md's own Behavioral Guide section at line 129 lists "no `webinar get`" as a Correctness Rule that prevents API errors. `guide.md` line 31 and `reference/webinar.md` lines 11–13 and 57 all state explicitly there is no `webinar get` command. An agent reading the workflow example will attempt to call a command that does not exist, then encounter an error.

**Fix:** Replace the `webinar get` line with the canonical retrieval pattern:
```bash
# Fetch room URL and stream key — use webinar list --search since there is no webinar get
twentythree webinar list --search "Q2 Kickoff" --json
# Then use webinar room connect for the stream key specifically:
twentythree webinar room connect <webinar-id> --json
```

---

### WR-03: SKILL.md uses `--published 1` (integer form) instead of `--publish` (boolean flag)

**File:** `packages/twentythree-skills/skills/SKILL.md:190`
**Issue:** The "Upload and Publish a Video" workflow uses:
```bash
twentythree video update <video-id> --published 1 --json
```
The `video update` flag table in `reference/video.md` line 101 defines `--publish` as a boolean flag (no integer value). All other usage across `reference/video.md` (lines 558, 569), `guide.md`, and workflow files use `--publish` without a value. The `--published 1` form is inconsistent and will either fail flag parsing or be silently ignored.

**Fix:**
```bash
twentythree video update <video-id> --publish --json
```

---

### WR-04: SKILL.md shows flat JSON response shape where nested `data.*` shape is correct

**File:** `packages/twentythree-skills/skills/SKILL.md:181` and `198`
**Issue:** Both workflow examples in SKILL.md show the post-upload/create output as a flat object:
```
# => prints { "id": "<video-id>", "admin_url": "..." }
# => prints { "id": "<webinar-id>", "admin_url": "..." }
```
However `reference/video.md` line 28 and 552, `reference/webinar.md` lines 31 and 45, and the jq path used in `guide.md` line 70 (`jq -r '.data.admin_url'`) all confirm the response is nested under a `data` key:
```json
{ "data": { "id": "<id>", "admin_url": "..." } }
```
An agent using `.id` or `.admin_url` at the top level instead of `.data.id` or `.data.admin_url` will get null values and fail to capture the ID for follow-up commands.

**Fix:** Update both comment lines:
```bash
#    => prints { "data": { "id": "<video-id>", "admin_url": "..." } }
#    => prints { "data": { "id": "<webinar-id>", "admin_url": "..." } }
```

## Info

### IN-01: `video subtitle locales` example has duplicate identical command lines — promised filter example is absent

**File:** `packages/twentythree-skills/skills/reference/video.md:455-459`
**Issue:** The code block for `video subtitle locales` contains two identical command lines:
```bash
# List all available locales
twentythree video subtitle locales --json

# Pipe to filter for English locales
twentythree video subtitle locales --json
```
The second line's comment promises a jq filter for English locales but the command is unchanged from the first. This leaves agents without the promised filtering example and indicates the example was left incomplete.

**Fix:** Either provide the filter or remove the duplicate:
```bash
# List all available locales
twentythree video subtitle locales --json

# Pipe to filter for English locales
twentythree video subtitle locales --json | jq '.data[] | select(.code | startswith("en"))'
```

---

### IN-02: `--subtitle-id` flag described as "Locale of..." — potentially confusing given separate `--locale` flag exists

**File:** `packages/twentythree-skills/skills/reference/video.md:387`, `408`, `489`, `511`
**Issue:** The `--subtitle-id` flag is described as "Locale of the subtitle track to update/delete/retrieve/set as primary (e.g. `en_US`)". A separate `--locale` flag (used in `subtitle create` and `subtitle upload`) accepts the same values. The description phrasing "Locale of..." may cause agents to infer these are the same flag or interchangeable, when they serve different purposes (target selection vs. track creation parameter).

**Fix:** Clarify the description to make the distinction unambiguous:
```
| `--subtitle-id` | yes | — | Identifies the subtitle track by locale code (e.g. `en_US`) — selects an existing track; distinct from `--locale` which specifies locale when creating a new track |
```

---

_Reviewed: 2026-04-23_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
