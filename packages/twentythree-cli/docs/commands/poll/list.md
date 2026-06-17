`twentythree poll:list`
=======================

List polls for a webinar

* [`twentythree poll list`](#twentythree-poll-list)

## `twentythree poll list`

List polls for a webinar

```
USAGE
  $ twentythree poll list --object-id <value> [--json] [-w <value>] [--object-token <value>] [--poll-id <value>]
    [--open] [--no-open] [--public] [--no-public] [--display-results] [--no-display-results] [--fields <value>]

FLAGS
  --[no-]display-results  Filter to polls with publicly displayed results
  --fields=<value>        Comma-separated list of fields to return in the API response
  --object-id=<value>     (required) Object ID (webinar or live object)
  --object-token=<value>  Object token (auto-looked up if omitted)
  --[no-]open             Filter by open/closed status
  --poll-id=<value>       Limit results to a single poll by its ID
  --[no-]public           Filter by public/non-public status

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List polls for a webinar

EXAMPLES
  $ twentythree poll list --object-id 12345

  $ twentythree poll list --object-id 12345 --json

  $ twentythree poll list --object-id 12345 --open --json

  $ twentythree poll list --object-id 12345 --poll-id 99 --json
```

_See code: [src/commands/poll/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/poll/list.ts)_
