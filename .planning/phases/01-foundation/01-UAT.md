---
status: complete
phase: 01-foundation
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md
started: 2026-04-14T09:10:00Z
updated: 2026-04-14T09:16:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: From a clean build: run `pnpm --filter twentythree-cli build` to produce fresh dist output, then run `node packages/twentythree-cli/bin/run.js --version`. Build completes without errors. The CLI outputs a version string like `twentythree-cli/0.1.0 darwin-arm64 node-v22.x.x` and exits 0.
result: pass

### 2. CLI Version Output
expected: Running `node packages/twentythree-cli/bin/run.js --version` outputs a version string in the format `twentythree-cli/0.1.0 darwin-arm64 node-v22.x.x` and exits with code 0.
result: pass

### 3. Node Version Guard
expected: Simulating old Node by running `node -e "process.versions.node = '18.0.0'" packages/twentythree-cli/bin/run.js` or by temporarily editing the guard threshold — the CLI prints an error message to stderr saying Node 22 or later is required, shows the current version, and exits with a non-zero code. No oclif output appears.
result: pass

### 4. OpenAPI Types Regeneration
expected: Running `pnpm generate-types` from the repo root completes without error and overwrites `packages/twentythree-cli/src/api/types.ts`. The file exists and is non-empty (should be ~35,000+ lines). Running `pnpm --filter twentythree-cli build` after regeneration still exits 0.
result: pass

### 5. Test Suite — 19 Tests Pass
expected: Running `pnpm --filter twentythree-cli test` outputs 19 passing tests (14 term-map + 5 node-check) and exits 0. No failures or errors.
result: issue
reported: "1 failed: applyCliTerms > replaces all legacy terms in a string — photo_id not replaced with video_id. Expected 'video_id refers to a video in an category', received 'photo_id refers to a video in an category'"
severity: major
fixed: true
fix_commit: 46d9bf1

## Summary

total: 5
passed: 4
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "applyCliTerms replaces all legacy API terms in a string, including underscore-prefixed forms like photo_id → video_id"
  status: fixed
  reason: "User reported: 1 failed: applyCliTerms > replaces all legacy terms in a string — photo_id not replaced with video_id."
  severity: major
  test: 5
  root_cause: "\\b treats _ as \\w so photo_id had no word boundary after photo. WR-03 code review fix used \\bphoto\\b which blocks underscore-separated identifiers."
  artifacts:
    - path: "packages/twentythree-cli/src/lib/term-map.ts"
      issue: "RegExp used \\b word boundaries; fixed to (?<![a-zA-Z])term(?![a-zA-Z])"
  missing: []
  fix_commit: 46d9bf1
