`twentythree app:list`
======================

List player design apps on the active workspace

* [`twentythree app list`](#twentythree-app-list)

## `twentythree app list`

List player design apps on the active workspace

```
USAGE
  $ twentythree app list [--json] [-w <value>] [--app-id <value>] [--page <value>] [--size <value>]

FLAGS
  --app-id=<value>  Filter results to a specific app ID
  --page=<value>    Page offset
  --size=<value>    Number of results per page (default 20, max 100)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List player design apps on the active workspace

EXAMPLES
  $ twentythree app list

  $ twentythree app list --app-id 42

  $ twentythree app list --page 2 --size 50

  $ twentythree app list --json
```

_See code: [src/commands/app/list.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/app/list.ts)_
