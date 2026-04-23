# Phase 23: Behavioral Guide Authoring - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 23-behavioral-guide-authoring
**Areas discussed:** guide.md structure, Flag verification strategy, Inline note coverage

---

## guide.md structure

| Option | Description | Selected |
|--------|-------------|----------|
| Correctness → Preference | Two sections: Correctness Rules (5, must-follow) then Preference Rules (3, best practice). Agents prioritize correctness rules first, preferences second. | ✓ |
| Flat prioritized list | All 8 rules numbered 1–8 by importance with no grouping. Simpler but doesn't signal mandatory vs. advisory. | |
| Grouped by resource | Sections per topic: Video, Webinar, General. Rules live near the commands they affect. | |

**User's choice:** Correctness → Preference

**Follow-up: Rule depth**

| Option | Description | Selected |
|--------|-------------|----------|
| Rule + example command | Each rule has a one-line explanation and a concrete bash example. | ✓ |
| Rule only (brief) | One or two sentences per rule, no code examples. | |

**User's choice:** Rule + example command (### heading, explanation, bash block per rule)

---

## Flag verification strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Verify first in plan | Plan step 1 runs `--agent` commands, reads output, uses verified flag names throughout. Fails fast if a flag doesn't exist. | ✓ |
| Verify inline while writing | Each uncertain flag triggers a --agent call at writing time. | |
| User verifies manually first | User runs --agent commands before the plan runs and provides correct names. | |

**User's choice:** Verify first in plan
**Notes:** Two uncertain flags: `--include-analytics` (on video list and/or webinar list) and `open_p` (on webinar create). Both must be confirmed via `--agent` before any rule referencing them is written.

---

## Inline note coverage

| Option | Description | Selected |
|--------|-------------|----------|
| video.md + webinar.md only | Minimum per REQUIREMENTS.md. guide.md is single source of truth; inline notes are high-traffic forward-references only. | ✓ |
| Add thumbnail.md too | thumbnail.md gets a note for the thumbnail-from-listing rule. | |
| Add thumbnail.md + analytics.md | Both files get notes for their respective rules. | |

**User's choice:** video.md + webinar.md only
**Notes:** One note per affected command, no verbatim rule repetition — forward-reference guide.md.

---

## Claude's Discretion

- Exact wording/phrasing of each rule entry
- Which specific commands within video.md and webinar.md get inline notes
- Whether SKILL.md Behavioral Guide section is a paragraph, link, or short bulleted summary

## Deferred Ideas

None.
