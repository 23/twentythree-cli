`twentythree category:list`
===========================

List categories in the active workspace

* [`twentythree category list`](#twentythree-category-list)

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

_See code: [src/commands/category/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/category/list.ts)_
