`twentythree audience:remove`
=============================

Permanently remove an audience contact

* [`twentythree audience remove`](#twentythree-audience-remove)

## `twentythree audience remove`

Permanently remove an audience contact

```
USAGE
  $ twentythree audience remove [--json] [-w <value>] [--email <value>] [--uuid <value>]

FLAGS
  --email=<value>  Contact email address
  --uuid=<value>   Contact UUID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Permanently remove an audience contact

EXAMPLES
  $ twentythree audience remove --email "jane@example.com"

  $ twentythree audience remove --uuid "abc-def-ghi"

  $ twentythree audience remove --email "user@co.com" --json
```

_See code: [src/commands/audience/remove.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/audience/remove.ts)_
