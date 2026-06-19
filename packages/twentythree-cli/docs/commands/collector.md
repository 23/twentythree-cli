`twentythree collector`
=======================

Block a collector from a video or webinar

* [`twentythree collector exclude ID`](#twentythree-collector-exclude-id)
* [`twentythree collector include ID`](#twentythree-collector-include-id)
* [`twentythree collector list`](#twentythree-collector-list)

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

_See code: [src/commands/collector/exclude.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/collector/exclude.ts)_

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

_See code: [src/commands/collector/include.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/collector/include.ts)_

## `twentythree collector list`

List collectors in the active workspace

```
USAGE
  $ twentythree collector list [--json] [-w <value>] [--object-id <value>] [--include-analytics]

FLAGS
  --include-analytics  Include analytics data for each collector
  --object-id=<value>  Filter collectors by object (video/webinar) ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List collectors in the active workspace

EXAMPLES
  $ twentythree collector list

  $ twentythree collector list --object-id 123

  $ twentythree collector list --include-analytics

  $ twentythree collector list --json
```

_See code: [src/commands/collector/list.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/collector/list.ts)_
