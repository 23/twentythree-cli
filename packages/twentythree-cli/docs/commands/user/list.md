`twentythree user:list`
=======================

List users in the workspace

* [`twentythree user list`](#twentythree-user-list)

## `twentythree user list`

List users in the workspace

```
USAGE
  $ twentythree user list [--json] [-w <value>] [--page <value>] [--size <value>] [--search <value>] [--user-id
    <value>]

FLAGS
  --page=<value>     Page number
  --search=<value>   Search query (username, display name, or email)
  --size=<value>     Number of results per page
  --user-id=<value>  Filter by user ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List users in the workspace

EXAMPLES
  $ twentythree user list

  $ twentythree user list --search "alice"

  $ twentythree user list --page 2 --size 20

  $ twentythree user list --json
```

_See code: [src/commands/user/list.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/user/list.ts)_
