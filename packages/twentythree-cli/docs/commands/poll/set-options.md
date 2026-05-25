`twentythree poll:set-options`
==============================

Set options for a poll

* [`twentythree poll set-options ID`](#twentythree-poll-set-options-id)

## `twentythree poll set-options ID`

Set options for a poll

```
USAGE
  $ twentythree poll set-options ID [--json] [-w <value>] [--option <value>...]

ARGUMENTS
  ID  Poll ID

FLAGS
  --option=<value>...  Poll option (repeat for multiple)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Set options for a poll

EXAMPLES
  $ twentythree poll set-options 99 --option "Yes" --option "No" --option "Maybe"

  $ twentythree poll set-options 99 --option "Option A" --option "Option B" --json
```

_See code: [src/commands/poll/set-options.ts](https://github.com/23/twentythree-cli/blob/v1.3.6/src/commands/poll/set-options.ts)_
