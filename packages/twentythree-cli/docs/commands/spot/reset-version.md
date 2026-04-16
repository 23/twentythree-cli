`twentythree spot:reset-version`
================================

Reset the version of a spot

* [`twentythree spot reset-version ID`](#twentythree-spot-reset-version-id)

## `twentythree spot reset-version ID`

Reset the version of a spot

```
USAGE
  $ twentythree spot reset-version ID [--json] [-w <value>]

ARGUMENTS
  ID  Spot ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Reset the version of a spot

EXAMPLES
  $ twentythree spot reset-version 12345

  $ twentythree spot reset-version 12345 --json
```

_See code: [src/commands/spot/reset-version.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/spot/reset-version.ts)_
