`twentythree thumbnail:duplicate`
=================================

Duplicate a thumbnail template

* [`twentythree thumbnail duplicate ID`](#twentythree-thumbnail-duplicate-id)

## `twentythree thumbnail duplicate ID`

Duplicate a thumbnail template

```
USAGE
  $ twentythree thumbnail duplicate ID [--json] [-w <value>] [--name <value>]

ARGUMENTS
  ID  Thumbnail template ID

FLAGS
  --name=<value>  Name for the duplicate

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Duplicate a thumbnail template

EXAMPLES
  $ twentythree thumbnail duplicate 42

  $ twentythree thumbnail duplicate 42 --name "My Copy"

  $ twentythree thumbnail duplicate 42 --name "My Copy" --json
```

_See code: [src/commands/thumbnail/duplicate.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/thumbnail/duplicate.ts)_
