# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-04-16
**Phases:** 9 (+ 1 inserted) | **Plans:** 41 | **Timeline:** 3 days

### What Was Built
- Full-coverage CLI for TwentyThree video platform — 235 API endpoints, 22 resource groups, 219 hand-authored command files
- Native resumable chunked upload engine (resumable.js protocol) with parallelism, retry, and resume-on-failure
- Credential auth + multi-workspace support with OS keychain, proactive token refresh, and file locking
- OpenAPI type generation pipeline and bidirectional terminology translator (`photo`→`video`, `album`→`category`, `live`→`webinar`)
- `--agent` flag + `agentMetadata` on all commands; `twentythree doctor` health check; local spec + update workflow

### What Worked
- **Hand-authoring commands against generated types** — much better UX than code generation; term mapping stayed consistent throughout
- **Wave-based plan execution** — splitting each phase into clear dependency waves (install → foundation → commands) kept tasks focused
- **Chunked upload native implementation** — avoiding the `resumable-upload-command` dependency gave full control over retry/resume behavior
- **OpenAPI spec as single source of truth** — when plan prose disagreed with types.ts, always deferring to types.ts prevented several bugs (e.g., `archive/get-progress` is POST not GET)
- **CJS-safe version pins** (chalk 4, ora 5) — avoided ESM interop issues throughout the entire build

### What Was Inefficient
- **SUMMARY.md one-liner format inconsistency** — many phase summaries don't follow the `**One-liner:**` convention, making automated extraction fragile; should standardize this in future milestones
- **Traceability table in REQUIREMENTS.md** — status column went stale quickly; only the `[x]` checkboxes stayed authoritative; consider dropping the status column
- **No milestone audit** — completing 9 phases without a pre-ship audit means cross-phase integration gaps are unknown; `/gsd-audit-milestone` should be standard before `/gsd-complete-milestone`

### Patterns Established
- `tokenFieldName` optional param in `ChunkedUploadParams` — replace flows use `replace_token`, not `upload_token`; defaults preserve backward compat
- `delayFn` injectable in `uploadChunkPool` — deterministic test timing without real setTimeout delays
- `doctor` extends oclif `Command` directly (not `BaseCommand`) — avoids hard error when no workspace configured
- `agent handler uses process.argv.includes` before flag parsing in `BaseCommand.init()` — intercepts before oclif processes args
- 3-level oclif topic created automatically via filesystem discovery (`comment/reaction/`)
- Collector include/exclude use GET (not POST) — collectors are a subtype of actions in the TwentyThree API

### Key Lessons
1. **Types.ts over plan prose** — the generated OpenAPI types are authoritative; when there's a conflict with plan descriptions, always trust the types
2. **Phase 6.1 insertion pattern works well** — decimal phases are a clean way to add urgent work without renumbering; INSERTED marker in ROADMAP keeps it visible
3. **`--agent` flag should be architected early** — backfilling `agentMetadata` across 219 files in Phase 8 was mechanical but time-consuming; this should be part of the command template from Phase 1 in future projects
4. **Standardize SUMMARY.md one-liner format** — `**One-liner:** <one sentence>` at the top of every summary makes milestone reporting and automated extraction reliable

### Cost Observations
- Model: claude-sonnet-4-6 throughout
- Sessions: Multiple across 3 days
- Notable: 225 commits, ~61K LOC TypeScript in 3 days with GSD workflow — high velocity from wave-based parallel execution

---

## Milestone: v1.2 — Burnin & Quality of Life

**Shipped:** 2026-04-20
**Phases:** 4 (14–17) | **Plans:** 6 | **Timeline:** 3 days

### What Was Built
- Fixed `parseBoolParam is not defined` crash on `video list`; swept all 219 commands for the same pattern; published npm@1.0.1
- `@oclif/plugin-autocomplete` wired for bash/zsh tab completion; guided `@clack/prompts` setup wizard; published npm@1.0.2
- `BaseCommand.catch()` intercepts `FailedFlagValidationError` in TTY mode; prompts per missing flag; re-dispatches with collected argv
- TypeScript build zeroed: `@types/node` + DOM lib in `tsconfig.base.json`; `autocomplete` extended from `BaseCommand` for full PROMPT-01 coverage

