`twentythree player:set-thumbnail`
==================================

Upload and set a custom thumbnail image for a player

* [`twentythree player set-thumbnail FILE`](#twentythree-player-set-thumbnail-file)

## `twentythree player set-thumbnail FILE`

Upload and set a custom thumbnail image for a player

```
USAGE
  $ twentythree player set-thumbnail FILE --player-id <value> [--json] [-w <value>]

ARGUMENTS
  FILE  Path to the thumbnail image file

FLAGS
  --player-id=<value>  (required) Player ID to update

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload and set a custom thumbnail image for a player

EXAMPLES
  $ twentythree player set-thumbnail ./thumbnail.png --player-id 42

  $ twentythree player set-thumbnail ./thumbnail.jpg --player-id 42 --json
```

_See code: [src/commands/player/set-thumbnail.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/player/set-thumbnail.ts)_
