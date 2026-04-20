# Research Summary: v1.3 TwentyThree Agent Skill

**Project:** twentythree-cli — milestone v1.3: twentythree-skills npm package
**Domain:** Agent skill packages for CLI-wrapped APIs; multi-runtime AI agent integration
**Researched:** 2026-04-20
**Confidence:** HIGH

---

## Executive Summary

This milestone adds a sibling npm package (`twentythree-skills`) to the monorepo. The package ships hand-authored SKILL.md files covering all 22 CLI resource groups plus a lightweight installer (`npx twentythree-skills add`) that detects installed AI runtimes and places skill files in the correct location. The existing `twentythree-cli` package is unchanged. The Agent Skills open standard (agentskills.io) is confirmed stable with 35+ runtime adopters — a single SKILL.md file format works across Claude Code, OpenAI Codex, GitHub Copilot, Cursor, and others. No format conversion is needed between runtimes.

The recommended approach is a two-layer structure: one root `twentythree/SKILL.md` (~200 lines: auth setup, command syntax, resource index, invariants) plus 22 per-group reference files loaded on demand. This follows the Basecamp production pattern and Anthropic best practices for progressive disclosure. Hand-authored content outperforms generated content for agent usability; the existing `--agent` flag on all 219 commands provides an authoritative reference for command metadata when content needs updating.

The key risk is skill content drifting from the CLI as commands evolve. The mitigation is treating `agentMetadata` (`--agent` flag output) as the canonical machine-readable source for per-command detail, keeping manually authored content limited to auth setup, workflow patterns, and invariants — the parts that change rarely and cannot be generated. The second risk is the installer silently overwriting user-customized skill files; require `--force` for overwrites and hash-compare before copying.

---

## Stack Additions

### New Dependencies (packages/twentythree-skills only)

| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| `commander` | `^14.0.3` | CLI argument parsing for installer `add` command | Zero runtime dependencies; 25ms startup vs 135ms for oclif — matters for `npx` cold starts; correct scope for a single-command installer |
| `@clack/prompts` | `^1.2.0` | Interactive runtime selection and install scope prompts | Already in monorepo via `twentythree-cli`; pnpm deduplicates; declare as explicit dep, not a workspace reference |

**No other new runtime dependencies.** The installer uses Node.js built-ins only: `fs.cpSync` (recursive copy, Node 22+), `os.homedir()`, `path.join()`, `fs.existsSync`. No `fs-extra`, `cpy`, or `execa` needed.

**Dev dependencies (twentythree-skills only):** `tsdown ^0.21.9`, `typescript ^5.0.0`, `@types/node ^22.0.0`, `vitest ^4.1.4` — all already present in the monorepo.

**Total new runtime deps added to the monorepo: 1** (`commander`).

### What NOT to Add

| Rejected | Reason |
|----------|--------|
| `oclif` / `@oclif/core` | 135ms startup + 30 transitive deps for one command; version-coupling risk with CLI package |
| `gray-matter` / `js-yaml` | Installer copies files, does not parse them |
| `fs-extra`, `cpy`, `ncp` | Node 22 `fs.cpSync` is sufficient |
| `ora`, `chalk` | `@clack/prompts` covers all styled output needed |
| `zod` | Hand-authored skills in a maintained monorepo; editor + code review is the gate |
| OpenAI SDK / Anthropic SDK | This package ships markdown and an installer, not AI SDK wrappers |
| Any template engine | Skills are static markdown, not generated from templates |

### Module Format

`"type": "module"` (ESM) for `twentythree-skills`. The installer runs standalone via `npx`, so ESM is safe. This is the inverse of `twentythree-cli` which is `"type": "commonjs"` due to oclif.

---

## Feature Findings

### Table Stakes (missing = package feels broken)

| Feature | Notes |
|---------|-------|
| Single `twentythree/SKILL.md` entrypoint | Mandatory per agentskills.io spec; `name` must match directory name, lowercase-hyphenated |
| Auth setup as first section | Every command fails without `twentythree auth credentials`; agents do not assume preconditions |
| `--json` flag guidance | "Always append `--json` in agentic contexts for machine-parseable output" |
| Command syntax overview | `twentythree <resource> <verb> [--flags]`; index of all 22 resource groups |
| Error signal guidance | Which errors are retryable vs fatal; 401 = run auth credentials again |
| Correct `files` whitelist in package.json | All skill sub-directories must be enumerated; verify with `npm pack --dry-run` |
| Installer prints where files were placed | Silent installs erode trust |

