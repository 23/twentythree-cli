`twentythree collector:list`
============================

List collectors in the active workspace

* [`twentythree collector list`](#twentythree-collector-list)

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

_See code: [src/commands/collector/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/collector/list.ts)_
