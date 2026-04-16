# Phase 7: Analytics & Audience - Pattern Map

**Mapped:** 2026-04-16
**Files analyzed:** 36 new files (6 analytics/live, 2 analytics/conversions, 8 analytics/usage, 11 audience root, 4 audience/field)
**Analogs found:** 36 / 36

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `analytics/live/timeseries.ts` | command | request-response | `analytics/video/timeseries.ts` | exact |
| `analytics/live/totals.ts` | command | request-response | `analytics/video/totals.ts` | exact |
| `analytics/live/weekday.ts` | command | request-response | `analytics/video/weekday.ts` | exact |
| `analytics/live/event.ts` | command | request-response | `analytics/video/performance.ts` | exact |
| `analytics/live/event-timeseries.ts` | command | request-response | `analytics/video/timeseries.ts` | exact |
| `analytics/live/event-totals.ts` | command | request-response | `analytics/video/totals.ts` | exact |
| `analytics/conversions/timeseries.ts` | command | request-response | `analytics/video/timeseries.ts` | exact |
| `analytics/conversions/totals.ts` | command | request-response | `analytics/video/totals.ts` | exact |
| `analytics/usage/devices.ts` | command | request-response | `analytics/video/performance.ts` | exact |
| `analytics/usage/domains.ts` | command | request-response | `analytics/video/performance.ts` | exact |
| `analytics/usage/locations.ts` | command | request-response | `analytics/video/performance.ts` | exact |
| `analytics/usage/sources.ts` | command | request-response | `analytics/video/performance.ts` | exact |
| `analytics/usage/sourceids.ts` | command | request-response | `analytics/video/performance.ts` | exact |
| `analytics/usage/spots.ts` | command | request-response | `analytics/video/performance.ts` | exact |
| `analytics/usage/storage.ts` | command | request-response | `analytics/video/totals.ts` | role-match (no date params) |
| `analytics/usage/traffic.ts` | command | request-response | `analytics/video/performance.ts` | exact |
| `audience/list.ts` | command | request-response | `analytics/video/performance.ts` | role-match (GET list with direct pagination) |
| `audience/search.ts` | command | request-response | `analytics/video/performance.ts` | role-match (GET with required flag) |
| `audience/register.ts` | command | request-response | `comment/add.ts` | exact (POST form mutation) |
| `audience/unregister.ts` | command | request-response | `comment/add.ts` | exact (POST form mutation) |
| `audience/remove.ts` | command | request-response | `comment/delete.ts` | exact (destructive POST form) |
| `audience/metrics.ts` | command | request-response | `video/get.ts` | role-match (single-object key-value output) |
| `audience/funnel.ts` | command | request-response | `video/get.ts` | role-match (single-object key-value output) |
| `audience/timelines.ts` | command | request-response | `analytics/video/performance.ts` | role-match (GET list direct pagination) |
| `audience/companies.ts` | command | request-response | `analytics/video/performance.ts` | role-match (GET list direct pagination) |
| `audience/identity-sources.ts` | command | request-response | `analytics/video/timeseries.ts` | role-match (GET list no pagination) |
| `audience/list-collectors.ts` | command | request-response | `analytics/video/timeseries.ts` | role-match (GET list no pagination) |
| `audience/field/list.ts` | command | request-response | `analytics/video/timeseries.ts` | role-match (GET list no pagination) |
| `audience/field/set.ts` | command | request-response | `comment/add.ts` | exact (POST form mutation with required fields) |
| `audience/field/remove.ts` | command | request-response | `comment/delete.ts` | exact (destructive POST form) |
| `audience/field/types.ts` | command | request-response | `analytics/video/timeseries.ts` | role-match (POST returns list; render as table) |

All paths are relative to `packages/twentythree-cli/src/commands/`.

---

## Pattern Assignments

### Variant A: Analytics GET — no pagination (timeseries, totals, event-timeseries, event-totals, conversions/timeseries, conversions/totals)

**Analog:** `packages/twentythree-cli/src/commands/analytics/video/timeseries.ts`

**Imports pattern** (lines 1-8):
```typescript
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'
import {
  ANALYTICS_DATE_FLAGS,
  ANALYTICS_FILTER_FLAGS,
} from '../../../lib/analytics-flags.js'
```

