`twentythree spot:update`
=========================

Update a spot

* [`twentythree spot update ID`](#twentythree-spot-update-id)

## `twentythree spot update ID`

Update a spot

```
USAGE
  $ twentythree spot update ID [--json] [-w <value>] [--spot-name <value>] [--active]

ARGUMENTS
  ID  Spot ID

FLAGS
  --[no-]active        Set active status
  --spot-name=<value>  New name for the spot

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a spot

EXAMPLES
  $ twentythree spot update 12345 --spot-name "New Name"

  $ twentythree spot update 12345 --active

  $ twentythree spot update 12345 --no-active

  $ twentythree spot update 12345 --spot-name "New Name" --json
```

_See code: [src/commands/spot/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/spot/update.ts)_
