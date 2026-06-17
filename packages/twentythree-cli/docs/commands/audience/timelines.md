`twentythree audience:timelines`
================================

Get audience member timelines

* [`twentythree audience timelines`](#twentythree-audience-timelines)

## `twentythree audience timelines`

Get audience member timelines

```
USAGE
  $ twentythree audience timelines [--json] [-w <value>] [--page <value>] [--size <value>] [--offset <value>] [--uuid
    <value>] [--objects <value>] [--orderby <value>] [--order <value>]

FLAGS
  --objects=<value>  Filter by object IDs (space-separated)
  --offset=<value>   Offset for pagination
  --order=<value>    Sort direction (asc/desc)
  --orderby=<value>  Order by field
  --page=<value>     Page number
  --size=<value>     Page size
  --uuid=<value>     Filter by audience member UUID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get audience member timelines

EXAMPLES
  $ twentythree audience timelines

  $ twentythree audience timelines --uuid "abc-123" --size 20

  $ twentythree audience timelines --objects "456 789" --json
```

_See code: [src/commands/audience/timelines.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/audience/timelines.ts)_
