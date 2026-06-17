`twentythree openupload:list`
=============================

List open upload tokens in the active workspace

* [`twentythree openupload list`](#twentythree-openupload-list)

## `twentythree openupload list`

List open upload tokens in the active workspace

```
USAGE
  $ twentythree openupload list [--json] [-w <value>] [--token-upload-id <value>] [--token <value>] [--app]

FLAGS
  --app                      Filter by app open uploads
  --token=<value>            Filter by open upload token
  --token-upload-id=<value>  Filter by open upload token upload ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List open upload tokens in the active workspace

EXAMPLES
  $ twentythree openupload list

  $ twentythree openupload list --token-upload-id 123

  $ twentythree openupload list --json
```

_See code: [src/commands/openupload/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/openupload/list.ts)_
