`twentythree action`
====================

Create a new CTA action on a video or webinar

* [`twentythree action add`](#twentythree-action-add)
* [`twentythree action delete ID`](#twentythree-action-delete-id)
* [`twentythree action exclude ID`](#twentythree-action-exclude-id)
* [`twentythree action get [ID]`](#twentythree-action-get-id)
* [`twentythree action include ID`](#twentythree-action-include-id)
* [`twentythree action list`](#twentythree-action-list)
* [`twentythree action types`](#twentythree-action-types)
* [`twentythree action update ID`](#twentythree-action-update-id)
* [`twentythree action upload ID VARIABLE-NAME FILE`](#twentythree-action-upload-id-variable-name-file)

## `twentythree action add`

Create a new CTA action on a video or webinar

```
USAGE
  $ twentythree action add --type <value> --object-id <value> [--json] [-w <value>] [--fields <value>]

FLAGS
  --fields=<value>     Additional fields for the action (key=value pairs)
  --object-id=<value>  (required) Object ID (video or webinar) to attach the action to
  --type=<value>       (required) Action type (use `action types` to list available types)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new CTA action on a video or webinar

EXAMPLES
  $ twentythree action add --type overlay --object-id 12345

  $ twentythree action add --type overlay --object-id 12345 --fields "title=Buy Now"

  $ twentythree action add --type overlay --object-id 12345 --json
```

_See code: [src/commands/action/add.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/action/add.ts)_

## `twentythree action delete ID`

Delete a CTA action

```
USAGE
  $ twentythree action delete ID [--json] [-w <value>]

ARGUMENTS
  ID  Action ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a CTA action

EXAMPLES
  $ twentythree action delete 12345

  $ twentythree action delete 12345 --json
```

_See code: [src/commands/action/delete.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/action/delete.ts)_

## `twentythree action exclude ID`

Exclude a CTA action from an object (or undo an exclusion)

```
USAGE
  $ twentythree action exclude ID --object-id <value> [--json] [-w <value>] [--undo]

ARGUMENTS
  ID  Action ID

FLAGS
  --object-id=<value>  (required) Object ID to exclude the action from
  --undo               Remove the exclusion (reverse this operation)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Exclude a CTA action from an object (or undo an exclusion)

EXAMPLES
  $ twentythree action exclude 12345 --object-id 6789

  $ twentythree action exclude 12345 --object-id 6789 --undo

  $ twentythree action exclude 12345 --object-id 6789 --json
```

_See code: [src/commands/action/exclude.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/action/exclude.ts)_

## `twentythree action get [ID]`

Get details of a CTA action

```
USAGE
  $ twentythree action get [ID] [--json] [-w <value>] [--object-id <value>] [--video-id <value>] [--webinar-id
    <value>] [--token <value>] [--player-id <value>] [--exclude-internal] [--exclude-pending] [--exclude-items]

ARGUMENTS
  [ID]  Action ID (optional)

FLAGS
  --exclude-internal    Exclude internal actions
  --exclude-items       Exclude action items
  --exclude-pending     Exclude pending actions
  --object-id=<value>   Object ID context
  --player-id=<value>   Player ID context
  --token=<value>       Object token for authentication
  --video-id=<value>    Video ID context (maps to photo_id)
  --webinar-id=<value>  Webinar ID context (maps to live_id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get details of a CTA action

EXAMPLES
  $ twentythree action get 12345

  $ twentythree action get --video-id 6789

  $ twentythree action get --webinar-id 1234 --json

  $ twentythree action get 12345 --json
```

_See code: [src/commands/action/get.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/action/get.ts)_

## `twentythree action include ID`

Include an object in a CTA action scope (or undo an inclusion)

```
USAGE
  $ twentythree action include ID --object-id <value> [--json] [-w <value>] [--undo]

ARGUMENTS
  ID  Action ID

FLAGS
  --object-id=<value>  (required) Object ID to include the action on
  --undo               Remove the inclusion (reverse this operation)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Include an object in a CTA action scope (or undo an inclusion)

EXAMPLES
  $ twentythree action include 12345 --object-id 6789

  $ twentythree action include 12345 --object-id 6789 --undo

  $ twentythree action include 12345 --object-id 6789 --json
```

_See code: [src/commands/action/include.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/action/include.ts)_

## `twentythree action list`

List CTA actions for a video, webinar, or object

```
USAGE
  $ twentythree action list [--json] [-w <value>] [--object-id <value>] [--video-id <value>] [--webinar-id
    <value>] [--player-id <value>] [--exclude-internal] [--exclude-pending] [--exclude-items]

FLAGS
  --exclude-internal    Exclude internal actions
  --exclude-items       Exclude action items
  --exclude-pending     Exclude pending actions
  --object-id=<value>   Object ID to filter actions by
  --player-id=<value>   Player ID to filter actions by
  --video-id=<value>    Video ID to filter actions by (maps to photo_id)
  --webinar-id=<value>  Webinar ID to filter actions by (maps to live_id)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List CTA actions for a video, webinar, or object

EXAMPLES
  $ twentythree action list --video-id 12345

  $ twentythree action list --webinar-id 6789

  $ twentythree action list --object-id 12345

  $ twentythree action list --video-id 12345 --json
```

_See code: [src/commands/action/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/action/list.ts)_

## `twentythree action types`

List available CTA action types

```
USAGE
  $ twentythree action types [--json] [-w <value>] [--exclude-internal]

FLAGS
  --exclude-internal  Exclude internal action types from the list

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List available CTA action types

EXAMPLES
  $ twentythree action types

  $ twentythree action types --exclude-internal

  $ twentythree action types --json
```

_See code: [src/commands/action/types.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/action/types.ts)_

## `twentythree action update ID`

Update an existing CTA action

```
USAGE
  $ twentythree action update ID --name <value> --start-time <value> --end-time <value> [--json] [-w <value>]
    [--time-relative-to <value>] [--return-url <value>]

ARGUMENTS
  ID  Action ID

FLAGS
  --end-time=<value>          (required) End time of the action (seconds)
  --name=<value>              (required) Display name for the action
  --return-url=<value>        Return URL for the action
  --start-time=<value>        (required) Start time of the action (seconds)
  --time-relative-to=<value>  [default: duration] What the timing is relative to (default: duration)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update an existing CTA action

EXAMPLES
  $ twentythree action update 12345 --name "Buy Now" --start-time 10 --end-time 20

  $ twentythree action update 12345 --name "Buy Now" --start-time 10 --end-time 20 --return-url "https://example.com"

  $ twentythree action update 12345 --name "Buy Now" --start-time 10 --end-time 20 --json
```

_See code: [src/commands/action/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/action/update.ts)_

## `twentythree action upload ID VARIABLE-NAME FILE`

Upload a file to an action variable

```
USAGE
  $ twentythree action upload ID VARIABLE-NAME FILE [--json] [-w <value>]

ARGUMENTS
  ID             Action ID
  VARIABLE-NAME  Variable name for the file upload
  FILE           Path to the file to upload

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload a file to an action variable

EXAMPLES
  $ twentythree action upload 12345 image ./banner.png

  $ twentythree action upload 12345 video ./clip.mp4

  $ twentythree action upload 12345 image ./banner.png --json
```

_See code: [src/commands/action/upload.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/action/upload.ts)_
