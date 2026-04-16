`twentythree analytics:conversions`
===================================

Get conversion analytics data

* [`twentythree analytics conversions`](#twentythree-analytics-conversions)
* [`twentythree analytics conversions timeseries`](#twentythree-analytics-conversions-timeseries)
* [`twentythree analytics conversions totals`](#twentythree-analytics-conversions-totals)

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

_See code: [src/commands/analytics/conversions/index.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/analytics/conversions/index.ts)_

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

_See code: [src/commands/analytics/conversions/timeseries.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/analytics/conversions/timeseries.ts)_

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

_See code: [src/commands/analytics/conversions/totals.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/analytics/conversions/totals.ts)_
