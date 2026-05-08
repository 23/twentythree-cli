`twentythree category:delete`
=============================

Delete a category from the active workspace

* [`twentythree category delete ID`](#twentythree-category-delete-id)

## `twentythree category delete ID`

Delete a category from the active workspace

```
USAGE
  $ twentythree category delete ID [--json] [-w <value>]

ARGUMENTS
  ID  Category ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a category from the active workspace

EXAMPLES
  $ twentythree category delete 42

  $ twentythree category delete 42 --json
```

_See code: [src/commands/category/delete.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/category/delete.ts)_
