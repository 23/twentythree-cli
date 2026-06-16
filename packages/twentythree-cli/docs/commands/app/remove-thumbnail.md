`twentythree app:remove-thumbnail`
==================================

Remove the custom thumbnail for an app, reverting to the default

* [`twentythree app remove-thumbnail ID`](#twentythree-app-remove-thumbnail-id)

## `twentythree app remove-thumbnail ID`

Remove the custom thumbnail for an app, reverting to the default

```
USAGE
  $ twentythree app remove-thumbnail ID [--json] [-w <value>]

ARGUMENTS
  ID  App ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove the custom thumbnail for an app, reverting to the default

EXAMPLES
  $ twentythree app remove-thumbnail 42

  $ twentythree app remove-thumbnail 42 --json
```

_See code: [src/commands/app/remove-thumbnail.ts](https://github.com/23/twentythree-cli/blob/v1.6.0/src/commands/app/remove-thumbnail.ts)_
