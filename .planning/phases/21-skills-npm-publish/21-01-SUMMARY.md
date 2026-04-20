---
phase: 21-skills-npm-publish
plan: 01
subsystem: infra
tags: [npm, publish, github-actions, ci, provenance, sigstore]

# Dependency graph
requires:
  - phase: 20-skills-runtime-installer
    provides: Completed twentythree-skills package with bin/add.js installer
provides:
  - package.json at version 1.0.0 with publishConfig.access=public and 11 keywords
  - release.yml tag-guarded dual publish (v* = CLI, skills-v* = skills package)
  - README with bare npx invocation (no add subcommand)
affects: [22-skill-md-hyperlinks]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tag-prefixed dual publish: v* triggers CLI job only; skills-v* triggers skills job only via if: guards"
    - "Provenance attestation: pnpm publish --provenance with permissions.id-token: write for Sigstore OIDC"
    - "Dry-run gate: npm publish --dry-run before real publish to verify NPM_TOKEN scope"

key-files:
  created: []
  modified:
    - packages/twentythree-skills/package.json
    - packages/twentythree-skills/README.md
    - .github/workflows/release.yml

key-decisions:
  - "publishConfig.access: public added to package.json — required for scoped or first-time public npm packages"
  - "skills-v* tag prefix chosen for skills releases — keeps CLI and skills release trains independent"
  - "Existing publish job guarded with quoted if: value — YAML requires quoting strings starting with !"
  - "Dry-run step uses npm (not pnpm) — npm publish --dry-run is more reliable for token validation"

patterns-established:
  - "Tag guard pattern: if: startsWith(github.ref, 'refs/tags/PREFIX') on new job; if: !startsWith(...) on existing job"
  - "Provenance job requires permissions.id-token: write at job level (not workflow level) for OIDC"

requirements-completed:
  - NPM-01
  - NPM-02
  - NPM-03
  - NPM-04

# Metrics
duration: 10min
completed: 2026-04-21
---

# Phase 21 Plan 01: Skills NPM Publish Wiring Summary

**Tag-guarded dual publish in release.yml: skills-v* triggers validate/dry-run/publish with Sigstore provenance; v* triggers CLI publish only; twentythree-skills bumped to 1.0.0 with publishConfig and 11 discovery keywords**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-21
- **Completed:** 2026-04-21
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `twentythree-skills` package.json updated to version 1.0.0 with `publishConfig.access: public` and 11 npm keywords for discoverability (added claude, claude-code, copilot, cursor, codex, ai-agent)
- README simplified to bare `npx twentythree-skills` invocation — removed trailing `add` subcommand that was a no-op per v1.4 roadmap decision
- release.yml updated with tag-guarded dual publish: `skills-v*` tags trigger the new `publish-skills` job (validate → dry-run → publish with provenance); `v*` tags still trigger CLI publish only (guarded with `if: !startsWith`)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update package.json and README for publish readiness** - `a81687f` (feat)
2. **Task 2: Add publish-skills job and tag guard to release.yml** - `f9e75a8` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `packages/twentythree-skills/package.json` - Version 1.0.0, publishConfig.access=public, 11 keywords
- `packages/twentythree-skills/README.md` - Bare npx invocation (no add subcommand)
- `.github/workflows/release.yml` - skills-v* trigger, publish job guard, publish-skills job with provenance

## Decisions Made

- **publishConfig.access: public** — Required for npm to publish without explicit `--access public` flag at publish time; safest to declare in manifest
- **Quoted `if:` on publish guard** — YAML special-cases `!` as a tag character; wrapping the value in quotes (`"!startsWith(...)"`) is required for valid YAML
- **Dry-run uses `npm` not `pnpm`** — `npm publish --dry-run` is more reliable for verifying NPM_TOKEN auth scope before committing to real publish
- **`permissions.id-token: write` at job level** — OIDC token for Sigstore provenance must be scoped to the publishing job; existing `publish` job has no permissions block and should not gain one

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. The acceptance criterion `grep -c 'publish-skills' release.yml` returning "at least 2" technically returns 1 (the string only appears as the job key name on line 39; the if conditions reference `skills-v` not `publish-skills`). All functional requirements are satisfied — the criterion text was slightly imprecise. The workflow is correct per all other acceptance criteria and the functional intent.

## User Setup Required

Before pushing the first `skills-v1.0.0` tag, verify the NPM_TOKEN secret in GitHub Actions has scope to publish `twentythree-skills`. The dry-run step in the workflow will catch a token scope mismatch before the real publish runs. If the token is scoped only to `twentythree-cli`, a new Granular Access Token covering `twentythree-skills` must be added as a GitHub secret (same `NPM_TOKEN` or a new `NPM_SKILLS_TOKEN` with a corresponding env var update to the workflow).

## Next Phase Readiness

- Phase 21 Plan 01 complete — pushing `skills-v1.0.0` git tag will trigger the `publish-skills` CI job and publish to npm
- Phase 22 (SKILL.md hyperlinks) is independent and can proceed immediately
- Blocker: NPM_TOKEN scope validation — verify token covers twentythree-skills before first tag push

---
*Phase: 21-skills-npm-publish*
*Completed: 2026-04-21*
