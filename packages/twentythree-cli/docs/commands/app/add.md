`twentythree app:add`
=====================

Create a new app integration

* [`twentythree app add`](#twentythree-app-add)

## `twentythree app add`

Create a new app integration

```
USAGE
  $ twentythree app add --name <value> [--json] [-w <value>] [--description <value>] [--style <value>]
    [--type <value>] [--player-id <value>]

FLAGS
  --description=<value>  App description
  --name=<value>         (required) App name
  --player-id=<value>    Add a contextual player being forked
  --style=<value>        App style
  --type=<value>         App type

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new app integration

EXAMPLES
  $ twentythree app add --name "My App"

  $ twentythree app add --name "My App" --description "A sample app"

  $ twentythree app add --name "My App" --json
```

_See code: [src/commands/app/add.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/app/add.ts)_
