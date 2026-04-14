---
phase: 4
slug: category-webinar-core
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-14
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `packages/twentythree-cli/vitest.config.ts` |
| **Quick run command** | `pnpm --filter twentythree-cli exec vitest run --reporter=dot` |
| **Full suite command** | `pnpm --filter twentythree-cli exec vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter twentythree-cli exec vitest run --reporter=dot`
- **After every plan wave:** Run `pnpm --filter twentythree-cli exec vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 0 | CAT-01 | — | N/A | unit | `vitest run src/commands/category/__tests__/list.test.ts` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 0 | CAT-02 | — | N/A | unit | `vitest run src/commands/category/__tests__/create.test.ts` | ❌ W0 | ⬜ pending |
| 4-01-03 | 01 | 0 | CAT-03 | — | N/A | unit | `vitest run src/commands/category/__tests__/update.test.ts` | ❌ W0 | ⬜ pending |
| 4-01-04 | 01 | 0 | CAT-04 | — | N/A | unit | `vitest run src/commands/category/__tests__/delete.test.ts` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 0 | WEB-01 | — | N/A | unit | `vitest run src/commands/webinar/__tests__/list.test.ts` | ❌ W0 | ⬜ pending |
| 4-02-02 | 02 | 0 | WEB-02 | — | N/A | unit | `vitest run src/commands/webinar/__tests__/create.test.ts` | ❌ W0 | ⬜ pending |
| 4-02-03 | 02 | 0 | WEB-03 | — | N/A | unit | `vitest run src/commands/webinar/__tests__/update.test.ts` | ❌ W0 | ⬜ pending |
| 4-02-04 | 02 | 0 | WEB-04 | — | N/A | unit | `vitest run src/commands/webinar/__tests__/delete.test.ts` | ❌ W0 | ⬜ pending |
| 4-03-01 | 03 | 0 | WEB-05 | T-04-01 | upload_token never logged | unit | `vitest run src/commands/webinar/__tests__/upload-image.test.ts` | ❌ W0 | ⬜ pending |
| 4-03-02 | 03 | 1 | WEB-06 | — | N/A | unit | `vitest run src/commands/webinar/__tests__/metrics.test.ts` | ❌ W0 | ⬜ pending |
| 4-03-03 | 03 | 1 | WEB-07 | — | N/A | unit | `vitest run src/commands/webinar/__tests__/clips.test.ts` | ❌ W0 | ⬜ pending |
| 4-03-04 | 03 | 1 | WEB-08 | — | N/A | unit | `vitest run src/commands/webinar/__tests__/highlights.test.ts` | ❌ W0 | ⬜ pending |
| 4-03-05 | 03 | 1 | WEB-09 | — | N/A | unit | `vitest run src/commands/webinar/__tests__/list-formats.test.ts` | ❌ W0 | ⬜ pending |
| 4-03-06 | 03 | 1 | WEB-10 | — | N/A | unit | `vitest run src/commands/webinar/__tests__/log.test.ts` | ❌ W0 | ⬜ pending |
| 4-03-07 | 03 | 1 | WEB-11 | — | N/A | unit | `vitest run src/commands/webinar/__tests__/repeat.test.ts` | ❌ W0 | ⬜ pending |
| 4-engine | 01 | 0 | WEB-05 | — | N/A | unit | `vitest run src/upload/__tests__/chunked-upload.test.ts` | ✅ extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/commands/category/__tests__/list.test.ts` — stubs for CAT-01
- [ ] `src/commands/category/__tests__/create.test.ts` — stubs for CAT-02
- [ ] `src/commands/category/__tests__/update.test.ts` — stubs for CAT-03
- [ ] `src/commands/category/__tests__/delete.test.ts` — stubs for CAT-04
- [ ] `src/commands/webinar/__tests__/list.test.ts` — stubs for WEB-01
- [ ] `src/commands/webinar/__tests__/create.test.ts` — stubs for WEB-02
- [ ] `src/commands/webinar/__tests__/update.test.ts` — stubs for WEB-03
- [ ] `src/commands/webinar/__tests__/delete.test.ts` — stubs for WEB-04
- [ ] `src/commands/webinar/__tests__/upload-image.test.ts` — stubs for WEB-05
- [ ] `src/commands/webinar/__tests__/metrics.test.ts` — stubs for WEB-06
- [ ] `src/commands/webinar/__tests__/clips.test.ts` — stubs for WEB-07
- [ ] `src/commands/webinar/__tests__/highlights.test.ts` — stubs for WEB-08
- [ ] `src/commands/webinar/__tests__/list-formats.test.ts` — stubs for WEB-09
- [ ] `src/commands/webinar/__tests__/log.test.ts` — stubs for WEB-10
- [ ] `src/commands/webinar/__tests__/repeat.test.ts` — stubs for WEB-11

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `webinar upload-image` chunked protocol accepted by server | WEB-05 | Requires live API endpoint with a real webinar ID and image file | Run `twentythree webinar upload-image <id> ./image.jpg --type thumbnail` against live workspace |
| `webinar repeat` creates new webinar with different date | WEB-11 | Requires live API + verifying the new webinar appears in list | Run `twentythree webinar repeat <id> --date "2026-05-01T10:00:00Z"` and verify new ID in list |
| `webinar delete` prompt includes domain name | WEB-04 | Interactive @clack/prompts requires terminal | Run `twentythree webinar delete <id>` and confirm domain shown in prompt |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
