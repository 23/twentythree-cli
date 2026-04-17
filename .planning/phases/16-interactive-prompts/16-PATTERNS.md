# Phase 16: Interactive Prompts - Pattern Map

**Mapped:** 2026-04-17
**Files analyzed:** 2 (1 modified source, 1 modified test)
**Analogs found:** 2 / 2

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `packages/twentythree-cli/src/lib/base-command.ts` | middleware/base-class | request-response | self (existing file extended) | exact — adding `catch()` method |
| `packages/twentythree-cli/src/lib/__tests__/base-command.test.ts` | test | request-response | self (existing test extended) | exact — appending new `describe` block |

## Pattern Assignments

### `packages/twentythree-cli/src/lib/base-command.ts` (base-class, request-response)

**Analog:** self — this file already exists and is the only file being modified.

**Existing imports pattern** (lines 1-12):
```typescript
import { Command, Flags, Interfaces } from '@oclif/core'
import chalk from 'chalk'
import { select } from '@clack/prompts'
import {
  getWorkspaces,
  getActiveWorkspace,
  getWorkspaceForDomain,
  findWorkspace,
  type WorkspaceEntry,
} from '../auth/workspace-config.js'
import { ensureFreshToken } from '../auth/token-refresh.js'
import { createApiClient } from '../api/client.js'
```

The `@clack/prompts` import currently pulls only `select` as a named import. Phase 16 needs `p.intro`, `p.text`, `p.isCancel`, `p.outro`, and `p.cancel`. Change the import to the namespace form:
```typescript
import * as p from '@clack/prompts'
```
Then remove the separate `{ select }` named import and replace its single use (line 110) with `p.select(...)`.

**Existing `@clack/prompts` usage in `init()` to preserve** (lines 109-115):
```typescript
const chosen = await select({
  message: `Multiple workspaces match '${workspaceFlagValue}'. Select one:`,
  options: result.map((w) => ({
    value: w.domain,
    label: `${w.display_name} (${w.domain})`,
  })),
})
if (typeof chosen === 'symbol') {
  this.error('Workspace selection cancelled', { exit: 1 })
}
```
After import change this becomes `await p.select(...)` — same logic, different call site form.

**New `catch()` method — add after `init()` and before `printWorkspaceHeader()`:**
```typescript
public async catch(err: Error & { parse?: { input?: { flags?: Record<string, { description?: string; summary?: string }> } } }): Promise<void> {
  // Non-TTY guard (D-03): re-throw unchanged in CI, pipes, --json agent mode
  if (!process.stdin.isTTY) {
    return super.catch(err)
  }

  // Detect FailedFlagValidationError by constructor name — the class is not exported
  // from @oclif/core's public API so instanceof is unreliable across module instances.
  if (err.constructor.name !== 'FailedFlagValidationError') {
    return super.catch(err)
  }

  // Extract all missing flag names from error message.
  // Verified format (oclif/core@4.10.5 lib/parser/validate.js):
  //   "The following error(s) occurred:\n  Missing required flag {name}\n..."
  const flagNames = [...err.message.matchAll(/Missing required flag ([^\n]+)/g)].map(m => m[1])
  if (flagNames.length === 0) {
    return super.catch(err)
  }

  // Flag definitions (description, summary) are on the parse property of the error
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

  // Re-invoke with original argv + collected values. this.argv preserves flags
  // the user DID provide (e.g. --workspace, --json).
  const newArgv = [...(this.argv ?? []), ...extraArgv]
  await this.config.runCommand(this.id!, newArgv)
}
```

**Placement:** Insert the `catch()` method between the closing brace of `init()` (line 155) and the opening of `printWorkspaceHeader()` (line 161).

**`printWorkspaceHeader()` method — no change** (lines 161-163):
```typescript
protected printWorkspaceHeader(): void {
  this.log(chalk.dim(`[${this.activeWorkspace.domain}]`))
}
```

---

### `packages/twentythree-cli/src/lib/__tests__/base-command.test.ts` (test, request-response)

**Analog:** self — this file already exists and uses the `makeBaseCommandClass` / `initCommand` / `makeOclifConfig` helper pattern throughout.

**Existing mock block for `@clack/prompts`** (lines 64-66) — currently mocks only `select`:
```typescript
vi.mock('@clack/prompts', () => ({
  select: vi.fn(),
}))
```
Expand to include all symbols used by the new `catch()` method:
```typescript
vi.mock('@clack/prompts', () => ({
  select: vi.fn(),
  intro: vi.fn(),
  text: vi.fn(),
  isCancel: vi.fn(() => false),
  cancel: vi.fn(),
  outro: vi.fn(),
}))
```

**Existing hoisted mock pattern to follow** (lines 6-38) — new tests need access to the clack mock functions. Add them to the hoisted block:
```typescript
const {
  // ...existing mocks...
  mockPIntro,
  mockPText,
  mockPIsCancel,
  mockPCancel,
  mockPOutro,
} = vi.hoisted(() => {
  // ...existing mock factories...
  const mockPIntro = vi.fn()
  const mockPText = vi.fn()
  const mockPIsCancel = vi.fn(() => false)
  const mockPCancel = vi.fn()
  const mockPOutro = vi.fn()
  return {
    // ...existing returns...
    mockPIntro, mockPText, mockPIsCancel, mockPCancel, mockPOutro,
  }
})
```
Then update the `vi.mock('@clack/prompts', ...)` factory to use these hoisted fns.

