`twentythree webhook:list`
==========================

List webhook subscriptions for the active workspace

* [`twentythree webhook list`](#twentythree-webhook-list)

## `twentythree webhook list`

List webhook subscriptions for the active workspace

```
USAGE
  $ twentythree webhook list [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List webhook subscriptions for the active workspace

EXAMPLES
  $ twentythree webhook list

  $ twentythree webhook list --json
```

_See code: [src/commands/webhook/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/webhook/list.ts)_
