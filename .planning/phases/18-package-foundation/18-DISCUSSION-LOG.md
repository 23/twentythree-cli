# Phase 18 Discussion Log

**Phase:** 18 — Package Foundation
**Date:** 2026-04-20
**Outcome:** 3 gray areas discussed, all decisions captured in CONTEXT.md

---

## Gray Area 1: Skill file directory structure

**Question:** Should skill files live at the package root or in a `skills/` subdirectory?

**Options presented:**
1. Package root — `packages/twentythree-skills/SKILL.md` directly
2. `skills/` subdirectory — `packages/twentythree-skills/skills/SKILL.md` + `skills/reference/` + `skills/workflows/`

**User choice:** Follow recommendations (option 2 — `skills/` subdirectory)

**Decision (D-01):** Skill files live under `skills/` subdirectory. The existing placeholder `packages/twentythree-skills/SKILL.md` moves to `packages/twentythree-skills/skills/SKILL.md`. Phase 19 reference files go in `skills/reference/`, workflow files in `skills/workflows/`.

**Rationale:** Keeps package root clean, groups all installable content under one directory, mirrors standard documentation package conventions.

---

## Gray Area 2: Package module type

**Question:** Should the package use ESM or CJS?

**Options presented:**
1. ESM (`"type": "module"`) — native ESM, no build step, Node built-ins only
2. CJS — match CLI package type
3. Dual — both (adds complexity)

**User choice:** ESM (option 1)

**Decision (D-02):** `"type": "module"` (ESM). No TypeScript compilation, no build step. The installer bin (`bin/add.js`) is a native ESM script using `node:` built-ins only. Node 22 engines constraint (matches the CLI). `turbo.json` override marks the package as no-build.

**Rationale:** Skills package has no compilation needs — it's static markdown + a small installer script. ESM is the natural fit for a no-build Node 22 package. Both CJS (CLI) and ESM (skills) coexist fine in a pnpm monorepo.

---

## Gray Area 3: Root SKILL.md scope

**Question:** How comprehensive should `skills/SKILL.md` be — minimal teaser pointing to reference files, or full self-contained shell?

**Options presented:**
1. Minimal — just auth setup + command list, links to Phase 19 reference files
2. Full shell — complete auth setup, all 22 resource groups, `--agent` docs, `allowed-tools`, workflow patterns (immediately useful without Phase 19)
3. Hybrid — auth + syntax + abbreviated resource list

**User choice:** Full shell (option 2, "c")

**Decision (D-03):** `skills/SKILL.md` is a full shell — immediately useful without Phase 19 reference files. Includes: full auth setup section (`twentythree auth credentials` as prerequisite, workspace select, multi-workspace switching), complete resource index (all 22 resource groups with `twentythree <topic>` syntax), `--agent` flag documentation (how agents introspect any command before calling it), `allowed-tools: Bash(twentythree *)` YAML frontmatter, and workflow notes (common multi-step patterns).

**Rationale:** Phase 19 may ship later or in parallel. An agent using Phase 18 output alone should be able to orient itself across all resources and make calls — not just know auth exists.

---

## Summary

All 3 gray areas resolved. No deferred items from discussion. CONTEXT.md written with full decisions for researcher and planner agents.
