`twentythree email-subscription`
================================

Subscribe an email address to a digest of new videos

* [`twentythree email-subscription add`](#twentythree-email-subscription-add)
* [`twentythree email-subscription list`](#twentythree-email-subscription-list)
* [`twentythree email-subscription remove ID`](#twentythree-email-subscription-remove-id)

## `twentythree email-subscription add`

Subscribe an email address to a digest of new videos

```
USAGE
  $ twentythree email-subscription add --email <value> [--json] [-w <value>] [--frequency
    instant|four_hours|twelve_hours|daily|weekly] [--fields <value>]

FLAGS
  --email=<value>       (required) Email address to subscribe
  --fields=<value>      Comma-separated list of fields to return in the API response
  --frequency=<option>  [default: daily] How often the subscriber receives a digest of new videos
                        <options: instant|four_hours|twelve_hours|daily|weekly>

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Subscribe an email address to a digest of new videos

EXAMPLES
  $ twentythree email-subscription add --email anna@example.com

  $ twentythree email-subscription add --email anna@example.com --frequency weekly --json
```

_See code: [src/commands/email-subscription/add.ts](https://github.com/23/twentythree-cli/blob/v1.8.0/src/commands/email-subscription/add.ts)_

## `twentythree email-subscription list`

List email subscriptions to new-video digests in the active workspace

```
USAGE
  $ twentythree email-subscription list [--json] [-w <value>] [--email <value>] [--user-id <value>] [--page <value>] [--size
    <value>] [--fields <value>]

FLAGS
  --email=<value>    Only return subscriptions for this email address
  --fields=<value>   Comma-separated list of fields to return in the API response
  --page=<value>     Page number. Passing --page or --size returns a single page; otherwise every page is fetched
  --size=<value>     Results per page (API default 50, max 500). Passing --page or --size returns a single page
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

_See code: [src/commands/email-subscription/list.ts](https://github.com/23/twentythree-cli/blob/v1.8.0/src/commands/email-subscription/list.ts)_

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

_See code: [src/commands/email-subscription/remove.ts](https://github.com/23/twentythree-cli/blob/v1.8.0/src/commands/email-subscription/remove.ts)_
