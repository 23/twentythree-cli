---
phase: 09-endpoint-coverage-audit
reviewed: 2026-04-16T00:00:00Z
depth: standard
files_reviewed: 23
files_reviewed_list:
  - packages/twentythree-cli/package.json
  - packages/twentythree-cli/scripts/audit-endpoints.mjs
  - packages/twentythree-cli/src/commands/analytics/live/weekday/timeseries.ts
  - packages/twentythree-cli/src/commands/analytics/live/weekday/totals.ts
  - packages/twentythree-cli/src/commands/analytics/usage/devices/timeseries.ts
  - packages/twentythree-cli/src/commands/analytics/usage/devices/totals.ts
  - packages/twentythree-cli/src/commands/analytics/usage/domains/totals.ts
  - packages/twentythree-cli/src/commands/analytics/usage/locations/totals.ts
  - packages/twentythree-cli/src/commands/analytics/usage/sourceids/totals.ts
  - packages/twentythree-cli/src/commands/analytics/usage/sources/totals.ts
  - packages/twentythree-cli/src/commands/analytics/usage/spots/timeseries.ts
  - packages/twentythree-cli/src/commands/analytics/usage/spots/totals.ts
  - packages/twentythree-cli/src/commands/analytics/usage/traffic/timeseries.ts
  - packages/twentythree-cli/src/commands/analytics/usage/traffic/totals.ts
  - packages/twentythree-cli/src/commands/analytics/video/performance/timeseries.ts
  - packages/twentythree-cli/src/commands/analytics/video/performance/totals.ts
  - packages/twentythree-cli/src/commands/analytics/video/published/timeseries.ts
  - packages/twentythree-cli/src/commands/analytics/video/published/totals.ts
  - packages/twentythree-cli/src/commands/analytics/video/weekday/timeseries.ts
  - packages/twentythree-cli/src/commands/analytics/video/weekday/totals.ts
  - packages/twentythree-cli/src/commands/video/frame.ts
  - packages/twentythree-cli/src/lib/__tests__/audit.test.ts
  - packages/twentythree-cli/src/lib/audit.ts
findings:
  critical: 0
  warning: 3
  info: 1
  total: 4
status: issues_found
---

# Phase 9: Code Review Report

**Reviewed:** 2026-04-16
**Depth:** standard
**Files Reviewed:** 23
**Status:** issues_found

## Summary

This phase introduced the endpoint coverage audit infrastructure (`audit-endpoints.mjs`, `src/lib/audit.ts`) plus 20 new analytics command files covering live/weekday, usage (devices, domains, locations, sourceids, sources, spots, traffic), and video (performance, published, weekday) endpoints, along with the `video frame` command.

The analytics commands are structurally sound and consistent. Two issues stand out as bugs that will cause incorrect audit results: a wrong HTTP method in `video/frame.ts` `agentMetadata` and a semantic misuse of `EXCLUDED_OPERATIONS` for entries that are not spec endpoints at all. A third warning covers a fragile regex in the audit script that silently misses double-quoted exclusions.

## Warnings

### WR-01: Wrong HTTP method in `video frame` agentMetadata causes false audit phantom

**File:** `packages/twentythree-cli/src/commands/video/frame.ts:25-29`

**Issue:** `agentMetadata.api_endpoint` is declared as `'GET /photo/frame'` but the command calls `this.apiClient.POST('/photo/frame', ...)` at line 48. The audit script uses `api_endpoint` to compute coverage. If the spec defines this as `POST /photo/frame`, the audit will flag `POST /photo/frame` as a gap (uncovered) and will never see a phantom for `GET /photo/frame` because `GET` does not appear in the spec. The command covers the wrong endpoint string for the entire audit lifetime.

**Fix:** Change `api_endpoint` to match the actual HTTP method used:
```typescript
static agentMetadata = {
  api_endpoint: 'POST /photo/frame',
  auth_scope: 'write' as const,
  output_shape: { type: 'key-value' as const },
  side_effects: 'updates' as const,
}
```

