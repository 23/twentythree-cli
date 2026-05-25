`twentythree analytics:live`
============================

Get live/webinar analytics data

* [`twentythree analytics live`](#twentythree-analytics-live)
* [`twentythree analytics live event`](#twentythree-analytics-live-event)
* [`twentythree analytics live event-timeseries`](#twentythree-analytics-live-event-timeseries)
* [`twentythree analytics live event-totals`](#twentythree-analytics-live-event-totals)
* [`twentythree analytics live timeseries`](#twentythree-analytics-live-timeseries)
* [`twentythree analytics live totals`](#twentythree-analytics-live-totals)
* [`twentythree analytics live weekday`](#twentythree-analytics-live-weekday)
* [`twentythree analytics live weekday timeseries`](#twentythree-analytics-live-weekday-timeseries)
* [`twentythree analytics live weekday totals`](#twentythree-analytics-live-weekday-totals)

## `twentythree analytics live`

Get live/webinar analytics data

```
USAGE
  $ twentythree analytics live [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
    <value>] [--page <value>] [--size <value>] [--selection <value>] [--groupby <value>] [--orderby <value>] [--order
    <value>]

FLAGS
  --date-end=<value>         Last date (YYYY-MM-DD)
  --date-expression=<value>  Predefined date range (e.g. thisweek, lastyear)
  --date-start=<value>       First date (YYYY-MM-DD)
  --groupby=<value>          Group results by dimension
  --order=<value>            Sort direction (asc/desc)
  --orderby=<value>          Order results by field
  --page=<value>             Page number
  --selection=<value>        Scope to specific objects/types
  --size=<value>             Page size

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get live/webinar analytics data

EXAMPLES
  $ twentythree analytics live --date-expression thisweek

  $ twentythree analytics live --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics live --json
```

_See code: [src/commands/analytics/live/index.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/live/index.ts)_

## `twentythree analytics live event`

Get live/webinar event analytics

```
USAGE
  $ twentythree analytics live event [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
    <value>] [--page <value>] [--size <value>] [--selection <value>] [--groupby <value>] [--orderby <value>] [--order
    <value>]

FLAGS
  --date-end=<value>         Last date (YYYY-MM-DD)
  --date-expression=<value>  Predefined date range (e.g. thisweek, lastyear)
  --date-start=<value>       First date (YYYY-MM-DD)
  --groupby=<value>          Group results by dimension
  --order=<value>            Sort direction (asc/desc)
  --orderby=<value>          Order results by field
  --page=<value>             Page number
  --selection=<value>        Scope to specific objects/types
  --size=<value>             Page size

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get live/webinar event analytics

EXAMPLES
  $ twentythree analytics live event --date-expression thismonth

  $ twentythree analytics live event --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics live event --json
```

_See code: [src/commands/analytics/live/event.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/live/event.ts)_

## `twentythree analytics live event-timeseries`

Get live/webinar event time series analytics

```
USAGE
  $ twentythree analytics live event-timeseries [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
    <value>] [--selection <value>] [--groupby <value>] [--orderby <value>] [--order <value>]

FLAGS
  --date-end=<value>         Last date (YYYY-MM-DD)
  --date-expression=<value>  Predefined date range (e.g. thisweek, lastyear)
  --date-start=<value>       First date (YYYY-MM-DD)
  --groupby=<value>          Group results by dimension
  --order=<value>            Sort direction (asc/desc)
  --orderby=<value>          Order results by field
  --selection=<value>        Scope to specific objects/types

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get live/webinar event time series analytics

EXAMPLES
  $ twentythree analytics live event-timeseries --date-expression thisweek

  $ twentythree analytics live event-timeseries --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics live event-timeseries --json
```

_See code: [src/commands/analytics/live/event-timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/live/event-timeseries.ts)_

## `twentythree analytics live event-totals`

Get live/webinar event totals analytics

```
USAGE
  $ twentythree analytics live event-totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
    <value>] [--selection <value>] [--groupby <value>] [--orderby <value>] [--order <value>]

FLAGS
  --date-end=<value>         Last date (YYYY-MM-DD)
  --date-expression=<value>  Predefined date range (e.g. thisweek, lastyear)
  --date-start=<value>       First date (YYYY-MM-DD)
  --groupby=<value>          Group results by dimension
  --order=<value>            Sort direction (asc/desc)
  --orderby=<value>          Order results by field
  --selection=<value>        Scope to specific objects/types

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get live/webinar event totals analytics

EXAMPLES
  $ twentythree analytics live event-totals --date-expression thisweek

  $ twentythree analytics live event-totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics live event-totals --json
```

_See code: [src/commands/analytics/live/event-totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/live/event-totals.ts)_

## `twentythree analytics live timeseries`

Get live/webinar analytics time series data

```
USAGE
  $ twentythree analytics live timeseries [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
    <value>] [--selection <value>] [--groupby <value>] [--orderby <value>] [--order <value>]

FLAGS
  --date-end=<value>         Last date (YYYY-MM-DD)
  --date-expression=<value>  Predefined date range (e.g. thisweek, lastyear)
  --date-start=<value>       First date (YYYY-MM-DD)
  --groupby=<value>          Group results by dimension
  --order=<value>            Sort direction (asc/desc)
  --orderby=<value>          Order results by field
  --selection=<value>        Scope to specific objects/types

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get live/webinar analytics time series data

EXAMPLES
  $ twentythree analytics live timeseries --date-expression thisweek

  $ twentythree analytics live timeseries --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics live timeseries --json
```

_See code: [src/commands/analytics/live/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/live/timeseries.ts)_

## `twentythree analytics live totals`

Get live/webinar analytics totals

```
USAGE
  $ twentythree analytics live totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
    <value>] [--selection <value>] [--groupby <value>] [--orderby <value>] [--order <value>]

FLAGS
  --date-end=<value>         Last date (YYYY-MM-DD)
  --date-expression=<value>  Predefined date range (e.g. thisweek, lastyear)
  --date-start=<value>       First date (YYYY-MM-DD)
  --groupby=<value>          Group results by dimension
  --order=<value>            Sort direction (asc/desc)
  --orderby=<value>          Order results by field
  --selection=<value>        Scope to specific objects/types

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get live/webinar analytics totals

EXAMPLES
  $ twentythree analytics live totals --date-expression thisweek

  $ twentythree analytics live totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics live totals --json
```

_See code: [src/commands/analytics/live/totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/live/totals.ts)_

## `twentythree analytics live weekday`

Get live/webinar analytics by day of week

```
USAGE
  $ twentythree analytics live weekday [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
    <value>] [--page <value>] [--size <value>] [--selection <value>] [--groupby <value>] [--orderby <value>] [--order
    <value>]

FLAGS
  --date-end=<value>         Last date (YYYY-MM-DD)
  --date-expression=<value>  Predefined date range (e.g. thisweek, lastyear)
  --date-start=<value>       First date (YYYY-MM-DD)
  --groupby=<value>          Group results by dimension
  --order=<value>            Sort direction (asc/desc)
  --orderby=<value>          Order results by field
  --page=<value>             Page number
  --selection=<value>        Scope to specific objects/types
  --size=<value>             Page size

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get live/webinar analytics by day of week

EXAMPLES
  $ twentythree analytics live weekday --date-expression thismonth

  $ twentythree analytics live weekday --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics live weekday --json
```

_See code: [src/commands/analytics/live/weekday.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/live/weekday.ts)_

## `twentythree analytics live weekday timeseries`

Get live/webinar analytics by weekday - time series

```
USAGE
  $ twentythree analytics live weekday timeseries [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
    <value>] [--selection <value>] [--groupby <value>] [--orderby <value>] [--order <value>]

FLAGS
  --date-end=<value>         Last date (YYYY-MM-DD)
  --date-expression=<value>  Predefined date range (e.g. thisweek, lastyear)
  --date-start=<value>       First date (YYYY-MM-DD)
  --groupby=<value>          Group results by dimension
  --order=<value>            Sort direction (asc/desc)
  --orderby=<value>          Order results by field
  --selection=<value>        Scope to specific objects/types

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get live/webinar analytics by weekday - time series

EXAMPLES
  $ twentythree analytics live weekday timeseries --date-expression thisweek

  $ twentythree analytics live weekday timeseries --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics live weekday timeseries --json
```

_See code: [src/commands/analytics/live/weekday/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/live/weekday/timeseries.ts)_

## `twentythree analytics live weekday totals`

Get aggregated live/webinar analytics by weekday - totals

```
USAGE
  $ twentythree analytics live weekday totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
    <value>] [--selection <value>] [--groupby <value>] [--orderby <value>] [--order <value>]

FLAGS
  --date-end=<value>         Last date (YYYY-MM-DD)
  --date-expression=<value>  Predefined date range (e.g. thisweek, lastyear)
  --date-start=<value>       First date (YYYY-MM-DD)
  --groupby=<value>          Group results by dimension
  --order=<value>            Sort direction (asc/desc)
  --orderby=<value>          Order results by field
  --selection=<value>        Scope to specific objects/types

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get aggregated live/webinar analytics by weekday - totals

EXAMPLES
  $ twentythree analytics live weekday totals --date-expression thismonth

  $ twentythree analytics live weekday totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics live weekday totals --json
```

_See code: [src/commands/analytics/live/weekday/totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/live/weekday/totals.ts)_
