# Phase 12: READMEs & CHANGELOG - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 12-readmes-changelog
**Areas discussed:** Root README scope, Command overview table

---

## Root README scope

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — npm + license | npm version badge + license badge only; no CI until Phase 13 workflow exists | ✓ |
| No badges | Plain prose, no badges | |
| Full set | npm + CI + license | |

**User's choice:** npm version + license badges only

---

| Option | Description | Selected |
|--------|-------------|----------|
| No — keep it lean | Entry point only; Contributing belongs elsewhere | ✓ |
| Brief dev setup | Small pnpm install + build + test section | |
| Full contributing section | Clone, install, test, PR process | |

**User's choice:** No contributing/dev setup section

---

| Option | Description | Selected |
|--------|-------------|----------|
| 3 steps only | install → auth credentials → video list, no sample output | ✓ |
| 3 steps + sample output | Same steps with sample table | |
| Link to guide only | Ultra-minimal, link to getting-started.md | |

**User's choice:** 3-step quickstart, no sample output

---

| Option | Description | Selected |
|--------|-------------|----------|
| Root README only | Terminology mapping table appears once, in root README | ✓ |
| Both READMEs | Duplicated in root + npm README | |
| Separate docs/ page | Move to docs/guides/terminology.md | |

**User's choice:** Root README only

---

## Command overview table

| Option | Description | Selected |
|--------|-------------|----------|
| All 25 entries | Match actual docs (24 topics + doctor); '22' was a pre-audit estimate | ✓ |
| 22 core topics only | Drop 3 topics to match roadmap number | |
| You decide | Claude picks count | |

**User's choice:** All 25 entries

---

| Option | Description | Selected |
|--------|-------------|----------|
| Topic + Description + Link | 3 columns, same as docs/commands/README.md | ✓ |
| Topic + Description only | No link column | |
| Topic + Description + Count + Link | 4 columns with command count | |

**User's choice:** 3-column table (Topic, Description, Link)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Relative paths | e.g. packages/twentythree-cli/docs/commands/video.md | ✓ |
| GitHub absolute URLs | Hardcoded https://github.com/... URLs | |

**User's choice:** Relative paths

---

## Claude's Discretion

- CHANGELOG format and depth (user selected not to discuss — delegated to Claude; Keep a Changelog format chosen)
- npm README length and content (user selected not to discuss — delegated to Claude)
- Badge image URLs
- Repo URL sourcing
- Whether to include a one-liner "What is TwentyThree?" above quickstart

## Deferred Ideas

- Contributing/development setup section → future CONTRIBUTING.md
- CI badge → Phase 13 (GitHub Actions workflow)
