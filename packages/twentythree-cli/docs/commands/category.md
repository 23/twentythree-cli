`twentythree category`
======================

Manage categories — list, create, update, and delete

* [`twentythree category`](#twentythree-category)
* [`twentythree category create`](#twentythree-category-create)
* [`twentythree category delete ID`](#twentythree-category-delete-id)
* [`twentythree category list`](#twentythree-category-list)
* [`twentythree category update ID`](#twentythree-category-update-id)

## `twentythree category`

Manage categories — list, create, update, and delete

```
USAGE
  $ twentythree category

DESCRIPTION
  Manage categories — list, create, update, and delete
```

_See code: [src/commands/category/index.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/category/index.ts)_

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

_See code: [src/commands/category/create.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/category/create.ts)_

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

_See code: [src/commands/category/delete.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/category/delete.ts)_

## `twentythree category list`

List categories in the active workspace

```
USAGE
  $ twentythree category list [--json] [-w <value>] [--include-hidden]

FLAGS
  --[no-]include-hidden  Include hidden categories in the results

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List categories in the active workspace

EXAMPLES
  $ twentythree category list

  $ twentythree category list --json

  $ twentythree category list --include-hidden
```

_See code: [src/commands/category/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/category/list.ts)_

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

_See code: [src/commands/category/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/category/update.ts)_
