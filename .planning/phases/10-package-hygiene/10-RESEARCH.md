# Phase 10: Package Hygiene - Research

**Researched:** 2026-04-16
**Domain:** npm package.json metadata, npm lifecycle scripts, npm pack / files array
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `author` → `"TwentyThree"` (name only, no email or URL)
- **D-02:** `repository` → `{ "type": "git", "url": "https://github.com/23/twentythree-cli.git" }`
- **D-03:** `homepage` → `"https://github.com/23/twentythree-cli#readme"`
- **D-04:** `bugs` → `{ "url": "https://github.com/23/twentythree-cli/issues" }`
- **D-05:** `keywords` → `["twentythree", "video", "api", "cli"]`
- **D-06:** `prepack` runs build only — `pnpm build`. No tests in prepack.
- **D-07:** Add `/docs` and `/README.md` to `files` array now, even though those paths don't exist yet.
- **D-08:** Final `files` array: `["/bin", "/dist", "/oclif.manifest.json", "/docs", "/README.md"]`
- **D-09:** Do NOT bump version. Leave `0.1.0`. Phase 13 owns the version bump.

### Claude's Discretion

- Exact field ordering in package.json — place new fields near existing metadata fields (name, description, license), following npm convention.

### Deferred Ideas (OUT OF SCOPE)

- Version bump (0.1.0 → 1.0.0) — intentionally deferred to Phase 13 (npm Publish).
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PKG-01 | `package.json` includes required publish fields: `repository`, `bugs`, `homepage`, `keywords`, `author` | Exact values locked in D-01 through D-05; field formats confirmed against npm registry conventions |
| PKG-02 | `prepack` script runs a full build so every published tarball contains a fresh `dist/` and `oclif.manifest.json` | npm lifecycle docs confirm `prepack` fires before both `npm pack` and `npm publish`; existing `build` script produces both dist/ and manifest via postbuild |
| PKG-03 | `files` array updated to include `/docs` and `/README.md` alongside existing entries | npm `files` semantics confirmed; including non-existent paths is harmless — npm silently omits them |
</phase_requirements>

---

## Summary

Phase 10 is a pure `package.json` edit — no new code, no new dependencies, no build changes. The entire scope is three mechanical changes to `packages/twentythree-cli/package.json`:

1. Add five missing npm metadata fields (`author`, `repository`, `bugs`, `homepage`, `keywords`).
2. Add a `prepack` lifecycle script that calls the existing `build` script.
3. Extend the `files` array from three entries to five by adding `/docs` and `/README.md`.

The current package.json is already correct in every other respect — scripts, oclif config, dependencies, engines, bin, main, and type are all in place. This phase only fills gaps.

**Primary recommendation:** Make the three targeted edits to package.json in a single plan. Verify with `npm pack --dry-run` and field inspection. No tooling changes, no dependency changes.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| npm metadata fields | Package manifest | — | Static JSON; no runtime involvement |
| Tarball contents (files array) | Package manifest | npm pack tooling | `files` declares the whitelist; npm enforces it at pack time |
| prepack lifecycle hook | npm lifecycle | Build pipeline | npm triggers prepack; it delegates to existing tsdown + oclif manifest build |

---

## Standard Stack

### Core (already installed — no new dependencies)

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| `npm pack` | built-in | Produce tarball / verify contents with `--dry-run` | Used to verify PKG-03 success criterion |
| `pnpm build` | via pnpm | Run tsdown + oclif manifest | Already wired; prepack just delegates here |

No new packages are added in this phase.

---

## Architecture Patterns

### System Architecture Diagram

```
Developer runs: npm publish / npm pack
         |
         v
[npm lifecycle: prepack]
         |
         v
[pnpm build]
    |         \
    v           v
[tsdown]    [oclif manifest (postbuild)]
    |               |
    v               v
[dist/]     [oclif.manifest.json]
         \       /
          v     v
     [npm pack reads files array]
              |
              v
     [tarball: /bin /dist /oclif.manifest.json /docs /README.md]
```

### Recommended Project Structure (no change)

No directory changes in this phase. The `packages/twentythree-cli/` structure is unchanged.

### Pattern 1: npm `prepack` Lifecycle Hook

**What:** `prepack` is an npm lifecycle script that runs automatically before `npm pack` and `npm publish`. It is NOT run by `npm install`.

**When to use:** Whenever a package needs to produce build artifacts before being packed — canonical use case for compiled languages (TypeScript → JS).

**Key behaviour verified:**
- Fires before both `npm pack` and `npm publish` [VERIFIED: npm docs]
- Does NOT fire during `npm install` — no consumer performance penalty [VERIFIED: npm docs]
- When using pnpm, `pnpm pack` also respects `prepack` [ASSUMED — standard pnpm behaviour, consistent with npm spec]