**Flags pattern** (lines 27-31):
```typescript
static flags = {
  ...AuthenticatedCommand.baseFlags,
  ...ANALYTICS_DATE_FLAGS,
  ...ANALYTICS_FILTER_FLAGS,
}
```

**Core GET + render pattern** (lines 33-91):
```typescript
public async run(): Promise<void | object> {
  const { flags } = await this.parse(AnalyticsVideoTimeseries)
  this.printWorkspaceHeader()

  const { data, error } = await this.apiClient.GET('/analytics/data/videos/timeseries', {
    params: {
      query: {
        date_start: flags['date-start'],
        date_end: flags['date-end'],
        date_expression: flags['date-expression'],
        selection: flags.selection,
        groupby: flags.groupby as any,
        orderby: flags.orderby as any,
        order: flags.order as any,
      },
    },
  })

  if (error) {
    this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
  }

  const resp = data as any
  const rows: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

  if (this.jsonEnabled()) {
    return formatJsonOutput({
      ok: true,
      data: rows,
      summary: `${rows.length} row(s)`,
      breadcrumbs: [
        { domain: this.activeWorkspace.domain },
        { resource: 'analytics' },
      ],
    })
  }

  if (rows.length === 0) {
    this.log('No data found.')
    return
  }

  const headers = ['Date', 'Plays', 'Engagement', 'Playrate', 'Traffic']
  const tableRows = rows.map((row: any) => [
    String(row.date ?? ''),
    String(row.plays ?? ''),
    String(row.engagement ?? ''),
    String(row.playrate ?? ''),
    String(row.traffic ?? ''),
  ])
  const table = renderTable(headers, tableRows)
  this.log(table.toString())
  this.log(chalk.dim(`${rows.length} row(s)`))
}
```

**File-specific substitutions for Variant A:**

| File | Class name | API path | Headers |
|---|---|---|---|
| `analytics/live/timeseries.ts` | `AnalyticsLiveTimeseries` | `/analytics/data/live/timeseries` | `['Date', 'Plays', 'Engagement', 'Playrate', 'Traffic']` |
| `analytics/live/totals.ts` | `AnalyticsLiveTotals` | `/analytics/data/live/totals` | `['Plays', 'Peak Viewers', 'Engagement', 'Playrate', 'Avg View Time']` |
| `analytics/live/event-timeseries.ts` | `AnalyticsLiveEventTimeseries` | `/analytics/data/live/event/timeseries` | `['Date', 'Plays', 'Engagement', 'Playrate', 'Traffic']` |
| `analytics/live/event-totals.ts` | `AnalyticsLiveEventTotals` | `/analytics/data/live/event/totals` | `['Plays', 'Peak Viewers', 'Engagement', 'Playrate', 'Avg View Time']` |
| `analytics/conversions/timeseries.ts` | `AnalyticsConversionsTimeseries` | `/analytics/data/conversions/timeseries` | `['Date', 'Plays', 'Engagement', 'Playrate', 'Traffic']` |
| `analytics/conversions/totals.ts` | `AnalyticsConversionsTotals` | `/analytics/data/conversions/totals` | `['Plays', 'Engagement', 'Playrate', 'Avg View Time', 'Traffic']` |

**Import path depth note:** All analytics commands 3 levels deep use `'../../../lib/...'`. `analytics/live/event-timeseries.ts` is still 3 levels deep (the file is named `event-timeseries.ts` inside `analytics/live/`), so the same `'../../../lib/...'` import depth applies.

---

### Variant B: Analytics GET — with pagination (weekday, event, devices, domains, locations, sources, sourceids, spots, traffic)

**Analog:** `packages/twentythree-cli/src/commands/analytics/video/weekday.ts`

**Imports pattern** (lines 1-9):
```typescript
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'
import {
  ANALYTICS_DATE_FLAGS,
  ANALYTICS_PAGINATION_FLAGS,
  ANALYTICS_FILTER_FLAGS,
} from '../../../lib/analytics-flags.js'
```

**Flags pattern** (lines 28-33):
```typescript
static flags = {
  ...AuthenticatedCommand.baseFlags,
  ...ANALYTICS_DATE_FLAGS,
  ...ANALYTICS_PAGINATION_FLAGS,
  ...ANALYTICS_FILTER_FLAGS,
}
```

