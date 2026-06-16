`twentythree analytics`
=======================

Get conversion analytics data

* [`twentythree analytics conversions`](#twentythree-analytics-conversions)
* [`twentythree analytics conversions timeseries`](#twentythree-analytics-conversions-timeseries)
* [`twentythree analytics conversions totals`](#twentythree-analytics-conversions-totals)
* [`twentythree analytics live`](#twentythree-analytics-live)
* [`twentythree analytics live event`](#twentythree-analytics-live-event)
* [`twentythree analytics live event-timeseries`](#twentythree-analytics-live-event-timeseries)
* [`twentythree analytics live event-totals`](#twentythree-analytics-live-event-totals)
* [`twentythree analytics live timeseries`](#twentythree-analytics-live-timeseries)
* [`twentythree analytics live totals`](#twentythree-analytics-live-totals)
* [`twentythree analytics live weekday`](#twentythree-analytics-live-weekday)
* [`twentythree analytics live weekday timeseries`](#twentythree-analytics-live-weekday-timeseries)
* [`twentythree analytics live weekday totals`](#twentythree-analytics-live-weekday-totals)
* [`twentythree analytics usage devices`](#twentythree-analytics-usage-devices)
* [`twentythree analytics usage devices timeseries`](#twentythree-analytics-usage-devices-timeseries)
* [`twentythree analytics usage devices totals`](#twentythree-analytics-usage-devices-totals)
* [`twentythree analytics usage domains`](#twentythree-analytics-usage-domains)
* [`twentythree analytics usage domains totals`](#twentythree-analytics-usage-domains-totals)
* [`twentythree analytics usage locations`](#twentythree-analytics-usage-locations)
* [`twentythree analytics usage locations totals`](#twentythree-analytics-usage-locations-totals)
* [`twentythree analytics usage sourceids`](#twentythree-analytics-usage-sourceids)
* [`twentythree analytics usage sourceids totals`](#twentythree-analytics-usage-sourceids-totals)
* [`twentythree analytics usage sources`](#twentythree-analytics-usage-sources)
* [`twentythree analytics usage sources totals`](#twentythree-analytics-usage-sources-totals)
* [`twentythree analytics usage spots`](#twentythree-analytics-usage-spots)
* [`twentythree analytics usage spots timeseries`](#twentythree-analytics-usage-spots-timeseries)
* [`twentythree analytics usage spots totals`](#twentythree-analytics-usage-spots-totals)
* [`twentythree analytics usage storage`](#twentythree-analytics-usage-storage)
* [`twentythree analytics usage traffic`](#twentythree-analytics-usage-traffic)
* [`twentythree analytics usage traffic timeseries`](#twentythree-analytics-usage-traffic-timeseries)
* [`twentythree analytics usage traffic totals`](#twentythree-analytics-usage-traffic-totals)
* [`twentythree analytics video`](#twentythree-analytics-video)
* [`twentythree analytics video performance`](#twentythree-analytics-video-performance)
* [`twentythree analytics video performance timeseries`](#twentythree-analytics-video-performance-timeseries)
* [`twentythree analytics video performance totals`](#twentythree-analytics-video-performance-totals)
* [`twentythree analytics video published`](#twentythree-analytics-video-published)
* [`twentythree analytics video published timeseries`](#twentythree-analytics-video-published-timeseries)
* [`twentythree analytics video published totals`](#twentythree-analytics-video-published-totals)
* [`twentythree analytics video timeseries`](#twentythree-analytics-video-timeseries)
* [`twentythree analytics video totals`](#twentythree-analytics-video-totals)
* [`twentythree analytics video weekday`](#twentythree-analytics-video-weekday)
* [`twentythree analytics video weekday timeseries`](#twentythree-analytics-video-weekday-timeseries)
* [`twentythree analytics video weekday totals`](#twentythree-analytics-video-weekday-totals)

## `twentythree analytics conversions`

Get conversion analytics data

```
USAGE
  $ twentythree analytics conversions [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get conversion analytics data

EXAMPLES
  $ twentythree analytics conversions --date-expression thisweek

  $ twentythree analytics conversions --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics conversions --json
```

_See code: [src/commands/analytics/conversions/index.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/conversions/index.ts)_

## `twentythree analytics conversions timeseries`

Get conversion analytics time series data

```
USAGE
  $ twentythree analytics conversions timeseries [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get conversion analytics time series data

EXAMPLES
  $ twentythree analytics conversions timeseries --date-expression thisweek

  $ twentythree analytics conversions timeseries --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics conversions timeseries --json
```

_See code: [src/commands/analytics/conversions/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/conversions/timeseries.ts)_

## `twentythree analytics conversions totals`

Get conversion analytics totals

```
USAGE
  $ twentythree analytics conversions totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get conversion analytics totals

EXAMPLES
  $ twentythree analytics conversions totals --date-expression thisweek

  $ twentythree analytics conversions totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics conversions totals --json
```

_See code: [src/commands/analytics/conversions/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/conversions/totals.ts)_

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

_See code: [src/commands/analytics/live/index.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/live/index.ts)_

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

_See code: [src/commands/analytics/live/event.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/live/event.ts)_

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

_See code: [src/commands/analytics/live/event-timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/live/event-timeseries.ts)_

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

_See code: [src/commands/analytics/live/event-totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/live/event-totals.ts)_

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

_See code: [src/commands/analytics/live/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/live/timeseries.ts)_

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

_See code: [src/commands/analytics/live/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/live/totals.ts)_

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

_See code: [src/commands/analytics/live/weekday.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/live/weekday.ts)_

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

_See code: [src/commands/analytics/live/weekday/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/live/weekday/timeseries.ts)_

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

_See code: [src/commands/analytics/live/weekday/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/live/weekday/totals.ts)_

## `twentythree analytics usage devices`

Get usage analytics by device type

```
USAGE
  $ twentythree analytics usage devices [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get usage analytics by device type

EXAMPLES
  $ twentythree analytics usage devices --date-expression thismonth

  $ twentythree analytics usage devices --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics usage devices --json
```

_See code: [src/commands/analytics/usage/devices.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/devices.ts)_

## `twentythree analytics usage devices timeseries`

Get usage analytics by device type - time series

```
USAGE
  $ twentythree analytics usage devices timeseries [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get usage analytics by device type - time series

EXAMPLES
  $ twentythree analytics usage devices timeseries --date-expression thisweek

  $ twentythree analytics usage devices timeseries --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics usage devices timeseries --json
```

_See code: [src/commands/analytics/usage/devices/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/devices/timeseries.ts)_

## `twentythree analytics usage devices totals`

Get aggregated usage analytics by device type - totals

```
USAGE
  $ twentythree analytics usage devices totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get aggregated usage analytics by device type - totals

EXAMPLES
  $ twentythree analytics usage devices totals --date-expression thismonth

  $ twentythree analytics usage devices totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics usage devices totals --json
```

_See code: [src/commands/analytics/usage/devices/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/devices/totals.ts)_

## `twentythree analytics usage domains`

Get usage analytics by domain

```
USAGE
  $ twentythree analytics usage domains [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get usage analytics by domain

EXAMPLES
  $ twentythree analytics usage domains --date-expression thismonth

  $ twentythree analytics usage domains --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics usage domains --json
```

_See code: [src/commands/analytics/usage/domains.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/domains.ts)_

## `twentythree analytics usage domains totals`

Get aggregated usage analytics by embed domain - totals

```
USAGE
  $ twentythree analytics usage domains totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get aggregated usage analytics by embed domain - totals

EXAMPLES
  $ twentythree analytics usage domains totals --date-expression thismonth

  $ twentythree analytics usage domains totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics usage domains totals --json
```

_See code: [src/commands/analytics/usage/domains/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/domains/totals.ts)_

## `twentythree analytics usage locations`

Get usage analytics by location

```
USAGE
  $ twentythree analytics usage locations [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get usage analytics by location

EXAMPLES
  $ twentythree analytics usage locations --date-expression thismonth

  $ twentythree analytics usage locations --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics usage locations --json
```

_See code: [src/commands/analytics/usage/locations.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/locations.ts)_

## `twentythree analytics usage locations totals`

Get aggregated usage analytics by location - totals

```
USAGE
  $ twentythree analytics usage locations totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get aggregated usage analytics by location - totals

EXAMPLES
  $ twentythree analytics usage locations totals --date-expression thismonth

  $ twentythree analytics usage locations totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics usage locations totals --json
```

_See code: [src/commands/analytics/usage/locations/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/locations/totals.ts)_

## `twentythree analytics usage sourceids`

Get usage analytics by source ID

```
USAGE
  $ twentythree analytics usage sourceids [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get usage analytics by source ID

EXAMPLES
  $ twentythree analytics usage sourceids --date-expression thismonth

  $ twentythree analytics usage sourceids --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics usage sourceids --json
```

_See code: [src/commands/analytics/usage/sourceids.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/sourceids.ts)_

## `twentythree analytics usage sourceids totals`

Get aggregated usage analytics by source ID - totals

```
USAGE
  $ twentythree analytics usage sourceids totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get aggregated usage analytics by source ID - totals

EXAMPLES
  $ twentythree analytics usage sourceids totals --date-expression thismonth

  $ twentythree analytics usage sourceids totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics usage sourceids totals --json
```

_See code: [src/commands/analytics/usage/sourceids/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/sourceids/totals.ts)_

## `twentythree analytics usage sources`

Get usage analytics by traffic source

```
USAGE
  $ twentythree analytics usage sources [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get usage analytics by traffic source

EXAMPLES
  $ twentythree analytics usage sources --date-expression thismonth

  $ twentythree analytics usage sources --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics usage sources --json
```

_See code: [src/commands/analytics/usage/sources.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/sources.ts)_

## `twentythree analytics usage sources totals`

Get aggregated usage analytics by source - totals

```
USAGE
  $ twentythree analytics usage sources totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get aggregated usage analytics by source - totals

EXAMPLES
  $ twentythree analytics usage sources totals --date-expression thismonth

  $ twentythree analytics usage sources totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics usage sources totals --json
```

_See code: [src/commands/analytics/usage/sources/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/sources/totals.ts)_

## `twentythree analytics usage spots`

Get usage analytics by spot

```
USAGE
  $ twentythree analytics usage spots [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get usage analytics by spot

EXAMPLES
  $ twentythree analytics usage spots --date-expression thismonth

  $ twentythree analytics usage spots --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics usage spots --json
```

_See code: [src/commands/analytics/usage/spots.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/spots.ts)_

## `twentythree analytics usage spots timeseries`

Get spot usage analytics - time series

```
USAGE
  $ twentythree analytics usage spots timeseries [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get spot usage analytics - time series

EXAMPLES
  $ twentythree analytics usage spots timeseries --date-expression thisweek

  $ twentythree analytics usage spots timeseries --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics usage spots timeseries --json
```

_See code: [src/commands/analytics/usage/spots/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/spots/timeseries.ts)_

## `twentythree analytics usage spots totals`

Get aggregated spot usage analytics - totals

```
USAGE
  $ twentythree analytics usage spots totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get aggregated spot usage analytics - totals

EXAMPLES
  $ twentythree analytics usage spots totals --date-expression thismonth

  $ twentythree analytics usage spots totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics usage spots totals --json
```

_See code: [src/commands/analytics/usage/spots/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/spots/totals.ts)_

## `twentythree analytics usage storage`

Get storage usage analytics

```
USAGE
  $ twentythree analytics usage storage [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get storage usage analytics

EXAMPLES
  $ twentythree analytics usage storage

  $ twentythree analytics usage storage --json

  $ twentythree analytics usage storage --selection videos
```

_See code: [src/commands/analytics/usage/storage.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/storage.ts)_

## `twentythree analytics usage traffic`

Get usage analytics by traffic type

```
USAGE
  $ twentythree analytics usage traffic [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get usage analytics by traffic type

EXAMPLES
  $ twentythree analytics usage traffic --date-expression thismonth

  $ twentythree analytics usage traffic --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics usage traffic --json
```

_See code: [src/commands/analytics/usage/traffic.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/traffic.ts)_

## `twentythree analytics usage traffic timeseries`

Get traffic usage analytics - time series

```
USAGE
  $ twentythree analytics usage traffic timeseries [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get traffic usage analytics - time series

EXAMPLES
  $ twentythree analytics usage traffic timeseries --date-expression thisweek

  $ twentythree analytics usage traffic timeseries --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics usage traffic timeseries --json
```

_See code: [src/commands/analytics/usage/traffic/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/traffic/timeseries.ts)_

## `twentythree analytics usage traffic totals`

Get aggregated traffic usage analytics - totals

```
USAGE
  $ twentythree analytics usage traffic totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get aggregated traffic usage analytics - totals

EXAMPLES
  $ twentythree analytics usage traffic totals --date-expression thismonth

  $ twentythree analytics usage traffic totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics usage traffic totals --json
```

_See code: [src/commands/analytics/usage/traffic/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/usage/traffic/totals.ts)_

## `twentythree analytics video`

Get video analytics data

```
USAGE
  $ twentythree analytics video [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get video analytics data

EXAMPLES
  $ twentythree analytics video --date-expression thisweek

  $ twentythree analytics video --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics video --json
```

_See code: [src/commands/analytics/video/index.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/video/index.ts)_

## `twentythree analytics video performance`

Get video performance analytics

```
USAGE
  $ twentythree analytics video performance [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get video performance analytics

EXAMPLES
  $ twentythree analytics video performance --date-expression thismonth

  $ twentythree analytics video performance --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics video performance --json
```

_See code: [src/commands/analytics/video/performance.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/video/performance.ts)_

## `twentythree analytics video performance timeseries`

Get video playthrough performance - time series

```
USAGE
  $ twentythree analytics video performance timeseries [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get video playthrough performance - time series

EXAMPLES
  $ twentythree analytics video performance timeseries --date-expression thisweek

  $ twentythree analytics video performance timeseries --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics video performance timeseries --json
```

_See code: [src/commands/analytics/video/performance/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/video/performance/timeseries.ts)_

## `twentythree analytics video performance totals`

Get aggregated video playthrough performance - totals

```
USAGE
  $ twentythree analytics video performance totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get aggregated video playthrough performance - totals

EXAMPLES
  $ twentythree analytics video performance totals --date-expression thisweek

  $ twentythree analytics video performance totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics video performance totals --json
```

_See code: [src/commands/analytics/video/performance/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/video/performance/totals.ts)_

## `twentythree analytics video published`

Get analytics for published videos

```
USAGE
  $ twentythree analytics video published [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get analytics for published videos

EXAMPLES
  $ twentythree analytics video published --date-expression thismonth

  $ twentythree analytics video published --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics video published --json
```

_See code: [src/commands/analytics/video/published.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/video/published.ts)_

## `twentythree analytics video published timeseries`

Get video analytics by publish date - time series

```
USAGE
  $ twentythree analytics video published timeseries [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get video analytics by publish date - time series

EXAMPLES
  $ twentythree analytics video published timeseries --date-expression thisweek

  $ twentythree analytics video published timeseries --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics video published timeseries --json
```

_See code: [src/commands/analytics/video/published/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/video/published/timeseries.ts)_

## `twentythree analytics video published totals`

Get aggregated video analytics by publish date - totals

```
USAGE
  $ twentythree analytics video published totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get aggregated video analytics by publish date - totals

EXAMPLES
  $ twentythree analytics video published totals --date-expression thisweek

  $ twentythree analytics video published totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics video published totals --json
```

_See code: [src/commands/analytics/video/published/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/video/published/totals.ts)_

## `twentythree analytics video timeseries`

Get video analytics time series data

```
USAGE
  $ twentythree analytics video timeseries [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get video analytics time series data

EXAMPLES
  $ twentythree analytics video timeseries --date-expression thisweek

  $ twentythree analytics video timeseries --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics video timeseries --json
```

_See code: [src/commands/analytics/video/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/video/timeseries.ts)_

## `twentythree analytics video totals`

Get aggregated video analytics totals

```
USAGE
  $ twentythree analytics video totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get aggregated video analytics totals

EXAMPLES
  $ twentythree analytics video totals --date-expression thismonth

  $ twentythree analytics video totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics video totals --json
```

_See code: [src/commands/analytics/video/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/video/totals.ts)_

## `twentythree analytics video weekday`

Get video analytics broken down by day of week

```
USAGE
  $ twentythree analytics video weekday [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get video analytics broken down by day of week

EXAMPLES
  $ twentythree analytics video weekday --date-expression thismonth

  $ twentythree analytics video weekday --date-start 2024-01-01 --date-end 2024-01-31 --page 1 --size 20

  $ twentythree analytics video weekday --json
```

_See code: [src/commands/analytics/video/weekday.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/video/weekday.ts)_

## `twentythree analytics video weekday timeseries`

Get video analytics by weekday - time series

```
USAGE
  $ twentythree analytics video weekday timeseries [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get video analytics by weekday - time series

EXAMPLES
  $ twentythree analytics video weekday timeseries --date-expression thisweek

  $ twentythree analytics video weekday timeseries --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics video weekday timeseries --json
```

_See code: [src/commands/analytics/video/weekday/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/video/weekday/timeseries.ts)_

## `twentythree analytics video weekday totals`

Get aggregated video analytics by weekday - totals

```
USAGE
  $ twentythree analytics video weekday totals [--json] [-w <value>] [--date-start <value>] [--date-end <value>] [--date-expression
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
  Get aggregated video analytics by weekday - totals

EXAMPLES
  $ twentythree analytics video weekday totals --date-expression thisweek

  $ twentythree analytics video weekday totals --date-start 2024-01-01 --date-end 2024-01-31

  $ twentythree analytics video weekday totals --json
```

_See code: [src/commands/analytics/video/weekday/totals.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/analytics/video/weekday/totals.ts)_
