`twentythree poll:remove`
=========================

Remove a poll

* [`twentythree poll remove ID`](#twentythree-poll-remove-id)

## `twentythree poll remove ID`

Remove a poll

```
USAGE
  $ twentythree poll remove ID [--json] [-w <value>]

ARGUMENTS
  ID  Poll ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove a poll

EXAMPLES
  $ twentythree poll remove 99

  $ twentythree poll remove 99 --json
```

_See code: [src/commands/poll/remove.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/poll/remove.ts)_
