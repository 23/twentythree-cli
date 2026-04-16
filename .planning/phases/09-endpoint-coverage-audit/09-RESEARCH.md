# Phase 9: Endpoint Coverage Audit - Research

**Researched:** 2026-04-16
**Domain:** OpenAPI spec coverage, audit script design, gap-fill command authoring
**Confidence:** HIGH

## Summary

Phase 9 closes coverage gaps between the 235 OpenAPI endpoints in the spec and the 215 unique `api_endpoint` values registered across 219 command files. The audit script reads source files directly (not the oclif manifest) and cross-references both directions: spec → commands (gaps) and commands → spec (phantoms). The live gap count confirmed by direct codebase analysis is 25 uncovered endpoints and 5 phantom `api_endpoint` values.

All 25 gaps are GET analytics sub-series endpoints (`/timeseries`, `/totals`) or video upload-token management endpoints. After classification, the analytics sub-series endpoints are strong candidates for new commands (same shape as existing siblings), while the token-management endpoints and the subtitle archive progress endpoint need evaluation for admin/internal classification. The 5 phantoms break down into 3 fixable wrong-method values (`GET /user/tokens`, `POST /live/recording/split`, `POST /photo/frame` — all should be corrected to match the spec), and 2 legitimate non-API values (`interactive`, `local`) that require audit script exclusion.

**Primary recommendation:** Write the audit script first to drive classification, then implement new commands for genuinely missing analytics sub-series endpoints and classify the token-management endpoints as excluded with documented rationale.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `EXCLUDED_OPERATIONS` is a TypeScript constant in source (e.g. `src/lib/audit.ts`), co-located with the audit logic. Type-checked, importable by the audit script directly.
- **D-02:** Each entry has three fields: `endpoint` (e.g. `'POST /foo'`), `reason` (human-readable rationale string), and `category` (machine-groupable label, e.g. `'admin-only'`, `'internal'`, `'deprecated'`, `'super-admin'`).
- **D-03:** New commands for confirmed gaps must meet the full hand-authored quality standard — typed flags, `--json` output, table rendering, `static agentMetadata`, oclif conventions. Same bar as existing 219 commands. No skeletons.
- **D-04:** Endpoints that are truly admin/super-scope or have no practical CLI use case are excluded with rationale (added to `EXCLUDED_OPERATIONS`) rather than forced into a command.
- **D-05:** The audit script checks BOTH directions — spec → commands (gaps) and commands → spec (phantoms).
- **D-06:** Phantoms cause the script to exit non-zero (same as gaps). A stale or mistyped `api_endpoint` is treated as an error, not a warning.
- **D-07:** Script design (location, pnpm command name, output format) is left to Claude's discretion — follow the pattern of `update-api-spec.sh` for location and the pnpm scripts convention in `package.json` for the runner.

### Claude's Discretion

- Script location, naming, and exact output format — follow existing patterns (`update-api-spec.sh` as a reference).
- Which `category` values to use in `EXCLUDED_OPERATIONS` — derive from the actual endpoints encountered.
- The order of gap-fill vs script-writing within the plan.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUDIT-01 | Developer can manually compare OpenAPI spec endpoints against `agentMetadata.api_endpoint` values across all command files to identify missing coverage | Audit script reads `specs/twentythree-api-swagger.json` and greps source for `api_endpoint` values; cross-references both directions |
| AUDIT-02 | All confirmed-missing commands are implemented; intentional omissions are documented with rationale until audit passes cleanly | 25 gaps identified; classification per gap provided below; new command pattern established |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Audit script execution | CLI tooling (Node.js script) | — | Reads local spec file and source files; no API call needed |
| Gap classification | Source constant (`EXCLUDED_OPERATIONS`) | — | Type-checked TypeScript; imported directly by audit script |
| New command implementation | CLI command layer | API (openapi-fetch) | Same tier as existing 219 commands |
| Phantom detection | Audit script | — | Pure set comparison; no runtime execution of commands |

## Standard Stack

