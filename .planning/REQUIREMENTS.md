# Requirements: v1.2 Burnin & Quality of Life

**Milestone:** v1.2
**Status:** Active
**Created:** 2026-04-17

---

## Active Requirements

### Bug Fixes (BUG)

- [ ] **BUG-01**: `parseBoolParam is not defined` error on `twentythree video list` is fixed
- [ ] **BUG-02**: All commands using the same undefined-reference pattern are audited and fixed before release

### Tab Completion (COMPLETE)

- [ ] **COMPLETE-01**: User can run a one-time setup command to enable tab completion for `twentythree` in their bash/zsh shell
- [ ] **COMPLETE-02**: Tab completion suggests available subcommands (e.g. `twentythree video <TAB>` lists `list`, `get`, `upload`, etc.)
- [ ] **COMPLETE-03**: Tab completion suggests available flags for each command (e.g. `twentythree video list --<TAB>`)

### Interactive Prompts (PROMPT)

- [ ] **PROMPT-01**: When a required flag is omitted, the CLI prompts for the value interactively instead of showing an oclif error
- [ ] **PROMPT-02**: Interactive prompts use `@clack/prompts` for consistent UX with existing auth and workspace setup flows

---

## Future Requirements (post-v1.2)

- Browser OAuth flow (`twentythree auth login --scope read|write|admin`)
- AI skills package — installable agent skills wrapping the CLI
- OIDC trusted publishing for GitHub Actions (defer from v1.1)

---

## Out of Scope

- GUI / web dashboard — terminal tool only
- Non-Node.js distribution (Homebrew, standalone binary)
- Code-generated commands — hand-authored for UX quality
- Fish shell completion — bash/zsh sufficient for v1.2; fish is a later addition

---

## Traceability

| Requirement | Phase | Plan |
|-------------|-------|------|
| BUG-01 | — | — |
| BUG-02 | — | — |
| COMPLETE-01 | — | — |
| COMPLETE-02 | — | — |
| COMPLETE-03 | — | — |
| PROMPT-01 | — | — |
| PROMPT-02 | — | — |
