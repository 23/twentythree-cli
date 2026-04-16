---
phase: 10
slug: package-hygiene
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-16
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | packages/twentythree-cli/vitest.config.ts |
| **Quick run command** | `pnpm --filter twentythree-cli test --run` |
| **Full suite command** | `pnpm --filter twentythree-cli test --run && pnpm --filter twentythree-cli exec tsc --noEmit` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter twentythree-cli test --run`
- **After every plan wave:** Run `pnpm --filter twentythree-cli test --run && pnpm --filter twentythree-cli exec tsc --noEmit`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | PKG-03 | — | N/A | manual | `npm pack --dry-run 2>&1 \| grep -E "docs\|README"` | ✅ | ⬜ pending |
| 10-01-02 | 01 | 1 | PKG-02 | — | N/A | manual | `node -e "const p=require('./package.json'); console.log(p.scripts.prepack)"` | ✅ | ⬜ pending |
| 10-01-03 | 01 | 1 | PKG-01 | — | N/A | manual | `node -e "const p=require('./package.json'); ['author','repository','bugs','homepage','keywords'].forEach(k=>console.log(k,!!p[k]))"` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No new test files needed — all verifications are manual CLI/file checks.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `npm pack --dry-run` includes `/docs` and `/README.md` | PKG-03 | npm lifecycle output; not unit-testable | Run `cd packages/twentythree-cli && npm pack --dry-run` and confirm `/docs` and `/README.md` appear in the file list |
| `prepack` runs full build before pack | PKG-02 | Requires executing npm lifecycle | Run `cd packages/twentythree-cli && npm pack --dry-run` and confirm no errors; check dist/ is freshly built |
| All 5 metadata fields present in package.json | PKG-01 | Static file check | Run `node -e "const p=require('./packages/twentythree-cli/package.json'); ['author','repository','bugs','homepage','keywords'].forEach(k=>console.log(k,JSON.stringify(p[k])))"` and verify all fields are non-empty |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