---

### WR-02: Two EXCLUDED_OPERATIONS entries are phantom commands, not excluded spec endpoints

**File:** `packages/twentythree-cli/src/lib/audit.ts:56-65`

**Issue:** The last two entries in `EXCLUDED_OPERATIONS` document endpoints that are "not in OpenAPI spec":

```typescript
{
  endpoint: 'POST /live/recording/split',
  reason: 'Endpoint not in OpenAPI spec; command references undocumented API',
  category: 'non-standard',
},
{
  endpoint: 'GET /user/tokens',
  reason: 'Not in OpenAPI spec; internal token management endpoint',
  category: 'internal',
},
```

`EXCLUDED_OPERATIONS` is semantically defined (line 17-21) as "spec endpoints intentionally not implemented as CLI commands." These two entries are the opposite: they are command `api_endpoint` values that have no corresponding spec entry — i.e., phantoms. Adding them to `EXCLUDED_OPERATIONS` suppresses the phantom report in the audit script (line 70: `!excludedEndpoints.has(e)`), which hides the fact that these commands reference undocumented endpoints. The correct mechanism for known non-API endpoints is the `KNOWN_NON_API` set in `scripts/audit-endpoints.mjs`.

If commands actually reference these undocumented endpoints (`POST /live/recording/split`, `GET /user/tokens`), they should be moved to `KNOWN_NON_API` so the audit script correctly categorizes them as intentional non-spec commands rather than silently eliding them from all reporting.

**Fix:** Remove the two entries from `EXCLUDED_OPERATIONS` in `audit.ts` and add the endpoint strings to `KNOWN_NON_API` in `scripts/audit-endpoints.mjs`:
```javascript
// audit-endpoints.mjs
const KNOWN_NON_API = new Set([
  'interactive',
  'local',
  'POST /live/recording/split',
  'GET /user/tokens',
])
```

---

### WR-03: Audit script regex for exclusions only matches single-quoted strings — silently misses double-quoted entries

**File:** `packages/twentythree-cli/scripts/audit-endpoints.mjs:57`

**Issue:** The script extracts exclusions from `audit.ts` using:
```javascript
for (const match of auditSrc.matchAll(/endpoint:\s*'([^']+)'/g)) {
```
This matches only single-quoted string literals. TypeScript is equally valid with double quotes. If a future developer adds an entry with double quotes (e.g., `endpoint: "GET /some/path"`), the exclusion will be silently ignored — the endpoint will appear as a gap in audit output and `process.exit(1)` will be triggered with no indication of why. There is no compile-time or lint enforcement requiring single quotes here.

**Fix:** Update the regex to match both quote styles:
```javascript
for (const match of auditSrc.matchAll(/endpoint:\s*['"]([^'"]+)['"]/g)) {
```

---

## Info

### IN-01: `audit-endpoints.mjs` regex for exclusions could match endpoint values inside comments or string literals

**File:** `packages/twentythree-cli/scripts/audit-endpoints.mjs:57`

**Issue:** The regex `/endpoint:\s*'([^']+)'/g` scans the raw text of `audit.ts`. If a developer writes a comment like `// endpoint: 'GET /old/path'` as documentation of a removed entry, the audit script will treat it as an active exclusion. This is low probability but the correct long-term fix is to import `EXCLUDED_OPERATIONS` directly in the audit script (possible since both are in the same package) rather than regex-parsing the source file.

**Fix (low priority):** Convert the script to import the array directly:
```javascript
// audit-endpoints.mjs (ESM)
import { EXCLUDED_OPERATIONS } from '../src/lib/audit.js'
const excludedEndpoints = new Set(EXCLUDED_OPERATIONS.map(e => e.endpoint))
```
This eliminates the text-parsing approach entirely and makes the audit script authoritative without fragile regex extraction. Requires the TypeScript source to be compiled first, or the script to use `tsx`/`ts-node` — worth noting as a follow-up.

---

_Reviewed: 2026-04-16_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
