# Updating the API Spec

## Overview

The TwentyThree API evolves over time. When the upstream OpenAPI spec changes, the CLI's type definitions and any affected commands need to be updated to stay in sync. This guide walks through the full update workflow — from downloading the latest spec to committing the changes.

## Prerequisites

- pnpm (workspace-level dependency management)
- Claude Code (for assisted command fixes)
- The repo cloned and dependencies installed (`pnpm install`)

## Step 1: Run the update script

From the repo root:

```bash
pnpm update-api-spec
```

Or from inside the CLI package directory:

```bash
cd packages/twentythree-cli && ./update-api-spec.sh
```

The script does three things:

1. Downloads the latest OpenAPI spec to `packages/twentythree-cli/specs/twentythree-api-swagger.json`
2. Prints a `git diff` of the spec file showing what changed
3. Runs `pnpm generate-types` to regenerate `src/api/types.ts` from the updated spec

## Step 2: Read the diff output

The script prints a raw `git diff` of the JSON spec file. When reading the diff, look for:

- **New `paths` entries** — new API endpoints that may need new CLI commands
- **Removed `paths` entries** — endpoints that no longer exist; existing commands may break
- **Changed `parameters` or `requestBody` under an existing path** — TypeScript errors will surface these when you compile
- **Changed `responses` shapes** — TypeScript errors will surface these too

Example: a new endpoint being added looks like this in the diff:

```diff
+    "/api/video/analytics/engagement": {
+      "get": {
+        "operationId": "getVideoAnalyticsEngagement",
+        "parameters": [...]
+      }
+    },
```

## Step 3: Apply changes with Claude Code

First, capture any TypeScript errors introduced by the updated types:

```bash
pnpm --filter twentythree-cli exec tsc --noEmit
```

Then:

1. Open a Claude Code session
2. Paste the diff output and any TypeScript errors into the session
3. Ask Claude to update affected command files and fix broken types

Note: The codebase may have pre-existing type errors unrelated to the spec change. Focus on errors that are newly introduced after running the update script — not pre-existing ones.

## Step 4: Verify

Run both checks to confirm the update is clean:

```bash
pnpm --filter twentythree-cli exec tsc --noEmit
pnpm --filter twentythree-cli test --run
```

Both should complete without new errors introduced by the spec update.

## Step 5: Commit

Commit these files together in a single commit:

- `packages/twentythree-cli/specs/twentythree-api-swagger.json` (updated spec)
- `packages/twentythree-cli/src/api/types.ts` (regenerated types)
- Any command files updated to match the new spec

Example commit message:

```
chore: update API spec and regenerate types (YYYY-MM-DD)
```
