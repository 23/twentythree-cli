---
plan: 12-02
phase: 12-readmes-changelog
status: complete
completed: 2026-04-17
commit: 2c6dd89
---

## Summary

Wrote CHANGELOG.md at the repo root with entries for v1.1.0 and v1.0.0 in Keep a Changelog format.

## What Was Built

**CHANGELOG.md** (repo root):
- Header with Keep a Changelog and Semantic Versioning attribution links
- `## [Unreleased]` section
- `## [1.1.0] - 2026-04-16` with Added and Changed subsections covering endpoint audit, analytics commands, docs, READMEs, and package.json hygiene
- `## [1.0.0] - 2026-04-16` with Added subsection covering the full initial CLI release (219 commands, auth, upload engine, agent support, terminology mapping)
- Feature-level bullets throughout — not commit-level

## Key Files

- `CHANGELOG.md` — release history at repo root

## Self-Check: PASSED

- [x] CHANGELOG.md contains `# Changelog` as first heading
- [x] CHANGELOG.md contains Keep a Changelog link
- [x] CHANGELOG.md contains Semantic Versioning link
- [x] CHANGELOG.md contains `## [Unreleased]` section
- [x] CHANGELOG.md contains `## [1.1.0] - 2026-04-16`
- [x] CHANGELOG.md contains `## [1.0.0] - 2026-04-16`
- [x] v1.0 mentions "219" and "keyring" and "Chunked upload"
- [x] v1.1 mentions "endpoint coverage audit" and "prepack"
- [x] Feature-level bullets, no emojis
