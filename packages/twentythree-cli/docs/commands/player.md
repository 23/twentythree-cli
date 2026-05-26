`twentythree player`
====================

Delete a player from the active workspace

* [`twentythree player delete ID`](#twentythree-player-delete-id)
* [`twentythree player embed`](#twentythree-player-embed)
* [`twentythree player embed-versions`](#twentythree-player-embed-versions)
* [`twentythree player list`](#twentythree-player-list)
* [`twentythree player remove-thumbnail ID`](#twentythree-player-remove-thumbnail-id)
* [`twentythree player set-thumbnail FILE`](#twentythree-player-set-thumbnail-file)
* [`twentythree player styles`](#twentythree-player-styles)
* [`twentythree player update ID`](#twentythree-player-update-id)

## `twentythree player delete ID`

Delete a player from the active workspace

```
USAGE
  $ twentythree player delete ID [--json] [-w <value>]

ARGUMENTS
  ID  Player ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a player from the active workspace

EXAMPLES
  $ twentythree player delete 42

  $ twentythree player delete 42 --json
```

_See code: [src/commands/player/delete.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/player/delete.ts)_

## `twentythree player embed`

Generate embed code for a video, webinar, or category

```
USAGE
  $ twentythree player embed [--json] [-w <value>] [--video-id <value>] [--webinar-id <value>] [--category-id
    <value>] [--player-id <value>] [--url <value>] [--width <value>] [--height <value>] [--responsive] [--autoplay]
    [--iframe] [--start <value>] [--include-unpublished] [--token <value>] [--source <value>]

FLAGS
  --[no-]autoplay             Enable auto-play in the embed code (maps to autoplay_p)
  --category-id=<value>       Category ID to embed (maps to album_id)
  --height=<value>            Desired embed height in pixels
  --[no-]iframe               Return an iframe-based embed code (maps to iframe_p)
  --[no-]include-unpublished  Include unpublished content in player parameters (maps to include_unpublished_p)
  --player-id=<value>         Player ID to use (default: workspace default)
  --[no-]responsive           Return a responsive embed code (maps to responsive_p)
  --source=<value>            Analytics source tag
  --start=<value>             Start position in seconds
  --token=<value>             Video token for private or token-protected videos
  --url=<value>               Workspace URL to resolve to an embed code
  --video-id=<value>          Video ID to embed (maps to photo_id)
  --webinar-id=<value>        Webinar ID to embed (maps to live_id)
  --width=<value>             Desired embed width in pixels

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Generate embed code for a video, webinar, or category

EXAMPLES
  $ twentythree player embed --video-id 123

  $ twentythree player embed --video-id 123 --responsive > embed.html

  $ twentythree player embed --webinar-id 456 --iframe

  $ twentythree player embed --video-id 123 --json
```

_See code: [src/commands/player/embed.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/player/embed.ts)_

## `twentythree player embed-versions`

List available embed versions for an object

```
USAGE
  $ twentythree player embed-versions --object-type <value> --object-id <value> [--json] [-w <value>] [--source <value>]

FLAGS
  --object-id=<value>    (required) Object ID
  --object-type=<value>  (required) Object type: photo, live, album, or site
  --source=<value>       Embed source parameter (e.g. embed, share)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List available embed versions for an object

EXAMPLES
  $ twentythree player embed-versions --object-type photo --object-id 123

  $ twentythree player embed-versions --object-type live --object-id 456 --json
```

_See code: [src/commands/player/embed-versions.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/player/embed-versions.ts)_

## `twentythree player list`

List players in the active workspace

```
USAGE
  $ twentythree player list [--json] [-w <value>] [--source <value>]

FLAGS
  --source=<value>  Analytics source tag

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List players in the active workspace

EXAMPLES
  $ twentythree player list

  $ twentythree player list --json
```

_See code: [src/commands/player/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/player/list.ts)_

## `twentythree player remove-thumbnail ID`

Remove the custom thumbnail for a player, reverting to the default

```
USAGE
  $ twentythree player remove-thumbnail ID [--json] [-w <value>]

ARGUMENTS
  ID  Player ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Remove the custom thumbnail for a player, reverting to the default

EXAMPLES
  $ twentythree player remove-thumbnail 42

  $ twentythree player remove-thumbnail 42 --json
```

_See code: [src/commands/player/remove-thumbnail.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/player/remove-thumbnail.ts)_

## `twentythree player set-thumbnail FILE`

Upload and set a custom thumbnail image for a player

```
USAGE
  $ twentythree player set-thumbnail FILE --player-id <value> [--json] [-w <value>]

ARGUMENTS
  FILE  Path to the thumbnail image file

FLAGS
  --player-id=<value>  (required) Player ID to update

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload and set a custom thumbnail image for a player

EXAMPLES
  $ twentythree player set-thumbnail ./thumbnail.png --player-id 42

  $ twentythree player set-thumbnail ./thumbnail.jpg --player-id 42 --json
```

_See code: [src/commands/player/set-thumbnail.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/player/set-thumbnail.ts)_

## `twentythree player styles`

List available player visual styles

```
USAGE
  $ twentythree player styles [--json] [-w <value>] [--fields <value>]

FLAGS
  --fields=<value>  Comma-separated list of fields to return

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List available player visual styles

EXAMPLES
  $ twentythree player styles

  $ twentythree player styles --json
```

_See code: [src/commands/player/styles.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/player/styles.ts)_

## `twentythree player update ID`

Update settings for a player

```
USAGE
  $ twentythree player update ID [--json] [-w <value>] [--name <value>] [--description <value>] [--data <value>]

ARGUMENTS
  ID  Player ID

FLAGS
  --data=<value>         JSON-encoded player properties to merge into the request body
  --description=<value>  New description for the player
  --name=<value>         New name for the player

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update settings for a player

EXAMPLES
  $ twentythree player update 42 --name "My Player"

  $ twentythree player update 42 --description "New description"
```

_See code: [src/commands/player/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.8/src/commands/player/update.ts)_
