---
phase: 01-foundation
reviewed: 2026-04-14T00:00:00Z
depth: standard
files_reviewed: 17
files_reviewed_list:
  - .gitignore
  - package.json
  - pnpm-workspace.yaml
  - tsconfig.base.json
  - turbo.json
  - packages/twentythree-cli/bin/run.js
  - packages/twentythree-cli/bin/dev.js
  - packages/twentythree-cli/package.json
  - packages/twentythree-cli/src/index.ts
  - packages/twentythree-cli/src/lib/term-map.ts
  - packages/twentythree-cli/src/lib/__tests__/term-map.test.ts
  - packages/twentythree-cli/src/lib/__tests__/node-check.test.ts
  - packages/twentythree-cli/tsconfig.json
  - packages/twentythree-cli/tsdown.config.ts
  - packages/twentythree-cli/vitest.config.ts
  - packages/twentythree-skills/SKILL.md
  - packages/twentythree-skills/package.json
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-14
**Depth:** standard
**Files Reviewed:** 17
**Status:** issues_found

## Summary

Foundation files are structurally sound. The monorepo layout, build tooling (tsdown, turbo), and oclif entrypoint wiring are all correct. The Node version guard in `bin/run.js` is well-placed and correct. The `term-map` module is clean with one meaningful behavioral inconsistency.

Four warnings require attention before these files are considered production-ready: a missing Node version guard in the dev entrypoint, a non-discriminating catch in `bin/dev.js`, a case-sensitivity inconsistency in `applyCliTerms`, and a likely invalid `vitest` version specifier. Four info items cover lower-priority improvements to security posture and configuration hygiene.

---

## Warnings

### WR-01: `bin/dev.js` has no Node version guard

**File:** `packages/twentythree-cli/bin/dev.js:1`
**Issue:** `bin/run.js` guards against Node < 22 before loading oclif, printing a clear error. `bin/dev.js` has no equivalent guard. A developer running `node ./bin/dev.js` (or `pnpm dev`) on Node 20 would get a cryptic oclif stack trace instead of a helpful message. The `dev` bin is in `scripts.dev`, so contributors will use it.
**Fix:**
```js
#!/usr/bin/env node
// bin/dev.js — development mode; auto-transpiles TypeScript via tsx

const nodeVersion = process.versions.node
const [major] = nodeVersion.split('.').map(Number)
if (major < 22) {
  process.stderr.write(
    `\nError: twentythree requires Node.js 22 or later.\n` +
    `You are running Node.js ${nodeVersion}.\n` +
    `Please upgrade: https://nodejs.org\n\n`
  )
  process.exit(1)
}

