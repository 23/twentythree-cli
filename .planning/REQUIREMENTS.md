# Requirements: v1.2 Burnin & Quality of Life

**Milestone:** v1.2
**Status:** Active
**Created:** 2026-04-17

---

## Active Requirements

### Bug Fixes (BUG)

- [x] **BUG-01**: `parseBoolParam is not defined` error on `twentythree video list` is fixed
- [x] **BUG-02**: All commands using the same undefined-reference pattern are audited and fixed before release

### Tab Completion (COMPLETE)

- [x] **COMPLETE-01**: User can run a one-time setup command to enable tab completion for `twentythree` in their bash/zsh shell
- [x] **COMPLETE-02**: Tab completion suggests available subcommands (e.g. `twentythree video <TAB>` lists `list`, `get`, `upload`, etc.)
- [x] **COMPLETE-03**: Tab completion suggests available flags for each command (e.g. `twentythree video list --<TAB>`)

### Interactive Prompts (PROMPT)

- [ ] **PROMPT-01**: When a required flag is omitted, the CLI prompts for the value interactively instead of showing an oclif error
- [ ] **PROMPT-02**: Interactive prompts use `@clack/prompts` for consistent UX with existing auth and workspace setup flows

---

## Future Requirements (post-v1.2)

- Browser OAuth flow (`twentythree auth login --scope read|write|admin`)
- AI skills package — installable agent skills wrapping the CLI

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
| BUG-01 | Phase 14 | 14-01 |
| BUG-02 | Phase 14 | 14-02 |
| COMPLETE-01 | Phase 15 | 15-01 |
| COMPLETE-02 | Phase 15 | 15-02 |
| COMPLETE-03 | Phase 15 | 15-02 |
| PROMPT-01 | Phase 16 | 16-01 |
| PROMPT-02 | Phase 16 | 16-01 |
