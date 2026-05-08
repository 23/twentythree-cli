`twentythree comment:list`
==========================

List comments in the active workspace

* [`twentythree comment list`](#twentythree-comment-list)

## `twentythree comment list`

List comments in the active workspace

```
USAGE
  $ twentythree comment list [--json] [-w <value>] [--object-id <value>] [--object-type <value>] [--comment-type
    <value>] [--search <value>] [--order <value>] [--include-reactions] [--include-replies] [--promoted]

FLAGS
  --comment-type=<value>  Filter by comment type (comment, question, chat)
  --include-reactions     Include reactions on each comment
  --include-replies       Include reply-to comments
  --object-id=<value>     Filter by object ID
  --object-type=<value>   Filter by object type (photo, album)
  --order=<value>         Sort order for results
  --promoted              Filter to promoted comments only
  --search=<value>        Search comments by content

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List comments in the active workspace

EXAMPLES
  $ twentythree comment list

  $ twentythree comment list --object-id 123 --object-type photo

  $ twentythree comment list --json
```

_See code: [src/commands/comment/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/comment/list.ts)_
