---
phase: 10-package-hygiene
reviewed: 2026-04-16T16:33:16Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - packages/twentythree-cli/package.json
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Phase 10: Code Review Report

**Reviewed:** 2026-04-16T16:33:16Z
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

Reviewed `packages/twentythree-cli/package.json` as part of the package hygiene phase. The file is well-structured with correct dependency choices per CLAUDE.md conventions (chalk 4.x, ora 5.x pinned for CJS compatibility, @napi-rs/keyring over keytar, vitest over Jest). The `engines.node` constraint is correctly set to `>=22.0.0`, which is load-bearing — Node.js 22.12+ is required for `require()` of ESM packages (`conf@15`, `@clack/prompts@1.2.0`) to work at runtime. The CLI binary entrypoint enforces this check before oclif loads.

Two issues require attention: the `"main"` field points to a file that does not exist at build time, and the `"files"` array references two paths (`/docs`, `/README.md`) that do not exist in the repository.

## Warnings

### WR-01: `"main"` field points to non-existent file

**File:** `packages/twentythree-cli/package.json:23`
**Issue:** `"main": "./dist/index.js"` — tsdown is configured with `format: 'cjs'` and `unbundle: true`, so the actual output is `dist/index.cjs`, not `dist/index.js`. The `.js` file is never emitted. While the CLI binary (`bin/run.js`) does not use `"main"` (it delegates to oclif's command loader via `execute({ dir: __dirname })`), the stale `"main"` field will cause a `MODULE_NOT_FOUND` error for any caller that does `require('twentythree-cli')` or `import 'twentythree-cli'` programmatically, and is misleading for tooling that reads package metadata.
**Fix:**
```json
"main": "./dist/index.cjs"
```
If programmatic ESM consumption is also desired in the future, add an `"exports"` field:
```json
"exports": {
  ".": "./dist/index.cjs"
}
```

### WR-02: `"files"` includes paths that do not exist

**File:** `packages/twentythree-cli/package.json:24-30`
**Issue:** The `"files"` array includes `"/docs"` and `"/README.md"`. Neither exists in the repository (`docs/` directory is absent, no `README.md` at the package root). npm will silently ignore missing paths in `"files"`, so this does not block publishing — but it means the published tarball will be missing documentation that consumers expect. `npm pack --dry-run` will confirm the omission. The changeset config sets `"access": "public"`, so this package is intended for public npm distribution.
**Fix:** Either create the missing files before publishing, or remove the non-existent entries from `"files"` to keep the manifest accurate:
```json
"files": [
  "/bin",
  "/dist",
  "/oclif.manifest.json"
]
```
Add `/docs` and `/README.md` back once those are created.

## Info

### IN-01: No `lint` script in `scripts`

**File:** `packages/twentythree-cli/package.json:31-38`
**Issue:** `turbo.json` defines a `lint` task with `inputs: ["src/**/*.ts", ".eslintrc*"]`, and the root `package.json` scripts include `"lint": "turbo run lint"`. However, the package has no `lint` script and no linting tool in its dependencies (no ESLint, Biome, or oxlint). Running `pnpm lint` from the repo root will succeed but silently no-op for this package, giving false confidence. No types in the package need linting tooling, but the gap between turbo's expectation and reality is worth resolving — either add a linting tool or remove the `lint` task from `turbo.json`.
**Fix:** If linting is not yet in scope, add a stub that exits cleanly:
```json
"scripts": {
  "lint": "echo 'No linter configured'"
}
```
Or install a linter (TypeScript ESLint is the conventional choice for this stack).

### IN-02: `"baseBranch"` in changeset config does not match the actual default branch

**File:** `/Users/steffenchristensen/23/twentythree-cli/.changeset/config.json:6`
**Issue:** `"baseBranch": "main"` but the repository's default branch is `master` (confirmed via `git status`). This is out of scope for the `package.json` review but is adjacent and worth noting: changesets computes changelog ranges from `baseBranch`, so releases run from the wrong baseline. This is in the changeset config, not `package.json` itself.
**Fix:** Update `.changeset/config.json`:
```json
"baseBranch": "master"
```

---

_Reviewed: 2026-04-16T16:33:16Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
