---
phase: 13-npm-publish
reviewed: 2026-04-17T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - .github/workflows/release.yml
  - packages/twentythree-cli/package.json
  - packages/twentythree-cli/src/lib/__tests__/base-command.test.ts
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 13: Code Review Report

**Reviewed:** 2026-04-17
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Reviewed the GitHub Actions release workflow, CLI package manifest, and base-command test suite. No critical security vulnerabilities were found. The main concerns are two correctness bugs in the release workflow (a silent failure in the propagation poll and installing an unpinned package version), a missing type-check step in CI, and incomplete test coverage for the token-refresh substitution path and the ambiguous-workspace path in BaseCommand. The package.json is well-structured but has a very aggressive Node.js engine constraint that may cause unnecessary install failures.

---

## Warnings

### WR-01: Smoke-test propagation loop silently falls through on exhaustion

**File:** `.github/workflows/release.yml:47-54`

**Issue:** The registry propagation loop runs up to 5 attempts and then falls through unconditionally — there is no `exit 1` if the version is never found. The subsequent `npm install -g twentythree-cli` (line 54) then installs whatever the `latest` tag resolves to, which may be a previous release if propagation has not yet completed. A successful smoke-test result would be misleading because a different version was actually tested.

**Fix:**
```yaml
- name: Wait for registry propagation
  run: |
    for i in 1 2 3 4 5; do
      npm view twentythree-cli@${GITHUB_REF_NAME#v} version 2>/dev/null && break
      echo "Attempt $i: not yet available, waiting 15s..."
      sleep 15
      if [ "$i" -eq 5 ]; then
        echo "Package not available after 75s — aborting"
        exit 1
      fi
    done
```

---

### WR-02: Smoke-test installs latest tag, not the specific just-published version

**File:** `.github/workflows/release.yml:54`

**Issue:** `npm install -g twentythree-cli` installs the current `latest` tag with no version pin. If the propagation loop passes but `latest` has not yet been updated on the registry (or if a concurrent publish moved `latest`), the smoke-test exercises the wrong version. A version-pinned install ensures the exact artifact is verified.

**Fix:**
```yaml
- name: Install globally
  run: npm install -g twentythree-cli@${GITHUB_REF_NAME#v}
```

---

### WR-03: No type-check step in the release workflow

**File:** `.github/workflows/release.yml:25-29`

**Issue:** The workflow runs tests (`vitest`) and then builds, but never runs `tsc --noEmit`. TypeScript compilation errors that vitest does not catch (e.g., type errors in command files not covered by tests) will be silently ignored. Per the CLAUDE.md API Change Workflow section, `pnpm --filter twentythree-cli exec tsc --noEmit` is the prescribed verification command. Publishing a build with type errors risks shipping broken runtime code.

**Fix:** Add a type-check step between tests and build:
```yaml
- name: Type check
  run: pnpm --filter twentythree-cli exec tsc --noEmit

- name: Build
  run: pnpm --filter twentythree-cli run build
```

---

### WR-04: Token-refresh substitution logic is tested for invocation but not result

**File:** `packages/twentythree-cli/src/lib/__tests__/base-command.test.ts:193-201`

**Issue:** The test "calls ensureFreshToken when workspace has a token" asserts that `ensureFreshToken` was called but does not assert that `activeWorkspace.bearer_token` was updated to the refreshed value (`tok_fresh`). The substitution path in `base-command.ts` lines 134-137 (`this.activeWorkspace = { ...resolved, bearer_token: freshToken }`) has no assertion verifying that the updated token propagates correctly. If the substitution logic were removed or broken, the test would still pass.

**Fix:** Extend the test to assert the substituted value:
```typescript
it('calls ensureFreshToken when workspace has a token and updates bearer_token', async () => {
  mockGetActiveWorkspace.mockReturnValue('company.video23.com')
  mockGetWorkspaceForDomain.mockReturnValue(WORKSPACE_WITH_TOKEN)
  mockEnsureFreshToken.mockResolvedValue('tok_fresh')

  const Cmd = makeBaseCommandClass()
  const cmd = await initCommand(Cmd, [])

  expect(mockEnsureFreshToken).toHaveBeenCalledWith('company.video23.com')
  expect(cmd.getActiveWorkspaceForTest().bearer_token).toBe('tok_fresh')
})
```

---

## Info

### IN-01: Node.js engine constraint is very aggressive

**File:** `packages/twentythree-cli/package.json:18-20`

**Issue:** `"node": ">=22.0.0"` locks out Node 20 LTS (active LTS until April 2026, supported until April 2028). Many developers and CI environments run Node 20. The project's tech stack table lists Node 22 as the target, but this is worth confirming as a deliberate constraint versus an unintentional exclusion — especially for a tool intended for broad developer adoption.

**Fix:** If Node 20 support is desired, lower to `"node": ">=20.0.0"`. If Node 22 is a firm requirement (e.g., due to `--env-file` or other Node 22-specific APIs), document the reason in a comment or the README.

---

### IN-02: `docs` directory included in published `files` without a generation step

**File:** `packages/twentythree-cli/package.json:25-30`

**Issue:** `"/docs"` is listed in the `files` array but the build script (`tsdown`) does not generate documentation, and there is no `docs:generate` script. If the `docs/` directory is empty or absent at publish time, it ships as an empty directory (or is silently excluded by npm). This is harmless at runtime but misleading.

**Fix:** Either add a doc generation step to the build pipeline or remove `/docs` from `files` until documentation generation is implemented.

---

### IN-03: Tag-to-version consistency is not validated in the release workflow

**File:** `.github/workflows/release.yml:1-6`

**Issue:** The workflow triggers on any `v*` tag and publishes whatever `version` field is in `package.json`. If the git tag is `v1.2.0` but `package.json` still reads `1.0.0`, the published version will be `1.0.0` — not `1.2.0` — and the smoke-test propagation check (which looks for the tag-derived version `1.2.0`) will loop and fail. There is no step that verifies the tag matches the package version.

**Fix:** Add a validation step before publish:
```yaml
- name: Verify tag matches package version
  working-directory: packages/twentythree-cli
  run: |
    TAG_VERSION="${GITHUB_REF_NAME#v}"
    PKG_VERSION=$(node -p "require('./package.json').version")
    if [ "$TAG_VERSION" != "$PKG_VERSION" ]; then
      echo "Tag $TAG_VERSION does not match package.json version $PKG_VERSION"
      exit 1
    fi
```

---

### IN-04: Ambiguous workspace match path and --agent flag path are not tested

**File:** `packages/twentythree-cli/src/lib/__tests__/base-command.test.ts`

**Issue:** Two notable code paths in `base-command.ts` have no test coverage:

1. The ambiguous workspace match path (lines 100-112): when `findWorkspace` returns an array (multiple matches), the code invokes `select()` from `@clack/prompts` to prompt the user. This branch is never exercised in the test suite — `mockFindWorkspace` always returns a single workspace or null.

2. The `--agent` flag path (lines 53-82): the early-exit metadata output path is complex (iterates flag definitions, reads `agentMetadata`, writes JSON to stdout, calls `process.exit(0)`) and has zero test coverage.

**Fix:** Add tests for both paths. The ambiguous match test should mock `@clack/prompts.select` to return a domain value. The `--agent` test should spy on `process.stdout.write` and `process.exit`.

---

_Reviewed: 2026-04-17_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
