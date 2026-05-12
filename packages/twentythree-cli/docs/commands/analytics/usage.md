`twentythree analytics:usage`
=============================

Get usage analytics by device type

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

_See code: [src/commands/analytics/usage/devices.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/devices.ts)_

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

_See code: [src/commands/analytics/usage/devices/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/devices/timeseries.ts)_

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

_See code: [src/commands/analytics/usage/devices/totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/devices/totals.ts)_

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

_See code: [src/commands/analytics/usage/domains.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/domains.ts)_

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

_See code: [src/commands/analytics/usage/domains/totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/domains/totals.ts)_

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

_See code: [src/commands/analytics/usage/locations.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/locations.ts)_

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

_See code: [src/commands/analytics/usage/locations/totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/locations/totals.ts)_

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

_See code: [src/commands/analytics/usage/sourceids.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/sourceids.ts)_

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

_See code: [src/commands/analytics/usage/sourceids/totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/sourceids/totals.ts)_

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

_See code: [src/commands/analytics/usage/sources.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/sources.ts)_

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

_See code: [src/commands/analytics/usage/sources/totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/sources/totals.ts)_

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

_See code: [src/commands/analytics/usage/spots.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/spots.ts)_

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

_See code: [src/commands/analytics/usage/spots/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/spots/timeseries.ts)_

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

_See code: [src/commands/analytics/usage/spots/totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/spots/totals.ts)_

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

_See code: [src/commands/analytics/usage/storage.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/storage.ts)_

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

_See code: [src/commands/analytics/usage/traffic.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/traffic.ts)_

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

_See code: [src/commands/analytics/usage/traffic/timeseries.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/traffic/timeseries.ts)_

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

_See code: [src/commands/analytics/usage/traffic/totals.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/analytics/usage/traffic/totals.ts)_