### Core (all already installed — no new dependencies needed)
[VERIFIED: package.json in repo]

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@oclif/core` | ^4.10.5 | New command implementation | Established in all 219 commands |
| `openapi-fetch` | ^0.17.0 | Typed API calls in new commands | Already in dependencies |
| `typescript` | ^5.0.0 | Type checking, audit script typing | Established build toolchain |
| `vitest` | ^4.1.4 | Tests for audit script | Established test runner |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `node:fs` | built-in | Read spec JSON file in audit script | Always — no npm install needed |
| `node:path` | built-in | Resolve spec file path | Always — no npm install needed |
| `node:child_process` | built-in | Grep source files for api_endpoint values | Optional — can use `glob` + `fs.readFileSync` instead |

**Installation:** No new dependencies required.

## Architecture Patterns

### System Architecture Diagram

```
[twentythree-api-swagger.json]
        |
        | parse paths + methods
        v
[audit script: scripts/audit-endpoints.mjs]
        |                     |
        | spec_endpoints       | cmd_endpoints
        v                     v
[Set A: 235 endpoints]  [grep src/**/*.ts for api_endpoint]
        |                     |
        +------COMPARE--------+
              |         |
           GAPS       PHANTOMS
              |         |
     check EXCLUDED_OPERATIONS
              |
         exit 0 / exit 1
```

### Recommended Project Structure

```
packages/twentythree-cli/
├── scripts/
│   └── audit-endpoints.mjs          # audit script (mirrors update-api-spec.sh location convention)
├── src/
│   ├── lib/
│   │   └── audit.ts                 # EXCLUDED_OPERATIONS constant (D-01)
│   └── commands/
│       ├── analytics/
│       │   ├── live/
│       │   │   └── weekday/
│       │   │       ├── timeseries.ts  # NEW — gap fill
│       │   │       └── totals.ts      # NEW — gap fill
│       │   ├── usage/
│       │   │   ├── devices/
│       │   │   │   ├── timeseries.ts  # NEW — gap fill
│       │   │   │   └── totals.ts      # NEW — gap fill
│       │   │   ├── domains/
│       │   │   │   └── totals.ts      # NEW — gap fill
│       │   │   ├── locations/
│       │   │   │   └── totals.ts      # NEW — gap fill
│       │   │   ├── sourceids/
│       │   │   │   └── totals.ts      # NEW — gap fill
│       │   │   ├── sources/
│       │   │   │   └── totals.ts      # NEW — gap fill
│       │   │   ├── spots/
│       │   │   │   ├── timeseries.ts  # NEW — gap fill
│       │   │   │   └── totals.ts      # NEW — gap fill
│       │   │   └── traffic/
│       │   │       ├── timeseries.ts  # NEW — gap fill
│       │   │       └── totals.ts      # NEW — gap fill
│       │   └── video/
│       │       ├── performance/
│       │       │   ├── timeseries.ts  # NEW — gap fill
│       │       │   └── totals.ts      # NEW — gap fill
│       │       ├── published/
│       │       │   ├── timeseries.ts  # NEW — gap fill
│       │       │   └── totals.ts      # NEW — gap fill
│       │       └── weekday/
│       │           ├── timeseries.ts  # NEW — gap fill
│       │           └── totals.ts      # NEW — gap fill
│       └── video/
│           └── frame.ts               # FIX — change api_endpoint POST→GET
```

### Pattern 1: Audit Script (mjs, mirrors update-api-spec.sh style)
[VERIFIED: codebase inspection]

The existing `update-api-spec.sh` uses:
- `#!/usr/bin/env bash` + `set -euo pipefail`
- `SCRIPT_DIR` for portability
- Section headers (`=== Changes ===`, `=== Done ===`)
- Exits non-zero on failure via `set -e`

For the audit script, use `.mjs` (Node.js ES module) since it needs to parse JSON and grep TypeScript source — no bash `jq` dependency needed. Follow the same output style.

```javascript
// Source: packages/twentythree-cli/scripts/audit-endpoints.mjs
// Run as: node scripts/audit-endpoints.mjs
// Wire as: "audit-endpoints": "node scripts/audit-endpoints.mjs" in package.json scripts

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'node:fs' // or use glob package — node 22 has globSync

const __dirname = dirname(fileURLToPath(import.meta.url))

// 1. Load spec
const specPath = resolve(__dirname, '../specs/twentythree-api-swagger.json')
const spec = JSON.parse(readFileSync(specPath, 'utf8'))

// 2. Extract spec endpoints
const specEndpoints = new Set()
for (const [path, methods] of Object.entries(spec.paths ?? {})) {
  for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
    if (method in methods) specEndpoints.add(`${method.toUpperCase()} ${path}`)
  }
}

// 3. Extract command api_endpoint values from source
// grep -r "api_endpoint: '" src/commands --include="*.ts"
// Parse with regex: /api_endpoint:\s*'([^']+)'/
// ...

// 4. Load EXCLUDED_OPERATIONS from src/lib/audit.ts (import at top)
// import { EXCLUDED_OPERATIONS } from '../src/lib/audit.js'
// Note: script is .mjs, audit.ts compiles to .js under dist/ — or use ts-node/tsx

// 5. Compare, report, exit
```

