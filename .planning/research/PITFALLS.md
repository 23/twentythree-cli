# Domain Pitfalls

**Domain:** TypeScript/Node.js CLI — TwentyThree video platform API client
**Researched:** 2026-04-16 (updated for v1.1 milestone: npm publish + docs + endpoint audit)
**Overall Confidence:** HIGH (verified against official docs, GitHub issues, npm/pnpm issue trackers)

---

## v1.1 Milestone Pitfalls: npm Publish, Docs Generation, Endpoint Audit

This section documents pitfalls specific to the v1.1 milestone work: first npm publish of the
oclif v4 CLI, generating and maintaining command reference docs, and auditing OpenAPI endpoint
coverage. The project already has a working v1.0 CJS build, 219 commands, `@napi-rs/keyring`,
and a pnpm monorepo.

---

## Critical Pitfalls

---

### Pitfall 1: Publishing a Stale `oclif.manifest.json` (or Publishing Without One)

**What goes wrong:** `oclif.manifest.json` is the index oclif uses for command discovery. If it
is stale (built from a previous session, or reflecting a different command set), installed users
get wrong `--help` output, missing commands, or commands that reference non-existent dist files.
If the manifest is absent from the published tarball, oclif falls back to dynamic filesystem
scanning — which is slower and breaks in global installs where the dist layout may differ from
dev.

**Why it happens:**
- The current `postbuild` script runs `oclif manifest` after build — correct for local dev.
  But `npm publish` and `pnpm publish` do not re-run `postbuild`; they only invoke lifecycle
  hooks in the order: `prepack` → pack tarball → `postpack` → `publish` → `postpublish`.
- There is no `prepack` script in the current `package.json`. This means the manifest in the
  tarball is whatever happens to be on disk at publish time.
- The root `.gitignore` correctly excludes `oclif.manifest.json` (it is a build artifact). So
  the file is not in source control; if the build has not been run in the current session, the
  on-disk manifest may be from hours or days ago.

**Consequences:** Every consumer gets a subtly broken CLI — commands missing from `--help`, tab
completion broken, stale flag descriptions, or runtime errors from commands that no longer exist
in dist.

**Prevention:**
Add a `prepack` script that runs the full build + manifest generation:
```json
"prepack": "tsdown --config-loader unrun && oclif manifest"
```
`prepack` fires for both `npm pack` (dry-run verification) and `npm publish` / `pnpm publish`.
This is the oclif-recommended pattern; many oclif examples also include `oclif readme` here.

**Detection:** Run `npm pack --dry-run` and check that `oclif.manifest.json` is in the listed
files and that the command count matches `src/commands/` expectations. Run
`cat oclif.manifest.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['commands']), 'commands')"`.

**Phase:** First action in the npm publish phase, before any publish attempt.

---

### Pitfall 2: `@napi-rs/keyring` Native Binary Silent Failure on Consumer Install

**What goes wrong:** `@napi-rs/keyring` ships prebuilt platform-specific binaries as
`optionalDependencies` (`@napi-rs/keyring-darwin-arm64`, `@napi-rs/keyring-linux-x64-gnu`, etc.
— 12 platform targets total, confirmed from the installed `package.json`). When a consumer runs
`npm install -g twentythree-cli`, npm resolves the correct platform binary from this list. This
works correctly for clean installs.

