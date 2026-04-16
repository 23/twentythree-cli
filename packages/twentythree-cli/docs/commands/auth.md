`twentythree auth`
==================

Configure domain and bearer token for a TwentyThree workspace

* [`twentythree auth credentials`](#twentythree-auth-credentials)
* [`twentythree auth status`](#twentythree-auth-status)

## `twentythree auth credentials`

Configure domain and bearer token for a TwentyThree workspace

```
USAGE
  $ twentythree auth credentials

DESCRIPTION
  Configure domain and bearer token for a TwentyThree workspace

EXAMPLES
  $ twentythree auth credentials
```

_See code: [src/commands/auth/credentials.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/auth/credentials.ts)_

## `twentythree auth status`

Show authentication status and active workspace

```
USAGE
  $ twentythree auth status [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Show authentication status and active workspace

EXAMPLES
  $ twentythree auth status
```

_See code: [src/commands/auth/status.ts](https://github.com/23/twentythree-cli/blob/v0.1.0/src/commands/auth/status.ts)_
