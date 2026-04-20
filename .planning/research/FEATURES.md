# Feature Landscape: twentythree-skills Agent Skill Package

**Domain:** Agent skill packages for CLI-wrapped APIs; multi-runtime AI agent integration
**Researched:** 2026-04-20
**Milestone:** twentythree-skills — separate npm package shipping hand-authored skill files
**Confidence:** HIGH — based on official agentskills.io spec, Anthropic Claude Code docs, Basecamp skills repo inspection, OpenAI Codex skills docs, and live codebase analysis

---

## Background: What the Agent Skills Ecosystem Actually Is

The Agent Skills open standard (agentskills.io) originated as a Claude feature, was published as an open standard by Anthropic in late 2025, and was subsequently adopted by OpenAI Codex, Gemini CLI, GitHub Copilot, VS Code, Cursor, Roo Code, and 25+ other agent runtimes. The core format is a `SKILL.md` file with YAML frontmatter in a named directory. Every compliant runtime reads the same file — one skill source works across all platforms.

The Basecamp skills package (`basecamp/skills`) is the clearest prior art for a CLI-backed skill package: their SKILL.md covers 155+ API endpoints across 15+ resource groups from a single file, with `--agent` output mode, `--json` mode, and OAuth token pre-configuration as established patterns.

---

## Skill File Format: What a SKILL.md Must Contain

### Minimum Viable Frontmatter (agentskills.io spec)

```yaml
---
name: twentythree           # required; max 64 chars; lowercase letters, numbers, hyphens only
description: |              # required; max 1024 chars; describes what the skill does AND when to use it
  Full TwentyThree CLI integration — upload videos, manage categories, run webinars,
  query analytics, manage audiences, configure spots and players. Use when the user
  asks about video hosting, content management, viewer analytics, or TwentyThree
  platform operations.
---
```

### Claude Code Extensions (non-standard but additive)

Claude Code extends the base spec with additional frontmatter fields that do not break other runtimes (they are simply ignored). For twentythree-skills, relevant Claude Code extensions include:

```yaml
compatibility: Requires Node.js >=22 and twentythree-cli installed globally (npm install -g twentythree-cli)
allowed-tools: Bash(twentythree *)
```

The `allowed-tools` field pre-approves `twentythree *` bash commands so Claude Code does not interrupt the agent for permission on each CLI call. This is the correct pattern for CLI-backed skills.

### Body Content: What Actually Goes Inside the SKILL.md

Based on Basecamp's production SKILL.md and Anthropic's best practices, the body should contain:

1. **Auth setup section** — how to configure credentials before using any other command
2. **Command syntax quick-reference** — `twentythree <resource> <verb> [flags]`
3. **Output format guidance** — `--json` for machine-readable, `--agent` for metadata, default for humans
4. **Resource group index** — one line per group pointing to reference files for detail
5. **Invariants and decision rules** — "always use `--json` in agentic contexts", "check auth status before bulk operations"
6. **Common workflows** — 3-5 concrete multi-step patterns (upload video → assign category → set thumbnail)

---

## Feature Categories

### Table Stakes

Features every agent skill package for a CLI must have. Missing any of these makes the package feel broken or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Single `SKILL.md` entrypoint per skill | All runtimes discover skills via a named directory + `SKILL.md`; without this, the package does not load in any runtime | Low | Mandatory per agentskills.io spec; `name` must match directory name |
| Auth setup instructions | Every command fails without credentials; agents cannot self-configure without documented steps | Low | Document `twentythree auth credentials` (domain + bearer token) and `twentythree workspace use` — agents must run these once before any API call |
| `--json` flag guidance | Agents need structured output, not human-formatted tables; the CLI already supports `--json` globally | Low | One line: "Always append `--json` in agentic contexts for machine-parseable output" |
| Command syntax overview | Without this, the agent guesses command structure and hallucinates flags | Low | `twentythree <resource> <verb> [--flags]`; list the 22 resource groups |
| Error signal guidance | Agents need to know which errors are recoverable (retry) vs fatal (auth, missing resource) | Low | Document exit codes; "auth errors require re-running auth credentials"; "404 on resource ID means the resource does not exist" |
| Package metadata (name, description, version) | Skills are distributed via npm; npm consumers expect proper package.json | Low | `name: "@twentythree/skills"` or `"twentythree-skills"`; semver aligned with CLI version |
| Installation instructions | Agents and users need to know how to install and where files land | Low | `npx skills add twentythree/skills` or `npm install -g twentythree-skills` |

