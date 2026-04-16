# Phase 7: Analytics & Audience - Research

**Researched:** 2026-04-16
**Domain:** TwentyThree analytics API endpoints (video, live, conversions, usage sub-dimensions) and audience management (members, search, fields, companies, collectors, funnels, timelines)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-1: Analytics sub-command structure — 3-level oclif topic**
Analytics endpoints group as `analytics/<resource>/<dimension>`. Use 3-level oclif topics via directory structure:
```
analytics/video/timeseries.ts   → twentythree analytics video timeseries
analytics/video/totals.ts       → twentythree analytics video totals
analytics/live/timeseries.ts    → twentythree analytics live timeseries
analytics/usage/storage.ts      → twentythree analytics usage storage
```
Full sub-command map:
- `analytics video timeseries|totals|weekday|performance|published` → `/analytics/data/videos/<dim>`
- `analytics live timeseries|totals|weekday|event|event-timeseries|event-totals` → `/analytics/data/live/<dim>`
- `analytics conversions timeseries|totals` → `/analytics/data/conversions/<dim>`
- `analytics usage devices|domains|locations|sources|sourceids|spots|storage|traffic` → `/analytics/data/usage/<dim>`

**D-2: Date filter flags — mirror API exactly**
- `--date-start` (maps to `date_start`)
- `--date-end` (maps to `date_end`)
- `--date-expression` (maps to `date_expression`)
No friendlier aliases. Both modes supported simultaneously (D-3).

**D-3: Date filter flags — expose both modes**
Both `--date-start`/`--date-end` AND `--date-expression` supported. When both provided, pass both to API. No mutual exclusivity enforcement.

**D-4: Pagination — expose `--offset`/`--size` directly (global pattern)**
Do NOT fetch all pages. Expose `--offset` and `--size` directly when API supports them.
- Audience endpoints use `p`/`size`/`offset` — map to `--page`/`--size`/`--offset`
- Analytics endpoints use `p`/`size` — map to `--page`/`--size`

**D-5: `audience field` — 3-level oclif topic**
```
audience/field/list.ts    → twentythree audience field list
audience/field/set.ts     → twentythree audience field set
audience/field/remove.ts  → twentythree audience field remove
audience/field/types.ts   → twentythree audience field types
```
Note: `/audience/field/list` and `/audience/field/types` use POST (unusual — follow API as-is).

### Claude's Discretion
None specified.

### Deferred Ideas (OUT OF SCOPE)
None specified.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ANL-01 | `analytics videos` retrieves video analytics data | `/analytics/data/videos` GET; pagination via p/size |
| ANL-02 | `analytics videos timeseries|totals|weekday|performance|published` | Sub-paths `/analytics/data/videos/<dim>` GET; all accept date filters |
| ANL-03 | `analytics live` retrieves live/webinar analytics data | `/analytics/data/live` GET; pagination via p/size |
| ANL-04 | `analytics live timeseries|totals|weekday|event|event-timeseries|event-totals` | Sub-paths `/analytics/data/live/<dim>` GET; event-timeseries maps to `/live/event/timeseries` |
| ANL-05 | `analytics conversions` retrieves conversion analytics | `/analytics/data/conversions` GET; no p/size pagination |
| ANL-06 | `analytics conversions timeseries|totals` | Sub-paths GET; no p/size |
| ANL-07 | `analytics usage devices|domains|locations|sources|sourceids|spots|storage|traffic` | Multiple `/analytics/data/usage/<dim>` GET endpoints; most have p/size; storage has no date params |
| ANL-08 | All analytics commands support `--json` output and accept standard date range filters | enableJsonFlag=true on all; D-2/D-3 flags on all |
| AUD-01 | `audience list` lists audience members | `/audience/list` GET; p/size/offset pagination |
| AUD-02 | `audience search` searches audience members | `/audience/search` GET (NOT POST); requires `--text`; size/offset pagination |
| AUD-03 | `audience register` registers new member | `/audience/register` POST form; `email` required |
| AUD-04 | `audience unregister` removes member from an object | `/audience/unregister` POST form; `object_id` required |
| AUD-05 | `audience remove` removes audience data | `/audience/remove` POST form; no required fields (email or uuid) |
| AUD-06 | `audience metrics` retrieves audience metrics | `/audience/metrics` GET; returns single object not list; p/size/offset params exist |
| AUD-07 | `audience funnel` retrieves funnel analytics | `/audience/funnel` GET; returns single summary object |
| AUD-08 | `audience timelines` retrieves audience timelines | `/audience/timelines` GET; p/size/offset pagination |
| AUD-09 | `audience companies` lists audience companies | `/audience/companies` GET; p/size/offset pagination |
| AUD-10 | `audience identity-sources` lists identity sources | `/audience/identity-sources` GET; no pagination |
| AUD-11 | `audience list-collectors` lists collectors linked to audience | `/audience/list-collectors` GET; no pagination |
| AUD-12 | `audience field list|set|remove|types` manages custom fields | 4 endpoints; field/list is GET; field/set/types/remove are POST form |
</phase_requirements>