**Core GET + render pattern** (lines 35-96): Same as Variant A but with `p: flags.page, size: flags.size` added to the query object:
```typescript
const { data, error } = await this.apiClient.GET('/analytics/data/videos/weekday', {
  params: {
    query: {
      date_start: flags['date-start'],
      date_end: flags['date-end'],
      date_expression: flags['date-expression'],
      selection: flags.selection,
      groupby: flags.groupby as any,
      orderby: flags.orderby as any,
      order: flags.order as any,
      p: flags.page,
      size: flags.size,
    },
  },
})
```

**File-specific substitutions for Variant B:**

| File | Class name | API path | Key headers |
|---|---|---|---|
| `analytics/live/weekday.ts` | `AnalyticsLiveWeekday` | `/analytics/data/live/weekday` | `['Day', 'Plays', 'Engagement', 'Playrate', 'Traffic']` |
| `analytics/live/event.ts` | `AnalyticsLiveEvent` | `/analytics/data/live/event` | `['Event ID', 'Plays', 'Peak Viewers', 'Engagement', 'Performance']` |
| `analytics/usage/devices.ts` | `AnalyticsUsageDevices` | `/analytics/data/usage/devices` | `['Device', 'Plays', 'Engagement', 'Traffic']` |
| `analytics/usage/domains.ts` | `AnalyticsUsageDomains` | `/analytics/data/usage/domains` | `['Domain', 'Plays', 'Engagement', 'Traffic']` |
| `analytics/usage/locations.ts` | `AnalyticsUsageLocations` | `/analytics/data/usage/locations` | `['Country', 'Plays', 'Engagement', 'Traffic']` |
| `analytics/usage/sources.ts` | `AnalyticsUsageSources` | `/analytics/data/usage/sources` | `['Source', 'Plays', 'Engagement', 'Traffic']` |
| `analytics/usage/sourceids.ts` | `AnalyticsUsageSourceids` | `/analytics/data/usage/sourceids` | `['Source ID', 'Plays', 'Engagement', 'Traffic']` |
| `analytics/usage/spots.ts` | `AnalyticsUsageSpots` | `/analytics/data/usage/spots` | `['Spot', 'Plays', 'Engagement', 'Traffic']` |
| `analytics/usage/traffic.ts` | `AnalyticsUsageTraffic` | `/analytics/data/usage/traffic` | `['Date', 'Plays', 'Engagement', 'Traffic']` |

---

### Variant C: Analytics GET — storage (no date params, no pagination)

**Analog:** `packages/twentythree-cli/src/commands/analytics/video/totals.ts`

**Class name:** `AnalyticsUsageStorage`
**API path:** `/analytics/data/usage/storage`

**Flags pattern** — expose date flags per D-3 for consistency (API silently ignores them):
```typescript
static flags = {
  ...AuthenticatedCommand.baseFlags,
  ...ANALYTICS_DATE_FLAGS,
}
```

**Render pattern** — `data` is an object (empty spec schema), not an array. Fall back to JSON output for the human-readable path:
```typescript
const resp = data as any
const obj = resp?.data ?? {}

if (this.jsonEnabled()) {
  return formatJsonOutput({
    ok: true,
    data: obj,
    summary: 'Storage usage',
    breadcrumbs: [
      { domain: this.activeWorkspace.domain },
      { resource: 'analytics' },
    ],
  })
}

// Storage returns a flat object with unknown keys at runtime; render as JSON
this.log(JSON.stringify(obj, null, 2))
```

---

### Variant D: Audience GET list with direct offset/page/size pagination

**Analog:** `packages/twentythree-cli/src/commands/analytics/video/performance.ts` (for GET shape) + direct pagination flags inline (no `fetchAllPages`)

**Files:** `audience/list.ts`, `audience/timelines.ts`, `audience/companies.ts`

**Imports pattern** (relative to `src/commands/audience/`):
```typescript
import chalk from 'chalk'
import { Flags } from '@oclif/core'
import { AuthenticatedCommand } from '../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../lib/output.js'
import { applyCliTerms } from '../../lib/term-map.js'
```

**Flags pattern for `audience/list.ts`** — exposes `--page`, `--size`, `--offset` all three (the API has `p`, `size`, and `offset`):
```typescript
static flags = {
  ...AuthenticatedCommand.baseFlags,
  page: Flags.integer({ description: 'Page number', required: false }),
  size: Flags.integer({ description: 'Page size', required: false }),
  offset: Flags.integer({ description: 'Page offset', required: false }),
  orderby: Flags.string({ description: 'Order results by field', required: false }),
  order: Flags.string({ description: 'Sort direction (asc/desc)', required: false }),
}
```

