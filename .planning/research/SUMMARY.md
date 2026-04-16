# Research Summary: v1.1 Repository Polish & Release

**Project:** twentythree-cli
**Domain:** CLI npm publishing, documentation generation, endpoint coverage audit
**Researched:** 2026-04-16
**Confidence:** HIGH

---

## Executive Summary

The v1.1 milestone is a release-readiness milestone, not a feature milestone. The CLI is functionally complete at 219 commands covering 235 API endpoints. The work is: verify coverage, document the tool, and ship it to npm for the first time. The existing codebase and toolchain already contain most of what is needed — the new work is configuration, scripting, and authoring, not new dependencies or architecture.

The recommended approach is strictly sequenced: run the endpoint audit first, fill any confirmed gaps, then generate docs from the updated manifest, write the human-facing READMEs, then publish. Every step has a hard dependency on the previous step. The single new devDependency needed is `tsx` (for running the audit script as TypeScript), but the audit script can equally be written as plain `.mjs` to avoid even that addition.

The primary risks are publish-irreversible mistakes: publishing the wrong version number (`0.1.0` vs `1.0.0`), publishing before the package name `twentythree-cli` is confirmed available on npm, or shipping a stale `oclif.manifest.json` because `prepack` is not wired. All three are cheap to prevent but expensive to fix post-publish.

---

## Stack Additions

Only one new devDependency is needed, and it is optional:

| Package | Version | Decision |
|---------|---------|----------|
| `tsx` | `^4.21.0` | Optional — if audit script is written as `.mjs`, tsx is not needed |

Everything else is already installed: `oclif` at `^4.23.0` (bundles `oclif readme --multi`), `@changesets/cli` at `^2.30.0`, `typescript`, `tsdown`, `vitest`.

**Explicitly rejected:** `typedoc`, `docsify`/`vitepress`, `semantic-release`, `.npmignore`.

**npm auth note:** npm Classic Tokens were permanently revoked December 9, 2025. The first publish must be manual (`npm publish --access public`). Subsequent CI publishes can use OIDC with `id-token: write` — but OIDC requires the package to exist on the registry first, so first publish is always manual.

---

## Key Findings

1. **25 swagger endpoints have no matching command** — all in analytics timeseries/totals sub-paths and `/photo/` token endpoints. May be intentional consolidations. Must be classified before docs are generated.

2. **Terminology mismatch will break a naive audit script** — spec uses `/photo/`, `/album/`, `/live/`; CLI uses `video`, `category`, `webinar`. File-path comparison gives ~46% false negatives. The correct comparison uses `agentMetadata.api_endpoint` values (already use legacy paths).

3. **`oclif readme --multi` generates all 22+ topic docs from the manifest in one command** — run with `--nested-topics-depth 2 --output-dir docs/commands`. Zero hand-writing for the command reference.

4. **`prepack` script is missing** — `pnpm publish` fires `prepack`, not `postbuild`. Without it, whatever manifest is on disk ships. Add `"prepack": "npm run build"` before any publish attempt.

5. **The first publish cannot use OIDC trusted publishing** — OIDC requires the npm package page to exist before the trusted publisher relationship can be configured. Plan for a manual first publish.

6. **No README exists at either the package root or repo root** — npm will show "No README" on first publish.

7. **`npm view twentythree-cli` must be run before any prep starts** — if the name is taken, it cascades to binary name, install instructions, and all documentation.

8. **`oclif readme` requires `<!-- usage -->` and `<!-- commands -->` markers in the README** — without them, `oclif readme` silently does nothing. Must be inserted before generation runs.

---

## Feature Breakdown

### README — Table Stakes
- One-line description + badges (npm version + license)
- Install command in a fenced code block
- Prerequisites: Node >=22.0.0 stated prominently
- Quickstart: `auth credentials` as step 1 (every other command fails without auth)
- Command group overview table (22 topic rows, links to docs/)
- Terminology mapping table: `photo → video`, `album → category`, `live → webinar`
- Link to `docs/commands/`
- License section

### npm Publish — Table Stakes
- `npm view twentythree-cli` — confirm name availability first
- Add `repository`, `bugs`, `homepage`, `keywords`, `author` to package.json
- Add `prepack` script
- Add `/docs` and `/README.md` to `files` array
- `npm pack --dry-run` — verify tarball contents
- `npm version 1.0.0` before publish (not `0.1.0`)
- `npm publish --access public`
- Install verification on a clean environment

### Endpoint Coverage Audit — Table Stakes
- Script at `packages/twentythree-cli/scripts/audit-endpoints.mjs`
- Matches on `agentMetadata.api_endpoint` string values only (never file paths)
- Filters `api_endpoint: 'local'` commands and `**/index.ts` topic stubs
- Maintains `EXCLUDED_OPERATIONS` list with rationale for intentional omissions
- Exit code 1 if uncovered > 0 or phantom > 0

### Docs — Table Stakes
- `docs/commands/` — `oclif readme --multi --nested-topics-depth 2` output (22+ files)
- `docs/guides/getting-started.md` — auth setup, workspace selection, first command
- `docs/guides/contributing.md` — dev setup, running tests, build pipeline
- `docs/guides/api-spec-upgrade.md` — OpenAPI spec update workflow (already documented in CLAUDE.md, formalize here)

---

## Suggested Build Order

| Phase | Name | Rationale |
|-------|------|-----------|
| 1 | Pre-flight + Audit Script | Confirm name, build audit script, classify 25 gaps |
| 2 | Fill Coverage Gaps | Implement confirmed-missing commands until audit exits 0 |
| 3 | Package Hygiene | `prepack`, `files`, missing package.json fields, `audit`/`readme` scripts |
| 4 | Generate Docs | `oclif readme --multi` → `docs/commands/`; coverage report to `docs/` |
| 5 | READMEs and Guides | Hand-authored content: root README, package README, guides, CHANGELOG |
| 6 | Publish | `npm pack --dry-run` → local test → `npm version 1.0.0` → publish → verify |

---

## Critical Pitfalls

1. **`prepack` script missing — stale manifest ships.** Add `"prepack": "npm run build"` before any publish. Verify with `npm pack --dry-run`.

2. **Package name may be taken.** Run `npm view twentythree-cli` as absolute first action. Fallback: `@twentythree/cli`. A name change cascades to binary name, install instructions, and all docs.

3. **Publishing as `0.1.0` is permanent.** npm unpublish window closes after 24 hours. Publish as `1.0.0`.

4. **Audit script must match on `api_endpoint` values, not file paths.** File-path comparison gives ~46% false negatives due to terminology mapping.

5. **`oclif readme` tags must be in README before generation.** Without `<!-- usage -->` and `<!-- commands -->` markers, `oclif readme` silently does nothing.

---

## Open Questions

**Before Phase 1:**
- Is `twentythree-cli` available on npm? (`npm view twentythree-cli`)
- Publish as `1.0.0` or `0.1.0`? (`1.0.0` is the recommendation)
- What GitHub org URL goes in the `repository` field?

**During Phase 2 (gap classification):**
- Are the 25 uncovered analytics endpoints intentional consolidations or genuine gaps?
- Are `GET /photo/get-replace-token`, `GET /photo/get-upload-token`, `GET /photo/get-update-token` intentionally omitted?

**For v1.2 planning:**
- CI publish workflow: npm OIDC trusted publishing or Granular Access Token?
- AI skills package timeline?
