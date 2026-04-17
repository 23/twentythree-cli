# Phase 16: Interactive Prompts - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

When a user runs a command but omits a required flag, the CLI prompts for the value interactively using `@clack/prompts` instead of dropping a raw oclif parse error. The command then completes as if the flag had been passed originally.

Scope is limited to required **Flags** only (not positional Args). One change in `BaseCommand` covers all 142 affected commands with no per-command edits.

</domain>

<decisions>
## Implementation Decisions

### Interception Approach
- **D-01:** Override `catch()` in `BaseCommand` to intercept oclif "Missing required flag" parse errors. Detect the flag name from the error message, prompt with `p.text()`, inject the value back into `process.argv`, and re-run the command via `this.config.runCommand(this.id, newArgv)`. Zero changes to individual command files.

### Scope
- **D-02:** Required **Flags only** — not positional Args. Missing positional args (e.g. `twentythree video get` with no ID) remain oclif errors; those are clear usage errors where prompting adds little value.

### Non-TTY / Agent Mode
- **D-03:** Check `process.stdin.isTTY` before prompting. If `false` (CI, piped input, `--json` mode, agent), re-throw the original oclif error unchanged. No prompt, no stdin hang.

### Prompt UX
- **D-04:** Use `p.intro('Missing required input')` + one `p.text()` per missing flag, using the flag's own `description` (or `summary`) as the prompt label. Follow with `p.outro('Running command...')` before re-executing. Matches existing `@clack/prompts` style from auth/workspace flows (D-03 from Phase 15).

### Claude's Discretion
- How to detect the flag name from oclif's error object (message parsing vs error metadata) — use whatever is most reliable in @oclif/core v4.
- Whether to handle multiple missing flags in a single catch() invocation (prompt each in sequence) or only handle one at a time (let the next parse error surface the next missing flag).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Integration Point
- `packages/twentythree-cli/src/lib/base-command.ts` — The single file to modify; `catch()` override goes here. Also note the existing `@clack/prompts` import and the double-parse pattern in `init()`.

### Example Command with Required Flags
- `packages/twentythree-cli/src/commands/webhook/subscribe.ts` — Representative command with two required Flags (`--target-url`, `--event`); good test case for the prompt flow.

### Prompt Style Reference
- `packages/twentythree-cli/src/commands/auth/credentials.ts` — Canonical `@clack/prompts` style: `p.intro` / `p.text` / `p.isCancel` guard / `p.outro`.

### Requirements
- `PROMPT-01`, `PROMPT-02` in `.planning/REQUIREMENTS.md`

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@clack/prompts` (`p.intro`, `p.text`, `p.isCancel`, `p.outro`): already imported in `base-command.ts` for workspace ambiguity resolution — same import can cover the new prompt flow.
- `BaseCommand.catch()`: not currently overridden — clean extension point.

### Established Patterns
- oclif error interception via `catch()`: standard oclif v4 pattern; `err` has `code` and `message` fields. Missing required flag errors have `code: 'EEXIT'` and message containing `"Missing required flag"`.
- Double-parse in `init()`: flag values are available on `this.flags` after `init()` completes — the re-run approach must pass the collected argv back through the normal parse path.
- Non-TTY guard: `process.stdin.isTTY` is the idiomatic Node.js check; already used elsewhere in the codebase for output formatting decisions.

### Integration Points
- `BaseCommand.catch()` override is the single integration point — covers `BaseCommand` and `AuthenticatedCommand` subclasses (all 142+ required-flag commands) automatically.

</code_context>

<specifics>
## Specific Ideas

- Prompt UX: `p.intro('Missing required input')` → `p.text({ message: flagDescription })` → `p.isCancel` guard → `p.outro('Running command...')` → re-execute.
- The preview chosen by user shows the exact desired flow: flag description as label, value entered, then "Running command..." outro.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 16-interactive-prompts*
*Context gathered: 2026-04-17*
