---
plan: 13-02
phase: 13-npm-publish
status: complete
started: 2026-04-17
completed: 2026-04-17
key-files:
  created: []
  modified: []
decisions: []
deviations: []
---

## Summary

Published `twentythree-cli@1.0.0` to npm via the GitHub Actions release workflow created in Plan 01.

## What Was Done

**Task 1 — NPM_TOKEN secret:** Developer created an npm automation token on npmjs.com and added it as `NPM_TOKEN` in GitHub repository secrets (Settings → Secrets and variables → Actions).

**Task 2 — Tag push and CI publish:** Developer ran `git tag v1.0.0 && git push origin v1.0.0` to trigger the Release workflow. Two intermediate issues were resolved:
- `pnpm/action-setup@v4` conflicted with `packageManager` field in `package.json` — fixed by removing explicit `version: 10` from the workflow (version is read from `packageManager` automatically).
- A stale test assertion (`baseUrl` missing `/api/2/`) was uncommitted on disk — committed and re-tagged.

Both `publish` and `smoke-test` jobs completed successfully on final push.

**Task 3 — Local verification:** Developer ran `npm install -g twentythree-cli`, `twentythree --version`, and `twentythree --help` in a fresh terminal. All three succeeded.

## Verification

- `npm view twentythree-cli version` → `1.0.0`
- GitHub Actions `publish` job: green
- GitHub Actions `smoke-test` job: green  
- Local `npm install -g twentythree-cli` + `twentythree --version` + `twentythree --help`: all pass

## Self-Check: PASSED
