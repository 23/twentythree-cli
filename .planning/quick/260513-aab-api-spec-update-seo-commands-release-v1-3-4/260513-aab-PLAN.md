---
quick_id: 260513-aab
slug: api-spec-update-seo-commands-release-v1-3-4
description: API spec updated — add seo commands (get, status, update), update SKILL.md, regenerate docs, bump versions to 1.3.4, run tests, create release tags
date: 2026-05-13
must_haves:
  truths:
    - seo get, seo status, seo update commands exist and call the correct POST endpoints
    - all commands have static agentMetadata with api_endpoint, auth_scope, output_shape, side_effects
    - CLI package.json version is 1.3.4
    - skills package.json version is 1.3.4
    - SKILL.md header says "241+" and "23 resource groups"
    - SKILL.md resource index includes seo row
    - docs/commands/seo.md and docs/commands/seo/ directory exist
    - all tests pass before tagging
    - git tags v1.3.4 and skills-v1.3.4 created locally
  artifacts:
    - packages/twentythree-cli/src/commands/seo/get.ts
    - packages/twentythree-cli/src/commands/seo/status.ts
    - packages/twentythree-cli/src/commands/seo/update.ts
    - packages/twentythree-cli/package.json (version 1.3.4)
    - packages/twentythree-skills/package.json (version 1.3.4)
    - packages/twentythree-skills/skills/SKILL.md (seo row added, counts updated)
    - packages/twentythree-cli/docs/commands/seo.md
---

# Quick Task 260513-aab: API Spec Update — SEO Commands + Release v1.3.4

## Task 1: Create seo commands

**Files:** `packages/twentythree-cli/src/commands/seo/get.ts`, `packages/twentythree-cli/src/commands/seo/status.ts`, `packages/twentythree-cli/src/commands/seo/update.ts`

**Action:**

Create `packages/twentythree-cli/src/commands/seo/` directory and three command files. No `index.ts` needed — oclif discovers by file path.

Model all three after the `setting/update.ts` POST pattern: extend `AuthenticatedCommand`, use `this.apiClient.POST('/seo/<verb>', { body: body as any, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })`.

**seo/get.ts** — `SeoGet`:
- `static description = 'Get SEO metadata for a video, webinar, or webinar series'`
- Flags: `object-id` (integer string, required), `fields` (string, optional — comma-separated fields to return)
- `static agentMetadata`: `api_endpoint: 'POST /seo/get'`, `auth_scope: 'read'`, `output_shape: { type: 'key-value' }`, `side_effects: 'none'`
- POST body: `{ object_id: Number(flags['object-id']), ...(flags.fields && { fields: flags.fields }) }`
- On success without --json: log `seo_title`, `seo_description`, `seo_keywords`, `state` fields from response data using `this.log()`
- On success with --json: return `formatJsonOutput({ ok: true, data, summary: 'SEO metadata', breadcrumbs: [{ domain }, { resource: 'seo', id: flags['object-id'] }] })`
- Examples: `<%= config.bin %> seo get --object-id 12345`, `<%= config.bin %> seo get --object-id 12345 --json`

**seo/status.ts** — `SeoStatus`:
- `static description = 'Get SEO readiness status for a video, webinar, or webinar series'`
- Flags: `object-id` (integer string, required), `fields` (string, optional)
- `static agentMetadata`: `api_endpoint: 'POST /seo/status'`, `auth_scope: 'read'`, `output_shape: { type: 'key-value' }`, `side_effects: 'none'`
- POST body: `{ object_id: Number(flags['object-id']), ...(flags.fields && { fields: flags.fields }) }`
- On success without --json: log `object_id`, `object_type`, `current_score`, `max_score`, `overall_state_label` fields
- On success with --json: return `formatJsonOutput({ ok: true, data, summary: 'SEO status', breadcrumbs: [{ domain }, { resource: 'seo', id: flags['object-id'] }] })`
- Examples: `<%= config.bin %> seo status --object-id 12345`, `<%= config.bin %> seo status --object-id 12345 --json`