**Key implementation detail for the audit script:** The script reads source `.ts` files with regex rather than importing compiled output. This avoids requiring a prior build step and matches the CONTEXT.md instruction that "the audit script should NOT depend on `oclif.manifest.json`." However, `EXCLUDED_OPERATIONS` IS a TypeScript constant (D-01) — the script should parse it from source with regex or use `tsx`/`ts-node` to import it directly.

**Recommended approach:** Use `tsx` (already a transitive dev dep in many projects) or parse `EXCLUDED_OPERATIONS` from `src/lib/audit.ts` source via regex. Confirm `tsx` availability before choosing.

### Pattern 2: New Analytics Sub-Series Command (gap fill)
[VERIFIED: codebase inspection of `src/commands/analytics/usage/devices.ts`]

All 18 analytics gap endpoints are sub-series of existing parent endpoints. Each follows an identical pattern to existing siblings. Template:

```typescript
// Source: packages/twentythree-cli/src/commands/analytics/usage/devices.ts (verified pattern)
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../../lib/output.js'
import { applyCliTerms } from '../../../../lib/term-map.js'
import { ANALYTICS_DATE_FLAGS, ANALYTICS_FILTER_FLAGS } from '../../../../lib/analytics-flags.js'

export default class AnalyticsUsageDevicesTimeseries extends AuthenticatedCommand<typeof AnalyticsUsageDevicesTimeseries> {
  static description = 'Get usage analytics by device type - time series'
  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /analytics/data/usage/devices/timeseries',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Date', 'Plays', 'Engagement', 'Traffic'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    ...ANALYTICS_DATE_FLAGS,
    ...ANALYTICS_FILTER_FLAGS,
  }

  public async run(): Promise<void | object> {
    // ... same structure as devices.ts parent
  }
}
```

### Pattern 3: EXCLUDED_OPERATIONS Type
[VERIFIED: CONTEXT.md D-01, D-02]

```typescript
// Source: packages/twentythree-cli/src/lib/audit.ts
export interface ExcludedOperation {
  endpoint: string       // e.g. 'GET /photo/get-upload-token'
  reason: string         // human-readable rationale
  category: 'admin-only' | 'internal' | 'deprecated' | 'super-admin' | 'non-standard'
}

export const EXCLUDED_OPERATIONS: ExcludedOperation[] = [
  // ... entries added after gap classification
]
```

### Anti-Patterns to Avoid

- **Reading `oclif.manifest.json` for coverage:** The manifest only exists after a build; source grep is the correct approach per CONTEXT.md.
- **Importing compiled `.js` from `dist/` in the audit script:** Requires a prior build. Grep source `.ts` files instead for `api_endpoint` values.
- **Treating `interactive` and `local` as phantoms:** These are legitimate non-API commands (`auth credentials`, `auth status`, `workspace use`, `workspace list`). The audit script MUST exclude them — add them to a hardcoded `KNOWN_NON_API` set rather than `EXCLUDED_OPERATIONS` (which is for spec endpoints, not CLI-only commands).
- **Skeleton commands with no implementation:** D-03 prohibits this. Every new command must be fully implemented.

## Complete Gap Inventory
[VERIFIED: direct codebase + spec cross-reference]

### 18 Analytics Sub-Series Gaps — Implement as new commands

All share identical query parameters (date_start, date_end, date_expression, selection, resolve_recordings_p, etc.) and follow the timeseries/totals sibling pattern already established in `analytics/video/timeseries.ts`, `analytics/video/totals.ts`, etc.

