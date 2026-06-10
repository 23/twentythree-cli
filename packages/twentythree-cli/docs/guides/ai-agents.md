# Using TwentyThree with AI coding agents

The TwentyThree CLI ships with an installable **skills** package — Markdown definitions that teach an AI coding agent how to drive every TwentyThree command (upload videos, run webinars, query analytics, manage audiences, and more). Once installed, you can ask your assistant in plain language and it will run the right CLI commands for you.

This guide covers two install paths and a quick start for each supported runtime.

---

## Install from your AI assistant (recommended — no terminal)

If your agent can run shell commands (Claude Code, Codex, Cursor, Windsurf, Cline, Gemini CLI, …), paste this prompt into its chat and it will do everything:

```text
Install the TwentyThree CLI and its AI skills on this machine, then verify:
1. Run: npm install -g twentythree-cli
2. Run: npx -y twentythree-skills
3. Run: twentythree auth credentials  (pause so I can enter my workspace domain + token)
4. Verify with: twentythree doctor
If Node 22+ / npm isn't installed, stop and tell me how to install it first.
```

The assistant installs the CLI, runs the skills installer (which auto-detects the runtime it's running in), and prompts you for credentials. After that you can say things like:

- *"Upload ./keynote.mp4 to TwentyThree and publish it."*
- *"List my last 10 webinars as JSON."*
- *"What's the SEO status of video 127764838?"*

## Install from the terminal

```bash
npm install -g twentythree-cli   # the CLI
npx twentythree-skills           # the agent skills (auto-detects your runtime)
twentythree auth credentials     # authenticate
twentythree doctor               # verify
```

Add `--project` to the skills installer to install into the current repo instead of your home directory:

```bash
npx twentythree-skills --project
```

---

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

The installer copies the same Markdown skill tree into each detected runtime's directory. Every agent ingests it as context — there is no per-runtime format conversion.

---

## Per-runtime quick start

### Claude Code

```bash
npm install -g twentythree-cli && npx twentythree-skills
```

Skills land in `~/.claude/skills/twentythree/`. Start Claude Code and ask: *"Use the twentythree skill to list my videos."* Claude reads `SKILL.md` and the reference files automatically.

### OpenAI Codex

```bash
npm install -g twentythree-cli && npx twentythree-skills
```

Skills land in `~/.codex/skills/twentythree/` (global) or `.agents/skills/twentythree/` (with `--project`). In a Codex session, reference the skill and ask it to run a command, e.g. *"Upload ./demo.mp4 with twentythree and give me the admin URL."*

### GitHub Copilot

```bash
npm install -g twentythree-cli && npx twentythree-skills
```

Skills land in `~/.github/skills/twentythree/`. Open Copilot Chat in your editor and ask it to run TwentyThree commands in the integrated terminal.

### Cursor

```bash
npm install -g twentythree-cli && npx twentythree-skills --project
```

Project install lands in `.cursor/skills/twentythree/` so the skill travels with the repo. Ask Cursor's agent: *"List webinars from the last week as a table."*

### Windsurf

```bash
npm install -g twentythree-cli && npx twentythree-skills
```

Skills land in `~/.codeium/windsurf/skills/twentythree/` (global) or `.windsurf/skills/twentythree/` (with `--project`). In Cascade, ask it to run `twentythree` commands for you.

### Cline

```bash
npm install -g twentythree-cli && npx twentythree-skills --project
```

Project install lands in `.clinerules/twentythree/`, which Cline loads as workspace rules. Ask Cline to upload a video or pull analytics and approve the terminal commands it proposes.

### Gemini CLI

```bash
npm install -g twentythree-cli && npx twentythree-skills
```

Skills land in `~/.gemini/skills/twentythree/`. Run `gemini` and ask it to manage your TwentyThree content; it will invoke the CLI on your behalf.

---

## How the agent calls the CLI

Every command supports two machine-friendly flags the skills rely on:

- `--json` — structured output for the agent to parse.
- `--agent` — self-describing metadata (`api_endpoint`, `auth_scope`, `output_shape`, `side_effects`) so the agent knows what a command does before running it.

Example:

```bash
twentythree video list --json
twentythree webinar create --agent   # describe the command without running it
```

## Updating

Re-run the installer at any time — it's idempotent and overwrites the skill files in place:

```bash
npx twentythree-skills
```

## Prerequisites

- Node.js 22 or newer.
- A TwentyThree workspace with a bearer token. Run `twentythree auth credentials` to set it up, then `twentythree doctor` to confirm connectivity.

See the [Getting Started guide](getting-started.md) for full CLI setup.
