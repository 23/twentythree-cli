# Using TwentyThree with AI coding agents

The TwentyThree CLI ships with an installable **skills** package — Markdown definitions that teach an AI coding agent how to drive every TwentyThree command (upload videos, run webinars, query analytics, manage audiences, and more). Once installed, you can ask your assistant in plain language and it will run the right CLI commands for you.

This guide covers two install paths and a quick start for each supported runtime.

---

## Install from your AI assistant (recommended — no terminal)

If your agent can run shell commands (OpenCode, Claude Code, Antigravity CLI, Codex, Cline, Goose, Aider, Cursor, Windsurf, …), paste this prompt into its chat and it will do everything:

```text
Install the TwentyThree CLI and its AI skills on this machine, then verify:
1. Run: npm install -g twentythree-cli
2. Run: npx -y twentythree-skills
3. Ask me for my TwentyThree workspace domain and bearer token, then run:
   twentythree auth credentials --domain <domain> --token <token>
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

The installer copies the same Markdown skill tree into each detected runtime's directory; there is no per-runtime format conversion. OpenCode and Claude Code load it as a **native skill**; Antigravity, Codex, Cursor, Windsurf, Cline and Copilot read it as project/instruction context. **Goose** and **Aider** have no skill-directory convention, so the tree is dropped best-effort and must be referenced manually (see their quick starts below). **Antigravity CLI** is the renamed Gemini CLI (`agy`, Go rewrite); the old `gemini` CLI was retired in June 2026.

---

## Per-runtime quick start

### Claude Code

```bash
npm install -g twentythree-cli && npx twentythree-skills
```

Skills land in `~/.claude/skills/twentythree/`. Start Claude Code and ask: *"Use the twentythree skill to list my videos."* Claude reads `SKILL.md` and the reference files automatically.

**Deterministic session telemetry (default-on):** the skill asks the agent to report a session-status record whenever it uses TwentyThree and to show a one-line confirmation, but prompt rules are best-effort — so on Claude Code, `npx twentythree-skills` **also installs a harness hook by default**. The hook (wired into `~/.claude/settings.json`, idempotent and backed up) blocks a turn from ending if the TwentyThree CLI or API was used but no `agentic session status` report was sent. Opt out with `--no-hook`; (re)install with `--install-claude-hook`. Other runtimes have no equivalent stop-hook and rely on the prompt's end-of-turn checklist. See `~/.claude/skills/twentythree/hooks/README.md`.

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

### OpenCode

```bash
npm install -g twentythree-cli && npx twentythree-skills
```

Skills land in `~/.config/opencode/skills/twentythree/` — OpenCode's native global skills directory, so it's loaded automatically. Run `opencode` and ask it to manage your TwentyThree content.

### Antigravity CLI

```bash
npm install -g twentythree-cli && npx twentythree-skills
```

Antigravity CLI (`agy`) is the successor to Gemini CLI (the old `gemini` was retired in June 2026). Skills land in `~/.gemini/antigravity-cli/skills/twentythree/` (global) or `.agents/skills/twentythree/` (with `--project`). Run `agy` and ask it to drive TwentyThree.

### Goose

```bash
npm install -g twentythree-cli && npx twentythree-skills
```

Files land in `~/.config/goose/skills/twentythree/`. Goose has no skills directory, so reference the skill from a `.goosehints` file (e.g. add a line pointing Goose at `~/.config/goose/skills/twentythree/SKILL.md`), then ask Goose to run `twentythree` commands.

### Aider

```bash
npm install -g twentythree-cli && npx twentythree-skills
```

Files land in `~/.aider/skills/twentythree/`. Aider reads convention files explicitly — start it with `aider --read ~/.aider/skills/twentythree/SKILL.md` (or add a `read:` entry to `~/.aider.conf.yml`) so it picks up the TwentyThree guidance.

### Gemini CLI

```bash
npm install -g twentythree-cli && npx twentythree-skills --project
```

The standalone `gemini` CLI was retired in June 2026 and replaced by **Antigravity CLI** (above). If you still run a Gemini-based setup, install with `--project` so the skill lands in `.agents/skills/twentythree/` (the post-migration project location).

---

## Non-interactive authentication (for agents and CI)

`twentythree auth credentials` prompts interactively by default, which a non-TTY agent or CI job can't drive. Pass `--domain` to run it non-interactively instead:

```bash
# Token via env var (preferred — keeps it out of shell history and process listings)
TWENTYTHREE_TOKEN=<token> twentythree auth credentials --domain company.video23.com --json

# Or pass the token as a flag
twentythree auth credentials --domain company.video23.com --token <token>

# Pick a specific workspace when the token unlocks several
twentythree auth credentials --domain company.video23.com --token <token> --workspace "Marketing"

# Anonymous (domain-only) access — omit the token
twentythree auth credentials --domain company.video23.com
```

With `--json`, the command returns the configured `mode`, `active_workspace`, and the list of discovered `workspaces` for the agent to parse. If multiple workspaces are discovered and `--workspace` is omitted, the starred (then canonical, then first) workspace is set active.

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
