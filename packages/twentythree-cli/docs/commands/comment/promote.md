`twentythree comment:promote`
=============================

Promote or toggle promoted status of a comment

* [`twentythree comment promote ID`](#twentythree-comment-promote-id)

## `twentythree comment promote ID`

Promote or toggle promoted status of a comment

```
USAGE
  $ twentythree comment promote ID [--json] [-w <value>] [--promoted]

ARGUMENTS
  ID  Comment ID

FLAGS
  --[no-]promoted  Set promoted status (omit to toggle)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Promote or toggle promoted status of a comment

EXAMPLES
  $ twentythree comment promote 789

  $ twentythree comment promote 789 --promoted

  $ twentythree comment promote 789 --no-promoted
```

_See code: [src/commands/comment/promote.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/comment/promote.ts)_
