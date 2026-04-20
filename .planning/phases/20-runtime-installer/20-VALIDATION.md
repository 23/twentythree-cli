---
phase: 20
slug: runtime-installer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual smoke test (no vitest in twentythree-skills package) |
| **Config file** | none — `scripts/validate-skills.mjs` is the only automated script |
| **Quick run command** | `pnpm --filter twentythree-skills test` |
| **Full suite command** | `pnpm --filter twentythree-skills test` |
| **Estimated runtime** | ~3 seconds (validate-skills) + manual smoke |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter twentythree-skills test` (confirms skill files still valid)
- **After Wave 1 (implementation complete):** Manual smoke test per success criteria below
- **Before `/gsd-verify-work`:** Manual smoke must pass all 4 success criteria
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | INSTALL-01, INSTALL-02, INSTALL-03 | — | N/A | manual smoke | `node packages/twentythree-skills/bin/add.js` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

The `validate-skills.mjs` script already exists and covers skill file structure. The installer has no automated test — manual smoke is the verification path per phase success criteria.

No Wave 0 test file creation required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Detects runtimes and copies 25 files | INSTALL-01 | Runtime detection requires real directories on disk; file copy cannot be unit-tested without a real filesystem | Run `node packages/twentythree-skills/bin/add.js`, confirm output shows runtime header(s) and 25 file lines per runtime |
| `--project` flag installs to cwd-relative paths | INSTALL-02 | Requires real filesystem write + cwd context | Run `node packages/twentythree-skills/bin/add.js --project` from repo root, confirm `.claude/skills/twentythree/` created with 25 files |
| Re-run produces same output, no corruption | INSTALL-03 | Idempotency verified by running twice and comparing | Run installer twice, confirm no errors on second run, confirm files are identical |
| No-runtime fallback exits 0 with helpful message | INSTALL-01 | Requires temporarily removing/mocking detected directories | Temporarily rename `~/.claude` (or run in a Docker container), confirm message names checked dirs and exits 0 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
