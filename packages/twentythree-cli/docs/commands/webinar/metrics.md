`twentythree webinar:metrics`
=============================

Retrieve metrics for a webinar

* [`twentythree webinar metrics ID`](#twentythree-webinar-metrics-id)

## `twentythree webinar metrics ID`

Retrieve metrics for a webinar

```
USAGE
  $ twentythree webinar metrics ID [--json] [-w <value>]

ARGUMENTS
  ID  Webinar ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Retrieve metrics for a webinar

EXAMPLES
  $ twentythree webinar metrics 12345

  $ twentythree webinar metrics 12345 --json
```

_See code: [src/commands/webinar/metrics.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/webinar/metrics.ts)_
