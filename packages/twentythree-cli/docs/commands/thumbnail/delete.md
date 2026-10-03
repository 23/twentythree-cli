`twentythree thumbnail:delete`
==============================

Delete a thumbnail template from the active workspace

* [`twentythree thumbnail delete ID`](#twentythree-thumbnail-delete-id)

## `twentythree thumbnail delete ID`

Delete a thumbnail template from the active workspace

```
USAGE
  $ twentythree thumbnail delete ID [--json] [-w <value>] [-y]

ARGUMENTS
  ID  Thumbnail template ID

FLAGS
  -y, --yes  Skip the confirmation prompt. Required when no terminal is attached (CI, agents); --json also skips it.

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a thumbnail template from the active workspace

EXAMPLES
  $ twentythree thumbnail delete 42

  $ twentythree thumbnail delete 42 --json
```

_See code: [src/commands/thumbnail/delete.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/thumbnail/delete.ts)_
