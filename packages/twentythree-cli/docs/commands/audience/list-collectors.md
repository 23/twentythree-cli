`twentythree audience:list-collectors`
======================================

List collectors linked to audience

* [`twentythree audience list-collectors`](#twentythree-audience-list-collectors)

## `twentythree audience list-collectors`

List collectors linked to audience

```
USAGE
  $ twentythree audience list-collectors [--json] [-w <value>] [--object-id <value>] [--action-id <value>]

FLAGS
  --action-id=<value>  Filter by action ID
  --object-id=<value>  Filter by object ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List collectors linked to audience

EXAMPLES
  $ twentythree audience list-collectors

  $ twentythree audience list-collectors --object-id 123

  $ twentythree audience list-collectors --action-id 456 --json
```

_See code: [src/commands/audience/list-collectors.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/audience/list-collectors.ts)_
