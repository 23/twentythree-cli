# Phase 24: Integration & CI Validation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 24-integration-ci-validation
**Areas discussed:** Assertion location, What to assert

---

## Assertion Location

| Option | Description | Selected |
|--------|-------------|----------|
| validate-skills.mjs | Extend existing script with Gate 3 using `spawnSync`. Runs via `pnpm test` — no CI config changes needed. | ✓ |
| New CI step in release.yml | Separate shell step in GitHub Actions. Visible in CI output but only runs on release, not locally. | |
| Standalone shell script | New `scripts/check-pack.sh` invoked from both validate-skills and CI. Reusable but adds a third file. | |

**User's choice:** validate-skills.mjs (Recommended)
**Notes:** Keeps the check co-located with existing validation logic, runs on every `pnpm test` invocation, no CI config changes needed.

---

## What to Assert

| Option | Description | Selected |
|--------|-------------|----------|
| Both count + guide.md presence | Assert total files == 29 AND skills/guide.md in pack output | ✓ |
| Count only (29) | Simpler — one number to update when adding future files | |
| guide.md presence only | More durable — won't break if a future phase adds another file | |

**User's choice:** Both count + guide.md presence (Recommended)
**Notes:** Catches both missing files and accidental additions. The explicit guide.md presence check documents what Phase 23 shipped.

---

## Claude's Discretion

- Error message phrasing within Gate 3
- `spawnSync` vs `execSync` implementation choice
- Whether to suppress `.tgz` artifact from `npm pack --dry-run`
- Comment style for Gate 3 block

## Deferred Ideas

None.