---

## Summary

Phase 7 implements two command families — analytics (20 commands in a 3-level topic hierarchy) and audience (16 commands including a 3-level `audience field` sub-topic). All analytics endpoints are GET with consistent query params. Audience commands are a mix of GET read commands and POST form mutation commands.

The most important structural discovery is an **endpoint path discrepancy**: CONTEXT.md D-1 references `/analytics/data/video/<dim>` (singular) but the actual OpenAPI spec and generated `types.ts` use `/analytics/data/videos/<dim>` (plural). Commands must use the plural form from `types.ts`. The CLI topic remains `analytics video` (singular) per D-1 — the topic name and the API path are different.

`/audience/search` is **GET** in the spec (not POST form as the CONTEXT table indicates). The CONTEXT table entry is a documentation error; the implementation must follow the spec.

Analytics commands that expose pagination use `p` (not `offset`) as the API page param, mapping to `--page` per D-4. Audience endpoints use both `p` and `offset` together with `size`.

**Primary recommendation:** Build analytics commands as a thin GET wrapper layer sharing date-filter flag definitions via a helper object; build audience mutation commands using the established POST form pattern from `comment/add.ts`.

---

## API Endpoint Details

### Analytics — Path Naming (CRITICAL)

[VERIFIED: packages/twentythree-cli/specs/twentythree-api-swagger.json]

The spec uses **plural** for videos: `/analytics/data/videos` not `/analytics/data/videos`. The CONTEXT D-1 table uses `video` (singular) in the API path column — this is incorrect. The actual TypeScript types in `src/api/types.ts` use the plural form and must be used in `apiClient.GET()` calls.

| CLI Topic Segment | API Path Prefix | Note |
|---|---|---|
| `analytics video` | `/analytics/data/videos` | Plural in API |
| `analytics live` | `/analytics/data/live` | Matches (no s) |
| `analytics conversions` | `/analytics/data/conversions` | Matches |
| `analytics usage` | `/analytics/data/usage` | Matches |

### Analytics — Root vs Sub-dimension endpoints

Each analytics resource group has a "list" root endpoint AND named sub-dimension endpoints:

| CLI Command | API Path | Has p/size? |
|---|---|---|
| `analytics video` (root) | GET `/analytics/data/videos` | Yes |
| `analytics video timeseries` | GET `/analytics/data/videos/timeseries` | No |
| `analytics video totals` | GET `/analytics/data/videos/totals` | No |
| `analytics video weekday` | GET `/analytics/data/videos/weekday` | Yes |
| `analytics video performance` | GET `/analytics/data/videos/performance` | Yes |
| `analytics video published` | GET `/analytics/data/videos/published` | Yes |
| `analytics live` (root) | GET `/analytics/data/live` | Yes |
| `analytics live timeseries` | GET `/analytics/data/live/timeseries` | No |
| `analytics live totals` | GET `/analytics/data/live/totals` | No |
| `analytics live weekday` | GET `/analytics/data/live/weekday` | Yes |
| `analytics live event` | GET `/analytics/data/live/event` | Yes |
| `analytics live event-timeseries` | GET `/analytics/data/live/event/timeseries` | No |
| `analytics live event-totals` | GET `/analytics/data/live/event/totals` | No |
| `analytics conversions` (root) | GET `/analytics/data/conversions` | No |
| `analytics conversions timeseries` | GET `/analytics/data/conversions/timeseries` | No |
| `analytics conversions totals` | GET `/analytics/data/conversions/totals` | No |
| `analytics usage devices` | GET `/analytics/data/usage/devices` | Yes |
| `analytics usage domains` | GET `/analytics/data/usage/domains` | Yes |
| `analytics usage locations` | GET `/analytics/data/usage/locations` | Yes |
| `analytics usage sources` | GET `/analytics/data/usage/sources` | Yes |
| `analytics usage sourceids` | GET `/analytics/data/usage/sourceids` | Yes |
| `analytics usage spots` | GET `/analytics/data/usage/spots` | Yes |
| `analytics usage storage` | GET `/analytics/data/usage/storage` | No (no date params either) |
| `analytics usage traffic` | GET `/analytics/data/usage/traffic` | Yes |

