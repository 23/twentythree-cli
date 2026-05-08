`twentythree spot:delete`
=========================

Delete a spot from the active workspace

* [`twentythree spot delete ID`](#twentythree-spot-delete-id)

## `twentythree spot delete ID`

Delete a spot from the active workspace

```
USAGE
  $ twentythree spot delete ID [--json] [-w <value>]

ARGUMENTS
  ID  Spot ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a spot from the active workspace

EXAMPLES
  $ twentythree spot delete 12345

  $ twentythree spot delete 12345 --json
```

_See code: [src/commands/spot/delete.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/spot/delete.ts)_
