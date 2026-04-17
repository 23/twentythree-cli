# Phase 15: Tab Completion - Research

**Researched:** 2026-04-17
**Domain:** oclif plugin system, shell autocomplete, @clack/prompts guided UX
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Use `@oclif/plugin-autocomplete` default mechanics (the `twentythree autocomplete` command that prints the shell-specific eval line). Do NOT keep the raw default output as the only UX.
- **D-02:** Add a guided interactive prompt using `@clack/prompts` that wraps the oclif autocomplete command. The flow: detect the user's shell (bash vs zsh), show the exact eval line to paste into their rc file (e.g. `~/.zshrc`), and tell them to source it or restart their terminal. No auto-writing to rc files — show only, user pastes manually.
- **D-03:** The guided flow should match the existing `@clack/prompts` style (same visual language as `twentythree auth credentials` and workspace setup).
- **D-04:** Update both `README.md` and `docs/guides/getting-started.md` with a Tab Completion section. Keep it concise — the exact eval line and the one-time setup step.
- **D-05:** This phase includes a version bump to 1.0.2, a dist/ rebuild, and npm publish. Same pattern as Phase 14 (human checkpoint before publish).

### Claude's Discretion

- Exact wording and prompt copy in the guided flow
- Whether the guided prompt is a new command file or wraps the oclif autocomplete output
- Shell detection approach (read $SHELL env var or prompt user to confirm)

### Deferred Ideas (OUT OF SCOPE)

- Fish shell completion — explicitly out of scope for v1.2 per REQUIREMENTS.md
- Auto-writing eval line to rc file — too invasive for v1; show only
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COMPLETE-01 | User can run a one-time setup command to enable tab completion for `twentythree` in their bash/zsh shell | Covered by `@oclif/plugin-autocomplete` registration + guided `twentythree autocomplete` command |
| COMPLETE-02 | Tab completion suggests available subcommands (e.g. `twentythree video <TAB>` lists `list`, `get`, `upload`, etc.) | Plugin generates shell completion scripts from `oclif.manifest.json`; space topic separator (already configured) is supported |
| COMPLETE-03 | Tab completion suggests available flags for each command (e.g. `twentythree video list --<TAB>`) | Plugin's `Create` command builds per-command flag lists from manifest; no extra work needed |
</phase_requirements>

---

## Summary

Phase 15 adds tab completion by registering `@oclif/plugin-autocomplete` (v3.2.45) as a runtime dependency and adding it to the `oclif.plugins` array in `package.json`. The plugin injects three hidden commands (`autocomplete`, `autocomplete script`, `autocomplete create`) and generates shell-specific completion scripts cached in the user's XDG cache directory.

The plugin is ESM-only (`"type": "module"`). This is safe because `@oclif/core` v4 explicitly supports loading ESM plugins from a CJS root CLI — oclif's internal plugin loader uses dynamic `import()` to bridge the module format boundary. The Salesforce CLI (which uses this same plugin) confirms it works in production. No build changes are needed.

The guided flow (D-02) wraps the plugin's output rather than replacing it: call `Create.run()` to build the cache, then display the eval line in a `@clack/prompts`-styled presentation. The simplest implementation is a new command file at `src/commands/autocomplete/index.ts` that orchestrates `@clack/prompts` intro/note/outro around the plugin's mechanics.

