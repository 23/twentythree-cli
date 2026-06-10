`twentythree comment:set-order`
===============================

Set display order of comments on an object

* [`twentythree comment set-order`](#twentythree-comment-set-order)

## `twentythree comment set-order`

Set display order of comments on an object

```
USAGE
  $ twentythree comment set-order --object-id <value> --order <value> [--json] [-w <value>] [--comment-type <value>]

FLAGS
  --comment-type=<value>  Comment type to reorder (default: question)
  --object-id=<value>     (required) Object ID whose comments are being reordered
  --order=<value>         (required) Comma-separated list of comment IDs in desired display order

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Set display order of comments on an object

EXAMPLES
  $ twentythree comment set-order --object-id 123 --order "789,456,123"

  $ twentythree comment set-order --object-id 123 --order "789,456" --comment-type question
```

_See code: [src/commands/comment/set-order.ts](https://github.com/23/twentythree-cli/blob/v1.4.0/src/commands/comment/set-order.ts)_
