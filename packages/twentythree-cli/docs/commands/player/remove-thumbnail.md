`twentythree player:remove-thumbnail`
=====================================

Remove the custom thumbnail for a player, reverting to the default

* [`twentythree player remove-thumbnail ID`](#twentythree-player-remove-thumbnail-id)

## `twentythree player remove-thumbnail ID`

Remove the custom thumbnail for a player, reverting to the default

```
USAGE
  $ twentythree player remove-thumbnail ID [--json] [-w <value>]

ARGUMENTS
  ID  Player ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove the custom thumbnail for a player, reverting to the default

EXAMPLES
  $ twentythree player remove-thumbnail 42

  $ twentythree player remove-thumbnail 42 --json
```

_See code: [src/commands/player/remove-thumbnail.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/player/remove-thumbnail.ts)_
