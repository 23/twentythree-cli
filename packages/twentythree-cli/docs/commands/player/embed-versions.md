`twentythree player:embed-versions`
===================================

List available embed versions for an object

* [`twentythree player embed-versions`](#twentythree-player-embed-versions)

## `twentythree player embed-versions`

List available embed versions for an object

```
USAGE
  $ twentythree player embed-versions --object-type <value> --object-id <value> [--json] [-w <value>] [--source <value>]

FLAGS
  --object-id=<value>    (required) Object ID
  --object-type=<value>  (required) Object type: photo, live, album, or site
  --source=<value>       Embed source parameter (e.g. embed, share)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List available embed versions for an object

EXAMPLES
  $ twentythree player embed-versions --object-type photo --object-id 123

  $ twentythree player embed-versions --object-type live --object-id 456 --json
```

_See code: [src/commands/player/embed-versions.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/player/embed-versions.ts)_
