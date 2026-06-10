# twentythree-skills

AI agent skills for the [TwentyThree CLI](https://github.com/23/twentythree-cli) — installable markdown skill definitions for Claude Code, OpenAI Codex, GitHub Copilot, Cursor, Windsurf, Cline, and Gemini CLI.

## Install from your AI assistant (no terminal)

Paste this into Claude Code, Codex, Cursor, Windsurf, Cline, Gemini CLI, or any agent that can run shell commands, and it will install everything for you:

```text
Install the TwentyThree CLI and its AI skills on this machine, then verify:
1. Run: npm install -g twentythree-cli
2. Run: npx -y twentythree-skills
3. Run: twentythree auth credentials  (pause so I can enter my workspace domain + token)
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

## Supported runtimes

| Runtime | Detection | Global install path | Project install path (`--project`) |
|---------|-----------|---------------------|------------------------------------|
| Claude Code | `~/.claude/` | `~/.claude/skills/twentythree/` | `.claude/skills/twentythree/` |
| OpenAI Codex | `~/.codex/` | `~/.codex/skills/twentythree/` | `.agents/skills/twentythree/` |
| GitHub Copilot | `~/.github/copilot/` | `~/.github/skills/twentythree/` | `.github/skills/twentythree/` |
| Cursor | `~/.cursor/` | `~/.cursor/skills/twentythree/` | `.cursor/skills/twentythree/` |
| Windsurf | `~/.codeium/` | `~/.codeium/windsurf/skills/twentythree/` | `.windsurf/skills/twentythree/` |
| Cline | `~/.clinerules/` | `~/.clinerules/twentythree/` | `.clinerules/twentythree/` |
| Gemini CLI | `~/.gemini/` | `~/.gemini/skills/twentythree/` | `.gemini/skills/twentythree/` |

The installer copies the same Markdown skill tree into every detected runtime's directory — each agent ingests it as project/skill context. See the [AI agents guide](https://github.com/23/twentythree-cli/blob/master/packages/twentythree-cli/docs/guides/ai-agents.md) for per-runtime quick starts.

## Prerequisites

The skills document the [twentythree-cli](https://www.npmjs.com/package/twentythree-cli). Install and authenticate it first:

```bash
npm install -g twentythree-cli
twentythree auth credentials
```

## License

MIT
