---
phase: 6
slug: engagement-actions
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-15
---

# Phase 6 — Validation Strategy

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
| 06-01-01 | 01 | 1 | ACT-01 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | ACT-02 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | ACT-03 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 06-01-04 | 01 | 1 | COL-01 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 06-01-05 | 01 | 1 | CMT-01 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 06-01-06 | 01 | 1 | PLY-01 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 06-01-07 | 01 | 1 | TAG-01 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/twentythree-cli/src/commands/action/__tests__/` — stub test files for ACT-01–ACT-09
- [ ] `packages/twentythree-cli/src/commands/comment/__tests__/` — stub test files for CMT-01–CMT-08
- [ ] `packages/twentythree-cli/src/commands/player/__tests__/` — stub test files for PLY-01–PLY-06

*Existing infrastructure (vitest, base-command, output helpers) covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `action upload` multipart POST delivers file to action variable | ACT-08 | Requires live API + action variable | Run `twentythree action upload <id> <var> ./test.png` and verify API accepts file |
| `player embed` outputs pipeable embed code | PLY-03 | Requires live API embed response | Run `twentythree player embed --video-id <id> > /tmp/embed.html` and verify output |
| `comment reaction add/list/remove` 3-level commands route correctly | CMT-06 | Requires live comment + reaction | Run full reaction lifecycle commands |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
