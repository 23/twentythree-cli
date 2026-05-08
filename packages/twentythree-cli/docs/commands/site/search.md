`twentythree site:search`
=========================

Search for content across the active workspace

* [`twentythree site search`](#twentythree-site-search)

## `twentythree site search`

Search for content across the active workspace

```
USAGE
  $ twentythree site search [--json] [-w <value>] [--search <value>] [--search-in <value>] [--selection <value>]
    [--size <value>]

FLAGS
  --search=<value>     Search query string
  --search-in=<value>  Where to search (e.g. title, description, tags)
  --selection=<value>  Filter by content selection
  --size=<value>       Number of results to return

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Search for content across the active workspace

EXAMPLES
  $ twentythree site search --search "quarterly report"

  $ twentythree site search --search "demo" --search-in title --size 20

  $ twentythree site search --search "webinar" --json
```

_See code: [src/commands/site/search.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/site/search.ts)_
