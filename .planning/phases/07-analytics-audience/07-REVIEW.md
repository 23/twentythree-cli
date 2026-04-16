---
phase: 07-analytics-audience
reviewed: 2026-04-16T00:00:00Z
depth: standard
files_reviewed: 44
files_reviewed_list:
  - packages/twentythree-cli/src/commands/analytics/__tests__/conversions.test.ts
  - packages/twentythree-cli/src/commands/analytics/__tests__/live.test.ts
  - packages/twentythree-cli/src/commands/analytics/__tests__/usage.test.ts
  - packages/twentythree-cli/src/commands/analytics/__tests__/video-index.test.ts
  - packages/twentythree-cli/src/commands/analytics/conversions/index.ts
  - packages/twentythree-cli/src/commands/analytics/conversions/timeseries.ts
  - packages/twentythree-cli/src/commands/analytics/conversions/totals.ts
  - packages/twentythree-cli/src/commands/analytics/live/event-timeseries.ts
  - packages/twentythree-cli/src/commands/analytics/live/event-totals.ts
  - packages/twentythree-cli/src/commands/analytics/live/event.ts
  - packages/twentythree-cli/src/commands/analytics/live/index.ts
  - packages/twentythree-cli/src/commands/analytics/live/timeseries.ts
  - packages/twentythree-cli/src/commands/analytics/live/totals.ts
  - packages/twentythree-cli/src/commands/analytics/live/weekday.ts
  - packages/twentythree-cli/src/commands/analytics/usage/devices.ts
  - packages/twentythree-cli/src/commands/analytics/usage/domains.ts
  - packages/twentythree-cli/src/commands/analytics/usage/locations.ts
  - packages/twentythree-cli/src/commands/analytics/usage/sourceids.ts
  - packages/twentythree-cli/src/commands/analytics/usage/sources.ts
  - packages/twentythree-cli/src/commands/analytics/usage/spots.ts
  - packages/twentythree-cli/src/commands/analytics/usage/storage.ts
  - packages/twentythree-cli/src/commands/analytics/usage/traffic.ts
  - packages/twentythree-cli/src/commands/analytics/video/index.ts
  - packages/twentythree-cli/src/commands/audience/__tests__/list.test.ts
  - packages/twentythree-cli/src/commands/audience/__tests__/mutations.test.ts
  - packages/twentythree-cli/src/commands/audience/__tests__/register.test.ts
  - packages/twentythree-cli/src/commands/audience/__tests__/search.test.ts
  - packages/twentythree-cli/src/commands/audience/companies.ts
  - packages/twentythree-cli/src/commands/audience/field/__tests__/set.test.ts
  - packages/twentythree-cli/src/commands/audience/field/list.ts
  - packages/twentythree-cli/src/commands/audience/field/remove.ts
  - packages/twentythree-cli/src/commands/audience/field/set.ts
  - packages/twentythree-cli/src/commands/audience/field/types.ts
  - packages/twentythree-cli/src/commands/audience/funnel.ts
  - packages/twentythree-cli/src/commands/audience/identity-sources.ts
  - packages/twentythree-cli/src/commands/audience/list-collectors.ts
  - packages/twentythree-cli/src/commands/audience/list.ts
  - packages/twentythree-cli/src/commands/audience/metrics.ts
  - packages/twentythree-cli/src/commands/audience/register.ts
  - packages/twentythree-cli/src/commands/audience/remove.ts
  - packages/twentythree-cli/src/commands/audience/search.ts
  - packages/twentythree-cli/src/commands/audience/timelines.ts
  - packages/twentythree-cli/src/commands/audience/unregister.ts
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 07: Code Review Report

**Reviewed:** 2026-04-16T00:00:00Z
**Depth:** standard
**Files Reviewed:** 44
**Status:** issues_found

## Summary

