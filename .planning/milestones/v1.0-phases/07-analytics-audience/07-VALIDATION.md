---
phase: 7
slug: analytics-audience
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-16
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | packages/twentythree-cli/vitest.config.ts |
| **Quick run command** | `pnpm --filter twentythree-cli test --run` |
| **Full suite command** | `pnpm --filter twentythree-cli test --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter twentythree-cli test --run`
- **After every plan wave:** Run `pnpm --filter twentythree-cli test --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | ANL-01 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | ANL-02 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 07-02-00 | 02 | 1 | — | — | N/A | scaffold | `pnpm --filter twentythree-cli test --run` | Wave 0 task | ⬜ pending |
| 07-02-01 | 02 | 1 | ANL-01 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-02-02 | 02 | 1 | ANL-03 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-02-03 | 02 | 1 | ANL-04 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-02-04 | 02 | 1 | ANL-05 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-02-05 | 02 | 1 | ANL-06 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-03-01 | 03 | 2 | ANL-07 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-03-02 | 03 | 2 | ANL-07 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-04-01 | 04 | 2 | AUD-01 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-04-02 | 04 | 2 | AUD-02 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-04-03 | 04 | 2 | AUD-03 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-04-04 | 04 | 2 | AUD-04 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-04-05 | 04 | 2 | AUD-05 | T-07-08 | Confirmation prompt | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-04-06 | 04 | 2 | AUD-06 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-04-07 | 04 | 2 | AUD-07 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-04-08 | 04 | 2 | AUD-08 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-04-09 | 04 | 2 | AUD-09 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-04-10 | 04 | 2 | AUD-10 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-04-11 | 04 | 2 | AUD-11 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |
| 07-04-12 | 04 | 2 | AUD-12 | T-07-09 | Confirmation prompt | unit | `pnpm --filter twentythree-cli test --run` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `packages/twentythree-cli/src/commands/analytics/__tests__/` — stub test files for ANL-01–ANL-08 (created by plan 07-02 Task 0)
- [x] `packages/twentythree-cli/src/commands/audience/__tests__/` — stub test files for AUD-01–AUD-12 (created by plan 07-02 Task 0)
- [x] `packages/twentythree-cli/src/commands/audience/field/__tests__/` — stub test file for AUD-12 field commands (created by plan 07-02 Task 0)

*Wave 0 is delivered by plan 07-02 Task 0. Plans 07-03 and 07-04 depend on 07-02 (wave 2).*

*Existing infrastructure (vitest, base-command, output helpers) covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Analytics endpoints return real data for date ranges | ANL-08 | Requires live API with data | Run `twentythree analytics video timeseries --date-expression thisweek` and verify rows returned |
| `audience search` returns filtered results | AUD-02 | Requires live audience data | Run `twentythree audience search --text "john"` and verify matching members returned |
| `audience field set` persists custom field | AUD-12 | Requires live audience + writable fields | Run set then list and verify field appears |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
