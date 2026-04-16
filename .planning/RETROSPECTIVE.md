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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 9 | 41 | Baseline — first full CLI build with GSD workflow |

### Cumulative Quality

| Milestone | Commands | LOC | Endpoints |
|-----------|----------|-----|-----------|
| v1.0 | 219 | ~61,000 | 235 |

### Top Lessons (Verified Across Milestones)

1. Generated types are authoritative over plan prose — defer to types.ts when in conflict
2. Standardize SUMMARY.md one-liner format from Phase 1 for reliable automated extraction
