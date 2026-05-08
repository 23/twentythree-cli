`twentythree audience:list`
===========================

List audience members

* [`twentythree audience list`](#twentythree-audience-list)

## `twentythree audience list`

List audience members

```
USAGE
  $ twentythree audience list [--json] [-w <value>] [--page <value>] [--size <value>] [--offset <value>] [--orderby
    <value>] [--order <value>] [--search <value>] [--identified] [--objects <value>]

FLAGS
  --[no-]identified  Filter to identified profiles only
  --objects=<value>  Filter by viewed object IDs (space-separated)
  --offset=<value>   Offset for pagination
  --order=<value>    Sort direction (asc/desc)
  --orderby=<value>  Order by field (recent, timeline_count, score, first)
  --page=<value>     Page number
  --search=<value>   Free-text search across names and emails
  --size=<value>     Page size (max 500)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List audience members

EXAMPLES
  $ twentythree audience list

  $ twentythree audience list --page 2 --size 50

  $ twentythree audience list --search "john" --identified --json
```

_See code: [src/commands/audience/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/audience/list.ts)_
