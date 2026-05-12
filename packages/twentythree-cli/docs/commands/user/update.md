`twentythree user:update`
=========================

Update a user profile

* [`twentythree user update ID`](#twentythree-user-update-id)

## `twentythree user update ID`

Update a user profile

```
USAGE
  $ twentythree user update ID [--json] [-w <value>] [--email <value>] [--full-name <value>] [--password <value>]
    [--profile-image <value>]

ARGUMENTS
  ID  User ID

FLAGS
  --email=<value>          New email address
  --full-name=<value>      New full display name
  --password=<value>       New password (WARNING: visible in process list and shell history — prefer interactive prompt
                           for sensitive environments)
  --profile-image=<value>  Path to profile image file

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a user profile

EXAMPLES
  $ twentythree user update 12345 --full-name "Alice Smith"

  $ twentythree user update 12345 --email alice@example.com

  $ twentythree user update 12345 --profile-image ./avatar.jpg

  $ twentythree user update 12345 --json
```

_See code: [src/commands/user/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/user/update.ts)_
