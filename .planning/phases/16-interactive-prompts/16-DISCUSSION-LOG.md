# Phase 16: Interactive Prompts - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 16-interactive-prompts
**Areas discussed:** Interception approach, Args vs Flags scope, Non-TTY / agent mode, Prompt UX details

---

## Interception Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Override catch() in BaseCommand | Intercept oclif parse errors post-throw; detect flag name; prompt; re-run | ✓ |
| Re-parse in init() before oclif throws | Inspect flag definitions + raw argv ourselves before parse; inject into argv | |

**User's choice:** Override catch() in BaseCommand
**Notes:** Recommended approach chosen — zero changes to individual command files.

---

## Args vs Flags Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Flags only | Required Flags only; positional arg errors stay as oclif errors | ✓ |
| Args and Flags both | Prompt for both missing positional args and required flags | |

**User's choice:** Flags only
**Notes:** 142 commands have required: true — mix of Args and Flags. Prompting for Args adds complexity with less value.

---

## Non-TTY / Agent Mode

| Option | Description | Selected |
|--------|-------------|----------|
| Fall through to original oclif error | Check process.stdin.isTTY; re-throw if not TTY | ✓ |
| Always prompt, fail if no input | Attempt prompt regardless; hangs in CI/agent | |

**User's choice:** Fall through to original oclif error
**Notes:** Essential for agent/CI use cases. process.stdin.isTTY check is the standard guard.

---

## Prompt UX Details

| Option | Description | Selected |
|--------|-------------|----------|
| p.text() with flag description as label | intro → text(flagDescription) → outro → re-run | ✓ |
| Generic prompt with flag name only | --flag-name: as label, no description | |

**User's choice:** Single p.text() per missing flag, show flag description
**Notes:** Consistent with existing @clack/prompts style from auth/workspace flows.

---

## Claude's Discretion

- How to extract flag name from oclif error (message parsing vs error metadata)
- Whether to handle multiple missing flags sequentially in one catch() or one at a time

## Deferred Ideas

None.
