# Pitfalls Research: v1.1 Repository Polish & Release

**Domain:** TypeScript/Node.js CLI — TwentyThree video platform API client
**Researched:** 2026-04-16
**Overall Confidence:** HIGH (verified against installed package.json, manifest, spec, official oclif docs, npm docs, GitHub issue tracker)

---

## npm Publish Pitfalls

### Critical: No `prepack` Script — Stale Manifest Ships

**What goes wrong:** `pnpm publish` fires lifecycle hooks in this order: `prepublishOnly` → `prepack` → tarball → `postpack`. The current `package.json` has a `postbuild` script (runs after `npm run build`) but no `prepack`. `pnpm publish` never invokes `postbuild`. Whatever manifest is on disk at publish time is what ships — which may be from hours or days ago.

**Why it matters here:** `oclif.manifest.json` is oclif's command index. A stale manifest means installed users get wrong `--help` output, missing commands in tab completion, or stale flag descriptions. Without a manifest, oclif falls back to dynamic filesystem scanning, which is slower and unreliable in global installs.

**Prevention:**
```json
"prepack": "tsdown --config-loader unrun && oclif manifest"
```
`prepack` fires for both `pnpm publish` and `npm pack` (dry-run verification). This is the oclif-recommended pattern.

**Detection:** `npm pack --dry-run` — verify `oclif.manifest.json` appears in the file list and command count matches expectations:
```bash
python3 -c "import sys,json; d=json.load(open('oclif.manifest.json')); print(len(d['commands']), 'commands')"
```

---

### Critical: Version `0.1.0` Claims a Slot Forever

**What goes wrong:** Publishing `0.1.0` claims that version slot on the npm registry permanently. After 24 hours npm's unpublish window closes. If the first publish has a defect (missing dist, wrong bin), you can only fix it by bumping the version — `0.1.0` is gone. The internal v1.0 milestone is done; publishing as `0.1.0` signals beta quality that doesn't match the actual state.

**Prevention:**
1. Decide the public version before touching the registry. `1.0.0` is accurate for the shipped state.
2. Run `npm pack --dry-run` and install the local tarball to smoke test before registry publish:
   ```bash
   npm pack
   npm install -g ./twentythree-cli-1.0.0.tgz
   twentythree --version
   twentythree auth credentials
   ```
3. Tag git before publish: `git tag v1.0.0 && git push --tags`.
4. Use `pnpm publish --dry-run` to validate the publish flow without touching the registry.

---

### Critical: Package Name `twentythree-cli` May Be Taken

**What goes wrong:** `npm publish` fails immediately with `403 Forbidden — You do not have permission to publish "twentythree-cli"` if the name is already claimed. No recovery path — the name change propagates to binary name, install instructions, and README.

**Prevention:** Check before any other publish prep:
```bash
npm view twentythree-cli
```
404 means available. If taken, the fallback is a scoped package: `@twentythree/cli`.

---

### Moderate: `.npmignore` Added — Breaks `files` Whitelist Semantics

**What goes wrong:** The current package uses `files: ["/bin", "/dist", "/oclif.manifest.json"]` as a whitelist. This is correct. If anyone adds a `.npmignore` at the package level, npm switches from whitelist mode to exclusion mode — it starts with everything in the directory and applies `.npmignore` as a filter. If `.npmignore` doesn't explicitly exclude `src/`, the 254 TypeScript source files ship in the tarball. If it accidentally excludes `dist/`, the package is broken.

**Prevention:** Do not add `.npmignore`. The `files` whitelist is complete. Verify with `npm pack --dry-run` — if `src/**/*.ts` appears in the output, the `files` field has been bypassed.

---

### Moderate: `@napi-rs/keyring` Native Binary Silent Failure on Consumer Install

**What goes wrong:** `@napi-rs/keyring` ships prebuilt platform binaries as `optionalDependencies` (12 platform targets: darwin-arm64, darwin-x64, linux-x64-gnu, linux-x64-musl, win32-x64-msvc, etc. — confirmed from installed `node_modules/@napi-rs/keyring/package.json`). Clean `npm install -g` resolves the correct binary automatically.