### Differentiators

Features not universally present in skill packages, but high-value for twentythree-skills given the existing CLI capabilities.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `--agent` flag documentation | The CLI already outputs `agentMetadata` (api_endpoint, auth_scope, output_shape, side_effects) on every command with `--agent`; documenting this gives agents a self-discovery mechanism no other CLI skill package has | Low | "Run `twentythree <command> --agent` to get machine-readable metadata for that command before calling it" |
| Reference files per resource group | 219 commands cannot fit in one SKILL.md body without exceeding the 500-line target; splitting into `references/video.md`, `references/analytics.md`, etc. enables progressive disclosure — agents load only what they need | Med | 22 reference files, one per resource group; linked from main SKILL.md |
| Workflow skill files | Hand-authored multi-step workflows for common patterns (upload-and-publish, webinar-create-and-go-live, audience-export-analytics) give agents a higher-level API than raw commands | Med | 5-10 files in `workflows/` subdirectory |
| Auth scope table | The CLI has 5 auth scopes (anonymous, none, read, write, admin, super); documenting which resource groups require which scope prevents agents from attempting write operations with read-only tokens | Low | 22 rows × 6 scope columns; link to in reference files |
| Chunked upload guidance | The CLI always uses chunked upload for file uploads (never multipart); this is a non-obvious invariant that agents will get wrong without explicit documentation | Low | One invariant block: "File uploads use chunked protocol automatically — never construct multipart requests directly" |
| `twentythree doctor` guidance | The doctor command is already built; pointing agents to it on error reduces blind retry loops | Low | "On persistent errors, run `twentythree doctor` to diagnose auth, network, and dependency issues" |
| Multi-workspace guidance | The CLI supports multiple authenticated workspaces; agents working in multi-workspace environments need to know about `--workspace` flag and `twentythree workspace list` | Low | One section; the `--workspace <domain>` flag pattern |

### Anti-Features

Features to explicitly NOT build in v1 of twentythree-skills.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| One SKILL.md with all 219 commands inlined | 219 commands × flags × descriptions = 3,000+ lines; exceeds 500-line target; kills context budget; agents load the whole thing even when they only need video commands | Split into main SKILL.md (overview + auth + index) + 22 reference files (one per resource group) loaded on demand |
| Embedding full flag descriptions for every command | The CLI already has `--help` output and `--agent` metadata; duplicating flag descriptions in skill files creates drift when the CLI changes | Reference the `--help` output pattern; use `--agent` for machine-readable metadata |
| OpenAI function calling JSON schemas alongside SKILL.md | OpenAI Codex uses the same SKILL.md format as Claude Code — there is no separate JSON schema format needed; Codex adopted the agentskills.io standard | Single SKILL.md works across all runtimes including OpenAI Codex |
| Runtime-specific skill variants | Maintaining one file per runtime (claude-skill.md, codex-skill.md) creates N maintenance surfaces; the whole point of agentskills.io is one source | One SKILL.md; use `compatibility` field for environment requirements |
| MCP server alongside skills | MCP is a different integration pattern (tool registration via JSON-RPC); building both for v1 is scope creep; skills are simpler to ship and immediately portable | Ship skills first; MCP is a separate subsequent milestone |
| Automated skill generation from swagger | Auto-generated skill content is verbose, repetitive, and context-wasteful; the Basecamp model proves hand-authored skills outperform generated ones for agent usability | Hand-author the skill files; use the existing `--agent` metadata flag for per-command detail |
| Versioned skill files per CLI version | v1 of the skills package should track the CLI; separate versioned files create combinatorial maintenance | Align skills package semver with CLI semver; update in place |

---

## Skill File Format: Runtime Compatibility

### The agentskills.io Standard (CONFIRMED HIGH CONFIDENCE)

The Agent Skills format is a genuine open standard with 35+ adopters as of April 2026. The base format is:

- A named directory (e.g. `twentythree/`)
- A `SKILL.md` file with YAML frontmatter (`name`, `description` required)
- Optional: `scripts/`, `references/`, `assets/` subdirectories

