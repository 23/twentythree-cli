# Phase 15: Tab Completion - Pattern Map

**Mapped:** 2026-04-17
**Files analyzed:** 4 (1 new command, 1 new test, 2 doc updates) + 1 config modification
**Analogs found:** 4 / 5 (package.json has no plugin-registration analog — use RESEARCH.md pattern)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `packages/twentythree-cli/src/commands/autocomplete/index.ts` | command | request-response | `packages/twentythree-cli/src/commands/auth/credentials.ts` | exact |
| `packages/twentythree-cli/src/commands/autocomplete/__tests__/autocomplete.test.ts` | test | — | `packages/twentythree-cli/src/commands/auth/__tests__/credentials.test.ts` | exact |
| `packages/twentythree-cli/package.json` | config | — | self (existing file, add plugin registration) | config-mod |
| `README.md` | doc | — | existing README sections | doc-mod |
| `packages/twentythree-cli/docs/guides/getting-started.md` | doc | — | existing getting-started sections | doc-mod |

---

## Pattern Assignments

### `packages/twentythree-cli/src/commands/autocomplete/index.ts` (command, request-response)

**Analog:** `packages/twentythree-cli/src/commands/auth/credentials.ts`

**Imports pattern** (credentials.ts lines 1-11):
```typescript
import { Command } from '@oclif/core'
import * as p from '@clack/prompts'
// No external service imports needed for autocomplete command —
// cache build is triggered via this.config.runCommand('autocomplete:create', [])
```

**Command class skeleton** (credentials.ts lines 12-24):
```typescript
export default class Autocomplete extends Command {
  static description = 'Set up tab completion for your shell'

  static agentMetadata = {
    api_endpoint: 'interactive',
    auth_scope: 'none' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }

  static examples = ['<%= config.bin %> autocomplete']

  public async run(): Promise<void> {
    await this.parse(Autocomplete)
    p.intro('Tab completion setup')
    // ...
  }
}
```

