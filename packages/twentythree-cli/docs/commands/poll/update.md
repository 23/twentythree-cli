`twentythree poll:update`
=========================

Update a poll

* [`twentythree poll update ID`](#twentythree-poll-update-id)

## `twentythree poll update ID`

Update a poll

```
USAGE
  $ twentythree poll update ID [--json] [-w <value>] [--question <value>] [--open] [--display-results]

ARGUMENTS
  ID  Poll ID

FLAGS
  --[no-]display-results  Show or hide results
  --[no-]open             Open or close the poll
  --question=<value>      Poll question

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a poll

EXAMPLES
  $ twentythree poll update 99 --question "Updated question?"

  $ twentythree poll update 99 --open

  $ twentythree poll update 99 --no-display-results

  $ twentythree poll update 99 --question "New?" --open --json
```

_See code: [src/commands/poll/update.ts](https://github.com/23/twentythree-cli/blob/v1.4.0/src/commands/poll/update.ts)_
