---
name: analytics
description: Pull reporting data from TwentyThree — video, live, conversions, and usage metrics.
---

# TwentyThree Analytics Commands

> Query video, live, conversion, and usage analytics from TwentyThree. All analytics commands are read-only.
> Always use `--json` in agentic contexts for structured output.

## Prerequisites

Auth scope required: read (all analytics commands).
Run `twentythree auth credentials` if not already configured.
Verify: `twentythree auth status --json`

> For any flag not listed here, run `twentythree analytics <subtopic> <cmd> --agent` to get the complete flag list, types, and defaults.

## Shared Flag Pattern

All analytics commands share the same base flag set. This shared-flag block replaces per-command flag tables since every command accepts the same flags — listing them 21 times would add noise without adding information. Command-specific flags (where they exist) are noted per command.

| Flag | Required | Description |
|------|----------|-------------|
| `--date-start <YYYY-MM-DD>` | no | First date of the reporting window |
| `--date-end <YYYY-MM-DD>` | no | Last date of the reporting window |
| `--date-expression <value>` | no | Predefined range: `thisweek`, `thismonth`, `lastmonth`, `lastyear`, etc. |
| `--groupby <dimension>` | no | Group results by a dimension (e.g. video, category, domain) |
| `--orderby <field>` | no | Sort field |
| `--order <asc\|desc>` | no | Sort direction |
| `--page <n>` | no | Page number (where applicable) |
| `--size <n>` | no | Results per page (where applicable) |
| `--selection <value>` | no | Scope results to specific objects or types |

> For the exact flag set per subcommand (some add command-specific flags), run `twentythree analytics <subtopic> <cmd> --agent`.

## Commands

### analytics video

Video playback and engagement analytics. Auth scope: read for all commands.

#### analytics video totals

**Auth scope:** read  **Side effects:** none  **Output:** table (Plays, Engagement, Playrate, Avg View Time, Traffic)

```bash
# This month's video totals
twentythree analytics video totals --date-expression thismonth --json

# Video totals for a specific date range
twentythree analytics video totals --date-start 2026-01-01 --date-end 2026-03-31 --json
```

#### analytics video timeseries

**Auth scope:** read  **Side effects:** none  **Output:** table (time-series data points)

```bash
# Video time series for this month
twentythree analytics video timeseries --date-expression thismonth --json

# Time series for a custom range
twentythree analytics video timeseries --date-start 2026-04-01 --date-end 2026-04-30 --json
```

#### analytics video performance

**Auth scope:** read  **Side effects:** none  **Output:** table (per-video performance metrics)

```bash
# Performance metrics for all videos this month
twentythree analytics video performance --date-expression thismonth --json

# Performance ordered by plays descending
twentythree analytics video performance --date-expression lastmonth --orderby plays --order desc --json
```

#### analytics video published

**Auth scope:** read  **Side effects:** none  **Output:** table (analytics for published videos)

```bash
# Analytics for published videos this month
twentythree analytics video published --date-expression thismonth --json

# Published video analytics for a specific range
twentythree analytics video published --date-start 2026-01-01 --date-end 2026-03-31 --json
```

#### analytics video weekday

**Auth scope:** read  **Side effects:** none  **Output:** table (breakdown by day of week)

```bash
# Video plays broken down by weekday this month
twentythree analytics video weekday --date-expression thismonth --json

# Weekday breakdown for last month
twentythree analytics video weekday --date-expression lastmonth --json
```

---

### analytics live

Live/webinar analytics. Auth scope: read for all commands.

#### analytics live totals

**Auth scope:** read  **Side effects:** none  **Output:** table (Plays, Peak Viewers, Engagement, Playrate, Avg View Time)

```bash
# Live totals for this month
twentythree analytics live totals --date-expression thismonth --json

# Live totals for a specific range
twentythree analytics live totals --date-start 2026-01-01 --date-end 2026-03-31 --json
```

#### analytics live timeseries

**Auth scope:** read  **Side effects:** none  **Output:** table (time-series data points)

```bash
# Live time series for this month
twentythree analytics live timeseries --date-expression thismonth --json

# Live time series for a custom range
twentythree analytics live timeseries --date-start 2026-04-01 --date-end 2026-04-30 --json
```

#### analytics live event

**Auth scope:** read  **Side effects:** none  **Output:** table (event-level analytics)

```bash
# Event-level analytics for this month
twentythree analytics live event --date-expression thismonth --json

# Event analytics scoped to a specific live event
twentythree analytics live event --selection <live-id> --date-expression thismonth --json
```

#### analytics live event-timeseries

**Auth scope:** read  **Side effects:** none  **Output:** table (event time-series data)

```bash
# Event time-series for a specific live event
twentythree analytics live event-timeseries --date-start 2026-04-01 --date-end 2026-04-30 --selection <live-id> --json

# Event time-series for this month
twentythree analytics live event-timeseries --date-expression thismonth --json
```