### What Worked
- **Milestone audit before close** — `/gsd-audit-milestone` surfaced the 4 tech debt items before shipping; Phase 17 closed them cleanly; no post-ship surprises
- **TDD for BaseCommand.catch()** — writing failing tests first (Phase 16) kept the implementation honest and caught edge cases (empty string, cancel signal, non-TTY)
- **DOM lib + @types/node together** — adding both in a single tsconfig change zeroed all pre-existing tsc errors at once; Buffer→ArrayBuffer coercion fix was discovered and auto-fixed in the same commit cycle

### What Was Inefficient
- **SUMMARY.md one-liner format** — still inconsistent; gsd-tools `summary-extract` parsed garbled output for v1.2; MILESTONES.md entry had to be manually corrected. Need a strict frontmatter field (e.g., `one_liner:`) rather than inline `**One-liner:**` prose.
- **Phase 15 SUMMARY frontmatter gap** — missing `requirements_completed` field was only caught during milestone audit; should be a plan completion gate
- **`audit-open` tool broken** — `gsd-tools audit-open` threw a ReferenceError at milestone close; had to skip that step. Needs a fix in gsd-tools.cjs.

### Patterns Established
- `autocomplete extends BaseCommand` with empty `init()` override — bypass workspace resolution while inheriting `catch()` for PROMPT-01
- `constructor.name` check for `FailedFlagValidationError` — class not exported from oclif/core public API; name check is the safe alternative
- `import * as p` for `@clack/prompts` — namespace import enables both `p.select()` and new prompt functions without destructuring conflicts
- DOM lib required alongside `@types/node` for `fetch`, `FormData`, `Blob`, `AbortSignal` in Node 22 CLI builds

### Key Lessons
1. **Run `/gsd-audit-milestone` before `/gsd-complete-milestone`** — the audit is what surfaced the tsc-clean overstatement and autocomplete wiring gap; without it those would have shipped silently
2. **SUMMARY.md one-liner must be a frontmatter field** — `**One-liner:**` prose is too fragile for automated extraction; use `one_liner:` in YAML frontmatter from now on
3. **`requirements_completed` in SUMMARY frontmatter is a completion gate** — don't close a plan without it; the Phase 15 gap cost a Phase 17 fix

### Cost Observations
- Model: claude-sonnet-4-6 throughout
- Sessions: Multiple across 3 days
- Notable: 69 commits across 4 phases; GSD milestone audit → gap closure → complete pipeline worked end-to-end for the first time

---

## Milestone: v1.3 — TwentyThree Agent Skill

**Shipped:** 2026-04-20
**Phases:** 3 (18–20) | **Plans:** 9 | **Timeline:** 1 day

### What Was Built
- `packages/twentythree-skills` — standalone ESM npm package; no build step; Node 22+ built-ins only
- 22 hand-authored reference files (one per resource group) sourced entirely from live `--agent` CLI output
- 629-line `video.md`, 1,371-line `webinar.md` with terminology notes, edge-case callouts, and per-command flag tables
- 2 agent workflow files: full upload-and-publish (6 steps) and webinar-lifecycle (10 steps) with exact commands and error handling
- `bin/add.js` runtime installer — detects 4 runtimes (Claude Code, Codex, Copilot, Cursor) via dir presence, copies 25 files idempotently

