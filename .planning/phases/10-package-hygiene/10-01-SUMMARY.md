---
phase: 10-package-hygiene
plan: "01"
subsystem: packaging
tags: [npm, package.json, metadata, publish]
dependency_graph:
  requires: []
  provides: [publish-ready-manifest]
  affects: [packages/twentythree-cli/package.json]
tech_stack:
  added: []
  patterns: [npm-files-whitelist, prepack-lifecycle]
key_files:
  created: []
  modified:
    - packages/twentythree-cli/package.json
decisions:
  - "prepack (not prepare or prepublishOnly) used for build lifecycle — fires on npm pack and npm publish, not on consumer install"
  - "repository URL uses github.com/23/twentythree-cli per plan spec; GitHub org URL confirmed in STATE.md as known input"
  - "/docs and /README.md added to files whitelist even though they don't exist yet — files array is forward-declared for Phase 11/12 output"
metrics:
  duration: "5 minutes"
  completed: "2026-04-16T15:51:35Z"
  tasks_completed: 2
  files_modified: 1
---

# Phase 10 Plan 01: Package Hygiene — npm Manifest Summary

**One-liner:** Added author, keywords, repository, bugs, homepage metadata fields, prepack lifecycle script, and /docs + /README.md files entries to make package.json publish-ready for Phase 13 npm publish.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add npm metadata fields, prepack script, and files entries | 369cd43 | packages/twentythree-cli/package.json |
| 2 | Verify tarball contents with npm pack --dry-run | (no commit — verification only) | — |

## Changes Made

### packages/twentythree-cli/package.json

**PKG-01 — Metadata fields added** (after `"license": "MIT"`):
- `"author": "TwentyThree"`
- `"keywords": ["twentythree", "video", "api", "cli"]`
- `"repository": { "type": "git", "url": "https://github.com/23/twentythree-cli.git" }`
- `"bugs": { "url": "https://github.com/23/twentythree-cli/issues" }`
- `"homepage": "https://github.com/23/twentythree-cli#readme"`

**PKG-02 — prepack script** added to scripts block after `postbuild`:
- `"prepack": "pnpm build"` — fires on `npm pack` and `npm publish`; does NOT fire on consumer `npm install`

**PKG-03 — files array** expanded from 3 to 5 entries:
- `/docs` and `/README.md` added alongside existing `/bin`, `/dist`, `/oclif.manifest.json`

**Unchanged:** version (`0.1.0`), build/postbuild scripts, oclif config, dependencies, devDependencies

## Verification Results

- `node -e "..."` automated check: ALL PASS (9/9 assertions)
- `npm pack --dry-run`: exits 0; prepack fired (full tsdown + oclif manifest build ran); tarball includes `dist/` (220+ files), `bin/`, `oclif.manifest.json`; total 266 files, 1.4 MB unpacked
- `pnpm --filter twentythree-cli test --run`: 151 passed, 0 failed

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan modifies only static JSON metadata. No runtime code or UI output introduced.

## Threat Flags

No new threat surface introduced. Changes are static JSON metadata only. The files whitelist correctly excludes `.planning/`, `.env`, and credential files.

## Self-Check: PASSED

- packages/twentythree-cli/package.json: FOUND (modified)
- Commit 369cd43: FOUND
