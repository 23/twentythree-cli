`twentythree email-subscription:remove`
=======================================

Remove an email subscription from the active workspace

* [`twentythree email-subscription remove ID`](#twentythree-email-subscription-remove-id)

## `twentythree email-subscription remove ID`

Remove an email subscription from the active workspace

```
USAGE
  $ twentythree email-subscription remove ID [--json] [-w <value>] [-y]

ARGUMENTS
  ID  Subscription ID (photo_subscription_id from email-subscription list)

FLAGS
  -y, --yes  Skip the confirmation prompt. Required when no terminal is attached (CI, agents); --json also skips it.

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove an email subscription from the active workspace

EXAMPLES
  $ twentythree email-subscription remove 91827364

  $ twentythree email-subscription remove 91827364 --yes

  $ twentythree email-subscription remove 91827364 --json
```

_See code: [src/commands/email-subscription/remove.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/email-subscription/remove.ts)_
