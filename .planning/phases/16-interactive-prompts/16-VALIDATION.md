---
phase: 16
slug: interactive-prompts
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-17
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | packages/twentythree-cli/vitest.config.ts |
| **Quick run command** | `pnpm --filter twentythree-cli test --run` |
| **Full suite command** | `pnpm --filter twentythree-cli test --run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter twentythree-cli test --run`
- **After every plan wave:** Run `pnpm --filter twentythree-cli test --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 16-01-01 | 01 | 1 | PROMPT-01 | — | N/A | unit | `pnpm --filter twentythree-cli test --run base-command` | ✅ | ⬜ pending |
| 16-01-02 | 01 | 1 | PROMPT-01 | — | N/A | unit | `pnpm --filter twentythree-cli test --run base-command` | ✅ | ⬜ pending |
| 16-02-01 | 02 | 2 | PROMPT-02 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| TTY interactive prompt renders correctly in real terminal | PROMPT-01 | Terminal rendering cannot be verified in vitest | Run `twentythree video get` without flags; verify prompt appears with @clack/prompts styling |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
