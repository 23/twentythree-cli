`twentythree category:update`
=============================

Update metadata for a category

* [`twentythree category update ID`](#twentythree-category-update-id)

## `twentythree category update ID`

Update metadata for a category

```
USAGE
  $ twentythree category update ID [--json] [-w <value>] [--title <value>] [--description <value>] [--hidden]

ARGUMENTS
  ID  Category ID

FLAGS
  --description=<value>  New description for the category
  --[no-]hidden          Show or hide the category
  --title=<value>        New title for the category

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update metadata for a category

EXAMPLES
  $ twentythree category update 42 --title "New Title"

  $ twentythree category update 42 --hidden

  $ twentythree category update 42
```

_See code: [src/commands/category/update.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/category/update.ts)_
