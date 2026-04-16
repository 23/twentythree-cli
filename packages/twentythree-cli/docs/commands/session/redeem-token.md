`twentythree session:redeem-token`
==================================

Redeem a session token

* [`twentythree session redeem-token`](#twentythree-session-redeem-token)

## `twentythree session redeem-token`

Redeem a session token

```
USAGE
  $ twentythree session redeem-token --session-token <value> [--json] [-w <value>]

FLAGS
  --session-token=<value>  (required) Session token to redeem

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Redeem a session token

EXAMPLES
  $ twentythree session redeem-token --session-token <token>

  $ twentythree session redeem-token --session-token <token> --json
```

_See code: [src/commands/session/redeem-token.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/session/redeem-token.ts)_
