---
phase: 21-skills-npm-publish
reviewed: 2026-04-21T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - packages/twentythree-skills/package.json
  - packages/twentythree-skills/README.md
  - .github/workflows/release.yml
  - packages/twentythree-skills/bin/add.js
findings:
  critical: 0
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 21: Code Review Report

**Reviewed:** 2026-04-21T00:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Reviewed three explicitly listed files plus `bin/add.js` (referenced by `package.json`'s `bin` field and necessary to evaluate the package's runtime behaviour). The `validate-skills.mjs` script was also read as it is the `test` script referenced by the release workflow.

The package structure is sound: `"type": "module"`, correct `bin` wiring, `publishConfig.access: "public"`, and `id-token: write` permission for provenance are all properly set. Two behavioural bugs were found — one in the installer script (silent success on file-copy failure) and one inconsistency in the release workflow (dry-run uses a different package manager than the real publish). Three lower-severity items are also noted.

## Warnings

### WR-01: Installer always exits 0 even when file copies fail

**File:** `packages/twentythree-skills/bin/add.js:75-103`

**Issue:** When `cpSync` throws, line 75 sets `process.exitCode = 1`. However, `process.exit(0)` is called unconditionally on line 103, which overrides the exit code and causes the installer to report success even if one or more files failed to copy. A user running `npx twentythree-skills` would see the error line printed but the process would still exit 0, making CI and scripted use silently incorrect.

**Fix:**
```js
// Replace the unconditional process.exit(0) at the end with:
process.exit(process.exitCode ?? 0)
```

This preserves the current best-effort install behaviour (continuing after individual file errors) while correctly propagating the failure exit code.

### WR-02: Dry-run uses npm, real publish uses pnpm — auth token may behave differently

**File:** `.github/workflows/release.yml:63-70`

**Issue:** The dry-run step calls `npm publish --dry-run` but the actual publish step calls `pnpm publish --no-git-checks --provenance`. The `NODE_AUTH_TOKEN` environment variable is set in both, but `pnpm publish` reads it differently from `npm publish` depending on the pnpm version and registry configuration. If the token works for the npm dry-run but fails for pnpm publish, the dry-run provides false confidence. The two-step approach was presumably intended to validate token scope before publishing, but the tool mismatch undermines this.

**Fix:**
```yaml
- name: Dry-run publish (verify NPM_TOKEN scope)
  working-directory: packages/twentythree-skills
  run: pnpm publish --no-git-checks --dry-run
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

- name: Publish to npm
  working-directory: packages/twentythree-skills
  run: pnpm publish --no-git-checks --provenance
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Info

### IN-01: `description` frontmatter field is not validated for emptiness

**File:** `packages/twentythree-skills/scripts/validate-skills.mjs:47-50`

**Issue:** Gate 1 validates that `name` is both present and non-empty (`hasKey` + `isEmpty`), but `description` is only checked for presence (`hasKey`). An empty `description: ""` would pass validation. This is a minor inconsistency — either both fields should be checked for emptiness, or the comment should note that description content is not validated.

**Fix:**
```js
if (!fm.hasKey('description') || fm.isEmpty('description')) {
  errors.push(`skills/SKILL.md frontmatter is missing required key 'description' (or it is empty)`)
}
```

### IN-02: `package.json` version is static and not synced with the git tag

**File:** `packages/twentythree-skills/package.json:3`

**Issue:** The version is hardcoded as `"1.0.0"`. The release workflow publishes on `skills-v*` tag pushes but does not bump the version in `package.json` before publishing. `pnpm publish --no-git-checks` will publish whatever version is in `package.json`, regardless of the tag name. Publishing `skills-v1.0.1` while `package.json` still says `1.0.0` would attempt to overwrite an existing npm version and fail, or produce a mismatch between the git tag and the published version.

**Fix:** Add a version-bump step to the workflow before publishing, using the tag name to derive the version:
```yaml
- name: Set package version from tag
  working-directory: packages/twentythree-skills
  run: npm version ${GITHUB_REF_NAME#skills-v} --no-git-tag-version
```
Place this step before the dry-run step.

### IN-03: `smoke-test` job is not wired to `publish-skills`

**File:** `.github/workflows/release.yml:73-93`

**Issue:** The `smoke-test` job has `needs: publish`, which means it only runs after the main CLI publish job. When a `skills-v*` tag is pushed, the `publish` job is skipped (its `if` condition is false), so `smoke-test` is also skipped. There is no post-publish verification for the skills package. This is a documentation/design gap rather than a correctness bug, but it means a broken skills publish would not be caught automatically.

**Fix:** Either add a separate `smoke-test-skills` job (even a simple `npm view twentythree-skills` check) after `publish-skills`, or document that smoke testing the skills package is out of scope for v1.

---

_Reviewed: 2026-04-21T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