### Differentiators (high-value, not universally present)

| Feature | Value |
|---------|-------|
| `--agent` flag documentation | Self-discovery mechanism; agents run `twentythree <cmd> --agent` to introspect before calling — no other CLI skill package has this |
| 22 reference files (one per resource group) | Progressive disclosure; agents load only relevant context; 219 commands cannot fit in one SKILL.md under the 500-line target |
| Auth scope table | Documents which of the 5 auth scopes each resource group requires; prevents write-scope failures |
| Chunked upload guidance | Non-obvious invariant; agents will construct direct multipart requests without explicit documentation |
| `twentythree doctor` guidance | Reduces blind retry loops on persistent errors |
| Multi-workspace guidance | Documents `--workspace <domain>` flag pattern |
| Non-interactive flag equivalents | For every prompt-based command, document the `--flag` equivalent for CI/agent contexts |

### Key Design Decision Confirmed: One skill, not 22

Install one `twentythree` skill with reference files, not 22 separate sub-skills. 22 descriptions loading at startup consumes ~1,760 chars of context budget before any user query. The single-skill + reference-file pattern lets agents load only relevant context on demand.

### Defer Post-v1

- MCP server integration (separate milestone; different pattern)
- Automated skill generation pipeline from `--agent` output
- `skills-ref validate` CI gate (for community packages; not needed for a maintained monorepo)
- JSON tool schema export for OpenAI Assistants API (not needed; Codex CLI uses SKILL.md natively)

---

## Architecture Decisions

### Package Structure

```
packages/twentythree-skills/
├── package.json              # type: module, bin, files whitelist, no workspace:* deps
├── SKILL.md                  # Top-level skill: auth, syntax, resource index, invariants (~200 lines)
├── skills/                   # One subdirectory per resource group
│   ├── videos/SKILL.md
│   ├── categories/SKILL.md
│   ├── webinars/SKILL.md
│   ├── analytics/SKILL.md
│   ├── auth/SKILL.md
│   ├── ... (22 total)
│   └── references/
│       └── api-terms.md      # CLI-to-API terminology mapping (generated from term-map.ts)
├── workflows/                # Optional: multi-step workflow files
│   ├── upload-and-publish.md
│   └── webinar-lifecycle.md
├── bin/
│   └── add.js                # Plain ESM JS; node: built-ins only; no transpilation needed
├── scripts/
│   ├── generate-references.mjs   # Reads term-map.ts, writes api-terms.md
│   └── validate-skills.mjs       # Checks all SKILL.md have valid frontmatter
└── turbo.json                # Package-level override: dependsOn: [], outputs: [skills/references/api-terms.md]
```

### Key Structural Choices

**`twentythree-skills` has zero runtime imports from `twentythree-cli`.** The relationship is documentation only. Adding a runtime dependency would pull the full CLI into the installer and create an unnecessary turbo build-ordering constraint.

**Installer is plain ESM JS, no TypeScript, no build step.** Runs via `npx twentythree-skills add`; uses only node: built-ins. Under 200 lines. Commander is the CLI parser.

**Turborepo:** Package-level `turbo.json` with `"dependsOn": []`. The skills build does not depend on the CLI build. Root `turbo.json` is unchanged.

**Versioning:** Already configured — `.changeset/config.json` has `"linked": [["twentythree-cli", "twentythree-skills"]]`. Both packages receive the same version bump.

**Publish order:** CLI publishes first, then skills package. Changesets respects this automatically.

**`files` whitelist in package.json:**
```json
"files": ["/bin", "/skills", "/SKILL.md"]
```
Verify with `npm pack --dry-run` before first publish.

### What Does NOT Change

Root `turbo.json`, root `package.json`, `pnpm-workspace.yaml`, `.changeset/config.json`, and the `twentythree-cli` package itself are all unchanged.

---

## Watch Out For

