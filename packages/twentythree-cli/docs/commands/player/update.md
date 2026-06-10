`twentythree player:update`
===========================

Update settings for a player

* [`twentythree player update ID`](#twentythree-player-update-id)

## `twentythree player update ID`

Update settings for a player

```
USAGE
  $ twentythree player update ID [--json] [-w <value>] [--name <value>] [--description <value>] [--data <value>]

ARGUMENTS
  ID  Player ID

FLAGS
  --data=<value>         JSON-encoded player properties to merge into the request body
  --description=<value>  New description for the player
  --name=<value>         New name for the player

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update settings for a player

EXAMPLES
  $ twentythree player update 42 --name "My Player"

  $ twentythree player update 42 --description "New description"
```

_See code: [src/commands/player/update.ts](https://github.com/23/twentythree-cli/blob/v1.4.0/src/commands/player/update.ts)_
