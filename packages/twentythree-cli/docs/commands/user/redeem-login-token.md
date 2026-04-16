`twentythree user:redeem-login-token`
=====================================

Redeem a login token to authenticate a user

* [`twentythree user redeem-login-token`](#twentythree-user-redeem-login-token)

## `twentythree user redeem-login-token`

Redeem a login token to authenticate a user

```
USAGE
  $ twentythree user redeem-login-token --login-token <value> [--json] [-w <value>]

FLAGS
  --login-token=<value>  (required) Login token to redeem

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Redeem a login token to authenticate a user

EXAMPLES
  $ twentythree user redeem-login-token --login-token abc123

  $ twentythree user redeem-login-token --login-token abc123 --json
```

_See code: [src/commands/user/redeem-login-token.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/user/redeem-login-token.ts)_
