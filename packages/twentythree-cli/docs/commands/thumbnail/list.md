`twentythree thumbnail:list`
============================

List thumbnail templates in the active workspace

* [`twentythree thumbnail list`](#twentythree-thumbnail-list)

## `twentythree thumbnail list`

List thumbnail templates in the active workspace

```
USAGE
  $ twentythree thumbnail list [--json] [-w <value>] [--search <value>] [--object-type <value>]

FLAGS
  --object-type=<value>  Filter by object type (photo, live, liveseries)
  --search=<value>       Filter by name

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List thumbnail templates in the active workspace

EXAMPLES
  $ twentythree thumbnail list

  $ twentythree thumbnail list --search "my template"

  $ twentythree thumbnail list --object-type photo

  $ twentythree thumbnail list --json
```

_See code: [src/commands/thumbnail/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/thumbnail/list.ts)_