Reviewed 23 analytics commands (conversions, live, usage, video), 16 audience commands, and 5 audience field sub-commands, plus 5 test stub files. The analytics layer is well-structured with a consistent read-only pattern: GET endpoint, error guard, `any`-cast, table or key-value render, JSON output. No security issues were found.

The four warnings are behavioural correctness issues in the audience mutation commands: console output leaking into JSON mode and a missing input-validation guard on the destructive `remove` command. These will produce incorrect output in automation pipelines.

---

## Warnings

### WR-01: Human-readable output printed before JSON mode check in mutation commands

**Files:**
- `packages/twentythree-cli/src/commands/audience/register.ts:101`
- `packages/twentythree-cli/src/commands/audience/unregister.ts:59`
- `packages/twentythree-cli/src/commands/audience/remove.ts:71`
- `packages/twentythree-cli/src/commands/audience/field/remove.ts:64`

**Issue:** Each of these commands calls `this.log(chalk.green('...'))` unconditionally before the `if (this.jsonEnabled()) { return formatJsonOutput(...) }` block. When `--json` is passed, the human-readable success line is still written to stdout ahead of the JSON payload. This breaks machine parsing because stdout is no longer valid JSON.

The correct pattern used in the rest of the codebase (e.g. `video/update.ts`) is to guard the human output inside an `else` branch after the JSON return.

**Fix:**
```typescript
// register.ts, unregister.ts, remove.ts, field/remove.ts — same pattern for all four

if (this.jsonEnabled()) {
  return formatJsonOutput({
    ok: true,
    data,
    summary: 'Contact registered', // or whichever message applies
    breadcrumbs: [
      { domain: this.activeWorkspace.domain },
      { resource: 'audience' },
    ],
  })
}

// Only reached in non-JSON mode
this.log(chalk.green('Contact registered'))
if (uuid) this.log(`UUID:         ${uuid}`)
if (trackingUrl) this.log(`Tracking URL: ${trackingUrl}`)
```

---

### WR-02: `audience remove` allows an empty body on a destructive POST

**File:** `packages/twentythree-cli/src/commands/audience/remove.ts:57-65`

**Issue:** Neither `--email` nor `--uuid` is required. If the user runs `audience remove` and confirms the prompt, the command fires `POST /audience/remove` with an empty body `{}`. Depending on the API implementation this could silently succeed and remove nothing, or it could remove all contacts matching no criteria. Either outcome is wrong. The command has a confirmation prompt specifically because it is destructive, but the prompt fires even when no target is specified.

**Fix:** Add a guard after parsing flags, before the confirmation prompt:
```typescript
const { flags } = await this.parse(AudienceRemove)
this.printWorkspaceHeader()

if (!flags.email && !flags.uuid) {
  this.error('Provide --email or --uuid to identify the contact to remove.', { exit: EXIT_ERROR })
}

// existing confirmation prompt follows
```

---

### WR-03: `analytics usage storage` parses and silently ignores all filter and date flags

**File:** `packages/twentythree-cli/src/commands/analytics/usage/storage.ts:28-43`

**Issue:** The command declares `ANALYTICS_DATE_FLAGS` and `ANALYTICS_FILTER_FLAGS` in its static `flags` definition (lines 29-32), then calls `this.parse(AnalyticsUsageStorage)` and receives all flag values. However, the API call on line 39 takes no `params` argument — none of the parsed flags are passed to the request. The comment on line 13 acknowledges the API ignores date params, but the filter flags (`selection`, `groupby`, `orderby`, `order`) are also accepted in the CLI definition without being passed through, giving users false confidence that filtering works.

If the intent is to expose no filtering at all, remove the filter flag declarations. If the storage endpoint does accept some of them, pass them through.

**Fix (if no flags should be accepted):**
```typescript
// Remove ANALYTICS_FILTER_FLAGS from the import and the flags spread
static flags = {
  ...AuthenticatedCommand.baseFlags,
}
```

