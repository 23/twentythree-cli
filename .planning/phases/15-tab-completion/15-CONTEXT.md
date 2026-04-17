# Phase 15: Tab Completion - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire `@oclif/plugin-autocomplete` so users can enable tab completion once and then use `<TAB>` to discover subcommands and flags for every `twentythree` command. Includes a guided setup flow, documentation updates, and a 1.0.2 npm publish.

Shells: bash and zsh only. Fish is explicitly deferred (REQUIREMENTS.md).

</domain>

<decisions>
## Implementation Decisions

### Setup UX
- **D-01:** Use `@oclif/plugin-autocomplete` default mechanics (the `twentythree autocomplete` command that prints the shell-specific eval line). Do NOT keep the raw default output as the only UX.
- **D-02:** Add a guided interactive prompt using `@clack/prompts` that wraps the oclif autocomplete command. The flow: detect the user's shell (bash vs zsh), show the exact eval line to paste into their rc file (e.g. `~/.zshrc`), and tell them to source it or restart their terminal. No auto-writing to rc files — show only, user pastes manually.
- **D-03:** The guided flow should match the existing `@clack/prompts` style (same visual language as `twentythree auth credentials` and workspace setup).

### Documentation
- **D-04:** Update both `README.md` and `docs/guides/getting-started.md` with a Tab Completion section. Keep it concise — the exact eval line and the one-time setup step.

### Version + Publish
- **D-05:** This phase includes a version bump to 1.0.2, a dist/ rebuild, and npm publish. Same pattern as Phase 14 (human checkpoint before publish).

### Claude's Discretion
- Exact wording and prompt copy in the guided flow
- Whether the guided prompt is a new command file or wraps the oclif autocomplete output
- Shell detection approach (read $SHELL env var or prompt user to confirm)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### oclif Autocomplete
- No external spec file — use `@oclif/plugin-autocomplete` npm package and its README for integration pattern
- Existing oclif config: `packages/twentythree-cli/package.json` § `oclif` block — plugin registration goes here

### Existing UX Patterns
- `packages/twentythree-cli/src/commands/auth/credentials.ts` — reference for @clack/prompts guided flow style
- `packages/twentythree-cli/src/commands/workspace/use.ts` — reference for @clack/prompts selection style

### Documentation Files to Update
- `README.md` (repo root) — add Tab Completion section
- `packages/twentythree-cli/docs/guides/getting-started.md` — add setup step

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@clack/prompts` — already a runtime dependency; use for guided setup flow
- `packages/twentythree-cli/src/commands/auth/credentials.ts` — established pattern for multi-step @clack/prompts flows
- `packages/twentythree-cli/src/commands/workspace/use.ts` — established pattern for shell-specific output

### Established Patterns
- Plugin registration in oclif goes in `package.json` under `oclif.plugins` array
- `postbuild` script runs `oclif manifest` — plugin must be registered before manifest runs
- tsdown/CJS build — plugin must be CJS-compatible (check @oclif/plugin-autocomplete build output)

### Integration Points
- `packages/twentythree-cli/package.json` — add `@oclif/plugin-autocomplete` to `dependencies` and `oclif.plugins`
- New command or wrapper for the guided flow (if not relying solely on the plugin's built-in `autocomplete` command)

</code_context>

<specifics>
## Specific Ideas

- Guided flow detects shell via `$SHELL` env var, falls back to asking user
- Show the exact eval line (e.g. `eval "$(twentythree autocomplete:script zsh)"`) — user copies and pastes into their rc file
- Prompt ends with: "Restart your terminal or run `source ~/.zshrc` to activate"
- Visual style matches auth/credentials setup (intro box, steps, success message)

</specifics>

<deferred>
## Deferred Ideas

- Fish shell completion — explicitly out of scope for v1.2 per REQUIREMENTS.md
- Auto-writing eval line to rc file — too invasive for v1; show only

</deferred>

---

*Phase: 15-tab-completion*
*Context gathered: 2026-04-17*
