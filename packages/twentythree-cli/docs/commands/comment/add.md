`twentythree comment:add`
=========================

Add a comment to an object

* [`twentythree comment add`](#twentythree-comment-add)

## `twentythree comment add`

Add a comment to an object

```
USAGE
  $ twentythree comment add --object-id <value> --object-type <value> [--json] [-w <value>] [--content <value>]
    [--name <value>] [--email <value>] [--url <value>] [--comment-type <value>] [--reply-to <value>] [--comment-time
    <value>] [--object-token <value>]

FLAGS
  --comment-time=<value>  Timestamp for the comment
  --comment-type=<value>  Comment type (comment, question, chat)
  --content=<value>       Comment text content
  --email=<value>         Author email for the comment
  --name=<value>          Author name for the comment
  --object-id=<value>     (required) Object ID to comment on
  --object-token=<value>  Object token for the target object
  --object-type=<value>   (required) Object type (photo, album, live)
  --reply-to=<value>      Comment ID to reply to
  --url=<value>           URL associated with the comment

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Add a comment to an object

EXAMPLES
  $ twentythree comment add --object-id 123 --object-type photo --content "Great video!"

  $ twentythree comment add --object-id 456 --object-type live --content "Question?" --comment-type question
```

_See code: [src/commands/comment/add.ts](https://github.com/23/twentythree-cli/blob/v1.4.0/src/commands/comment/add.ts)_
