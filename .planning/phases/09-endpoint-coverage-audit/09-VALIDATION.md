---
phase: 9
slug: endpoint-coverage-audit
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-16
---

# Phase 9 — Validation Strategy

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
| 09-01-01 | 01 | 1 | AUDIT-01 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | AUDIT-01 | — | N/A | integration | `node packages/twentythree-cli/scripts/audit-endpoints.mjs` | ❌ W0 | ⬜ pending |
| 09-02-01 | 02 | 2 | AUDIT-02 | — | N/A | integration | `node packages/twentythree-cli/scripts/audit-endpoints.mjs` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/twentythree-cli/scripts/audit-endpoints.mjs` — audit script stub
- [ ] `packages/twentythree-cli/src/lib/audit.ts` — EXCLUDED_OPERATIONS and KNOWN_NON_API constants

*Existing test infrastructure (vitest) covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Audit script exits 0 after all gaps resolved | AUDIT-01 | Gap closure requires human classification of each endpoint | Run `node packages/twentythree-cli/scripts/audit-endpoints.mjs` and confirm exit code 0 |
| Phantom commands verified as intentional omissions | AUDIT-02 | Requires domain knowledge to classify as internal/non-API | Review phantom list output and confirm each entry in EXCLUDED_OPERATIONS or KNOWN_NON_API |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
