# Phase 21: Skills npm Publish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 21-skills-npm-publish
**Areas discussed:** npx invocation routing, CI job structure, Version bump

---

## npx Invocation Routing

| Option | Description | Selected |
|--------|-------------|----------|
| Bare only — no routing | Keep current behavior: all args ignored, installer always runs. npx twentythree-skills and npx twentythree-skills add both work identically. README documents bare form as canonical. | ✓ |
| Explicit routing — add \| --help | Route: no args or `add` → run installer; `--help` or `-h` → print usage; unknown args → error. | |
| Warn on unknown args | Run installer always, but print a warning if unknown args are passed. | |

**User's choice:** Bare only — no routing
**Notes:** Keep current behavior, simplest approach. README documents `npx twentythree-skills` as canonical.

---

## CI Job Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Tests + dry-run + publish | Run validate-skills.mjs before publishing. Dry-run verifies NPM_TOKEN access. Real publish if dry-run passes. No post-publish smoke-test. | ✓ |
| Dry-run + publish only | Skip the validate-skills test step — just verify token with dry-run, then publish. | |
| Tests + dry-run + publish + smoke-test | Full pipeline including post-publish smoke-test job. | |

**User's choice:** Tests + dry-run + publish
**Notes:** Smoke-test is a future requirement — out of scope for this phase.

---

## Version Bump

| Option | Description | Selected |
|--------|-------------|----------|
| Manual commit before tagging | Bump package.json to 1.0.0 in a regular commit, then push the skills-v1.0.0 tag. | ✓ |
| CI bumps on publish | CI rewrites package.json version before publishing. | |

**User's choice:** Manual commit before tagging
**Notes:** Simple and explicit. No CI complexity.

---

## Claude's Discretion

- Exact step names and `needs:` dependency ordering within the `publish-skills` job
- README wording for canonical invocation form
- Whether `publish-skills` skips `pnpm install` (no build, no deps)

## Deferred Ideas

- Post-publish smoke-test for skills — future requirement
- Installer post-success hint message — future requirement
