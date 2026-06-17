`twentythree video`
===================

Manage videos — upload, list, update, delete, and more

* [`twentythree video`](#twentythree-video)
* [`twentythree video delete ID`](#twentythree-video-delete-id)
* [`twentythree video frame ID`](#twentythree-video-frame-id)
* [`twentythree video get ID`](#twentythree-video-get-id)
* [`twentythree video list`](#twentythree-video-list)
* [`twentythree video replace ID FILE`](#twentythree-video-replace-id-file)
* [`twentythree video section`](#twentythree-video-section)
* [`twentythree video section create ID`](#twentythree-video-section-create-id)
* [`twentythree video section delete ID`](#twentythree-video-section-delete-id)
* [`twentythree video section generate ID`](#twentythree-video-section-generate-id)
* [`twentythree video section list ID`](#twentythree-video-section-list-id)
* [`twentythree video section set-thumbnail ID`](#twentythree-video-section-set-thumbnail-id)
* [`twentythree video section update ID`](#twentythree-video-section-update-id)
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
* [`twentythree video transcoding-progress ID`](#twentythree-video-transcoding-progress-id)
* [`twentythree video update ID`](#twentythree-video-update-id)
* [`twentythree video upload FILE`](#twentythree-video-upload-file)

## `twentythree video`

Manage videos — upload, list, update, delete, and more

```
USAGE
  $ twentythree video

DESCRIPTION
  Manage videos — upload, list, update, delete, and more
```

_See code: [src/commands/video/index.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/index.ts)_

## `twentythree video delete ID`

Delete a video from the active workspace

```
USAGE
  $ twentythree video delete ID [--json] [-w <value>]

ARGUMENTS
  ID  Video ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Delete a video from the active workspace

EXAMPLES
  $ twentythree video delete 12345

  $ twentythree video delete 12345 --json
```

_See code: [src/commands/video/delete.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/delete.ts)_

## `twentythree video frame ID`

Extract a frame from a video

```
USAGE
  $ twentythree video frame ID [--json] [-w <value>] [--time <value>]

ARGUMENTS
  ID  Video ID

FLAGS
  --time=<value>  Time offset in seconds to extract the frame from

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Extract a frame from a video

EXAMPLES
  $ twentythree video frame 12345

  $ twentythree video frame 12345 --time 30

  $ twentythree video frame 12345 --time 30 --json
```

_See code: [src/commands/video/frame.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/frame.ts)_

## `twentythree video get ID`

Get details of a specific video

```
USAGE
  $ twentythree video get ID [--json] [-w <value>]

ARGUMENTS
  ID  Video ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Get details of a specific video

EXAMPLES
  $ twentythree video get 12345

  $ twentythree video get 12345 --json
```

_See code: [src/commands/video/get.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/get.ts)_

## `twentythree video list`

List videos in the active workspace

```
USAGE
  $ twentythree video list [--json] [-w <value>] [--limit <value>] [--include-unpublished]

FLAGS
  --[no-]include-unpublished  Include unpublished videos in the results
  --limit=<value>             Maximum number of videos to return (default: all)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  List videos in the active workspace

EXAMPLES
  $ twentythree video list

  $ twentythree video list --json
```

_See code: [src/commands/video/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/list.ts)_

## `twentythree video replace ID FILE`

Replace the video file for an existing video

```
USAGE
  $ twentythree video replace ID FILE [--json] [-w <value>] [--chunk-size <value>] [--concurrency <value>]

ARGUMENTS
  ID    Video ID to replace
  FILE  Path to the replacement video file

FLAGS
  --chunk-size=<value>   [default: 5242880] Chunk size in bytes (default: 5242880 = 100MB)
  --concurrency=<value>  [default: 5] Number of chunks to upload in parallel (default: 5)

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Replace the video file for an existing video

EXAMPLES
  $ twentythree video replace 12345 ./new-video.mp4

  $ twentythree video replace 12345 ./new-video.mp4 --chunk-size 52428800 --concurrency 3
```

_See code: [src/commands/video/replace.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/replace.ts)_

## `twentythree video section`

Manage video sections (chapters)

```
USAGE
  $ twentythree video section

DESCRIPTION
  Manage video sections (chapters)
```

_See code: [src/commands/video/section/index.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/section/index.ts)_

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

_See code: [src/commands/video/section/create.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/section/create.ts)_

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

_See code: [src/commands/video/section/delete.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/section/delete.ts)_

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

_See code: [src/commands/video/section/generate.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/section/generate.ts)_

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

_See code: [src/commands/video/section/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/section/list.ts)_

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

_See code: [src/commands/video/section/set-thumbnail.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/section/set-thumbnail.ts)_

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

_See code: [src/commands/video/section/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/section/update.ts)_

## `twentythree video subtitle`

Manage video subtitles and captions

```
USAGE
  $ twentythree video subtitle

DESCRIPTION
  Manage video subtitles and captions
```

_See code: [src/commands/video/subtitle/index.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/subtitle/index.ts)_

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

_See code: [src/commands/video/subtitle/archive.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/subtitle/archive.ts)_

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

_See code: [src/commands/video/subtitle/create.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/subtitle/create.ts)_

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

_See code: [src/commands/video/subtitle/data.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/subtitle/data.ts)_

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

_See code: [src/commands/video/subtitle/delete.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/subtitle/delete.ts)_

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

_See code: [src/commands/video/subtitle/duplicate.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/subtitle/duplicate.ts)_

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

_See code: [src/commands/video/subtitle/list.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/subtitle/list.ts)_

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

_See code: [src/commands/video/subtitle/locales.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/subtitle/locales.ts)_

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

_See code: [src/commands/video/subtitle/set-primary.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/subtitle/set-primary.ts)_

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

_See code: [src/commands/video/subtitle/types.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/subtitle/types.ts)_

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

_See code: [src/commands/video/subtitle/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/subtitle/update.ts)_

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

_See code: [src/commands/video/subtitle/upload.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/subtitle/upload.ts)_

## `twentythree video transcoding-progress ID`

Check the transcoding progress for a video

```
USAGE
  $ twentythree video transcoding-progress ID [--json] [-w <value>]

ARGUMENTS
  ID  Video ID

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Check the transcoding progress for a video

EXAMPLES
  $ twentythree video transcoding-progress 12345

  $ twentythree video transcoding-progress 12345 --json
```

_See code: [src/commands/video/transcoding-progress.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/transcoding-progress.ts)_

## `twentythree video update ID`

Update metadata for a video

```
USAGE
  $ twentythree video update ID [--360] [--json] [-w <value>] [--title <value>] [--description <value>] [--tags
    <value>] [--category-id <value>] [--publish] [--promote] [--publish-date <value>] [--seo-policy |index|noindex]

ARGUMENTS
  ID  Video ID

FLAGS
  --[no-]360              Mark as 360° video
  --category-id=<value>   Category ID (or comma-separated IDs) to assign the video to
  --description=<value>   New description for the video
  --[no-]promote          Promote or demote the video
  --[no-]publish          Publish or unpublish the video
  --publish-date=<value>  Scheduled publish date/time (ISO 8601)
  --seo-policy=<option>   SEO policy for the video: index, noindex, or empty string to reset
                          <options: |index|noindex>
  --tags=<value>          Space-separated tags (replaces existing tags)
  --title=<value>         New title for the video

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Update metadata for a video

EXAMPLES
  $ twentythree video update 12345 --title "New Title"

  $ twentythree video update 12345 --publish

  $ twentythree video update 12345
```

_See code: [src/commands/video/update.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/update.ts)_

## `twentythree video upload FILE`

Upload a video file to the active workspace

```
USAGE
  $ twentythree video upload FILE [--json] [-w <value>] [--title <value>] [--description <value>] [--tags <value>]
    [--category-id <value>] [--publish] [--chunk-size <value>] [--concurrency <value>]

ARGUMENTS
  FILE  Path to the video file to upload

FLAGS
  --category-id=<value>  Category ID (or comma-separated IDs) to assign the video to
  --chunk-size=<value>   [default: 5242880] Chunk size in bytes (default: 5242880 = 100MB)
  --concurrency=<value>  [default: 5] Number of chunks to upload in parallel (default: 5)
  --description=<value>  Description for the uploaded video
  --publish              Publish the video immediately after upload
  --tags=<value>         Space-separated tags for the uploaded video
  --title=<value>        Title for the uploaded video

GLOBAL FLAGS
  -w, --workspace=<value>  Workspace domain or display name to use for this invocation.
      --json               Format output as json.

DESCRIPTION
  Upload a video file to the active workspace

EXAMPLES
  $ twentythree video upload ./video.mp4

  $ twentythree video upload ./video.mp4 --title "My Video" --publish

  $ twentythree video upload ./video.mp4 --chunk-size 52428800 --concurrency 3
```

_See code: [src/commands/video/upload.ts](https://github.com/23/twentythree-cli/blob/v1.6.4/src/commands/video/upload.ts)_
