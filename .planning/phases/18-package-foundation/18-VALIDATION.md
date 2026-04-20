---
phase: 18
slug: package-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Plain Node.js (no test framework — validate-skills.mjs is the test) |
| **Config file** | `"test": "node scripts/validate-skills.mjs"` in package.json |
| **Quick run command** | `pnpm --filter twentythree-skills test` |
| **Full suite command** | `pnpm --filter twentythree-skills test && pnpm build` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter twentythree-skills test`
- **After every plan wave:** Run `pnpm --filter twentythree-skills test && pnpm build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | PKG-01 | — | N/A | manual | `npm pack --dry-run 2>&1 \| grep -E "bin\|skills"` | ❌ W0 | ⬜ pending |
| 18-01-02 | 01 | 1 | PKG-02 | — | N/A | integration | `pnpm build 2>&1 \| grep -v twentythree-skills` | ❌ W0 | ⬜ pending |
| 18-01-03 | 01 | 1 | PKG-03 | — | N/A | script | `pnpm --filter twentythree-skills test` | ❌ W0 | ⬜ pending |
| 18-02-01 | 02 | 2 | SKILL-01 | — | N/A | manual | `grep -c 'allowed-tools\|auth credentials\|--agent' packages/twentythree-skills/skills/SKILL.md` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/twentythree-skills/scripts/validate-skills.mjs` — covers PKG-03 (validate-skills script must exist before it can be run)
- [ ] `packages/twentythree-skills/bin/add.js` — covers PKG-01 bin entry
- [ ] `packages/twentythree-skills/turbo.json` — covers PKG-02 no-build override
- [ ] `packages/twentythree-skills/skills/SKILL.md` — covers SKILL-01 (moved from package root)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `npm pack --dry-run` shows `/bin` and `/skills` in tarball | PKG-01 | npm pack output is not machine-parseable as pass/fail | Run `cd packages/twentythree-skills && npm pack --dry-run` and verify `/bin/add.js` and `/skills/SKILL.md` appear in the file list |
| `pnpm build` does not compile twentythree-skills | PKG-02 | Build output varies; need human to confirm absence | Run `pnpm build` from repo root and confirm no compile step runs for the skills package |
| SKILL.md sections are accurate and complete | SKILL-01 | Content quality cannot be grep-verified | Read `skills/SKILL.md` and confirm: auth section, 22 resource groups, `--agent` docs, `allowed-tools: Bash(twentythree *)` frontmatter |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
