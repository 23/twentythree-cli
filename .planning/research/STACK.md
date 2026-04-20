# Stack Research: twentythree-skills Package

**Project:** twentythree-cli monorepo
**Milestone:** Adding `packages/twentythree-skills` — AI agent skills package
**Researched:** 2026-04-20
**Overall confidence:** HIGH — skill format verified against official Claude Code docs and agentskills.io spec; installer pattern verified against npm packages in the space; versions confirmed via npm CLI

---

## Context

The `twentythree-skills` package is a pure content + installer package. It ships:

1. **22 hand-authored `SKILL.md` files** (one per CLI resource group) following the Agent Skills open standard
2. **An installer CLI** (`npx twentythree-skills add`) that detects which AI runtimes are installed and places skill files in the correct location for each

The existing CLI (`twentythree-cli`) is unchanged. No new credential handling, no new API clients. This milestone adds a sibling npm package to the monorepo.

---

## Skill Format: What to Know Before Picking Dependencies

The [Agent Skills open standard](https://agentskills.io/specification) (adopted by Claude Code, Codex CLI, and GitHub Copilot as of 2026) defines a single portable format:

- A skill is a **directory** named after the skill, containing a `SKILL.md` file
- `SKILL.md` has YAML frontmatter (required: `name`, `description`) followed by markdown instructions
- The `name` field must match the parent directory name and must be lowercase alphanumeric + hyphens only
- Supporting files (`scripts/`, `references/`, `assets/`) are optional

**Installation paths per runtime:**

| Runtime | Personal (global) | Project-local |
|---------|-------------------|---------------|
| Claude Code | `~/.claude/skills/<skill-name>/SKILL.md` | `.claude/skills/<skill-name>/SKILL.md` |
| Codex CLI | `~/.agents/skills/<skill-name>/SKILL.md` | `.agents/skills/<skill-name>/SKILL.md` |
| GitHub Copilot (VS Code) | Via VS Code agent skills settings | `.github/skills/<skill-name>/SKILL.md` |
| Claude.ai (web) | ZIP upload via Customize > Skills UI | Not applicable — no CLI path |

**Key implication for the installer:** The format is identical across Claude Code and Codex. The installer's job is purely file placement — no format conversion needed for these runtimes. Claude.ai (web) requires a ZIP upload through the browser UI and cannot be automated from a CLI installer; it is out of scope for the `add` command.

---

## Recommended Stack

### (a) Installer CLI

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `commander` | `^14.0.3` | CLI argument parsing for the `add` command | Zero runtime dependencies (verified npm). 500M+ weekly downloads — far higher adoption than oclif for simple single-command installers. 25ms startup vs 135ms for oclif — matters for `npx` invocations where startup cost is paid every time. The `twentythree-cli` package already uses oclif for its 219-command surface; the installer only needs one command (`add`) with a few flags. Commander is the correct tool at this scope. |
| `@clack/prompts` | `^1.2.0` | Interactive confirmation and runtime selection prompts | Already a dependency of `twentythree-cli` — the monorepo can share it. Avoids adding a second prompts library. Provides styled `confirm`, `select`, `multiselect` primitives needed to ask "install globally or project-local?" and "which runtimes?". |

**What the installer does (no extra packages needed):**

- Uses `fs` (Node built-in) to copy skill directories into target paths
- Uses `os.homedir()` (Node built-in) to resolve `~/.claude/` and `~/.agents/` paths
- Uses `fs.existsSync` to detect which runtimes are installed (check if `~/.claude/` or `~/.codex/` exist)
- Uses `path.join()` for cross-platform path construction

No file-copy library needed — Node's built-in `fs.cpSync` (Node 16.7+, stable in Node 22) handles recursive directory copy.

### (b) Skill File Placement (Multi-Runtime Detection)

No additional packages needed beyond what Commander and Node built-ins provide. Runtime detection is a directory existence check, not an SDK integration.

| Runtime Detection | Method |
|-------------------|--------|
| Claude Code present | `fs.existsSync(path.join(os.homedir(), '.claude'))` |
| Codex CLI present | `fs.existsSync(path.join(os.homedir(), '.codex'))` OR `which codex` via `child_process.execSync` |

Detection logic is ~20 lines of TypeScript using only built-in modules.

### (c) Format Conversion (Markdown → JSON schemas for OpenAI)

**No format conversion library is needed.** The Agent Skills format is the same markdown+frontmatter `SKILL.md` structure for both Claude Code and Codex CLI. OpenAI adopted the same open standard in 2026; their `~/.agents/skills/` path reads identical `SKILL.md` files.

The JSON Schema tool definitions used in the OpenAI Assistants API are a separate concern (for programmatic tool calling, not for installing skills into a coding agent like Codex). The `twentythree-skills` package targets coding agents (Codex CLI, Claude Code), not the Assistants API. No JSON schema generation is needed.

**If JSON tool schema export is added later** (a separate feature, not this milestone): use `js-yaml` (4.1.1) to parse frontmatter and generate JSON output. Do not add it now.

### (d) Build Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `tsdown` | `^0.21.9` | Compile TypeScript installer to distributable JS | Already the monorepo build tool in `twentythree-cli`. Zero additional config. Shared turbo pipeline via the existing `turbo.json`. |
| `typescript` | `^5.0.0` | Type checking | Root-level devDependency already present. The `twentythree-skills` package can consume it via workspace. |

**Output format for the installer:** The installer runs via `npx twentythree-skills add`. It must be CJS-compatible (same constraint as `twentythree-cli` — the monorepo ships CJS). Set `"type": "commonjs"` in `packages/twentythree-skills/package.json`, matching the existing package.

### (e) Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `vitest` | `^4.1.4` | Unit tests for installer logic (path resolution, runtime detection) | Already used in `twentythree-cli`. The monorepo Turbo pipeline already runs `vitest` across packages. No new devDependency at the monorepo root level. |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Installer CLI framework | `commander` | `oclif` | oclif is the right choice for 219-command surfaces; it has 30+ dependencies and 135ms startup. For a single `add` command that runs via `npx`, commander's 0 dependencies and 25ms startup wins. Using oclif here would add `@oclif/core` as a dependency of the skills package — creating a version-coupling risk between the two packages in the monorepo. |
| Installer CLI framework | `commander` | `yargs` | yargs has ~7 dependencies; no advantage over commander for a single command. |
| File placement | Node `fs.cpSync` (built-in) | `ncp`, `fs-extra`, `cpy` | All of these add dependencies for functionality that Node 22 provides natively. `fs.cpSync` with `{ recursive: true }` is sufficient. |
| Frontmatter parsing | No library (hand-author only, no parse needed) | `gray-matter` | The installer does not parse SKILL.md files — it copies them as-is. gray-matter would only be needed if the installer validates or transforms frontmatter. Not needed now. |
| Format conversion | None (same format across runtimes) | `js-yaml` for JSON schema export | No JSON schema export in this milestone. Defer. |
| Runtime detection | Node `fs.existsSync` + `os.homedir()` | `which` npm package, `execa` | Built-ins are sufficient. No exec needed; directory existence is the right signal. |
| Prompt UX | `@clack/prompts` (shared dep) | `inquirer` | Already using `@clack/prompts` in the monorepo; adding inquirer would be a redundant prompts library. |
| Skill validation | None (hand-authored, no CI validator) | `skills-ref` CLI | `skills-ref validate` is useful for community skill packages with untrusted contributors. These skills are hand-authored by the package maintainer and committed to the monorepo — editor and code review catches issues. Add if publishing to a skill registry later. |

---

## Integration Notes

### pnpm Workspace

`packages/twentythree-skills` is already scaffolded as a workspace package (`packages/*` glob in `pnpm-workspace.yaml`). The Turbo pipeline picks it up automatically. Add `"build"` and `"test"` scripts to match the pattern in `twentythree-cli`.

If `@clack/prompts` is shared, declare it in `packages/twentythree-skills/package.json` as a regular dependency (not `workspace:*`). pnpm will deduplicate the install. Do not reference `twentythree-cli`'s `@clack/prompts` via workspace link — that creates an undeclared peer dependency.

### CJS Compatibility

Set `"type": "commonjs"` in `packages/twentythree-skills/package.json`. This matches the existing CLI package. The installer uses `commander` (CJS-safe), `@clack/prompts` (CJS-safe at v1.x), and Node built-ins. No ESM-only packages.

### Bin Entrypoint

```json
"bin": {
  "twentythree-skills": "./bin/run.js"
}
```

The `bin/run.js` entrypoint follows the same pattern as `twentythree-cli/bin/run.js`. `tsdown` bundles the installer TypeScript to `dist/index.js`; the bin script requires the dist.

### Skills as Package Files

The 22 `SKILL.md` files live in `packages/twentythree-skills/skills/<resource-group>/SKILL.md`. They are included in the npm package via:

```json
"files": [
  "/bin",
  "/dist",
  "/skills",
  "/README.md"
]
```

The installer reads skills from its own package directory using `__dirname` (CJS) to locate the bundled `skills/` folder, then copies to the target runtime path.

### No Auth Dependency

The skills package does not depend on `twentythree-cli`, `@napi-rs/keyring`, or `conf`. It is a standalone content + installer package. The skill content references the CLI by name (`twentythree videos list`) but has no runtime dependency on it.

### `npx` Usage

`npx twentythree-skills add` works without global install — npm downloads and runs the package on demand. This is the intended distribution pattern. The `commander` + Node-built-in approach keeps the cold-start time acceptable under npx.

---

## New Dependencies Summary

### `packages/twentythree-skills/package.json`

**Runtime dependencies (`dependencies`):**

| Package | Version | Reason |
|---------|---------|--------|
| `commander` | `^14.0.3` | CLI argument parsing for installer |
| `@clack/prompts` | `^1.2.0` | Interactive prompts (runtime selection, install scope) |

**Dev dependencies (`devDependencies`):**

| Package | Version | Reason |
|---------|---------|--------|
| `tsdown` | `^0.21.9` | Build TypeScript installer |
| `typescript` | `^5.0.0` | Type checking (can reference root; or pin explicitly) |
| `@types/node` | `^22.0.0` | Node built-in types (`fs`, `os`, `path`) |
| `vitest` | `^4.1.4` | Tests |

**Total new runtime dependencies added to the monorepo: 1** (`commander` — `@clack/prompts` is already present in `twentythree-cli`).

---

## What NOT to Add

| Rejected Addition | Why Not |
|-------------------|---------|
| `oclif` / `@oclif/core` | Wrong tool for a single-command installer; adds 30+ transitive dependencies; version-coupling risk with the CLI package |
| `gray-matter` / `js-yaml` | Installer copies files, does not parse them. Not needed now. |
| `fs-extra`, `cpy`, `ncp` | Node 22 `fs.cpSync` is sufficient for recursive directory copy |
| `which` (npm package) | `fs.existsSync` on config directories is the right detection signal — cleaner than shelling out to `which` |
| `execa` / `cross-spawn` | No shell execution needed in the installer |
| `ora` | Spinners overkill for a file copy operation taking <100ms; `@clack/prompts` spinner is sufficient if any async UX is needed |
| `chalk` | `@clack/prompts` provides all the styled output needed; chalk alone is redundant |
| `zod` | Skill frontmatter validation not needed for hand-authored skills in a maintained monorepo |
| OpenAI SDK / Anthropic SDK | The skills package ships markdown content and an installer; it is not an AI SDK wrapper |
| `handlebars` / template engine | Skills are static markdown files, not generated from templates |

---

## Sources

- Agent Skills open standard specification: https://agentskills.io/specification
- Claude Code skills documentation (frontmatter fields, directory paths): https://code.claude.com/docs/en/skills
- Codex CLI skills paths (`~/.agents/skills/`, `.agents/skills/`): https://developers.openai.com/codex/skills
- VS Code agent skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- Claude.ai skills (ZIP upload, web UI only): https://support.claude.com/en/articles/12512180-use-skills-in-claude
- commander npm (v14.0.3, zero dependencies confirmed): https://www.npmjs.com/package/commander
- commander startup time benchmark (25ms vs oclif 135ms): https://www.pkgpulse.com/blog/how-to-build-cli-nodejs-commander-yargs-oclif
- @clack/prompts npm (v1.2.0 confirmed): https://www.npmjs.com/package/@clack/prompts
- tsdown npm (v0.21.9 confirmed): https://www.npmjs.com/package/tsdown
- vitest npm (v4.1.4 confirmed): https://www.npmjs.com/package/vitest
- Agent Skills open standard cross-runtime adoption (Claude, OpenAI, Google): https://www.mindstudio.ai/blog/agent-skills-open-standard-claude-openai-google
- skills CLI by Vercel (reference for runtime detection patterns): https://github.com/vercel-labs/skills
