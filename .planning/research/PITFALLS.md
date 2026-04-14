# Domain Pitfalls

**Domain:** TypeScript/Node.js CLI — TwentyThree video platform API client
**Researched:** 2026-04-14
**Overall Confidence:** HIGH (most findings verified via official sources, real-world issue trackers, and framework docs)

---

## Critical Pitfalls

Mistakes that cause rewrites, security incidents, or complete loss of user trust.

---

### Pitfall C1: Plaintext Credential Storage

**Severity:** BLOCKING — security incident if exploited

**What goes wrong:**
Credentials (bearer tokens, domain + token pairs) are written to a JSON file under `~/.config/twentythree/` without encryption, world-readable by default on Linux/macOS, and routinely leaked into dotfile backups, Dropbox sync, or `git add .` accidents.

**Why it happens:**
It is the path of least resistance. `JSON.stringify` to a config file feels like a complete solution. The file-system fallback is often kept even after adding a keychain, so the token ends up in two places.

**Consequences:**
Bearer tokens for all activated workspaces exposed. An attacker with read access to the user's home directory can impersonate them against every workspace.

**Prevention:**
- Use `@napi-rs/keyring` (Rust-backed, NAPI-RS binding, `node-keytar`-compatible API, no `libsecret` dependency on Linux). This is the current community consensus replacement for the archived `node-keytar` package. Azure SDK, Microsoft MSAL-node, and Joplin have all migrated to it.
- Store only non-sensitive metadata (active workspace slug, preferences) in `~/.config/twentythree/config.json`.
- If the keychain is unavailable (headless CI servers), fall back to a file with `chmod 0600` applied immediately after write — and warn the user explicitly.
- Never fall back silently. Document the fallback behavior.

**Detection:**
Check whether `~/.config/twentythree/` contains any token-shaped strings. If a credentials JSON exists at all outside the keychain, that is the symptom.