**Primary recommendation:** Register the plugin, implement a thin guided wrapper command using `@clack/prompts`, test that `twentythree video <TAB>` lists subcommands after setup, then update docs and bump to 1.0.2.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Shell completion script generation | CLI runtime (plugin) | — | `@oclif/plugin-autocomplete` generates scripts from oclif manifest; runs in user's shell context |
| Completion cache storage | CLI runtime (filesystem) | — | Written to `~/.cache/twentythree/autocomplete/` by the plugin |
| Guided setup UX | CLI command layer | — | New command file wraps plugin mechanics with @clack/prompts |
| Shell detection | CLI command layer | — | Read `process.env.SHELL`, fall back to prompting |
| RC file update | User (manual) | — | D-02: show only; no auto-write |
| Documentation | Static docs | — | README.md and getting-started.md |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@oclif/plugin-autocomplete` | 3.2.45 | Generates bash/zsh completion scripts from oclif manifest | Official oclif plugin; used by Salesforce CLI; handles all completion script generation logic |

### Supporting (already in stack)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@clack/prompts` | ^1.2.0 | Guided setup UX | Already a runtime dep; use for intro/note/outro wrapping the setup instructions |
| `chalk` | ^4.1.2 | Highlighting eval line in output | Already a runtime dep |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@oclif/plugin-autocomplete` | Hand-rolled zsh compdef | Months of work; must maintain per-command completions manually; plugin auto-derives from manifest |
| `@oclif/plugin-autocomplete` | `tabtab` | Unmaintained since 2020; no oclif v4 support |

**Installation:**
```bash
pnpm --filter twentythree-cli add @oclif/plugin-autocomplete
```

**Version verification:** `npm view @oclif/plugin-autocomplete version` → `3.2.45` [VERIFIED: npm registry, 2026-04-17]

---

## Architecture Patterns

### System Architecture Diagram

```
User types: twentythree video <TAB>
     │
     ▼
Shell reads ~/.zshrc eval line
     │
     ▼
TWENTYTHREE_AC_ZSH_SETUP_PATH=~/.cache/twentythree/autocomplete/zsh_setup
     │    (sourced on shell init)
     ▼
zsh_setup script sources ~/.cache/twentythree/autocomplete/functions/twentythree.zsh
     │
     ▼
Completion function queries oclif manifest data (baked into script at cache-build time)
     │
     ▼
Shell displays: list  get  upload  replace  delete ...

──────────────── One-time setup flow ────────────────

User: twentythree autocomplete
     │
     ▼
Guided command (new src/commands/autocomplete/index.ts)
     │  detects $SHELL (zsh/bash)
     ▼
Calls @oclif/plugin-autocomplete Create.run() → builds cache
     │
     ▼
@clack/prompts note() shows eval line to paste:
  printf "$(twentythree autocomplete script zsh)" >> ~/.zshrc; source ~/.zshrc
     │
     ▼
outro: "Restart your terminal or run: source ~/.zshrc"
```

### Recommended Project Structure

```
src/
└── commands/
    └── autocomplete/
        └── index.ts     # new: guided setup command
                         # (plugin commands inject themselves via oclif plugin loading)
```

### Pattern 1: Plugin Registration

**What:** Add plugin to `oclif.plugins` array in `package.json` and to `dependencies`
**When to use:** Any oclif plugin that provides commands

```json
// Source: oclif docs https://oclif.io/docs/plugins/
{
  "oclif": {
    "plugins": ["@oclif/plugin-autocomplete"]
  }
}
```

The plugin injects these commands at runtime (not in `src/commands/`):
- `twentythree autocomplete [SHELL]` — displays installation instructions + builds cache
- `twentythree autocomplete script [SHELL]` — outputs the eval line (hidden)
- `twentythree autocomplete create` — rebuilds cache (hidden)

[VERIFIED: oclif docs, plugin README on GitHub]

### Pattern 2: Guided Command Wrapping Plugin Mechanics

**What:** Override the plugin's `autocomplete` command with a project-specific file that calls the plugin's `Create` command internally, then displays instructions via `@clack/prompts`

**When to use:** When the plugin's raw output is sufficient mechanically but the UX should match project conventions (D-01, D-02, D-03)

**Implementation approach — Claude's Discretion:** Two viable options:

**Option A: Standalone guided command at `src/commands/autocomplete/index.ts`**
- Registers as `twentythree autocomplete` in the manifest
- Calls `await Create.run([], this.config)` from `@oclif/plugin-autocomplete` to build the cache
- Uses `@clack/prompts` for intro/note/outro
- The plugin's raw `autocomplete` command is still available but is overridden by this file
- Recommended: consistent with existing command structure

**Option B: Rely on plugin's command, document the eval line only**
- Do not create any new command files
- Users run `twentythree autocomplete zsh` which shows the plugin's default output
- Add custom copy to README/getting-started
- Simpler, but does not satisfy D-02 (guided @clack/prompts flow)

**Recommendation (Claude's Discretion): Option A** — satisfies all decisions (D-01 through D-03) and is consistent with the pattern established by `auth/credentials.ts`.

```typescript
// Source: derived from existing auth/credentials.ts pattern
// src/commands/autocomplete/index.ts
import { Command } from '@oclif/core'
import * as p from '@clack/prompts'
import Create from '@oclif/plugin-autocomplete/lib/commands/autocomplete/create.js'

