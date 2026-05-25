`twentythree app`
=================

Create a new app integration

* [`twentythree app add`](#twentythree-app-add)
* [`twentythree app delete ID`](#twentythree-app-delete-id)
* [`twentythree app list`](#twentythree-app-list)
* [`twentythree app remove-thumbnail ID`](#twentythree-app-remove-thumbnail-id)
* [`twentythree app set-thumbnail FILE`](#twentythree-app-set-thumbnail-file)
* [`twentythree app update ID`](#twentythree-app-update-id)

## `twentythree app add`

Create a new app integration

```
USAGE
  $ twentythree app add --name <value> [--json] [-w <value>] [--description <value>] [--style <value>]
    [--type <value>]

FLAGS
  --description=<value>  App description
  --name=<value>         (required) App name
  --style=<value>        App style
  --type=<value>         App type

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new app integration

EXAMPLES
  $ twentythree app add --name "My App"

  $ twentythree app add --name "My App" --description "A sample app"

  $ twentythree app add --name "My App" --json
```

_See code: [src/commands/app/add.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/app/add.ts)_

## `twentythree app delete ID`

Delete an app integration from the active workspace

```
USAGE
  $ twentythree app delete ID [--json] [-w <value>]

ARGUMENTS
  ID  App ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete an app integration from the active workspace

EXAMPLES
  $ twentythree app delete 12345

  $ twentythree app delete 12345 --json
```

_See code: [src/commands/app/delete.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/app/delete.ts)_

## `twentythree app list`

List player design apps on the active workspace

```
USAGE
  $ twentythree app list [--json] [-w <value>] [--app-id <value>] [--page <value>] [--size <value>]

FLAGS
  --app-id=<value>  Filter results to a specific app ID
  --page=<value>    Page offset
  --size=<value>    Number of results per page (default 20, max 100)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List player design apps on the active workspace

EXAMPLES
  $ twentythree app list

  $ twentythree app list --app-id 42

  $ twentythree app list --page 2 --size 50

  $ twentythree app list --json
```

_See code: [src/commands/app/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/app/list.ts)_

## `twentythree app remove-thumbnail ID`

Remove the custom thumbnail for an app, reverting to the default

```
USAGE
  $ twentythree app remove-thumbnail ID [--json] [-w <value>]

ARGUMENTS
  ID  App ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove the custom thumbnail for an app, reverting to the default

EXAMPLES
  $ twentythree app remove-thumbnail 42

  $ twentythree app remove-thumbnail 42 --json
```

_See code: [src/commands/app/remove-thumbnail.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/app/remove-thumbnail.ts)_

## `twentythree app set-thumbnail FILE`

Upload and set a custom thumbnail image for an app

```
USAGE
  $ twentythree app set-thumbnail FILE --app-id <value> [--json] [-w <value>]

ARGUMENTS
  FILE  Path to the thumbnail image file

FLAGS
  --app-id=<value>  (required) App ID to update

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload and set a custom thumbnail image for an app

EXAMPLES
  $ twentythree app set-thumbnail ./thumbnail.png --app-id 42

  $ twentythree app set-thumbnail ./thumbnail.jpg --app-id 42 --json
```

_See code: [src/commands/app/set-thumbnail.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/app/set-thumbnail.ts)_

## `twentythree app update ID`

Update an existing app integration

```
USAGE
  $ twentythree app update ID [--json] [-w <value>] [--name <value>] [--description <value>] [--style <value>]

ARGUMENTS
  ID  App ID

FLAGS
  --description=<value>  App description
  --name=<value>         App name
  --style=<value>        App style

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update an existing app integration

EXAMPLES
  $ twentythree app update 12345 --name "Updated Name"

  $ twentythree app update 12345 --description "New description"

  $ twentythree app update 12345 --name "Updated Name" --description "New description"

  $ twentythree app update 12345 --name "Updated Name" --json
```

_See code: [src/commands/app/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.7/src/commands/app/update.ts)_
