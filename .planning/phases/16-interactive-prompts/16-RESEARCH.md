# Phase 16: Interactive Prompts - Research

**Researched:** 2026-04-17
**Domain:** oclif v4 error interception + @clack/prompts UX integration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Override `catch()` in `BaseCommand` to intercept oclif "Missing required flag" parse errors. Detect the flag name from the error message, prompt with `p.text()`, inject the value back into `process.argv`, and re-run the command via `this.config.runCommand(this.id, newArgv)`. Zero changes to individual command files.
- **D-02:** Required **Flags only** — not positional Args. Missing positional args remain oclif errors.
- **D-03:** Check `process.stdin.isTTY` before prompting. If `false` (CI, piped input, `--json` mode, agent), re-throw the original oclif error unchanged.
- **D-04:** Use `p.intro('Missing required input')` + one `p.text()` per missing flag (using the flag's own `description` or `summary`), followed by `p.outro('Running command...')` before re-executing.

### Claude's Discretion

- How to detect the flag name from oclif's error object (message parsing vs error metadata) — use whatever is most reliable in @oclif/core v4.
- Whether to handle multiple missing flags in a single `catch()` invocation (prompt each in sequence) or only handle one at a time.

### Deferred Ideas (OUT OF SCOPE)

None.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROMPT-01 | When a required flag is omitted, the CLI prompts for the value interactively instead of showing an oclif error | D-01/D-03: `catch()` override; oclif `FailedFlagValidationError` is the exact class to intercept |
| PROMPT-02 | Interactive prompts use `@clack/prompts` for consistent UX with existing auth and workspace setup flows | D-04: `p.intro`/`p.text`/`p.isCancel`/`p.outro` pattern already used in `base-command.ts` and `credentials.ts` |
</phase_requirements>

---

## Summary

Phase 16 is a single-file change to `packages/twentythree-cli/src/lib/base-command.ts`. The goal is to intercept oclif's parse error for missing required flags and replace it with a `@clack/prompts` interactive text prompt, then re-execute the command with the collected value injected into `process.argv`.

The oclif v4 `Command.catch()` override is the correct, idiomatic extension point. When a required flag is absent, oclif throws a `FailedFlagValidationError` (a subclass of `CLIParseError`) with a message matching the pattern `Missing required flag {name}`. This error carries a `parse` property containing `parse.input.flags` — the full flag definitions including `description` and `summary` fields — which enables using the flag's own label as the prompt message without any hardcoded strings.

All 142+ commands that extend `BaseCommand` or `AuthenticatedCommand` automatically inherit the behaviour with zero per-command changes. The non-TTY guard (`process.stdin.isTTY`) ensures CI pipelines and agent mode remain error-clean. The re-execution approach (`this.config.runCommand(this.id, newArgv)`) is the established oclif v4 pattern already used in Phase 15.

**Primary recommendation:** Override `catch()` in `BaseCommand`, detect `FailedFlagValidationError` by constructor name (most reliable in v4 — class is not exported from the public API), extract flag names via regex on `err.message`, look up descriptions via `err.parse?.input?.flags`, prompt sequentially for all missing flags in one `catch()` pass, then re-invoke via `this.config.runCommand`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Missing-flag interception | CLI (BaseCommand) | — | Parse errors originate in oclif's flag parser before any API call; must be caught at the command layer |
| Interactive prompt UX | CLI (BaseCommand) | — | TTY interaction belongs in the terminal layer; @clack/prompts writes directly to stdout |
| Non-TTY guard | CLI (BaseCommand) | — | `process.stdin.isTTY` is a Node.js runtime check; belongs in the same method as the prompt |
| Command re-execution | CLI (Config) | — | `this.config.runCommand` is oclif's public re-dispatch API; no direct command class instantiation needed |

---

## Standard Stack

### Core (already installed — no new dependencies)

| Library | Version in package.json | Purpose | Why Standard |
|---------|------------------------|---------|--------------|
| `@oclif/core` | ^4.10.5 | Provides `Command.catch()` override and `this.config.runCommand()` | Core framework; catch() is the documented error extension point |
| `@clack/prompts` | ^1.2.0 | `p.intro`, `p.text`, `p.isCancel`, `p.outro` for the prompt UX | Already used in `base-command.ts` (workspace selection) and `credentials.ts` (auth setup); D-04 requires consistency with these flows |

**No new packages required.** [VERIFIED: packages/twentythree-cli/package.json]

---

## Architecture Patterns

### System Architecture Diagram

```
User runs command with missing required flag
         │
         ▼
oclif parser (this.parse())
  throws FailedFlagValidationError
         │
         ▼
BaseCommand.catch(err)
  ┌──────────────────────────────────────────┐
  │ is FailedFlagValidationError?             │
  │ AND process.stdin.isTTY?                  │
  └──────────┬───────────────────────────────┘
             │ yes                     │ no
             ▼                         ▼
  p.intro('Missing required input')  re-throw err
  for each missing flag:             (original oclif error)
    p.text({ message: flagDesc })
    p.isCancel guard
  p.outro('Running command...')
             │
             ▼
  inject collected values into newArgv
  this.config.runCommand(this.id, newArgv)
             │
             ▼
  Command completes as if flags were passed
```

### Recommended Project Structure

No new directories. Change confined to:

```
packages/twentythree-cli/
└── src/
    └── lib/
        ├── base-command.ts      ← add catch() override here (ONLY file changed)
        └── __tests__/
            └── base-command.test.ts  ← add tests for catch() behaviour
```

### Pattern 1: oclif v4 `catch()` Override

**What:** The `Command` base class exposes `async catch(err: Error)` as the standard error-handling hook. Override in `BaseCommand` to intercept parse errors before oclif prints them.

**When to use:** Any cross-cutting error recovery that must apply to all commands without per-command edits.

**How oclif calls it:** In `command.js`, `_run()` wraps `run()` in try/catch and calls `await this.catch(error)`. Overriding `catch()` in `BaseCommand` intercepts before the default oclif handler (which just re-throws non-JSON errors). [VERIFIED: oclif/core@4.10.5 lib/command.js]

**Example:**
```typescript
// Source: verified from @oclif/core@4.10.5 lib/command.js + lib/parser/errors.js
public async catch(err: Error & { parse?: { input?: { flags?: Record<string, { description?: string; summary?: string }> } } }): Promise<void> {
  // Non-TTY guard (D-03): CI, pipes, agent mode, --json
  if (!process.stdin.isTTY) {
    return super.catch(err)
  }

  // Detect missing required flags by constructor name — FailedFlagValidationError
  // is not exported from @oclif/core public API so instanceof is unreliable across
  // module instances; constructor.name is stable. [VERIFIED: lib/parser/errors.js]
  if (err.constructor.name !== 'FailedFlagValidationError') {
    return super.catch(err)
  }

  // Extract flag names from error message
  // Message format: "The following error(s) occurred:\n  Missing required flag {name}\nSee more help with --help"
  // [VERIFIED: FailedFlagValidationError constructor in lib/parser/errors.js]
  const flagNames = [...err.message.matchAll(/Missing required flag ([^\n]+)/g)].map(m => m[1])
  if (flagNames.length === 0) {
    return super.catch(err)
  }

  // Look up flag descriptions from the parse object (available on FailedFlagValidationError)
  const inputFlags = (err as any).parse?.input?.flags ?? {}

  p.intro('Missing required input')
  const extraArgv: string[] = []
  for (const flagName of flagNames) {
    const flagDef = inputFlags[flagName]
    const label = flagDef?.description ?? flagDef?.summary ?? flagName
    const value = await p.text({ message: label })
    if (p.isCancel(value)) {
      p.cancel('Cancelled')
      process.exit(0)
    }
    extraArgv.push(`--${flagName}`, value as string)
  }
  p.outro('Running command...')

  // Re-invoke the command with the injected flag values
  const newArgv = [...(this.argv ?? []), ...extraArgv]
  await this.config.runCommand(this.id!, newArgv)
}
```

### Pattern 2: Existing `@clack/prompts` Style Reference

The existing `credentials.ts` canonical flow:
```typescript
// Source: packages/twentythree-cli/src/commands/auth/credentials.ts
p.intro('TwentyThree credentials')
const domain = await p.text({ message: 'Domain (e.g. company.video23.com)' })
if (p.isCancel(domain)) { p.cancel('Cancelled'); return }
// ...
p.outro('Credentials saved')
```

Phase 16 follows this exact structure — `p.intro` → `p.text` → `p.isCancel` guard → `p.outro`. [VERIFIED: credentials.ts codebase]

### Anti-Patterns to Avoid

- **Regex on message only without checking constructor.name:** The message pattern `"Missing required flag"` is specific enough today, but checking constructor name first is a more defensive guard.
- **instanceof check for FailedFlagValidationError:** The class is not exported from `@oclif/core`'s public API (only `Errors.CLIError` and `Errors.ExitError` are). Attempting to import from internal subpaths fails due to package `exports` restrictions. Use `err.constructor.name === 'FailedFlagValidationError'`. [VERIFIED: @oclif/core package.json exports field]
- **`process.stdout.isTTY` instead of `process.stdin.isTTY`:** For prompting, `stdin.isTTY` is the correct check — it determines whether the user can type interactively. `stdout.isTTY` only determines whether output is a terminal, not whether input is. D-03 specifies `process.stdin.isTTY`.
- **Only handling one flag per `catch()` invocation:** Each `catch()` call receives a single `FailedFlagValidationError` that already contains ALL missing flags. The regex `matchAll` returns all of them. Handling all in one pass avoids triggering multiple catch/re-run cycles for commands like `webhook subscribe` which has two required flags.
- **Building newArgv from scratch:** Use `[...this.argv, ...extraArgv]` — `this.argv` preserves any flags the user DID provide (e.g., `--workspace`, `--json`). [VERIFIED: oclif Command instance has `.argv` property]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TTY detection | Custom env-var or file-descriptor check | `process.stdin.isTTY` | Node.js built-in; handles all non-TTY cases (CI, pipes, redirects) |
| Prompt UX | Custom readline or chalk-based input | `@clack/prompts p.text()` | Already in stack; consistent with auth/workspace flows (D-04) |
| Command re-dispatch | Direct class instantiation or `Command.run()` | `this.config.runCommand(this.id, newArgv)` | Config-level dispatch handles plugin loading and config propagation; same pattern used in Phase 15 autocomplete |

**Key insight:** The `FailedFlagValidationError.parse.input.flags` property already contains all flag metadata (descriptions, types, required status) — there is no need to duplicate flag definitions in `BaseCommand` or maintain a separate registry.

---

## Common Pitfalls

### Pitfall 1: Double-prompt on second parse in `init()`

**What goes wrong:** `BaseCommand.init()` calls `this.parse()` to resolve `--workspace` early (documented double-parse pattern, line 91 of `base-command.ts`). If the `catch()` override is reached from `init()`'s parse call, re-running via `runCommand` will trigger `init()` again — which will parse again — with the now-complete argv. This is the intended behaviour.

**Why it happens:** The re-run path must go through the full command lifecycle. `runCommand` starts a fresh command instance.

**How to avoid:** Ensure `newArgv` includes ALL flags (both those already provided and the newly collected ones). `[...this.argv, ...extraArgv]` achieves this because `this.argv` is set from the original invocation args before `init()` runs.

**Warning signs:** If prompting happens twice for the same flag, `extraArgv` is being duplicated. Confirm `this.argv` does not already contain the flag.

### Pitfall 2: `catch()` called during `init()` parse — re-run starts fresh

**What goes wrong:** The `catch()` in `Command._run()` wraps the entire `run()` lifecycle including `init()`. If the first `this.parse()` in `init()` throws `FailedFlagValidationError`, control flows to `catch()` before `this.flags` is populated. This is fine — `catch()` does not need `this.flags` for the prompt flow.

**How to avoid:** No workaround needed. The `parse` property on the error contains all needed flag metadata independently of `this.flags`.

### Pitfall 3: `p.isCancel` returns a Symbol, not `null`/`undefined`

**What goes wrong:** `@clack/prompts` returns `Symbol('clack:cancel')` when the user presses Ctrl+C, not `null` or `false`. Checking `if (!value)` will not catch cancellation for non-empty inputs.

**How to avoid:** Always use `p.isCancel(value)` as shown in the canonical credentials.ts pattern. [VERIFIED: credentials.ts codebase]

### Pitfall 4: `--json` flag not checked separately from `isTTY`

**What goes wrong:** If a script passes `--json` flag but runs in a TTY (e.g., a developer testing JSON output interactively), the prompt would still fire.

**How to avoid:** The CONTEXT.md D-03 decision uses `process.stdin.isTTY` as the single guard. In practice, `--json` in agent/script mode typically runs without a TTY anyway. If the planner wants belt-and-suspenders, adding `|| this.jsonEnabled()` to the non-TTY check is straightforward.

### Pitfall 5: `FailedFlagValidationError` message format could change across oclif minor versions

**What goes wrong:** The regex `Missing required flag ([^\n]+)` relies on the exact message string from `lib/parser/validate.js`.

**How to avoid:** The string has been stable across oclif v4. As a defence, the code should also handle the case where no flag names are extracted (fall through to `super.catch(err)`). The `err.parse?.input?.flags` approach as a secondary extraction mechanism provides an additional fallback. [VERIFIED: oclif/core@4.10.5 lib/parser/validate.js — exact string: `'Missing required flag ${name}'`]

---

## Code Examples

### Exact Error Message Formats (verified in-process)

```
Single missing flag:
"The following error occurred:\n  Missing required flag target-url\nSee more help with --help"

Multiple missing flags:
"The following errors occurred:\n  Missing required flag event\n  Missing required flag target-url\nSee more help with --help"
```
[VERIFIED: oclif/core@4.10.5 FailedFlagValidationError constructor — constructed and logged in Node.js REPL]

### Flag Description Lookup via `err.parse`

```typescript
// err.parse.input.flags is the full map of flag definitions
// including description and summary fields
const inputFlags = (err as any).parse?.input?.flags ?? {}
const flagDef = inputFlags['target-url']
// flagDef.description === 'URL to receive webhook POST requests'
// flagDef.summary === undefined (if only description is set)
const label = flagDef?.description ?? flagDef?.summary ?? flagName
```
[VERIFIED: in-process Node.js test with real FailedFlagValidationError instance]

### `this.config.runCommand` Signature

```typescript
// Signature from @oclif/core@4.10.5 lib/config/config.js:
async runCommand(id: string, argv?: string[], cachedCommand?: Command.Loadable | null): Promise<unknown>

// Usage in catch():
await this.config.runCommand(this.id!, newArgv)
// this.id is the command id (e.g. 'webhook subscribe')
// newArgv is [...this.argv, '--target-url', 'https://...', '--event', 'video.uploaded']
```
[VERIFIED: oclif/core@4.10.5 lib/config/config.js]

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest ^4.1.4 |
| Config file | `packages/twentythree-cli/vitest.config.ts` |
| Quick run command | `pnpm --filter twentythree-cli test --run` |
| Full suite command | `pnpm --filter twentythree-cli test --run` |

Current state: 17 test files pass, 158 tests pass, 69 todo. [VERIFIED: vitest run output]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROMPT-01 | `catch()` fires when required flag missing + TTY | unit | `pnpm --filter twentythree-cli test --run src/lib/__tests__/base-command.test.ts` | Extend existing |
| PROMPT-01 | Re-throws when `process.stdin.isTTY` is false | unit | same | Extend existing |
| PROMPT-01 | Re-throws for non-`FailedFlagValidationError` errors | unit | same | Extend existing |
| PROMPT-01 | Collects all missing flags in one pass (multi-flag case) | unit | same | Extend existing |
| PROMPT-02 | `p.intro` / `p.text` / `p.isCancel` / `p.outro` called in correct order | unit | same | Extend existing |
| PROMPT-01 | Cancel (Ctrl+C) results in `process.exit(0)`, no re-run | unit | same | Extend existing |

### Sampling Rate

- **Per task commit:** `pnpm --filter twentythree-cli test --run src/lib/__tests__/base-command.test.ts`
- **Per wave merge:** `pnpm --filter twentythree-cli test --run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

None — `src/lib/__tests__/base-command.test.ts` already exists with the `makeBaseCommandClass` / `initCommand` helper pattern. New tests for `catch()` extend this file. Mock pattern for `@clack/prompts` is already established in `credentials.test.ts` (`vi.doMock('@clack/prompts', () => pMock)`).

---

## Open Questions

1. **Multiple missing flags: prompt all in one pass or one at a time?**
   - What we know: `FailedFlagValidationError` contains ALL missing flags in one error. Prompting all in one `catch()` avoids re-running only to hit another missing-flag error.
   - What's unclear: User expectation — does sequential prompting for 2+ flags feel natural?
   - Recommendation: Handle all in one pass. It avoids multiple re-run cycles and is more efficient. The `matchAll` regex already extracts all flag names.

2. **`--json` mode + TTY interaction**
   - What we know: D-03 uses `process.stdin.isTTY` as the sole guard.
   - What's unclear: Whether `--json` passed interactively should also suppress prompting.
   - Recommendation: `process.stdin.isTTY` is sufficient for v1.2. Add `|| this.jsonEnabled()` only if a user reports the edge case.

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — change is purely TypeScript code in an existing file).

---

## Security Domain

No security-sensitive changes. This phase adds interactive UX to the CLI layer only — no credential handling, no API calls, no new attack surface. ASVS categories not applicable.

---

## Sources

### Primary (HIGH confidence)

- `@oclif/core@4.10.5 lib/parser/errors.js` — `FailedFlagValidationError` constructor, exact message format, `.parse.input.flags` property [VERIFIED: read directly from installed node_modules]
- `@oclif/core@4.10.5 lib/parser/validate.js` — exact string `'Missing required flag ${name}'` used to build the error reason [VERIFIED: read directly from installed node_modules]
- `@oclif/core@4.10.5 lib/command.js` — `catch()` method signature and how `_run()` calls it [VERIFIED: read directly from installed node_modules]
- `@oclif/core@4.10.5 lib/config/config.js` — `runCommand(id, argv)` signature [VERIFIED: read directly from installed node_modules]
- `packages/twentythree-cli/src/lib/base-command.ts` — existing code, `this.ctor` pattern, `@clack/prompts` import scope [VERIFIED: codebase]
- `packages/twentythree-cli/src/commands/auth/credentials.ts` — canonical `@clack/prompts` UX pattern [VERIFIED: codebase]
- `packages/twentythree-cli/src/lib/__tests__/base-command.test.ts` — existing test structure, mock patterns [VERIFIED: codebase]
- In-process Node.js verification of `FailedFlagValidationError` message format and `.parse` property contents [VERIFIED: node -e execution]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `err.constructor.name === 'FailedFlagValidationError'` is stable across future @oclif/core v4 minor versions | Architecture Patterns | Low — class name has been stable; worst case is the catch falls through to `super.catch()` harmlessly |

**All other claims verified via direct code inspection or in-process execution.**

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from installed node_modules and package.json
- oclif error interception mechanics: HIGH — verified by reading oclif source and in-process node execution
- @clack/prompts API: HIGH — verified from existing codebase usage
- Architecture: HIGH — single-file change with well-understood integration points

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (oclif v4 minor releases unlikely to change error class names)
