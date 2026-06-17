`twentythree video:upload`
==========================

Upload a video file to the active workspace

* [`twentythree video upload FILE`](#twentythree-video-upload-file)

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
