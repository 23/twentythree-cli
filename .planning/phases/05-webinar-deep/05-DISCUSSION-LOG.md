# Phase 5: Webinar Deep — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-15
**Phase:** 05-webinar-deep
**Areas discussed:** Action command output, Poll options UX, Mail preview output, Token lookup pattern

---

## Action Command Output

| Option | Description | Selected |
|--------|-------------|----------|
| Green success only | Just `chalk.green('Action done')` — no data row | ✓ |
| Return status fields | Parse and display any fields from API response | |
| Mirror delete pattern | Confirm first, then success | |

**User's choice:** Show "success" output only — green message, no table.
**Notes:** Applies to recording start/stop, mail send/test, speaker send-invitation/request-guest/cancel-guest-request, queued-video add/remove, attachment set-hidden.

---

## Poll Options UX

| Option | Description | Selected |
|--------|-------------|----------|
| Repeated `--option` flags | `--option "A" --option "B"` (Flags.string multiple: true) | ✓ |
| Comma-separated string | `--options "A,B,C"` | |
| JSON input | `--options '[{"text":"A"},{"text":"B"}]'` | |

**User's choice:** Repeated `--option` flags.
**Notes:** Also established general rule: all commands with required fields should fall back to interactive `@clack/prompts` if flags not provided.

---

## Mail Preview Output

| Option | Description | Selected |
|--------|-------------|----------|
| Raw HTML to stdout | Print HTML directly — user pipes to file/browser | ✓ |
| Save to temp file | Write to `/tmp/preview-<id>.html` and report path | |
| Skip rendering | Just confirm fetched, return `--json` data | |

**User's choice:** Raw HTML to stdout.
**Notes:** `twentythree webinar mail preview <id> > preview.html` is the expected usage.

---

## Token Lookup Pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-lookup only | Always call `fetchWebinarToken` silently | |
| Optional `--token` + auto-lookup | Accept `--token` flag, fall back to auto-lookup | ✓ |
| Require explicit token | User must always provide `--token` | |

**User's choice:** Optional `--token` flag with auto-lookup fallback via `fetchWebinarToken`.
**Notes:** Same pattern as video sections/subtitles established in Phase 3. All Phase 5 sub-resource commands that need a token param follow this.

---

## Claude's Discretion

None — all gray areas were explicitly decided by user.

## Deferred Ideas

None.
