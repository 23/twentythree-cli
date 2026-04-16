---
phase: 07-analytics-audience
created: 2026-04-16
status: ready
---

# Phase 7 Context: Analytics & Audience

## Scope

Commands for analytics (video, live/webinar, conversions, usage) and audience management (members, search, metrics, funnel, timelines, companies, identity sources, collectors, custom fields).

---

## Decisions

### D-1: Analytics sub-command structure — 3-level oclif topic

Analytics endpoints group as `analytics/<resource>/<dimension>`. Use 3-level oclif topics via directory structure:

```
analytics/video/timeseries.ts   → twentythree analytics video timeseries
analytics/video/totals.ts       → twentythree analytics video totals
analytics/live/timeseries.ts    → twentythree analytics live timeseries
analytics/usage/storage.ts      → twentythree analytics usage storage
```

**Rationale:** Consistent with `comment reaction add` pattern. Directory discovery creates the topic automatically — no manual registration.

**Full sub-command map:**
- `analytics video timeseries|totals|weekday|performance|published` → `/analytics/video/<dim>`
- `analytics live timeseries|totals|weekday|event|event-timeseries|event-totals` → `/analytics/live/<dim>`
- `analytics conversions timeseries|totals` → `/analytics/conversions/<dim>`
- `analytics usage devices|domains|locations|sources|sourceids|spots|storage|traffic` → `/analytics/usage/<dim>`

### D-2: Date filter flags — mirror API exactly

All analytics commands that accept date filters use:
- `--date-start` (maps to `date_start`)
- `--date-end` (maps to `date_end`)
- `--date-expression` (maps to `date_expression`)

No friendlier aliases (`--from`, `--to`, `--period`). API naming is the CLI naming.

### D-3: Date filter flags — expose both `--date-start`/`--date-end` and `--date-expression`

Both filtering modes are supported on the same command:
- Custom range: `--date-start 2026-01-01 --date-end 2026-03-31`
- Predefined range: `--date-expression thisweek`

Both are optional flags. When both are provided, pass both to the API (let the API resolve precedence). The CLI does not enforce mutual exclusivity.

**`/analytics/data/usage/storage` anomaly:** This endpoint ignores date filters (returns current month only). Still expose `--date-start`/`--date-end`/`--date-expression` flags for consistency — the API silently ignores them, which is acceptable.

### D-4: Pagination — expose `--offset` / `--size` directly (applies to all phases)

Do **not** fetch all pages in a loop. Expose `--offset` and `--size` directly as CLI flags when the API endpoint supports them.

This is a **global pattern** applying to all commands across all phases — not just Phase 7. Any existing command that currently loops to fetch all pages should be considered out of pattern (though existing commands are not retroactively refactored in this phase).

**CLI:**
```
twentythree audience search --query "john" --offset 0 --size 25
twentythree audience list --offset 0 --size 50
```

Flag naming: `--offset` (maps to `offset`), `--size` (maps to `size`). If an endpoint uses different pagination param names (e.g., `p`/`size`), map to `--page`/`--size`.

**Note on analytics pagination:** Analytics endpoints use `p` (page number) and `size`. Map `p` → `--page`, `size` → `--size`.

### D-5: `audience field` — 3-level oclif topic

AUD-12 field management uses directory structure:

```
audience/field/list.ts    → twentythree audience field list
audience/field/set.ts     → twentythree audience field set
audience/field/remove.ts  → twentythree audience field remove
audience/field/types.ts   → twentythree audience field types
```

Consistent with `comment reaction` and `analytics <resource> <dimension>` patterns.

**API note:** `/audience/field/list` and `/audience/field/types` use POST (unusual for read operations — follow the API as-is).

---

## Established Patterns (from prior phases)

- **Term mapping**: `live_*` → `webinar-*`, `photo_*` → `video-*`, `album_*` → `category-*`, `object` → stays as `object`
- **Boolean `_p` suffix**: drop `_p` (e.g., `open_p` → `--open`)
- **Action commands**: single green success line; `--json` returns `{ ok, data, summary, breadcrumbs }`
- **List commands**: `renderTable()` + dim count line; empty state: "No X found."
- **3-level topics**: directory structure creates topic automatically (no manual registration)
- **`applyCliTerms()`**: applied to all user-facing strings and error messages
- **Confirmation prompts**: destructive commands confirm with domain in message; exit code 2 on cancel

---

## API Endpoint Inventory

| CLI command | API endpoint | Method |
|---|---|---|
| `analytics video timeseries` | `/analytics/data/video/timeseries` | GET |
| `analytics video totals` | `/analytics/data/video/totals` | GET |
| `analytics video weekday` | `/analytics/data/video/weekday` | GET |
| `analytics video performance` | `/analytics/data/video/performance` | GET |
| `analytics video published` | `/analytics/data/video/published` | GET |
| `analytics live timeseries` | `/analytics/data/live/timeseries` | GET |
| `analytics live totals` | `/analytics/data/live/totals` | GET |
| `analytics live weekday` | `/analytics/data/live/weekday` | GET |
| `analytics live event` | `/analytics/data/live/event` | GET |
| `analytics live event-timeseries` | `/analytics/data/live/event-timeseries` | GET |
| `analytics live event-totals` | `/analytics/data/live/event-totals` | GET |
| `analytics conversions timeseries` | `/analytics/data/conversions/timeseries` | GET |
| `analytics conversions totals` | `/analytics/data/conversions/totals` | GET |
| `analytics usage devices` | `/analytics/data/usage/devices` | GET |
| `analytics usage domains` | `/analytics/data/usage/domains` | GET |
| `analytics usage locations` | `/analytics/data/usage/locations` | GET |
| `analytics usage sources` | `/analytics/data/usage/sources` | GET |
| `analytics usage sourceids` | `/analytics/data/usage/sourceids` | GET |
| `analytics usage spots` | `/analytics/data/usage/spots` | GET |
| `analytics usage storage` | `/analytics/data/usage/storage` | GET |
| `analytics usage traffic` | `/analytics/data/usage/traffic` | GET |
| `audience list` | `/audience/list` | GET |
| `audience search` | `/audience/search` | POST form |
| `audience register` | `/audience/register` | POST form |
| `audience unregister` | `/audience/unregister` | POST form |
| `audience remove` | `/audience/remove` | POST form |
| `audience metrics` | `/audience/metrics` | GET |
| `audience funnel` | `/audience/funnel` | GET |
| `audience timelines` | `/audience/timelines` | GET |
| `audience companies` | `/audience/companies` | GET |
| `audience identity-sources` | `/audience/identity-sources` | GET |
| `audience list-collectors` | `/audience/list-collectors` | GET |
| `audience field list` | `/audience/field/list` | POST form |
| `audience field set` | `/audience/field/set` | POST form |
| `audience field remove` | `/audience/field/remove` | POST form |
| `audience field types` | `/audience/field/types` | POST form |
