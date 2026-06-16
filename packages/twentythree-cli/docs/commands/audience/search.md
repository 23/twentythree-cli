`twentythree audience:search`
=============================

Search audience members

* [`twentythree audience search`](#twentythree-audience-search)

## `twentythree audience search`

Search audience members

```
USAGE
  $ twentythree audience search --text <value> [--json] [-w <value>] [--size <value>] [--offset <value>] [--orderby
    <value>] [--order <value>]

FLAGS
  --offset=<value>   Results offset
  --order=<value>    Sort direction (asc/desc)
  --orderby=<value>  Order by field
  --size=<value>     Number of results
  --text=<value>     (required) Search text (required)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Search audience members

EXAMPLES
  $ twentythree audience search --text "john doe"

  $ twentythree audience search --text "acme" --size 20 --json

  $ twentythree audience search --text "jane" --orderby score --order desc
```

_See code: [src/commands/audience/search.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/audience/search.ts)_
