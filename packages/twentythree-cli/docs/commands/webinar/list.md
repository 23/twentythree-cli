`twentythree webinar:list`
==========================

List webinars in the active workspace

* [`twentythree webinar list`](#twentythree-webinar-list)

## `twentythree webinar list`

List webinars in the active workspace

```
USAGE
  $ twentythree webinar list [--json] [-w <value>] [--limit <value>] [--all] [--include-private] [--status
    <value>] [--search <value>]

FLAGS
  --all                   Fetch all webinars across all pages (overrides --limit)
  --[no-]include-private  Include private webinars in the results
  --limit=<value>         [default: 20] Maximum number of webinars to return (default: 20)
  --search=<value>        Search webinars by keyword
  --status=<value>        Filter by status: upcoming, live, or previous

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List webinars in the active workspace

EXAMPLES
  $ twentythree webinar list

  $ twentythree webinar list --limit 50

  $ twentythree webinar list --all

  $ twentythree webinar list --status upcoming --json
```

_See code: [src/commands/webinar/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/webinar/list.ts)_
