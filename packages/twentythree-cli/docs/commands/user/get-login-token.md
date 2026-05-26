`twentythree user:get-login-token`
==================================

Generate a login token for a user

* [`twentythree user get-login-token ID`](#twentythree-user-get-login-token-id)

## `twentythree user get-login-token ID`

Generate a login token for a user

```
USAGE
  $ twentythree user get-login-token ID [--json] [-w <value>] [--return-url <value>]

ARGUMENTS
  ID  User ID

FLAGS
  --return-url=<value>  URL to redirect to after login

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Generate a login token for a user

EXAMPLES
  $ twentythree user get-login-token 12345

  $ twentythree user get-login-token 12345 --return-url https://example.com/dashboard

  $ twentythree user get-login-token 12345 --json
```

_See code: [src/commands/user/get-login-token.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/user/get-login-token.ts)_
