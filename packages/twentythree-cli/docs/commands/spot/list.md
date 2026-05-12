`twentythree spot:list`
=======================

List spots in the active workspace

* [`twentythree spot list`](#twentythree-spot-list)

## `twentythree spot list`

List spots in the active workspace

```
USAGE
  $ twentythree spot list [--json] [-w <value>] [--page <value>] [--size <value>] [--search <value>]
    [--spot-type <value>] [--active] [--orderby <value>] [--order <value>]

FLAGS
  --[no-]active        Filter by active status
  --order=<value>      Sort order (asc or desc)
  --orderby=<value>    Field to order results by
  --page=<value>       Page number
  --search=<value>     Search term
  --size=<value>       Number of results per page
  --spot-type=<value>  Filter by spot type

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List spots in the active workspace

EXAMPLES
  $ twentythree spot list

  $ twentythree spot list --search "my spot"

  $ twentythree spot list --active

  $ twentythree spot list --json
```

_See code: [src/commands/spot/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/spot/list.ts)_
