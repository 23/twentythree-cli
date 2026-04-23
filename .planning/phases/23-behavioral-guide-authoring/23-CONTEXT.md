# Phase 23: Behavioral Guide Authoring - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Create `skills/guide.md` at the `skills/` root (not in `reference/` or `workflows/`) containing 8 cross-cutting behavioral rules. Update `skills/SKILL.md` to reference the guide with a new "Behavioral Guide" section placed *before* the resource index table. Add inline `> **Note:**` callouts to `video.md` and `webinar.md` at point of use.

</domain>

<decisions>
## Implementation Decisions

### guide.md Structure
- **D-01:** Two-section layout: **Correctness Rules** first (5 rules — must-follow, prevent API errors), then **Preference Rules** (3 rules — best practice, improve output quality).
- **D-02:** Each rule entry includes: a `###` heading, a one-line explanation, and a concrete `bash` example command.
- **D-03:** Correctness Rules: object type differentiation, no-webinar-get, webinar creation defaults, timezone handling, admin link construction. Preference Rules: thumbnails from listing response, analytics via listing flags, filtering/sorting on listing endpoints.

### Flag Verification
- **D-04:** Plan step 1 runs `twentythree video list --agent` and `twentythree webinar create --agent` (and any other relevant `--agent` calls) to confirm actual flag names for `--include-analytics` and `open_p` before writing any rule that references them. If a flag name differs from the expected value, use the verified name. If a flag doesn't exist, omit or reframe the rule rather than writing incorrect guidance.

### Inline Note Coverage
- **D-05:** Inline `> **Note:**` callouts are added to **`video.md` and `webinar.md` only** — the minimum specified in REQUIREMENTS.md. `guide.md` is the single source of truth; inline notes are forward-references at point of use, not repetition of rules.
- **D-06:** One note per affected command. Notes do not restate the rule verbatim — they point agents to `guide.md` for the full rule.

### SKILL.md Update
- **D-07:** New "Behavioral Guide" section added *before* the Resource Index table in `SKILL.md`. Agents stop reading at the table; the section must appear earlier so it's not skipped.

### Claude's Discretion
- Exact wording/phrasing of each rule entry — positive framing per REQUIREMENTS.md
- Which specific commands within `video.md` and `webinar.md` get inline notes (executor reads the files and places notes at the most relevant command headers)
- Whether the SKILL.md Behavioral Guide section is a paragraph, a link, or a short bulleted summary — whichever makes agents most likely to follow the link

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and Roadmap
- `.planning/REQUIREMENTS.md` — Full GUIDE-01, GUIDE-02, GUIDE-03 acceptance criteria; rule list with framing guidance; out-of-scope items
- `.planning/ROADMAP.md` §Phase 23 — Success criteria and depends-on chain

### Skills Package Files (read before editing)
- `packages/twentythree-skills/skills/SKILL.md` — Current structure; Behavioral Guide section must be inserted before the Resource Index table (around line 130)
- `packages/twentythree-skills/skills/reference/video.md` — Target for inline notes (thumbnails, analytics, admin links rules)
- `packages/twentythree-skills/skills/reference/webinar.md` — Target for inline notes (no-webinar-get rule already present in header; additional notes for creation defaults, admin links)

### Verification
- `packages/twentythree-skills/package.json` — Check `files` field to confirm `skills/` glob covers guide.md (walkDir installs all files under `skills/` — no changes needed, but confirm)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `webinar.md` already has one `> **Note:**` block at the top of the file (no-webinar-get rule). This is the established format for inline behavioral notes — follow the same pattern for new notes inside command sections.
- `video.md` uses `> **Chunked upload is automatic.**` callout — same blockquote format, slightly different styling (bold opener). New notes should use `> **Note:**` for consistency with webinar.md.

### Established Patterns
- All reference files use `> **Note:**` or `> **Warning:**` for callouts immediately after the command header line.
- `bin/add.js` uses `walkDir` — all files in `skills/` are installed automatically. No code changes needed for guide.md discovery.

### Integration Points
- `skills/SKILL.md` resource index table starts around line 130 — insert Behavioral Guide section before it.
- `npm pack --dry-run` file count assertion (Phase 24) expects 29 files once guide.md is added; Phase 23 doesn't touch CI, but executor should confirm guide.md is listed during smoke test.

</code_context>

<specifics>
## Specific Ideas

- The preview selected during discussion shows the exact two-section structure: correctness rules as a bulleted summary in the section intro, then `###` rule headings with explanation + bash example.
- "Verify first" approach: executor runs `--agent` commands at the top of the plan, reads JSON output to extract flag names, then uses verified names when writing guide.md rules.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 23-behavioral-guide-authoring*
*Context gathered: 2026-04-23*
