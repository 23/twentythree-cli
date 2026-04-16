---
phase: "02"
slug: auth-workspaces
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-14
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.4 |
| **Config file** | `packages/twentythree-cli/vitest.config.ts` |
| **Quick run command** | `pnpm --filter twentythree-cli test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter twentythree-cli test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-W0-01 | Wave 0 | 0 | AUTH-02 | — | N/A | manual | live curl to `/api/2/user/tokens` | ❌ W0 | ⬜ pending |
| 02-01-01 | 02-01 | 1 | AUTH-01 | T-02-01 | Token stored in OS keychain, not plaintext file | unit | `pnpm --filter twentythree-cli test` | ❌ W0 | ⬜ pending |
| 02-01-02 | 02-01 | 1 | AUTH-03 | T-02-01 | Workspace list stored in conf, not keychain | unit | `pnpm --filter twentythree-cli test` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02-02 | 1 | AUTH-02 | — | N/A | unit | `pnpm --filter twentythree-cli test` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02-02 | 1 | AUTH-05 | T-02-02 | Token refresh uses re-call not caching; file lock prevents race | unit | `pnpm --filter twentythree-cli test` | ❌ W0 | ⬜ pending |
| 02-03-01 | 02-03 | 2 | AUTH-11 | T-02-03 | No Authorization header in anonymous mode | unit | `pnpm --filter twentythree-cli test` | ❌ W0 | ⬜ pending |
| 02-03-02 | 02-03 | 2 | AUTH-10 | — | Clear error message for unauthenticated commands | unit | `pnpm --filter twentythree-cli test` | ❌ W0 | ⬜ pending |
| 02-04-01 | 02-04 | 2 | AUTH-06 | — | N/A | integration | `pnpm --filter twentythree-cli test` | ❌ W0 | ⬜ pending |
| 02-04-02 | 02-04 | 2 | AUTH-07/08/09 | — | N/A | integration | `pnpm --filter twentythree-cli test` | ❌ W0 | ⬜ pending |
| 02-04-03 | 02-04 | 2 | AUTH-04 | — | N/A | integration | `pnpm --filter twentythree-cli test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/twentythree-cli/src/auth/__tests__/credential-store.test.ts` — stubs for AUTH-01, AUTH-03
- [ ] `packages/twentythree-cli/src/auth/__tests__/token-refresh.test.ts` — stubs for AUTH-02, AUTH-05
- [ ] `packages/twentythree-cli/src/api/__tests__/client.test.ts` — stubs for AUTH-11
- [ ] `packages/twentythree-cli/src/commands/__tests__/auth.test.ts` — stubs for AUTH-06, AUTH-10
- [ ] `packages/twentythree-cli/src/commands/__tests__/workspace.test.ts` — stubs for AUTH-07, AUTH-08, AUTH-09

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| OS keychain actually stores/retrieves token | AUTH-01 | @napi-rs/keyring writes to native OS keychain — no mock equivalent | Run `auth credentials` with real domain+token, then `auth status` to confirm retrieval |
| Workspace discovery from live API | AUTH-02 | `/api/2/user/tokens` response shape must be confirmed against live API | Run `auth credentials` with real credentials; verify workspaces listed match expectations |
| Token expiry and refresh cycle | AUTH-05 | Requires a token near expiry to test live refresh | Observe logs when token is within refresh window |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
