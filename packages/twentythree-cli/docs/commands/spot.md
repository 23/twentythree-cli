`twentythree spot`
==================

Get details of a specific spot

* [`twentythree spot check ID`](#twentythree-spot-check-id)
* [`twentythree spot create`](#twentythree-spot-create)
* [`twentythree spot delete ID`](#twentythree-spot-delete-id)
* [`twentythree spot list`](#twentythree-spot-list)
* [`twentythree spot reset-version ID`](#twentythree-spot-reset-version-id)
* [`twentythree spot set-videos ID`](#twentythree-spot-set-videos-id)
* [`twentythree spot update ID`](#twentythree-spot-update-id)

## `twentythree spot check ID`

Get details of a specific spot

```
USAGE
  $ twentythree spot check ID [--json] [-w <value>]

ARGUMENTS
  ID  Spot ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get details of a specific spot

EXAMPLES
  $ twentythree spot check 12345

  $ twentythree spot check 12345 --json
```

_See code: [src/commands/spot/check.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/spot/check.ts)_

## `twentythree spot create`

Create a new spot

```
USAGE
  $ twentythree spot create --spot-name <value> [--json] [-w <value>] [--spot-type <value>] [--spot-design
    <value>] [--spot-layout <value>]

FLAGS
  --spot-design=<value>  Design for the spot
  --spot-layout=<value>  Layout for the spot
  --spot-name=<value>    (required) Name for the new spot
  --spot-type=<value>    Type of spot

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new spot

EXAMPLES
  $ twentythree spot create --spot-name "My Spot"

  $ twentythree spot create --spot-name "My Spot" --spot-type "video"

  $ twentythree spot create --spot-name "My Spot" --json
```

_See code: [src/commands/spot/create.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/spot/create.ts)_

## `twentythree spot delete ID`

Delete a spot from the active workspace

```
USAGE
  $ twentythree spot delete ID [--json] [-w <value>]

ARGUMENTS
  ID  Spot ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a spot from the active workspace

EXAMPLES
  $ twentythree spot delete 12345

  $ twentythree spot delete 12345 --json
```

_See code: [src/commands/spot/delete.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/spot/delete.ts)_

## `twentythree spot list`

List spots in the active workspace

```
USAGE
  $ twentythree spot list [--json] [-w <value>] [--page <value>] [--size <value>] [--search <value>]
    [--spot-type <value>] [--active] [--orderby <value>] [--order <value>]

FLAGS
  --[no-]active        Filter by active status
  --order=<value>      Sort order (asc or desc)
  --orderby=<value>    Field to order results by
  --page=<value>       Page number
  --search=<value>     Search term
  --size=<value>       Number of results per page
  --spot-type=<value>  Filter by spot type

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List spots in the active workspace

EXAMPLES
  $ twentythree spot list

  $ twentythree spot list --search "my spot"

  $ twentythree spot list --active

  $ twentythree spot list --json
```

_See code: [src/commands/spot/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/spot/list.ts)_

## `twentythree spot reset-version ID`

Reset the version of a spot

```
USAGE
  $ twentythree spot reset-version ID [--json] [-w <value>]

ARGUMENTS
  ID  Spot ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Reset the version of a spot

EXAMPLES
  $ twentythree spot reset-version 12345

  $ twentythree spot reset-version 12345 --json
```

_See code: [src/commands/spot/reset-version.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/spot/reset-version.ts)_

## `twentythree spot set-videos ID`

Assign videos to a spot

```
USAGE
  $ twentythree spot set-videos ID --videos <value> [--json] [-w <value>]

ARGUMENTS
  ID  Spot ID

FLAGS
  --videos=<value>  (required) Comma-separated video IDs to assign to the spot

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Assign videos to a spot

EXAMPLES
  $ twentythree spot set-videos 12345 --videos "111,222,333"

  $ twentythree spot set-videos 12345 --videos "111" --json
```

_See code: [src/commands/spot/set-videos.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/spot/set-videos.ts)_

## `twentythree spot update ID`

Update a spot

```
USAGE
  $ twentythree spot update ID [--json] [-w <value>] [--spot-name <value>] [--active]

ARGUMENTS
  ID  Spot ID

FLAGS
  --[no-]active        Set active status
  --spot-name=<value>  New name for the spot

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a spot

EXAMPLES
  $ twentythree spot update 12345 --spot-name "New Name"

  $ twentythree spot update 12345 --active

  $ twentythree spot update 12345 --no-active

  $ twentythree spot update 12345 --spot-name "New Name" --json
```

_See code: [src/commands/spot/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.3/src/commands/spot/update.ts)_
