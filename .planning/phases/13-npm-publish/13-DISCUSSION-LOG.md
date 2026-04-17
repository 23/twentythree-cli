# Phase 13: npm Publish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 13-npm-publish
**Areas discussed:** First publish approach, GitHub Actions workflow scope, Version bump & tagging flow

---

## First Publish Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Manual first, CI for next | Run `npm publish --access public` locally for 1.0.0, then CI for all future releases | |
| CI-first — tag triggers everything | Set up GitHub Actions, bump to 1.0.0, push v1.0.0 tag, let CI handle the publish | ✓ |
| Manual only — no CI for now | Publish manually, skip PUBLISH-03 for this milestone | |

**User's choice:** CI-first — tag triggers everything
**Notes:** No local npm credentials needed. Cleaner than publishing from a dev machine.

---

## GitHub Actions Workflow Scope

### What the workflow does

| Option | Description | Selected |
|--------|-------------|----------|
| Build + publish only | `pnpm build` then `npm publish` — fast, minimal | |
| Test + build + publish | Run test suite, build, publish in same job | |
| Test + build + publish + smoke test | After publish, install from npm in clean env, verify `--version` | ✓ |

**User's choice:** Test + build + publish + smoke test
**Notes:** Most thorough path — smoke test confirms the published tarball actually works.

### CI trigger

| Option | Description | Selected |
|--------|-------------|----------|
| Tag push only | Pattern `v*.*.*` — clean separation between validation and release | ✓ |
| Tag push + manual dispatch | Also allows workflow_dispatch for re-runs without re-tagging | |
| Tag push + release creation | Also triggers on GitHub Release creation | |

**User's choice:** Tag push only
**Notes:** Nothing else triggers publish. Standard pattern.

---

## Version Bump & Tagging Flow

### How to bump version

| Option | Description | Selected |
|--------|-------------|----------|
| npm version + git push | `npm version 1.0.0` → commit + tag → `git push && git push --tags` | ✓ |
| Manual edit + manual tag | Edit package.json by hand, commit, then `git tag v1.0.0 && git push --tags` | |
| Script in package.json | Add a `release` script to package.json | |

**User's choice:** npm version + git push
**Notes:** Standard Node.js release flow. `npm version` creates the version commit and local tag automatically.

### Tag format

| Option | Description | Selected |
|--------|-------------|----------|
| v-prefixed: v1.0.0 | Pattern `v*.*.*` — conventional, matches `npm version` default | ✓ |
| Bare: 1.0.0 | Pattern `*.*.*` without v prefix | |

**User's choice:** v-prefixed (v1.0.0)
**Notes:** Matches what `npm version` creates by default. Easy to filter in GitHub Actions.

---

## Claude's Discretion

- GitHub Actions runner version and Node.js version
- Whether to use `pnpm` setup or `npm ci` in workflow
- Exact smoke test implementation (separate job vs. same job)
- Whether to include `npm view` output in job summary

## Deferred Ideas

- OIDC trusted publishing / npm provenance — deferred to v1.2
- workflow_dispatch trigger — not chosen by user
