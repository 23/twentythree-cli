`twentythree spot:check`
========================

Get details of a specific spot

* [`twentythree spot check ID`](#twentythree-spot-check-id)

## `twentythree spot check ID`

Get details of a specific spot

```
USAGE
  $ twentythree spot check ID [--json] [-w <value>]

ARGUMENTS
  ID  Spot ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get details of a specific spot

EXAMPLES
  $ twentythree spot check 12345

  $ twentythree spot check 12345 --json
```

_See code: [src/commands/spot/check.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/spot/check.ts)_
