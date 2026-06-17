`twentythree user:list`
=======================

List users in the workspace

* [`twentythree user list`](#twentythree-user-list)

## `twentythree user list`

List users in the workspace

```
USAGE
  $ twentythree user list [--json] [-w <value>] [--page <value>] [--size <value>] [--search <value>]
    [--user-id <value>] [--user-group-id <value>] [--only-admins] [--only-owner] [--seated] [--no-seated]
    [--include-disabled-login] [--include-metrics] [--orderby <value>] [--order asc|desc] [--fields <value>]

FLAGS
  --fields=<value>               Comma-separated list of fields to return in the API response
  --include-disabled-login       Include users with disabled login
  --include-metrics              Include per-user performance metrics
  --only-admins                  Return only admin users
  --only-owner                   Return only the workspace owner
  --order=<option>               Sort direction
                                 <options: asc|desc>
  --orderby=<value>              Field to order results by
  --page=<value>                 Page number
  --search=<value>               Search query (username, display name, or email)
  --[no-]seated                  Filter by seated status
  --size=<value>                 Number of results per page
  --user-group-id=<value>        Filter to users assigned to a specific user group
  --user-id=<value>              Filter by user ID

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

  $ twentythree user list --only-admins --json

  $ twentythree user list --user-group-id 5 --orderby display_name --json
```

_See code: [src/commands/user/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/user/list.ts)_