**Shell detection pattern** (Claude's Discretion — no existing analog; derive from RESEARCH.md):
```typescript
const rawShell = process.env.SHELL ?? ''
const detectedShell = rawShell.endsWith('zsh') ? 'zsh'
  : rawShell.endsWith('bash') ? 'bash'
  : null
```

**Confirm + select fallback pattern** (credentials.ts lines 32-46 adapted; workspace/use.ts lines 52-69):
```typescript
// From credentials.ts — isCancel guard on every prompt result:
if (p.isCancel(domain)) {
  p.cancel('Cancelled')
  return
}

// From workspace/use.ts lines 52-69 — p.select with isCancel guard:
const chosen = await p.select({
  message: `Multiple workspaces match '${name}'. Select one:`,
  options: result.map((w) => ({
    value: w.domain,
    label: `${w.display_name} (${w.domain})`,
  })),
})
if (p.isCancel(chosen)) {
  p.cancel('Cancelled')
  return
}
```

**Spinner pattern** (credentials.ts lines 57-70):
```typescript
const s = p.spinner()
s.start('Discovering workspaces...')
try {
  // async work
  s.stop('Workspaces discovered')
} catch (err) {
  s.stop('Failed to discover workspaces')
  this.error(
    `Could not discover workspaces: ${err instanceof Error ? err.message : String(err)}`,
    { exit: 1 },
  )
  return
}
```

**Cache build invocation** (RESEARCH.md Pattern 2 — no codebase analog; use oclif command runner):
```typescript
// Safe: avoids direct ESM subpath import of plugin internals (Pitfall 5)
// Verify this.config.runCommand signature against @oclif/core v4 type declarations at impl time
await this.config.runCommand('autocomplete:create', [])
```

**note() + outro() pattern** (credentials.ts lines 120-121):
```typescript
// credentials.ts uses p.outro directly; for autocomplete use p.note() first:
p.note(
  `Add tab completion to your shell:\n\n  ${evalLine}\n\nThen restart your terminal or run: source ${rcFile}`,
  'Setup instructions'
)
p.outro('After setup, try: twentythree video <TAB>')
```

**RC file and eval line strings** (RESEARCH.md Code Examples — no codebase analog):
```typescript
const rcFile = shell === 'zsh' ? '~/.zshrc' : '~/.bashrc'
const evalLine = `printf "$(twentythree autocomplete script ${shell})" >> ${rcFile}; source ${rcFile}`
```

**CRITICAL NOTES for implementer:**
- Do NOT use `require('@oclif/plugin-autocomplete')` — the plugin is ESM-only and CJS require throws `ERR_REQUIRE_ESM` (RESEARCH.md Pitfall 1)
- Do NOT import plugin subpaths (`@oclif/plugin-autocomplete/lib/...`) — the package `exports` field restricts to `./lib/index.js` (RESEARCH.md Pitfall 5)
- Use `this.config.runCommand('autocomplete:create', [])` — the oclif command runner bridges ESM/CJS (RESEARCH.md Pattern 2)
- Verify `this.config.runCommand` method name against `@oclif/core` v4.10.5 type declarations before use (RESEARCH.md Open Question 1)
- Build cache BEFORE displaying the eval line (RESEARCH.md Pitfall 2)

---

### `packages/twentythree-cli/src/commands/autocomplete/__tests__/autocomplete.test.ts` (test)

**Analog:** `packages/twentythree-cli/src/commands/auth/__tests__/credentials.test.ts`

**Test file header and mock setup** (credentials.test.ts lines 1-28):
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @clack/prompts before importing the command
vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
  confirm: vi.fn(),
  select: vi.fn(),
  spinner: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
  isCancel: vi.fn(() => false),
  cancel: vi.fn(),
}))
```

**describe/beforeEach structure** (credentials.test.ts lines 43-47):
```typescript
describe('autocomplete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('command module is importable and has a run method', async () => {
    const { default: Autocomplete } = await import('../index.js')
    expect(Autocomplete).toBeDefined()
    expect(typeof Autocomplete.prototype.run).toBe('function')
  })
  // ...
})
```

**Shell detection unit test pattern** (use process.env mock, no codebase analog — standard vitest):
```typescript
it('detects zsh from $SHELL env var', () => {
  const originalShell = process.env.SHELL
  process.env.SHELL = '/bin/zsh'
  // test shell detection logic in isolation
  const rawShell = process.env.SHELL ?? ''
  const detected = rawShell.endsWith('zsh') ? 'zsh'
    : rawShell.endsWith('bash') ? 'bash'
    : null
  expect(detected).toBe('zsh')
  process.env.SHELL = originalShell
})

it('detects bash from $SHELL env var', () => {
  process.env.SHELL = '/usr/local/bin/bash'
  const rawShell = process.env.SHELL ?? ''
  const detected = rawShell.endsWith('zsh') ? 'zsh'
    : rawShell.endsWith('bash') ? 'bash'
    : null
  expect(detected).toBe('bash')
})

it('returns null for unrecognized shell', () => {
  process.env.SHELL = '/usr/local/bin/fish'
  const rawShell = process.env.SHELL ?? ''
  const detected = rawShell.endsWith('zsh') ? 'zsh'
    : rawShell.endsWith('bash') ? 'bash'
    : null
  expect(detected).toBeNull()
})
```

**Pattern note:** credentials.test.ts uses `vi.doMock` + dynamic import for @clack/prompts to get fresh mocks per test. For autocomplete tests, shell detection logic is pure enough to extract and test in isolation without running the full command.

---

### `packages/twentythree-cli/package.json` (config modification)

**No analog exists** — first plugin registration in this project. Use RESEARCH.md Pattern 1 exactly.

**What to add to the `oclif` block** (RESEARCH.md Registration section):
```json
{
  "oclif": {
    "bin": "twentythree",
    "dirname": "twentythree",
    "commands": "./dist/commands",
    "topicSeparator": " ",
    "plugins": ["@oclif/plugin-autocomplete"]
  }
}
```

**What to add to `dependencies`:**
```json
{
  "dependencies": {
    "@oclif/plugin-autocomplete": "^3.2.45"
  }
}
```

**CRITICAL NOTE:** After adding the plugin to `oclif.plugins` and running `pnpm add`, run `pnpm build` so that `postbuild` triggers `oclif manifest`. Verify `oclif.manifest.json` lists `autocomplete` commands before testing (RESEARCH.md Pitfall 3).

---

### `README.md` (doc modification)

**Analog:** Existing README sections — same heading level and code block style already in use.

**Insert location:** After the `## Quickstart` section, before `## Commands`. Or add as a subsection after the Commands table.

