# Phase 24: Integration & CI Validation - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend `validate-skills.mjs` with a Gate 3 that asserts the `npm pack --dry-run` output is consistent with Phase 23's addition of `guide.md`. No CLI code changes, no `package.json` changes, no `bin/add.js` changes — skills package validation only.

</domain>

<decisions>
## Implementation Decisions

### Assertion Location
- **D-01:** The pack count check lives in `packages/twentythree-skills/scripts/validate-skills.mjs` as a new Gate 3 (after the existing Gate 1 and Gate 2 checks). It uses `spawnSync` to run `npm pack --dry-run` and parses the output. No CI config changes needed — it runs automatically via `pnpm --filter twentythree-skills test --run`.

### What to Assert
- **D-02:** Gate 3 checks two things:
  1. Total file count == 29 (the "total files:" line in npm pack output)
  2. `skills/guide.md` appears in the pack listing (explicit presence check for the Phase 23 deliverable)

### Claude's Discretion
- Error message phrasing and output formatting within Gate 3
- Whether to use `spawnSync` from `node:child_process` or `execSync` — either is fine
- Whether to suppress the `.tgz` file that `npm pack --dry-run` creates (use `--json` flag or cleanup after, or `2>&1` capture only)
- Comment style for the new Gate 3 block

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Implementation
- `packages/twentythree-skills/scripts/validate-skills.mjs` — the file being extended; read in full before editing to understand Gate 1 and Gate 2 patterns and variable conventions
- `packages/twentythree-skills/package.json` — `"files": ["/bin", "/skills", "/README.md"]` defines what npm pack includes; `"scripts": { "test": "node scripts/validate-skills.mjs" }` defines how Gate 3 runs in CI

### Requirements
- `.planning/REQUIREMENTS.md` §INT-01 — the specific requirement being implemented: "npm pack --dry-run file count assertion updated from 28 to 29"
- `.planning/ROADMAP.md` §Phase 24 — success criteria (count assertion passes, guide.md in pack output, validate-skills exits 0)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `validate-skills.mjs` error/warning arrays pattern: add to `errors[]` for hard failures, `warnings[]` for soft — Gate 3 should push to `errors[]`
- `spawnSync` or `execSync` from `node:child_process` — not currently used in the script but available in Node.js stdlib

### Established Patterns
- Gate structure: each gate has a comment header `// ─── Gate N: Name ───`, a condition block, and pushes to `errors` or `warnings`
- Script exits 0 on success, 1 on any error — Gate 3 must follow this pattern (no separate exit call needed; the existing reporter at the end handles it)
- ESM module (`import` syntax) — no `require()` in this file

### Integration Points
- Gate 3 runs after Gate 2 (reference files check) — append it before the `// ─── Report ───` section
- `npm pack --dry-run` from the script's working directory (the package root) will produce correct output since `__dirname` resolves to `scripts/` and `packageRoot` is one level up

</code_context>

<specifics>
## Specific Ideas

- The Gate 3 comment block for `EXPECTED_FILE_COUNT = 29` should note: "Update this number when adding new files to the package" — makes the maintenance path clear for future phases
- `npm pack --dry-run` outputs to stderr, not stdout — capture `stderr` from `spawnSync`, not `stdout`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 24-integration-ci-validation*
*Context gathered: 2026-04-23*
