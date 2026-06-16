`twentythree protection:unprotect`
==================================

Remove protection from content

* [`twentythree protection unprotect`](#twentythree-protection-unprotect)

## `twentythree protection unprotect`

Remove protection from content

```
USAGE
  $ twentythree protection unprotect [--json] [-w <value>] [--object-id <value>]

FLAGS
  --object-id=<value>  Object ID to remove protection from

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove protection from content

EXAMPLES
  $ twentythree protection unprotect

  $ twentythree protection unprotect --object-id 12345

  $ twentythree protection unprotect --object-id 12345 --json
```

_See code: [src/commands/protection/unprotect.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/protection/unprotect.ts)_