**Core GET pattern:**
```typescript
const { data, error } = await this.apiClient.GET('/audience/list', {
  params: {
    query: {
      p: flags.page,
      size: flags.size,
      offset: flags.offset,
      orderby: flags.orderby as any,
      order: flags.order as any,
    },
  },
})

if (error) {
  this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
}

const resp = data as any
const rows: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

if (this.jsonEnabled()) {
  return formatJsonOutput({
    ok: true,
    data: rows,
    summary: `${rows.length} member(s)`,
    breadcrumbs: [
      { domain: this.activeWorkspace.domain },
      { resource: 'audience' },
    ],
  })
}

if (rows.length === 0) {
  this.log('No audience members found.')
  return
}

const headers = ['UUID', 'Name', 'Email', 'Company', 'Score', 'Last Seen']
const tableRows = rows.map((r: any) => [
  String(r.uuid ?? ''),
  applyCliTerms(String(r.name ?? '')),
  String(r.email ?? ''),
  String(r.company ?? ''),
  String(r.score ?? ''),
  String(r.recent ?? r.last_seen ?? ''),
])
const table = renderTable(headers, tableRows)
this.log(table.toString())
this.log(chalk.dim(`${rows.length} member(s)`))
```

**Per-file substitutions for Variant D:**

| File | Class name | API path | Empty message | Headers |
|---|---|---|---|---|
| `audience/list.ts` | `AudienceList` | `/audience/list` | `'No audience members found.'` | `['UUID', 'Name', 'Email', 'Company', 'Score', 'Last Seen']` |
| `audience/timelines.ts` | `AudienceTimelines` | `/audience/timelines` | `'No timelines found.'` | `['UUID', 'Object ID', 'Object Type', 'Engagement', 'Sessions', 'Source']` |
| `audience/companies.ts` | `AudienceCompanies` | `/audience/companies` | `'No companies found.'` | `['UUID', 'Name', 'Domain', 'Score', 'Profiles', 'Last Seen']` |

---

### Variant E: Audience GET — required flag, offset+size only (audience/search)

**Analog:** `packages/twentythree-cli/src/commands/analytics/video/timeseries.ts` (GET shape, no `p`)

**CRITICAL:** `/audience/search` is GET (not POST). `text` is a required query param.

```typescript
static flags = {
  ...AuthenticatedCommand.baseFlags,
  text: Flags.string({ description: 'Search text', required: true }),
  size: Flags.integer({ description: 'Page size', required: false }),
  offset: Flags.integer({ description: 'Page offset', required: false }),
}

const { data, error } = await this.apiClient.GET('/audience/search', {
  params: {
    query: {
      text: flags.text,
      size: flags.size,
      offset: flags.offset,
    },
  },
})
```

**Headers:** `['UUID', 'Name', 'Email', 'Company', 'Score', 'Last Seen']`

---

### Variant F: Audience GET — no pagination (identity-sources, list-collectors)

**Analog:** `packages/twentythree-cli/src/commands/analytics/video/timeseries.ts` (GET no pagination)

**Files:** `audience/identity-sources.ts`, `audience/list-collectors.ts`

**Flags pattern:**
```typescript
static flags = {
  ...AuthenticatedCommand.baseFlags,
  // list-collectors also accepts optional object_id and action_id:
  'object-id': Flags.integer({ description: 'Filter by object ID', required: false }),
  'action-id': Flags.integer({ description: 'Filter by action ID', required: false }),
}
```

**Per-file substitutions:**

| File | Class name | API path | Headers |
|---|---|---|---|
| `audience/identity-sources.ts` | `AudienceIdentitySources` | `/audience/identity-sources` | `['Identity Source', 'Title', 'Service']` |
| `audience/list-collectors.ts` | `AudienceListCollectors` | `/audience/list-collectors` | `['Action ID', 'Name', 'Start Time', 'End Time']` |

---

### Variant G: Audience GET single-object — key-value output (metrics, funnel)

**Analog:** `packages/twentythree-cli/src/commands/video/get.ts`

**CRITICAL:** `data` is a single object (not an array). Do NOT call `renderTable()` on it.