| Endpoint | Spec Summary | Suggested Command | Command Path |
|----------|-------------|-------------------|--------------|
| `GET /analytics/data/live/weekday/timeseries` | Webinar analytics by weekday - Time Series | `analytics webinar weekday timeseries` | `analytics/live/weekday/timeseries.ts` |
| `GET /analytics/data/live/weekday/totals` | Webinar analytics by weekday - Totals | `analytics webinar weekday totals` | `analytics/live/weekday/totals.ts` |
| `GET /analytics/data/usage/devices/timeseries` | Analytics by device - Time Series | `analytics usage devices timeseries` | `analytics/usage/devices/timeseries.ts` |
| `GET /analytics/data/usage/devices/totals` | Analytics by device - Totals | `analytics usage devices totals` | `analytics/usage/devices/totals.ts` |
| `GET /analytics/data/usage/domains/totals` | Analytics by embed domain - Totals | `analytics usage domains totals` | `analytics/usage/domains/totals.ts` |
| `GET /analytics/data/usage/locations/totals` | Analytics by location - Totals | `analytics usage locations totals` | `analytics/usage/locations/totals.ts` |
| `GET /analytics/data/usage/sourceids/totals` | Analytics by source ID - Totals | `analytics usage sourceids totals` | `analytics/usage/sourceids/totals.ts` |
| `GET /analytics/data/usage/sources/totals` | Analytics by source - Totals | `analytics usage sources totals` | `analytics/usage/sources/totals.ts` |
| `GET /analytics/data/usage/spots/timeseries` | Spot analytics - Time Series | `analytics usage spots timeseries` | `analytics/usage/spots/timeseries.ts` |
| `GET /analytics/data/usage/spots/totals` | Spot analytics - Totals | `analytics usage spots totals` | `analytics/usage/spots/totals.ts` |
| `GET /analytics/data/usage/traffic/timeseries` | Traffic analytics - Time Series | `analytics usage traffic timeseries` | `analytics/usage/traffic/timeseries.ts` |
| `GET /analytics/data/usage/traffic/totals` | Traffic analytics - Totals | `analytics usage traffic totals` | `analytics/usage/traffic/totals.ts` |
| `GET /analytics/data/videos/performance/timeseries` | Playthrough performance - Time Series | `analytics video performance timeseries` | `analytics/video/performance/timeseries.ts` |
| `GET /analytics/data/videos/performance/totals` | Playthrough performance - Totals | `analytics video performance totals` | `analytics/video/performance/totals.ts` |
| `GET /analytics/data/videos/published/timeseries` | Video analytics by publish date - Time Series | `analytics video published timeseries` | `analytics/video/published/timeseries.ts` |
| `GET /analytics/data/videos/published/totals` | Video analytics by publish date - Totals | `analytics video published totals` | `analytics/video/published/totals.ts` |
| `GET /analytics/data/videos/weekday/timeseries` | Video analytics by weekday - Time Series | `analytics video weekday timeseries` | `analytics/video/weekday/timeseries.ts` |
| `GET /analytics/data/videos/weekday/totals` | Video analytics by weekday - Totals | `analytics video weekday totals` | `analytics/video/weekday/totals.ts` |

**Note on routing:** The existing `analytics/live/` directory maps to spec `/analytics/data/live/`. The new weekday sub-series go under `analytics/live/weekday/`. The CLI commands should use `analytics webinar weekday timeseries` (matching the `webinar` CLI topic) not `analytics live weekday`.

### 7 Non-Analytics Gaps — Classify as excluded or implement

| Endpoint | Spec Summary | Classification | Rationale |
|----------|-------------|----------------|-----------|
| `GET /photo/frame` | Extract frame (JPEG image) | [ASSUMED] Possibly implement | The spec has this as GET; the command `video frame` has `POST /photo/frame` — this is a phantom fix (the command exists, wrong method) |
| `GET /photo/get-upload-token` | Get upload token | [ASSUMED] Exclude — internal | Token delegation endpoints serve server-to-server workflows, not CLI use cases |
| `GET /photo/get-replace-token` | Get replace token | [ASSUMED] Exclude — internal | Same as above; used by external upload flows |
| `GET /photo/get-update-token` | Get update token | [ASSUMED] Exclude — internal | Same as above; used by external update flows |
| `POST /photo/delete-upload-token` | Delete video by upload token | [ASSUMED] Exclude — internal | Counterpart to get-upload-token; no CLI use case |
| `POST /photo/update-upload-token` | Update video by upload token | [ASSUMED] Exclude — internal | Update video metadata using upload token; no practical CLI use case |
| `POST /photo/subtitle/archive/get-progress` | Get archive transcription progress | [ASSUMED] Implement | The command `video subtitle archive --progress` already calls this endpoint but registers `api_endpoint: 'POST /photo/subtitle/archive/transcribe'` — this is a dual-endpoint command that omits the progress endpoint from agentMetadata; fix by splitting into two commands OR add second agentMetadata registration |

