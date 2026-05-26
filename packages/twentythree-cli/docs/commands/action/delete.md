`twentythree action:delete`
===========================

Delete a CTA action

* [`twentythree action delete ID`](#twentythree-action-delete-id)

## `twentythree action delete ID`

Delete a CTA action

```
USAGE
  $ twentythree action delete ID [--json] [-w <value>]

ARGUMENTS
  ID  Action ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a CTA action

EXAMPLES
  $ twentythree action delete 12345

  $ twentythree action delete 12345 --json
```

_See code: [src/commands/action/delete.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/action/delete.ts)_