The risk is a confirmed npm bug (npm/cli#4828): if a `package-lock.json` generated on one
architecture is used on a different architecture (e.g., CI generated on macOS, then reused on
Linux), npm silently skips installing the platform's optional binary dependency. The CLI installs
without error but crashes at first `auth` use with `Cannot find module '.../keyring.darwin-arm64.node'`
or similar.

**Why it matters for this project:** The published package itself is fine — the `@napi-rs/keyring`
`package.json` correctly declares all platform variants as `optionalDependencies`, and clean
`npm install -g` on any supported platform works. The risk is in install verification CI: if the
CI job reuses a lock file from a different platform, the test passes on the CI machine but the
binary was never actually loaded.

**Consequences:** `twentythree auth credentials` crashes on any platform where the native binary
is absent. The error is a raw Node `MODULE_NOT_FOUND` thrown from inside the napi-rs binding
loader — not a user-friendly message.

**Prevention:**
1. For install verification CI: use a fresh `npm install -g` from the registry (no pre-existing
   lock file). Do not share `node_modules` or `package-lock.json` between CI jobs that run on
   different architectures.
2. Test on at minimum: `ubuntu-latest` (linux-x64-gnu) and `macos-latest` (darwin-arm64 on
   modern GitHub Actions runners). These are the two most common consumer platforms.
3. Add a graceful error in the auth command: if keyring throws on load, catch it and print:
   `Error: OS keychain not available on this platform. Supported platforms: macOS, Windows,
   Linux (with libsecret).` This replaces the cryptic module error with actionable guidance.

**Detection:** After publishing, run `npm install -g twentythree-cli` on a fresh Linux x64
environment (GitHub Actions `ubuntu-latest` is ideal) and execute `twentythree auth credentials`.
Any crash involving `.node` file loading is this pitfall.

**Phase:** Install verification phase. The graceful error is a good auth-command improvement.

---

### Pitfall 3: Version Number Claimed Permanently on npm Registry

**What goes wrong:** The current `package.json` version is `0.1.0`. Publishing `0.1.0` to npm
claims that slot permanently. After 24 hours, npm's deprecation window closes and the version
cannot be unpublished or republished. If there is a critical defect in the first publish
(missing dist files, wrong bin path, broken keyring), a new version must be bumped and published —
`0.1.0` is gone forever.

**Why it matters:** The v1.0 internal milestone has shipped a fully functional CLI. Publishing as
`0.1.0` undersells it and signals beta quality to npm consumers. Publishing as `1.0.0` is more
accurate and sets correct expectations.

**Prevention:**
1. Decide the public version before publishing. Given internal v1.0 is done, consider publishing
   as `1.0.0`.
2. Run `npm pack --dry-run` to verify tarball contents. Then install the local tarball with
   `npm install -g ./twentythree-cli-1.0.0.tgz` and smoke test before touching the registry.
3. Use `npm publish --dry-run` (or `pnpm publish --dry-run`) to validate the publish flow
   without actually pushing.
4. Tag the git commit before pushing: `git tag v1.0.0 && git push --tags`.

**Phase:** npm publish phase — decide version before any publish attempt.

---

## Moderate Pitfalls

---

### Pitfall 4: `.npmignore` Added Accidentally — Breaks `files` Whitelist Semantics

**What goes wrong:** The current package uses the `files` field in `package.json` as a whitelist:
`["/bin", "/dist", "/oclif.manifest.json"]`. This is the correct approach. The root `.gitignore`
excludes `dist/` (correct — it is a build artifact), but this does NOT affect npm publish because
the `files` field takes precedence over `.gitignore`.

The trap: if someone adds a `.npmignore` at the package level (thinking it is needed to "clean
things up" or exclude `src/`), npm switches from whitelist mode to exclusion mode. In exclusion
mode, npm starts with everything in the directory and applies `.npmignore` as a filter. If
`.npmignore` inadvertently includes `dist/` or `oclif.manifest.json`, the published package is
broken. Conversely, if `.npmignore` is added but `src/` is not in it, the TypeScript sources are
now included (158KB+ of `.ts` files).

**Why it happens:** Developers mix up `.npmignore` and `.gitignore` semantics. The presence of
`.npmignore` changes the entire publish filtering algorithm.

**Prevention:** Do not add a `.npmignore` at the package level. The current `files` whitelist is
correct and complete. Add a comment in `package.json` or contributing docs noting this.

**Detection:** `npm pack --dry-run` — examine the full file list for unexpected inclusions
(`src/**/*.ts`) or missing items (`dist/`, `oclif.manifest.json`).

**Phase:** npm publish phase. Verify with `npm pack --dry-run` before first publish.

---

### Pitfall 5: No `prepack` Script — `postbuild` Does Not Fire on Publish

**What goes wrong:** `postbuild` runs after `npm run build`, but `pnpm publish` does not invoke
`npm run build`. `pnpm publish` fires lifecycle hooks in this order: `prepublishOnly` →
`prepack` → tarball → `postpack` → `publish` → `postpublish`. The `postbuild` hook is never
invoked. If the last local build was hours ago, the tarball bundles a stale dist and stale
manifest.

**Related:** `pnpm publish --filter twentythree-cli` from the monorepo root runs lifecycle
scripts defined in the workspace package — so a `prepack` in the CLI package's `package.json`
will run correctly.

**Prevention:**
```json
"prepack": "tsdown --config-loader unrun && oclif manifest"
```

**Phase:** npm publish phase.

---

### Pitfall 6: Manifest Count vs Spec Count Mismatch — Audit False Confidence

**What goes wrong:** The current state has three different numbers:
- 254 `.ts` files in `src/commands/` (includes index barrel files, sub-command parent stubs, and
  helper files)
- 226 commands in `oclif.manifest.json` (what oclif actually registered)
- 235 operations in the OpenAPI spec

An audit that compares file counts or manifest counts directly to spec operation counts will
produce misleading results. The 9-command gap (235 spec - 226 manifest) needs investigation:
some are likely: (a) helper/utility commands (auth, doctor, workspace) that have no spec
counterpart; (b) endpoints collapsed into a single command (same path, multiple HTTP methods);
(c) genuinely unimplemented spec operations.

**Prevention:**
1. Use `operationId` as the canonical comparison key. Every spec operation has a unique
   `operationId`. All 219 command files already declare `static agentMetadata` — the audit
   script should compare `agentMetadata.operationId` values against spec `operationId` values.
2. Build a script that: (a) extracts all `operationId` values from the swagger JSON, (b) greps
   all command files for `operationId` in their `agentMetadata`, (c) reports the exact diff as
   "spec ops with no matching command" and "commands with no matching spec op."
3. Maintain an `EXCLUDED_OPERATIONS` constant in the audit script for intentional omissions
   (super-admin endpoints, operations requiring non-bearer auth scopes) with a comment
   explaining each exclusion.

**Detection:** The audit script output is the deliverable. Gaps flagged by operationId are
actionable; gaps in file counts are noise.

**Phase:** Endpoint audit phase — the audit script itself is the first milestone deliverable.

---

### Pitfall 7: Endpoint Audit False Positives from HTTP Method Collapsing

**What goes wrong:** Some API paths have multiple HTTP methods in the spec (e.g.,
`GET /api/2/photo/list` and `POST /api/2/photo/list`). The CLI may collapse both into a single
`video list` command that always uses one method. An operationId-based audit will flag the
unused method's operationId as a coverage gap, even though the behavior is intentional.

**Why it happens:** OpenAPI treats each `{path, method}` pair as a separate operation with its
own `operationId`. A CLI command conceptually maps to one action, not one HTTP method.

**Prevention:** The `EXCLUDED_OPERATIONS` list (see Pitfall 6) should document every intentional
collapse. The audit script should print these explicitly as "intentionally excluded" rather than
silently ignoring them, so future maintainers understand why they are not flagged.

**Phase:** Endpoint audit phase.

---

### Pitfall 8: Deprecated Endpoint Handling in Audit (Currently None, Future Risk)

**What goes wrong:** The current TwentyThree OpenAPI spec has 0 operations marked
`deprecated: true` (verified against the spec). If the spec gains deprecated operations in the
future, a naive audit script will flag them as "missing coverage" if no CLI command exists. But
building commands for deprecated endpoints is wasteful and confusing.

**Prevention:**
1. The audit script should filter out spec operations where `deprecated: true` and exclude them
   from the "missing coverage" count. Log them separately as "deprecated — not implemented by
   design."
2. No action needed for v1.1 since there are currently 0 deprecated operations. But add the
   `deprecated` filter to the audit script now so it handles future spec changes correctly.

**Phase:** Endpoint audit phase — add the filter even though it is a no-op today.

---

### Pitfall 9: `oclif readme` Generates Docs That Go Stale

**What goes wrong:** `oclif readme` regenerates `<!-- commands -->` blocks in a README using the
manifest. If it is run once and not re-run after adding commands or changing flags, the published
docs show wrong flags, old subcommands, or missing commands. With 219 commands, this divergence
is invisible until a user reports it.

**Why it happens:** `oclif readme` is a one-time manual step unless wired into a CI check.
Contributors add commands without regenerating docs.

**Consequences:** README shows 219 commands while the CLI has 226+. Flag names differ from the
CLI. Users file issues. First impressions on npm suffer.

**Prevention:**
1. Add `oclif readme` to the `prepack` script: `tsdown && oclif manifest && oclif readme`.
2. Add a CI check: run `oclif readme --dry-run` and diff the output against the committed
   README. Fail CI if the diff is non-empty. This makes stale docs a build failure, not a
   human oversight.
3. For the multi-page `docs/` tree: run `oclif readme --multi --nested-topics-depth 2
   --output-dir docs` in the same prepack step.

**Note on required tags:** The README must contain `<!-- usage -->` and `<!-- commands -->` HTML
comment tags. Without them, `oclif readme` silently does nothing — no error, no output. This
is easy to miss on first setup.

**Phase:** Documentation phase. Add the CI check before tagging v1.1.

---

### Pitfall 10: `oclif readme --multi` Produces a Flat Wall of Files in `docs/`

**What goes wrong:** With 219 commands across 40 tags (including nested ones like
`Webinars: Polls`, `Webinars: Room`, `Webinars: Speakers`), `oclif readme --multi` produces one
Markdown file per topic. Without `--nested-topics-depth`, all files land at the same level in
`docs/` — a flat directory of 40 files with no hierarchy. Webinar-related docs are not grouped.

**Prevention:** Use `oclif readme --multi --nested-topics-depth 2 --output-dir docs`. This
creates subdirectories for topics with subtopics (e.g., `docs/webinars/polls.md`). Also add a
hand-authored `docs/README.md` index — oclif does not generate an index file automatically.

**Phase:** Documentation phase.

---

### Pitfall 11: pnpm Monorepo + `oclif pack tarballs` Incompatibility

**What goes wrong:** The `oclif pack tarballs` command (for standalone tarball distribution —
NOT npm publish) expects an `npm-shrinkwrap.json` file. pnpm uses `pnpm-lock.yaml` and never
generates `npm-shrinkwrap.json`. The command fails with:
```
Error: ENOENT: no such file or directory, stat '.../npm-shrinkwrap.json'
```
The issue was filed in August 2023 (oclif/oclif#1170) and closed as "not planned" in April 2024.

**Why it matters:** This project targets npm global install only, not standalone tarballs. So
`oclif pack tarballs` should never be used. The risk is a developer unfamiliar with the project
trying to run it.

**Prevention:** Use `pnpm publish --filter twentythree-cli` for distribution. Document in
contributing notes that `oclif pack` is not supported with pnpm and should not be used.

**Phase:** Not blocking for v1.1. Note in contributing/dev-setup docs.

---

### Pitfall 12: npm Registry Package Name Availability

**What goes wrong:** `twentythree-cli` may already be taken on the npm registry. If so, `npm publish`
fails with `403 Forbidden — You do not have permission to publish "twentythree-cli"`.

**Prevention:** Check before starting the publish phase: `npm view twentythree-cli` — if it 404s,
the name is available. If it returns metadata, the name is taken and an alternative must be chosen
(`@twentythree/cli` as a scoped package is the fallback).

**Phase:** Very first step of npm publish phase, before any other setup.

---

## Minor Pitfalls

---

### Pitfall 13: `bin/run.cmd` Missing or Malformed — Windows Install Broken

**What goes wrong:** Windows users installing via `npm install -g` need the `.cmd` wrapper to run
the CLI as `twentythree`. The file `bin/run.cmd` already exists in this project. The risk is
accidental editing that breaks the path reference, or the file being excluded from the tarball
if the `files` field is misconfigured.

**Prevention:** The current `files: ["/bin"]` includes the entire `bin/` directory, so
`run.cmd` is included. Verify with `npm pack --dry-run`. Do not edit `bin/run.cmd` unless you
understand the Windows CMD shebang equivalent pattern.

**Phase:** Install verification phase. Test on Windows runner if possible.

---

### Pitfall 14: `src/` Leaked Into Published Tarball

**What goes wrong:** If `.npmignore` is added (see Pitfall 4) and `src/` is not explicitly
excluded, the TypeScript source files ship in the tarball. With 254 `.ts` files, this inflates
the package significantly and exposes internals.

**Prevention:** Do not add `.npmignore`. The current `files` whitelist (`/bin`, `/dist`,
`/oclif.manifest.json`) is complete. `src/` is not in the whitelist and will not be included.
Verify with `npm pack --dry-run`.

**Phase:** npm publish verification.

---

### Pitfall 15: All Commands Loaded at Manifest/Readme Generation Time (Slow CI)

**What goes wrong:** There is an open oclif issue (oclif/oclif#606, oclif/core#997) where oclif
loads all command modules at startup to resolve aliases defined as class properties. This is
unresolved and requires a breaking change. For development (with ts-node), this can cause
`oclif manifest` and `oclif readme` to take several seconds with 219 commands.

**Why it matters for v1.1:** The `prepack` step runs `oclif manifest` against the compiled CJS
`dist/`. Since each file is a pre-compiled `.cjs` module (not TypeScript being compiled on the
fly), this is significantly faster in the dist build than in development. The issue primarily
affects development-time tooling, not the published CLI's startup time (manifest caching handles
that).

**Prevention:** No action required for v1.1. If `oclif manifest` is slow in CI, measure it —
if under 30 seconds for 219 commands in CJS mode, it is acceptable. If it is genuinely slow,
run it in a separate pre-publish step rather than inline in `prepack`.

**Phase:** Monitor; no action needed unless CI times exceed tolerable thresholds.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| npm publish — prep | No `prepack` script; stale manifest shipped | Add `prepack` before first publish |
| npm publish — prep | Package name `twentythree-cli` may be taken | Check with `npm view twentythree-cli` first |
| npm publish — prep | Version `0.1.0` undersells shipped functionality | Decide public version; consider `1.0.0` |
| npm publish — verify | `.npmignore` added → breaks `files` whitelist | Never add `.npmignore`; use `files` only |
| npm publish — verify | `src/` leaked into tarball | Verify with `npm pack --dry-run` before publish |
| Install verification | Native binary missing on Linux/Windows CI | Test on ubuntu-latest; add graceful keyring error |
| Endpoint audit | File count ≠ manifest count ≠ spec count | Use `operationId` comparison via `agentMetadata` |
| Endpoint audit | HTTP method collapse creates false coverage gaps | Maintain `EXCLUDED_OPERATIONS` list with rationale |
| Endpoint audit | Deprecated endpoints flagged as missing | Add `deprecated: true` filter to audit script |
| Docs generation | `oclif readme` no-ops without HTML comment tags | Insert `<!-- usage -->` and `<!-- commands -->` tags |
| Docs generation | `--multi` produces flat docs/ directory | Use `--nested-topics-depth 2` + hand-authored index |
| Docs staleness | Docs diverge from commands after each release | Wire `oclif readme` into `prepack`; add CI diff check |
| pnpm monorepo | `oclif pack tarballs` fails — wrong lockfile format | Do not use `oclif pack`; use `pnpm publish` only |

---

## Sources

- oclif release documentation: https://oclif.io/docs/releasing/
- oclif readme command docs: https://github.com/oclif/oclif/blob/main/docs/readme.md
- oclif pnpm workspace issue (ENOENT npm-shrinkwrap.json, closed not-planned 2024): https://github.com/oclif/oclif/issues/1170
- oclif all-commands-loaded startup issue: https://github.com/oclif/oclif/issues/606
- npm platform-specific optional dependency lockfile bug (npm/cli#4828): https://github.com/npm/cli/issues/4828
- npm platform-specific dependency bug explainer: https://loke.dev/blog/npm-platform-specific-dependencies-bug
- NAPI-RS release/distribution docs: https://napi.rs/docs/deep-dive/release
- @napi-rs/keyring optionalDependencies (confirmed from installed package.json: 12 platform targets)
- npm pack dry-run verification guide: https://stevefenton.co.uk/blog/2024/01/testing-npm-publish/
- oclif manifest missing from files field issue: https://github.com/oclif/oclif/issues/198
- OpenAPI deprecated field spec: https://swagger.io/specification/ (operation object, deprecated property)
- prepack vs prepublishOnly lifecycle: https://docs.npmjs.com/cli/v11/using-npm/scripts/

---

## v1.0 Pitfalls (Retained for Reference)

The pitfalls below were documented during the v1.0 milestone. They are resolved or already
handled in the existing codebase.

### Pitfall C1: Plaintext Credential Storage — RESOLVED
Used `@napi-rs/keyring` from the start. Bearer tokens stored in OS keychain.

### Pitfall C2: Token Refresh Race Condition — RESOLVED
`proper-lockfile` used around token read-check-refresh-write cycle. File lock in place.

### Pitfall C3: Token Expiry During Long Operations — RESOLVED
Proactive refresh timer in auth layer with 5-minute buffer.

### Pitfall C4: Operating on Wrong Workspace — RESOLVED
Active workspace shown in command output. `--workspace` override available on all commands.

### Pitfall M2: ESM/CJS Module Interop — RESOLVED
CJS build; chalk 4.x, ora 5.x pinned; no ESM-only dep issues.

### Pitfall M4: Terminology Mapping Leaking — RESOLVED
`term-map.ts` applied in all output paths; legacy API terms do not reach user-facing output.

### Pitfall M5: Startup Latency — MITIGATED
CJS build with oclif manifest caching; `unbundle: false` in tsdown with `--config-loader unrun`.
Startup within acceptable bounds. Not fully bundled (single-file) due to tsdown unbundle mode,
but manifest caching means most module loads are deferred.
