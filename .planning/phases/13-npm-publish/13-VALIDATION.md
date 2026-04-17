---
phase: 13
slug: npm-publish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-17
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `packages/twentythree-cli/package.json` (scripts.test) |
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
| 13-01-01 | 01 | 1 | PUBLISH-01 | — | N/A | manual | `npm view twentythree-cli` returns 1.0.0 | ✅ | ⬜ pending |
| 13-01-02 | 01 | 1 | PUBLISH-03 | — | N/A | manual | `.github/workflows/publish.yml` exists | ✅ | ⬜ pending |
| 13-02-01 | 02 | 2 | PUBLISH-02 | — | N/A | manual | `npm install -g twentythree-cli && twentythree --version` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test stubs needed — Phase 13 tests are manual/integration (npm publish and global install verification).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Package published to npm at v1.0.0 | PUBLISH-01 | Requires live npm registry and auth token | Run `npm view twentythree-cli version` after CI publish job completes |
| Global install and version check | PUBLISH-02 | Requires live published package on npm | In clean shell: `npm install -g twentythree-cli && twentythree --version` |
| GitHub Actions workflow triggers on tag | PUBLISH-03 | Requires live GitHub Actions run | Push v1.0.0 tag, verify Actions tab shows publish job ran and passed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