### What Worked
- **Live `--agent` output as authoritative source** — caught `user delete` non-existence, wrong JSON field names, and legacy `--object-type` values that research docs and training data would have gotten wrong
- **Validate-skills.mjs two-gate design** — soft Gate 2 for reference/ prevented failures during Phase 18/19 intermediate state; hard Gate 1 caught frontmatter issues immediately
- **Single-file ESM installer with no external deps** — `bin/add.js` at 103 lines is auditable, standalone, and works via `npx` without any `node_modules` present; the `node:` prefix + ESM pattern is clean
- **Code review → fix cycle** — gsd-code-review caught 3 real issues (missing source guard, unhandled I/O error, symlink traversal); gsd-code-fixer applied all 3 in one pass

### What Was Inefficient
- **SUMMARY.md one-liner format still inconsistent** — gsd-tools `summary-extract` parsed garbled output again for several v1.3 plans; accomplishments in MILESTONES.md needed manual curation. The `one_liner:` frontmatter convention is still not being set consistently by executor agents.
- **`audit-open` gsd-tools command broken** — failed with exit code 1 at milestone close, same as v1.2; pre-close artifact audit step had to be skipped. Still unresolved.
- **STATE.md `Last Activity Description` field mismatch** — gsd-tools repeatedly warned about this field not being found; STATE.md format diverged from what gsd-tools expects. Minor but recurring noise.

### Patterns Established
- `walkDir` + per-file `cpSync` for recursive copy — `cpSync(srcDir, destDir, {recursive:true})` copies the directory itself; per-file loop is the correct pattern
- `existsSync(skillsSource)` guard before walkDir — prevents silent crash on broken publish
- `{ dereference: false }` on cpSync — prevents symlinks from being followed during skill tree copy
- `process.exitCode = 1` (not `process.exit(1)`) inside copy loop — lets remaining files still be attempted on I/O error
- Skills install to `<runtime>/skills/twentythree/` namespace — safe against collisions with other skill packages
- All 22 reference files validated by `RESOURCE_GROUPS` constant in validate-skills.mjs — single source of truth for group names

### Key Lessons
1. **Live CLI `--agent` output over docs or training data** — always run `twentythree <cmd> --agent` and use the actual output; plan research should mandate this for any skill content work
2. **`one_liner:` frontmatter is still not consistently set** — executor agents need an explicit instruction in PLAN.md to write `one_liner:` in SUMMARY.md frontmatter; prose `**One-liner:**` keeps appearing
3. **Static markdown packages need no test framework** — validate-skills.mjs + manual smoke is the right test strategy for a skills package; don't reach for vitest when there's no business logic to unit-test
4. **README.md must exist before milestone archive** — the `files` whitelist in package.json referenced README.md but it didn't exist; caught by integration checker before publish, but should be a Phase 18 deliverable next time

### Cost Observations
- Model: claude-sonnet-4-6 throughout
- Sessions: 2 (context limit hit mid-session, resumed seamlessly via summary)
- Notable: 59 commits, 16,800 LOC added in 1 day; all 9 requirements satisfied first pass with no re-planning

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 9 | 41 | Baseline — first full CLI build with GSD workflow |
| v1.1 | 5 | 8 | First npm publish; oclif readme doc generation; audit script |
| v1.2 | 4 | 6 | First full audit→gap-close→complete pipeline; TDD for BaseCommand |
| v1.3 | 3 | 9 | First companion package; live --agent sourcing; static markdown + ESM installer |

### Cumulative Quality

| Milestone | Commands | LOC | Endpoints | npm version |
|-----------|----------|-----|-----------|-------------|
| v1.0 | 219 | ~61,000 | 235 | — |
| v1.1 | 219 | ~61,000 | 235 | 1.0.0 |
| v1.2 | 219 | ~61,000 | 235 | 1.0.2 |
| v1.3 | 219 | ~61,000 | 235 | 1.0.2 (skills unpublished) |

### Top Lessons (Verified Across Milestones)

1. Generated types are authoritative over plan prose — defer to types.ts when in conflict
2. Use `one_liner:` YAML frontmatter field in SUMMARY.md — prose `**One-liner:**` is too fragile for automated extraction
3. Run `/gsd-audit-milestone` before `/gsd-complete-milestone` — surfaces tech debt and integration gaps before they ship
