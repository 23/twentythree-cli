`twentythree audience:unregister`
=================================

Remove a registration for an audience contact

* [`twentythree audience unregister`](#twentythree-audience-unregister)

## `twentythree audience unregister`

Remove a registration for an audience contact

```
USAGE
  $ twentythree audience unregister --object-id <value> [--json] [-w <value>] [--email <value>] [--uuid <value>]

FLAGS
  --email=<value>      Contact email
  --object-id=<value>  (required) Object ID to unregister from
  --uuid=<value>       Contact UUID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove a registration for an audience contact

EXAMPLES
  $ twentythree audience unregister --object-id 123 --email "jane@example.com"

  $ twentythree audience unregister --object-id 456 --uuid "abc-def-ghi"

  $ twentythree audience unregister --object-id 789 --json
```

_See code: [src/commands/audience/unregister.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/audience/unregister.ts)_
