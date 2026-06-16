`twentythree collector:exclude`
===============================

Block a collector from a video or webinar

* [`twentythree collector exclude ID`](#twentythree-collector-exclude-id)

## `twentythree collector exclude ID`

Block a collector from a video or webinar

```
USAGE
  $ twentythree collector exclude ID --object-id <value> [--json] [-w <value>]

ARGUMENTS
  ID  Collector action ID

FLAGS
  --object-id=<value>  (required) ID of the video or webinar to block the collector from

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Block a collector from a video or webinar

EXAMPLES
  $ twentythree collector exclude 456 --object-id 123
```

_See code: [src/commands/collector/exclude.ts](https://github.com/23/twentythree-cli/blob/v1.6.0/src/commands/collector/exclude.ts)_