```typescript
const resp = data as any
const obj = resp?.data ?? {}

if (this.jsonEnabled()) {
  return formatJsonOutput({
    ok: true,
    data: obj,
    summary: 'Audience metrics',
    breadcrumbs: [
      { domain: this.activeWorkspace.domain },
      { resource: 'audience' },
    ],
  })
}

// Key-value output pattern (from video/get.ts lines 79-88)
this.log(`Profile count:       ${obj.profile_count ?? ''}`)
this.log(`Identified count:    ${obj.identified_count ?? ''}`)
this.log(`Timeline count:      ${obj.timeline_count ?? ''}`)
this.log(`Timeline engagement: ${obj.timeline_engagement ?? ''}`)
this.log(`Event count:         ${obj.event_count ?? ''}`)
this.log(`Score avg:           ${obj.score_avg ?? ''}`)
```

**Per-file substitutions:**

| File | Class name | API path | Key-value fields |
|---|---|---|---|
| `audience/metrics.ts` | `AudienceMetrics` | `/audience/metrics` | `profile_count, identified_count, timeline_count, timeline_engagement, event_count, score_avg` |
| `audience/funnel.ts` | `AudienceFunnel` | `/audience/funnel` | `visits, visits_fmt, conversions, conversions_fmt, views, views_fmt, engagement, engagement_fmt` |

---

### Variant H: Audience POST form mutation — non-destructive (register, unregister, field/set)

**Analog:** `packages/twentythree-cli/src/commands/comment/add.ts`

**Core POST pattern** (lines 70-119):
```typescript
public async run(): Promise<void | object> {
  const { flags } = await this.parse(AudienceRegister)
  this.printWorkspaceHeader()

  // Only include defined flags — prevents clearing unset fields (comment/add.ts line 74)
  const body: Record<string, unknown> = {}
  if (flags.email !== undefined) body.email = flags.email
  if (flags.name !== undefined) body.name = flags.name

  const { data, error } = await this.apiClient.POST('/audience/register', {
    body: body as any,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  if (error) {
    this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
  }

  this.log(chalk.green('Contact registered'))

  if (this.jsonEnabled()) {
    return formatJsonOutput({
      ok: true,
      data,
      summary: 'Contact registered',
      breadcrumbs: [
        { domain: this.activeWorkspace.domain },
        { resource: 'audience' },
      ],
    })
  }
}
```

**Per-file substitutions for Variant H:**

| File | Class name | API path | Required flags | Success message |
|---|---|---|---|---|
| `audience/register.ts` | `AudienceRegister` | `/audience/register` | `email` (required) | `'Contact registered'` |
| `audience/unregister.ts` | `AudienceUnregister` | `/audience/unregister` | `object-id` (required) | `'Contact unregistered'` |
| `audience/field/set.ts` | `AudienceFieldSet` | `/audience/field/set` | `key`, `type`, `label` (all required) | `'Field updated'` |

**`audience/field/set.ts` flags — note 3 required fields:**
```typescript
static flags = {
  ...AuthenticatedCommand.baseFlags,
  key: Flags.string({ description: 'Unique field key', required: true }),
  type: Flags.string({ description: 'Field type (use `audience field types` to list valid values)', required: true }),
  label: Flags.string({ description: 'Human-readable label', required: true }),
  options: Flags.string({ description: 'Semicolon-separated options (for enumerable types)', required: false }),
  priority: Flags.integer({ description: 'Display order priority', required: false }),
}
```

---

### Variant I: Audience POST form mutation — destructive (remove, field/remove)

**Analog:** `packages/twentythree-cli/src/commands/comment/delete.ts`

**Confirmation pattern** (lines 35-43 of comment/delete.ts):
```typescript
if (!this.jsonEnabled()) {
  const confirmed = await confirm({
    message: `Remove audience data from ${this.activeWorkspace.domain}? This cannot be undone.`,
  })

  if (isCancel(confirmed) || !confirmed) {
    process.exit(EXIT_CANCELLED)
  }
}
```

**Imports for destructive commands:**
```typescript
import { confirm, isCancel } from '@clack/prompts'
import { formatJsonOutput, formatApiError, EXIT_ERROR, EXIT_CANCELLED } from '../../lib/output.js'
```

**Per-file substitutions for Variant I:**

