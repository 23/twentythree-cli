# Phase 13: npm Publish - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Publish `twentythree-cli` to npm at version `1.0.0`, verify global install works end-to-end, and wire a GitHub Actions workflow that publishes on git tag push for all future releases.

New capabilities (AI skills package, OIDC trusted publishing, Homebrew distribution) are out of scope.

</domain>

<decisions>
## Implementation Decisions

### First Publish Approach

- **D-01:** CI-first approach — set up the GitHub Actions workflow, bump version to `1.0.0`, push a `v1.0.0` tag, and let CI handle the publish. No local `npm publish` from a dev machine. The first 1.0.0 publish flows through the same workflow as all future releases.

### GitHub Actions Workflow Scope

- **D-02:** Workflow steps: run test suite → build → `npm publish --access public` → smoke test (install from npm in a clean environment and verify `twentythree --version`). Most thorough path — the smoke test confirms the published tarball actually works.
- **D-03:** Trigger: tag push only — pattern `v*.*.*`. No manual dispatch, no workflow_dispatch. Clean separation between CI validation (PRs) and release (tags).

### Version Bump & Tagging Flow

- **D-04:** Use `npm version 1.0.0` to bump `package.json`, create the version commit, and create the local tag automatically. Then `git push && git push --tags`. Standard Node.js release flow — no custom script needed for the first release.
- **D-05:** Tag format: `v`-prefixed — `v1.0.0`. Workflow trigger pattern: `tags: ['v*']`.

### Version Number

- **D-06:** Publish at `1.0.0` — the `v1.0` milestone is internally complete. `package.json` currently shows `0.1.0`; bump to `1.0.0` as the first step.

### npm Authentication

- **D-07:** Classic npm automation token (not OIDC/provenance — deferred to v1.2). Token stored as `NPM_TOKEN` in GitHub repository secrets. Workflow injects it via `NODE_AUTH_TOKEN` in the npm publish step.

### Claude's Discretion

- GitHub Actions runner version and Node.js version to use in CI (match project's `engines.node >= 22`)
- Whether to add a `pnpm` setup step or use `npm ci` in the workflow
- Exact smoke test implementation (separate job, `npx --yes` to avoid cache, or a matrix step)
- Whether to include `npm view twentythree-cli` output in the smoke test job summary

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Package Configuration
- `packages/twentythree-cli/package.json` — current version (0.1.0), `files` array, `scripts.prepack`, engines field
- `.planning/REQUIREMENTS.md` §PUBLISH — PUBLISH-01, PUBLISH-02, PUBLISH-03 acceptance criteria

### No external specs referenced
Requirements fully captured in decisions above. OIDC documentation not needed — deferring to v1.2.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/twentythree-cli/package.json` `prepack` script — runs `pnpm build` automatically; CI workflow should invoke `npm publish` (which triggers prepack) rather than building separately
- `packages/twentythree-cli/scripts/audit-endpoints.mjs` — could optionally be added to pre-publish checks, but not required for Phase 13

### Established Patterns
- Monorepo layout: CLI package is at `packages/twentythree-cli/` — CI workflow must `cd` into this directory or use pnpm workspace filters
- No existing `.github/workflows/` directory — workflow file will be created fresh

### Integration Points
- `npm version 1.0.0` run from `packages/twentythree-cli/` to bump the package-level version
- Smoke test runs against the published npm package (not the local source) — requires `npm install -g twentythree-cli` after the npm registry propagates

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond what's captured in decisions — open to standard GitHub Actions npm publish patterns.

</specifics>

<deferred>
## Deferred Ideas

- OIDC trusted publishing (npm provenance) — explicitly deferred to v1.2 per prior planning decision
- `workflow_dispatch` trigger for manual re-publish — not chosen; tag push only

</deferred>

---

*Phase: 13-npm-publish*
*Context gathered: 2026-04-17*
