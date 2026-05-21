`twentythree player:delete`
===========================

Delete a player from the active workspace

* [`twentythree player delete ID`](#twentythree-player-delete-id)

## `twentythree player delete ID`

Delete a player from the active workspace

```
USAGE
  $ twentythree player delete ID [--json] [-w <value>]

ARGUMENTS
  ID  Player ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a player from the active workspace

EXAMPLES
  $ twentythree player delete 42

  $ twentythree player delete 42 --json
```

_See code: [src/commands/player/delete.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/player/delete.ts)_
