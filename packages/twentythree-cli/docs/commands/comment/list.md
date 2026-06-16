`twentythree comment:list`
==========================

List comments in the active workspace

* [`twentythree comment list`](#twentythree-comment-list)

## `twentythree comment list`

List comments in the active workspace

```
USAGE
  $ twentythree comment list [--json] [-w <value>] [--object-id <value>] [--object-type photo|album]
    [--comment-type comment|question|chat] [--search <value>] [--order asc|desc] [--comment-id <value>]
    [--comment-user-id <value>] [--prioritize-promoted] [--include-reactions] [--include-replies] [--promoted]
    [--fields <value>]

FLAGS
  --comment-id=<value>       Limit to a specific comment by its ID
  --comment-type=<option>    Filter by comment type
                             <options: comment|question|chat>
  --comment-user-id=<value>  List comments by a specific user
  --fields=<value>           Comma-separated list of fields to return in the API response
  --include-reactions        Include emoji reaction counts for each comment
  --include-replies          Include details about the parent comment for reply comments
  --object-id=<value>        Filter by object ID
  --object-type=<option>     Filter by object type
                             <options: photo|album>
  --order=<option>           Sort order for results
                             <options: asc|desc>
  --prioritize-promoted      Sort promoted comments before non-promoted ones
  --promoted                 Filter to promoted comments only
  --search=<value>           Search comments by content

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List comments in the active workspace

EXAMPLES
  $ twentythree comment list

  $ twentythree comment list --object-id 123 --object-type photo

  $ twentythree comment list --json

  $ twentythree comment list --comment-type question --prioritize-promoted --json

  $ twentythree comment list --object-id 123 --comment-user-id 456 --json
```

_See code: [src/commands/comment/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/comment/list.ts)_