**Note on analytics root commands:** The requirements list root commands (ANL-01: `analytics videos`, ANL-03: `analytics live`, ANL-05: `analytics conversions`) as distinct commands. Per D-1, these map to their root API endpoint. Given the 3-level topic structure `analytics/<resource>/<dimension>`, the root resource commands are 2-level topics — implemented as `analytics/video/index.ts` or simply omitted. The CONTEXT sub-command map only calls out dimension commands; the root `analytics video` command maps to `/analytics/data/videos`. Whether to implement root commands or only sub-dimensions should be resolved by the planner.

### Analytics — Common Parameters

All analytics endpoints (except storage) accept date filter params per D-2/D-3:
- `date_start` — YYYY-MM-DD format
- `date_end` — YYYY-MM-DD format
- `date_expression` — predefined range string (e.g., `thisweek`, `lastyear`)

Most also accept optional filter params:
- `selection` — string to scope data to specific objects/types
- `groupby` — group results by a dimension
- `orderby` / `order` — sorting
- `fields` — comma-separated fields to return
- `resolve_recordings_p` — expand recordings filter
- `analytics_campaign_id` / `analytics_filter_id` / `analytics_filter_url_stub` — campaign/filter scoping
- `source` / `source_id` / `country` / `domain` — filter by traffic source

`/analytics/data/usage/storage` is anomalous: only accepts `fields`. No date params at all. Still expose `--date-start`/`--date-end`/`--date-expression` per D-3, noting API ignores them.

### Analytics — Response Shapes

[VERIFIED: packages/twentythree-cli/specs/twentythree-api-swagger.json]

**Paginated responses** (root list endpoints with p/size): `{ status, permission_level, cached, cache_time, p, size, total_count, data[] }`
**Non-paginated responses** (timeseries, totals, weekday): `{ status, permission_level, cached, cache_time, data[] }`
**Storage**: `{ status, permission_level, cached, cache_time, data: {} }` (empty schema — render as JSON or key-value)

Key data fields per resource:
- Videos data[]: `plays, engagement, playrate, avg_viewtime, traffic, impressions, performance, posts, embeds, videos`
- Videos timeseries data[]: adds `date` field
- Live event data[]: `plays, peakviewers, engagement, playrate, avg_viewtime, performance`

### Audience Endpoints

[VERIFIED: packages/twentythree-cli/specs/twentythree-api-swagger.json]

**CRITICAL CORRECTION:** `/audience/search` is GET (not POST form as CONTEXT table shows). The spec method is `get`. It accepts `text` (required), `orderby`, `order`, `size`, `offset` as query params.

| CLI Command | Method | Endpoint | Key Notes |
|---|---|---|---|
| `audience list` | GET | `/audience/list` | p/size/offset pagination; many filter params |
| `audience search` | GET | `/audience/search` | `text` required; size/offset pagination |
| `audience register` | POST form | `/audience/register` | `email` required |
| `audience unregister` | POST form | `/audience/unregister` | `object_id` required |
| `audience remove` | POST form | `/audience/remove` | No required fields (provide email or uuid) |
| `audience metrics` | GET | `/audience/metrics` | Returns single metrics object; same filter params as /audience/list |
| `audience funnel` | GET | `/audience/funnel` | Returns single summary object; `objects` optional |
| `audience timelines` | GET | `/audience/timelines` | p/size/offset; many filter params |
| `audience companies` | GET | `/audience/companies` | p/size/offset |
| `audience identity-sources` | GET | `/audience/identity-sources` | No pagination; returns array |
| `audience list-collectors` | GET | `/audience/list-collectors` | No pagination; optional `object_id`/`action_id` filter |
| `audience field list` | GET | `/audience/field/list` | Returns array of field definitions |
| `audience field set` | POST form | `/audience/field/set` | `key`, `type`, `label` required |
| `audience field remove` | POST form | `/audience/field/remove` | `key` required |
| `audience field types` | POST form | `/audience/field/types` | No required body fields; returns valid type list |

