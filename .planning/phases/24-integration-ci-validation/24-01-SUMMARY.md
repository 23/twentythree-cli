---
phase: 24-integration-ci-validation
plan: 01
status: complete
---

# Summary: Plan 24-01 — Gate 3 Pack File Count Assertion

## What was done

Added Gate 3 to `packages/twentythree-skills/scripts/validate-skills.mjs`:

- Added `import { spawnSync } from 'node:child_process'` to the import block
- Appended Gate 3 block before the `// ─── Report ───` section
- Gate 3 runs `npm pack --dry-run` via `spawnSync` with `cwd: packageRoot`
- Parses `stderr` for `total files: N` line (npm pack output goes to stderr, not stdout)
- Asserts count == `EXPECTED_FILE_COUNT` (29) — with maintenance comment
- Asserts `skills/guide.md` appears in pack output
- Both failures push to `errors[]` array; existing Report section handles exit
- Updated file header comment from "Two-gate" to "Three-gate validation"

## Files modified

- `packages/twentythree-skills/scripts/validate-skills.mjs`

## Verification

`pnpm --filter twentythree-skills test --run` exits 0 — all three gates pass.

## Commits

- `871eedd` feat(skills): add Gate 3 pack file count assertion to validate-skills
- `35425d6` docs(skills): update validate-skills header to Three-gate validation