## Complete Phantom Inventory
[VERIFIED: direct codebase + spec cross-reference]

| Phantom api_endpoint | Command | Issue | Resolution |
|---------------------|---------|-------|------------|
| `POST /photo/frame` | `src/commands/video/frame.ts` | Spec has `GET /photo/frame`, not POST | Change `api_endpoint` to `'GET /photo/frame'` |
| `POST /live/recording/split` | `src/commands/webinar/recording/split.ts` | `/live/recording/split` is not in spec (start/stop/status exist, split does not) | Verify if endpoint exists in API but not in spec; if not, exclude with `category: 'internal'` |
| `GET /user/tokens` | `src/commands/user/tokens.ts` | Not in spec; comment in source confirms "not in OpenAPI swagger spec" | Add to `EXCLUDED_OPERATIONS` with `category: 'internal'` |
| `interactive` | `src/commands/auth/credentials.ts` | Intentional non-API marker | Add to `KNOWN_NON_API` in audit script (not `EXCLUDED_OPERATIONS`) |
| `local` | `src/commands/auth/status.ts`, `workspace/use.ts`, `workspace/list.ts` | Intentional non-API marker | Add to `KNOWN_NON_API` in audit script (not `EXCLUDED_OPERATIONS`) |

**Critical distinction:** `interactive` and `local` are NOT spec endpoints at all — they are sentinel values for CLI-only commands. `EXCLUDED_OPERATIONS` holds spec endpoints that are intentionally not implemented. The audit script needs a separate `KNOWN_NON_API` set (hardcoded in the script, not in `src/lib/audit.ts`) to skip these without treating them as phantoms.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Spec JSON parsing | Custom parser | `JSON.parse(readFileSync(...))` | The spec is already local; no library needed |
| File globbing in audit script | Custom walker | `node:fs` `readdirSync` recursive OR `glob` (already transitive dep) | Node 22 has native glob support |
| TypeScript parsing for api_endpoint extraction | Full AST parser | Regex on source files | `api_endpoint` appears in a consistent pattern; regex is sufficient and has no build dependency |

**Key insight:** The audit script intentionally reads source files with regex rather than importing compiled output. This keeps it runnable without a prior build and independent of the manifest.

## Common Pitfalls

### Pitfall 1: Manifest vs. Source for api_endpoint values
**What goes wrong:** Audit script reads `oclif.manifest.json` which only exists after `pnpm build` — script fails in clean checkouts.
**Why it happens:** The manifest is the "official" command registry but has a build prerequisite.
**How to avoid:** Grep `.ts` source files directly for `api_endpoint: '...'` with a regex.
**Warning signs:** Script fails with "file not found" on `oclif.manifest.json`.

### Pitfall 2: Treating non-API sentinel values as phantoms
**What goes wrong:** `interactive` and `local` appear as phantoms because they are not in the spec. Script exits non-zero even though these are intentional.
**Why it happens:** The phantom check compares all `api_endpoint` values against the spec. Non-API commands use sentinel values.
**How to avoid:** Hardcode a `KNOWN_NON_API` set in the audit script: `['interactive', 'local']`. These are skipped before phantom comparison.
**Warning signs:** Audit exits 1 on a freshly audited codebase.

### Pitfall 3: Wrong method for video/frame phantom
**What goes wrong:** `video frame` command has `api_endpoint: 'POST /photo/frame'` but the spec only has `GET /photo/frame`. The spec GET is in the gap list AND `POST /photo/frame` appears as a phantom.
**Why it happens:** The command was implemented with wrong method in agentMetadata; the actual API call may be correct.
**How to avoid:** Fix `api_endpoint` to `'GET /photo/frame'`. Verify the command's `this.apiClient.GET(...)` or `this.apiClient.POST(...)` call matches the spec method.
**Warning signs:** Same endpoint appears in both gaps and phantoms with swapped methods.