**Audience response shapes:**
- `/audience/list` data[]: `uuid, name, email, company, identified_p, score, timeline_count, timeline_engagement, first, recent`
- `/audience/search` data[]: `uuid, name, email, company, score, last_seen`
- `/audience/timelines` data[]: `uuid, object_id, object_type, engagement, sessions, first, recent, source`
- `/audience/funnel` data (object): `visits, visits_fmt, conversions, conversions_fmt, views, views_fmt, engagement, engagement_fmt, new_conversions, new_conversions_fmt`
- `/audience/metrics` data (object): `profile_count, identified_count, timeline_count, timeline_engagement, event_count, score_avg`
- `/audience/companies` data[]: `uuid, name, domain, identified_p, score, timeline_count, timeline_engagement, first, recent, profile_count`
- `/audience/identity-sources` data[]: `identity_source, title, service`
- `/audience/list-collectors` data[]: `action_id, name, start_time, end_time, require_email_p, ...`
- `/audience/field/list` data[]: `key, label, options, type, priority, widget_html`

---

## Standard Stack

All commands in Phase 7 use the established project stack — no new dependencies required.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@oclif/core` | 4.x | Command framework, flag parsing, topic structure | Project standard |
| `openapi-fetch` | latest | Type-safe API calls using generated types | Project standard |
| `chalk` | 4.x | Terminal colour (green success, dim counts) | Project standard (CJS-safe) |
| `cli-table3` | latest | Tabular output for list commands | Project standard |

[VERIFIED: packages/twentythree-cli/package.json and CLAUDE.md]

**Installation:** No new packages required for Phase 7.

---

## Architecture Patterns

### Recommended Directory Structure

```
src/commands/
├── analytics/
│   ├── video/
│   │   ├── timeseries.ts      → analytics video timeseries
│   │   ├── totals.ts          → analytics video totals
│   │   ├── weekday.ts         → analytics video weekday
│   │   ├── performance.ts     → analytics video performance
│   │   └── published.ts       → analytics video published
│   ├── live/
│   │   ├── timeseries.ts
│   │   ├── totals.ts
│   │   ├── weekday.ts
│   │   ├── event.ts
│   │   ├── event-timeseries.ts
│   │   └── event-totals.ts
│   ├── conversions/
│   │   ├── timeseries.ts
│   │   └── totals.ts
│   └── usage/
│       ├── devices.ts
│       ├── domains.ts
│       ├── locations.ts
│       ├── sources.ts
│       ├── sourceids.ts
│       ├── spots.ts
│       ├── storage.ts
│       └── traffic.ts
└── audience/
    ├── list.ts
    ├── search.ts
    ├── register.ts
    ├── unregister.ts
    ├── remove.ts
    ├── metrics.ts
    ├── funnel.ts
    ├── timelines.ts
    ├── companies.ts
    ├── identity-sources.ts
    ├── list-collectors.ts
    └── field/
        ├── list.ts
        ├── set.ts
        ├── remove.ts
        └── types.ts
```

**Note:** The root analytics commands (ANL-01, ANL-03, ANL-05) for `analytics video`, `analytics live`, `analytics conversions` each map to a root API endpoint. Since the 3-level topic structure requires a `<dimension>` segment, these can be implemented as files named `index.ts` inside each directory (which oclif does not automatically pick up as a command), OR as separate top-level files like `analytics/videos.ts` → `analytics videos`. The cleanest approach is `analytics/videos.ts` (using 2-level topic) for the root, and the sub-dimension files inside the subdirectory. See Pitfall 1 for details.

### Pattern 1: Analytics GET Command (shared date flags)

Since all analytics commands share the same date flag set, define a shared flag object and spread it:

```typescript
// Source: CLAUDE.md + codebase patterns [VERIFIED]
// In analytics/shared-flags.ts (or inline in each command)
const DATE_FLAGS = {
  'date-start': Flags.string({
    description: 'First date for data. Format: YYYY-MM-DD.',
    required: false,
  }),
  'date-end': Flags.string({
    description: 'Last date for data. Format: YYYY-MM-DD.',
    required: false,
  }),
  'date-expression': Flags.string({
    description: 'Predefined date range (e.g. thisweek, lastyear).',
    required: false,
  }),
}

// In a command:
static flags = {
  ...AuthenticatedCommand.baseFlags,
  ...DATE_FLAGS,
  page: Flags.integer({ description: 'Page number', required: false }),
  size: Flags.integer({ description: 'Page size', required: false }),
  selection: Flags.string({ description: 'Scope to specific objects/types', required: false }),
}

