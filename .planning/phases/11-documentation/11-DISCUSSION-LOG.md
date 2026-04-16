# Phase 11: Documentation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 11-documentation
**Areas discussed:** Command reference depth, Getting started guide style, api-spec-upgrade guide audience, docs/ location

---

## Command Reference Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Depth 2 as specced | analytics:video gets its own page grouping all children | ✓ |
| Depth 1 | One page per top-level topic — analytics.md very long | |
| Depth 3 (fully expanded) | Every sub-topic its own page — 50+ files for analytics | |

**User's choice:** Depth 2 as specced
**Notes:** Matches requirements exactly.

---

## Command Reference Index Page

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, write an index | Handwritten docs/commands/README.md listing all 22 topics | ✓ |
| Generated files only | Skip index, users navigate directly to topic files | |

**User's choice:** Yes, write an index
**Notes:** One-time effort, lasting value.

---

## Getting Started — First Command

| Option | Description | Selected |
|--------|-------------|----------|
| video list | Lists videos in workspace — demonstrates core purpose | ✓ |
| site get | Returns workspace info — simpler smoke test | |
| doctor | Health check — verifies setup but not API surface | |

**User's choice:** video list

---

## Getting Started — Show Output?

| Option | Description | Selected |
|--------|-------------|----------|
| Show example output | Include sample table for each command shown | ✓ |
| Commands only | Just steps and flags, reader sees output themselves | |

**User's choice:** Show example output

---

## Getting Started — Tone and Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Concise with brief explanations | 1-2 sentences context per step then command | ✓ |
| Copy-paste only | Just numbered steps and commands, zero prose | |
| Detailed walkthrough | Full explanation of what each step does | |

**User's choice:** Concise with brief explanations

---

## api-spec-upgrade Guide — Audience

| Option | Description | Selected |
|--------|-------------|----------|
| Contributors with Claude Code | Full workflow: run → diff → paste into Claude → fix → verify → commit | ✓ |
| Any contributor | Mechanical steps only, no Claude-specific guidance | |
| End users | Explains when to update and what it means | |

**User's choice:** Contributors with Claude Code

---

## api-spec-upgrade Guide — Duplication vs Reference

| Option | Description | Selected |
|--------|-------------|----------|
| Standalone guide | Self-contained in docs/guides/, CLAUDE.md stays agent-focused | ✓ |
| Reference CLAUDE.md | Point docs/guides/ at CLAUDE.md, avoid duplication | |

**User's choice:** Standalone guide
**Notes:** CLAUDE.md is terse/agent-optimized; this guide is for humans.

---

## docs/ Location

| Option | Description | Selected |
|--------|-------------|----------|
| Package only | All docs at packages/twentythree-cli/docs/ | ✓ |
| Symlink from root | docs/ at repo root symlinked to package docs | |
| Copy to both | Generate at package level, copy to root too | |

**User's choice:** Package only
**Notes:** Phase 10 already put /docs in the package's files array. Root README links via relative paths.

---

## Claude's Discretion

- File names and heading structure for guides
- Whether to include a prerequisites section
- Exact placeholder values in example output
- Whether to add "Next steps" footer linking to command reference

## Deferred Ideas

- docs/guides/contributing.md — deferred to v1.2 per REQUIREMENTS.md
- Hosted docs site — out of scope per REQUIREMENTS.md
- docs/guides/ for OAuth/authentication deep-dive — post-v1.1
