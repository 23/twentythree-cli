# Project Research Summary

**Project:** twentythree-cli — v1.4 milestone
**Domain:** npm package publishing (pnpm monorepo second package) + AI agent skill discoverability
**Researched:** 2026-04-20
**Confidence:** HIGH

## Executive Summary

v1.4 ships two independent deliverables: publishing `twentythree-skills` to npm so that `npx twentythree-skills add` works from any machine, and upgrading the resource index in `skills/SKILL.md` to use clickable markdown hyperlinks. Both are low-complexity changes against a package that is functionally complete — the work is configuration and content, not new code. The `bin/add.js` installer, the `files` whitelist, and the `bin` shebang are all already correct. The primary gap is that `release.yml` has never been extended to publish the skills package, and `package.json` is missing `publishConfig.access: "public"` and optimized npm keywords.

The recommended approach is a single workflow extension: add one `pnpm publish` step for `twentythree-skills` after the existing CLI step in `release.yml`, use a `skills-v*` tag prefix to allow independent release cadence, add `publishConfig` to the skills `package.json`, bump the version to `1.0.0` to signal production readiness, and update npm keywords to include runtime-specific terms (`claude`, `claude-code`, `copilot`, `cursor`, `codex`). The SKILL.md change is a mechanical find-and-replace across 22 table rows: plain-text topic names become `` [`topic`](reference/topic.md) `` hyperlinks using the format validated against Anthropic's own plugin examples.

The key risks are operational, not architectural. The `NPM_TOKEN` secret may be scoped to `twentythree-cli` only — verify with `npm publish --dry-run` before the first real publish. The `add` argument in `npx twentythree-skills add` is silently ignored by the bin script — simplify documented invocation to bare `npx twentythree-skills` or add explicit argv routing. Both issues are detectable before any production publish.

## Key Findings

### Recommended Stack

The skills package requires no new runtime dependencies. Publishing is handled by the existing `pnpm publish --no-git-checks` pattern already proven for `twentythree-cli`. The one addition worth making is `--provenance`, which attaches a Sigstore-signed attestation at zero cost and gives the npm package page a Provenance tab — a meaningful trust signal for a developer-tools package. This requires `id-token: write` permission on the GitHub Actions job.

**Core technologies:**
- `pnpm publish --no-git-checks --provenance`: publish command — matches existing CLI publish pattern; `--no-git-checks` required in monorepo CI; `--provenance` improves npm registry trust signal
- GitHub Actions `release.yml` (extended): CI trigger — single workflow, sequential steps; avoids `workflow_run` latency and permission complexity
- `publishConfig.access: "public"` in `package.json`: unscoped package publish guard — pnpm requires explicit public access declaration; prevents `403 Forbidden` on first publish

### Expected Features

**Must have (table stakes):**
- `npx twentythree-skills add` resolves from npm registry — the README documents this invocation; if the package is not published, the README is incorrect
- `publishConfig` and updated `keywords` ship with the first publish — cannot be patched retroactively without a re-publish
- SKILL.md resource index uses `` [`topic`](reference/topic.md) `` links for all 22 rows — primary deliverable of SKILL-03; improves Claude Code agent discoverability

**Should have (competitive):**
- Version bumped to `1.0.0` on first publish — signals production readiness alongside `twentythree-cli@1.x`
- `--provenance` flag on publish step — zero cost; npm registry Provenance tab improves package trust
- Post-install next-step hint in `bin/add.js` after `Done.` — reduces "did it work?" confusion for new users

**Defer (v2+):**
- npx version check warning if installed CLI is behind skills package version
- `--merge` flag for installer when user-customized skill files exist
- Workflow SKILL.md hyperlinks (reference index links are higher value; workflow links are additive)

### Architecture Approach

The correct architecture is a single `release.yml` publish job with two sequential `pnpm publish` steps — CLI first, skills second. Matrix jobs would prevent build artifact sharing and lose ordering guarantees. A separate triggered workflow adds `workflow_run` latency and tricky permission semantics. The skills package has no build step, so the second publish step is three lines of YAML. Tag strategy: use `skills-v*` prefix for skills-only releases and guard the existing `v*` job with `!startsWith(github.ref, 'refs/tags/skills-v')` to prevent double-publish.

**Major components:**
1. `.github/workflows/release.yml` — extended with `publish-skills` job gated on `skills-v*` tags; existing `publish` job guarded against skills tags
2. `packages/twentythree-skills/package.json` — add `publishConfig.access: "public"`, bump version to `1.0.0`, expand `keywords` array
3. `packages/twentythree-skills/skills/SKILL.md` — update 22 resource index rows from plain text to `` [`topic`](reference/topic.md) `` format

### Critical Pitfalls

1. **CI workflow never extended for skills** — the publish step for `twentythree-skills` does not exist in `release.yml`; without it the package is never published regardless of tag pushes; fix by adding an explicit `working-directory: packages/twentythree-skills` publish step
2. **NPM_TOKEN scope too narrow** — Granular Access Tokens can be restricted to specific packages; the token that works for `twentythree-cli` may 403 on `twentythree-skills`; verify with `npm publish --dry-run` before first real publish
3. **`add` argument silently ignored** — `npx twentythree-skills add` passes `add` as `process.argv[2]` which the bin script ignores; running `npx twentythree-skills remove` would silently install rather than uninstall; simplify documented invocation to bare `npx twentythree-skills` to match actual behavior
4. **Publish order dependency** — if skills publishes before CLI on a coordinated release, any `peerDependencies` or install instructions pointing to the new CLI version fail because it is not yet on the registry; always publish CLI first
5. **Workspace protocol leakage** — if `twentythree-skills/package.json` ever gains a `workspace:*` reference to `twentythree-cli` and the publish is done via `npm publish` instead of `pnpm publish`, the literal string `workspace:*` ships and makes the package uninstallable; the package must remain zero-dependency

