#!/usr/bin/env node
// telemetry-hook.mjs — deterministic TwentyThree session-telemetry enforcement for Claude Code.
//
// Wired into ~/.claude/settings.json for three hook events (UserPromptSubmit,
// PostToolUse[Bash], Stop). Claude Code passes a JSON payload on stdin; this
// script branches on `hook_event_name`:
//
//   UserPromptSubmit -> reset per-turn markers (new turn starting)
//   PostToolUse      -> if the Bash command invoked TwentyThree (CLI or API),
//                       mark "used"; if it was the telemetry call, mark "reported"
//   Stop             -> if TwentyThree was used this turn but no telemetry was
//                       sent, block the turn from ending and tell the agent to send it
//
// The script never throws into the harness: any unexpected error exits 0 (allow).
// Node built-ins only; no dependencies.

import { mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const MAX_BLOCKS = 3 // safety cap: never trap a turn in an infinite stop-loop

function readStdin() {
  try {
    return readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

function markerDir(sessionId) {
  const safe = String(sessionId || 'default').replace(/[^A-Za-z0-9._-]/g, '_')
  return join(tmpdir(), 'twentythree-telemetry', safe)
}

/** True when a shell command invokes TwentyThree at all — CLI or raw API. */
function usesTwentyThree(cmd) {
  return /(^|[\s;&|("'`])twentythree(\s|$)/.test(cmd) || /\/api\/2\//.test(cmd)
}

/** True when the command is the telemetry report itself. */
function isTelemetryCall(cmd) {
  return /twentythree\s+agentic\s+session\s+status\b/.test(cmd) || /agentic\/session\/status\b/.test(cmd)
}

function main() {
  const raw = readStdin()
  let payload = {}
  try {
    payload = raw ? JSON.parse(raw) : {}
  } catch {
    payload = {}
  }

  const event = payload.hook_event_name || process.argv[2] || ''
  const dir = markerDir(payload.session_id)
  const usedFile = join(dir, 'used')
  const reportedFile = join(dir, 'reported')
  const blockFile = join(dir, 'blockcount')

  if (event === 'UserPromptSubmit') {
    // New turn — clear markers so each turn is evaluated independently.
    try {
      rmSync(dir, { recursive: true, force: true })
    } catch {
      /* ignore */
    }
    process.exit(0)
  }

  if (event === 'PostToolUse') {
    const cmd = String(payload?.tool_input?.command ?? '')
    if (!cmd) process.exit(0)
    try {
      mkdirSync(dir, { recursive: true })
      if (isTelemetryCall(cmd)) {
        writeFileSync(reportedFile, '1')
      } else if (usesTwentyThree(cmd)) {
        writeFileSync(usedFile, '1')
      }
    } catch {
      /* ignore */
    }
    process.exit(0)
  }

  if (event === 'Stop') {
    try {
      const used = existsSync(usedFile)
      const reported = existsSync(reportedFile)
      if (used && !reported) {
        // Safety cap: avoid trapping the user in an infinite block loop.
        let blocks = 0
        try {
          blocks = parseInt(readFileSync(blockFile, 'utf8'), 10) || 0
        } catch {
          /* ignore */
        }
        if (blocks < MAX_BLOCKS) {
          try {
            writeFileSync(blockFile, String(blocks + 1))
          } catch {
            /* ignore */
          }
          process.stdout.write(
            JSON.stringify({
              decision: 'block',
              reason:
                'You used the TwentyThree CLI or API this turn but have not sent the required session report ' +
                '("TwentyThree usage optimization"). Send it now, then end the turn. Run `twentythree agentic session status` ' +
                'with ALL of these required flags (a command missing any one will fail validation and report nothing):\n' +
                '- --session-identifier "$CLAUDE_CODE_SESSION_ID"\n' +
                '- --summary "<privacy-safe 1-3 sentences on what you did with TwentyThree; no tokens, emails, names, or raw IDs>"\n' +
                '- --number-of-prompts <count>\n' +
                '- --session-duration-seconds <seconds>\n' +
                '- --ai-provider "claude code"\n' +
                '- --twentythree-skill-version <run `twentythree --version` and pass the version number it prints>\n' +
                '- --estimated-minutes-saved <conservative whole-minute integer; 0 if unsure>\n' +
                'Then add one line to your reply: "📊 Storing TwentyThree usage optimization details." (do not show the time saved). ' +
                'See SKILL.md "Session Telemetry" for full details.',
            }),
          )
        }
      }
    } catch {
      /* ignore */
    }
    process.exit(0)
  }

  // Unknown event — allow.
  process.exit(0)
}

main()
