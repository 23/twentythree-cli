`twentythree video:subtitle`
============================

Manage video subtitles and captions

* [`twentythree video subtitle`](#twentythree-video-subtitle)
* [`twentythree video subtitle archive`](#twentythree-video-subtitle-archive)
* [`twentythree video subtitle create ID`](#twentythree-video-subtitle-create-id)
* [`twentythree video subtitle data ID`](#twentythree-video-subtitle-data-id)
* [`twentythree video subtitle delete ID`](#twentythree-video-subtitle-delete-id)
* [`twentythree video subtitle duplicate ID`](#twentythree-video-subtitle-duplicate-id)
* [`twentythree video subtitle list ID`](#twentythree-video-subtitle-list-id)
* [`twentythree video subtitle locales`](#twentythree-video-subtitle-locales)
* [`twentythree video subtitle set-primary ID`](#twentythree-video-subtitle-set-primary-id)
* [`twentythree video subtitle types`](#twentythree-video-subtitle-types)
* [`twentythree video subtitle update ID`](#twentythree-video-subtitle-update-id)
* [`twentythree video subtitle upload ID FILE`](#twentythree-video-subtitle-upload-id-file)

## `twentythree video subtitle`

Manage video subtitles and captions

```
USAGE
  $ twentythree video subtitle

DESCRIPTION
  Manage video subtitles and captions
```

_See code: [src/commands/video/subtitle/index.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/video/subtitle/index.ts)_

## `twentythree video subtitle archive`

Check workspace subtitle archive transcription progress

```
USAGE
  $ twentythree video subtitle archive [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Check workspace subtitle archive transcription progress

EXAMPLES
  $ twentythree video subtitle archive

  $ twentythree video subtitle archive --json
```

_See code: [src/commands/video/subtitle/archive.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/video/subtitle/archive.ts)_

## `twentythree video subtitle create ID`

Create a new subtitle track for a video

```
USAGE
  $ twentythree video subtitle create ID --locale <value> [--json] [-w <value>] [--type <value>] [--draft]

ARGUMENTS
  ID  Video ID

FLAGS
  --[no-]draft      Create the subtitle track as a draft (hidden from viewers)
  --locale=<value>  (required) Locale for the subtitle track (e.g. en_US, fr_FR, auto)
  --type=<value>    [default: general] Subtitle type (general, closedcaptions, audiodescriptions)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Create a new subtitle track for a video

EXAMPLES
  $ twentythree video subtitle create 12345 --locale en_US

  $ twentythree video subtitle create 12345 --locale fr_FR --type closedcaptions

  $ twentythree video subtitle create 12345 --locale auto --draft
```

_See code: [src/commands/video/subtitle/create.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/video/subtitle/create.ts)_

## `twentythree video subtitle data ID`

Get raw subtitle content for a subtitle track

```
USAGE
  $ twentythree video subtitle data ID --subtitle-id <value> [--json] [-w <value>] [--format <value>] [--type <value>]

ARGUMENTS
  ID  Video ID

FLAGS
  --format=<value>       [default: websrt] Subtitle format (websrt, webvtt, json, adobe, subviewer)
  --subtitle-id=<value>  (required) Locale of the subtitle track to retrieve (e.g. en_US)
  --type=<value>         [default: general] Subtitle type (general, closedcaptions, audiodescriptions)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get raw subtitle content for a subtitle track

EXAMPLES
  $ twentythree video subtitle data 12345 --subtitle-id en_US

  $ twentythree video subtitle data 12345 --subtitle-id fr_FR --format websrt

  $ twentythree video subtitle data 12345 --subtitle-id en_US --json
```

_See code: [src/commands/video/subtitle/data.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/video/subtitle/data.ts)_

## `twentythree video subtitle delete ID`

Delete a subtitle track from a video

```
USAGE
  $ twentythree video subtitle delete ID --subtitle-id <value> [--json] [-w <value>] [--type <value>]

ARGUMENTS
  ID  Video ID

FLAGS
  --subtitle-id=<value>  (required) Locale of the subtitle track to delete (e.g. en_US)
  --type=<value>         [default: general] Subtitle type to delete (general, closedcaptions, audiodescriptions)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a subtitle track from a video

EXAMPLES
  $ twentythree video subtitle delete 12345 --subtitle-id en_US

  $ twentythree video subtitle delete 12345 --subtitle-id en_US --json
```

_See code: [src/commands/video/subtitle/delete.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/video/subtitle/delete.ts)_

## `twentythree video subtitle duplicate ID`

Duplicate a subtitle track to a new locale

```
USAGE
  $ twentythree video subtitle duplicate ID --subtitle-id <value> --target-locale <value> [--json] [-w <value>] [--source-type
    <value>] [--target-type <value>] [--draft]

ARGUMENTS
  ID  Video ID

FLAGS
  --[no-]draft             Create the duplicated track as a draft
  --source-type=<value>    [default: general] Source subtitle type (general, closedcaptions, audiodescriptions)
  --subtitle-id=<value>    (required) Source locale of the subtitle track to duplicate (e.g. en_US)
  --target-locale=<value>  (required) Target locale for the duplicated subtitle track (e.g. fr_FR)
  --target-type=<value>    [default: general] Target subtitle type (general, closedcaptions, audiodescriptions)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Duplicate a subtitle track to a new locale

EXAMPLES
  $ twentythree video subtitle duplicate 12345 --subtitle-id en_US --target-locale fr_FR

  $ twentythree video subtitle duplicate 12345 --subtitle-id en_US --target-locale de_DE --json
```

_See code: [src/commands/video/subtitle/duplicate.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/video/subtitle/duplicate.ts)_

## `twentythree video subtitle list ID`

List all subtitle tracks for a video

```
USAGE
  $ twentythree video subtitle list ID [--json] [-w <value>] [--include-drafts]

ARGUMENTS
  ID  Video ID

FLAGS
  --[no-]include-drafts  Include draft (unpublished) subtitle tracks

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List all subtitle tracks for a video

EXAMPLES
  $ twentythree video subtitle list 12345

  $ twentythree video subtitle list 12345 --json

  $ twentythree video subtitle list 12345 --include-drafts
```

_See code: [src/commands/video/subtitle/list.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/video/subtitle/list.ts)_

## `twentythree video subtitle locales`

List all available subtitle locales

```
USAGE
  $ twentythree video subtitle locales [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List all available subtitle locales

EXAMPLES
  $ twentythree video subtitle locales

  $ twentythree video subtitle locales --json
```

_See code: [src/commands/video/subtitle/locales.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/video/subtitle/locales.ts)_

## `twentythree video subtitle set-primary ID`

Set a subtitle track as the primary language for a video

```
USAGE
  $ twentythree video subtitle set-primary ID --subtitle-id <value> [--json] [-w <value>]

ARGUMENTS
  ID  Video ID

FLAGS
  --subtitle-id=<value>  (required) Locale of the subtitle track to set as primary (e.g. en_US)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Set a subtitle track as the primary language for a video

EXAMPLES
  $ twentythree video subtitle set-primary 12345 --subtitle-id en_US

  $ twentythree video subtitle set-primary 12345 --subtitle-id fr_FR --json
```

_See code: [src/commands/video/subtitle/set-primary.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/video/subtitle/set-primary.ts)_

## `twentythree video subtitle types`

List all available subtitle types

```
USAGE
  $ twentythree video subtitle types [--json] [-w <value>]

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List all available subtitle types

EXAMPLES
  $ twentythree video subtitle types

  $ twentythree video subtitle types --json
```

_See code: [src/commands/video/subtitle/types.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/video/subtitle/types.ts)_

## `twentythree video subtitle update ID`

Update a subtitle track for a video

```
USAGE
  $ twentythree video subtitle update ID --subtitle-id <value> [--json] [-w <value>] [--type <value>] [--draft]
  [--default]

ARGUMENTS
  ID  Video ID

FLAGS
  --[no-]default         Set this subtitle track as the default
  --[no-]draft           Set draft status (true = hidden, false = published)
  --subtitle-id=<value>  (required) Locale of the subtitle track to update (e.g. en_US)
  --type=<value>         New subtitle type (general, closedcaptions, audiodescriptions)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update a subtitle track for a video

EXAMPLES
  $ twentythree video subtitle update 12345 --subtitle-id en_US --draft false

  $ twentythree video subtitle update 12345 --subtitle-id en_US --type closedcaptions
```

_See code: [src/commands/video/subtitle/update.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/video/subtitle/update.ts)_

## `twentythree video subtitle upload ID FILE`

Upload a subtitle file (SRT or WebVTT) for a video

```
USAGE
  $ twentythree video subtitle upload ID FILE --locale <value> [--json] [-w <value>] [--type <value>] [--draft]

ARGUMENTS
  ID    Video ID
  FILE  Path to the subtitle file (SRT or WebVTT)

FLAGS
  --[no-]draft      Upload as a draft (hidden from viewers until published)
  --locale=<value>  (required) Locale for the subtitle track (e.g. en_US, fr_FR)
  --type=<value>    [default: general] Subtitle type (general, closedcaptions, audiodescriptions)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload a subtitle file (SRT or WebVTT) for a video

EXAMPLES
  $ twentythree video subtitle upload 12345 ./subtitles.srt --locale en_US

  $ twentythree video subtitle upload 12345 ./captions.vtt --locale fr_FR --type closedcaptions

  $ twentythree video subtitle upload 12345 ./subtitles.srt --locale en_US --draft
```

_See code: [src/commands/video/subtitle/upload.ts](https://github.com/23/twentythree-cli/blob/v1.3.4/src/commands/video/subtitle/upload.ts)_
