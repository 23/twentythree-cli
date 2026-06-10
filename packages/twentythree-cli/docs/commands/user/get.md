`twentythree user:get`
======================

Get details of a specific user

* [`twentythree user get ID`](#twentythree-user-get-id)

## `twentythree user get ID`

Get details of a specific user

```
USAGE
  $ twentythree user get ID [--json] [-w <value>] [--include-invitation]

ARGUMENTS
  ID  User ID

FLAGS
  --[no-]include-invitation  Include invitation details in the response

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get details of a specific user

EXAMPLES
  $ twentythree user get 12345

  $ twentythree user get 12345 --include-invitation

  $ twentythree user get 12345 --json
```

_See code: [src/commands/user/get.ts](https://github.com/23/twentythree-cli/blob/v1.4.0/src/commands/user/get.ts)_
