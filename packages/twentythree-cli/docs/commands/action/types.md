`twentythree action:types`
==========================

List available CTA action types

* [`twentythree action types`](#twentythree-action-types)

## `twentythree action types`

List available CTA action types

```
USAGE
  $ twentythree action types [--json] [-w <value>] [--exclude-internal]

FLAGS
  --exclude-internal  Exclude internal action types from the list

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List available CTA action types

EXAMPLES
  $ twentythree action types

  $ twentythree action types --exclude-internal

  $ twentythree action types --json
```

_See code: [src/commands/action/types.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/action/types.ts)_
