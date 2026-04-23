---
status: complete
phase: 24-integration-ci-validation
source: 24-01-SUMMARY.md
started: 2026-04-23T22:05:00Z
updated: 2026-04-23T22:05:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Gate 3 passes on current package state
expected: |
  Run: pnpm --filter twentythree-skills test --run
  Output ends with: validate-skills: OK (SKILL.md frontmatter valid)
  Exit code: 0 (no errors printed, no Gate 3 error lines)
result: pass

### 2. Gate 3 error message is descriptive when count is wrong
expected: |
  Temporarily change EXPECTED_FILE_COUNT to 28 in validate-skills.mjs,
  run pnpm --filter twentythree-skills test --run, then revert.
  Output should include: "Gate 3: npm pack file count is 29, expected 28"
  Exit code: 1
result: issue
reported: "npm error Cannot read properties of null (reading 'edgesOut') — npm pack crashed in pnpm workspace context; Gate 3 exits 1 but message is 'could not parse file count' instead of count mismatch"
severity: minor

## Summary

total: 2
passed: 1
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Gate 3 error message includes count mismatch (expected N, got M) when EXPECTED_FILE_COUNT is wrong"
  status: failed
  reason: "User reported: npm pack --dry-run crashed in pnpm workspace context with 'Cannot read properties of null (reading edgesOut)'; Gate 3 exits 1 but message is 'could not parse file count' rather than a count mismatch — npm crash not surfaced in error text"
  severity: minor
  test: 2
  root_cause: "packResult.status !== 0 not checked — when npm crashes (exits non-zero but no spawn error), Gate 3 falls through to stderr parsing and emits 'could not parse' rather than reporting the npm failure"
  artifacts:
    - path: "packages/twentythree-skills/scripts/validate-skills.mjs"
      issue: "Gate 3 only checks packResult.error (spawn failure) not packResult.status (process exit code)"
  missing:
    - "Add packResult.status !== 0 check and surface packResult.stderr in the error message"