## Implications for Roadmap

Based on research, v1.4 fits cleanly into two phases in dependency order.

### Phase 1: Package Configuration + CI Wiring
**Rationale:** The npm publish must be wired and verified before the skills content update is relevant to external users. Configuration changes are non-destructive and independently verifiable with `pnpm pack --dry-run`. This is the blocking dependency.
**Delivers:** `twentythree-skills@1.0.0` published to npm; `npx twentythree-skills add` works from any machine; `release.yml` extended with skills publish job using `skills-v*` tag strategy
**Addresses:** NPM-01 (table stakes publish), keywords update (bundle with publish), `publishConfig` addition
**Avoids:** CI workflow omission pitfall (P1), NPM_TOKEN scope pitfall (P2), publish order dependency, `add` argv confusion (P3)

### Phase 2: SKILL.md Hyperlink Upgrade
**Rationale:** Independent of publish wiring; can land before or after Phase 1 but benefits from publishing so the updated SKILL.md ships in the `1.0.0` release. 22 mechanical table row edits with no logic changes.
**Delivers:** All 22 resource index rows using `` [`topic`](reference/topic.md) `` format; improved Claude Code agent discoverability; human-clickable reference links in editors
**Addresses:** SKILL-03 feature; aligns with Anthropic's own SKILL.md plugin examples pattern
**Avoids:** Vague skill description pitfall; nested reference depth pitfall (one level deep is already the existing structure)

### Phase Ordering Rationale

- Phase 1 before Phase 2: the SKILL.md update is more valuable when the package is live on npm; coupling both into the `1.0.0` publish is the cleanest delivery
- Both phases are low-risk and independently deployable; if Phase 1 is blocked by token verification, Phase 2 can proceed in parallel
- The `1.0.0` version bump signals both phases are complete and the package is production-ready

### Research Flags

Phases with standard patterns (no additional research needed):
- **Phase 1:** pnpm monorepo publish is a well-documented pattern; the existing `twentythree-cli` publish workflow is the direct template; the only unknown is token scope (verify locally before tagging)
- **Phase 2:** markdown link format is confirmed against Anthropic's official plugin examples; no ambiguity in the target format

No phases require `/gsd-research-phase` intervention. All implementation decisions are resolved by this research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against existing `release.yml`, `package.json`, and `bin/add.js` source; npm provenance docs confirmed from training data |
| Features | HIGH | Official npm docs and Claude Code skills docs via Context7; codebase analysis of current output behavior |
| Architecture | HIGH | Verified against live `release.yml`; pnpm publish patterns confirmed from official pnpm docs; ESM bin pattern confirmed from Node.js docs |
| Pitfalls | HIGH | npm publish docs, Anthropic skill authoring docs, pnpm workspace protocol docs, and direct codebase inspection all HIGH confidence |

**Overall confidence:** HIGH

### Gaps to Address

- **NPM_TOKEN scope:** Cannot be verified until a dry-run publish is attempted. Verify with `npm publish --dry-run` from `packages/twentythree-skills` before pushing the first `skills-v*` tag. If the token is Granular and package-scoped, a new secret (`NPM_TOKEN_SKILLS`) or token upgrade to Automation type is needed.
- **`npx twentythree-skills add` invocation:** The `add` argument is currently a no-op. The decision to either simplify the documented invocation to bare `npx twentythree-skills` or add explicit argv routing should be made before publish, since the npm page README is the primary install documentation and it should not document a misleading invocation.
- **Smoke test for skills publish:** The existing smoke-test job only tests `twentythree-cli`. Adding `npx twentythree-skills` to the smoke-test job would catch registry propagation failures for the skills package on every release.

## Sources

### Primary (HIGH confidence)
- `packages/twentythree-skills/package.json` — current state of files, version, keywords, bin fields
- `packages/twentythree-skills/bin/add.js` — shebang, argv handling, output behavior
- `.github/workflows/release.yml` — existing CLI publish pattern
- Claude Code skills docs (code.claude.com/docs/en/skills) — how reference files are loaded; skill directory path prepending behavior
- Anthropic official SKILL.md plugin examples (github.com/anthropics/claude-code) — backtick-quoted path format; validated link format
- npm `package.json` docs (docs.npmjs.com/cli/v11/configuring-npm/package-json) — files, keywords, publishConfig, bin behavior
- pnpm publish docs (pnpm.io/cli/publish) — --no-git-checks, --access, working-directory behavior

### Secondary (MEDIUM confidence)
- npm provenance docs (docs.npmjs.com/generating-provenance-statements) — `--provenance` flag and `id-token: write` requirement; confirmed from training data, WebSearch unavailable
- GitHub Actions `id-token: write` for OIDC provenance — standard pattern confirmed from training data Aug 2025
- Agent Skills open standard (inference.sh/blog/skills/agent-skills-overview) — multi-runtime install paths

### Tertiary (LOW confidence)
- GitHub Copilot skills format — Copilot does not have a documented skill format equivalent to SKILL.md; installer's `~/.github/skills/` path is speculative; validate if Copilot officially ships a skills spec

---
*Research completed: 2026-04-20*
*Ready for roadmap: yes*
