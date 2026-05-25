`twentythree audience`
======================

List audience companies

* [`twentythree audience companies`](#twentythree-audience-companies)
* [`twentythree audience field list`](#twentythree-audience-field-list)
* [`twentythree audience field remove`](#twentythree-audience-field-remove)
* [`twentythree audience field set`](#twentythree-audience-field-set)
* [`twentythree audience field types`](#twentythree-audience-field-types)
* [`twentythree audience funnel`](#twentythree-audience-funnel)
* [`twentythree audience identity-sources`](#twentythree-audience-identity-sources)
* [`twentythree audience list`](#twentythree-audience-list)
* [`twentythree audience list-collectors`](#twentythree-audience-list-collectors)
* [`twentythree audience metrics`](#twentythree-audience-metrics)
* [`twentythree audience register`](#twentythree-audience-register)
* [`twentythree audience remove`](#twentythree-audience-remove)
* [`twentythree audience search`](#twentythree-audience-search)
* [`twentythree audience timelines`](#twentythree-audience-timelines)
* [`twentythree audience unregister`](#twentythree-audience-unregister)

## `twentythree audience companies`

List audience companies

```
USAGE
  $ twentythree audience companies [--json] [-w <value>] [--page <value>] [--size <value>] [--offset <value>] [--orderby
    <value>] [--order <value>] [--identified] [--domains <value>]

FLAGS
  --domains=<value>  Filter by company domains (space-separated)
  --[no-]identified  Filter to identified companies only
  --offset=<value>   Offset for pagination
  --order=<value>    Sort direction (asc/desc)
  --orderby=<value>  Order by field
  --page=<value>     Page number
  --size=<value>     Page size

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List audience companies

EXAMPLES
  $ twentythree audience companies

  $ twentythree audience companies --identified --size 50

  $ twentythree audience companies --domains "acme.com" --json
```

_See code: [src/commands/audience/companies.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/companies.ts)_

## `twentythree audience field list`

List custom audience fields

```
USAGE
  $ twentythree audience field list [--json] [-w <value>] [--include-widget-html]

FLAGS
  --include-widget-html  Include HTML widget for each field

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List custom audience fields

EXAMPLES
  $ twentythree audience field list

  $ twentythree audience field list --include-widget-html

  $ twentythree audience field list --json
```

_See code: [src/commands/audience/field/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/field/list.ts)_

## `twentythree audience field remove`

Remove a custom audience field

```
USAGE
  $ twentythree audience field remove --key <value> [--json] [-w <value>]

FLAGS
  --key=<value>  (required) Field key to remove

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove a custom audience field

EXAMPLES
  $ twentythree audience field remove --key "department"

  $ twentythree audience field remove --key "old-field" --json
```

_See code: [src/commands/audience/field/remove.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/field/remove.ts)_

## `twentythree audience field set`

Create or update a custom audience field

```
USAGE
  $ twentythree audience field set --key <value> --type <value> --label <value> [--json] [-w <value>] [--options
    <value>] [--priority <value>]

FLAGS
  --key=<value>       (required) Unique field key
  --label=<value>     (required) Human-readable label
  --options=<value>   Semicolon-separated options (for enumerable types)
  --priority=<value>  Display order priority
  --type=<value>      (required) Field type (use audience field types to list valid values)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create or update a custom audience field

EXAMPLES
  $ twentythree audience field set --key "department" --type text --label "Department"

  $ twentythree audience field set --key "tier" --type enum --label "Customer Tier" --options "free;pro;enterprise"

  $ twentythree audience field set --key "score" --type number --label "NPS Score" --priority 1 --json
```

_See code: [src/commands/audience/field/set.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/field/set.ts)_

## `twentythree audience field types`

List valid audience field types

```
USAGE
  $ twentythree audience field types [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List valid audience field types

EXAMPLES
  $ twentythree audience field types

  $ twentythree audience field types --json
```

_See code: [src/commands/audience/field/types.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/field/types.ts)_

## `twentythree audience funnel`

Get audience funnel analytics

```
USAGE
  $ twentythree audience funnel [--json] [-w <value>] [--objects <value>] [--live-type <value>]
    [--resolve-recordings] [--resolve-live-series]

FLAGS
  --live-type=<value>    Live event type filter
  --objects=<value>      Filter by object IDs (space-separated)
  --resolve-live-series  Resolve live series details
  --resolve-recordings   Resolve recording details

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get audience funnel analytics

EXAMPLES
  $ twentythree audience funnel

  $ twentythree audience funnel --objects "123 456" --json

  $ twentythree audience funnel --live-type on_demand --resolve-recordings
```

_See code: [src/commands/audience/funnel.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/funnel.ts)_

## `twentythree audience identity-sources`

List audience identity sources

```
USAGE
  $ twentythree audience identity-sources [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List audience identity sources

EXAMPLES
  $ twentythree audience identity-sources

  $ twentythree audience identity-sources --json
```

_See code: [src/commands/audience/identity-sources.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/identity-sources.ts)_

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

_See code: [src/commands/audience/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/list.ts)_

## `twentythree audience list-collectors`

List collectors linked to audience

```
USAGE
  $ twentythree audience list-collectors [--json] [-w <value>] [--object-id <value>] [--action-id <value>]

FLAGS
  --action-id=<value>  Filter by action ID
  --object-id=<value>  Filter by object ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List collectors linked to audience

EXAMPLES
  $ twentythree audience list-collectors

  $ twentythree audience list-collectors --object-id 123

  $ twentythree audience list-collectors --action-id 456 --json
```

_See code: [src/commands/audience/list-collectors.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/list-collectors.ts)_

## `twentythree audience metrics`

Get audience aggregate metrics

```
USAGE
  $ twentythree audience metrics [--json] [-w <value>] [--page <value>] [--size <value>] [--offset <value>] [--search
    <value>] [--identified] [--objects <value>]

FLAGS
  --[no-]identified  Filter to identified profiles only
  --objects=<value>  Filter by viewed object IDs (space-separated)
  --offset=<value>   Offset for pagination
  --page=<value>     Page number
  --search=<value>   Free-text search filter
  --size=<value>     Page size

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get audience aggregate metrics

EXAMPLES
  $ twentythree audience metrics

  $ twentythree audience metrics --identified --json

  $ twentythree audience metrics --search "acme" --size 100
```

_See code: [src/commands/audience/metrics.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/metrics.ts)_

## `twentythree audience register`

Register an audience contact

```
USAGE
  $ twentythree audience register --email <value> [--json] [-w <value>] [--object-id <value>] [--uuid <value>]
    [--action-id <value>] [--firstname <value>] [--lastname <value>] [--company <value>] [--phone <value>] [--return-url
    <value>] [--source <value>]

FLAGS
  --action-id=<value>   Collector action ID
  --company=<value>     Company name
  --email=<value>       (required) Contact email address
  --firstname=<value>   First name
  --lastname=<value>    Last name
  --object-id=<value>   Webinar/video ID to register for
  --phone=<value>       Phone number
  --return-url=<value>  Base URL for tracking URL
  --source=<value>      Registration source (api, import, site, custom)
  --uuid=<value>        Existing contact UUID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Register an audience contact

EXAMPLES
  $ twentythree audience register --email "jane@example.com"

  $ twentythree audience register --email "john@acme.com" --object-id 123 --firstname "John" --lastname "Doe"

  $ twentythree audience register --email "user@co.com" --company "Acme Corp" --source api --json
```

_See code: [src/commands/audience/register.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/register.ts)_

## `twentythree audience remove`

Permanently remove an audience contact

```
USAGE
  $ twentythree audience remove [--json] [-w <value>] [--email <value>] [--uuid <value>]

FLAGS
  --email=<value>  Contact email address
  --uuid=<value>   Contact UUID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Permanently remove an audience contact

EXAMPLES
  $ twentythree audience remove --email "jane@example.com"

  $ twentythree audience remove --uuid "abc-def-ghi"

  $ twentythree audience remove --email "user@co.com" --json
```

_See code: [src/commands/audience/remove.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/remove.ts)_

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

_See code: [src/commands/audience/search.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/search.ts)_

## `twentythree audience timelines`

Get audience member timelines

```
USAGE
  $ twentythree audience timelines [--json] [-w <value>] [--page <value>] [--size <value>] [--offset <value>] [--uuid
    <value>] [--objects <value>] [--orderby <value>] [--order <value>]

FLAGS
  --objects=<value>  Filter by object IDs (space-separated)
  --offset=<value>   Offset for pagination
  --order=<value>    Sort direction (asc/desc)
  --orderby=<value>  Order by field
  --page=<value>     Page number
  --size=<value>     Page size
  --uuid=<value>     Filter by audience member UUID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get audience member timelines

EXAMPLES
  $ twentythree audience timelines

  $ twentythree audience timelines --uuid "abc-123" --size 20

  $ twentythree audience timelines --objects "456 789" --json
```

_See code: [src/commands/audience/timelines.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/timelines.ts)_

## `twentythree audience unregister`

Remove a registration for an audience contact

```
USAGE
  $ twentythree audience unregister --object-id <value> [--json] [-w <value>] [--email <value>] [--uuid <value>]

FLAGS
  --email=<value>      Contact email
  --object-id=<value>  (required) Object ID to unregister from
  --uuid=<value>       Contact UUID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove a registration for an audience contact

EXAMPLES
  $ twentythree audience unregister --object-id 123 --email "jane@example.com"

  $ twentythree audience unregister --object-id 456 --uuid "abc-def-ghi"

  $ twentythree audience unregister --object-id 789 --json
```

_See code: [src/commands/audience/unregister.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/audience/unregister.ts)_