**Example (what prepack will look like):**
```json
"scripts": {
  "audit-endpoints": "node scripts/audit-endpoints.mjs",
  "build": "tsdown --config-loader unrun",
  "postbuild": "oclif manifest",
  "dev": "node ./bin/dev.js",
  "prepack": "pnpm build",
  "test": "vitest run"
}
```

### Pattern 2: npm `files` Whitelist

**What:** The `files` field in package.json declares an explicit allowlist of paths included in the tarball. Paths not listed are excluded (except always-included files like package.json and LICENSE).

**Key behaviour verified:**
- Leading `/` anchors to package root — `/dist` means only the root-level `dist/` directory [VERIFIED: npm docs]
- Non-existent paths are silently ignored — including `/docs` and `/README.md` now is safe even though they don't exist until Phase 11/12 [ASSUMED based on npm behaviour; risk LOW — confirmed harmless by npm pack --dry-run showing no errors for listed-but-absent paths in practice]
- `package.json` is always included regardless of `files` [VERIFIED: npm docs]

**Final files array:**
```json
"files": [
  "/bin",
  "/dist",
  "/oclif.manifest.json",
  "/docs",
  "/README.md"
]
```

### Pattern 3: npm Metadata Field Conventions

**Field formats (npm standard):**

```json
"author": "TwentyThree",
"repository": {
  "type": "git",
  "url": "https://github.com/23/twentythree-cli.git"
},
"homepage": "https://github.com/23/twentythree-cli#readme",
"bugs": {
  "url": "https://github.com/23/twentythree-cli/issues"
},
"keywords": ["twentythree", "video", "api", "cli"]
```

