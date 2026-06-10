`twentythree poll:answer`
=========================

Submit a poll answer

* [`twentythree poll answer ID`](#twentythree-poll-answer-id)

## `twentythree poll answer ID`

Submit a poll answer

```
USAGE
  $ twentythree poll answer ID [--json] [-w <value>] [--object-id <value>] [--object-token <value>] [--option-id
    <value>]

ARGUMENTS
  ID  Poll ID

FLAGS
  --object-id=<value>     Object ID (webinar or live object)
  --object-token=<value>  Object token (auto-looked up if omitted)
  --option-id=<value>     Poll option ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Submit a poll answer

EXAMPLES
  $ twentythree poll answer 99 --object-id 12345 --option-id 3

  $ twentythree poll answer 99 --object-id 12345 --option-id 3 --json
```

_See code: [src/commands/poll/answer.ts](https://github.com/23/twentythree-cli/blob/v1.4.0/src/commands/poll/answer.ts)_