public async run() {
  const { flags } = await this.parse(VideoTimeseries)
  this.printWorkspaceHeader()
  const { data, error } = await this.apiClient.GET('/analytics/data/videos/timeseries', {
    params: {
      query: {
        date_start: flags['date-start'],
        date_end: flags['date-end'],
        date_expression: flags['date-expression'],
        selection: flags.selection,
      },
    },
  })
  // ... render
}
```

### Pattern 2: Analytics Table Rendering

Analytics data arrays render with `renderTable()`. For commands with many possible columns, use the most useful fields. Example for video analytics:

```typescript
// Source: src/commands/video/list.ts pattern [VERIFIED]
const headers = ['Date', 'Plays', 'Engagement', 'Playrate', 'Traffic']
const rows = (dataArray as any[]).map((row) => [
  String(row.date ?? ''),
  String(row.plays ?? ''),
  String(row.engagement ?? ''),
  String(row.playrate ?? ''),
  String(row.traffic ?? ''),
])
const table = renderTable(headers, rows)
this.log(table.toString())
this.log(chalk.dim(`${dataArray.length} row${dataArray.length === 1 ? '' : 's'}`))
```

For non-list responses (`funnel`, `metrics`, `storage`), use key-value label output (like `video get`):
```typescript
this.log(`Profile count:   ${resp?.data?.profile_count ?? ''}`)
this.log(`Identified:      ${resp?.data?.identified_count ?? ''}`)
// etc.
```

### Pattern 3: POST Form Mutation (audience register/unregister/remove)

Follows `comment/add.ts` pattern exactly:

```typescript
// Source: src/commands/comment/add.ts [VERIFIED]
const body: Record<string, unknown> = {}
if (flags.email !== undefined) body.email = flags.email
if (flags.uuid !== undefined) body.uuid = flags.uuid
// Only include defined flags — prevents clearing unset fields

