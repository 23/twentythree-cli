`twentythree action:update`
===========================

Update an existing CTA action

* [`twentythree action update ID`](#twentythree-action-update-id)

## `twentythree action update ID`

Update an existing CTA action

```
USAGE
  $ twentythree action update ID --name <value> --start-time <value> --end-time <value> [--json] [-w <value>]
    [--time-relative-to <value>] [--return-url <value>]

ARGUMENTS
  ID  Action ID

FLAGS
  --end-time=<value>          (required) End time of the action (seconds)
  --name=<value>              (required) Display name for the action
  --return-url=<value>        Return URL for the action
  --start-time=<value>        (required) Start time of the action (seconds)
  --time-relative-to=<value>  [default: duration] What the timing is relative to (default: duration)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update an existing CTA action

EXAMPLES
  $ twentythree action update 12345 --name "Buy Now" --start-time 10 --end-time 20

  $ twentythree action update 12345 --name "Buy Now" --start-time 10 --end-time 20 --return-url "https://example.com"

  $ twentythree action update 12345 --name "Buy Now" --start-time 10 --end-time 20 --json
```

_See code: [src/commands/action/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/action/update.ts)_
