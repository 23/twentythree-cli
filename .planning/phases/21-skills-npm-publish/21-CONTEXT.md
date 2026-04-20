# Phase 21: Skills npm Publish - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire `twentythree-skills` for npm publish: add `publishConfig`, runtime keywords, bare-npx invocation fix, and a `publish-skills` CI job in `release.yml` triggered by `skills-v*` tags.

Scope is limited to publish configuration and CI. No new installer features, no SKILL.md hyperlinks (Phase 22), no smoke-test job (future requirement).

</domain>

<decisions>
## Implementation Decisions

### npx Invocation Routing
- **D-01:** Keep bare-invocation-only behavior — `bin/add.js` always runs the installer regardless of arguments. No explicit arg routing, no help flag, no unknown-arg errors. `npx twentythree-skills` is the canonical form documented in README. `npx twentythree-skills add` continues to work silently (add is ignored).

### CI Job Structure
- **D-02:** `publish-skills` job runs: validate-skills test → dry-run (NPM_TOKEN check) → real publish. No post-publish smoke-test job in this phase (future requirement).
- **D-03:** Existing `publish` job gets guarded with `if: "!startsWith(github.ref, 'refs/tags/skills-v')"` so it only fires on `v*` tags, not `skills-v*` tags.
- **D-04:** `publish-skills` job fires only on `skills-v*` tags (separate trigger condition from the existing `v*` job).
- **D-05:** Use `pnpm publish --no-git-checks --provenance` for skills — matches CLI publish pattern; provenance adds Sigstore attestation at zero cost.
- **D-06:** Dry-run step uses `npm publish --dry-run` from `packages/twentythree-skills` — verifies NPM_TOKEN has publish access for this package. If dry-run fails, job fails and real publish is skipped.

### Version Bump
- **D-07:** Bump `packages/twentythree-skills/package.json` version from `0.1.0` → `1.0.0` in a manual commit before pushing the `skills-v1.0.0` tag. No CI version rewriting.

### package.json Config
- **D-08:** Add `"publishConfig": { "access": "public" }` to `packages/twentythree-skills/package.json`.
- **D-09:** Expand keywords array to include: `claude`, `claude-code`, `copilot`, `cursor`, `codex`, `ai-agent` (in addition to existing `ai`, `skills`, `twentythree`, `cli`, `agent`).

### Claude's Discretion
- Exact step names and `needs:` dependency ordering within the `publish-skills` job
- README wording for canonical invocation form (`npx twentythree-skills`)
- Whether `publish-skills` runs `pnpm install --frozen-lockfile` or can skip install (no build step, no deps)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Workflow
- `.github/workflows/release.yml` — Current CLI publish job structure; skills job must follow same registry-url and NODE_AUTH_TOKEN pattern

### Package to Publish
- `packages/twentythree-skills/package.json` — Current config; needs `publishConfig`, keyword expansion, and version bump
- `packages/twentythree-skills/bin/add.js` — Installer script; no changes needed beyond README documentation
- `packages/twentythree-skills/scripts/validate-skills.mjs` — Test script run by `pnpm test` in this package

### Prior Decisions
- `.planning/STATE.md` — Key Decisions table, specifically: tag strategy, provenance flag, NPM_TOKEN dry-run note, bare-npx decision

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.github/workflows/release.yml` — Existing `publish` job is the direct template for `publish-skills`; same `pnpm/action-setup`, `actions/setup-node` with `registry-url`, `pnpm install --frozen-lockfile` pattern
- `packages/twentythree-skills/scripts/validate-skills.mjs` — Already wired as `"test"` script in package.json; run with `pnpm --filter twentythree-skills test --run`

### Established Patterns
- Tag-guarded jobs: existing `release.yml` fires on `v*`; skills job fires on `skills-v*`; existing job gets a guard to prevent double-trigger
- `NODE_AUTH_TOKEN` env var pattern already established in publish step

### Integration Points
- `release.yml` gets a new top-level job (`publish-skills`) alongside existing `publish` and `smoke-test` jobs
- `packages/twentythree-skills/package.json` needs three edits: version, publishConfig, keywords

</code_context>

<specifics>
## Specific Ideas

- The `add` subcommand in `bin/add.js` filename is historical — the binary is `twentythree-skills`, not `twentythree-skills add`. README should make `npx twentythree-skills` the documented canonical form and not mention `add`.

</specifics>

<deferred>
## Deferred Ideas

- Post-publish smoke-test job for skills (verifies `npx twentythree-skills` resolves after publish) — explicitly listed as Future Requirement in REQUIREMENTS.md
- Installer post-success message with "start a new session" hint — Future Requirement
- Changesets integration — explicitly out of scope for v1.4

</deferred>

---

*Phase: 21-skills-npm-publish*
*Context gathered: 2026-04-20*
