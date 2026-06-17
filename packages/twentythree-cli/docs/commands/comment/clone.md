`twentythree comment:clone`
===========================

Clone an existing comment

* [`twentythree comment clone [ID]`](#twentythree-comment-clone-id)

## `twentythree comment clone [ID]`

Clone an existing comment

```
USAGE
  $ twentythree comment clone [ID] [--json] [-w <value>] [--clone-type <value>]

ARGUMENTS
  [ID]  Comment ID to clone

FLAGS
  --clone-type=<value>  Type for the cloned comment (chat, question, comment)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Clone an existing comment

EXAMPLES
  $ twentythree comment clone 789

  $ twentythree comment clone 789 --clone-type question
```

_See code: [src/commands/comment/clone.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/comment/clone.ts)_
