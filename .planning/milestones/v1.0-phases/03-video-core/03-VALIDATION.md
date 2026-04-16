---
phase: 03
slug: video-core
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-14
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | packages/twentythree-cli/vitest.config.ts |
| **Quick run command** | `pnpm --filter twentythree-cli test --run` |
| **Full suite command** | `pnpm --filter twentythree-cli test --run && pnpm --filter twentythree-cli build` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter twentythree-cli test --run`
- **After every plan wave:** Run `pnpm --filter twentythree-cli test --run && pnpm --filter twentythree-cli build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 0 | UPL-01–08 | — | N/A | unit stub | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | UPL-01,02,03,04 | T-03-01 | chunks use HTTPS only | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | UPL-05,06,07 | T-03-02 | retry does not re-upload completed chunks | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | VID-01,02 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 2 | VID-03,06 | T-03-03 | token not logged | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 03-03-03 | 03 | 2 | VID-04,05,07,08 | T-03-04 | delete requires confirmation | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 3 | VID-09,10 | — | N/A | unit | `pnpm --filter twentythree-cli test --run` | ❌ W0 | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `packages/twentythree-cli/src/upload/__tests__/chunked-upload.test.ts` — stubs for UPL-01–08
- [ ] `packages/twentythree-cli/src/commands/video/__tests__/list.test.ts` — stubs for VID-01
- [ ] `packages/twentythree-cli/src/commands/video/__tests__/get.test.ts` — stubs for VID-02
- [ ] `packages/twentythree-cli/src/commands/video/__tests__/upload.test.ts` — stubs for VID-03
- [ ] `packages/twentythree-cli/src/commands/video/__tests__/update.test.ts` — stubs for VID-04
- [ ] `packages/twentythree-cli/src/commands/video/__tests__/delete.test.ts` — stubs for VID-05
- [ ] `packages/twentythree-cli/src/commands/video/__tests__/replace.test.ts` — stubs for VID-06
- [ ] `packages/twentythree-cli/src/commands/video/__tests__/transcoding-progress.test.ts` — stubs for VID-07
- [ ] `packages/twentythree-cli/src/commands/video/__tests__/frame.test.ts` — stubs for VID-08
- [ ] `packages/twentythree-cli/src/commands/video/section/__tests__/` — stubs for VID-09
- [ ] `packages/twentythree-cli/src/commands/video/subtitle/__tests__/` — stubs for VID-10

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Upload progress bar renders correctly | UPL-07 | Terminal rendering can't be asserted in unit tests | Run `video upload <file>` and visually verify bar shows bytes/percentage/ETA/speed |
| Interactive update prompts pre-fill current values | VID-04 | TTY interaction | Run `video update <id>` with no flags and confirm prompts show existing values |
| Chunked upload completes without re-uploading completed chunks | UPL-06 | Requires live API + interrupt | Test manually against dev workspace |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