| File | Class name | API path | Confirm message | Success message |
|---|---|---|---|---|
| `audience/remove.ts` | `AudienceRemove` | `/audience/remove` | `Remove audience data from ${domain}? This cannot be undone.` | `'Audience data removed'` |
| `audience/field/remove.ts` | `AudienceFieldRemove` | `/audience/field/remove` | `Remove field ${key} from ${domain}? This cannot be undone.` | `'Field removed'` |

---

### Variant J: Audience GET — `audience/field/list` (3-level topic, GET list)

**Analog:** `packages/twentythree-cli/src/commands/analytics/video/timeseries.ts`

**CRITICAL:** `audience/field/list` is GET (not POST despite D-5 note). Verified from OpenAPI spec.

**Class name:** `AudienceFieldList`
**API path:** `/audience/field/list`
**Import depth:** 4-levels deep (`audience/field/list.ts`) → `'../../../lib/...'` (3 `..` segments from `field/` subdirectory to `src/`)

Wait — `src/commands/audience/field/list.ts` → `../../../lib/` is correct (3 up: field → audience → commands → src, then down into lib).

```typescript
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'
```

**Flags:**
```typescript
static flags = {
  ...AuthenticatedCommand.baseFlags,
}
```

**Headers:** `['Key', 'Label', 'Type', 'Priority']`

---

### Variant K: Audience POST — `audience/field/types` (POST returns list, render as table)

**CRITICAL:** `audience/field/types` is POST per spec. Returns an array of valid type strings.

**Analog:** `packages/twentythree-cli/src/commands/comment/add.ts` for POST structure, but renders a list.

**Class name:** `AudienceFieldTypes`
**API path:** `/audience/field/types`

```typescript
const { data, error } = await this.apiClient.POST('/audience/field/types', {
  body: {} as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})

if (error) {
  this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
}

const resp = data as any
const types: any[] = Array.isArray(resp?.data) ? resp.data : resp?.data ? [resp.data] : []

if (this.jsonEnabled()) {
  return formatJsonOutput({
    ok: true,
    data: types,
    summary: `${types.length} type(s)`,
    breadcrumbs: [
      { domain: this.activeWorkspace.domain },
      { resource: 'audience' },
    ],
  })
}

if (types.length === 0) {
  this.log('No field types found.')
  return
}

// Types may be plain strings or objects; handle both
types.forEach((t: any) => this.log(typeof t === 'string' ? t : String(t.type ?? t)))
this.log(chalk.dim(`${types.length} type(s)`))
```

---

## Shared Patterns

### 1. Shared analytics flag objects

**Source:** `packages/twentythree-cli/src/lib/analytics-flags.ts` (lines 1-56)
**Apply to:** All `analytics/live/*`, `analytics/conversions/*`, `analytics/usage/*` commands

```typescript
// ANALYTICS_DATE_FLAGS (lines 7-20)
export const ANALYTICS_DATE_FLAGS = {
  'date-start': Flags.string({ description: 'First date (YYYY-MM-DD)', required: false }),
  'date-end': Flags.string({ description: 'Last date (YYYY-MM-DD)', required: false }),
  'date-expression': Flags.string({ description: 'Predefined date range (e.g. thisweek, lastyear)', required: false }),
}

// ANALYTICS_PAGINATION_FLAGS (lines 25-34)
export const ANALYTICS_PAGINATION_FLAGS = {
  page: Flags.integer({ description: 'Page number', required: false }),
  size: Flags.integer({ description: 'Page size', required: false }),
}

// ANALYTICS_FILTER_FLAGS (lines 39-56)
export const ANALYTICS_FILTER_FLAGS = {
  selection: Flags.string({ description: 'Scope to specific objects/types', required: false }),
  groupby: Flags.string({ description: 'Group results by dimension', required: false }),
  orderby: Flags.string({ description: 'Order results by field', required: false }),
  order: Flags.string({ description: 'Sort direction (asc/desc)', required: false }),
}
```

### 2. Error handling

**Source:** All existing commands; representative: `analytics/video/timeseries.ts` line 53-55
**Apply to:** Every command in Phase 7

```typescript
if (error) {
  this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
}
```

### 3. JSON output shape

**Source:** `packages/twentythree-cli/src/lib/output.ts` lines 37-48
**Apply to:** Every command — all have `static enableJsonFlag = true`

```typescript
return formatJsonOutput({
  ok: true,
  data: rows,
  summary: `${rows.length} row(s)`,
  breadcrumbs: [
    { domain: this.activeWorkspace.domain },
    { resource: 'analytics' },  // or 'audience'
  ],
})
```

