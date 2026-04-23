# Requirements — v1.5 Agent Behavioral Guidelines

## Milestone Requirements

### Behavioral Guide

- [ ] **GUIDE-01**: New `skills/guide.md` with 8 behavioral rules — 4 correctness rules (object type differentiation, webinar creation defaults, timezone handling, admin link construction) + 3 preference rules (thumbnails from listing responses, analytics via listing flags, filtering/sorting on listing endpoints) + 1 implied correctness rule (no `webinar get` command — use `webinar list --search`). Rules must use positive framing and include concrete command examples. Flag names (`open_p`, `--include-analytics`) must be verified via `--agent` output before writing. Located at `skills/guide.md` (not in `reference/` or `workflows/`).
- [ ] **GUIDE-02**: Inline behavioral notes added to relevant reference files — at minimum `webinar.md` for the "no webinar get" rule; `video.md` and `webinar.md` for rules with direct point-of-use relevance (thumbnails, analytics include, admin links). Format: `> **Note:**` blockquote immediately after the relevant command header. One note per affected command; no verbatim rule repetition — forward-reference `guide.md` instead.
- [ ] **GUIDE-03**: `skills/SKILL.md` updated to reference `guide.md` — new "Behavioral Guide" section added before the resource index table so agents encounter behavioral orientation before scanning commands.

### Integration

- [ ] **INT-01**: `npm pack --dry-run` file count assertion updated from 28 to 29 to account for the new `skills/guide.md` file (bin/add.js requires no changes — walkDir installs all files in `skills/` automatically).

## Future Requirements

- Additional behavioral rules as high-value patterns emerge from real agent usage
- Webinar series–specific behavioral notes (scheduling, speaker management)
- Cross-reference notes for `analytics.md` if analytics-include flag guidance warrants dedicated callout

## Out of Scope

- CLI code changes — all changes are skills package content only; no CLI command output changes
- `--object-type` legacy names implied rule — skip for this milestone; already documented inline in `video.md` and `webinar.md` Terminology Notes sections
- Clip delay after recording stop implied rule — skip for this milestone; too narrow for guide.md, no strong agent failure mode identified
- Runtime-specific format variants — all runtimes use the same static markdown

## Traceability

| REQ-ID   | Phase | Plan |
|----------|-------|------|
| GUIDE-01 | TBD   | TBD  |
| GUIDE-02 | TBD   | TBD  |
| GUIDE-03 | TBD   | TBD  |
| INT-01   | TBD   | TBD  |

---
*Created: 2026-04-23 — v1.5 milestone*