export default class Autocomplete extends Command {
  static description = 'Set up tab completion for your shell'
  static examples = ['<%= config.bin %> autocomplete']

  public async run(): Promise<void> {
    const rawShell = process.env.SHELL ?? ''
    const detectedShell = rawShell.endsWith('zsh') ? 'zsh'
      : rawShell.endsWith('bash') ? 'bash'
      : null

    p.intro('Tab completion setup')

    let shell: string
    if (detectedShell) {
      const confirm = await p.confirm({
        message: `Detected shell: ${detectedShell}. Set up completion for ${detectedShell}?`,
      })
      if (p.isCancel(confirm) || !confirm) {
        const chosen = await p.select({
          message: 'Select your shell',
          options: [
            { value: 'zsh', label: 'zsh' },
            { value: 'bash', label: 'bash' },
          ],
        })
        if (p.isCancel(chosen)) { p.cancel('Cancelled'); return }
        shell = chosen as string
      } else {
        shell = detectedShell
      }
    } else {
      const chosen = await p.select({
        message: 'Select your shell',
        options: [
          { value: 'zsh', label: 'zsh' },
          { value: 'bash', label: 'bash' },
        ],
      })
      if (p.isCancel(chosen)) { p.cancel('Cancelled'); return }
      shell = chosen as string
    }

    const s = p.spinner()
    s.start('Building completion cache...')
    await Create.run([], this.config)
    s.stop('Completion cache built')

    const rcFile = shell === 'zsh' ? '~/.zshrc' : '~/.bashrc'
    const evalLine = `printf "$(twentythree autocomplete script ${shell})" >> ${rcFile}; source ${rcFile}`

    p.note(
      `Run this command to add tab completion to your shell:\n\n  ${evalLine}\n\nThen restart your terminal or run: source ${rcFile}`,
      'Setup instructions'
    )

    p.outro('After setup, try: twentythree video <TAB>')
  }
}
```

**IMPORTANT NOTE:** The import path `@oclif/plugin-autocomplete/lib/commands/autocomplete/create.js` assumes direct subpath import of the plugin's internals. Verify this works at runtime — if not, the `Create` command can be invoked via `this.config.runCommand('autocomplete:create')` instead (oclif's command runner API).

[ASSUMED: Direct subpath import of plugin internals — verify against installed package structure]

### Pattern 3: Shell Detection via `process.env.SHELL`

**What:** `process.env.SHELL` contains the absolute path to the user's shell binary (e.g. `/bin/zsh`, `/usr/local/bin/bash`). Check `.endsWith('zsh')` and `.endsWith('bash')`.

**When to use:** First attempt before prompting. If null/empty or unrecognized shell, fall through to `p.select`.

[VERIFIED: Node.js `process.env.SHELL` is standard on macOS/Linux; absent on Windows — acceptable since fish/powershell are deferred]

### Anti-Patterns to Avoid

- **Writing to RC files automatically:** D-02 explicitly prohibits this. Show the line, never write it.
- **Importing plugin internals with CJS require():** The plugin is ESM (`"type": "module"`). Use dynamic `import()` or `this.config.runCommand()` instead of `require()`.
- **Forgetting to rebuild the cache after registration:** Users must run `twentythree autocomplete` (which triggers `Create.run()`) before completions work. The eval line alone does nothing if the cache is empty.
- **Using colon topic separator in completion scripts:** The project already uses space separator (`"topicSeparator": " "`). The plugin auto-detects this from `this.config.topicSeparator`. Do not set `OCLIF_AUTOCOMPLETE_TOPIC_SEPARATOR=colon`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| zsh completion functions | Custom `compdef` scripts | `@oclif/plugin-autocomplete` | Completion function generation accounts for quoting, description truncation, flag types, hidden commands — hundreds of edge cases |
| bash completion | Custom `_twentythree` bash function | `@oclif/plugin-autocomplete` | bash_spaces vs bash (colon) implementations differ; plugin handles both |
| Manifest parsing for completions | Custom manifest reader | Plugin's `Create` command | Plugin reads `oclif.manifest.json` and generates correct completion format per shell |

**Key insight:** Shell completion has platform-specific quoting rules, description length limits, and function naming conventions that vary between bash versions. The plugin has accumulated fixes for all of these over years of production use in the Salesforce CLI.

---

## Common Pitfalls

### Pitfall 1: ESM Plugin in CJS CLI — Wrong Import Approach

**What goes wrong:** Trying to `require('@oclif/plugin-autocomplete')` in a CJS file throws `ERR_REQUIRE_ESM`.

**Why it happens:** The plugin is published as `"type": "module"`. `require()` cannot load ESM modules.

**How to avoid:** Do not import the plugin directly in application code. oclif's plugin loader handles the ESM-CJS bridge via dynamic `import()` internally. Register the plugin in `oclif.plugins` and let oclif load it. If you need to call `Create.run()` from a command, use `this.config.runCommand('autocomplete:create', [])` — oclif's command runner works across module types.

**Warning signs:** `ERR_REQUIRE_ESM` at startup or when running `twentythree autocomplete`

### Pitfall 2: Cache Not Built Before Eval Line Is Sourced

**What goes wrong:** User adds the eval line to `~/.zshrc` and sources it, but gets no completions.

**Why it happens:** The eval line sources `$TWENTYTHREE_AC_ZSH_SETUP_PATH`. If that file doesn't exist (i.e. `twentythree autocomplete` was never run to build the cache), sourcing it does nothing silently.

**How to avoid:** The guided command must call `Create.run()` (or `this.config.runCommand('autocomplete:create')`) BEFORE displaying the eval line. The spinner + success message confirms the cache was built.

**Warning signs:** No completions after following setup steps; `ls ~/.cache/twentythree/autocomplete/` is empty

### Pitfall 3: Plugin Not Appearing in Manifest After Registration

**What goes wrong:** `twentythree autocomplete` is "command not found" after adding to `oclif.plugins`.

**Why it happens:** `oclif.manifest.json` is stale. The `postbuild` script runs `oclif manifest` but if the package wasn't installed before the build, the manifest doesn't include plugin commands.

**How to avoid:** After `pnpm add @oclif/plugin-autocomplete`, run `pnpm build` (which triggers `oclif manifest` via postbuild). Verify `oclif.manifest.json` lists `autocomplete` in its commands before testing.

**Warning signs:** `Error: command autocomplete not found`

### Pitfall 4: `topicSeparator` in Eval Line Uses Wrong Format

**What goes wrong:** Completion script generates commands with colon separators (e.g. `autocomplete:script`) when the CLI uses space separators.

**Why it happens:** If `OCLIF_AUTOCOMPLETE_TOPIC_SEPARATOR=colon` is set in the environment, the plugin overrides the config-detected separator.

**How to avoid:** Do not set this env var. The plugin reads `this.config.topicSeparator` from the oclif config (which is `" "` per `package.json`). The generated eval line will correctly be `twentythree autocomplete script zsh` (with spaces).

**Warning signs:** Completion suggests `autocomplete:script` instead of `autocomplete script`

### Pitfall 5: Direct Subpath Import of Plugin Internals Breaks

**What goes wrong:** `import Create from '@oclif/plugin-autocomplete/lib/commands/autocomplete/create.js'` throws module not found.

**Why it happens:** The plugin's `exports` field in `package.json` is `"./lib/index.js"` — it only exports the root entry point, not subpaths.

**How to avoid:** Use `this.config.runCommand('autocomplete:create', [])` instead of direct import. This uses oclif's internal command dispatch which handles ESM loading correctly.

**Warning signs:** Module not found error at startup

---

## Code Examples

### Registration in package.json

```json
// Source: oclif docs https://oclif.io/docs/plugins/ [CITED]
{
  "dependencies": {
    "@oclif/plugin-autocomplete": "^3.2.45"
  },
  "oclif": {
    "bin": "twentythree",
    "dirname": "twentythree",
    "commands": "./dist/commands",
    "topicSeparator": " ",
    "plugins": ["@oclif/plugin-autocomplete"]
  }
}
```

### Safe Cache Build via Config Runner

```typescript
// Source: oclif command runner API [ASSUMED — verify against @oclif/core v4 docs]
// Avoids direct plugin subpath import (which may not be exported)
await this.config.runCommand('autocomplete:create', [])
```

### The Eval Line Format (derived from plugin source)

For **zsh** (space topic separator):
```
printf "$(twentythree autocomplete script zsh)" >> ~/.zshrc; source ~/.zshrc
```

For **bash** (space topic separator):
```
printf "$(twentythree autocomplete script bash)" >> ~/.bashrc; source ~/.bashrc
```

What this line adds to the RC file:
```
TWENTYTHREE_AC_ZSH_SETUP_PATH=/Users/<user>/.cache/twentythree/autocomplete/zsh_setup && test -f $TWENTYTHREE_AC_ZSH_SETUP_PATH && source $TWENTYTHREE_AC_ZSH_SETUP_PATH; # twentythree autocomplete setup
```

[VERIFIED: derived from `src/commands/autocomplete/script.ts` in plugin source, 2026-04-17]

### @clack/prompts note() pattern (from existing codebase)

```typescript
// Source: packages/twentythree-cli/src/commands/auth/credentials.ts — established pattern
p.intro('Tab completion setup')
// ... logic ...
p.note('content here', 'Title')
p.outro('Done message')
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tabtab` library | `@oclif/plugin-autocomplete` | ~2020 | tabtab unmaintained; plugin is the only supported oclif path |
| `@oclif/plugin-autocomplete` v2 | v3 (ESM, `ansis` instead of `chalk`) | 2024 | v3 is ESM-only; plugin no longer includes its own chalk dep |

**Deprecated/outdated:**
- `@oclif/plugin-autocomplete` v1/v2: Replaced by v3 which requires `@oclif/core` v4. Do not install older versions.
- `tabtab`: Archived; no oclif v4 support.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `this.config.runCommand('autocomplete:create', [])` is the correct API to invoke a plugin command programmatically from another command | Code Examples, Architecture Patterns | Guided command fails to build cache; fallback: call oclif command manually via `exec` or skip in-process invocation |
| A2 | Direct subpath import `@oclif/plugin-autocomplete/lib/commands/autocomplete/create.js` fails due to restricted `exports` | Common Pitfalls | If it works, Pitfall 5 is not a concern — but the `exports` field only lists `./lib/index.js` so restriction is likely |

---

## Open Questions

1. **`this.config.runCommand` API signature in @oclif/core v4**
   - What we know: oclif has a `runCommand` / `run` mechanism for dispatching commands
   - What's unclear: Exact method name and signature on `this.config` in v4.10.5
   - Recommendation: During implementation, check `@oclif/core` v4 type declarations for `Config.runCommand`. Alternative: use `oclif execute` approach or invoke the plugin's exported class directly via dynamic `import()`.

2. **Whether a custom `src/commands/autocomplete/index.ts` overrides the plugin's `autocomplete` command**
   - What we know: oclif loads project commands and plugin commands; project commands take priority on the same topic
   - What's unclear: Whether this causes a manifest conflict or silently overrides
   - Recommendation: Verify after `pnpm build && oclif manifest` that only one `autocomplete` command appears in the manifest.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Plugin runtime | ✓ | v22.22.2 | — |
| npm / pnpm | Package install | ✓ | npm 10.9.7, pnpm 10.33.0 | — |
| zsh | Completion testing | ✓ | system zsh (macOS) | — |
| bash | Completion testing | ✓ | system bash | — |
| `@oclif/plugin-autocomplete` | Core feature | ✗ (not yet installed) | 3.2.45 available | — |

**Missing dependencies with no fallback:**
- `@oclif/plugin-autocomplete` — must be installed before phase can be executed

**Missing dependencies with fallback:**
- None

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest ^4.1.4 |
| Config file | `packages/twentythree-cli/vitest.config.ts` |
| Quick run command | `pnpm --filter twentythree-cli test --run` |
| Full suite command | `pnpm --filter twentythree-cli test --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMPLETE-01 | `twentythree autocomplete` command exists and runs without error | smoke | `pnpm --filter twentythree-cli test --run` | ❌ Wave 0 |
| COMPLETE-01 | Shell detection returns 'zsh' or 'bash' from $SHELL | unit | `pnpm --filter twentythree-cli test --run` | ❌ Wave 0 |
| COMPLETE-02 | Plugin is registered in `oclif.plugins` and manifest includes `autocomplete` | integration/manifest check | `node -e "const m=require('./oclif.manifest.json'); console.log(Object.keys(m.commands).filter(c=>c.startsWith('autocomplete')))"` | manual |
| COMPLETE-02 | `twentythree video <TAB>` lists subcommands | e2e/manual | manual shell test | manual-only |
| COMPLETE-03 | `twentythree video list --<TAB>` lists flags | e2e/manual | manual shell test | manual-only |

