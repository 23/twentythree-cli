---
phase: 13-npm-publish
plan: 01
subsystem: infra
tags: [github-actions, npm-publish, pnpm, ci-cd, release-workflow]

# Dependency graph
requires: []
provides:
  - GitHub Actions release workflow triggering on v* tag push
  - Package version set to 1.0.0 ready for first npm publish
affects: [13-02-npm-publish]

# Tech tracking
tech-stack:
  added: [github-actions]
  patterns: [tag-triggered-release, two-job-publish-plus-smoke-test, scoped-npm-token]

key-files:
  created:
    - .github/workflows/release.yml
  modified:
    - packages/twentythree-cli/package.json

key-decisions:
  - "NODE_AUTH_TOKEN scoped to publish step only (not job-level) per T-13-01 threat mitigation"
  - "Two-job pattern: publish + smoke-test with needs dependency ensures smoke test uses clean runner"
  - "Registry propagation polling uses GITHUB_REF_NAME#v dynamic version strip — workflow reusable for all future releases"
  - "pnpm publish with --no-git-checks (detached HEAD in CI) and --access public (first publish of unscoped package)"
  - "registry-url in setup-node writes .npmrc auth entry — without it NODE_AUTH_TOKEN is silently ignored"

patterns-established:
  - "Pattern: registry-url must be set in setup-node for NODE_AUTH_TOKEN to work (critical npm CI pattern)"
  - "Pattern: smoke-test job polls npm view before install to handle CDN propagation delay"

requirements-completed:
  - PUBLISH-01
  - PUBLISH-03

# Metrics
duration: 5min
completed: 2026-04-17
---

# Phase 13 Plan 01: Release Workflow & Version Bump Summary

**Tag-triggered GitHub Actions workflow publishing twentythree-cli to npm at 1.0.0 with two-job publish + clean-environment smoke test**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-17T09:33:00Z
- **Completed:** 2026-04-17T09:38:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `.github/workflows/release.yml` with publish job (test → build → pnpm publish) and dependent smoke-test job
- All critical npm CI flags present: `registry-url`, `--no-git-checks`, `--access public`, `NODE_AUTH_TOKEN` scoped to publish step
- Smoke test uses `${GITHUB_REF_NAME#v}` for dynamic version polling — works for all future releases, not just 1.0.0
- Bumped `packages/twentythree-cli/package.json` version from `0.1.0` to `1.0.0`
- All 151 existing tests pass after version bump

## Task Commits

1. **Task 1: Create GitHub Actions release workflow** - `60bb515` (feat)
2. **Task 2: Bump package version to 1.0.0** - `ca83a82` (chore)

## Files Created/Modified

- `.github/workflows/release.yml` - Tag-triggered release workflow with publish + smoke-test jobs
- `packages/twentythree-cli/package.json` - Version bumped from 0.1.0 to 1.0.0

## Decisions Made

- `NODE_AUTH_TOKEN` env var scoped to the publish step only (not job-level) — per threat model T-13-01, avoids token appearing in other step logs
- Dynamic `${GITHUB_REF_NAME#v}` version in smoke test polling loop makes workflow reusable for all future releases without editing the YAML
- Explicit `pnpm run build` step in CI rather than relying on `prepack` lifecycle — more readable and debuggable in CI logs
- Version directly edited in package.json (not via `npm version` command) — `npm version` creates a commit and tag which would conflict with the GSD commit flow; developer will create the version tag in Plan 02

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**External services require manual configuration before the workflow can succeed:**

1. **npm automation token** — Log into npmjs.com → Access Tokens → Generate New Token → type "Automation". Copy the token value.
2. **GitHub repository secret** — Go to repository Settings → Secrets and variables → Actions → New repository secret. Name: `NPM_TOKEN`. Value: the automation token from step 1.

This must be done before pushing the `v1.0.0` tag. The workflow will fail with `ENEEDAUTH` if the secret is missing.

## Next Phase Readiness

- Workflow file is committed and ready to trigger on tag push
- Package is at version 1.0.0
- Plan 02 covers: creating and pushing the `v1.0.0` tag, then monitoring the workflow run and verifying the published package

---
*Phase: 13-npm-publish*
*Completed: 2026-04-17*

## Self-Check: PASSED

- FOUND: `.github/workflows/release.yml`
- FOUND: `packages/twentythree-cli/package.json`
- FOUND: `13-01-SUMMARY.md`
- FOUND commit: `60bb515` (feat(13-01): add GitHub Actions release workflow)
- FOUND commit: `ca83a82` (chore(13-01): bump package version to 1.0.0)