#### analytics live event-totals

**Auth scope:** read  **Side effects:** none  **Output:** table (event totals)

```bash
# Totals for all live events this month
twentythree analytics live event-totals --date-expression thismonth --json

# Event totals for a specific event
twentythree analytics live event-totals --selection <live-id> --date-expression lastmonth --json
```

#### analytics live weekday

**Auth scope:** read  **Side effects:** none  **Output:** table (breakdown by day of week)

```bash
# Live viewership by weekday this month
twentythree analytics live weekday --date-expression thismonth --json

# Weekday breakdown for last month
twentythree analytics live weekday --date-expression lastmonth --json
```

---

### analytics conversions

Conversion tracking analytics. Auth scope: read for all commands.

#### analytics conversions totals

**Auth scope:** read  **Side effects:** none  **Output:** table (Conversions, Views, Visits, Engagement)

```bash
# Conversion totals for this month
twentythree analytics conversions totals --date-expression thismonth --json

# Conversion totals for a specific range
twentythree analytics conversions totals --date-start 2026-01-01 --date-end 2026-03-31 --json
```

#### analytics conversions timeseries

**Auth scope:** read  **Side effects:** none  **Output:** table (conversion time-series data)

```bash
# Conversion time series for this month
twentythree analytics conversions timeseries --date-expression thismonth --json

# Conversion time series for last month
twentythree analytics conversions timeseries --date-expression lastmonth --json
```

---

### analytics usage

Usage breakdown analytics (devices, domains, locations, and more). Auth scope: read for all commands.

#### analytics usage devices

**Auth scope:** read  **Side effects:** none  **Output:** table (Device, Plays, Engagement, Traffic, Impressions)

```bash
# Usage by device type this month
twentythree analytics usage devices --date-expression thismonth --json

# Last month's device usage ordered by plays
twentythree analytics usage devices --date-expression lastmonth --orderby plays --order desc --json
```

#### analytics usage domains

**Auth scope:** read  **Side effects:** none  **Output:** table (Domain, Plays, Traffic)

```bash
# Usage by domain this month
twentythree analytics usage domains --date-expression thismonth --json

# Domain usage for a custom date range
twentythree analytics usage domains --date-start 2026-01-01 --date-end 2026-03-31 --json
```

#### analytics usage locations

**Auth scope:** read  **Side effects:** none  **Output:** table (Location, Plays, Traffic)

```bash
# Usage by location this month
twentythree analytics usage locations --date-expression thismonth --json

# Location breakdown for last month
twentythree analytics usage locations --date-expression lastmonth --orderby plays --order desc --json
```

#### analytics usage sources

**Auth scope:** read  **Side effects:** none  **Output:** table (Source, Plays, Traffic)

```bash
# Usage by traffic source this month
twentythree analytics usage sources --date-expression thismonth --json

# Source breakdown for a specific range
twentythree analytics usage sources --date-start 2026-04-01 --date-end 2026-04-30 --json
```

#### analytics usage sourceids

**Auth scope:** read  **Side effects:** none  **Output:** table (Source ID, Plays, Traffic)

```bash
# Usage by source ID this month
twentythree analytics usage sourceids --date-expression thismonth --json

# Source ID breakdown for last month
twentythree analytics usage sourceids --date-expression lastmonth --json
```

#### analytics usage spots

**Auth scope:** read  **Side effects:** none  **Output:** table (Spot, Plays, Traffic)

```bash
# Usage by spot this month
twentythree analytics usage spots --date-expression thismonth --json

# Spot usage for a specific date range
twentythree analytics usage spots --date-start 2026-01-01 --date-end 2026-03-31 --json
```

#### analytics usage storage

**Auth scope:** read  **Side effects:** none  **Output:** key-value (storage totals)

```bash
# Full storage usage report
twentythree analytics usage storage --json

# Storage usage scoped to videos only
twentythree analytics usage storage --selection videos --json
```

#### analytics usage traffic

**Auth scope:** read  **Side effects:** none  **Output:** table (Traffic Type, Plays)

```bash
# Usage by traffic type this month
twentythree analytics usage traffic --date-expression thismonth --json

# Traffic breakdown for last month
twentythree analytics usage traffic --date-expression lastmonth --orderby plays --order desc --json
```

## Common Patterns

### This month's video totals

```bash
twentythree analytics video totals --date-expression thismonth --json
```

### Last period traffic by device

```bash
twentythree analytics usage devices --date-expression lastmonth --orderby plays --order desc --json
```

### Time-series for a specific live event

```bash
twentythree analytics live event-timeseries --date-start 2026-04-01 --date-end 2026-04-30 --selection <live-id> --json
```

### Storage usage report

```bash
twentythree analytics usage storage --json
```