**Reference:** [keyring-node GitHub](https://github.com/Brooooooklyn/keyring-node) | [Joplin migration issue](https://github.com/laurent22/joplin/issues/8829) | [Azure SDK migration issue](https://github.com/Azure/azure-sdk-for-js/issues/29288)

---

### Pitfall C2: Token Refresh Race Condition Across Concurrent Processes

**Severity:** BLOCKING — user is logged out mid-operation with no recovery path

**What goes wrong:**
A user runs two terminal windows simultaneously, both with long-running `twentythree` commands. Both processes detect the bearer token is about to expire. Both call the refresh endpoint. OAuth refresh tokens are single-use: the first process wins, the second receives a `401` or `404` and has no valid credentials left. The user must re-authenticate.

This exact failure mode is documented in Claude Code's issue tracker (anthropics/claude-code #27933 and #24317), n8n (n8n-io/n8n #13088), and OpenClaw. It is not theoretical.

**Why it happens:**
Each process reads its own in-memory copy of the token, independently detects expiry, and races to refresh without coordination.

**Consequences:**
Authentication failure mid-operation. For destructive operations (delete video, modify category) this leaves state unknown. The user must re-auth, losing context.

**Prevention:**
Two-layer strategy:

1. **File lock on refresh write.** Use `proper-lockfile` or OS-level `flock` around the read-expiry-check-refresh-write cycle. Any process that loses the lock re-reads the credentials file from disk (the winner already wrote fresh tokens) instead of refreshing again.

2. **Re-read before error.** On any `401` response, re-read the credentials file before treating it as a terminal failure. The concurrent process may have already refreshed and written new tokens.

For the bearer-token model in `twentythree` (not OAuth refresh tokens, but a similar single-stored-token-per-workspace pattern), the same race applies when the user runs `twentythree` from multiple terminals.

**Detection:**
Sudden `401` failures when other terminal sessions are also active.

**Reference:** [Claude Code issue #27933](https://github.com/anthropics/claude-code/issues/27933) | [n8n race condition issue](https://github.com/n8n-io/n8n/issues/13088) | [Nango concurrency guide](https://nango.dev/blog/concurrency-with-oauth-token-refreshes)

---

### Pitfall C3: Token Expiry During Long-Running Operations

**Severity:** BLOCKING — operation fails mid-flight with no clean recovery

**What goes wrong:**
A `twentythree` command uploads a batch of videos or generates a large report. The background token refresh timer fires, but the operation takes longer than expected. Or worse: the refresh is not proactive, so the token expires mid-stream, the API returns `401`, and the command dies after partial side effects.

**Why it happens:**
Token refresh is only implemented as reactive (retry on `401`) with no proactive timer. Or a proactive timer exists but the refresh margin is too tight (refreshing at T-30s when network round-trips are slow).

**Consequences:**
Partial mutations. A multi-step upload may succeed for some items and fail for others, leaving the workspace in an inconsistent state.

**Prevention:**
- Implement a proactive refresh timer that fires at token expiry minus a generous buffer (5 minutes minimum).
- Use a refresh margin that accounts for clock skew and network latency.
- Combine with reactive retry: on any `401`, attempt one refresh, then retry the failed request once before surfacing the error.
- For TwentyThree's bearer-token model: store the token expiry timestamp alongside the token; check it before every API call, not just in the background timer.

**Reference:** [Duende token best practices](https://duendesoftware.com/learn/best-practices-managing-token-expiration-refresh-revocation-in-web-apis) | [OAuth.com refresh patterns](https://www.oauth.com/oauth2-servers/making-authenticated-requests/refreshing-an-access-token/)

---

### Pitfall C4: Operating on the Wrong Workspace Without Warning

**Severity:** BLOCKING — data modified in wrong client account; no undo for destructive operations

**What goes wrong:**
A user manages five workspaces. They set the active workspace to `client-a`, perform some operations, then later run a destructive command (delete video, publish to all) without realising the active context is still `client-a` not `client-b`. The command succeeds silently.

**Why it happens:**
The active workspace is stored globally in config. It is not visible in the prompt. The user switches context infrequently and forgets the current state.

**Consequences:**
Videos deleted in the wrong workspace. Published content appearing on the wrong client's platform. No undo.

**Prevention:**
- Always print the active workspace in command output headers: `[workspace: client-a]`.
- For destructive or mutating commands, show the workspace name in the confirmation prompt: `Delete video "intro.mp4" from client-a? [y/N]`.
- Consider a `--workspace` flag on every command so per-command override is always one flag away.
- Display active workspace in `twentythree whoami` and `twentythree status` — make it trivially inspectable.
- Follow the kubectl model: `kubectl config current-context` is a first-class operation; make `twentythree workspace current` equally prominent.

**Reference:** [kubectl contexts guide](https://dev.to/spacelift/kubectl-get-context-current-context-switching-listing-5112) | [Kubie shell isolation approach](https://www.x-cmd.com/install/kubie/)

---

## Moderate Pitfalls

Mistakes that cause friction, confusion, or rework without being catastrophic.

---

### Pitfall M1: npm Global Install Permission and PATH Failures

**Severity:** ANNOYING — blocks installation entirely on a fresh system

**What goes wrong:**
On macOS and Linux, the default npm global prefix (`/usr/local` or `/usr`) requires root. Running `sudo npm install -g` creates files owned by root that later cause permission errors on uninstall or update. Alternatively, the CLI installs correctly but the bin directory (`~/.npm-global/bin`) is not in `$PATH`, so `twentythree` command is not found.

With nvm, global packages are version-scoped to the current Node version. Switching Node versions (`nvm use 22`) renders previously installed globals invisible.

**Prevention:**
- Document two setup paths in the README: (a) using a Node version manager (nvm, fnm, Volta) which handles prefix correctly, and (b) manually setting `npm prefix` to `~/.npm-global`.
- Never instruct users to `sudo npm install -g`. Document this explicitly.
- Consider publishing a `postinstall` message that prints: `Run 'twentythree --version' to verify installation. If not found, ensure $(npm prefix -g)/bin is in your PATH.`
- On Windows, npm creates a `.cmd` wrapper that handles PATH correctly; document that `twentythree.cmd` is normal.

**Reference:** [npm EACCES docs](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally/) | [Voice Mode npm-global guide](https://voice-mode.readthedocs.io/en/stable/npm-global-no-sudo/)

---

### Pitfall M2: ESM/CJS Module Interop Errors Crashing the CLI

**Severity:** ANNOYING — complete install failure for some users on certain Node versions

**What goes wrong:**
A CLI dependency (e.g., `chalk`, `strip-ansi`, `ora`, `inquirer`) ships ESM-only. The CLI compiles to CommonJS. Node throws `ERR_REQUIRE_ESM` at startup. The error message is cryptic. The user sees a stack trace, not a usage error.

In 2025, `require(esm)` was backported to Node.js v20 and marked stable, which reduces (but does not eliminate) the friction. Users on older Node versions still hit the error.

**Prevention:**
- Pick the module format once and commit. For a globally installed CLI, ESM is the correct long-term choice. Set `"type": "module"` in `package.json`, output `.js` files as ESM via TypeScript `"module": "ESNext"` + `"moduleResolution": "bundler"`.
- Pin the supported Node version range in `engines` field: `"node": ">=20.0.0"` and enforce it with a prerun check (exit with a readable error if the Node version is too old).
- Use `tsup` to bundle. It handles ESM output cleanly and avoids the mixed-format traps.
- Avoid dependencies that have not decided on their module format — check `main` vs `exports` in their `package.json`.

**Reference:** [Liran Tal's ESM/CJS analysis](https://lirantal.com/blog/typescript-in-2025-with-esm-and-cjs-npm-publishing) | [require(esm) stability post (Dec 2025)](https://joyeecheung.github.io/blog/2025/12/30/require-esm-in-node-js-from-experiment-to-stability/)

---

### Pitfall M3: OpenAPI Generated Code Drifting from Live Spec

**Severity:** ANNOYING — commands silently fail or return wrong data after TwentyThree updates their API

**What goes wrong:**
The CLI generates its API surface from `video.twentythree.com/apidocs/swagger.json` at build time. The spec changes — a new required parameter, a renamed field, a deprecated endpoint. The generated client is not regenerated. Commands that call the changed endpoints start returning `400 Bad Request` errors with unhelpful messages. Or worse: they silently drop new fields from responses.

**Prevention:**
- Treat spec regeneration as a scheduled CI step: fetch the live spec, run the generator, diff the output. If the diff is non-empty, open an issue or block the build.
- Pin the spec version used for generation by storing a copy at `specs/twentythree.swagger.json` in the repo. Use `oasdiff` or `openapi-changes` to detect breaking changes between the stored spec and the live spec.
- Separate generated code from authored code cleanly: put generated clients in `src/generated/` with a `DO NOT EDIT` header and a `// Generated from spec version: <hash>` comment.
- Run `npm run generate` as an explicit step in the release checklist, not implicitly in `npm publish`.

**Reference:** [oasdiff breaking change tool](https://www.oasdiff.com/) | [OpenAPI code gen enterprise article (Nov 2025)](https://buildwithfern.com/post/openapi-code-generation-enterprise)

---

### Pitfall M4: Terminology Mapping Leaking into Error Messages

**Severity:** ANNOYING — confusing user-facing errors; support burden

**What goes wrong:**
The TwentyThree API uses legacy names: `photo` for video, `album` for category, `live` for webinar. The CLI maps these to modern terms. But error messages from the raw API response — "photo not found", "invalid album_id", "live stream quota exceeded" — leak through to the user because the error handler does not apply the terminology map.

Similarly, generated TypeScript types will have field names like `photo_id`, `album_token`, `live_id`. If these appear in stack traces or debug output, they break the UX contract.

**Prevention:**
- Create a single canonical terminology map module: `{ photo: 'video', album: 'category', live: 'webinar' }` applied in both directions.
- Run all API error messages through this map before display. A simple regex replace is sufficient: `/\bphoto\b/gi → 'video'`, etc.
- In TypeScript, define user-facing types with modern names separately from generated API types. The mapping layer converts between them.
- Write a test that asserts no user-visible string contains `photo`, `album`, or `live` in the legacy sense.

**Detection warning sign:** Any error message containing "photo", "album", or "live" surfacing through `stderr`.

---

### Pitfall M5: Startup Latency from Unbundled TypeScript

**Severity:** ANNOYING — CLI feels sluggish; 500ms+ startup time breaks interactive use

**What goes wrong:**
The CLI is compiled by `tsc` into hundreds of individual `.js` files. Node resolves each file on startup. The module graph is large (API client for a large OpenAPI spec has many files). `twentythree --help` takes 800ms+. Users notice.

**Prevention:**
- Bundle with `esbuild` via `tsup`. Output a single `dist/cli.js` entry point. Node resolves one file at startup, not hundreds.
- Enable `minify: true` in production builds — reduces bundle size 30-50% and removes dead code.
- Target `node20` minimum in esbuild to avoid unnecessary polyfills.
- Keep the CLI entry point (`bin/twentythree.js`) thin: just the shebang and the `import('./dist/cli.js')` call. Do not put logic there.
- Benchmark: `time twentythree --version` should be under 150ms. If it is not, profile with `node --prof`.

**Reference:** [tsup docs](https://tsup.egoist.dev/) | [tsx guide](https://generalistprogrammer.com/tutorials/tsx-npm-package-guide)

---

### Pitfall M6: Progress and Spinner Output Contaminating Piped Data

**Severity:** ANNOYING — breaks scripting use cases; breaks CI pipelines

**What goes wrong:**
`twentythree videos list | jq '.[].id'` fails because the spinner animation frames (`⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏`) are written to stdout and interleaved with the JSON output.

**Prevention:**
- All progress indicators, spinners, and status messages go to `stderr`, never `stdout`.
- Detect non-TTY mode: `if (!process.stdout.isTTY) { suppressSpinners(); }` — when piped, omit all decorative output.
- `stdout` should contain only structured output (JSON, TSV, plain IDs) suitable for piping.
- Add a `--json` flag for commands where the default output is human-formatted. In `--json` mode, disable all decorative output regardless of TTY.

**Reference:** [clig.dev piping guidelines](https://clig.dev/) | [12 Rules of Great CLI UX](https://dev.to/chengyixu/the-12-rules-of-great-cli-ux-lessons-from-building-30-developer-tools-39o6)

---

### Pitfall M7: Exit Codes Not Matching Conventions

**Severity:** ANNOYING — breaks shell scripts, CI systems, and automation that depends on exit codes

**What goes wrong:**
`twentythree videos delete nonexistent-id && echo "ok"` — the delete command exits `0` because "the user deliberately asked for deletion" even though it failed. Or: `twentythree auth logout` (a successful operation) exits `1` for no reason, breaking downstream scripts.

**Prevention:**
- Exit `0` only on success. Exit `1` on recoverable errors (API error, not found). Exit `2` on usage errors (wrong arguments). Exit `130` on user interrupt (SIGINT).
- User declining a confirmation prompt (`[y/N] → n`) is exit `0` — that was intentional, not an error.
- API `404` is exit `1` (failure), not `0`.
- Document exit codes in `--help` output for commands with non-obvious semantics.

**Reference:** [CLI Best Practices — clig.dev](https://clig.dev/)

---

## Minor Pitfalls

Friction points that are easy to fix once discovered but easy to miss initially.

---

### Pitfall m1: Shebang Line on Windows and CRLF Line Endings

**What goes wrong:**
The CLI entry file uses `#!/usr/bin/env node` (correct for Unix). On Windows, npm creates a `.cmd` wrapper that handles this correctly — but only if the file was published with LF line endings. CRLF endings cause `node: command not found` on Unix systems that check out the repo on Windows.

**Prevention:**
- Set `.gitattributes`: `bin/* text eol=lf` to enforce LF on commit regardless of OS.
- In `package.json` `bin` field, point to the compiled dist file, not the TypeScript source.
- The npm wrapper handles Windows execution; do not add `.cmd` files manually.

---

### Pitfall m2: Config Directory Not Respecting XDG on Linux

**What goes wrong:**
Hardcoding `~/.config/twentythree/` ignores `$XDG_CONFIG_HOME`, which power users and sysadmins rely on to redirect config directories to non-home locations. The CLI also does not respect `$XDG_DATA_HOME` for cache files.

**Prevention:**
- Use `env-paths` package or inline XDG logic: `process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), '.config')`.
- Separate config from cache: config (credentials metadata, workspace prefs) in `$XDG_CONFIG_HOME/twentythree/`, ephemeral cache in `$XDG_CACHE_HOME/twentythree/`.
- The Basecamp CLI uses `~/.config/basecamp/` as the default, matching this pattern.

---

### Pitfall m3: Missing `engines` Field Causes Confusing Errors on Old Node Versions

**What goes wrong:**
A user on Node 16 installs the CLI and gets a cryptic syntax error because the CLI uses Node 20+ APIs. There is no upfront error pointing to the version mismatch.

**Prevention:**
- Set `"engines": { "node": ">=20.0.0" }` in `package.json`.
- Add a runtime check at CLI entry:
  ```typescript
  const [major] = process.versions.node.split('.').map(Number);
  if (major < 20) {
    console.error(`twentythree requires Node.js 20+. Found: ${process.version}`);
    process.exit(1);
  }
  ```
- This catches both the npm install warning and the runtime case (e.g., the user updated their CLI but not their Node).

---

### Pitfall m4: `--help` Output Not Showing Active Workspace

**What goes wrong:**
The user runs `twentythree --help` or `twentythree videos --help`. The output gives no indication of which workspace is active. They follow the help text, execute a command, and it operates on the wrong workspace.

**Prevention:**
- Print `Active workspace: <name>` at the top of every `--help` output when a workspace is configured.
- Also show it in the global usage header: `twentythree [workspace: client-a] <command> ...`.

---

### Pitfall m5: Silent Overwrite on `auth credentials` Re-Run

**What goes wrong:**
A user runs `twentythree auth credentials` a second time (e.g., to add a new workspace) and accidentally overwrites their existing credential set without warning.

**Prevention:**
- On re-run, show existing workspaces and ask whether to add, replace, or cancel.
- Never silently overwrite. A destructive credential operation should require explicit confirmation: `This will replace credentials for domain video.client.com. Continue? [y/N]`.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1 — Auth scaffolding | C1 (plaintext storage), C2 (token refresh race), m5 (silent overwrite) | Use `@napi-rs/keyring` from day one; implement file lock on token write |
| Phase 2 — Multi-workspace | C4 (wrong workspace mutation) | Always print active workspace in output; add `--workspace` override to every command |
| Phase 3 — OpenAPI generation | M3 (spec drift), M4 (terminology leak) | Store spec snapshot in repo; test for legacy term leakage |
| Phase 4 — Distribution | M1 (PATH/permission), m1 (CRLF shebang), m3 (Node version) | Add `engines` field; set `.gitattributes`; write README install section |
| Phase 5 — AI skills package | C2 (token race — skills run CLI subprocesses) | File lock is critical when skills spawn concurrent `twentythree` invocations |
| All phases | M2 (ESM/CJS), M5 (startup latency), M6 (piped output) | Commit to ESM + tsup bundle from project init; stderr-only progress |

---

## Sources

- [keyring-node (@napi-rs/keyring) GitHub](https://github.com/Brooooooklyn/keyring-node) — HIGH confidence
- [Claude Code OAuth race condition issue #27933](https://github.com/anthropics/claude-code/issues/27933) — HIGH confidence (production incident documentation)
- [n8n token refresh race condition #13088](https://github.com/n8n-io/n8n/issues/13088) — HIGH confidence
- [Nango concurrency with OAuth token refreshes](https://nango.dev/blog/concurrency-with-oauth-token-refreshes) — HIGH confidence
- [Basecamp CLI credential storage and structure](https://github.com/basecamp/basecamp-cli) — HIGH confidence (reference implementation)
- [require(esm) stability in Node.js (Dec 2025)](https://joyeecheung.github.io/blog/2025/12/30/require-esm-in-node-js-from-experiment-to-stability/) — HIGH confidence
- [Liran Tal: TypeScript ESM/CJS in 2025](https://lirantal.com/blog/typescript-in-2025-with-esm-and-cjs-npm-publishing) — MEDIUM confidence
- [oasdiff — OpenAPI breaking change detection](https://www.oasdiff.com/) — HIGH confidence
- [Command Line Interface Guidelines (clig.dev)](https://clig.dev/) — HIGH confidence (community standard reference)
- [npm EACCES permissions docs](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally/) — HIGH confidence (official npm docs)
- [Azure SDK keytar → @napi-rs/keyring migration](https://github.com/Azure/azure-sdk-for-js/issues/29288) — HIGH confidence
- [Duende: token expiration and refresh best practices](https://duendesoftware.com/learn/best-practices-managing-token-expiration-refresh-revocation-in-web-apis) — MEDIUM confidence
