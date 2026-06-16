`twentythree user:send-invitation`
==================================

Send an invitation email to a user

* [`twentythree user send-invitation ID`](#twentythree-user-send-invitation-id)

## `twentythree user send-invitation ID`

Send an invitation email to a user

```
USAGE
  $ twentythree user send-invitation ID [--json] [-w <value>] [--invitation-message <value>]

ARGUMENTS
  ID  User ID

FLAGS
  --invitation-message=<value>  Custom invitation message

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Send an invitation email to a user

EXAMPLES
  $ twentythree user send-invitation 12345

  $ twentythree user send-invitation 12345 --invitation-message "Welcome to the platform!"

  $ twentythree user send-invitation 12345 --json
```

_See code: [src/commands/user/send-invitation.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/user/send-invitation.ts)_
