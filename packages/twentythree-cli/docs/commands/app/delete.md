`twentythree app:delete`
========================

Delete an app integration from the active workspace

* [`twentythree app delete ID`](#twentythree-app-delete-id)

## `twentythree app delete ID`

Delete an app integration from the active workspace

```
USAGE
  $ twentythree app delete ID [--json] [-w <value>]

ARGUMENTS
  ID  App ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete an app integration from the active workspace

EXAMPLES
  $ twentythree app delete 12345

  $ twentythree app delete 12345 --json
```

_See code: [src/commands/app/delete.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/app/delete.ts)_
