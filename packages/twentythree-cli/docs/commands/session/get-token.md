`twentythree session:get-token`
===============================

Get a session access token

* [`twentythree session get-token`](#twentythree-session-get-token)

## `twentythree session get-token`

Get a session access token

```
USAGE
  $ twentythree session get-token [--json] [-w <value>] [--return-url <value>] [--email <value>] [--full-name <value>]

FLAGS
  --email=<value>       Email for the session token
  --full-name=<value>   Full name for the session token
  --return-url=<value>  Return URL after session authentication

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get a session access token

EXAMPLES
  $ twentythree session get-token

  $ twentythree session get-token --return-url https://example.com

  $ twentythree session get-token --email user@example.com --full-name "Jane Doe"

  $ twentythree session get-token --json
```

_See code: [src/commands/session/get-token.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/session/get-token.ts)_
