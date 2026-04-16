---
phase: 8
slug: platform-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-16
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | packages/twentythree-cli/vitest.config.ts |
| **Quick run command** | `pnpm --filter twentythree-cli test --run` |
| **Full suite command** | `pnpm --filter twentythree-cli test --run && pnpm --filter twentythree-cli exec tsc --noEmit` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter twentythree-cli test --run`
- **After every plan wave:** Run `pnpm --filter twentythree-cli test --run && pnpm --filter twentythree-cli exec tsc --noEmit`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 8-spot | TBD | 1 | SPT-01–07 | — | N/A | integration | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 8-thumbnail | TBD | 1 | THB-01–07 | — | N/A | integration | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 8-webhook | TBD | 1 | WHK-01–05 | — | N/A | integration | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 8-app | TBD | 1 | APP-01–03 | — | N/A | integration | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 8-presentation | TBD | 2 | PRS-01–03 | — | N/A | integration | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 8-protection | TBD | 2 | PRT-01–03 | — | N/A | integration | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 8-session | TBD | 2 | SES-01–02 | — | N/A | integration | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 8-openupload | TBD | 2 | OUP-01–03 | — | N/A | integration | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 8-site | TBD | 2 | SITE-01–03 | — | N/A | integration | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 8-user | TBD | 3 | USR-01–08 | — | N/A | integration | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 8-doctor | TBD | 3 | CLI-05 | — | credential isolation | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 8-agent | TBD | 3 | CLI-06 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements — vitest and test helpers are already installed and configured. No new test infrastructure needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `twentythree doctor` shows coloured pass/fail table | CLI-05 | Colour rendering (chalk) cannot be asserted in unit tests | Run `twentythree doctor` in terminal; verify green ✓/red ✗ rows |
| `--help --agent` JSON output consumed by AI agent | CLI-06 | Requires live AI agent environment to validate consumption | Run `twentythree video list --help --agent` and pipe to `jq`; verify all required fields present |
| `thumbnail file upload` accepts PNG/JPEG | THB-05 | Requires live API connection and real file | Run with a valid PNG file; verify spinner, success message, and admin URL output |
| `openupload upload-file` chunked engine with custom token | OUP-03 | Requires live chunked upload session | Run with a valid video file; verify resumable chunked upload protocol fires |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
