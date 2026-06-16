`twentythree user:tokens`
=========================

Retrieve cross-site tokens for the authenticated user

* [`twentythree user tokens`](#twentythree-user-tokens)

## `twentythree user tokens`

Retrieve cross-site tokens for the authenticated user

```
USAGE
  $ twentythree user tokens [--json] [-w <value>] [--cross-sites]

FLAGS
  --[no-]cross-sites  Include cross-site tokens

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Retrieve cross-site tokens for the authenticated user

EXAMPLES
  $ twentythree user tokens

  $ twentythree user tokens --no-cross-sites

  $ twentythree user tokens --json
```

_See code: [src/commands/user/tokens.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/user/tokens.ts)_
