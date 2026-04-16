---
phase: 11
slug: documentation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-16
---

# Phase 11 — Validation Strategy

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
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | DOCS-01 | — | N/A | manual | `ls packages/twentythree-cli/docs/commands/` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 1 | DOCS-01 | — | N/A | manual | `ls packages/twentythree-cli/docs/commands/ \| wc -l` | ❌ W0 | ⬜ pending |
| 11-02-01 | 02 | 2 | DOCS-02 | — | N/A | manual | `test -f packages/twentythree-cli/docs/guides/getting-started.md` | ❌ W0 | ⬜ pending |
| 11-03-01 | 03 | 2 | DOCS-03 | — | N/A | manual | `test -f packages/twentythree-cli/docs/guides/api-spec-upgrade.md` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/twentythree-cli/docs/commands/` — directory created
- [ ] `packages/twentythree-cli/docs/guides/` — directory created
- [ ] `packages/twentythree-cli/README.md` — stub file must exist before oclif readme runs

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| oclif readme generates 49 files | DOCS-01 | File count requires running the command and inspecting output | `cd packages/twentythree-cli && pnpm exec oclif readme --multi --nested-topics-depth 2 --output-dir docs/commands && ls docs/commands \| wc -l` (expect ~49) |
| getting-started covers 3-step flow | DOCS-02 | Content quality check | Read docs/guides/getting-started.md and verify auth credentials → workspace use → video list steps are present |
| api-spec-upgrade covers full workflow | DOCS-03 | Content quality check | Read docs/guides/api-spec-upgrade.md and verify pnpm update-api-spec, diff review, tsc --noEmit, test, and commit steps are covered |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
