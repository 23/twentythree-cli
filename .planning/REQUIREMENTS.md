# Requirements — v1.4 Prepare Skill for Release on npm

## Milestone Requirements

### npm Publish

- [ ] **NPM-01**: User can publish `twentythree-skills` to npm at version 1.0.0 by pushing a `skills-v*` tag — requires `publishConfig.access: "public"` in `packages/twentythree-skills/package.json` and a skills publish step wired into `.github/workflows/release.yml`
- [ ] **NPM-02**: `packages/twentythree-skills/package.json` includes runtime-specific keywords (`claude`, `claude-code`, `copilot`, `cursor`, `codex`, `ai-agent`) in addition to existing keywords for improved npm discoverability
- [ ] **NPM-03**: `bin/add.js` handles bare `npx twentythree-skills` invocation without requiring the `add` subcommand; README documents the canonical invocation form
- [ ] **NPM-04**: CI includes a dry-run step that verifies `NPM_TOKEN` has publish access for `twentythree-skills` before the real publish step executes

### Skills Discoverability

- [ ] **SKILL-03**: `skills/SKILL.md` resource index upgrades all 22 plain-text topic names to `` [`topic`](reference/topic.md) `` markdown hyperlinks for link-following AI runtimes (Claude Code, Copilot, Cursor)

## Future Requirements

- Additional workflow files — expand as high-value agent automation patterns emerge from usage
- Installer post-success message with "start a new session" hint for reduced user confusion
- Skills smoke-test job in CI verifying `npx twentythree-skills` resolves after publish

## Out of Scope

- Browser OAuth (`twentythree auth login`) — deferred to a later milestone
- Changesets integration — release.yml uses manual `pnpm publish`; changesets is configured but bypassed; left as-is for v1.4
- Automatic skills install on CLI install — keep the two packages independent
- `npx twentythree-skills` interactive mode / subcommand routing beyond the existing single-purpose installer

## Traceability

| REQ-ID   | Phase | Plan |
|----------|-------|------|
| NPM-01   | TBD   | TBD  |
| NPM-02   | TBD   | TBD  |
| NPM-03   | TBD   | TBD  |
| NPM-04   | TBD   | TBD  |
| SKILL-03 | TBD   | TBD  |

---
*Created: 2026-04-20 — v1.4 milestone*
