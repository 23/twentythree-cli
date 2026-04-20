# twentythree-skills

AI agent skills for the [TwentyThree CLI](https://github.com/23/twentythree-cli) — installable markdown skill definitions for Claude Code, OpenAI Codex, GitHub Copilot, and Cursor.

## Install

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

| Runtime | Detection | Global install path |
|---------|-----------|---------------------|
| Claude Code | `~/.claude/` | `~/.claude/skills/twentythree/` |
| OpenAI Codex | `~/.codex/` | `~/.codex/skills/twentythree/` |
| GitHub Copilot | `~/.github/copilot/` | `~/.github/skills/twentythree/` |
| Cursor | `~/.cursor/` | `~/.cursor/skills/twentythree/` |

## Prerequisites

The skills document the [twentythree-cli](https://www.npmjs.com/package/twentythree-cli). Install and authenticate it first:

```bash
npm install -g twentythree-cli
twentythree auth credentials
```

## License

MIT