process.env.NODE_ENV = 'development'
// ... rest of file
```

---

### WR-02: Overly broad catch in `bin/dev.js` silently swallows non-missing-module errors

**File:** `packages/twentythree-cli/bin/dev.js:10-12`
**Issue:** The `catch {}` block catches every possible error from `require('tsx/cjs')`, including errors that are NOT "module not found" — for example, a corrupt `tsx` install, a permissions error, or a runtime exception inside tsx itself. In those cases the CLI silently falls through to the compiled `dist/` and produces confusing output with no indication of why tsx failed. The intent is only to handle the case where `tsx` is not installed.
**Fix:** Narrow the catch to `MODULE_NOT_FOUND`:
```js
try {
  require('tsx/cjs')
} catch (err) {
  if (err?.code !== 'MODULE_NOT_FOUND') throw err
  // tsx not installed — fall through to compiled dist
}
```

---

### WR-03: `applyCliTerms` is case-sensitive while `toCliTerm`/`toApiTerm` are case-insensitive

**File:** `packages/twentythree-cli/src/lib/term-map.ts:42-48`
**Issue:** `toCliTerm('Photo')` returns `'video'` because it calls `.toLowerCase()` before lookup. But `applyCliTerms('Photo_id from a Photo album')` leaves both capitalised `Photo` tokens untranslated because `String.replaceAll` is case-sensitive. This inconsistency will surface when API error messages or response text contain capitalised terms (e.g., sentence-initial `"Photo not found"`).

Additionally, `replaceAll` has no word-boundary awareness, so `album` inside a compound token like `albumArt` would become `categoryArt`. This is a latent correctness issue worth designing for explicitly.

**Fix (case-insensitivity):**
```ts
export function applyCliTerms(text: string): string {
  let result = text
  for (const [apiTerm, cliTerm] of Object.entries(API_TO_CLI)) {
    // Use a case-insensitive regex to match API terms regardless of capitalisation
    result = result.replace(new RegExp(apiTerm, 'gi'), cliTerm)
  }
  return result
}
```
Note: If word-boundary safety is also required, change the regex to `new RegExp(`\\b${apiTerm}\\b`, 'gi')`. Decide explicitly — either approach is acceptable but the current silent inconsistency is not.

---

### WR-04: `vitest` version `^4.1.4` likely does not exist

**File:** `packages/twentythree-cli/package.json:41`
**Issue:** `"vitest": "^4.1.4"` specifies a version range that requires vitest v4 to be published. As of the knowledge cutoff (August 2025) the latest stable vitest release is v3.x. If v4 does not exist, `pnpm install` will fail with "No matching version found". This looks like a version typo — possibly intended as `^1.4.x` or `^2.x` or `^3.x`.
**Fix:** Verify against the npm registry and correct the version:
```json
"vitest": "^3.0.0"
```
(or whichever stable major is current). Also update `@oclif/test` to confirm it is compatible with the chosen vitest major.

---

## Info

### IN-01: `.gitignore` does not exclude `.env` or credential files

**File:** `.gitignore:1-6`
**Issue:** The project stores bearer tokens in the OS keychain (`@napi-rs/keyring`), but there is no guard against accidentally committing `.env` files or other credential artifacts. Contributors may add `.env` files for local development; they would not be excluded.
**Fix:** Add common credential file patterns:
```
.env
.env.*
*.pem
*.key
```

---

### IN-02: `tsconfig.base.json` uses legacy `moduleResolution: "node"`

**File:** `tsconfig.base.json:6`
**Issue:** `"moduleResolution": "node"` is the legacy (pre-Node 12) resolver alias. For a project targeting Node 22 with `"module": "commonjs"`, the equivalent modern value is `"moduleResolution": "node10"`. This does not cause build failures today but will produce TS warnings when TypeScript 5.x stricter defaults are enabled, and mismatches with tools that infer resolution from `module`.
**Fix:**
```json
"moduleResolution": "node10"
```
Or, if the project moves toward ESM output in a future phase: `"moduleResolution": "bundler"` with `"module": "preserve"`.

---

### IN-03: `vitest.config.ts` sets `globals: true` but all tests use explicit imports

**File:** `packages/twentythree-cli/vitest.config.ts:4`
**Issue:** `globals: true` enables `describe`/`it`/`expect` as implicit globals, but every test file imports them explicitly from `vitest`. The setting is therefore unused. More importantly, without `"types": ["vitest/globals"]` in `tsconfig.json`, TypeScript would complain about unknown globals if an unintentional test ever omits the imports. The combination creates a false sense of safety: globals mode is on but there are no type declarations backing it.
**Fix:** Either remove `globals: true` (rely solely on explicit imports, which is the cleaner pattern) or add the corresponding type declarations to `tsconfig.json`:
```json
// tsconfig.json compilerOptions
"types": ["vitest/globals"]
```
Removing `globals: true` is the lower-maintenance choice.

---

### IN-04: `turbo.json` test task unconditionally depends on build

**File:** `turbo.json:9`
**Issue:** `"dependsOn": ["build"]` means `pnpm test` always runs a full tsdown build before vitest. Since vitest runs against TypeScript source directly (no dist needed), the build step adds latency on every test run — especially in watch mode during development. This slows the inner dev loop.
**Fix:** Remove the `build` dependency from the `test` task so tests can run directly against source:
```json
"test": {
  "inputs": ["src/**/*.ts", "vitest.config.*"]
}
```
If integration tests genuinely require the compiled `dist/`, split them into a separate `test:integration` task that declares the `build` dependency.

---

_Reviewed: 2026-04-14_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
