`twentythree spot:set-videos`
=============================

Assign videos to a spot

* [`twentythree spot set-videos ID`](#twentythree-spot-set-videos-id)

## `twentythree spot set-videos ID`

Assign videos to a spot

```
USAGE
  $ twentythree spot set-videos ID --videos <value> [--json] [-w <value>]

ARGUMENTS
  ID  Spot ID

FLAGS
  --videos=<value>  (required) Comma-separated video IDs to assign to the spot

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Assign videos to a spot

EXAMPLES
  $ twentythree spot set-videos 12345 --videos "111,222,333"

  $ twentythree spot set-videos 12345 --videos "111" --json
```

_See code: [src/commands/spot/set-videos.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/spot/set-videos.ts)_
