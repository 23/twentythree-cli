`twentythree email-subscription:add`
====================================

Subscribe an email address to a digest of new videos

* [`twentythree email-subscription add`](#twentythree-email-subscription-add)

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