### Pitfall 4: Dual-endpoint commands (subtitle archive)
**What goes wrong:** `video subtitle archive` calls BOTH `POST /photo/subtitle/archive/transcribe` AND `POST /photo/subtitle/archive/get-progress` depending on the `--progress` flag. Only the `transcribe` endpoint is in `agentMetadata`. The `get-progress` endpoint shows as a gap.
**Why it happens:** agentMetadata supports one `api_endpoint` per command; dual-mode commands can only register one.
**How to avoid:** Either split into two separate commands (`video subtitle archive` + `video subtitle archive-progress`), or add `get-progress` to `EXCLUDED_OPERATIONS` with rationale noting it is covered by the dual-mode `video subtitle archive --progress`.
**Warning signs:** Spec endpoint `POST /photo/subtitle/archive/get-progress` appears in gaps despite functional CLI coverage.

### Pitfall 5: Analytics command topic routing
**What goes wrong:** The spec uses `live` for webinar analytics (`/analytics/data/live/...`) but the CLI uses `webinar` as the user-facing topic. New gap commands in `analytics/live/weekday/` must match the existing routing convention.
**Why it happens:** The CLI applies terminology mapping (`live` → `webinar`) at the command organization level. The `agentMetadata.api_endpoint` still uses the raw spec path.
**How to avoid:** Follow the existing `analytics/live/` directory for command files; the oclif topic `analytics live weekday` maps to CLI commands rooted at `analytics live` per the existing pattern.

## Code Examples

### Audit Script: Core comparison logic
```javascript
// Source: direct codebase analysis — verified pattern

// KNOWN_NON_API: sentinel values used by CLI-only commands, not spec endpoints
const KNOWN_NON_API = new Set(['interactive', 'local'])

// Extract api_endpoint values from source files via regex
function extractCmdEndpoints(srcDir) {
  const results = new Set()
  // Recursively read .ts files (excluding test files)
  for (const tsFile of globTsFiles(srcDir)) {
    const content = readFileSync(tsFile, 'utf8')
    const matches = content.matchAll(/api_endpoint:\s*'([^']+)'/g)
    for (const m of matches) {
      results.add(m[1])
    }
  }
  return results
}

// Load EXCLUDED_OPERATIONS from compiled audit.ts or parse from source
// Best option: tsx --import for direct TypeScript import
// Fallback: parse src/lib/audit.ts with regex to extract endpoint strings

// Compare
const gaps = [...specEndpoints].filter(e => !cmdEndpoints.has(e) && !excludedSet.has(e))
const phantoms = [...cmdEndpoints].filter(e => !specEndpoints.has(e) && !KNOWN_NON_API.has(e) && !excludedSet.has(e))

// Output
console.log(`Covered: ${specEndpoints.size - gaps.size - excludedSet.size}`)
console.log(`Gaps:    ${gaps.length}`)
console.log(`Excluded: ${excludedSet.size}`)
console.log(`Phantoms: ${phantoms.length}`)

if (gaps.length > 0 || phantoms.length > 0) process.exit(1)
```

