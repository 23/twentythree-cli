`twentythree email-subscription:list`
=====================================

List email subscriptions to new-video digests in the active workspace

* [`twentythree email-subscription list`](#twentythree-email-subscription-list)

## `twentythree email-subscription list`

List email subscriptions to new-video digests in the active workspace

```
USAGE
  $ twentythree email-subscription list [--json] [-w <value>] [--email <value>] [--user-id <value>] [--page <value>] [--size
    <value>] [--fields <value>]

FLAGS
  --email=<value>    Only return subscriptions for this email address
  --fields=<value>   Comma-separated list of fields to return in the API response
  --page=<value>     Page number (default: fetch all pages)
  --size=<value>     Number of results per page (default 50, max 500)
  --user-id=<value>  Only return subscriptions belonging to this user

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List email subscriptions to new-video digests in the active workspace

EXAMPLES
  $ twentythree email-subscription list

  $ twentythree email-subscription list --email anna@example.com --json

  $ twentythree email-subscription list --user-id 42 --json

  $ twentythree email-subscription list --page 2 --size 50
```

_See code: [src/commands/email-subscription/list.ts](https://github.com/23/twentythree-cli/blob/v1.7.0/src/commands/email-subscription/list.ts)_
