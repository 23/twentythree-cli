`twentythree poll:add`
======================

Create a new poll for a webinar

* [`twentythree poll add`](#twentythree-poll-add)

## `twentythree poll add`

Create a new poll for a webinar

```
USAGE
  $ twentythree poll add --object-id <value> [--json] [-w <value>] [--question <value>]

FLAGS
  --object-id=<value>  (required) Object ID (webinar or live object)
  --question=<value>   Poll question

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new poll for a webinar

EXAMPLES
  $ twentythree poll add --object-id 12345 --question "What is your preference?"

  $ twentythree poll add --object-id 12345 --question "How are you?" --json
```

_See code: [src/commands/poll/add.ts](https://github.com/23/twentythree-cli/blob/v1.6.0/src/commands/poll/add.ts)_