**seo/update.ts** — `SeoUpdate`:
- `static description = 'Update SEO metadata for a video, webinar, or webinar series'`
- Flags: `object-id` (integer string, required), `seo-name` (string, optional), `seo-description` (string, optional), `seo-keywords` (string, optional), `canonical-url` (string, optional), `seo-policy` (string, optional — one of: "", "index", "noindex"), `enrich-immediately` (boolean, optional), `fields` (string, optional)
- `static agentMetadata`: `api_endpoint: 'POST /seo/update'`, `auth_scope: 'write'`, `output_shape: { type: 'message' }`, `side_effects: 'updates'`
- POST body: build from provided flags only (omit undefined flags), mapping CLI flag names to API param names: `seo-name` → `seo_name`, `seo-description` → `seo_description`, `seo-keywords` → `seo_keywords`, `canonical-url` → `canonical_url`, `seo-policy` → `seo_policy`, `enrich-immediately` → `enrich_immediately_p`
- On success without --json: `this.log(chalk.green('SEO metadata updated'))`
- On success with --json: return `formatJsonOutput({ ok: true, data, summary: 'SEO metadata updated', breadcrumbs: [{ domain }, { resource: 'seo', id: flags['object-id'] }] })`
- Examples: `<%= config.bin %> seo update --object-id 12345 --seo-name "My Video"`, `<%= config.bin %> seo update --object-id 12345 --seo-policy index --json`

All three files must import `{ Flags } from '@oclif/core'`, `chalk from 'chalk'`, `{ AuthenticatedCommand } from '../../lib/base-command.js'`, `{ formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'`.

**Commit:** `feat(seo): add seo get, status, update commands (v1.3.4)`

**Verify:** `ls packages/twentythree-cli/src/commands/seo/` shows get.ts, status.ts, update.ts

**Done:** Three seo command files exist with correct structure

---

## Task 2: Update SKILL.md

**Files:** `packages/twentythree-skills/skills/SKILL.md`

**Action:**

Make three edits to SKILL.md:

1. **Line 6 (YAML frontmatter description):** Change `"238+ API commands across 22 resource groups"` → `"241+ API commands across 23 resource groups"`

2. **Line 32 (blockquote header):** Change `238+ commands across 22 resource groups` → `241+ commands across 23 resource groups`

3. **After line 165 (user row, last row of the resource index table before the blank line leading to `## Meta Commands`):** Insert a new row for seo:
   ```
   | `seo` | `get`, `status`, `update` | SEO metadata management |
   ```
   The `user` row is currently the last row in the table. Insert the seo row after `user` and before the blank line that precedes `## Meta Commands`.

**Commit:** `docs(skills): add seo commands to SKILL.md resource index (v1.3.4)`

**Verify:** `grep -c 'seo' packages/twentythree-skills/skills/SKILL.md` returns at least 1; check line count updated to 23 resource groups

**Done:** SKILL.md mentions seo in resource index; header counts updated to 241+ and 23 groups

---

## Task 3: Bump versions to 1.3.4

**Files:** `packages/twentythree-cli/package.json`, `packages/twentythree-skills/package.json`

**Action:**

In `packages/twentythree-cli/package.json`: change `"version": "1.3.3"` → `"version": "1.3.4"`

In `packages/twentythree-skills/package.json`: change `"version": "1.3.3"` → `"version": "1.3.4"`

**Commit:** `chore: bump versions to 1.3.4`

**Verify:** Both package.json files contain `"version": "1.3.4"`

**Done:** Versions bumped to 1.3.4

---

## Task 4: Regenerate CLI docs

**Files:** `packages/twentythree-cli/docs/commands/seo.md`, `packages/twentythree-cli/docs/commands/seo/` (generated)

**Action:**

Build and regenerate docs to pick up the three new seo commands:

```bash
cd packages/twentythree-cli
pnpm build
pnpm exec oclif readme --multi --nested-topics-depth 2 --output-dir docs/commands --readme-path README.md --version 1.3.4
```

Verify `docs/commands/seo.md` exists after generation and contains entries for `seo get`, `seo status`, `seo update`. Also verify `README.md` is updated.

If the oclif readme command fails, manually create `docs/commands/seo.md` following the exact format of `docs/commands/setting.md` as a template — one heading per command with USAGE, FLAGS, DESCRIPTION, and EXAMPLES blocks.

**Commit:** `docs: regenerate oclif command docs for seo commands (v1.3.4)`

**Verify:** `ls packages/twentythree-cli/docs/commands/seo*` shows seo.md or seo/ directory

**Done:** Docs include seo command reference

---

## Task 5: Run tests and create release tags

**Files:** none (validation + git tags)

**Action:**

1. Run CLI tests: `pnpm --filter twentythree-cli test --run` — must pass
2. Run skills tests: `pnpm --filter twentythree-skills test --run` — must pass
3. Create git tags:
   ```bash
   git tag v1.3.4
   git tag skills-v1.3.4
   ```

**DO NOT push tags** — confirm with the user before pushing.

**Commit:** none (tags only)

**Verify:** `git tag | grep "1.3.4"` shows both `v1.3.4` and `skills-v1.3.4`

**Done:** All tests pass, both release tags created locally
