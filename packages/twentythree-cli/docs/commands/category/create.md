`twentythree category:create`
=============================

Create a new category

* [`twentythree category create`](#twentythree-category-create)

## `twentythree category create`

Create a new category

```
USAGE
  $ twentythree category create --title <value> [--json] [-w <value>] [--description <value>] [--hidden]

FLAGS
  --description=<value>  Description for the new category
  --[no-]hidden          Create as hidden category
  --title=<value>        (required) Title for the new category

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new category

EXAMPLES
  $ twentythree category create --title "My Category"

  $ twentythree category create --title "My Category" --json

  $ twentythree category create --title "Hidden Category" --hidden
```

_See code: [src/commands/category/create.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/category/create.ts)_
