---
phase: 15
slug: tab-completion
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-17
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^4.1.4 |
| **Config file** | `packages/twentythree-cli/vitest.config.ts` |
| **Quick run command** | `pnpm --filter twentythree-cli test --run` |
| **Full suite command** | `pnpm --filter twentythree-cli test --run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter twentythree-cli test --run`
- **After every plan wave:** Run `pnpm --filter twentythree-cli test --run`
- **Before `/gsd-verify-work`:** Full suite must be green + manual completion smoke test
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | COMPLETE-01 | — | Shell arg is enum-constrained (zsh\|bash); no free-form input accepted | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 15-01-02 | 01 | 1 | COMPLETE-01 | — | N/A | smoke | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 15-01-03 | 01 | 1 | COMPLETE-02 | — | N/A | manual | `node -e "const m=require('./packages/twentythree-cli/oclif.manifest.json'); console.log(Object.keys(m.commands).filter(c=>c.startsWith('autocomplete')))"` | manual | ⬜ pending |
| 15-02-01 | 02 | 2 | COMPLETE-02 | — | N/A | e2e/manual | manual shell test | manual-only | ⬜ pending |
| 15-02-02 | 02 | 2 | COMPLETE-03 | — | N/A | e2e/manual | manual shell test | manual-only | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/twentythree-cli/src/commands/autocomplete/__tests__/autocomplete.test.ts` — unit stubs for COMPLETE-01 (command exists, shell detection logic via `process.env.SHELL` mock)
- [ ] Shared `process.env.SHELL` mock setup in test file (beforeEach/afterEach)

*Existing vitest infrastructure covers all other phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `twentythree video <TAB>` lists subcommands | COMPLETE-02 | Requires real interactive shell session with completion scripts sourced | 1. Run `twentythree autocomplete` 2. Paste eval line into `~/.zshrc` 3. Source rc file 4. Type `twentythree video <TAB>` and confirm subcommands appear |
| `twentythree video list --<TAB>` lists flags | COMPLETE-03 | Requires real interactive shell session with completion scripts sourced | After COMPLETE-02 verified, type `twentythree video list --<TAB>` and confirm flags appear |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