The risk is a confirmed npm bug (npm/cli#4828): if a lockfile generated on one architecture is used on a different architecture (e.g., CI on macOS, then running on Linux), npm silently skips installing the optional platform binary. The CLI installs without error but crashes at first `auth` use with `Cannot find module '.../keyring.darwin-arm64.node'`.

**Consequences:** `twentythree auth credentials` crashes with a raw Node `MODULE_NOT_FOUND` error — not actionable for users.

**Prevention:**
1. Install verification CI must use a fresh `npm install -g` with no pre-existing lock file.
2. Test on minimum: `ubuntu-latest` (linux-x64-gnu) and `macos-latest` (darwin-arm64). These cover the two dominant consumer platforms.
3. Add a graceful error wrapper in the auth command: catch load failure from keyring and print a human-readable message rather than a raw module error.

---

### Minor: `bin/run.cmd` Permissions and Path

**What goes wrong:** Windows consumers need `bin/run.cmd`. The file exists and is in the `files` whitelist (`/bin`). The only risks are: (a) accidental edit that breaks the `%~dp0\run.js` reference, (b) the bin script is not executable on macOS/Linux (though `chmod` is set correctly — `bin/run.js` is `-rwxr-xr-x`). npm preserves the executable bit when packing.

**Prevention:** Do not edit `bin/run.cmd`. Confirm with `npm pack --dry-run` that both `bin/run.js` and `bin/run.cmd` appear in the listed files.

---

### Minor: pnpm Monorepo + `oclif pack tarballs` Incompatibility

**What goes wrong:** `oclif pack tarballs` (for standalone tarball distribution) expects `npm-shrinkwrap.json`. pnpm uses `pnpm-lock.yaml` and never generates it. The command fails with `ENOENT: no such file or directory, stat '.../npm-shrinkwrap.json'`. This issue was filed in 2023 (oclif/oclif#1170) and closed as "not planned" in 2024.

**Why it matters:** This project uses npm global install only — `oclif pack tarballs` is the wrong tool. The risk is a contributor running it by mistake.

**Prevention:** Use `pnpm publish --filter twentythree-cli` only. Document in dev setup notes that `oclif pack` is unsupported in this monorepo.

---

## Endpoint Audit Pitfalls

### Critical: Three Different Numbers — File Count, Manifest Count, Spec Count

**Current state:**
- ~254 `.ts` files in `src/commands/` (includes topic index stubs and helper files)
- 226 commands in `oclif.manifest.json` (what oclif actually registered)
- 235 operations in `specs/twentythree-api-swagger.json`
- 219 command files have `static agentMetadata` with `api_endpoint`

An audit that compares raw file counts to spec operation counts produces noise, not signal. The 9-command gap (235 spec - 226 manifest) needs decomposition: some manifest entries are non-API commands (auth, doctor, workspace management); some spec operations are collapsed into one command; some spec operations may be genuinely unimplemented.

**Prevention:** Use `operationId` as the canonical matching key. Every spec operation has a unique `operationId`. Build the audit script to:
1. Extract all `operationId` values from the swagger JSON
2. Extract all `api_endpoint` values from `static agentMetadata` in command files
3. Report exact diff as "spec ops with no matching command" and "commands with no matching spec op"

Maintain an `EXCLUDED_OPERATIONS` constant for intentional omissions (super-admin endpoints, topic-only index files, non-API commands like doctor/workspace/auth) with a comment explaining each exclusion.

---

### Critical: Terminology Mismatch Breaks Naïve Path Matching

**What goes wrong:** The spec uses legacy API names (`/photo/*`, `/album/*`, `/live/*`). The CLI uses modern terminology (`video`, `category`, `webinar`). An audit script that compares spec paths to command file paths will show zero matches for the 29 `/photo/*` paths, 4 `/album/*` paths, and 74 `/live/*` paths — a false negative rate of ~46% (107/235 endpoints).

**Why this project is specifically affected:** The `agentMetadata.api_endpoint` field already uses the legacy API path (`'GET /photo/list'`), not the CLI command name (`video list`). This is the correct field to match against the spec — but the audit script must parse `api_endpoint` from source files, not infer it from file paths.

**Prevention:** The audit script must grep `api_endpoint:` from command source files (not infer from file paths). The pattern `api_endpoint: 'METHOD /path'` in `agentMetadata` is the canonical link between CLI command and spec operation. Any path-based comparison will fail.

---

### Moderate: HTTP Method Collapsing — False Coverage Gaps

**What goes wrong:** Some API paths have multiple HTTP methods in the spec. The CLI may collapse both into a single command (e.g., a command using `GET /photo/list` for both list and get-by-id). An operationId-based audit flags the unused method's operationId as a coverage gap, even though the collapse is intentional.

**Example already present:** `video get` and `video list` both map to `GET /photo/list` (both show `api_endpoint: 'GET /photo/list'` in their agentMetadata). An audit comparing operationIds from both commands to spec operationIds will find the same spec op referenced twice — not two distinct ops covered.

**Prevention:** The `EXCLUDED_OPERATIONS` list must document every intentional collapse with rationale. The audit script should print these as "intentionally excluded" rather than silently ignoring them.

---

### Moderate: Topic Index Files Are Not API Commands

**What goes wrong:** 9 `index.ts` files in the commands tree (e.g., `video/index.ts`, `webinar/index.ts`, `category/index.ts`) are topic-level help dispatchers — they print "Run X --help for available commands" and have no `agentMetadata`. An audit that counts "command files with no agentMetadata" will flag all 9 as missing coverage.

**Prevention:** The audit script must distinguish topic index files (no `agentMetadata`, no `api_endpoint`) from leaf command files (have `agentMetadata`). Topic index files are structural scaffolding, not API operations, and should be excluded from coverage analysis by file pattern (`**/index.ts`).

---

### Minor: Deprecated Operations Not Filtered

**What goes wrong:** The current spec has 0 operations marked `deprecated: true` (verified). If future spec updates add deprecated operations, a naive audit will flag them as "missing coverage." Building commands for deprecated endpoints is wasteful.

**Prevention:** Add a `deprecated` filter to the audit script now:
```python
if op.get('deprecated', False):
    continue  # skip deprecated operations
```
This is a no-op for v1.1 but prevents false positives in future audit runs.

---

### Minor: `agentMetadata.api_endpoint` Format Inconsistency

**What goes wrong:** The `api_endpoint` field is a free-form string (`'GET /photo/list'`). If any command was authored with a slightly different format — extra space, lowercase method, different path casing — the audit script's string matching will produce a false negative.

**Prevention:** The audit script should normalize both sides before comparison: uppercase method, strip leading/trailing whitespace, strip the `/api/2` prefix if present. A validation pass that checks all `api_endpoint` values match the pattern `^(GET|POST|PUT|PATCH|DELETE) /\S+$` will catch formatting issues before the audit comparison runs.

---

## README Pitfalls

### Critical: No README at Package or Repo Root

**Current state:** There is no `README.md` in `packages/twentythree-cli/` and no `README.md` at the repo root. npm shows "No README" on the package page — this is the first impression for every potential user.

**What goes wrong:** npm's package page is blank. `npm view twentythree-cli` returns no description beyond the `package.json` description field. Potential adopters see no install instructions, no auth flow, no examples — and bounce.

**Prevention:** The README must exist at the package root (or repo root with a symlink/copy at the package level) before `npm publish`. Minimum viable README sections in priority order:
1. One-line description + what it does
2. `npm install -g twentythree-cli` — the single install command
3. Auth setup: `twentythree auth credentials` — the first command a user runs
4. One realistic example command that shows value immediately
5. Link to full command reference

---

### Critical: Auth Flow Not Explained in First Screen

**What goes wrong:** This CLI requires `twentythree auth credentials` before any other command works. Every other command fails with an authentication error until this step is done. If the README does not make this explicit and first, users hit an error on their second command, assume the CLI is broken, and leave.

**Prevention:** The README must present auth setup as step 1, not buried in a "Configuration" section. The quickstart flow must be:
```
npm install -g twentythree-cli
twentythree auth credentials    # required first step
twentythree video list          # now this works
```
Do not show `video list` before `auth credentials` in any example sequence.

---

### Moderate: Missing Node Version Requirement

**What goes wrong:** The CLI requires Node.js >= 22 (enforced in `bin/run.js` before oclif loads). A user on Node 18 or 20 will install successfully but get a clear error on first run. If the README does not state the Node requirement prominently, support issues follow.

**Prevention:** State Node 22+ in the Requirements/Prerequisites section and in the `engines` badge if badges are used. The error message from `bin/run.js` is already good (`"twentythree requires Node.js 22 or later"`), but users should not have to discover this post-install.

---

### Moderate: Terminology Mismatch Confuses API-Familiar Users

**What goes wrong:** Users who know the TwentyThree API use `photo`, `album`, and `live` as object names. The CLI uses `video`, `category`, and `webinar`. A user searching the README for "photo" or "album" finds nothing and assumes the command doesn't exist.

**Prevention:** Include a terminology mapping table or callout in the README:
```
API term → CLI command
photo    → video
album    → category
live     → webinar
```
This prevents confused support questions from existing TwentyThree API users.

---

### Moderate: Credential Storage Location Not Documented

**What goes wrong:** Users ask "where are my tokens stored?" and "how do I revoke access?" The README should answer both. Without this, security-conscious users in organizations don't feel safe installing.

**Prevention:** One sentence in the auth section: "Credentials are stored in your OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service) — never in plaintext files." Include `twentythree auth logout` (if implemented) or note how to remove credentials manually.

---

### Minor: No `--json` Flag Documented

**What goes wrong:** Every command supports `--json` output for scripting and piping. This is a major differentiator for CLI tools used in automation. If it is not in the README, adoption in pipelines and scripts is lower.

**Prevention:** One section showing the `--json` flag with example output. Show the JSON shape — `{ ok, data, summary, breadcrumbs }`. This demonstrates the tool is pipeline-ready, not just interactive.

---

### Minor: `oclif readme` Placeholders Missing

**What goes wrong:** `oclif readme` generates the command reference section by replacing HTML comment tags in the README. If the README does not contain `<!-- usage -->` and `<!-- commands -->` tags, `oclif readme` silently does nothing — no error, no output — and the command reference is never inserted.

**Prevention:** Write these tags into the README before running `oclif readme` the first time. They are invisible in rendered Markdown and must be placed at the exact position where generated content should appear.

---

## Documentation Drift

### Critical: `oclif readme` Run Once and Never Again

**What goes wrong:** `oclif readme` inserts a generated command reference into the README at `<!-- commands -->`. Every time a flag is added, a command is changed, or a description is updated, the README goes out of sync. With 219 commands, this divergence is invisible until a user notices wrong flag names or missing commands and files an issue.

**Why it happens fast:** Adding a single flag to one command, changing a description, or adding one new command makes the README stale. There is no automatic check.

**Prevention:**
1. Wire `oclif readme` into the `prepack` script so it runs on every publish:
   ```json
   "prepack": "tsdown --config-loader unrun && oclif manifest && oclif readme"
   ```
2. Add a CI check: run `oclif readme --dry-run`, diff against committed README, fail CI if non-empty diff. This makes stale docs a build failure, not a human oversight.
3. For the multi-page `docs/` tree: `oclif readme --multi --nested-topics-depth 2 --output-dir docs` in the same prepack step.

---

### Moderate: `docs/` Reference Goes Stale After Every Release

**What goes wrong:** If `docs/` is generated once for v1.1 and then committed, future commits that change command flags, add commands, or alter descriptions leave `docs/` stale. Users reading the docs get wrong information about flags that no longer exist or miss new options.

**Why it is worse than README drift:** The main README has the `<!-- commands -->` autogeneration hook. Docs pages written by hand (contributing, dev setup, API upgrade guide) have no hook — they must be manually maintained. The command reference pages generated by `oclif readme --multi` can be re-generated, but the hand-authored pages cannot.

**Prevention:**
1. Separate generated docs from hand-authored docs. Keep generated pages regenerable from the manifest on every `prepack`. Keep hand-authored pages (contributing, API upgrade guide) as the only manually maintained files.
2. Add a note at the top of each generated page: "This file is auto-generated. Do not edit manually — run `oclif readme --multi --output-dir docs` to regenerate."
3. The CI diff check (see above) catches generated page drift automatically.

---

### Moderate: API Upgrade Guide Goes Stale After Spec Changes

**What goes wrong:** The `docs/api-spec-upgrade-guide.md` (or equivalent) documents the `pnpm update-api-spec` workflow. If the spec update script path changes, the script gains new behavior, or new steps are needed, the guide silently gives wrong instructions. API-aware users following the guide run commands that no longer match the workflow.

**Prevention:** The upgrade guide is hand-authored — it cannot be auto-generated. Treat it as a living document that must be updated alongside any changes to `update-api-spec.sh` or the `pnpm update-api-spec` workflow. Add a "Last verified: [date]" header so staleness is visible.

---

### Minor: `oclif readme --multi` Flat Directory Without `--nested-topics-depth`

**What goes wrong:** With 219 commands across topics including nested ones (`video section`, `video subtitle`, `webinar poll`, `webinar room`, `webinar speakers`, `analytics video`, `analytics conversions`), `oclif readme --multi` without `--nested-topics-depth 2` produces a flat directory of ~40 files. Related commands are not co-located. Navigation is poor.

**Prevention:** Always run with `--nested-topics-depth 2`:
```bash
oclif readme --multi --nested-topics-depth 2 --output-dir docs/commands
```
Also generate a hand-authored `docs/commands/README.md` index — oclif does not create one automatically.

---

### Minor: Version Number in Docs Gets Stale

**What goes wrong:** Any docs page that hardcodes "v1.0.0" or "version 1.0.0" in install instructions becomes stale after the first patch release. Users copy-paste `npm install -g twentythree-cli@1.0.0` instead of `npm install -g twentythree-cli`.

**Prevention:** Never hardcode a version number in install instructions. Use `npm install -g twentythree-cli` (no version pin) everywhere in docs. The `<%= config.version %>` oclif template variable is available in command `examples` but not in README prose — just use unpinned install commands.

---

## Prevention Strategies by Phase

| Phase | Pitfall | Prevention |
|-------|---------|------------|
| npm publish — pre-flight | Package name `twentythree-cli` unavailable | `npm view twentythree-cli` — first action before any prep |
| npm publish — pre-flight | Wrong public version (`0.1.0` vs `1.0.0`) | Decide version; consider `1.0.0` to match internal milestone |
| npm publish — prep | No `prepack` script; stale dist and manifest ship | Add `prepack: "tsdown --config-loader unrun && oclif manifest"` |
| npm publish — verify | `.npmignore` breaks `files` whitelist | Never add `.npmignore`; run `npm pack --dry-run` to verify |
| npm publish — verify | `src/` or `.planning/` leaked into tarball | `npm pack --dry-run` — inspect full file list |
| npm publish — verify | Missing README on npm package page | Create `README.md` at package root before publish |
| Install verification | Native keyring binary missing on Linux | Fresh `npm install -g` on `ubuntu-latest`; no lock file reuse |
| Install verification | `bin/run.cmd` missing or broken on Windows | Confirm `/bin` in `files` field; `npm pack --dry-run` |
| Endpoint audit | Counting files instead of matching operationIds | Audit script matches on `agentMetadata.api_endpoint` strings |
| Endpoint audit | Legacy `/photo/`/`/album/`/`/live/` paths not matched | Parse `api_endpoint` from source; never infer from file path |
| Endpoint audit | Topic index files (`index.ts`) flagged as missing coverage | Exclude `**/index.ts` from leaf command analysis |
| Endpoint audit | HTTP method collapse causes false gaps | `EXCLUDED_OPERATIONS` list with rationale for each entry |
| Endpoint audit | Deprecated endpoints flagged as missing | Add `deprecated: true` filter in audit script |
| README authoring | Auth flow not shown first | `auth credentials` is step 1 in every quickstart sequence |
| README authoring | Node 22+ requirement not stated | Add to Prerequisites; add badge if using shields.io |
| README authoring | `<!-- usage -->` and `<!-- commands -->` tags missing | Insert tags before first `oclif readme` run |
| README authoring | Terminology mismatch (photo/album/live) | Add terminology mapping table |
| Docs generation | `oclif readme` not wired to prepack | Add `oclif readme` to `prepack` after `oclif manifest` |
| Docs generation | CI does not catch stale docs | `oclif readme --dry-run` + diff check in CI |
| Docs generation | Flat `docs/` without topic hierarchy | `--multi --nested-topics-depth 2` always |
| Docs drift | Hand-authored guides go stale after script changes | "Last verified" header on upgrade guide; update alongside script |
| Docs drift | Version numbers hardcoded in docs | Use unpinned `npm install -g twentythree-cli` in all docs |

---

## Sources

- oclif release documentation: https://oclif.io/docs/releasing/
- oclif readme command reference: https://github.com/oclif/oclif/blob/main/docs/readme.md
- npm lifecycle scripts (prepack order): https://docs.npmjs.com/cli/v11/using-npm/scripts/
- npm pack dry-run guide: https://stevefenton.co.uk/blog/2024/01/testing-npm-publish/
- npm publish files field semantics: https://docs.npmjs.com/cli/v8/commands/npm-publish/
- NAPI-RS release/distribution (platform optionalDependencies): https://napi.rs/docs/deep-dive/release
- npm platform-specific optional dependency lockfile bug (npm/cli#4828): https://github.com/napi-rs/napi-rs/issues/2569
- oclif pnpm workspace issue, closed not-planned 2024: https://github.com/oclif/oclif/issues/1170
- @napi-rs/keyring optionalDependencies: confirmed from installed node_modules/@napi-rs/keyring/package.json (12 platform targets)
- OpenAPI deprecated operation field: https://swagger.io/specification/
