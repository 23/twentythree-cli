---
quick_id: 260508-dhl
slug: add-auth-switch-command-to-re-select-act
description: Add auth switch command to re-select active workspace
date: 2026-05-08
must_haves:
  truths:
    - auth switch command exists at src/commands/auth/switch.ts
    - command lists all configured workspaces via p.select
    - active workspace is updated via setActiveWorkspace()
    - command errors gracefully when no workspaces are configured
    - test file exists at src/commands/auth/__tests__/switch.test.ts
  artifacts:
    - packages/twentythree-cli/src/commands/auth/switch.ts
    - packages/twentythree-cli/src/commands/auth/__tests__/switch.test.ts
---

# Quick Task 260508-dhl: Add auth switch command to re-select active workspace

## Task 1: Implement auth switch command

**Files:** `packages/twentythree-cli/src/commands/auth/switch.ts`

**Action:**
Create a new oclif command `auth switch` that:
- Extends `Command` directly (not `BaseCommand`) — it doesn't need workspace resolution since it's changing which workspace is active
- Imports `getWorkspaces`, `getActiveWorkspace`, `setActiveWorkspace` from `../../auth/workspace-config.js`
- Imports `* as p from '@clack/prompts'`
- In `run()`:
  1. Call `p.intro('Switch workspace')`
  2. Get workspaces via `getWorkspaces()`
  3. If workspaces is empty: call `this.error('No workspaces configured — run \`twentythree auth credentials\` first', { exit: 1 })`
  4. If workspaces.length === 1: log "Only one workspace configured: <display_name> (<domain>)" and return
  5. Get current active domain via `getActiveWorkspace()`
  6. Present `p.select` with all workspaces as options, label format: `"${w.display_name} (${w.domain})"`, appending ` [active]` to the currently active workspace's label
  7. Handle cancel with `p.isCancel` → `p.cancel('Cancelled')` and return
  8. Call `setActiveWorkspace(selectedDomain as string)`
  9. Find the selected workspace entry for display name
  10. Call `p.outro(\`Switched to \${selectedWorkspace.display_name} (\${selectedDomain})\`)`

Set static properties:
- `description = 'Switch the active workspace'`
- `examples = ['<%= config.bin %> auth switch']`
- `agentMetadata` with `api_endpoint: 'interactive'`, `auth_scope: 'none'`, `output_shape: { type: 'none' }`, `side_effects: 'updates'`

**Verify:** File exists and compiles (`pnpm --filter twentythree-cli exec tsc --noEmit`)
**Done:** `auth switch` command file created

## Task 2: Add tests for auth switch

**Files:** `packages/twentythree-cli/src/commands/auth/__tests__/switch.test.ts`

**Action:**
Create test file following the pattern from `credentials.test.ts`:
- Mock `../../../auth/workspace-config.js` with vi.mock
- Test cases:
  1. `errors when no workspaces configured` — `getWorkspaces` returns `[]`, verify command errors
  2. `shows only-one message when single workspace configured` — `getWorkspaces` returns 1 workspace
  3. `exports a Switch class with a run method` — basic smoke test that class is defined
  4. `marks active workspace in selection options` — verify label includes `[active]` for current workspace

**Verify:** `pnpm --filter twentythree-cli test --run` passes
**Done:** All tests pass
