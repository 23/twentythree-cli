`twentythree comment:delete`
============================

Delete a comment

* [`twentythree comment delete ID`](#twentythree-comment-delete-id)

## `twentythree comment delete ID`

Delete a comment

```
USAGE
  $ twentythree comment delete ID [--json] [-w <value>] [-y]

ARGUMENTS
  ID  Comment ID

FLAGS
  -y, --yes  Skip the confirmation prompt. Required when no terminal is attached (CI, agents); --json also skips it.

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a comment

EXAMPLES
  $ twentythree comment delete 789

  $ twentythree comment delete 789 --yes

  $ twentythree comment delete 789 --json
```

_See code: [src/commands/comment/delete.ts](https://github.com/23/twentythree-cli/blob/v1.8.0/src/commands/comment/delete.ts)_
