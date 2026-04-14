---
phase: 1
slug: foundation
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.4 |
| **Config file** | `packages/twentythree-cli/vitest.config.ts` — Wave 0 gap |
| **Quick run command** | `pnpm --filter twentythree-cli test` |
| **Full suite command** | `pnpm test` (turbo runs all packages) |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter twentythree-cli test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite green + `tsc --noEmit` passes + `node bin/run.js --version` prints correctly
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| node-check | 01 | 1 | FOUND-04 | — | N/A | unit | `pnpm --filter twentythree-cli exec vitest run src/lib/__tests__/node-check.test.ts` | ❌ W0 | ⬜ pending |
| term-map-cli | 01 | 1 | FOUND-06 | — | N/A | unit | `pnpm --filter twentythree-cli exec vitest run src/lib/__tests__/term-map.test.ts` | ❌ W0 | ⬜ pending |
| term-map-api | 01 | 1 | FOUND-06 | — | N/A | unit | `pnpm --filter twentythree-cli exec vitest run src/lib/__tests__/term-map.test.ts` | ❌ W0 | ⬜ pending |
| version-smoke | 01 | 1 | FOUND-03 | — | N/A | smoke | `node bin/run.js --version` (manual after build) | N/A | ⬜ pending |
| types-typecheck | 01 | 1 | FOUND-05 | — | N/A | build | `pnpm --filter twentythree-cli exec tsc --noEmit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/twentythree-cli/vitest.config.ts` — vitest config for the CLI package
- [ ] `packages/twentythree-cli/src/lib/__tests__/term-map.test.ts` — covers FOUND-06 (minimum: 3 `toCliTerm` cases, 3 `toApiTerm` cases, 1 `applyCliTerms` string replacement case)
- [ ] `packages/twentythree-cli/src/lib/__tests__/node-check.test.ts` — covers FOUND-04 (test guard logic in isolation, not the `process.exit` itself)

### Greenfield Exception

Plans 01-01 and 01-02 use build/structural verification (file existence checks, `pnpm install`, `pnpm build`, `--version` smoke test) rather than unit tests. This is intentional: the project does not exist yet when these plans execute, so vitest config and test files cannot precede the scaffold itself. Wave 0 test stubs (vitest.config.ts, term-map.test.ts, node-check.test.ts) are created in Plan 01-03, which is the earliest point where the build pipeline and source structure exist to support them. This exception is accepted — all testable logic introduced in Phase 1 has automated unit test coverage by the end of Plan 01-03.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `twentythree --version` prints version string | FOUND-03 | Requires global install or build+run to verify binary wiring | After `pnpm build`, run `node packages/twentythree-cli/bin/run.js --version` and confirm version string |
| `npm install -g twentythree-cli` installs successfully | FOUND-03 | Requires published package or `npm pack` | Run `npm pack` in CLI package, install tarball globally, run `twentythree --version` — verified during release, not CI |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies — Plans 01-01 and 01-02 use build/structural verification (greenfield exception: unit tests cannot exist before the project is scaffolded); Plan 01-03 creates all Wave 0 test stubs
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
