---
phase: 19
slug: skill-content
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Plain Node.js (validate-skills.mjs — no test framework needed) |
| **Config file** | `packages/twentythree-skills/package.json` (`"test": "node scripts/validate-skills.mjs"`) |
| **Quick run command** | `pnpm --filter twentythree-skills test` |
| **Full suite command** | `pnpm --filter twentythree-skills test` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter twentythree-skills test`
- **After every plan wave:** Run `pnpm --filter twentythree-skills test`
- **Before `/gsd-verify-work`:** Full suite must be green (exit 0, no errors)
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | SKILL-02 | — | N/A | file-presence | `pnpm --filter twentythree-skills test` | ❌ W0 | ⬜ pending |
| 19-01-02 | 01 | 1 | SKILL-02 | — | N/A | file-presence | `pnpm --filter twentythree-skills test` | ❌ W0 | ⬜ pending |
| 19-01-03 | 01 | 1 | SKILL-02 | — | N/A | file-presence | `pnpm --filter twentythree-skills test` | ❌ W0 | ⬜ pending |
| 19-02-01 | 02 | 1 | SKILL-03 | — | N/A | manual | `ls packages/twentythree-skills/skills/workflows/*.md \| wc -l` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/twentythree-skills/skills/reference/` directory containing all 22 `.md` files — covers SKILL-02
- [ ] `packages/twentythree-skills/skills/workflows/` directory containing 2 `.md` files — covers SKILL-03

*(Validator infrastructure already exists from Phase 18 and passes Gate 1. Wave 0 only requires the content files.)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Each reference file is ~80-100+ lines with all flags documented | SKILL-02 | Line count and content quality cannot be grep-verified | Spot-check 3–5 reference files; confirm each has `### <Command>` sections, flag lists, and 2+ examples per command |
| Workflow files show complete multi-step sequences | SKILL-03 | Completeness and accuracy of workflow steps cannot be automated | Read `upload-and-publish.md` and `webinar-lifecycle.md`; confirm each has: prerequisites, ordered commands with flags, expected output shapes, error handling notes |
| user.md warns about `--password` flag visibility | SKILL-02 | Warning text cannot be grep-verified for appropriateness | Read user.md and confirm `--password` section includes process-list/shell-history security warning |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
