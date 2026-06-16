`twentythree player:list`
=========================

List players in the active workspace

* [`twentythree player list`](#twentythree-player-list)

## `twentythree player list`

List players in the active workspace

```
USAGE
  $ twentythree player list [--json] [-w <value>] [--source <value>]

FLAGS
  --source=<value>  Analytics source tag

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List players in the active workspace

EXAMPLES
  $ twentythree player list

  $ twentythree player list --json
```

_See code: [src/commands/player/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/player/list.ts)_
