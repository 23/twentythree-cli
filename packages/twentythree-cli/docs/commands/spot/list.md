`twentythree spot:list`
=======================

List spots in the active workspace

* [`twentythree spot list`](#twentythree-spot-list)

## `twentythree spot list`

List spots in the active workspace

```
USAGE
  $ twentythree spot list [--json] [-w <value>] [--page <value>] [--size <value>] [--search <value>]
    [--spot-id <value>] [--spot-type page|widget] [--spot-object-type live|video] [--active] [--no-active]
    [--include-analytics] [--orderby spot_name|creation_time|title] [--order asc|desc] [--fields <value>]

FLAGS
  --[no-]active                  Filter by active status
  --fields=<value>               Comma-separated list of fields to return in the API response
  --include-analytics            Include impression analytics data for each spot
  --order=<option>               Sort direction
                                 <options: asc|desc>
  --orderby=<option>             Field to order results by
                                 <options: spot_name|creation_time|title>
  --page=<value>                 Page number
  --search=<value>               Search spots by name
  --size=<value>                 Number of results per page
  --spot-id=<value>              Filter to a specific spot by ID
  --spot-object-type=<option>    Filter by the object type the spot is configured for
                                 <options: live|video>
  --spot-type=<option>           Filter by spot type
                                 <options: page|widget>

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List spots in the active workspace

EXAMPLES
  $ twentythree spot list

  $ twentythree spot list --search "my spot"

  $ twentythree spot list --active

  $ twentythree spot list --spot-type page --orderby creation_time --order desc

  $ twentythree spot list --spot-object-type live --include-analytics --json
```

_See code: [src/commands/spot/list.ts](https://github.com/23/twentythree-cli/blob/v1.5.0/src/commands/spot/list.ts)_