**Helper extension — add `catch()` test helper alongside existing `initCommand`:**
```typescript
/**
 * Build a concrete subclass with a required flag for testing catch() behaviour.
 */
function makeCommandWithRequiredFlag() {
  class CmdWithRequired extends BaseCommand<typeof CmdWithRequired> {
    static id = 'test:required'
    static flags = {
      ...BaseCommand.baseFlags,
      name: Flags.string({ description: 'Your name', required: true }),
    }
    static args = {}
    static strict = true
    static enableJsonFlag = true
    async run() { /* no-op */ }
  }
  return CmdWithRequired
}
```

**New describe block to append** — follows the established pattern of the `describe('AuthenticatedCommand', ...)` block (lines 240-266):
```typescript
describe('BaseCommand.catch() — interactive prompt for missing required flag', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(process.stdin, 'isTTY', { value: true, writable: true })
    mockEnsureFreshToken.mockResolvedValue(null)
  })

  it('re-throws when process.stdin.isTTY is false (non-TTY guard)', async () => {
    Object.defineProperty(process.stdin, 'isTTY', { value: false, writable: true })
    // ... construct a FailedFlagValidationError-like error and call catch()
    // expect super.catch to be called
  })

  it('re-throws for non-FailedFlagValidationError errors', async () => {
    // pass a plain Error; expect re-throw
  })

  it('prompts for a single missing flag and re-runs command', async () => {
    mockPText.mockResolvedValue('Alice')
    mockPIsCancel.mockReturnValue(false)
    // expect p.intro, p.text, p.outro called; runCommand called with ['--name', 'Alice']
  })

  it('prompts for all missing flags in one pass (multi-flag case)', async () => {
    mockPText.mockResolvedValueOnce('https://example.com').mockResolvedValueOnce('video.uploaded')
    mockPIsCancel.mockReturnValue(false)
    // expect two p.text calls; runCommand called with both --target-url and --event
  })

  it('calls process.exit(0) on cancel (p.isCancel returns true)', async () => {
    mockPText.mockResolvedValue(Symbol('clack:cancel'))
    mockPIsCancel.mockReturnValue(true)
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit') })
    // expect p.cancel called and process.exit(0) called
    exitSpy.mockRestore()
  })
})
```

**`runCommand` mock** — the `makeOclifConfig()` helper (lines 125-132) needs `runCommand` added:
```typescript
function makeOclifConfig() {
  return {
    userAgent: 'twentythree-cli/test',
    scopedEnvVar: () => undefined,
    runHook: vi.fn().mockResolvedValue({ successes: [], failures: [] }),
    runCommand: vi.fn().mockResolvedValue(undefined),   // ← add for catch() tests
    theme: {},
  } as never
}
```

**`p.isCancel` returns a Symbol pattern** (from `credentials.test.ts` lines 63-64):
```typescript
isCancel: vi.fn(() => false),  // default: not cancelled
// Override per-test: mockPIsCancel.mockReturnValue(true)
```

---

## Shared Patterns

### `@clack/prompts` UX sequence
**Source:** `packages/twentythree-cli/src/commands/auth/credentials.ts` (lines 26-36, 120)
**Apply to:** The new `catch()` method in `BaseCommand`

Canonical sequence (copy exactly):
```typescript
p.intro('Missing required input')          // opening frame
const value = await p.text({ message: label })
if (p.isCancel(value)) {                   // always guard with p.isCancel, not !value
  p.cancel('Cancelled')
  return                                   // or process.exit(0) in catch() context
}
// ... collect more values ...
p.outro('Running command...')              // closing frame before re-execution
```

### `process.stdin.isTTY` non-TTY guard
**Source:** CONTEXT.md D-03 / RESEARCH.md Standard Stack section
**Apply to:** Top of the `catch()` method, before any prompt calls

```typescript
if (!process.stdin.isTTY) {
  return super.catch(err)
}
```

### `this.config.runCommand` re-dispatch
**Source:** RESEARCH.md Code Examples — `runCommand` Signature section
**Apply to:** End of the `catch()` method after prompts complete

```typescript
const newArgv = [...(this.argv ?? []), ...extraArgv]
await this.config.runCommand(this.id!, newArgv)
```
`this.argv` preserves flags the user already provided. `extraArgv` adds `['--flagName', 'value']` pairs for each prompted flag.

### Error detection pattern
**Source:** RESEARCH.md Architecture Patterns — Pattern 1
**Apply to:** Start of the `catch()` method body (after non-TTY guard)

```typescript
if (err.constructor.name !== 'FailedFlagValidationError') {
  return super.catch(err)
}
const flagNames = [...err.message.matchAll(/Missing required flag ([^\n]+)/g)].map(m => m[1])
if (flagNames.length === 0) {
  return super.catch(err)
}
const inputFlags = (err as any).parse?.input?.flags ?? {}
```

---

## No Analog Found

None — both files are existing files being modified. All patterns are drawn directly from the existing codebase.

---

## Metadata

**Analog search scope:** `packages/twentythree-cli/src/lib/`, `packages/twentythree-cli/src/commands/auth/`
**Files scanned:** 4 (base-command.ts, base-command.test.ts, credentials.ts, credentials.test.ts)
**Pattern extraction date:** 2026-04-17
