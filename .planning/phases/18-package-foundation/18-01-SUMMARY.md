---
phase: 18-package-foundation
plan: "01"
subsystem: twentythree-skills
tags: [package-scaffold, esm, turbo, validation, skills]
dependency_graph:
  requires: []
  provides: [twentythree-skills-scaffold, validate-skills-script, skills-SKILL.md]
  affects: [Phase 19 reference files, Phase 20 runtime installer]
tech_stack:
  added: []
  patterns: [ESM-only package, Turborepo no-build override, pure-Node validator script, git mv history preservation]
key_files:
  created:
    - packages/twentythree-skills/turbo.json
    - packages/twentythree-skills/bin/add.js
    - packages/twentythree-skills/scripts/validate-skills.mjs
    - packages/twentythree-skills/skills/SKILL.md (renamed from package root via git mv)
  modified:
    - packages/twentythree-skills/package.json
decisions:
  - "type=module (ESM) for twentythree-skills — no CJS needed; static markdown + tiny bin script"
  - "turbo.json extends:['//'] with dependsOn:[] — excludes skills package from CLI build pipeline"
  - "validate-skills.mjs uses soft Gate 2 for reference/ — avoids failures in Phase 18/19 intermediate state"
  - "git mv used for SKILL.md relocation — preserves history, 2 commits visible via --follow"
metrics:
  duration: "~4 minutes"
  completed: "2026-04-20"
  tasks_completed: 2
  files_created: 4
  files_modified: 1
---

# Phase 18 Plan 01: Package Foundation Summary

**One-liner:** ESM package manifest, turbo no-build override, executable bin stub, and two-gate Node.js CI validator — `twentythree-skills` fully wired as a publishable npm package.

## What Was Built

### Final package.json Shape

The existing 10-line stub was extended to a 32-line publishable ESM manifest:
- `"type": "module"` — pure ESM, no CJS interop required (static markdown + small bin script)
- `"bin": {"twentythree-skills": "./bin/add.js"}` — wires the CLI entry for `npx twentythree-skills add`
- `"engines": {"node": ">=22.0.0"}` — matches CLI package constraint
- `"files": ["/bin", "/skills", "/README.md"]` — whitelist approach, no SKILL.md at package root
- `"scripts": {"test": "node scripts/validate-skills.mjs"}` — no build script, test is the validator
- Full metadata: author, repository, bugs, homepage, keywords — copied from CLI package
- Fields intentionally omitted: `main`, `dependencies`, `devDependencies`, `build`, `prepack`, `oclif`

### Turborepo No-Build Override

`packages/twentythree-skills/turbo.json` uses `"extends": ["//"]` to inherit the root pipeline and override only two tasks:

```json
{
  "extends": ["//"],
  "tasks": {
    "build": { "dependsOn": [], "inputs": ["skills/**/*.md"], "outputs": [] },
    "test":  { "dependsOn": [], "inputs": ["skills/**/*.md", "scripts/validate-skills.mjs"] }
  }
}
```

The `"dependsOn": []` on both tasks removes the root inheritance of `"^build"` (build waits for deps) and `"dependsOn": ["build"]` (test waits for build). Running `pnpm build` from the repo root emits zero `twentythree-skills:build` lines — the package is fully excluded from the compilation pipeline.

### validate-skills.mjs Two-Gate Design

The pure-Node ESM validator implements two gates to handle the Phase 18 intermediate state:

**Gate 1 (strict) — skills/SKILL.md frontmatter:**
- Hard fail if `skills/SKILL.md` is missing
- Hard fail if frontmatter block (YAML `---` fences) is missing
- Hard fail if `name:` key is missing or empty
- Hard fail if `description:` key is missing
- Handles YAML block scalars (`|`, `>`, `|-`, `>-`) correctly — marks as non-empty

**Gate 2 (soft) — skills/reference/ directory:**
- If `skills/reference/` is absent: print warning and exit 0 (Phase 19 creates it)
- If `skills/reference/` exists: all 22 resource group files (`action.md`, ..., `webinar.md`) must be present — hard fail if any missing

This design means `pnpm --filter twentythree-skills test` exits 0 in Phase 18 state, and will automatically enforce completeness once Phase 19 creates the reference files.

The 22 resource groups are defined as a `RESOURCE_GROUPS` constant in the script matching the canonical list from REQUIREMENTS.md SKILL-02:
`action, analytics, app, audience, category, collector, comment, openupload, player, poll, presentation, protection, session, setting, site, spot, tag, thumbnail, user, video, webhook, webinar`

### git mv and History Preservation

The placeholder `SKILL.md` was moved from the package root to `skills/SKILL.md` using:

```bash
mkdir -p packages/twentythree-skills/skills
git mv packages/twentythree-skills/SKILL.md packages/twentythree-skills/skills/SKILL.md
```

`git log --follow --oneline packages/twentythree-skills/skills/SKILL.md` returns 2 commits — the original creation commit is visible through the rename. File content is byte-for-byte identical; plan 02 rewrites the body.

## Verification Results

All 7 plan verification steps passed:

1. `manifest: module ./bin/add.js >=22.0.0` — package.json fields correct
2. `"extends": ["//"]` and two `"dependsOn": []` entries in turbo.json
3. `node packages/twentythree-skills/bin/add.js` exits 1
4. `pnpm --filter twentythree-skills test` exits 0, prints `validate-skills: OK (SKILL.md frontmatter valid, 1 warning)`
5. `npm pack --dry-run` includes `bin/add.js` and `skills/SKILL.md`
6. `pnpm build | grep twentythree-skills:build | wc -l` = 0
7. `git log --follow` returns 2 commits (history preserved)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- `packages/twentythree-skills/bin/add.js` — bin stub exits 1 with "not yet implemented" message. This is intentional per plan; Phase 20 adds runtime logic.
- `packages/twentythree-skills/skills/SKILL.md` — placeholder content from original stub. Plan 02 rewrites the body.

## Self-Check: PASSED

All files confirmed present on disk. Both task commits verified in git history.

| Check | Result |
|-------|--------|
| packages/twentythree-skills/package.json | FOUND |
| packages/twentythree-skills/turbo.json | FOUND |
| packages/twentythree-skills/bin/add.js | FOUND |
| packages/twentythree-skills/scripts/validate-skills.mjs | FOUND |
| packages/twentythree-skills/skills/SKILL.md | FOUND |
| packages/twentythree-skills/SKILL.md (absent) | CONFIRMED |
| Commit a5288fa (Task 1) | FOUND |
| Commit 7fc1cf1 (Task 2) | FOUND |