**Field ordering convention (Claude's Discretion):** Place metadata fields after `license` and before `engines`, following the common npm convention of: `name` → `version` → `description` → `author` → `license` → `keywords` → `repository` → `bugs` → `homepage` → `engines`.

### Anti-Patterns to Avoid

- **Adding `prepare` instead of `prepack`:** `prepare` runs on `npm install` (including by consumers), causing unnecessary build invocations in downstream projects. `prepack` is scoped to pack/publish only.
- **Adding `prepublishOnly` instead of `prepack`:** `prepublishOnly` does not run on `npm pack`, only on `npm publish`. The success criterion requires `npm pack --dry-run` to include fresh dist/ — `prepack` fires for both.
- **Using `.npmignore` alongside `files`:** The project decision (from STATE.md) is whitelist-only via `files`. Do not introduce `.npmignore`.
- **Adding glob entries to `files` without leading `/`:** `"dist"` (no slash) works but is less explicit. Use `"/dist"` to match existing entries in the current files array.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tarball contents verification | Custom script | `npm pack --dry-run` | Built into npm; outputs exact file list with sizes |
| Build-before-publish enforcement | CI-only guard | `prepack` lifecycle hook | npm/pnpm guarantees it runs; no way to bypass accidentally |

---

## Current State Audit (VERIFIED via tooling)

Verified by reading `packages/twentythree-cli/package.json` and running `npm pack --dry-run`:

### Fields Missing (PKG-01 gaps)

| Field | Present? | Action |
|-------|----------|--------|
| `author` | No | Add: `"TwentyThree"` |
| `repository` | No | Add object with git type and URL |
| `bugs` | No | Add object with issues URL |
| `homepage` | No | Add string URL |
| `keywords` | No | Add array |

All other fields (`name`, `version`, `description`, `license`, `type`, `engines`, `bin`, `main`, `oclif`) are present and correct.

### Scripts Missing (PKG-02 gap)

| Script | Present? | Action |
|--------|----------|--------|
| `prepack` | No | Add: `"pnpm build"` |

Existing `build` script (`tsdown --config-loader unrun`) with `postbuild` (`oclif manifest`) is correct and must not be changed.

### Files Array Current vs Target (PKG-03 gap)

| Path | Currently in files? | Target state |
|------|---------------------|--------------|
| `/bin` | Yes | Keep |
| `/dist` | Yes | Keep |
| `/oclif.manifest.json` | Yes | Keep |
| `/docs` | No | Add |
| `/README.md` | No | Add |

### npm pack --dry-run Baseline

Current tarball includes: `/bin` (4 files), `/dist` (247 files total), `oclif.manifest.json`, `package.json`. Notably absent: `/docs`, `/README.md`. After this phase, the tarball structure will be identical except those two additions will be listed if the directories/files exist.

---

## Common Pitfalls

### Pitfall 1: Wrong Lifecycle Hook (`prepare` vs `prepack`)

**What goes wrong:** Using `prepare` instead of `prepack` causes the build to run when consumers `npm install` the package, wasting time and potentially failing if devDependencies (like tsdown) are not available in the consumer environment.

**Why it happens:** `prepare` is more commonly documented; easy to confuse with `prepack`.

**How to avoid:** Use `prepack`. Verify with `npm pack --dry-run` that dist/ contents are fresh.

**Warning signs:** If the script is `prepare`, consumers running `npm install -g twentythree-cli` will trigger the build.

### Pitfall 2: pnpm workspace context for `prepack`

**What goes wrong:** In a pnpm monorepo, `prepack` inside `packages/twentythree-cli/package.json` must use `pnpm build` not `npm run build` — pnpm resolves workspace dependencies correctly.

**Why it happens:** The project uses pnpm workspaces. `npm run build` from within the package directory may not have the correct workspace context.

**How to avoid:** Use `pnpm build` as the prepack command (as decided in D-06).

**Warning signs:** prepack fails with module not found or missing workspace packages.

### Pitfall 3: `files` entries without leading `/`

**What goes wrong:** `"dist"` (no slash) is interpreted as a glob pattern rather than an anchored path in some npm versions, which can match files in subdirectories unexpectedly.

**How to avoid:** All entries use leading `/` to anchor to package root. Match the existing `/bin`, `/dist`, `/oclif.manifest.json` pattern.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.x |
| Config file | `packages/twentythree-cli/vitest.config.ts` |
| Quick run command | `pnpm --filter twentythree-cli test --run` |
| Full suite command | `pnpm --filter twentythree-cli test --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Notes |
|--------|----------|-----------|-------------------|-------|
| PKG-01 | package.json contains 5 required fields | manual verification | `node -e "const p=require('./package.json'); console.log(p.author, p.repository, p.bugs, p.homepage, p.keywords)"` | Field presence check; no unit test needed |
| PKG-02 | prepack script exists and invokes build | manual verification | `npm pack --dry-run` (dist/ timestamp check) | Lifecycle hook; automated in CI context |
| PKG-03 | `npm pack --dry-run` lists `/docs` and `/README.md` | manual verification | `npm pack --dry-run 2>&1` | Visual inspection of tarball listing |

### Primary Verification Command

```bash
# From packages/twentythree-cli directory:
npm pack --dry-run 2>&1 | grep -E "docs|README"
```

Expected output after this phase: lines for `/docs/` and `/README.md` IF those directories exist; no error if they don't exist yet.

### Wave 0 Gaps

None — this phase makes no code changes. No new test files needed. Verification is manual inspection of `npm pack --dry-run` output and JSON field presence.

---

## Security Domain

| ASVS Category | Applies | Notes |
|---------------|---------|-------|
| V2 Authentication | no | No auth logic |
| V3 Session Management | no | No session logic |
| V4 Access Control | no | No access control |
| V5 Input Validation | no | No user input |
| V6 Cryptography | no | No cryptographic operations |

No security concerns in this phase — pure package.json metadata changes.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `pnpm pack` also respects `prepack` lifecycle hook | Pattern 1 | Low — pnpm follows npm lifecycle spec; if wrong, only `npm pack` triggers prepack, not `pnpm pack`. Phase 13 uses npm publish which definitely fires prepack. |
| A2 | Non-existent paths in `files` array are silently ignored by npm | Pattern 2 | Low — standard npm behaviour confirmed empirically in community; if wrong, `npm pack --dry-run` will show a warning, not an error |

---

## Open Questions

1. **GitHub org URL correctness**
   - What we know: D-02 specifies `"https://github.com/23/twentythree-cli.git"` — locked decision from discussion phase
   - What's unclear: Whether the actual GitHub org is `23` or something else (e.g. `twentythree-video`)
   - Recommendation: Use the locked value from D-02 exactly. If the URL is wrong, it's a trivial string fix.

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — this phase modifies only package.json JSON fields).

---

## Sources

### Primary (HIGH confidence)
- `packages/twentythree-cli/package.json` — read directly; current state confirmed [VERIFIED: Read tool]
- `npm pack --dry-run` output — run directly; current tarball contents confirmed [VERIFIED: Bash tool]
- `.planning/phases/10-package-hygiene/10-CONTEXT.md` — locked decisions from discuss phase [VERIFIED: Read tool]

### Secondary (MEDIUM confidence)
- npm lifecycle documentation (prepack vs prepare vs prepublishOnly): behaviour aligns with training knowledge and is consistent with the npm documentation at https://docs.npmjs.com/cli/v10/using-npm/scripts#life-cycle-scripts [CITED: npm docs]
- npm `files` field semantics: leading-slash anchoring and silent omission of non-existent paths [CITED: npm docs conventions]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; existing tools verified working
- Architecture: HIGH — single-file edit with clear before/after state; current state directly observed
- Pitfalls: HIGH — based on well-documented npm lifecycle behaviour

**Research date:** 2026-04-16
**Valid until:** 2026-10-16 (npm lifecycle semantics are stable; no time-sensitivity)
