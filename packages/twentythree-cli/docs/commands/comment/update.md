`twentythree comment:update`
============================

Update a comment's status

* [`twentythree comment update ID`](#twentythree-comment-update-id)

## `twentythree comment update ID`

Update a comment's status

```
USAGE
  $ twentythree comment update ID --object-id <value> [--json] [-w <value>] [--status <value>]

ARGUMENTS
  ID  Comment ID

FLAGS
  --object-id=<value>  (required) Object ID the comment belongs to
  --status=<value>     Comment status (answered, dismissed, or empty to clear)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a comment's status

EXAMPLES
  $ twentythree comment update 789 --object-id 123 --status answered

  $ twentythree comment update 789 --object-id 123 --status dismissed
```

_See code: [src/commands/comment/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.3/src/commands/comment/update.ts)_
