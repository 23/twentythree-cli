`twentythree video:section`
===========================

Manage video sections (chapters)

* [`twentythree video section`](#twentythree-video-section)
* [`twentythree video section check-generate-available ID`](#twentythree-video-section-check-generate-available-id)
* [`twentythree video section create ID`](#twentythree-video-section-create-id)
* [`twentythree video section delete ID`](#twentythree-video-section-delete-id)
* [`twentythree video section generate ID`](#twentythree-video-section-generate-id)
* [`twentythree video section list ID`](#twentythree-video-section-list-id)
* [`twentythree video section set-thumbnail ID`](#twentythree-video-section-set-thumbnail-id)
* [`twentythree video section update ID`](#twentythree-video-section-update-id)

## `twentythree video section`

Manage video sections (chapters)

```
USAGE
  $ twentythree video section

DESCRIPTION
  Manage video sections (chapters)
```

_See code: [src/commands/video/section/index.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/video/section/index.ts)_

## `twentythree video section check-generate-available ID`

Check whether AI chapter generation is available for a video

```
USAGE
  $ twentythree video section check-generate-available ID [--json] [-w <value>] [--fields <value>]

ARGUMENTS
  ID  Video ID

FLAGS
  --fields=<value>  Comma-separated list of fields to return in the API response

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Check whether AI chapter generation is available for a video

  Checks whether AI chapter generation is available for a given video. Requires the workspace feature to be enabled
  and the video to have a transcript available.

EXAMPLES
  $ twentythree video section check-generate-available 12345

  $ twentythree video section check-generate-available 12345 --json
```

_See code: [src/commands/video/section/check-generate-available.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/video/section/check-generate-available.ts)_

## `twentythree video section create ID`

Create a new section for a video

```
USAGE
  $ twentythree video section create ID --title <value> --start-time <value> [--json] [-w <value>] [--description
  <value>]

ARGUMENTS
  ID  Video ID

FLAGS
  --description=<value>  Section description
  --start-time=<value>   (required) Start time in seconds
  --title=<value>        (required) Section title

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new section for a video

EXAMPLES
  $ twentythree video section create 12345 --title "Introduction" --start-time 0

  $ twentythree video section create 12345 --title "Chapter 1" --start-time 30 --description "First chapter"
```

_See code: [src/commands/video/section/create.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/video/section/create.ts)_

## `twentythree video section delete ID`

Delete a section from a video

```
USAGE
  $ twentythree video section delete ID --section-id <value> [--json] [-w <value>]

ARGUMENTS
  ID  Video ID

FLAGS
  --section-id=<value>  (required) Section ID to delete

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a section from a video

EXAMPLES
  $ twentythree video section delete 12345 --section-id 67

  $ twentythree video section delete 12345 --section-id 67 --json
```

_See code: [src/commands/video/section/delete.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/video/section/delete.ts)_

## `twentythree video section generate ID`

Automatically generate sections for a video using AI (requires transcript)

```
USAGE
  $ twentythree video section generate ID [--json] [-w <value>]

ARGUMENTS
  ID  Video ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Automatically generate sections for a video using AI (requires transcript)

EXAMPLES
  $ twentythree video section generate 12345

  $ twentythree video section generate 12345 --json
```

_See code: [src/commands/video/section/generate.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/video/section/generate.ts)_

## `twentythree video section list ID`

List all sections for a video

```
USAGE
  $ twentythree video section list ID [--json] [-w <value>]

ARGUMENTS
  ID  Video ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List all sections for a video

EXAMPLES
  $ twentythree video section list 12345

  $ twentythree video section list 12345 --json
```

_See code: [src/commands/video/section/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/video/section/list.ts)_

## `twentythree video section set-thumbnail ID`

Set the thumbnail for a video section

```
USAGE
  $ twentythree video section set-thumbnail ID --section-id <value> [--json] [-w <value>] [--time <value>]

ARGUMENTS
  ID  Video ID

FLAGS
  --section-id=<value>  (required) Section ID
  --time=<value>        Time offset in seconds for the thumbnail frame

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Set the thumbnail for a video section

EXAMPLES
  $ twentythree video section set-thumbnail 12345 --section-id 67

  $ twentythree video section set-thumbnail 12345 --section-id 67 --time 15

  $ twentythree video section set-thumbnail 12345 --section-id 67 --time 15 --json
```

_See code: [src/commands/video/section/set-thumbnail.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/video/section/set-thumbnail.ts)_

## `twentythree video section update ID`

Update an existing section for a video

```
USAGE
  $ twentythree video section update ID --section-id <value> [--json] [-w <value>] [--title <value>] [--start-time
    <value>] [--description <value>]

ARGUMENTS
  ID  Video ID

FLAGS
  --description=<value>  New section description
  --section-id=<value>   (required) Section ID to update
  --start-time=<value>   New start time in seconds
  --title=<value>        New section title

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update an existing section for a video

EXAMPLES
  $ twentythree video section update 12345 --section-id 67 --title "New Title"

  $ twentythree video section update 12345 --section-id 67 --start-time 45 --description "Updated"
```

_See code: [src/commands/video/section/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.2/src/commands/video/section/update.ts)_
