`twentythree analytics:video`
=============================

Get video analytics data

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

_See code: [src/commands/analytics/video/index.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/video/index.ts)_

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

_See code: [src/commands/analytics/video/performance.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/video/performance.ts)_

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

_See code: [src/commands/analytics/video/performance/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/video/performance/timeseries.ts)_

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

_See code: [src/commands/analytics/video/performance/totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/video/performance/totals.ts)_

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

_See code: [src/commands/analytics/video/published.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/video/published.ts)_

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

_See code: [src/commands/analytics/video/published/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/video/published/timeseries.ts)_

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

_See code: [src/commands/analytics/video/published/totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/video/published/totals.ts)_

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

_See code: [src/commands/analytics/video/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/video/timeseries.ts)_

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

_See code: [src/commands/analytics/video/totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/video/totals.ts)_

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

_See code: [src/commands/analytics/video/weekday.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/video/weekday.ts)_

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

_See code: [src/commands/analytics/video/weekday/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/video/weekday/timeseries.ts)_

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

_See code: [src/commands/analytics/video/weekday/totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/analytics/video/weekday/totals.ts)_