1. **Auth flow absent from skill** — Every workflow section must begin with `twentythree auth credentials` as an explicit prerequisite. Test from a fresh agent session with no prior CLI auth. Without this, every agent workflow fails with a 401 and the agent retries blindly.

2. **Installer silently overwrites user-customized files** — Hash canonical content against existing installed file; if different, print diff and require `--force`. Do not `cp` blindly.

3. **`workspace:*` dependency leakage** — Never add `twentythree-cli` as a `workspace:*` dependency in the skills package. Any CI step using `npm publish` instead of `pnpm publish` ships the literal string, making the package uninstallable for npm consumers.

4. **Multi-runtime path mismatch** — Installer must write to all detected runtime paths (`~/.claude/skills/`, `~/.agents/skills/`, `~/.cursor/skills/`, `~/.github/skills/`), not just Claude Code. Detection is directory-existence-based, not env-var-based (env vars are not set during `npx` terminal invocations).

5. **Vague `description` field prevents skill self-activation** — Description must contain the exact trigger phrases users say. Front-load the highest-value triggers in the first 200 characters. Claude Code truncates the `description` field at 1,536 characters in skill listings.

---

## Scope Clarifications (Research Surprises)

**No format conversion needed between runtimes.** OpenAI Codex adopted the same agentskills.io SKILL.md format as Claude Code. Any plan that assumed separate JSON schemas for OpenAI should be dropped. Claude.ai web is also out of scope for the installer — it requires a ZIP upload through the browser UI.

**The installer bin file needs no TypeScript compile.** Plain ESM JavaScript (`bin/add.js`) eliminates a build step for the package's only executable artifact.

**`twentythree-skills` is already scaffolded as a workspace package.** The pnpm workspace, changeset config, and SKILL.md stub are in place. This milestone is primarily content authoring + installer implementation, not new package scaffolding from scratch.

**One skill is better than 22.** Any plan that assumed one skill per resource group should be revised. A single `twentythree` skill with reference files is strictly better for context budget and agent activation behavior.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions confirmed via npm; agentskills.io spec verified; commander benchmark sourced |
| Features | HIGH | Official agentskills.io spec, Anthropic best practices, Basecamp production SKILL.md inspected |
| Architecture | HIGH | Drawn from live codebase + official runtime docs (Claude Code, Codex, Copilot) |
| Pitfalls | HIGH | Verified against official Anthropic skill authoring docs, npm publish docs, community research |

**Overall confidence: HIGH**

### Gaps to Address During Execution

- **Skill content quality is not automatable.** The 22 reference files require authorial judgment. Plan for iterative review against actual agent sessions, not a one-time write.
- **Codex skills directory is ambiguous.** Sources reference both `~/.codex/skills/` and `~/.agents/skills/`. Confirm the canonical path against the live Codex CLI before the installer ships.
- **Installer UX for "no runtimes detected" case.** Print runtime-specific install paths as a fallback help message, but exact copy is unresolved. Decide during implementation.

---

## Sources

### Primary (HIGH confidence)
- agentskills.io specification — format, frontmatter fields, directory structure
- Claude Code skills documentation — frontmatter reference, lifecycle, allowed-tools
- Anthropic skill authoring best practices — conciseness, progressive disclosure, auth patterns
- OpenAI Codex skills docs — same SKILL.md format confirmed, skills directory paths
- Basecamp skills repository — production example of CLI-backed skill package (155+ endpoints)
- commander npm (v14.0.3, zero deps confirmed)
- @clack/prompts npm (v1.2.0), tsdown (v0.21.9), vitest (v4.1.4) — all confirmed
- Live codebase: packages/twentythree-skills/package.json, .changeset/config.json, turbo.json

### Secondary (MEDIUM confidence)
- Vercel skills installer CLI — runtime detection patterns, idempotency
- commander startup benchmark (25ms vs oclif 135ms) — pkgpulse.com
- agentskills.io cross-runtime adoption (35+ runtimes) — mindstudio.ai

### Tertiary (LOW confidence)
- Codex skills canonical path (`~/.codex/skills/` vs `~/.agents/skills/`) — sources conflict; verify against live Codex CLI before installer ships

---

*Research completed: 2026-04-20*
*Ready for roadmap: yes*