const { data, error } = await this.apiClient.POST('/audience/register', {
  body: body as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
```

### Pattern 4: 3-Level Topic Class Naming

```typescript
// comment/reaction/add.ts → CommentReactionAdd [VERIFIED: codebase]
// audience/field/list.ts → AudienceFieldList
// analytics/video/timeseries.ts → AnalyticsVideoTimeseries
// analytics/live/event-timeseries.ts → AnalyticsLiveEventTimeseries
```

### Pattern 5: `audience search` — GET with required flag

`/audience/search` is GET with `text` as required query param (not POST body):

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

### Anti-Patterns to Avoid

- **Using `/analytics/data/video/` (singular)**: The API path is `/analytics/data/videos/` (plural). The types.ts key is `"/analytics/data/videos/timeseries"` etc. Using the wrong path string will cause TypeScript errors.
- **Treating `audience/search` as POST**: The spec defines it as GET. No `body` or `Content-Type: application/x-www-form-urlencoded` for this endpoint.
- **Treating `audience/field/list` as POST**: The spec defines it as GET (despite D-5 note saying it uses POST). Verified from spec: it is GET. The D-5 note about POST applies to `field/types` and `field/set` and `field/remove` only.
- **Using `fetchAllPages` for analytics or audience commands**: D-4 is explicit — expose `--page`/`--size` directly, no auto-pagination loop.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table rendering | Custom ASCII table | `renderTable()` from `src/lib/output.ts` | Established helper, consistent styling |
| JSON output shape | Custom JSON structure | `formatJsonOutput()` from `src/lib/output.ts` | CLI-01 compliance |
| API error formatting | `String(error)` | `formatApiError()` from `src/lib/output.ts` | Handles `[object Object]` case |
| Term mapping in errors | Manual string replace | `applyCliTerms()` from `src/lib/term-map.ts` | CLI-04 compliance |
| Workspace header | Manual `this.log()` | `this.printWorkspaceHeader()` from `BaseCommand` | AUTH-04 compliance |
| POST form requests | Custom fetch | `this.apiClient.POST(path, { body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })` | Type-safe, consistent |

---

## Common Pitfalls

### Pitfall 1: Root analytics commands and 3-level topic structure

**What goes wrong:** D-1 defines 3-level structure `analytics/<resource>/<dimension>`. ANL-01, ANL-03, ANL-05 require root `analytics video`, `analytics live`, `analytics conversions` commands — these are 2-level topics. Putting a command file at `analytics/video.ts` (2-level) AND `analytics/video/timeseries.ts` (3-level, same prefix) will cause oclif topic conflicts.

**How to avoid:** Check oclif v4 behavior for a directory and a same-named file. The safest approach: implement root commands as `analytics/video/index.ts` if oclif supports it, OR rename the root command files to something distinct like `analytics/videos.ts` (note: this changes the CLI command name). The planner should validate which approach works with oclif v4 auto-discovery.

**Warning signs:** oclif manifest generation errors like "command ID conflict" during `pnpm build`.

### Pitfall 2: API path plural vs. topic singular

**What goes wrong:** CLI topic is `analytics video` (singular per D-1) but API path is `/analytics/data/videos` (plural). Developers write `/analytics/data/video/timeseries` (singular) in `apiClient.GET()` — this compiles to a runtime 404.

**How to avoid:** Always use the path string from `src/api/types.ts` verbatim. Run `grep -n "analytics/data/videos" src/api/types.ts` to confirm exact keys before writing.

**Warning signs:** TypeScript errors saying "Argument of type '"/analytics/data/video/timeseries"' is not assignable".

### Pitfall 3: audience/search is GET not POST

**What goes wrong:** CONTEXT.md endpoint inventory table lists `/audience/search` as "POST form". The actual OpenAPI spec defines it as GET with `text` as a required query param. Implementing as POST will cause the request to be rejected by the API.

**How to avoid:** Use `this.apiClient.GET('/audience/search', ...)` with query params, not POST.

### Pitfall 4: audience/field/list is GET not POST

**What goes wrong:** D-5 says "field/list and field/types use POST (unusual for read operations)". The OpenAPI spec shows `/audience/field/list` as GET. Only `field/set`, `field/types`, and `field/remove` are POST.

**How to avoid:** Use GET for `field/list`, POST for `field/set`, `field/types`, `field/remove`.

### Pitfall 5: D-4 pagination — analytics uses `p` not `offset`

**What goes wrong:** Analytics endpoints use `p` (page number) for pagination while audience endpoints use `offset`. Mixing them up results in silently ignored params or wrong pages.

**How to avoid:** Analytics paginated commands expose `--page` (maps to `p`) + `--size`. Audience commands expose `--page` (maps to `p`) + `--size` + `--offset` (maps to `offset`) where all three params exist. For `audience/search`, only `size` and `offset` are available (no `p`).

### Pitfall 6: Non-list responses (funnel, metrics, storage) render differently

**What goes wrong:** Using `renderTable()` on a single-object response (`funnel`, `metrics`) results in rendering a single meaningless row or crashing on `undefined.map`.

**How to avoid:** Check the response schema. If `data` is a single object (not an array), render with key-value `this.log()` labels, like `video get` does. If empty schema (storage), fall back to `JSON.stringify(data, null, 2)` or key-value if known fields exist at runtime.

### Pitfall 7: `live` term mapping in analytics

**What goes wrong:** The `applyCliTerms()` function maps `live` → `webinar`. If analytics responses contain the string `live` in field values or labels, applying `applyCliTerms()` to them would transform them incorrectly.

**How to avoid:** Apply `applyCliTerms()` only to error messages and display strings the user will read. Do NOT apply it to raw API data values or field names. For the CLI command name itself, D-1 specifies `analytics live` (keeping `live`) — the term map is not applied to command names.

---

## Code Examples

### Analytics GET command skeleton

```typescript
// Source: established codebase pattern [VERIFIED via src/commands/comment/list.ts + src/commands/video/list.ts]
import { Flags } from '@oclif/core'
import chalk from 'chalk'
import { AuthenticatedCommand } from '../../../lib/base-command.js'
import { renderTable, formatJsonOutput, formatApiError, EXIT_ERROR } from '../../../lib/output.js'
import { applyCliTerms } from '../../../lib/term-map.js'

export default class AnalyticsVideoTimeseries extends AuthenticatedCommand<typeof AnalyticsVideoTimeseries> {
  static description = 'Get video analytics time series data'
  static enableJsonFlag = true

  static flags = {
    ...AuthenticatedCommand.baseFlags,
    'date-start': Flags.string({ description: 'First date (YYYY-MM-DD)', required: false }),
    'date-end': Flags.string({ description: 'Last date (YYYY-MM-DD)', required: false }),
    'date-expression': Flags.string({ description: 'Predefined range (e.g. thisweek)', required: false }),
    selection: Flags.string({ description: 'Scope to specific objects', required: false }),
    groupby: Flags.string({ description: 'Group results by dimension', required: false }),
    page: Flags.integer({ description: 'Page number (1-based)', required: false }),
    size: Flags.integer({ description: 'Page size', required: false }),
  }

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
          p: flags.page,
          size: flags.size,
        },
      },
    })

    if (error) {
      this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR })
    }

    const resp = data as any
    const rows: unknown[] = Array.isArray(resp?.data) ? resp.data : []

    if (this.jsonEnabled()) {
      return formatJsonOutput({
        ok: true,
        data: rows,
        summary: `${rows.length} row${rows.length === 1 ? '' : 's'}`,
        breadcrumbs: [{ domain: this.activeWorkspace.domain }, { resource: 'analytics' }],
      })
    }

    if (rows.length === 0) {
      this.log('No data found.')
      return
    }

    const headers = ['Date', 'Plays', 'Engagement', 'Playrate', 'Traffic']
    const tableRows = (rows as any[]).map((r) => [
      String(r.date ?? ''), String(r.plays ?? ''), String(r.engagement ?? ''),
      String(r.playrate ?? ''), String(r.traffic ?? ''),
    ])
    const table = renderTable(headers, tableRows)
    this.log(table.toString())
    this.log(chalk.dim(`${rows.length} row${rows.length === 1 ? '' : 's'}`))
  }
}
```

### Audience POST form mutation skeleton

```typescript
// Source: src/commands/comment/add.ts pattern [VERIFIED]
const body: Record<string, unknown> = {}
if (flags.email !== undefined) body.email = flags.email
if (flags['object-id'] !== undefined) body.object_id = Number(flags['object-id'])
// Add only defined flags

