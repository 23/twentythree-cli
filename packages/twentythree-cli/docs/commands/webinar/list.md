`twentythree webinar:list`
==========================

List webinars in the active workspace

* [`twentythree webinar list`](#twentythree-webinar-list)

## `twentythree webinar list`

List webinars in the active workspace

```
USAGE
  $ twentythree webinar list [--json] [-w <value>] [--limit <value>] [--all] [--search <value>]
    [--status upcoming|live|previous] [--include-private] [--live-id <value>] [--album-id <value>]
    [--user-id <value>] [--live-format event|webinar] [--live-series-id <value>]
    [--ordering private|promoted|streaming|broadcasting|name|live_label|live_status|live_date|creation_date]
    [--order asc|desc] [--promoted] [--no-promoted] [--draft] [--no-draft] [--cancelled] [--no-cancelled]
    [--streaming] [--template] [--include-stats] [--include-speakers] [--include-albums] [--fields <value>]

FLAGS
  --album-id=<value>         Filter to webinars in a specific category
  --all                      Fetch all webinars across all pages (overrides --limit)
  --[no-]cancelled           Filter by cancelled status
  --[no-]draft               Filter by draft status
  --fields=<value>           Comma-separated list of fields to return in the API response
  --[no-]include-private     Include private webinars in the results
  --[no-]include-albums      Include category information for each webinar
  --[no-]include-speakers    Include speaker information for each webinar
  --[no-]include-stats       Include performance statistics for each webinar
  --limit=<value>            [default: 20] Maximum number of webinars to return (default: 20)
  --live-format=<option>     Filter by live format
                             <options: event|webinar>
  --live-id=<value>          Limit to a single webinar by ID
  --live-series-id=<value>   Filter to webinars in a specific series
  --order=<option>           Sort direction
                             <options: asc|desc>
  --ordering=<option>        Field to order results by
                             <options: private|promoted|streaming|broadcasting|name|live_label|live_status|live_date|creation_date>
  --[no-]promoted            Filter by promoted status
  --search=<value>           Search webinars by keyword
  --status=<option>          Filter by status
                             <options: upcoming|live|previous>
  --streaming                Filter to currently streaming webinars only
  --template                 Filter to webinar templates only
  --user-id=<value>          Filter to webinars created by a specific user (use "me" for the authenticated user)

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

  $ twentythree webinar list --live-format webinar --ordering live_date --order asc

  $ twentythree webinar list --user-id me --include-speakers --json

  $ twentythree webinar list --live-series-id 42 --all --json
```

_See code: [src/commands/webinar/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/webinar/list.ts)_