**Pattern to follow** (README.md lines 7-15 — Quickstart section style):
```markdown
## Tab Completion

Enable tab completion for bash and zsh once — then use `<TAB>` to discover commands and flags.

```sh
twentythree autocomplete
```

Follow the on-screen instructions to add the eval line to your shell RC file (`~/.zshrc` or `~/.bashrc`), then restart your terminal.
```

---

### `packages/twentythree-cli/docs/guides/getting-started.md` (doc modification)

**Analog:** Existing getting-started sections — numbered Step pattern already in use.

**Insert location:** After Step 2 (Select a workspace), before Step 3 (Run your first command). Renumber Step 3 to Step 4 if inserting as Step 3, or add as an optional numbered step.

**Pattern to follow** (getting-started.md lines 29-38 — Step format):
```markdown
## Step 3: Enable tab completion (optional)

Run this once to set up `<TAB>` completion for all commands and flags:

```bash
twentythree autocomplete
```

The command detects your shell (bash or zsh), builds the completion cache, and shows the eval line to paste into your RC file. After sourcing your RC file or restarting your terminal, try:

```bash
twentythree video <TAB>
```
```

---

## Shared Patterns

### @clack/prompts Flow Structure
**Source:** `packages/twentythree-cli/src/commands/auth/credentials.ts` lines 26-121
**Apply to:** `src/commands/autocomplete/index.ts`

The established pattern for every multi-step interactive command:
1. `p.intro('Title')` — always first
2. One `await p.text/confirm/select` per step with `isCancel` guard after each
3. `p.spinner()` around any async work (`.start()` / `.stop()`)
4. `p.note('content', 'Title')` for informational display blocks
5. `p.outro('Done message')` — always last

```typescript
// credentials.ts lines 26-36 — canonical isCancel guard pattern:
const domain = await p.text({ message: '...' })
if (p.isCancel(domain)) {
  p.cancel('Cancelled')
  return
}
```

### oclif Command Class Skeleton
**Source:** `packages/twentythree-cli/src/commands/auth/credentials.ts` lines 12-23
**Apply to:** `src/commands/autocomplete/index.ts`

```typescript
export default class MyCommand extends Command {
  static description = '...'
  static agentMetadata = {
    api_endpoint: 'interactive',
    auth_scope: 'none' as const,
    output_shape: { type: 'none' as const },
    side_effects: 'creates' as const,
  }
  static examples = ['<%= config.bin %> command-name']
  public async run(): Promise<void> {
    await this.parse(MyCommand)
    // ...
  }
}
```

### Vitest Test File Structure
**Source:** `packages/twentythree-cli/src/commands/auth/__tests__/credentials.test.ts` lines 1-47
**Apply to:** `src/commands/autocomplete/__tests__/autocomplete.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
// vi.mock() calls at module level — before any imports of mocked modules
vi.mock('module-to-mock', () => ({ fn: vi.fn() }))

describe('command name', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('description of behavior', async () => {
    // arrange mocks, act, assert
  })
})
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `package.json` oclif.plugins registration | config | — | No existing plugin registered in this project; use RESEARCH.md Pattern 1 |
| `this.config.runCommand('autocomplete:create', [])` | runtime API call | — | No existing cross-command invocation in codebase; verify against @oclif/core v4 type declarations at implementation time |

---

## Metadata

**Analog search scope:** `packages/twentythree-cli/src/commands/`, `packages/twentythree-cli/src/`
**Files scanned:** credentials.ts, workspace/use.ts, credentials.test.ts, workspace/use.test.ts, package.json, README.md, getting-started.md
**Pattern extraction date:** 2026-04-17
