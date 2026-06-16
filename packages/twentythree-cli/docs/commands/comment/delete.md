`twentythree comment:delete`
============================

Delete a comment

* [`twentythree comment delete ID`](#twentythree-comment-delete-id)

## `twentythree comment delete ID`

Delete a comment

```
USAGE
  $ twentythree comment delete ID [--json] [-w <value>]

ARGUMENTS
  ID  Comment ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a comment

EXAMPLES
  $ twentythree comment delete 789

  $ twentythree comment delete 789 --json
```

_See code: [src/commands/comment/delete.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/comment/delete.ts)_
