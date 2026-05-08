---
quick_id: 260508-dnq
slug: release-v1-3-3-docs-skill-update-version
date: 2026-05-08
duration: ~5m
tasks_completed: 4
files_changed: 167
tags: [release, docs, versioning, git-tags]
key_decisions:
  - Used oclif readme generator (not manual authoring) — updated all 164 existing docs to v1.3.3 and added 8 new doc files
  - Staged all docs/ changes in Task 1 commit since the oclif generator touches the whole tree
---

# Quick Task 260508-dnq: Release v1.3.3 Summary

One-liner: Bumped CLI and skills packages to v1.3.3, regenerated oclif docs to include auth switch command, updated SKILL.md, and created local release tags.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Regenerate oclif command docs for auth switch | ccdf6b3 | 164 modified + 8 new docs files |
| 2 | Update SKILL.md auth row to include switch | 2a0f98f | packages/twentythree-skills/skills/SKILL.md |
| 3 | Bump both package.json versions to 1.3.3 | 7d682c2 | packages/twentythree-cli/package.json, packages/twentythree-skills/package.json |
| 4 | Run tests and create git tags | (tags only) | git tags: v1.3.3, skills-v1.3.3 |

## Verification

- CLI tests: 167 passed, 18 test files passed (42 total with skipped)
- Skills tests: validate-skills OK
- `docs/commands/auth/switch.md` exists with correct v1.3.3 source link
- `docs/commands/auth.md` includes switch in TOC and body
- SKILL.md auth row: `credentials`, `status`, `switch`
- Both package.json files at 1.3.3
- `git tag | grep 1.3.3` returns: `skills-v1.3.3`, `v1.3.3`

## Deviations from Plan

### Scope expansion — oclif readme generator side effect

The oclif readme generator updated all 164 existing docs files (version references from v0.1.0 to v1.3.3) and created 8 additional new doc files beyond just auth/switch.md:

- `docs/commands/app/list.md` (new)
- `docs/commands/app/remove-thumbnail.md` (new)
- `docs/commands/app/set-thumbnail.md` (new)
- `docs/commands/auth/switch.md` (new — primary goal)
- `docs/commands/autocomplete.md` (new)
- `docs/commands/player/remove-thumbnail.md` (new)
- `docs/commands/player/set-thumbnail.md` (new)
- `docs/commands/thumbnail/preview-scss.md` (new)

All changes are correct and expected behavior of the generator. All were included in the Task 1 commit.

## Tags Created (not pushed)

- `v1.3.3` — CLI package release
- `skills-v1.3.3` — Skills package release

Tags are local only. Orchestrator will confirm push with user.

## Self-Check: PASSED

- docs/commands/auth/switch.md: FOUND
- docs/commands/auth.md contains "auth switch": FOUND
- SKILL.md contains "switch" in auth row: FOUND
- CLI package.json at 1.3.3: FOUND
- Skills package.json at 1.3.3: FOUND
- Commits ccdf6b3, 2a0f98f, 7d682c2: FOUND
- Tags v1.3.3 and skills-v1.3.3: FOUND
