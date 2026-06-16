`twentythree audience:metrics`
==============================

Get audience aggregate metrics

* [`twentythree audience metrics`](#twentythree-audience-metrics)

## `twentythree audience metrics`

Get audience aggregate metrics

```
USAGE
  $ twentythree audience metrics [--json] [-w <value>] [--page <value>] [--size <value>] [--offset <value>] [--search
    <value>] [--identified] [--objects <value>]

FLAGS
  --[no-]identified  Filter to identified profiles only
  --objects=<value>  Filter by viewed object IDs (space-separated)
  --offset=<value>   Offset for pagination
  --page=<value>     Page number
  --search=<value>   Free-text search filter
  --size=<value>     Page size

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get audience aggregate metrics

EXAMPLES
  $ twentythree audience metrics

  $ twentythree audience metrics --identified --json

  $ twentythree audience metrics --search "acme" --size 100
```

_See code: [src/commands/audience/metrics.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/audience/metrics.ts)_