**Fix (if flags are accepted by the API):**
```typescript
const { data, error } = await this.apiClient.GET('/analytics/data/usage/storage', {
  params: {
    query: {
      selection: flags.selection,
      groupby: flags.groupby as any,
      orderby: flags.orderby as any,
      order: flags.order as any,
    },
  },
})
```

---

### WR-04: `audience/field/list` coerces `false` to `undefined` with `|| undefined` guard

**File:** `packages/twentythree-cli/src/commands/audience/field/list.ts:44`

**Issue:** The expression `flags['include-widget-html'] || undefined` converts an explicit `false` to `undefined`. For a boolean flag this means users can never explicitly pass `--no-include-widget-html` to opt out once the flag has a default of `true`. The flag is currently `required: false` with no default, so it defaults to `false`, and `false || undefined` becomes `undefined` which is harmless today. However, the `|| undefined` idiom is misleading and fragile — if a default of `true` is ever added, the negation form will silently stop working.

**Fix:** Use a proper boolean-to-undefined conversion:
```typescript
include_widget_html_p: flags['include-widget-html'] === true ? true : undefined,
```

---

## Info

### IN-01: All test files contain only `it.todo()` stubs — no executable assertions

**Files:**
- `packages/twentythree-cli/src/commands/analytics/__tests__/conversions.test.ts`
- `packages/twentythree-cli/src/commands/analytics/__tests__/live.test.ts`
- `packages/twentythree-cli/src/commands/analytics/__tests__/usage.test.ts`
- `packages/twentythree-cli/src/commands/analytics/__tests__/video-index.test.ts`
- `packages/twentythree-cli/src/commands/audience/__tests__/list.test.ts`
- `packages/twentythree-cli/src/commands/audience/__tests__/mutations.test.ts`
- `packages/twentythree-cli/src/commands/audience/__tests__/register.test.ts`
- `packages/twentythree-cli/src/commands/audience/__tests__/search.test.ts`
- `packages/twentythree-cli/src/commands/audience/field/__tests__/set.test.ts`

**Issue:** Nine test files exist solely as placeholder stubs. Vitest will report these as passed (todos are not failures), giving false confidence in CI. The mutation command tests are especially important to implement given the correctness issues found in WR-01 and WR-02.

**Fix:** Implement the highest-priority stubs first: `mutations.test.ts` (covers the WR-01 JSON leakage and WR-02 missing guard), then `register.test.ts` and `search.test.ts`.

---

### IN-02: `_flags` unused variable in `audience/identity-sources.ts` and `audience/field/types.ts`

**Files:**
- `packages/twentythree-cli/src/commands/audience/identity-sources.ts:31`
- `packages/twentythree-cli/src/commands/audience/field/types.ts:31`

**Issue:** Both commands destructure `flags` into `_flags` (underscore-prefixed to silence the linter) but those commands define no flags beyond `baseFlags`. The `parse()` call is still necessary to satisfy oclif's flag-parsing contract, but the assignment to `_flags` adds visual noise.

**Fix:** Either assign to `_` or simply call `await this.parse(ClassName)` without destructuring:
```typescript
await this.parse(AudienceIdentitySources)
```

---

### IN-03: `conversions/totals.ts` has identical column headers and row mapping to `conversions/index.ts`

**Files:**
- `packages/twentythree-cli/src/commands/analytics/conversions/index.ts:79-86`
- `packages/twentythree-cli/src/commands/analytics/conversions/totals.ts:79-86`

**Issue:** Both commands render `['Conversions', 'Views', 'Visits', 'Engagement']` and map the same four fields. If the API's `/conversions/totals` response shape differs from `/conversions` (e.g., includes a `period` field), the totals output would silently drop it. This is low risk today but worth noting if the API spec is consulted more closely.

**Fix:** Verify the `/analytics/data/conversions/totals` response schema against the OpenAPI spec and add a `Period` or `Date` column if the totals endpoint returns time-bucketed data.

---

_Reviewed: 2026-04-16T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
