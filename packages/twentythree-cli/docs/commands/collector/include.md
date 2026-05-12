`twentythree collector:include`
===============================

Attach a collector to a video or webinar

* [`twentythree collector include ID`](#twentythree-collector-include-id)

## `twentythree collector include ID`

Attach a collector to a video or webinar

```
USAGE
  $ twentythree collector include ID --object-id <value> [--json] [-w <value>]

ARGUMENTS
  ID  Collector action ID

FLAGS
  --object-id=<value>  (required) ID of the video or webinar to attach the collector to

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Attach a collector to a video or webinar

EXAMPLES
  $ twentythree collector include 456 --object-id 123
```

_See code: [src/commands/collector/include.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/collector/include.ts)_
