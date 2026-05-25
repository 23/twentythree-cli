`twentythree app:update`
========================

Update an existing app integration

* [`twentythree app update ID`](#twentythree-app-update-id)

## `twentythree app update ID`

Update an existing app integration

```
USAGE
  $ twentythree app update ID [--json] [-w <value>] [--name <value>] [--description <value>] [--style <value>]

ARGUMENTS
  ID  App ID

FLAGS
  --description=<value>  App description
  --name=<value>         App name
  --style=<value>        App style

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update an existing app integration

EXAMPLES
  $ twentythree app update 12345 --name "Updated Name"

  $ twentythree app update 12345 --description "New description"

  $ twentythree app update 12345 --name "Updated Name" --description "New description"

  $ twentythree app update 12345 --name "Updated Name" --json
```

_See code: [src/commands/app/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/app/update.ts)_