### 4. POST form body construction

**Source:** `packages/twentythree-cli/src/commands/comment/add.ts` lines 74-92
**Apply to:** `audience/register.ts`, `audience/unregister.ts`, `audience/remove.ts`, `audience/field/set.ts`, `audience/field/remove.ts`, `audience/field/types.ts`

```typescript
// Only include defined flags — prevents clearing unset fields
const body: Record<string, unknown> = {}
if (flags.email !== undefined) body.email = flags.email
// ...
const { data, error } = await this.apiClient.POST('/audience/register', {
  body: body as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
```

### 5. Destructive confirmation prompt

**Source:** `packages/twentythree-cli/src/commands/comment/delete.ts` lines 35-44
**Apply to:** `audience/remove.ts`, `audience/field/remove.ts`

```typescript
import { confirm, isCancel } from '@clack/prompts'
// ...
if (!this.jsonEnabled()) {
  const confirmed = await confirm({
    message: `Delete X from ${this.activeWorkspace.domain}? This cannot be undone.`,
  })
  if (isCancel(confirmed) || !confirmed) {
    process.exit(EXIT_CANCELLED)
  }
}
```

### 6. 3-level topic class naming

**Source:** `packages/twentythree-cli/src/commands/comment/reaction/add.ts` line 17
**Apply to:** All `analytics/live/*`, `analytics/conversions/*`, `analytics/usage/*`, `audience/field/*`

```
analytics/live/event-timeseries.ts  → class AnalyticsLiveEventTimeseries
audience/field/set.ts               → class AudienceFieldSet
audience/field/remove.ts            → class AudienceFieldRemove
```

### 7. Workspace header

**Source:** Every existing command
**Apply to:** Every command in Phase 7, first line inside `run()`

```typescript
this.printWorkspaceHeader()
```

### 8. Term mapping on errors only

**Source:** `packages/twentythree-cli/src/lib/term-map.ts` (used via `applyCliTerms()`)
**Apply to:** Error messages and user-visible labels — NOT to raw API data field values

```typescript
// Correct: apply to error messages
this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })

// Correct: apply to user-visible display strings
applyCliTerms(String(r.name ?? ''))

// Wrong: do NOT apply to analytics/audience raw data values (would corrupt numbers/IDs)
```

### 9. Import depth per directory level

**Apply to:** All new command files

| File location | Import depth | Example |
|---|---|---|
| `src/commands/audience/*.ts` | `../../lib/` | `'../../lib/base-command.js'` |
| `src/commands/audience/field/*.ts` | `../../../lib/` | `'../../../lib/base-command.js'` |
| `src/commands/analytics/live/*.ts` | `../../../lib/` | `'../../../lib/base-command.js'` |
| `src/commands/analytics/conversions/*.ts` | `../../../lib/` | `'../../../lib/base-command.js'` |
| `src/commands/analytics/usage/*.ts` | `../../../lib/` | `'../../../lib/base-command.js'` |

---

## Critical Pitfalls (from RESEARCH.md — repeat for planner)

| Pitfall | Wrong | Correct |
|---|---|---|
| Analytics API path | `/analytics/data/video/timeseries` (singular) | `/analytics/data/videos/timeseries` (plural) |
| `audience/search` method | `apiClient.POST(...)` | `apiClient.GET(...)` with `text` as query param |
| `audience/field/list` method | `apiClient.POST(...)` | `apiClient.GET(...)` |
| Pagination for analytics | `fetchAllPages()` | `--page` (maps to `p`) + `--size` flags |
| Pagination for audience | `fetchAllPages()` | `--page` (maps to `p`) + `--size` + `--offset` |
| Single-object render | `renderTable()` on `funnel`/`metrics` | Key-value `this.log()` labels |
| Term mapping | Apply `applyCliTerms()` to analytics data values | Apply only to error messages and display strings |
| `audience/field/types` | GET (spec says POST) | POST with empty body |

---

## No Analog Found

None. All 36 files map to existing codebase analogs.

---

## Metadata

**Analog search scope:** `packages/twentythree-cli/src/commands/analytics/video/`, `packages/twentythree-cli/src/commands/comment/`, `packages/twentythree-cli/src/commands/video/`, `packages/twentythree-cli/src/lib/`
**Files scanned:** 12 source files read directly
**Pattern extraction date:** 2026-04-16