The `name` field must match the parent directory name. Both `name` and `description` are loaded into agent context at startup. The body of `SKILL.md` is only loaded when the skill is activated.

### Claude Code

- Skills live at `~/.claude/skills/<skill-name>/SKILL.md` (personal) or `.claude/skills/<skill-name>/SKILL.md` (project)
- Additional frontmatter: `disable-model-invocation`, `allowed-tools`, `context`, `when_to_use`, `paths`
- `allowed-tools: Bash(twentythree *)` pre-approves all `twentythree` CLI invocations without per-call permission prompts
- Supports `$ARGUMENTS` placeholder for slash-command invocation: `/twentythree list-videos`
- The `!`command`` syntax in skill body executes shell commands and injects output before the skill content reaches the agent — useful for injecting `twentythree workspace list` output at skill activation time

### OpenAI Codex

- Codex uses the same agentskills.io SKILL.md format as Claude Code (confirmed via developers.openai.com/codex/skills)
- Skills directory: `~/.codex/skills/` or `.codex/skills/` in project
- Optional `agents/openai.yaml` file in skill directory for OpenAI-specific metadata (not required)
- Codex activates skills via `/skillname` or automatically based on description matching
- The OpenAI function calling JSON schema format is NOT needed for Codex skills — Codex reads SKILL.md directly

### Other Runtimes (Cursor, GitHub Copilot, Gemini CLI, Roo Code, etc.)