const { data, error } = await this.apiClient.POST('/audience/register', {
  body: body as any,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
if (error) { this.error(applyCliTerms(formatApiError(error)), { exit: EXIT_ERROR }) }
this.log(chalk.green('Contact registered'))
```

### `audience field set` POST with required fields

```typescript
// Source: spec [VERIFIED: required=['key','type','label']]
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

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `fetchAllPages` for all lists | Direct `--page`/`--size` exposure (D-4) | Phase 7 CONTEXT | Analytics and audience commands do NOT auto-paginate |
| `video` (singular) analytics path | `videos` (plural) in actual spec | N/A — spec always had plural | Planner must not use singular path in `apiClient.GET()` |

---

## Open Questions (RESOLVED)

1. **Root analytics commands (ANL-01, ANL-03, ANL-05)**
   - What we know: These require 2-level commands (`analytics video`, `analytics live`, `analytics conversions`) mapping to root API endpoints `/analytics/data/videos` etc. D-1 defines 3-level structure for sub-dimensions.
   - What's unclear: Whether oclif v4 supports having both `analytics/video.ts` (2-level) and `analytics/video/timeseries.ts` (3-level with same prefix) without conflict.
   - Recommendation: Planner should verify with `oclif manifest` during Wave 0. If conflict exists, use `analytics/videos.ts` for the root (accepting the command name is `analytics videos` plural) or skip root commands entirely (requirements describe sub-dimensions as the primary deliverable).
   - **RESOLVED:** Plan 07-02 uses `analytics/video/index.ts`, `analytics/live/index.ts`, and `analytics/conversions/index.ts` for root commands — oclif v4's filesystem-based topic discovery treats `index.ts` as the topic root command, coexisting cleanly with sub-dimension files in the same directory.

2. **`analytics live` term mapping for user output**
   - What we know: `live` → `webinar` per term map. CLI topic per D-1 is `analytics live` (not `analytics webinar`).
   - What's unclear: Whether analytics responses contain user-visible strings with `live` that should be mapped.
   - Recommendation: Do not apply `applyCliTerms()` to analytics data values. Apply only to error messages.
   - **RESOLVED:** Analytics data values pass through without term mapping (Pitfall 7 in RESEARCH.md). `applyCliTerms()` is not called on analytics response data.

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified — all packages already installed, no new tools required)

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest (configured in `packages/twentythree-cli/vitest.config.ts`) |
| Config file | `packages/twentythree-cli/vitest.config.ts` |
| Quick run command | `pnpm --filter twentythree-cli test --run` |
| Full suite command | `pnpm --filter twentythree-cli test --run` |

### Phase Requirements → Test Map

Based on existing test patterns (`.todo()` stubs in `__tests__` directories):

| Req ID | Behavior | Test Type | File |
|--------|----------|-----------|------|
| ANL-01 | `analytics video` root renders table / returns JSON | unit | `src/commands/analytics/video/__tests__/index.test.ts` (Wave 0) |
| ANL-02 | Sub-dimension commands pass date flags and pagination to API | unit | `src/commands/analytics/video/__tests__/timeseries.test.ts` etc. (Wave 0) |
| ANL-07 | Storage command renders despite no date params | unit | `src/commands/analytics/usage/__tests__/storage.test.ts` (Wave 0) |
| ANL-08 | `--json` returns `{ ok, data, summary, breadcrumbs }` | unit | Covered per command |
| AUD-01 | `audience list` renders table with uuid, name, email columns | unit | `src/commands/audience/__tests__/list.test.ts` (Wave 0) |
| AUD-02 | `audience search` uses GET with `--text` required | unit | `src/commands/audience/__tests__/search.test.ts` (Wave 0) |
| AUD-03 | `audience register` POST with email | unit | `src/commands/audience/__tests__/register.test.ts` (Wave 0) |
| AUD-12 | `audience field set` requires key/type/label | unit | `src/commands/audience/field/__tests__/set.test.ts` (Wave 0) |

### Sampling Rate
- **Per task commit:** `pnpm --filter twentythree-cli test --run`
- **Per wave merge:** `pnpm --filter twentythree-cli test --run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps (test stubs to create)
Following established pattern of `.todo()` stubs in `__tests__/` subdirectories:
- [ ] `src/commands/analytics/video/__tests__/timeseries.test.ts`
- [ ] `src/commands/analytics/usage/__tests__/storage.test.ts`
- [ ] `src/commands/audience/__tests__/list.test.ts`
- [ ] `src/commands/audience/__tests__/search.test.ts`
- [ ] `src/commands/audience/__tests__/register.test.ts`
- [ ] `src/commands/audience/field/__tests__/set.test.ts`

---

## Project Constraints (from CLAUDE.md)

All constraints from CLAUDE.md apply to Phase 7:

1. **TypeScript + Node.js only** — no other runtimes
2. **oclif v4** — 3-level topic structure via directory discovery (matches D-1, D-5)
3. **chalk 4.x (NOT 5.x)** — CJS-safe; chalk 5 is ESM-only
4. **ora 5.x (NOT 6.x)** — CJS-safe (not relevant for analytics/audience but don't break)
5. **openapi-fetch** — all API calls through `this.apiClient`, not native fetch
6. **`applyCliTerms()`** — applied to all user-visible output including error messages
7. **`parseBoolParam()`** — for boolean flags with `_p` suffix API params
8. **`renderTable()`** — for all list table output
9. **`formatJsonOutput()`** — for all `--json` output
10. **No `fetchAllPages` for Phase 7** — D-4 global pattern; direct `--page`/`--size` exposure
11. **Only flags !== undefined added to POST body** — prevents clearing unset fields
12. **GSD workflow enforcement** — edits only through GSD commands

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | oclif v4 auto-discovers `analytics/live/event-timeseries.ts` as command `analytics live event-timeseries` (hyphenated filename → hyphenated topic segment) | Architecture Patterns | Command not discovered or registered with wrong name |
| A2 | Analytics root commands (ANL-01/03/05) can coexist with sub-dimension files at same directory prefix without oclif manifest errors | Open Questions | Root commands need to be named differently or omitted |

---

## Sources

### Primary (HIGH confidence)
- `packages/twentythree-cli/specs/twentythree-api-swagger.json` — all endpoint methods, params, response schemas verified directly
- `packages/twentythree-cli/src/api/types.ts` — TypeScript types generated from spec; path strings verified
- `packages/twentythree-cli/src/commands/comment/add.ts` — POST form mutation pattern
- `packages/twentythree-cli/src/commands/comment/reaction/add.ts` — 3-level topic pattern
- `packages/twentythree-cli/src/commands/video/list.ts` — GET list with table pattern
- `packages/twentythree-cli/src/lib/output.ts` — output helpers
- `packages/twentythree-cli/src/lib/base-command.ts` — BaseCommand/AuthenticatedCommand

### Secondary (MEDIUM confidence)
- CONTEXT.md endpoint inventory table — used for scope/mapping; corrections noted where spec differs

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — unchanged from existing phases
- API endpoint shapes: HIGH — verified directly from spec and types.ts
- Architecture patterns: HIGH — derived from existing working commands
- Pitfalls: HIGH for verified items; MEDIUM for oclif topic coexistence (A2)

**Research date:** 2026-04-16
**Valid until:** 2026-07-16 (stable spec; check if spec updated before executing)

## RESEARCH COMPLETE
