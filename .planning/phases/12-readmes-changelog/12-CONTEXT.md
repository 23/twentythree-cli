# Phase 12: READMEs & CHANGELOG - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Write three documents:
1. `README.md` at repo root — the project entry point for anyone arriving via GitHub
2. `packages/twentythree-cli/README.md` — the npm page README (overwriting the oclif-generated stub)
3. `CHANGELOG.md` at repo root — release history for v1.0 and v1.1

Phase 11 owns `docs/`. Phase 13 owns publishing. This phase bridges them: after Phase 12, anyone arriving at the repo or npm page knows how to install, authenticate, and use the CLI within two minutes.

</domain>

<decisions>
## Implementation Decisions

### Root README Structure (D-01–D-04)

- **D-01:** Include npm version badge + license badge. No CI badge — the GitHub Actions workflow doesn't exist until Phase 13. The two badges signal the project is real and findable on npm without depending on infrastructure that isn't built yet.
- **D-02:** No Contributing / Development setup section. Root README is an entry point only: install, auth quickstart, command table, link to docs/. Contributing content belongs in a future CONTRIBUTING.md.
- **D-03:** 3-step quickstart only — `npm install -g twentythree-cli`, `twentythree auth credentials`, `twentythree video list`. No sample output. Terser than the getting-started guide; readers who want output can follow the link to `docs/guides/getting-started.md`.
- **D-04:** Terminology mapping table lives in the root README only. It's project-level context that fits naturally alongside the command overview. Not duplicated in the npm README.

### Command Overview Table (D-05–D-07)

- **D-05:** Use all 25 entries — 24 topics + `doctor`. The "22 topics" in the roadmap was a pre-endpoint-audit estimate. The actual generated docs have 24 topics + `doctor` as a standalone command, and the table should match `docs/commands/README.md` exactly.
- **D-06:** 3-column table: `Topic`, `Description`, `Reference` — same structure as `docs/commands/README.md`. Consistent and scannable.
- **D-07:** Links use relative paths (e.g., `packages/twentythree-cli/docs/commands/video.md`). Works when browsing on GitHub and locally. No hardcoded GitHub URLs to maintain.

### npm Package README (D-08)

- **D-08:** Overwrite `packages/twentythree-cli/README.md` with the npm-facing README. Content: install command, 3-step quickstart (same 3 commands as root README), link to full docs on GitHub at the repo URL. Keep it shorter than root README — no command table, no terminology mapping, no badges.

### CHANGELOG (D-09)

- **D-09:** Claude's discretion on format and depth. Use [Keep a Changelog](https://keepachangelog.com) format. v1.0 entry covers the initial CLI release (auth, commands, API coverage). v1.1 entry covers the repository polish work (endpoint audit, package hygiene, documentation, README/CHANGELOG). Feature-level bullets, not commit-level.

### Claude's Discretion

- Exact badge image URLs (shields.io is standard)
- Repo URL to use in npm README links (read from package.json `repository` field or infer from git remote)
- CHANGELOG entry depth (feature-level bullets per the D-09 guidance)
- Whether root README includes a brief "What is TwentyThree?" one-liner above the quickstart

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §README — README-01, README-02, README-03 define acceptance criteria
- `.planning/ROADMAP.md` §Phase 12 — success criteria and phase goal

### Phase 11 Output (docs/ now exists)
- `packages/twentythree-cli/docs/commands/README.md` — 25-entry command table (24 topics + doctor) — root README mirrors this structure
- `packages/twentythree-cli/docs/guides/getting-started.md` — root README links here for full quickstart
- `packages/twentythree-cli/docs/guides/api-spec-upgrade.md` — root README links here for contributor workflow

### Project Context
- `.planning/PROJECT.md` — tech stack, terminology mapping, core value statement
- `packages/twentythree-cli/package.json` — version (0.1.0), name (twentythree-cli), repository URL

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/twentythree-cli/README.md` — currently an oclif-generated stub; will be fully overwritten in this phase
- `docs/commands/README.md` — 25-entry GFM table (Topic/Description/Reference); root README mirrors this exactly (D-05, D-06, D-07)

### Established Patterns
- Space-separated command syntax: `twentythree video list` (not `twentythree video:list`) — established in Phase 11 getting-started guide
- No emojis, ATX headings, blank line between block elements — established throughout Phase 11 docs
- Concise tone with brief context sentences — established in Phase 11 D-07

### Integration Points
- Root `README.md` links to `packages/twentythree-cli/docs/` via relative paths
- npm README links to full docs on GitHub (absolute URL needed here since npm renders the page externally)
- `CHANGELOG.md` at repo root — new file, no existing content

</code_context>

<specifics>
## Specific Ideas

- The oclif-generated `packages/twentythree-cli/README.md` currently has a `<!-- commands -->` block with all 244 commands listed inline. This is not useful as an npm page — it makes the page enormous. Phase 12 replaces it with a short, focused npm README.
- Terminology mapping table: API uses `photo`→`video`, `album`→`category`, `live`→`webinar`. This is in PROJECT.md and should appear in root README as a 2-column table (API term → CLI term) to orient contributors.

</specifics>

<deferred>
## Deferred Ideas

- Contributing/development setup section — future CONTRIBUTING.md
- CI badge — Phase 13 creates the GitHub Actions workflow
- Full changelog history beyond v1.0/v1.1 — out of scope for this phase

</deferred>

---

*Phase: 12-readmes-changelog*
*Context gathered: 2026-04-16*
