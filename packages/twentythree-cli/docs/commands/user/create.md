`twentythree user:create`
=========================

Create a new user

* [`twentythree user create`](#twentythree-user-create)

## `twentythree user create`

Create a new user

```
USAGE
  $ twentythree user create --email <value> [--json] [-w <value>] [--username <value>] [--full-name <value>]
    [--site-admin] [--user-type <value>]

FLAGS
  --email=<value>      (required) Email address for the new user
  --full-name=<value>  Full display name for the new user
  --[no-]site-admin    Grant site admin privileges
  --user-type=<value>  User type (e.g. standard, administrator)
  --username=<value>   Username for the new user

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new user

EXAMPLES
  $ twentythree user create --email alice@example.com

  $ twentythree user create --email alice@example.com --full-name "Alice Smith"

  $ twentythree user create --email alice@example.com --site-admin

  $ twentythree user create --email alice@example.com --json
```

_See code: [src/commands/user/create.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/user/create.ts)_
