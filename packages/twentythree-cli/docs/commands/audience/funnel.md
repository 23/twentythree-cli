`twentythree audience:funnel`
=============================

Get audience funnel analytics

* [`twentythree audience funnel`](#twentythree-audience-funnel)

## `twentythree audience funnel`

Get audience funnel analytics

```
USAGE
  $ twentythree audience funnel [--json] [-w <value>] [--objects <value>] [--live-type <value>]
    [--resolve-recordings] [--resolve-live-series]

FLAGS
  --live-type=<value>    Live event type filter
  --objects=<value>      Filter by object IDs (space-separated)
  --resolve-live-series  Resolve live series details
  --resolve-recordings   Resolve recording details

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get audience funnel analytics

EXAMPLES
  $ twentythree audience funnel

  $ twentythree audience funnel --objects "123 456" --json

  $ twentythree audience funnel --live-type on_demand --resolve-recordings
```

_See code: [src/commands/audience/funnel.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/audience/funnel.ts)_
