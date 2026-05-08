`twentythree spot:create`
=========================

Create a new spot

* [`twentythree spot create`](#twentythree-spot-create)

## `twentythree spot create`

Create a new spot

```
USAGE
  $ twentythree spot create --spot-name <value> [--json] [-w <value>] [--spot-type <value>] [--spot-design
    <value>] [--spot-layout <value>]

FLAGS
  --spot-design=<value>  Design for the spot
  --spot-layout=<value>  Layout for the spot
  --spot-name=<value>    (required) Name for the new spot
  --spot-type=<value>    Type of spot

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new spot

EXAMPLES
  $ twentythree spot create --spot-name "My Spot"

  $ twentythree spot create --spot-name "My Spot" --spot-type "video"

  $ twentythree spot create --spot-name "My Spot" --json
```

_See code: [src/commands/spot/create.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/spot/create.ts)_
