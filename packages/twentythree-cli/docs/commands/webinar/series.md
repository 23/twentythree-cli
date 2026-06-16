`twentythree webinar:series`
============================

Apply a recurrence to a webinar series

* [`twentythree webinar series apply-recurrence ID`](#twentythree-webinar-series-apply-recurrence-id)
* [`twentythree webinar series cancel ID`](#twentythree-webinar-series-cancel-id)
* [`twentythree webinar series create`](#twentythree-webinar-series-create)
* [`twentythree webinar series delete ID`](#twentythree-webinar-series-delete-id)
* [`twentythree webinar series list`](#twentythree-webinar-series-list)
* [`twentythree webinar series mapped-objects ID`](#twentythree-webinar-series-mapped-objects-id)
* [`twentythree webinar series metrics ID`](#twentythree-webinar-series-metrics-id)
* [`twentythree webinar series recurrences ID`](#twentythree-webinar-series-recurrences-id)
* [`twentythree webinar series set-ondemand ID`](#twentythree-webinar-series-set-ondemand-id)
* [`twentythree webinar series skip-recurrence ID`](#twentythree-webinar-series-skip-recurrence-id)
* [`twentythree webinar series update ID`](#twentythree-webinar-series-update-id)
* [`twentythree webinar series upload-thumbnail ID FILE`](#twentythree-webinar-series-upload-thumbnail-id-file)

## `twentythree webinar series apply-recurrence ID`

Apply a recurrence to a webinar series

```
USAGE
  $ twentythree webinar series apply-recurrence ID [--json] [-w <value>] [--recurrence-id <value>]

ARGUMENTS
  ID  Series ID

FLAGS
  --recurrence-id=<value>  Recurrence ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Apply a recurrence to a webinar series

EXAMPLES
  $ twentythree webinar series apply-recurrence 42 --recurrence-id 7

  $ twentythree webinar series apply-recurrence 42 --recurrence-id 7 --json
```

_See code: [src/commands/webinar/series/apply-recurrence.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/webinar/series/apply-recurrence.ts)_

## `twentythree webinar series cancel ID`

Cancel a webinar series

```
USAGE
  $ twentythree webinar series cancel ID [--json] [-w <value>] [--cancel-associations]

ARGUMENTS
  ID  Series ID

FLAGS
  --[no-]cancel-associations  Also cancel associated webinars

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Cancel a webinar series

EXAMPLES
  $ twentythree webinar series cancel 42

  $ twentythree webinar series cancel 42 --cancel-associations

  $ twentythree webinar series cancel 42 --json
```

_See code: [src/commands/webinar/series/cancel.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/webinar/series/cancel.ts)_

## `twentythree webinar series create`

Create a webinar series

```
USAGE
  $ twentythree webinar series create [--json] [-w <value>] [--name <value>] [--description <value>]

FLAGS
  --description=<value>  Series description
  --name=<value>         Series name

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a webinar series

EXAMPLES
  $ twentythree webinar series create --name "My Series"

  $ twentythree webinar series create --name "My Series" --description "Weekly sessions"

  $ twentythree webinar series create --name "My Series" --json
```

_See code: [src/commands/webinar/series/create.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/webinar/series/create.ts)_

## `twentythree webinar series delete ID`

Delete a webinar series

```
USAGE
  $ twentythree webinar series delete ID [--json] [-w <value>] [--delete-associations]

ARGUMENTS
  ID  Series ID

FLAGS
  --[no-]delete-associations  Also delete associated webinars

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a webinar series

EXAMPLES
  $ twentythree webinar series delete 42

  $ twentythree webinar series delete 42 --delete-associations

  $ twentythree webinar series delete 42 --json
```

_See code: [src/commands/webinar/series/delete.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/webinar/series/delete.ts)_

## `twentythree webinar series list`

List webinar series

```
USAGE
  $ twentythree webinar series list [--json] [-w <value>] [--search <value>] [--live-series-id <value>]
    [--live-id <value>] [--album-id <value>] [--user-id <value>] [--series-type liveevent|series]
    [--ordering name|private|live_status|live_date|creation_date|updated_date] [--order asc|desc]
    [--cancelled] [--no-cancelled] [--draft] [--no-draft] [--private] [--no-private] [--include-private]
    [--include-speakers] [--include-stats] [--include-albums] [--fields <value>]

FLAGS
  --album-id=<value>        Filter to series belonging to a specific category
  --[no-]cancelled          Filter by cancelled status
  --[no-]draft              Filter by draft status
  --fields=<value>          Comma-separated list of fields to return in the API response
  --include-albums          Include category information for each series
  --include-private         Include private series in results
  --include-speakers        Include speaker information for each series
  --include-stats           Include performance statistics for each series
  --live-id=<value>         Filter to series that contain a specific webinar ID
  --live-series-id=<value>  Limit results to a single series by its ID
  --order=<option>          Sort direction
                            <options: asc|desc>
  --ordering=<option>       Field to order results by
                            <options: name|private|live_status|live_date|creation_date|updated_date>
  --[no-]private            Filter by private status
  --search=<value>          Search for specific series by keyword
  --series-type=<option>    Filter by series type
                            <options: liveevent|series>
  --user-id=<value>         Filter to series created by a specific user (use "me" for authenticated user)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List webinar series

EXAMPLES
  $ twentythree webinar series list

  $ twentythree webinar series list --json

  $ twentythree webinar series list --search "Q4" --ordering live_date --order asc

  $ twentythree webinar series list --series-type series --include-speakers --json

  $ twentythree webinar series list --user-id me --include-stats --json
```

_See code: [src/commands/webinar/series/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/webinar/series/list.ts)_

## `twentythree webinar series mapped-objects ID`

List mapped objects for a webinar series

```
USAGE
  $ twentythree webinar series mapped-objects ID [--json] [-w <value>]

ARGUMENTS
  ID  Series ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List mapped objects for a webinar series

EXAMPLES
  $ twentythree webinar series mapped-objects 42

  $ twentythree webinar series mapped-objects 42 --json
```

_See code: [src/commands/webinar/series/mapped-objects.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/webinar/series/mapped-objects.ts)_

## `twentythree webinar series metrics ID`

Get metrics for a webinar series

```
USAGE
  $ twentythree webinar series metrics ID [--json] [-w <value>]

ARGUMENTS
  ID  Series ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get metrics for a webinar series

EXAMPLES
  $ twentythree webinar series metrics 42

  $ twentythree webinar series metrics 42 --json
```

_See code: [src/commands/webinar/series/metrics.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/webinar/series/metrics.ts)_

## `twentythree webinar series recurrences ID`

List recurrences for a webinar series

```
USAGE
  $ twentythree webinar series recurrences ID [--json] [-w <value>]

ARGUMENTS
  ID  Series ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List recurrences for a webinar series

EXAMPLES
  $ twentythree webinar series recurrences 42

  $ twentythree webinar series recurrences 42 --json
```

_See code: [src/commands/webinar/series/recurrences.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/webinar/series/recurrences.ts)_

## `twentythree webinar series set-ondemand ID`

Set a webinar series to on-demand

```
USAGE
  $ twentythree webinar series set-ondemand ID [--json] [-w <value>] [--update-associations]

ARGUMENTS
  ID  Series ID

FLAGS
  --[no-]update-associations  Also update associated webinars

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Set a webinar series to on-demand

EXAMPLES
  $ twentythree webinar series set-ondemand 42

  $ twentythree webinar series set-ondemand 42 --update-associations

  $ twentythree webinar series set-ondemand 42 --json
```

_See code: [src/commands/webinar/series/set-ondemand.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/webinar/series/set-ondemand.ts)_

## `twentythree webinar series skip-recurrence ID`

Skip or unskip a recurrence for a webinar series

```
USAGE
  $ twentythree webinar series skip-recurrence ID [--json] [-w <value>] [--recurrence-id <value>] [--skipped]

ARGUMENTS
  ID  Series ID

FLAGS
  --recurrence-id=<value>  Recurrence ID
  --[no-]skipped           Set skipped (--skipped) or unskipped (--no-skipped)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Skip or unskip a recurrence for a webinar series

EXAMPLES
  $ twentythree webinar series skip-recurrence 42 --recurrence-id 7 --skipped

  $ twentythree webinar series skip-recurrence 42 --recurrence-id 7 --no-skipped

  $ twentythree webinar series skip-recurrence 42 --recurrence-id 7 --skipped --json
```

_See code: [src/commands/webinar/series/skip-recurrence.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/webinar/series/skip-recurrence.ts)_

## `twentythree webinar series update ID`

Update a webinar series

```
USAGE
  $ twentythree webinar series update ID [--json] [-w <value>] [--name <value>] [--description <value>] [--seo-policy
    |index|noindex]

ARGUMENTS
  ID  Series ID

FLAGS
  --description=<value>  Series description
  --name=<value>         Series name
  --seo-policy=<option>  SEO policy for the series: index, noindex, or empty string to reset
                         <options: |index|noindex>

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a webinar series

EXAMPLES
  $ twentythree webinar series update 42 --name "Updated Series"

  $ twentythree webinar series update 42 --description "New description"

  $ twentythree webinar series update 42 --name "Updated" --json
```

_See code: [src/commands/webinar/series/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/webinar/series/update.ts)_

## `twentythree webinar series upload-thumbnail ID FILE`

Upload a thumbnail for a webinar series

```
USAGE
  $ twentythree webinar series upload-thumbnail ID FILE [--json] [-w <value>] [--chunk-size <value>] [--concurrency
  <value>]

ARGUMENTS
  ID    Series ID
  FILE  Path to the image file to upload

FLAGS
  --chunk-size=<value>   [default: 5242880] Chunk size in bytes (default: 5242880)
  --concurrency=<value>  [default: 5] Number of chunks to upload in parallel (default: 5)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload a thumbnail for a webinar series

EXAMPLES
  $ twentythree webinar series upload-thumbnail 42 ./thumb.jpg

  $ twentythree webinar series upload-thumbnail 42 ./thumbnail.png --json
```

_See code: [src/commands/webinar/series/upload-thumbnail.ts](https://github.com/23/twentythree-cli/blob/v1.6.1/src/commands/webinar/series/upload-thumbnail.ts)_