**Note on COMPLETE-02 and COMPLETE-03:** End-to-end shell tab completion cannot be automated in vitest — it requires a real interactive shell session with the completion scripts sourced. These requirements are validated manually during the verification phase.

### Sampling Rate

- **Per task commit:** `pnpm --filter twentythree-cli test --run`
- **Per wave merge:** `pnpm --filter twentythree-cli test --run`
- **Phase gate:** Full suite green + manual completion smoke test before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/commands/autocomplete/__tests__/autocomplete.test.ts` — covers COMPLETE-01 (command exists, shell detection logic)
- [ ] Shared fixture: `process.env.SHELL` mock for unit tests

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes (low risk) | Shell arg is enum-constrained (`zsh|bash`) by plugin; no free-form shell injection |
| V6 Cryptography | no | — |

**No significant security surface.** The autocomplete feature reads `oclif.manifest.json` (local) and writes to the user's XDG cache directory. No network calls, no credentials handled. The eval line written to `~/.zshrc` is generated by the plugin from the binary name — not user-supplied input.

---

## Sources

### Primary (HIGH confidence)

- `@oclif/plugin-autocomplete` npm registry — version 3.2.45, `"type": "module"`, dependencies confirmed [VERIFIED: `npm view @oclif/plugin-autocomplete`, 2026-04-17]
- `github.com/oclif/plugin-autocomplete/main/src/commands/autocomplete/index.ts` — exact eval line format, shell instructions [VERIFIED: raw GitHub source, 2026-04-17]
- `github.com/oclif/plugin-autocomplete/main/src/commands/autocomplete/script.ts` — exact output format: `CLIBINENVVAR_AC_SHELL_SETUP_PATH=... && source ...` [VERIFIED: raw GitHub source, 2026-04-17]
- `github.com/oclif/plugin-autocomplete/main/src/base.ts` — `determineShell()`, `getSetupEnvVar()` implementations [VERIFIED: raw GitHub source, 2026-04-17]
- `packages/twentythree-cli/package.json` — current `"type": "commonjs"`, no plugins array yet [VERIFIED: Read tool, 2026-04-17]
- oclif.io/docs/esm — CJS root ✅ installs ESM plugins [CITED: https://oclif.io/docs/esm/]

### Secondary (MEDIUM confidence)

- Salesforce CLI `package.json` — confirms `@oclif/plugin-autocomplete` in `oclif.plugins` in production CLI [VERIFIED: raw GitHub source, `salesforcecli/cli`]
- oclif.io/docs/plugins — plugin registration format (`oclif.plugins` array) [CITED: https://oclif.io/docs/plugins/]

### Tertiary (LOW confidence)

- `this.config.runCommand('autocomplete:create', [])` API — inferred from oclif patterns; not directly verified against v4 type declarations [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm registry confirmed version, GitHub source confirmed module type and ESM/CJS interop
- Architecture: HIGH — plugin source code read directly; eval line format derived from source, not docs
- Pitfalls: HIGH — Pitfall 1/5 (ESM import issues) verified against plugin exports field; Pitfall 3/4 verified against plugin source
- `runCommand` API: LOW — assumed from oclif patterns; needs implementation-time verification

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (plugin is stable; oclif v4 ecosystem moves slowly)
