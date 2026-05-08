---
quick_id: 260508-dnq
slug: release-v1-3-3-docs-skill-update-version
description: Release v1.3.3 — docs, skill update, version bump, and tags for CLI and skills packages
date: 2026-05-08
must_haves:
  truths:
    - CLI package.json version is 1.3.3
    - skills package.json version is 1.3.3
    - docs/commands/auth.md includes auth switch command
    - docs/commands/auth/switch.md exists
    - SKILL.md auth row lists credentials, status, switch
    - all tests pass before tagging
    - git tags v1.3.3 and skills-v1.3.3 created locally
  artifacts:
    - packages/twentythree-cli/package.json (version 1.3.3)
    - packages/twentythree-skills/package.json (version 1.3.3)
    - packages/twentythree-cli/docs/commands/auth.md (includes switch)
    - packages/twentythree-cli/docs/commands/auth/switch.md (new)
    - packages/twentythree-skills/skills/SKILL.md (auth row updated)
---

# Quick Task 260508-dnq: Release v1.3.3

## Task 1: Regenerate CLI docs

**Files:** `packages/twentythree-cli/docs/commands/auth.md`, `packages/twentythree-cli/docs/commands/auth/switch.md`

**Action:**
Run the oclif readme generator to pick up the new `auth switch` command:

```bash
cd packages/twentythree-cli
pnpm build
pnpm exec oclif readme --multi --nested-topics-depth 2 --output-dir docs/commands --readme-path README.md --version 1.3.3
```

Verify `docs/commands/auth/switch.md` now exists and `docs/commands/auth.md` includes the switch entry.

If oclif readme fails or doesn't create switch.md, manually create `docs/commands/auth/switch.md` and update `docs/commands/auth.md` following the exact format of `docs/commands/auth/credentials.md`:

switch.md content:
```markdown
`twentythree auth:switch`
=========================

Switch the active workspace

* [`twentythree auth switch`](#twentythree-auth-switch)

## `twentythree auth switch`

Switch the active workspace

\`\`\`
USAGE
  $ twentythree auth switch

DESCRIPTION
  Switch the active workspace

EXAMPLES
  $ twentythree auth switch
\`\`\`

_See code: [src/commands/auth/switch.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/auth/switch.ts)_
```

For auth.md, add `switch` entry after `status` following the same pattern, and add `* [\`twentythree auth switch\`](#twentythree-auth-switch)` to the TOC at the top.

**Commit:** `docs: regenerate oclif command docs for auth switch (v1.3.3)`
**Verify:** docs/commands/auth/switch.md exists
**Done:** Auth docs include switch command

## Task 2: Update skills SKILL.md

**Files:** `packages/twentythree-skills/skills/SKILL.md`

**Action:**
On line 173 of SKILL.md (the auth row in the Meta Commands table), update:
```
| `auth` | `credentials`, `status` | Configure and verify bearer-token auth |
```
to:
```
| `auth` | `credentials`, `status`, `switch` | Configure and verify bearer-token auth |
```

**Commit:** `docs(skills): add auth switch to SKILL.md command index`
**Verify:** SKILL.md contains "switch" in auth row
**Done:** SKILL.md updated

## Task 3: Bump versions to 1.3.3

**Files:** `packages/twentythree-cli/package.json`, `packages/twentythree-skills/package.json`

**Action:**
In `packages/twentythree-cli/package.json`: change `"version": "1.3.1"` → `"version": "1.3.3"`
In `packages/twentythree-skills/package.json`: change `"version": "1.3.1"` → `"version": "1.3.3"`

**Commit:** `chore: bump versions to 1.3.3`
**Verify:** Both package.json files show 1.3.3
**Done:** Versions bumped

## Task 4: Run tests and create release tags

**Files:** none (validation + git tags)

**Action:**
1. Run CLI tests: `pnpm --filter twentythree-cli test --run` — must pass
2. Run skills tests: `pnpm --filter twentythree-skills test --run` — must pass
3. Create git tags:
   ```bash
   git tag v1.3.3
   git tag skills-v1.3.3
   ```

**DO NOT push tags** — the orchestrator will confirm with the user before pushing.

**Commit:** none (tags only)
**Verify:** `git tag | grep "1.3.3"` shows both tags
**Done:** Tags created, ready to push