All 35+ runtimes in the agentskills.io ecosystem read the same `SKILL.md` format. The single source file is sufficient. Runtime-specific behavior (like Claude Code's `allowed-tools`) is additive and ignored by runtimes that don't support that field.

Distribution note: The `npx skills add owner/repo` installation pattern used by Basecamp copies skill directories to the runtime-appropriate location. Publishing `twentythree-skills` as an npm package with skill directories at the root allows the same pattern.

---

## Auth Handling Pattern

### The Correct Pattern: Document, Don't Inject

Based on Basecamp's SKILL.md and Anthropic best practices, the correct approach for a CLI-backed skill is:

**Auth is pre-configured by the user before the skill is used.** The skill documents the setup steps; it does not attempt to inject credentials, bypass auth, or assume credentials are available.

The auth section in SKILL.md should contain:

```markdown
## Authentication

Run once before using any command:

```bash
twentythree auth credentials
```

You will be prompted for:
- **Domain**: your TwentyThree workspace domain (e.g. `mycompany.video.twentythree.com`)
- **Bearer token**: found at Settings → API in your TwentyThree workspace

Verify auth is working:
```bash
twentythree auth status
```

Credentials are stored in the OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service).
```

### What NOT to Do

- Do NOT embed or reference bearer tokens in skill files
- Do NOT attempt to call the TwentyThree API directly from the skill (MCP pattern); the skill wraps the CLI, which handles auth
- Do NOT assume credentials are present; always document the setup step
- Do NOT use environment variables for tokens in skill files (the CLI uses the OS keychain, not env vars)

---

## Granularity: One File Per Resource Group vs. One Giant File

### Recommendation: Main SKILL.md + 22 Reference Files

**Rationale:**

The agentskills.io spec and Anthropic best practices both recommend keeping `SKILL.md` under 500 lines. The Basecamp SKILL.md covers 155+ endpoints in one file; it works because their commands are fewer and simpler. For twentythree-skills with 219 commands across 22 resource groups, the correct architecture is:

```
twentythree/
├── SKILL.md                    # Auth setup, syntax overview, resource index, invariants (~200 lines)
├── references/
│   ├── video.md                # All video commands with flags and examples
│   ├── analytics.md            # Analytics commands
│   ├── webinar.md              # Webinar commands
│   ├── audience.md             # Audience commands
│   ├── category.md             # Category commands
│   ├── spot.md                 # Spot commands
│   ├── player.md               # Player commands
│   ├── thumbnail.md            # Thumbnail commands
│   ├── tag.md                  # Tag commands
│   ├── comment.md              # Comment commands
│   ├── presentation.md         # Presentation commands
│   ├── poll.md                 # Poll commands
│   ├── action.md               # Action commands
│   ├── app.md                  # App commands
│   ├── collector.md            # Collector commands
│   ├── protection.md           # Protection commands
│   ├── session.md              # Session commands
│   ├── setting.md              # Setting commands
│   ├── site.md                 # Site search commands
│   ├── openupload.md           # Open upload commands
│   ├── user.md                 # User management commands
│   └── webhook.md              # Webhook commands
└── workflows/
    ├── upload-and-publish.md   # Video upload → category → thumbnail → publish
    ├── webinar-lifecycle.md    # Create → schedule → go-live → archive
    ├── audience-export.md      # List → filter → analytics
    └── bulk-management.md      # Multi-video category/tag operations
```

This pattern matches Anthropic's "domain-specific organization" pattern (see BigQuery skill example in best practices docs) and ensures agents load only the context relevant to their current task.

**How agents navigate this:**

1. Agent activates twentythree skill (loads SKILL.md — ~200 lines)
2. User asks about video upload → agent reads `references/video.md` (load on demand)
3. User asks about analytics → agent reads `references/analytics.md` (load on demand)
4. Neither `webinar.md` nor `audience.md` consume context tokens in this session

**One-skill-per-resource-group alternative (rejected):**

Installing 22 separate skill files (`video`, `analytics`, `webinar`, etc.) would load 22 `name`+`description` pairs into context at startup. The description character budget is 1,536 chars per skill, and total budget is ~8,000 chars by default. 22 skills × ~80 chars each = ~1,760 chars consumed just by descriptions. More importantly, agents would need to know which sub-skill to activate before knowing what the user wants. The single `twentythree` skill with reference files is strictly better.

---

## Feature Dependency Map

```
twentythree auth credentials (CLI, already built)
  └── SKILL.md auth section documents this setup step
        └── references/*.md document post-auth resource commands
              └── workflows/*.md document multi-command patterns

twentythree <command> --agent (CLI, already built)
  └── SKILL.md documents this self-discovery pattern
        └── agents can introspect any command before calling it

twentythree-skills npm package
  └── SKILL.md + references/ + workflows/
        └── npx skills add twentythree/skills installs to runtime-appropriate location
              └── Works in: Claude Code, OpenAI Codex, Gemini CLI, Cursor, GitHub Copilot, 30+ others
```

---

## MVP Recommendation for v1 of twentythree-skills

**Build immediately (unblock agent usability):**

1. `twentythree/SKILL.md` — auth setup, syntax overview, 22-group resource index, key invariants, `--json` and `--agent` flag guidance
2. `twentythree/references/video.md` — the most-used resource group; proves the pattern
3. `twentythree/references/analytics.md` — high-value for agents (reporting workflows)
4. `twentythree/references/webinar.md` — complex enough to justify reference file
5. `twentythree/references/audience.md` — audience operations are common in agent workflows

**Defer but include in v1 complete:**

6. Remaining 18 reference files — fill out systematically; content is mechanical once pattern is established
7. 3-4 workflow files — upload-and-publish, webinar-lifecycle at minimum

**Defer post-v1:**

- Workflow skill files beyond core patterns
- `npx skills add` CLI tooling (install script)
- Auto-generation tooling for reference files from `--agent` output
- MCP server as an alternative integration

---

## Sources

- agentskills.io specification (format, frontmatter fields, directory structure): https://agentskills.io/specification
- agentskills.io overview (adoption, 35+ runtimes): https://agentskills.io/home
- Claude Code skills documentation (full frontmatter reference, lifecycle, allowed-tools, context:fork): https://code.claude.com/docs/en/skills
- Anthropic skill authoring best practices (conciseness, progressive disclosure, auth patterns): https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- OpenAI Codex skills (same SKILL.md format, skills directory): https://developers.openai.com/codex/skills
- Basecamp skills repository (production example of CLI-backed skill package): https://github.com/basecamp/skills
- Basecamp SKILL.md content (auth handling, command coverage, output modes): fetched directly from raw.githubusercontent.com/basecamp/skills/main/skills/basecamp/SKILL.md
- Mikhail Shilkov analysis of Claude Code skills internals: https://mikhail.io/2025/10/claude-code-skills/
- Calibre Labs analysis of CLI + skills pattern: https://blog.calibrelabs.ai/p/the-new-software-cli-skills-and-vertical
- twentythree-cli base-command.ts (AgentMetadata interface, --agent flag implementation): packages/twentythree-cli/src/lib/base-command.ts
