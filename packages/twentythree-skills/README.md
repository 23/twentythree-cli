# twentythree-skills

AI agent skills for the [TwentyThree CLI](https://github.com/23/twentythree-cli) — installable markdown skill definitions for OpenCode, Claude Code, Antigravity CLI, OpenAI Codex, Cline, Goose, Aider, Cursor, Windsurf, and GitHub Copilot.

## Install from your AI assistant (no terminal)

Paste this into Claude Code, Codex, Cursor, Windsurf, Cline, Gemini CLI, or any agent that can run shell commands, and it will install everything for you:

```text
Install the TwentyThree CLI and its AI skills on this machine, then verify:
1. Run: npm install -g twentythree-cli
2. Run: npx -y twentythree-skills
3. Ask me for my TwentyThree workspace domain and bearer token, then run:
   twentythree auth credentials --domain <domain> --token <token>
4. Verify with: twentythree doctor
If Node 22+ / npm isn't installed, stop and tell me how to install it first.
```

The assistant runs the install, detects its own runtime, and drops the skill files in the right place — then you can ask it to upload videos, run webinars, or query analytics in plain language.

## Install from the terminal

```bash
npx twentythree-skills
```

Detects your agent runtime and copies skill files into the right location automatically. Run again at any time to update — it's idempotent.

**Project-local install:**

```bash
npx twentythree-skills --project
```

Installs into `.claude/skills/`, `.agents/skills/`, `.github/skills/`, or `.cursor/skills/` relative to the current directory.

## What's included

- `skills/SKILL.md` — root skill file: auth setup, command syntax, resource index, `--agent` flag docs
- `skills/reference/*.md` — 22 reference files, one per TwentyThree CLI resource group (video, webinar, analytics, …)
- `skills/workflows/*.md` — workflow files for high-value automation patterns (video upload, webinar lifecycle)
- `skills/hooks/` — an optional Claude Code hook that enforces session telemetry deterministically (see below)

## Session telemetry hook (Claude Code)

The skill asks the agent to report a session-status record whenever it uses the TwentyThree CLI or API, and to show a one-line confirmation. Because prompt rules are best-effort, **Claude Code installs a harness hook by default** — running `npx twentythree-skills` wires a hook into `~/.claude/settings.json` (idempotent, backed up first) that blocks a turn from ending if TwentyThree was used but no report was sent:

```bash
npx twentythree-skills              # installs the skill + telemetry hook (Claude Code)
npx twentythree-skills --no-hook    # skip the hook (copy skill files only)
npx twentythree-skills --install-claude-hook   # (re)install just the hook
```

Other runtimes have no equivalent stop-hook and rely on the prompt checklist in `SKILL.md`.

## Supported runtimes

| Runtime | Detection | Global install path | Project install path (`--project`) |
|---------|-----------|---------------------|------------------------------------|
| OpenCode | `~/.config/opencode/` | `~/.config/opencode/skills/twentythree/` | `.opencode/skills/twentythree/` |
| Claude Code | `~/.claude/` | `~/.claude/skills/twentythree/` | `.claude/skills/twentythree/` |
| Antigravity CLI | `~/.gemini/` | `~/.gemini/antigravity-cli/skills/twentythree/` | `.agents/skills/twentythree/` |
| OpenAI Codex | `~/.codex/` | `~/.codex/skills/twentythree/` | `.agents/skills/twentythree/` |
| Cline | `~/.clinerules/` | `~/.clinerules/twentythree/` | `.clinerules/twentythree/` |
| Goose | `~/.config/goose/` | `~/.config/goose/skills/twentythree/` | `.goose/skills/twentythree/` |
| Aider | `~/.aider.conf.yml` | `~/.aider/skills/twentythree/` | `.aider/skills/twentythree/` |
| Cursor | `~/.cursor/` | `~/.cursor/skills/twentythree/` | `.cursor/skills/twentythree/` |
| Windsurf | `~/.codeium/` | `~/.codeium/windsurf/skills/twentythree/` | `.windsurf/skills/twentythree/` |
| GitHub Copilot | `~/.github/copilot/` | `~/.github/skills/twentythree/` | `.github/skills/twentythree/` |

The installer copies the same Markdown skill tree into every detected runtime's directory — each agent ingests it as project/skill context. OpenCode and Claude Code load it as a native skill; the others read it as project/instruction context. **Goose and Aider** have no skill-directory convention, so the files are dropped best-effort — point the tool at them (Aider: `--read ~/.aider/skills/twentythree/SKILL.md`; Goose: reference the path from a `.goosehints` file). **Antigravity CLI** is the renamed Gemini CLI (`agy`); Gemini CLI is retired as of June 2026. See the [AI agents guide](https://github.com/23/twentythree-cli/blob/master/packages/twentythree-cli/docs/guides/ai-agents.md) for per-runtime quick starts.

## Prerequisites

The skills document the [twentythree-cli](https://www.npmjs.com/package/twentythree-cli). Install and authenticate it first:

```bash
npm install -g twentythree-cli
twentythree auth credentials
```

## License

MIT
