`twentythree poll:list`
=======================

List polls for a webinar

* [`twentythree poll list`](#twentythree-poll-list)

## `twentythree poll list`

List polls for a webinar

```
USAGE
  $ twentythree poll list --object-id <value> [--json] [-w <value>] [--object-token <value>]

FLAGS
  --object-id=<value>     (required) Object ID (webinar or live object)
  --object-token=<value>  Object token (auto-looked up if omitted)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List polls for a webinar

EXAMPLES
  $ twentythree poll list --object-id 12345

  $ twentythree poll list --object-id 12345 --json
```

_See code: [src/commands/poll/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.5/src/commands/poll/list.ts)_
