---
phase: 5
slug: webinar-deep
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-15
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x |
| **Config file** | packages/twentythree-cli/vite.config.ts (none — vitest run inline) |
| **Quick run command** | `pnpm --filter twentythree-cli exec vitest run src/commands/webinar/__tests__/ src/commands/poll/__tests__/ --reporter=dot` |
| **Full suite command** | `pnpm --filter twentythree-cli exec vitest run --reporter=dot` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command targeting new test files
- **After every plan wave:** Run full suite
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 05-01-01 | 01 | 1 | WEB-12 | unit stubs | `vitest run src/commands/webinar/__tests__/attachment*` | ⬜ pending |
| 05-01-02 | 01 | 1 | WEB-13 | unit stubs | `vitest run src/commands/webinar/__tests__/section*` | ⬜ pending |
| 05-02-01 | 02 | 1 | WEB-14 | unit stubs | `vitest run src/commands/webinar/__tests__/speaker*` | ⬜ pending |
| 05-02-02 | 02 | 1 | WEB-15 | unit stubs | `vitest run src/commands/webinar/__tests__/mail*` | ⬜ pending |
| 05-03-01 | 03 | 2 | WEB-16,17,18 | unit stubs | `vitest run src/commands/webinar/__tests__/recording* src/commands/webinar/__tests__/transcription* src/commands/webinar/__tests__/room*` | ⬜ pending |
| 05-03-02 | 03 | 2 | WEB-19 | unit stubs | `vitest run src/commands/webinar/__tests__/series*` | ⬜ pending |
| 05-04-01 | 04 | 2 | WEB-20,POL-01-06 | unit stubs | `vitest run src/commands/webinar/__tests__/queued-video* src/commands/poll/__tests__/` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing vitest infrastructure covers all phase requirements — no new framework install needed.
- Each plan's Wave 0 task creates stub test files for the commands introduced in that plan.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chunked upload progress bar visible | WEB-12 | TTY required | Run `twentythree webinar attachment upload <id> ./file.pdf` and observe stderr progress |
| Mail preview HTML pipes correctly | WEB-15 | stdout pipe | Run `twentythree webinar mail preview <id> > /tmp/out.html` and check file |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
