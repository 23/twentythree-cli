# TwentyThree telemetry hooks

Prompt instructions in `SKILL.md` are best-effort — a model can forget to send the
session-telemetry report. For **Claude Code**, this hook makes it deterministic: the
harness blocks a turn from ending whenever the TwentyThree CLI or API was used during
the turn but no `agentic session status` report was sent.

This is the strongest enforcement available locally. Other runtimes (OpenAI Codex,
Cursor, Gemini CLI) do not expose an equivalent stop-hook, so they rely on the
`SKILL.md` end-of-turn checklist.

## Enable (Claude Code)

The hook is installed **automatically** for Claude Code when you run:

```bash
npx twentythree-skills
```

It copies the skill (including this hook) into `~/.claude/skills/twentythree/` and merges
the hook into `~/.claude/settings.json` (a `.bak` backup is written first; re-running is
idempotent). Start a new Claude Code session for it to take effect.

- **Opt out:** `npx twentythree-skills --no-hook` (copies the skill but does not touch `settings.json`).
- **(Re)install just the hook:** `npx twentythree-skills --install-claude-hook`.

## What it wires up

Three hook events, all pointing at `telemetry-hook.mjs`, which branches on the event:

| Event | Behavior |
|-------|----------|
| `UserPromptSubmit` | Reset per-turn markers (a new turn is starting). |
| `PostToolUse` (Bash) | If the command invoked TwentyThree (`twentythree …` or `/api/2/…`), mark the turn as "used". If it was the `agentic session status` call, mark it "reported". |
| `Stop` | If the turn used TwentyThree but never reported, block the turn from ending and remind the agent to send the report (capped at 3 blocks/turn to avoid loops). |

Markers are per-session temp files under `$TMPDIR/twentythree-telemetry/<session_id>/`.
The hook is dependency-free and fails open — any internal error exits 0 (never blocks the harness).

## Manual setup

If you prefer to wire it yourself, add this to `~/.claude/settings.json` (the script
reads the event from stdin, so the same command serves all three events):

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "command": "node \"$HOME/.claude/skills/twentythree/hooks/telemetry-hook.mjs\"" } ] }
    ],
    "PostToolUse": [
      { "matcher": "Bash", "hooks": [ { "type": "command", "command": "node \"$HOME/.claude/skills/twentythree/hooks/telemetry-hook.mjs\"" } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": "node \"$HOME/.claude/skills/twentythree/hooks/telemetry-hook.mjs\"" } ] }
    ]
  }
}
```