### New Command: Analytics timeseries sub-series (gap fill template)
```typescript
// Derived from: packages/twentythree-cli/src/commands/analytics/usage/devices.ts
// All 18 analytics gap commands follow this exact shape

import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../../lib/output.js'
import { applyCliTerms } from '../../../../lib/term-map.js'
import { ANALYTICS_DATE_FLAGS, ANALYTICS_FILTER_FLAGS } from '../../../../lib/analytics-flags.js'

export default class AnalyticsUsageDevicesTimeseries extends AuthenticatedCommand<typeof AnalyticsUsageDevicesTimeseries> {
  static description = 'Get usage analytics by device type - time series'
  static enableJsonFlag = true

  static agentMetadata = {
    api_endpoint: 'GET /analytics/data/usage/devices/timeseries',
    auth_scope: 'read' as const,
    output_shape: { type: 'table' as const, columns: ['Date', 'Device', 'Plays', 'Engagement'] },
    side_effects: 'none' as const,
  }

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    ...ANALYTICS_DATE_FLAGS,
    ...ANALYTICS_FILTER_FLAGS,
  }

  public async run(): Promise<void | object> {
    const { flags } = await this.parse(AnalyticsUsageDevicesTimeseries)
    this.printWorkspaceHeader()

    const { data, error } = await this.apiClient.GET('/analytics/data/usage/devices/timeseries', {
      params: {
        query: {
          date_start: flags['date-start'],
          date_end: flags['date-end'],
          date_expression: flags['date-expression'],
          selection: flags.selection,
        },
      },
    })

    if (error) this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })

    const resp = data as any
    const rows: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true, data: rows,
        summary: `${rows.length} row(s)`,
        breadcrumbs: [{ domain: this.activeWorkspace.domain }, { resource: 'analytics' }],
      })
    }

    if (rows.length === 0) { this.log('No data found.'); return }
    // Inspect actual response shape to finalize column names
    const headers = ['Date', 'Device', 'Plays', 'Engagement']
    const tableRows = rows.map((r: any) => [
      String(r.date ?? r.datestart ?? ''),
      String(r.device ?? ''),
      String(r.plays ?? ''),
      String(r.engagement ?? ''),
    ])
    this.log(renderTable(headers, tableRows).toString())
    this.log(chalk.dim(`${rows.length} row(s)`))
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual audit (developer eyeballs spec vs. ls output) | Script-driven comparison with exit code | Phase 9 | Repeatable, CI-ready |
| keytar for credential storage | @napi-rs/keyring | Pre-existing | Already migrated |

**Note from REQUIREMENTS.md:** CI gate (`scripts/audit-endpoints.mjs` with exit code 1 on gaps) is deferred to v1.2. Phase 9 produces the script but it does not need to run in CI yet.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Token-management endpoints (`get-upload-token`, `get-replace-token`, `get-update-token`, `delete-upload-token`, `update-upload-token`) have no practical CLI use case and should be excluded | Gap Inventory | If these are needed for CLI workflows, they require commands — adds 5 more commands to scope |
| A2 | `POST /live/recording/split` does not exist in the API (not just missing from spec) | Phantom Inventory | If the endpoint exists but is undocumented, the command is correct and needs a spec update note, not removal |
| A3 | `tsx` is available as a transitive dev dependency for running the TypeScript audit file | Architecture Patterns | If not available, audit script must parse `EXCLUDED_OPERATIONS` from source with regex instead of importing it |
| A4 | The 18 analytics sub-series endpoints return the same data shape as their parent endpoints (timeseries/totals) | Gap Inventory | If shapes differ, column names in `output_shape` and table rendering need per-endpoint tuning |

## Open Questions (RESOLVED)

1. **Should `video subtitle archive --progress` be split into two commands?**
   - What we know: The command handles two endpoints via a flag; only one is in agentMetadata; the gap is `POST /photo/subtitle/archive/get-progress`
   - What's unclear: Whether splitting is preferred or excluding the progress endpoint is acceptable per D-04
   - Recommendation: Planner should split into two commands to preserve the one-command/one-endpoint pattern unless user feedback says otherwise
   - **RESOLVED:** Exclusion approach chosen — Plan 09-01 adds `POST /photo/subtitle/archive/get-progress` to `EXCLUDED_OPERATIONS` with `reason: "Covered by video subtitle archive --progress flag (dual-endpoint command)"`, `category: 'non-standard'`. No split needed per D-04.

2. **Is `POST /live/recording/split` a real endpoint?**
   - What we know: It is NOT in `twentythree-api-swagger.json`; the command source says nothing about it being undocumented
   - What's unclear: Whether the endpoint exists in the live API but is missing from the spec
   - Recommendation: Check TwentyThree API docs or test the endpoint; if it exists, add spec note; if not, exclude the command or remove it
   - **RESOLVED:** Treated as phantom (not in spec) — Plan 09-01 adds `POST /live/recording/split` to `EXCLUDED_OPERATIONS` with `reason: "Not present in OpenAPI spec; command api_endpoint appears to be non-standard or internal"`, `category: 'internal'`.

3. **`tsx` availability for TypeScript import in audit script**
   - What we know: `tsx` is not in `devDependencies` in `packages/twentythree-cli/package.json`
   - What's unclear: Whether it's available as a transitive dep or needs adding
   - Recommendation: Verify with `node_modules/.bin/tsx --version` before writing the script; fall back to regex parsing if absent
   - **RESOLVED:** Regex parsing approach chosen — Plan 09-01 Task 2 reads `src/lib/audit.ts` source text and extracts endpoint strings with regex. No `tsx` import needed.

## Environment Availability
[VERIFIED: direct inspection]

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Audit script | ✓ | v22.22.2 | — |
| openapi-fetch | New command API calls | ✓ | ^0.17.0 | — |
| TypeScript source grep | Audit script | ✓ | built-in regex | — |
| `tsx` | Importing `EXCLUDED_OPERATIONS` TypeScript in audit script | Unknown | — | Parse source with regex |
| `twentythree-api-swagger.json` | Audit script spec source | ✓ | Local file | — |

**Missing dependencies with no fallback:** None that block execution.

**Missing dependencies with fallback:**
- `tsx`: If unavailable, audit script parses `EXCLUDED_OPERATIONS` endpoints from `src/lib/audit.ts` source via regex instead of importing it. This is slightly less safe (string parsing vs. type-checked constant) but fully functional.

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
| AUDIT-01 | Audit script exits 0 when no gaps or phantoms | integration (script execution) | `node packages/twentythree-cli/scripts/audit-endpoints.mjs` | ❌ Wave 0 |
| AUDIT-01 | Audit script exits 1 and lists gaps when gaps exist | unit (audit logic) | `pnpm --filter twentythree-cli test --run src/lib/__tests__/audit.test.ts` | ❌ Wave 0 |
| AUDIT-02 | Each new command has `api_endpoint` matching the spec | unit (agentMetadata check) | verified by audit script itself + tsc | ❌ Wave 0 |
| AUDIT-02 | `EXCLUDED_OPERATIONS` entries have required fields | unit (TypeScript compilation) | `pnpm --filter twentythree-cli exec tsc --noEmit` | ✓ (tsc) |

### Sampling Rate
- **Per task commit:** `pnpm --filter twentythree-cli exec tsc --noEmit`
- **Per wave merge:** `pnpm --filter twentythree-cli test --run`
- **Phase gate:** Audit script exits 0 before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `packages/twentythree-cli/scripts/audit-endpoints.mjs` — the audit script itself (AUDIT-01)
- [ ] `packages/twentythree-cli/src/lib/audit.ts` — `EXCLUDED_OPERATIONS` constant (D-01)
- [ ] `packages/twentythree-cli/src/lib/__tests__/audit.test.ts` — unit tests for audit comparison logic

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | — |
| V3 Session Management | No | — |
| V4 Access Control | No | — |
| V5 Input Validation | No | Audit script reads local files only; no user input |
| V6 Cryptography | No | — |

**Note:** This phase is purely a tooling/code phase. No new API authentication paths, no user input surfaces, no secrets handling. Security domain is not applicable beyond existing patterns in new commands (which inherit `AuthenticatedCommand` as all API commands do).

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: `packages/twentythree-cli/src/commands/**/*.ts` — all 254 command files, agentMetadata extraction
- Direct spec inspection: `packages/twentythree-cli/specs/twentythree-api-swagger.json` — 235 endpoint enumeration
- Direct cross-reference: Python script comparing spec endpoints vs command api_endpoint values — 25 gaps, 5 phantoms confirmed
- `packages/twentythree-cli/src/commands/analytics/usage/devices.ts` — command pattern template
- `packages/twentythree-cli/src/lib/base-command.ts` — AgentMetadata interface definition
- `packages/twentythree-cli/update-api-spec.sh` — script style reference
- `packages/twentythree-cli/package.json` — scripts convention for `pnpm` runner wiring
- `.planning/phases/09-endpoint-coverage-audit/09-CONTEXT.md` — all locked decisions

### Secondary (MEDIUM confidence)
- None required — all findings are from direct codebase verification.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Gap/phantom inventory: HIGH — verified by direct Python script against live codebase and spec
- Command implementation pattern: HIGH — verified against 5 existing command files
- Audit script design: MEDIUM — pattern derived from update-api-spec.sh; exact Node.js implementation is new
- Gap classification (exclude vs. implement for token endpoints): LOW — marked [ASSUMED], needs planner/user confirmation

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (spec is locally pinned; only changes if `pnpm update-api-spec` is run)
