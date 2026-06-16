`twentythree audience:list`
===========================

List audience members

* [`twentythree audience list`](#twentythree-audience-list)

## `twentythree audience list`

List audience members

```
USAGE
  $ twentythree audience list [--json] [-w <value>] [--page <value>] [--size <value>] [--offset <value>]
    [--orderby profile_count|recent|timeline_count|score|first] [--order asc|desc] [--search <value>]
    [--identified] [--no-identified] [--company <value>] [--objects <value>] [--attended-objects <value>]
    [--identity-sources <value>] [--score <value>] [--score-interval <value>] [--activity-interval <value>]
    [--first <value>] [--recent <value>] [--event-type <value>] [--include-timelines] [--include-events]
    [--include-total-count] [--export-format csv|xlsx] [--fields <value>]

FLAGS
  --activity-interval=<value>   Filter to profiles with activity within this date interval (e.g. "30d")
  --attended-objects=<value>    Filter to profiles that attended specific object IDs (space-separated)
  --company=<value>             Filter by company name
  --event-type=<value>          Filter by conversion event type
  --export-format=<option>      Export results as a file instead of JSON
                                <options: csv|xlsx>
  --fields=<value>              Comma-separated list of fields to return in the API response
  --first=<value>               Filter to profiles first seen after this date
  --[no-]identified             Filter to identified profiles only
  --identity-sources=<value>    Filter by the source of profile information
  --include-events              Include conversion events in the result
  --include-timelines           Include viewing timelines in the result
  --include-total-count         Include the total matching profile count in the response
  --objects=<value>             Filter by viewed object IDs (space-separated)
  --offset=<value>              Offset for pagination
  --order=<option>              Sort direction
                                <options: asc|desc>
  --orderby=<option>            Order by field
                                <options: profile_count|recent|timeline_count|score|first>
  --page=<value>                Page number
  --recent=<value>              Filter to profiles with recent activity after this date
  --score=<value>               Filter by exact engagement score
  --score-interval=<value>      Filter by a range of engagement scores (e.g. "50:100")
  --search=<value>              Free-text search across names and emails
  --size=<value>                Page size (max 500)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List audience members

EXAMPLES
  $ twentythree audience list

  $ twentythree audience list --page 2 --size 50

  $ twentythree audience list --search "john" --identified --json

  $ twentythree audience list --company "Acme" --orderby score --order desc --json

  $ twentythree audience list --objects "12345 67890" --include-timelines --json

  $ twentythree audience list --score-interval "50:100" --activity-interval "30d" --json

  $ twentythree audience list --export-format csv > audience.csv
```

_See code: [src/commands/audience/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/audience/list.ts)_
